"""
================================================================================
SCRIPT DE TREINAMENTO: RANDOM FOREST - ABORDAGEM 4
Modelo Campeao de Classificacao com Calibracao de Limiar via Estatistica KS
================================================================================
Este script implementa o treinamento completo, extracao de metricas em todas as
particoes (Treino, Validacao e Teste Independente), geracao de graficos de
diagnostico e serializacao do modelo treinado.

Configuracao da Abordagem 4:
  - Remove taxas e quantidades especificas:
    ['tx_adit_prazo_5a', 'tx_adit_pv_5a', 'tx_adit_val_5a',
     'qtd_adit_prazo_5a', 'qtd_adit_pv_5a', 'qtd_adit_val_5a']
  - Preserva taxa geral (tx_adit_geral_5a) e preditores contratuais/fornecedor.
  - Variaveis Numericas:
    ['Valor_Original', 'duracao_planejada_dias', 'Capital_Social_Receita',
     'qtd_cont_5a_forn', 'tx_adit_geral_5a', 'fl_sem_historico_5a']
  - Variaveis Categoricas:
    ['Porte_Empresa', 'tipo_ult_adit']
  - Escalonamento: Passthrough (sem alteracao de escala para modelos baseados em arvores).
  - Otimizacao do Limiar: Ponto de Maior Separabilidade KS (Kolmogorov-Smirnov).
================================================================================
"""

import os
import sys
import argparse
import shutil
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import StratifiedShuffleSplit, StratifiedKFold, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, roc_auc_score, f1_score, precision_score, 
    recall_score, confusion_matrix, roc_curve, precision_recall_curve,
    average_precision_score, ConfusionMatrixDisplay
)
from sklearn.inspection import permutation_importance
from sklearn.base import clone

# Configuracao estetica de graficos
sns.set_theme(style="whitegrid", palette="muted")
plt.rcParams['figure.dpi'] = 150
plt.rcParams['font.size'] = 10
plt.rcParams['axes.titlesize'] = 11
plt.rcParams['axes.labelsize'] = 10


def carregar_e_preprocessar_dados(caminho_csv):
    """
    Carrega o dataset e aplica todas as regras de preprocessamento da base original:
      1. Ajuste de vigencia futura (Fim_Vigencia > hoje) recalculando a duracao observada.
      2. Criacao da flag indicadora fl_sem_historico_5a (quando qtd_cont_5a_forn == 0).
      3. Imputacao de 0.0 nas taxas quando nao ha historico previo de contratos.
      4. Extracao estrita das variaveis da Abordagem 4 (removendo taxas e qtds especificas).
    """
    if not os.path.exists(caminho_csv):
        raise FileNotFoundError(f"Arquivo de dados nao encontrado em: {caminho_csv}")

    print(f"\n[1/6] Carregando base de dados a partir de: '{caminho_csv}'...")
    df = pd.read_csv(caminho_csv, sep=';', encoding='utf-8-sig', low_memory=False)
    print(f"      Dimensao inicial: {df.shape[0]:,} contratos | {df.shape[1]} colunas")

    # 1. Ajuste metodologico de vigencia futura (Data de referencia do estudo: 27/10/2026)
    if 'Inicio_Vigencia' in df.columns and 'Fim_Vigencia' in df.columns:
        dt_ini = pd.to_datetime(df['Inicio_Vigencia'], format='%d/%m/%Y', errors='coerce')
        dt_fim = pd.to_datetime(df['Fim_Vigencia'], format='%d/%m/%Y', errors='coerce')
        # Data de fechamento do experimento no notebook oficial da disciplina (27/10/2026)
        data_hoje = pd.Timestamp('2026-10-27').normalize()
        mascara_futura = dt_fim > data_hoje
        if mascara_futura.any():
            duracao_ate_hoje = (data_hoje - dt_ini).dt.days
            df.loc[mascara_futura, 'duracao_planejada_dias'] = duracao_ate_hoje[mascara_futura]
            print(f"      [Ajuste de Vigência] {mascara_futura.sum()} contratos com data de término futura ajustados para a data de referência ({data_hoje.strftime('%d/%m/%Y')}).")

    # 2. Criacao do indicador de ausencia de historico
    if 'qtd_cont_5a_forn' not in df.columns:
        raise KeyError("Coluna obrigatoria 'qtd_cont_5a_forn' nao encontrada no dataset.")
    historico_5a = pd.to_numeric(df['qtd_cont_5a_forn'], errors='coerce').fillna(0)
    df['fl_sem_historico_5a'] = historico_5a.eq(0).astype('int8')

    # 3. Definicao das variaveis da classificacao
    num_cols_cluster = ['Valor_Original', 'duracao_planejada_dias', 'Capital_Social_Receita', 'qtd_cont_5a_forn']
    cat_cols_cluster = ['Porte_Empresa']
    num_cols_classif = num_cols_cluster + [
        'qtd_adit_prazo_5a', 'tx_adit_prazo_5a', 'qtd_adit_pv_5a', 'tx_adit_pv_5a',
        'qtd_adit_val_5a', 'tx_adit_val_5a', 'tx_adit_geral_5a', 'fl_sem_historico_5a'
    ]
    cat_cols_classif = cat_cols_cluster + ['tipo_ult_adit']
    target = 'fl_aditivo'

    # Conversao segura de tipos
    for c in num_cols_classif:
        if c in df.columns:
            df[c] = pd.to_numeric(df[c], errors='coerce')
            if c not in {'tx_adit_prazo_5a', 'tx_adit_pv_5a', 'tx_adit_val_5a', 'tx_adit_geral_5a'}:
                df[c] = df[c].fillna(0)
    for c in cat_cols_classif:
        if c in df.columns:
            df[c] = df[c].fillna('Nao Informado').astype(str)
    df[target] = pd.to_numeric(df[target], errors='coerce').fillna(0).astype(int)

    # 4. Abordagem 4: Tratamento de zeros e remocao das 6 variaveis especificas
    X_zeros_mantidos = df[num_cols_classif + cat_cols_classif].copy()
    colunas_taxas = ['tx_adit_prazo_5a', 'tx_adit_pv_5a', 'tx_adit_val_5a', 'tx_adit_geral_5a']
    sem_hist = X_zeros_mantidos['fl_sem_historico_5a'].eq(1)
    for col in colunas_taxas:
        X_zeros_mantidos.loc[sem_hist, col] = 0.0

    colunas_remover_ab4 = [
        'tx_adit_prazo_5a', 'tx_adit_pv_5a', 'tx_adit_val_5a',
        'qtd_adit_prazo_5a', 'qtd_adit_pv_5a', 'qtd_adit_val_5a'
    ]
    X_ab4 = X_zeros_mantidos.drop(columns=colunas_remover_ab4).copy()
    y = df[target].astype(int)

    num_cols_finais = [c for c in num_cols_classif if c in X_ab4.columns]
    cat_cols_finais = [c for c in cat_cols_classif if c in X_ab4.columns]

    print(f"      Preditores Abordagem 4: {len(X_ab4.columns)} variaveis")
    print(f"        - Numericas ({len(num_cols_finais)}): {num_cols_finais}")
    print(f"        - Categoricas ({len(cat_cols_finais)}): {cat_cols_finais}")
    print(f"        - Alvo ('{target}'): {y.value_counts().to_dict()} (Prevalencia: {y.mean()*100:.2f}%)")

    return X_ab4, y, num_cols_finais, cat_cols_finais


def criar_divisao_estratificada(df, y):
    """
    Executa a particao estratificada identica a da modelagem de referencia:
      - 20% Teste Holdout (1.158 contratos)
      - 80% Desenvolvimento (4.629 contratos):
          - 25% de dev -> Validacao (20% do total = 1.157 contratos)
          - 75% de dev -> Treino (60% do total = 3.472 contratos)
    """
    print("\n[2/6] Executando particao estratificada dos dados (Treino / Validacao / Teste)...")
    sss_test = StratifiedShuffleSplit(n_splits=1, test_size=0.20, random_state=42)
    idx_dev_arr, idx_test_arr = next(sss_test.split(df, y))

    df_dev = df.iloc[idx_dev_arr]
    y_dev = y.iloc[idx_dev_arr]
    idx_test = idx_test_arr

    sss_val = StratifiedShuffleSplit(n_splits=1, test_size=0.25, random_state=42)
    idx_train_arr, idx_val_arr = next(sss_val.split(df_dev, y_dev))

    idx_train = df_dev.iloc[idx_train_arr].index.values
    idx_val = df_dev.iloc[idx_val_arr].index.values
    idx_dev = idx_dev_arr

    print(f"      - Treino:            {len(idx_train):,} contratos ({len(idx_train)/len(df)*100:.1f}%) | Positivos: {y.loc[idx_train].sum():,}")
    print(f"      - Validacao:         {len(idx_val):,} contratos ({len(idx_val)/len(df)*100:.1f}%) | Positivos: {y.loc[idx_val].sum():,}")
    print(f"      - Teste Indep.:      {len(idx_test):,} contratos ({len(idx_test)/len(df)*100:.1f}%) | Positivos: {y.loc[idx_test].sum():,}")
    print(f"      - Dev (Treino+Val):  {len(idx_dev):,} contratos ({len(idx_dev)/len(df)*100:.1f}%)")

    return idx_train, idx_val, idx_test, idx_dev


def construir_pipeline(num_cols, cat_cols, rf_params=None):
    """
    Constroi o pipeline Scikit-Learn:
      - Numericas: SimpleImputer(median) + passthrough (arvores nao requerem escala).
      - Categoricas: SimpleImputer(constant) + OneHotEncoder(ignore).
      - Classificador: RandomForestClassifier balanceado.
    """
    transf_num = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', 'passthrough')
    ])
    transf_cat = Pipeline([
        ('imputer', SimpleImputer(strategy='constant', fill_value='Nao Informado')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])
    preprocessor = ColumnTransformer([
        ('num', transf_num, num_cols),
        ('cat', transf_cat, cat_cols)
    ], verbose_feature_names_out=False)

    if rf_params is None:
        # Hiperparametros campeoes da busca em grade
        rf_params = {
            'n_estimators': 100,
            'max_depth': 12,
            'min_samples_split': 20,
            'min_samples_leaf': 10,
            'max_features': 'sqrt',
            'random_state': 42,
            'class_weight': 'balanced',
            'n_jobs': -1
        }

    clf = RandomForestClassifier(**rf_params)
    pipeline = Pipeline([
        ('prep', preprocessor),
        ('clf', clf)
    ])
    return pipeline


def calibrar_limiar_ks(y_val, score_val):
    """
    Calcula a curva ROC na particao de Validacao e identifica o ponto de corte (threshold)
    que maximiza a estatistica KS (Kolmogorov-Smirnov: TPR - FPR).
    """
    fpr, tpr, limiares = roc_curve(y_val, score_val)
    ks_stats = tpr - fpr
    idx_max = np.argmax(ks_stats)
    limiar_ideal = float(limiares[idx_max])
    max_ks = float(ks_stats[idx_max])
    return limiar_ideal, max_ks, fpr, tpr, limiares, ks_stats


def extrair_metricas_particao(y_true, score_prob, limiar, nome_particao, max_ks_ref=None):
    """
    Calcula o conjunto completo de metricas de desempenho para uma dada particao.
    """
    pred = (score_prob >= limiar).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_true, pred, labels=[0, 1]).ravel()
    total = len(y_true)

    fpr_p, tpr_p, _ = roc_curve(y_true, score_prob)
    ks_particao = float(np.max(tpr_p - fpr_p)) if max_ks_ref is None else max_ks_ref

    metrics = {
        'Particao': nome_particao,
        'N_Amostras': total,
        'Limiar_KS': float(limiar),
        'Max_KS': ks_particao,
        'Acuracia': float(accuracy_score(y_true, pred)),
        'ROC_AUC': float(roc_auc_score(y_true, score_prob)),
        'PR_AUC': float(average_precision_score(y_true, score_prob)),
        'F1_Score': float(f1_score(y_true, pred, zero_division=0)),
        'Recall_Sensibilidade': float(recall_score(y_true, pred, zero_division=0)),
        'Precisao': float(precision_score(y_true, pred, zero_division=0)),
        'Especificidade': float(tn / (tn + fp) if (tn + fp) > 0 else 0.0),
        'VN': int(tn),
        'FP': int(fp),
        'FN': int(fn),
        'VP': int(tp)
    }
    return metrics


def gerar_graficos_diagnostico(
    y_val, score_val, limiar_ideal, max_ks_val,
    y_test, score_test, pred_test,
    modelo_final, X_test, output_dir
):
    """
    Gera e salva os 5 graficos diagnosticos padronizados:
      1. Curva de Otimizacao KS (Validacao)
      2. Curva ROC (Teste Independente)
      3. Curva Precision-Recall (Teste Independente)
      4. Matriz de Confusao (Teste Independente)
      5. Painel de Feature Importance (Permutacao e Gini)
    """
    os.makedirs(output_dir, exist_ok=True)
    caminhos_graficos = {}

    print(f"\n[5/6] Gerando graficos de diagnostico em: '{output_dir}'...")

    # --------------------------------------------------------------------------
    # 1. Curva de Otimizacao do Limiar KS (Validacao)
    # --------------------------------------------------------------------------
    fpr_v, tpr_v, limiares_v = roc_curve(y_val, score_val)
    ks_stats_v = tpr_v - fpr_v
    limiares_plot = np.clip(limiares_v, 0, 1)

    plt.figure(figsize=(8, 4.8))
    plt.plot(limiares_plot, tpr_v, label='TPR (Sensibilidade / Recall)', color='#2980b9', lw=2.2)
    plt.plot(limiares_plot, fpr_v, label='FPR (1 - Especificidade)', color='#c0392b', lw=2.2)
    plt.plot(limiares_plot, ks_stats_v, label='Estatistica KS (Distancia TPR - FPR)', color='#27ae60', lw=2.5, linestyle='--')
    plt.axvline(limiar_ideal, color='black', linestyle=':', lw=1.8,
                label=f'Corte Otimo = {limiar_ideal:.4f} (Max KS = {max_ks_val:.4f})')
    plt.title('Otimizacao do Ponto de Corte via Estatistica KS (Validacao)\nRandom Forest - Abordagem 4', fontweight='bold')
    plt.xlabel('Ponto de Corte (Threshold)')
    plt.ylabel('Taxa Acumulada')
    plt.legend(loc='center right', frameon=True)
    plt.xlim(0, 1)
    plt.ylim(0, 1.02)
    plt.tight_layout()
    p1 = os.path.join(output_dir, '1_curva_ks_otimizacao.png')
    plt.savefig(p1, bbox_inches='tight')
    plt.close()
    caminhos_graficos['KS'] = p1
    print("      [OK] 1_curva_ks_otimizacao.png salvo.")

    # --------------------------------------------------------------------------
    # 2. Curva ROC (Teste Independente)
    # --------------------------------------------------------------------------
    fpr_t, tpr_t, _ = roc_curve(y_test, score_test)
    auc_test = roc_auc_score(y_test, score_test)

    plt.figure(figsize=(7, 5))
    plt.plot(fpr_t, tpr_t, color='#d35400', lw=2.5, label=f'Random Forest Ab4 (ROC-AUC = {auc_test:.4f})')
    plt.plot([0, 1], [0, 1], color='#7f8c8d', lw=1.5, linestyle='--', label='Aleatorio (AUC = 0.5000)')
    plt.scatter([1 - (confusion_matrix(y_test, pred_test)[0, 0] / (confusion_matrix(y_test, pred_test)[0, 0] + confusion_matrix(y_test, pred_test)[0, 1]))],
                [recall_score(y_test, pred_test)], color='black', s=80, zorder=5,
                label=f'Ponto de Operacao (Threshold = {limiar_ideal:.4f})')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('Taxa de Falsos Positivos (1 - Especificidade)')
    plt.ylabel('Taxa de Verdadeiros Positivos (Sensibilidade)')
    plt.title('Curva ROC - Teste Independente Holdout (20% Inedito)\nRandom Forest - Abordagem 4', fontweight='bold')
    plt.legend(loc='lower right', frameon=True)
    plt.tight_layout()
    p2 = os.path.join(output_dir, '2_curva_roc_teste.png')
    plt.savefig(p2, bbox_inches='tight')
    plt.close()
    caminhos_graficos['ROC'] = p2
    print("      [OK] 2_curva_roc_teste.png salvo.")

    # --------------------------------------------------------------------------
    # 3. Curva Precision-Recall (Teste Independente)
    # --------------------------------------------------------------------------
    prec_t, rec_t, _ = precision_recall_curve(y_test, score_test)
    pr_auc_t = average_precision_score(y_test, score_test)
    prevalencia = float(y_test.mean())

    plt.figure(figsize=(7, 5))
    plt.plot(rec_t, prec_t, color='#2980b9', lw=2.5, label=f'Random Forest Ab4 (PR-AUC = {pr_auc_t:.4f})')
    plt.axhline(prevalencia, color='gray', linestyle='--', lw=1.5,
                label=f'Prevalencia Basal ({prevalencia*100:.1f}%)')
    plt.scatter([recall_score(y_test, pred_test)], [precision_score(y_test, pred_test)],
                color='black', s=80, zorder=5, label=f'Ponto de Operacao (Corte = {limiar_ideal:.4f})')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('Recall (Sensibilidade)')
    plt.ylabel('Precisao (Precision)')
    plt.title('Curva Precision-Recall - Teste Independente Holdout\nRandom Forest - Abordagem 4', fontweight='bold')
    plt.legend(loc='lower left', frameon=True)
    plt.tight_layout()
    p3 = os.path.join(output_dir, '3_curva_precision_recall_teste.png')
    plt.savefig(p3, bbox_inches='tight')
    plt.close()
    caminhos_graficos['PR'] = p3
    print("      [OK] 3_curva_precision_recall_teste.png salvo.")

    # --------------------------------------------------------------------------
    # 4. Matriz de Confusao (Teste Independente)
    # --------------------------------------------------------------------------
    cm = confusion_matrix(y_test, pred_test, labels=[0, 1])
    tn, fp, fn, tp = cm.ravel()
    tot = len(y_test)

    labels_matriz = np.array([
        [f"VN: {tn:,}\n({tn/tot*100:.1f}%)", f"FP: {fp:,}\n({fp/tot*100:.1f}%)"],
        [f"FN: {fn:,}\n({fn/tot*100:.1f}%)", f"VP: {tp:,}\n({tp/tot*100:.1f}%)"]
    ])

    plt.figure(figsize=(6.5, 5.2))
    sns.heatmap(
        cm, annot=labels_matriz, fmt='', cmap='Blues', cbar=False,
        xticklabels=['Sem Aditivo (0)', 'Com Aditivo (1)'],
        yticklabels=['Sem Aditivo (0)', 'Com Aditivo (1)'],
        annot_kws={"size": 11, "fontweight": "bold"}
    )
    plt.title(f'Matriz de Confusao (Teste Independente)\nThreshold KS = {limiar_ideal:.4f} | Acuracia = {accuracy_score(y_test, pred_test)*100:.1f}%',
              fontweight='bold')
    plt.xlabel('Predicao do Modelo')
    plt.ylabel('Classe Real Observada')
    plt.tight_layout()
    p4 = os.path.join(output_dir, '4_matriz_confusao_teste.png')
    plt.savefig(p4, bbox_inches='tight')
    plt.close()
    caminhos_graficos['CM'] = p4
    print("      [OK] 4_matriz_confusao_teste.png salvo.")

    # --------------------------------------------------------------------------
    # 5. Painel de Feature Importance (Permutacao e Gini)
    # --------------------------------------------------------------------------
    print("      Calculando Feature Importance via Permutacao no Teste...")
    perm = permutation_importance(
        modelo_final, X_test, y_test,
        scoring='roc_auc', n_repeats=10, random_state=42, n_jobs=-1
    )
    df_perm = pd.DataFrame({
        'Variavel': X_test.columns,
        'Importancia': perm.importances_mean,
        'Desvio': perm.importances_std
    }).sort_values('Importancia', ascending=True)

    # Gini nativo do Random Forest
    rf_model = modelo_final.named_steps['clf']
    prep_step = modelo_final.named_steps['prep']
    nomes_features_ohe = prep_step.get_feature_names_out()
    df_gini = pd.DataFrame({
        'Variavel': nomes_features_ohe,
        'Gini': rf_model.feature_importances_
    }).sort_values('Gini', ascending=True).tail(10)

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))

    ax1.barh(df_perm['Variavel'], df_perm['Importancia'], xerr=df_perm['Desvio'],
             color='#16a085', alpha=0.85, edgecolor='black')
    ax1.axvline(0, color='black', lw=1)
    ax1.set_title('1. Permutation Importance (Teste Holdout)\nQueda media no ROC-AUC ao embaralhar a variavel', fontweight='bold')
    ax1.set_xlabel('Queda no ROC-AUC')

    ax2.barh(df_gini['Variavel'], df_gini['Gini'], color='#2980b9', alpha=0.85, edgecolor='black')
    ax2.set_title('2. Gini Importance (MDI Nativo Random Forest)\nReducao Media de Impureza de Gini', fontweight='bold')
    ax2.set_xlabel('Importancia de Gini')

    fig.suptitle('Importancia das Variaveis - Random Forest Abordagem 4', fontweight='bold', fontsize=12)
    plt.tight_layout()
    p5 = os.path.join(output_dir, '5_feature_importance.png')
    plt.savefig(p5, bbox_inches='tight')
    plt.close()
    caminhos_graficos['IMP'] = p5
    print("      [OK] 5_feature_importance.png salvo.")

    return caminhos_graficos


def main():
    parser = argparse.ArgumentParser(
        description="Treinamento do Random Forest - Abordagem 4 com Limiar KS Otimo",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    parser.add_argument(
        '--input', '-i', type=str, default='ABT/abt_modelagem_aditivos.csv',
        help="Caminho do arquivo CSV contendo a ABT de modelagem"
    )
    parser.add_argument(
        '--output-model', '-m', type=str, default='random_forest_abordagem4.joblib',
        help="Caminho onde salvar o modelo serializado (.joblib)"
    )
    parser.add_argument(
        '--output-dir', '-o', type=str, default='classificacao_graficos',
        help="Diretorio para salvar os graficos de diagnostico"
    )
    parser.add_argument(
        '--threshold', '-t', type=float, default=None,
        help="Ponto de corte de probabilidade fixo (se omitido, calibra via Max KS na Validacao)"
    )
    parser.add_argument(
        '--tune', action='store_true',
        help="Se habilitado, roda o GridSearchCV completo (540 fits); caso contrario, usa os parametros campeoes da busca"
    )
    args = parser.parse_args()

    print("=" * 80)
    print("TREINAMENTO E AVALIACAO: RANDOM FOREST (ABORDAGEM 4 - KS OTIMO)")
    print("=" * 80)

    # 1. Carga e Preprocessamento
    caminho_csv = args.input
    if not os.path.exists(caminho_csv):
        # Tenta buscar em caminhos alternativos do projeto
        alternativas = [
            os.path.join('..', caminho_csv),
            'abt_modelagem_aditivos.csv',
            os.path.join('ABT', 'abt_modelagem_aditivos.csv')
        ]
        for alt in alternativas:
            if os.path.exists(alt):
                caminho_csv = alt
                break

    X_ab4, y, num_cols, cat_cols = carregar_e_preprocessar_dados(caminho_csv)

    # 2. Divisao Estratificada
    idx_train, idx_val, idx_test, idx_dev = criar_divisao_estratificada(X_ab4, y)

    y_train = y.loc[idx_train]
    y_val = y.loc[idx_val]
    y_test = y.loc[idx_test]
    y_dev = y.loc[idx_dev]

    # 3. Treinamento do Modelo
    print("\n[3/6] Ajustando Random Forest nos dados de Treino...")
    if args.tune:
        print("      Executando GridSearchCV com 5-fold CV estratificado...")
        base_pipe = construir_pipeline(num_cols, cat_cols, rf_params={'random_state': 42, 'class_weight': 'balanced', 'n_jobs': 1})
        grade = {
            'clf__n_estimators': [100, 200],
            'clf__max_depth': [5, 8, 12],
            'clf__min_samples_split': [20, 50, 100],
            'clf__min_samples_leaf': [10, 20, 30],
            'clf__max_features': ['sqrt', 'log2']
        }
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        busca = GridSearchCV(base_pipe, param_grid=grade, scoring={'roc_auc': 'roc_auc'}, refit='roc_auc', cv=cv, n_jobs=-1)
        busca.fit(X_ab4.loc[idx_train], y_train)
        print(f"      Melhores parametros: {busca.best_params_}")
        estimador_treinado = busca.best_estimator_
    else:
        # Parametros campeoes da busca
        rf_params_campeoes = {
            'n_estimators': 100,
            'max_depth': 12,
            'min_samples_split': 20,
            'min_samples_leaf': 10,
            'max_features': 'sqrt',
            'random_state': 42,
            'class_weight': 'balanced',
            'n_jobs': -1
        }
        print(f"      Parametros campeoes: {rf_params_campeoes}")
        estimador_treinado = construir_pipeline(num_cols, cat_cols, rf_params=rf_params_campeoes)
        estimador_treinado.fit(X_ab4.loc[idx_train], y_train)

    # 4. Calibracao do Ponto de Corte via Estatistica KS
    score_val = estimador_treinado.predict_proba(X_ab4.loc[idx_val])[:, 1]
    limiar_calibrado, max_ks_val, fpr_v, tpr_v, limiares_v, ks_stats_v = calibrar_limiar_ks(y_val, score_val)

    if args.threshold is not None:
        limiar_escolhido = args.threshold
        print(f"      Limiar informado manualmente: {limiar_escolhido:.4f}")
    else:
        limiar_escolhido = limiar_calibrado
        print(f"      Limiar calibrado via Max KS na Validacao: {limiar_escolhido:.4f} (Max KS = {max_ks_val:.4f})")

    # 5. Avaliacao nas 3 Particoes
    print("\n[4/6] Avaliando desempenho comparativo nas 3 particoes...")
    score_train = estimador_treinado.predict_proba(X_ab4.loc[idx_train])[:, 1]

    # Re-treino no conjunto de desenvolvimento (Treino + Validacao) para o teste independente
    modelo_final_dev = clone(estimador_treinado)
    modelo_final_dev.fit(X_ab4.loc[idx_dev], y_dev)
    score_test = modelo_final_dev.predict_proba(X_ab4.loc[idx_test])[:, 1]
    pred_test = (score_test >= limiar_escolhido).astype(int)

    m_train = extrair_metricas_particao(y_train, score_train, limiar_escolhido, "1. Treino", max_ks_ref=max_ks_val)
    m_val = extrair_metricas_particao(y_val, score_val, limiar_escolhido, "2. Validacao", max_ks_ref=max_ks_val)
    m_test = extrair_metricas_particao(y_test, score_test, limiar_escolhido, "3. Teste Indep.", max_ks_ref=max_ks_val)

    df_metricas = pd.DataFrame([m_train, m_val, m_test])
    cols_display = [
        'Particao', 'N_Amostras', 'Limiar_KS', 'Max_KS', 'Acuracia', 'ROC_AUC',
        'F1_Score', 'Recall_Sensibilidade', 'Precisao', 'Especificidade'
    ]

    print("\n" + "=" * 95)
    print("TABELA DE METRICAS: RANDOM FOREST (ABORDAGEM 4 - KS OTIMO)")
    print("=" * 95)
    print(df_metricas[cols_display].to_string(index=False))
    print("=" * 95)

    # 6. Geracao dos Graficos
    caminhos_plots = gerar_graficos_diagnostico(
        y_val=y_val, score_val=score_val, limiar_ideal=limiar_escolhido, max_ks_val=max_ks_val,
        y_test=y_test, score_test=score_test, pred_test=pred_test,
        modelo_final=modelo_final_dev, X_test=X_ab4.loc[idx_test],
        output_dir=args.output_dir
    )

    # Copia graficos para a pasta de artefatos se disponivel
    artefatos_dir = r'C:\Users\Usuário\.gemini\antigravity-ide\brain\67a20921-4bea-4c41-a3e1-2d3222ee149a'
    if os.path.exists(artefatos_dir):
        for nome_g, path_g in caminhos_plots.items():
            try:
                dest = os.path.join(artefatos_dir, os.path.basename(path_g))
                shutil.copy2(path_g, dest)
            except Exception:
                pass

    # 7. Serializacao do Modelo
    print(f"\n[6/6] Serializando modelo treinado em: '{args.output_model}'...")
    payload_modelo = {
        'pipeline': modelo_final_dev,
        'pipeline_treino_puro': estimador_treinado,
        'limiar_ks': limiar_escolhido,
        'max_ks': max_ks_val,
        'num_cols': num_cols,
        'cat_cols': cat_cols,
        'todas_cols': list(X_ab4.columns),
        'metricas': df_metricas.to_dict(orient='records'),
        'abordagem': 'Abordagem 4 - taxa e qtd geral (sem especificas)',
        'versao': '1.0.0'
    }

    joblib.dump(payload_modelo, args.output_model)
    print(f"      [OK] Modelo salvo com sucesso em: {args.output_model}")

    # Copia para o backend do sistema web para sincronizacao imediata
    backend_model_dir = os.path.join('sistema_web', 'backend_fastapi', 'models')
    if os.path.exists(backend_model_dir):
        dest_backend = os.path.join(backend_model_dir, os.path.basename(args.output_model))
        joblib.dump(payload_modelo, dest_backend)
        print(f"      [OK] Sincronizado com backend FastAPI: {dest_backend}")

    print("\n" + "=" * 80)
    print("TREINAMENTO CONCLUIDO COM SUCESSO!")
    print(f"Modelo salvo:    {os.path.abspath(args.output_model)}")
    print(f"Graficos salvos: {os.path.abspath(args.output_dir)}")
    print("=" * 80)


if __name__ == '__main__':
    main()
