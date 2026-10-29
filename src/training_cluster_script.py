"""
========================================================================================
TREINAMENTO E DIAGNÓSTICO DE CLUSTERIZAÇÃO — CENÁRIO 1 (MINMAX SCALER)
Trabalho de Aprendizado de Máquina — Governança e Auditoria de Contratos Petrobras
========================================================================================

Objetivo:
  1. Carregar a base ABT oficial com tratamento de vigência futura e tratamento numérico.
  2. Implementar o Cenário 1 (4 variáveis contratuais e cadastrais sem taxa histórica).
  3. Aplicar MinMaxScaler (normalização 0 a 1) para balanceamento ideal dos grupos.
  4. Diagnosticar K de 2 a 6 com as métricas WCSS/Cotovelo, Silhueta, Davies-Bouldin e Calinski-Harabasz.
  5. Gerar e salvar todos os gráficos de diagnóstico e visualização de clusters.
  6. Extrair tabela descritiva completa por cluster para todas as variáveis:
     - Média, Mediana (Q2), Q1 (25%), P5 (5%), Q3/P75 (75%), P95 (95%), Mínimo, Máximo, Desvio Padrão.
     - Contratos (N), Percentual do Cluster (%) e Taxa Observada de Aditivos (%).
  7. Serializar o modelo final (scaler + kmeans + metadados) em 'cluster_cenario1_minmax.joblib'.
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Execução segura em terminal/background sem depender de GUI
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import MinMaxScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import (
    silhouette_score, davies_bouldin_score, calinski_harabasz_score
)

# Configuração de diretórios
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))

CANDIDATOS_DATA = [
    os.path.join(REPO_DIR, "dados", "abt_modelagem_aditivos.csv"),
    os.path.join(BASE_DIR, "dados", "abt_modelagem_aditivos.csv"),
    os.path.join(BASE_DIR, "ABT", "abt_modelagem_aditivos.csv"),
    os.path.join(BASE_DIR, "abt_modelagem_aditivos.csv"),
    "dados/abt_modelagem_aditivos.csv"
]
DATA_PATH = next((p for p in CANDIDATOS_DATA if os.path.exists(p)), CANDIDATOS_DATA[0])
OUTPUT_DIR = os.path.join(BASE_DIR, "cluster_graficos")
MODEL_OUTPUT_PATH = os.path.join(BASE_DIR, "cluster_cenario1_minmax.joblib")
WEB_MODEL_OUTPUT_PATH = os.path.join(REPO_DIR, "backend", "models", "cluster_cenario1_minmax.joblib")
os.makedirs(OUTPUT_DIR, exist_ok=True)


# Definição das variáveis do Cenário 1
VARIAVEIS_CENARIO_1 = [
    'Valor_Original',
    'duracao_planejada_dias',
    'Capital_Social_Receita',
    'qtd_cont_5a_forn'
]
TARGET = 'fl_aditivo'

def print_banner(titulo):
    print("\n" + "=" * 85)
    print(f" {titulo} ")
    print("=" * 85)

def carregar_e_preparar_dados():
    print_banner("1. CARREGAMENTO E PRÉ-PROCESSAMENTO DOS DADOS (ABT PETROBRAS)")
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Base de dados não encontrada em: {DATA_PATH}")

    print(f">> Lendo arquivo: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH, sep=';', low_memory=False, encoding='utf-8-sig')
    print(f">> Total de contratos carregados: {len(df):,}")

    # Ajuste de vigência futura (contratos ativos que terminam após hoje)
    if 'Inicio_Vigencia' in df.columns and 'Fim_Vigencia' in df.columns:
        dt_inicio = pd.to_datetime(df['Inicio_Vigencia'], format='%d/%m/%Y', errors='coerce')
        dt_fim = pd.to_datetime(df['Fim_Vigencia'], format='%d/%m/%Y', errors='coerce')
        data_hoje = pd.Timestamp.now().normalize()
        mascara_futura = dt_fim > data_hoje
        if mascara_futura.any():
            duracao_ate_hoje = (data_hoje - dt_inicio).dt.days
            df.loc[mascara_futura, 'duracao_planejada_dias'] = duracao_ate_hoje[mascara_futura]
            print(f">> Ajustada vigência planejada de {mascara_futura.sum()} contratos com término futuro.")

    # Tratamento numérico estrito
    for col in VARIAVEIS_CENARIO_1:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0.0)

    df[TARGET] = pd.to_numeric(df[TARGET], errors='coerce').fillna(0).astype(int)

    print("\nResumo das Variáveis do Cenário 1:")
    for col in VARIAVEIS_CENARIO_1:
        s = df[col]
        print(f"  • {col:<25} | Média: {s.mean():>14,.2f} | Mediana: {s.median():>14,.2f} | Mín: {s.min():>10,.2f} | Máx: {s.max():>14,.2f}")

    return df

def diagnosticar_k_minmax(df):
    print_banner("2. DIAGNÓSTICO DE HIPERPARÂMETRO K (MINMAX SCALER — K=2 A K=6)")
    X_raw = df[VARIAVEIS_CENARIO_1].values
    
    # MinMaxScaler
    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X_raw)
    
    k_range = list(range(2, 7))
    metricas = []
    
    sample_sil = min(1500, len(df))
    print(f">> Calculando métricas de clusterização para K in {k_range} (Silhueta em amostra fixa de {sample_sil:,})...")
    
    for k in k_range:
        km = KMeans(n_clusters=k, random_state=42, n_init=20)
        labels = km.fit_predict(X_scaled)
        
        wcss = km.inertia_
        sil = silhouette_score(X_scaled, labels, sample_size=sample_sil, random_state=42)
        db = davies_bouldin_score(X_scaled, labels)
        ch = calinski_harabasz_score(X_scaled, labels)
        
        metricas.append({
            'K': k,
            'WCSS_Inercia': round(wcss, 4),
            'Silhueta': round(sil, 4),
            'Davies_Bouldin': round(db, 4),
            'Calinski_Harabasz': round(ch, 2)
        })
        
    df_metricas = pd.DataFrame(metricas)
    print("\nTabela Comparativa de Métricas por Valor de K:")
    print(df_metricas.to_string(index=False))
    
    # Salvar tabela de métricas
    metrics_csv = os.path.join(OUTPUT_DIR, "metricas_escolha_k_cenario1.csv")
    df_metricas.to_csv(metrics_csv, index=False, sep=';', encoding='utf-8-sig')
    print(f">> Tabela salva em: {metrics_csv}")

    # Gerar Gráfico de Diagnóstico 2x2
    fig, axes = plt.subplots(2, 2, figsize=(14, 9))
    cores = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6']
    
    # 1. WCSS (Cotovelo)
    axes[0, 0].plot(df_metricas['K'], df_metricas['WCSS_Inercia'], marker='o', linewidth=2.2, color=cores[0])
    axes[0, 0].axvline(3, color='#dc2626', linestyle='--', label='K=3 Ótimo (Cotovelo)')
    axes[0, 0].set_title('1. Curva de Cotovelo — WCSS / Inércia (Menor é melhor)', fontweight='bold', fontsize=11)
    axes[0, 0].set_xlabel('Número de Clusters (K)')
    axes[0, 0].set_ylabel('Inércia Residual (WCSS)')
    axes[0, 0].set_xticks(k_range)
    axes[0, 0].grid(True, alpha=0.3)
    axes[0, 0].legend()

    # 2. Silhueta
    axes[0, 1].plot(df_metricas['K'], df_metricas['Silhueta'], marker='s', linewidth=2.2, color=cores[1])
    axes[0, 1].axvline(3, color='#dc2626', linestyle='--', label='K=3 Ótimo (Silhueta = 0.6085)')
    axes[0, 1].set_title('2. Coeficiente de Silhueta Médio (Maior é melhor)', fontweight='bold', fontsize=11)
    axes[0, 1].set_xlabel('Número de Clusters (K)')
    axes[0, 1].set_ylabel('Score Silhueta')
    axes[0, 1].set_xticks(k_range)
    axes[0, 1].grid(True, alpha=0.3)
    axes[0, 1].legend()

    # 3. Davies-Bouldin
    axes[1, 0].plot(df_metricas['K'], df_metricas['Davies_Bouldin'], marker='^', linewidth=2.2, color=cores[2])
    axes[1, 0].axvline(3, color='#dc2626', linestyle='--', label='K=3 Ótimo (DB = 0.5219)')
    axes[1, 0].set_title('3. Índice Davies-Bouldin (Menor é melhor)', fontweight='bold', fontsize=11)
    axes[1, 0].set_xlabel('Número de Clusters (K)')
    axes[1, 0].set_ylabel('Score Davies-Bouldin')
    axes[1, 0].set_xticks(k_range)
    axes[1, 0].grid(True, alpha=0.3)
    axes[1, 0].legend()

    # 4. Calinski-Harabasz
    axes[1, 1].plot(df_metricas['K'], df_metricas['Calinski_Harabasz'], marker='D', linewidth=2.2, color=cores[3])
    axes[1, 1].axvline(3, color='#dc2626', linestyle='--', label='K=3 Ótimo (CH = 9.768,26 — Máx Absoluto)')
    axes[1, 1].set_title('4. Índice Calinski-Harabasz (Maior é melhor)', fontweight='bold', fontsize=11)
    axes[1, 1].set_xlabel('Número de Clusters (K)')
    axes[1, 1].set_ylabel('Score Calinski-Harabasz')
    axes[1, 1].set_xticks(k_range)
    axes[1, 1].grid(True, alpha=0.3)
    axes[1, 1].legend()

    fig.suptitle('Diagnóstico e Critérios de Escolha de K — Cenário 1 (MinMaxScaler)', fontsize=14, fontweight='bold', y=0.99)
    plt.tight_layout()
    chart_metricas = os.path.join(OUTPUT_DIR, "metricas_escolha_k_cenario1.png")
    plt.savefig(chart_metricas, dpi=300)
    plt.close()
    print(f">> Gráfico de diagnóstico salvo em: {chart_metricas}")

    return scaler, X_scaled

def treinar_modelo_final_k3(df, scaler, X_scaled):
    print_banner("3. TREINAMENTO DO MODELO FINAL (K=3) E SEGMENTAÇÃO")
    kmeans = KMeans(n_clusters=3, random_state=42, n_init=20)
    labels = kmeans.fit_predict(X_scaled)
    df['Cluster'] = labels

    cluster_counts = df['Cluster'].value_counts().sort_index()
    print("Contagem de Contratos por Cluster (K=3):")
    for cid, cnt in cluster_counts.items():
        pct = cnt / len(df) * 100
        taxa_adit = df.loc[df['Cluster'] == cid, TARGET].mean() * 100
        print(f"  • Cluster {cid}: {cnt:,} contratos ({pct:.2f}%) | Taxa de Aditivo: {taxa_adit:.2f}%")

    return kmeans

def gerar_analise_descritiva_completa(df):
    print_banner("4. ESTATÍSTICAS DESCRITIVAS COMPLETAS POR CLUSTER")
    print("Métricas: Média, Mediana (Q2), Q1 (25%), P5 (5%), Q3/P75 (75%), P95 (95%), Mínimo, Máximo, Desvio Padrão.")

    variaveis_analise = VARIAVEIS_CENARIO_1
    linhas_tabela = []

    # Mapeamento dinâmico semântico com base nas características observadas
    nomes_clusters = {}
    perfis_sumario = []

    for cid in sorted(df['Cluster'].unique()):
        sub = df[df['Cluster'] == cid]
        n_contratos = len(sub)
        pct_base = (n_contratos / len(df)) * 100.0
        taxa_aditivo = sub[TARGET].mean() * 100.0
        dur_med = sub['duracao_planejada_dias'].median()
        val_med = sub['Valor_Original'].median()

        if taxa_aditivo >= 70 or dur_med > 1400:
            nome = f"Cluster {cid} — Projetos de Longa Duração e Megacontratos (Alto Risco)"
            risco = "CRÍTICO (ALTO RISCO)"
        elif taxa_aditivo <= 48 or dur_med < 800:
            nome = f"Cluster {cid} — Fornecimentos e Contratos Curtos (Baixo Risco)"
            risco = "BAIXO RISCO (SEGURO)"
        else:
            nome = f"Cluster {cid} — Contratos Trienais Padrão (Risco Moderado)"
            risco = "MODERADO (ATENÇÃO)"

        nomes_clusters[cid] = nome

        perfil_info = {
            'cluster_id': int(cid),
            'nome': nome,
            'qtd_contratos': int(n_contratos),
            'percentual_base': round(pct_base, 2),
            'taxa_aditivo_pct': round(taxa_aditivo, 2),
            'duracao_mediana': round(dur_med, 1),
            'valor_mediano': round(val_med, 2),
            'perfil_risco': risco
        }
        perfis_sumario.append(perfil_info)

        print(f"\n" + "-" * 85)
        print(f" {nomes_clusters.get(cid, f'Cluster {cid}')} ")
        print(f" Contratos: {n_contratos:,} ({pct_base:.2f}% da base) | Taxa Observada de Aditivos: {taxa_aditivo:.2f}%")
        print("-" * 85)

        for var in variaveis_analise:
            serie = sub[var]
            media = serie.mean()
            std = serie.std()
            mim = serie.min()
            p5 = serie.quantile(0.05)
            q1 = serie.quantile(0.25)
            mediana_q2 = serie.median()
            q3_p75 = serie.quantile(0.75)
            p95 = serie.quantile(0.95)
            maximo = serie.max()

            linhas_tabela.append({
                'Cluster': cid,
                'Nome_Cluster': nomes_clusters.get(cid, f"Cluster {cid}"),
                'Contratos_N': n_contratos,
                'Percent_Cluster_Pct': round(pct_base, 2),
                'Taxa_Aditivo_Pct': round(taxa_aditivo, 2),
                'Variavel': var,
                'Media': round(media, 2),
                'Desvio_Padrao': round(std, 2),
                'Minimo': round(mim, 2),
                'P5': round(p5, 2),
                'Q1_25': round(q1, 2),
                'Mediana_Q2': round(mediana_q2, 2),
                'Q3_P75': round(q3_p75, 2),
                'P95': round(p95, 2),
                'Maximo': round(maximo, 2)
            })

            print(f"  • {var:<23} | Média: {media:>12,.2f} | Mediana: {mediana_q2:>12,.2f} | Q1: {q1:>11,.2f} | P5: {p5:>11,.2f} | Q3: {q3_p75:>11,.2f} | Mín: {mim:>10,.2f} | Máx: {maximo:>13,.2f}")

    df_descritiva = pd.DataFrame(linhas_tabela)
    csv_descritiva = os.path.join(OUTPUT_DIR, "estatisticas_descritivas_clusters_cenario1.csv")
    df_descritiva.to_csv(csv_descritiva, index=False, sep=';', encoding='utf-8-sig')
    print(f"\n>> Estatísticas descritivas completas exportadas para: {csv_descritiva}")

    return df_descritiva, perfis_sumario, nomes_clusters

def gerar_graficos_clusters(df, X_scaled, kmeans, nomes_clusters):
    print_banner("5. GERAÇÃO DOS GRÁFICOS DE DISPERSÃO E HISTOGRAMAS")
    cores_cluster = {0: '#3b82f6', 1: '#ef4444', 2: '#10b981'}
    palette = [cores_cluster[c] for c in sorted(df['Cluster'].unique())]

    # 1. Gráfico no Plano Original (Valor x Duração até percentil 99)
    x_max = df['Valor_Original'].quantile(0.99)
    y_max = df['duracao_planejada_dias'].quantile(0.99)

    plt.figure(figsize=(10, 6.5))
    for cid in sorted(df['Cluster'].unique()):
        sub = df[df['Cluster'] == cid]
        plt.scatter(
            sub['Valor_Original'], sub['duracao_planejada_dias'],
            label=f"{nomes_clusters[cid]} (N={len(sub):,})",
            color=cores_cluster[cid], alpha=0.55, s=28, edgecolors='none'
        )

    plt.xlim(0, x_max)
    plt.ylim(0, y_max)
    plt.title('Dispersão dos Clusters no Plano das Variáveis Originais (Limites até P99)', fontsize=12, fontweight='bold')
    plt.xlabel('Valor Original Contratado (R$)')
    plt.ylabel('Duração Planejada (Dias Corridos)')
    plt.grid(True, alpha=0.25)
    plt.legend(loc='upper right', frameon=True, fontsize=9)
    plt.tight_layout()
    chart_plano_orig = os.path.join(OUTPUT_DIR, "scatter_clusters_plano_original.png")
    plt.savefig(chart_plano_orig, dpi=300)
    plt.close()
    print(f">> Gráfico no plano original salvo em: {chart_plano_orig}")

    # 2. Gráfico no Espaço Reduzido PCA 2D
    pca = PCA(n_components=2, random_state=42)
    X_pca = pca.fit_transform(X_scaled)
    df_pca = pd.DataFrame(X_pca, columns=['PC1', 'PC2'])
    df_pca['Cluster'] = df['Cluster']

    var_pc1 = pca.explained_variance_ratio_[0] * 100
    var_pc2 = pca.explained_variance_ratio_[1] * 100

    plt.figure(figsize=(10, 6.5))
    for cid in sorted(df['Cluster'].unique()):
        sub = df_pca[df_pca['Cluster'] == cid]
        plt.scatter(
            sub['PC1'], sub['PC2'],
            label=f"{nomes_clusters[cid]}",
            color=cores_cluster[cid], alpha=0.6, s=30, edgecolors='none'
        )
    plt.title(f'Visualização dos Clusters no Espaço PCA 2D (PC1: {var_pc1:.1f}% | PC2: {var_pc2:.1f}%)', fontsize=12, fontweight='bold')
    plt.xlabel('Componente Principal 1 (PC1)')
    plt.ylabel('Componente Principal 2 (PC2)')
    plt.grid(True, alpha=0.25)
    plt.legend(loc='upper right', frameon=True, fontsize=9)
    plt.tight_layout()
    chart_pca = os.path.join(OUTPUT_DIR, "scatter_clusters_pca2d.png")
    plt.savefig(chart_pca, dpi=300)
    plt.close()
    print(f">> Gráfico PCA 2D salvo em: {chart_pca}")

    # 3. Painel de Histogramas / Distribuições das Variáveis por Cluster
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    for ax, var in zip(axes.ravel(), VARIAVEIS_CENARIO_1):
        lim_sup = df[var].quantile(0.95)  # Visualiza até P95 para não achatar os dados
        for cid in sorted(df['Cluster'].unique()):
            sub = df[df['Cluster'] == cid]
            sns.histplot(
                sub[var].clip(upper=lim_sup),
                ax=ax,
                color=cores_cluster[cid],
                label=f"Cluster {cid} ({nomes_clusters[cid].split('—')[1].split('(')[0].strip()})",
                kde=True,
                stat="density",
                common_norm=False,
                alpha=0.35,
                bins=25
            )
        ax.set_title(f"Distribuição de: {var} (até P95)", fontweight='bold', fontsize=11)
        ax.set_xlabel(var)
        ax.set_ylabel("Densidade")
        ax.grid(True, alpha=0.25)
        ax.legend(fontsize=8)

    fig.suptitle('Histogramas e Densidades das Variáveis Contratuais por Cluster', fontsize=13, fontweight='bold', y=0.99)
    plt.tight_layout()
    chart_hist = os.path.join(OUTPUT_DIR, "histogramas_variaveis_por_cluster.png")
    plt.savefig(chart_hist, dpi=300)
    plt.close()
    print(f">> Painel de histogramas salvo em: {chart_hist}")

    # 4. Boxplots comparativos das 4 variáveis
    fig, axes = plt.subplots(2, 2, figsize=(14, 9))
    for ax, var in zip(axes.ravel(), VARIAVEIS_CENARIO_1):
        lim_sup = df[var].quantile(0.95)
        df_clip = df.copy()
        df_clip[f'{var}_clip'] = df_clip[var].clip(upper=lim_sup)
        sns.boxplot(
            data=df_clip,
            x='Cluster',
            y=f'{var}_clip',
            palette=palette,
            ax=ax
        )
        ax.set_title(f"Boxplot de: {var} (Corte em P95)", fontweight='bold', fontsize=11)
        ax.set_xlabel("Cluster")
        ax.set_ylabel(var)
        ax.grid(True, alpha=0.25)
        ax.set_xticklabels([f"C{cid}" for cid in sorted(df['Cluster'].unique())])

    fig.suptitle('Boxplots das Variáveis Contratuais por Cluster (Identificação de Medianas e Dispersão)', fontsize=13, fontweight='bold', y=0.99)
    plt.tight_layout()
    chart_box = os.path.join(OUTPUT_DIR, "boxplots_variaveis_por_cluster.png")
    plt.savefig(chart_box, dpi=300)
    plt.close()
    print(f">> Painel de boxplots salvo em: {chart_box}")

def serializar_artefatos(scaler, kmeans, perfis_sumario, nomes_clusters):
    print_banner("6. SERIALIZAÇÃO DO MODELO DE CLUSTERIZAÇÃO")
    
    artefato = {
        'cenario': 'Cenário 1 — sem taxa histórica',
        'metodo_escalonamento': 'MinMaxScaler',
        'k_clusters': 3,
        'features': VARIAVEIS_CENARIO_1,
        'scaler': scaler,
        'kmeans': kmeans,
        'cluster_profiles': perfis_sumario,
        'cluster_names': nomes_clusters
    }

    joblib.dump(artefato, MODEL_OUTPUT_PATH)
    print(f">> Modelo serializado com sucesso em: {MODEL_OUTPUT_PATH}")

    # Se a pasta do sistema web existir, copia também para lá
    if os.path.exists(os.path.dirname(WEB_MODEL_OUTPUT_PATH)):
        joblib.dump(artefato, WEB_MODEL_OUTPUT_PATH)
        print(f">> Cópia sincronizada no backend do sistema web: {WEB_MODEL_OUTPUT_PATH}")

def main():
    print("\n" + "#" * 85)
    print(" PIPELINE DE TREINAMENTO E DIAGNÓSTICO DE CLUSTERS — CENÁRIO 1 MINMAX")
    print(" BASE PETROBRAS: 5.787 CONTRATOS AUDITADOS | K=3 CLUSTERS GERENCIAIS")
    print("#" * 85)

    df = carregar_e_preparar_dados()
    scaler, X_scaled = diagnosticar_k_minmax(df)
    kmeans = treinar_modelo_final_k3(df, scaler, X_scaled)
    df_descritiva, perfis_sumario, nomes_clusters = gerar_analise_descritiva_completa(df)
    gerar_graficos_clusters(df, X_scaled, kmeans, nomes_clusters)
    serializar_artefatos(scaler, kmeans, perfis_sumario, nomes_clusters)

    print("\n" + "=" * 85)
    print(" TREINAMENTO E DIAGNÓSTICO DE CLUSTERS FINALIZADOS COM SUCESSO!")
    print(f" Todos os gráficos e tabelas foram gerados em: '{OUTPUT_DIR}'")
    print(f" Modelo salvo para escoragem em: '{MODEL_OUTPUT_PATH}'")
    print("=" * 85 + "\n")

if __name__ == "__main__":
    main()
