"""
================================================================================
SCRIPT DE ESCORAGEM: RANDOM FOREST - ABORDAGEM 4
Escoragem de Novos Contratos com Calibracao de Risco e Governanca
================================================================================
Permite escorar qualquer planilha (.xlsx, .xls) ou arquivo (.csv) de contratos
a partir do terminal. Aplica exatamente o preprocessamento da Abordagem 4
e enriquece a base com probabilidade de aditamento, classificacao binaria,
nivel de risco e diretrizes de governanca.

Exemplos de Uso no Terminal:
  # Escorando uma planilha Excel:
  python score_random_forest_ab4.py --input novos_contratos.xlsx --output escorados.xlsx

  # Escorando um CSV com corte customizado:
  python score_random_forest_ab4.py -i dados.csv -o resultado.csv -t 0.4540

  # Executando com dados de exemplo inclusos:
  python score_random_forest_ab4.py
================================================================================
"""

import os
import sys
import argparse
import joblib
import numpy as np
import pandas as pd


def tentar_salvar_arquivo(df, caminho_saida):
    """
    Salva o dataframe em CSV ou Excel com tratamento automatico para arquivos
    bloqueados pelo Microsoft Excel no Windows (PermissionError: [Errno 13]).
    """
    ext = os.path.splitext(caminho_saida)[1].lower()
    caminho_atual = caminho_saida

    for tentativa in range(1, 10):
        try:
            if ext in ['.xlsx', '.xls']:
                df.to_excel(caminho_atual, index=False)
            else:
                df.to_csv(caminho_atual, sep=';', index=False, encoding='utf-8-sig')
            return caminho_atual
        except PermissionError:
            base, ext_orig = os.path.splitext(caminho_saida)
            caminho_atual = f"{base}_{tentativa}{ext_orig}"
            print(f"      [AVISO] O arquivo '{caminho_saida}' esta aberto no Excel.")
            print(f"              Salvando automaticamente como '{caminho_atual}'...")
        except Exception as e:
            # Fallback para CSV simples
            caminho_fallback = f"{os.path.splitext(caminho_saida)[0]}_resultado.csv"
            df.to_csv(caminho_fallback, sep=';', index=False, encoding='utf-8-sig')
            return caminho_fallback

    return caminho_atual


def carregar_modelo_serializado(caminho_modelo):
    """
    Carrega o payload do modelo treinado (.joblib).
    """
    candidatos = [
        caminho_modelo,
        'random_forest_abordagem4.joblib',
        os.path.join('sistema_web', 'backend_fastapi', 'models', 'random_forest_abordagem4.joblib'),
        os.path.join('..', 'random_forest_abordagem4.joblib')
    ]
    for c in candidatos:
        if c and os.path.exists(c):
            try:
                payload = joblib.load(c)
                print(f"[1/4] Modelo carregado com sucesso de: '{c}'")
                return payload, c
            except Exception as e:
                pass

    raise FileNotFoundError(
        f"Modelo nao encontrado em '{caminho_modelo}'. Execute primeiro:\n"
        f"  python training_random_forest_ab4.py"
    )


def carregar_dados_entrada(caminho_input):
    """
    Carrega o arquivo de entrada suportando Excel (.xlsx, .xls) e CSV (separadores ',' ou ';').
    Caso o arquivo nao exista, gera uma amostra sintetica de exemplo para teste imediato.
    """
    if not caminho_input or not os.path.exists(caminho_input):
        # Verifica se existe o exemplo no sistema_web
        exemplo_web = os.path.join('sistema_web', 'dados', 'contratos_novos_exemplo.xlsx')
        if os.path.exists(exemplo_web):
            print(f"[2/4] Arquivo informado nao encontrado. Utilizando base de exemplo: '{exemplo_web}'")
            return pd.read_excel(exemplo_web), exemplo_web

        print(f"[2/4] Gerando amostra de contratos para teste no terminal...")
        dados_exemplo = {
            'Id_Contrato': ['CT-2026-001', 'CT-2026-002', 'CT-2026-003', 'CT-2026-004', 'CT-2026-005'],
            'Objeto_Contrato': [
                'Servicos de Limpeza e Conservacao Predial',
                'Aquisicao de Licencas de Software em Nuvem',
                'Obras de Reforma e Modernizacao Eletrica',
                'Manutencao Preventiva de Equipamentos Medicos',
                'Fornecimento de Alimentacao Hospitalar'
            ],
            'Valor_Original': [1250000.0, 350000.0, 4800000.0, 890000.0, 2100000.0],
            'duracao_planejada_dias': [365, 180, 540, 365, 730],
            'Capital_Social_Receita': [500000.0, 100000.0, 2000000.0, 300000.0, 800000.0],
            'qtd_cont_5a_forn': [12, 0, 25, 4, 18],
            'tx_adit_geral_5a': [0.65, 0.0, 0.88, 0.25, 0.72],
            'Porte_Empresa': ['DEMAIS', 'ME', 'DEMAIS', 'EPP', 'DEMAIS'],
            'tipo_ult_adit': ['PRAZO E VALOR', 'SEM HISTORICO', 'VALOR', 'PRAZO', 'PRAZO E VALOR']
        }
        df_amostra = pd.DataFrame(dados_exemplo)
        caminho_amostra = 'amostra_contratos_novos_teste.csv'
        df_amostra.to_csv(caminho_amostra, sep=';', index=False, encoding='utf-8-sig')
        print(f"      [OK] Amostra salva em: '{caminho_amostra}'")
        return df_amostra, caminho_amostra

    ext = os.path.splitext(caminho_input)[1].lower()
    print(f"[2/4] Lendo arquivo de entrada: '{caminho_input}' ({ext})...")

    if ext in ['.xlsx', '.xls']:
        df = pd.read_excel(caminho_input)
    else:
        try:
            df = pd.read_csv(caminho_input, sep=';', encoding='utf-8-sig', low_memory=False)
            if df.shape[1] == 1:
                df = pd.read_csv(caminho_input, sep=',', encoding='utf-8-sig', low_memory=False)
        except Exception:
            df = pd.read_csv(caminho_input, sep=',', encoding='latin1', low_memory=False)

    print(f"      [OK] Carregados {df.shape[0]:,} contratos com {df.shape[1]} colunas.")
    return df, caminho_input


def aplicar_preprocessamento_escoragem(df, num_cols, cat_cols):
    """
    Aplica o preprocessamento fiel a Abordagem 4 sobre os novos contratos:
      - Calcula duracao_planejada_dias a partir de datas se estiver ausente.
      - Cria o indicador fl_sem_historico_5a a partir de qtd_cont_5a_forn.
      - Zera a taxa geral tx_adit_geral_5a se fl_sem_historico_5a == 1.
      - Preenche variaveis ausentes com defaults neutros.
    """
    X = pd.DataFrame(index=df.index)

    # 1. Duracao planejada em dias
    if 'duracao_planejada_dias' in df.columns:
        X['duracao_planejada_dias'] = pd.to_numeric(df['duracao_planejada_dias'], errors='coerce')
    elif 'Inicio_Vigencia' in df.columns and 'Fim_Vigencia' in df.columns:
        dt_ini = pd.to_datetime(df['Inicio_Vigencia'], format='%d/%m/%Y', errors='coerce')
        dt_fim = pd.to_datetime(df['Fim_Vigencia'], format='%d/%m/%Y', errors='coerce')
        X['duracao_planejada_dias'] = (dt_fim - dt_ini).dt.days
    else:
        X['duracao_planejada_dias'] = 365.0
    X['duracao_planejada_dias'] = X['duracao_planejada_dias'].fillna(365.0)

    # 2. Valor Original
    if 'Valor_Original' in df.columns:
        X['Valor_Original'] = pd.to_numeric(df['Valor_Original'], errors='coerce').fillna(0.0)
    else:
        X['Valor_Original'] = 0.0

    # 3. Capital Social
    if 'Capital_Social_Receita' in df.columns:
        X['Capital_Social_Receita'] = pd.to_numeric(df['Capital_Social_Receita'], errors='coerce').fillna(0.0)
    else:
        X['Capital_Social_Receita'] = 0.0

    # 4. Historico de contratos nos ultimos 5 anos
    if 'qtd_cont_5a_forn' in df.columns:
        X['qtd_cont_5a_forn'] = pd.to_numeric(df['qtd_cont_5a_forn'], errors='coerce').fillna(0)
    else:
        X['qtd_cont_5a_forn'] = 0

    # 5. Indicador fl_sem_historico_5a
    if 'fl_sem_historico_5a' in df.columns:
        X['fl_sem_historico_5a'] = pd.to_numeric(df['fl_sem_historico_5a'], errors='coerce').fillna(0).astype(int)
    else:
        X['fl_sem_historico_5a'] = (X['qtd_cont_5a_forn'] == 0).astype(int)

    # 6. Taxa geral de aditivos nos ultimos 5 anos
    if 'tx_adit_geral_5a' in df.columns:
        X['tx_adit_geral_5a'] = pd.to_numeric(df['tx_adit_geral_5a'], errors='coerce').fillna(0.0)
    else:
        X['tx_adit_geral_5a'] = 0.0
    # Regra metodologica: sem historico implica taxa 0.0
    X.loc[X['fl_sem_historico_5a'] == 1, 'tx_adit_geral_5a'] = 0.0

    # 7. Porte da Empresa
    if 'Porte_Empresa' in df.columns:
        X['Porte_Empresa'] = df['Porte_Empresa'].fillna('Nao Informado').astype(str).str.strip().str.upper()
    else:
        X['Porte_Empresa'] = 'Nao Informado'

    # 8. Tipo do Ultimo Aditivo
    if 'tipo_ult_adit' in df.columns:
        X['tipo_ult_adit'] = df['tipo_ult_adit'].fillna('Nao Informado').astype(str).str.strip().str.upper()
    else:
        # Se nao tem historico, atribui 'SEM HISTORICO'
        X['tipo_ult_adit'] = np.where(X['fl_sem_historico_5a'] == 1, 'SEM HISTORICO', 'Nao Informado')

    # Garante a ordem exata esperada pelo ColumnTransformer
    todas_cols = num_cols + cat_cols
    for c in todas_cols:
        if c not in X.columns:
            X[c] = 0.0 if c in num_cols else 'Nao Informado'

    return X[todas_cols]


def atribuir_governanca_e_risco(prob, limiar):
    """
    Classifica cada probabilidade predita em faixa de risco e diretriz de governanca.
    """
    if prob >= 0.70:
        nivel = "CRITICO (Prob >= 70%)"
        diretriz = "Auditoria preventiva obrigatoria. Instituir comissao especial de fiscalizacao e monitorar reajustes de prazo/valor."
    elif prob >= limiar:
        nivel = f"MODERADO ({limiar*100:.1f}% <= Prob < 70%)"
        diretriz = "Acompanhamento prioritario de medicoes. Exigir justificativa tecnica formal para quaisquer pleitos de alteracao contratual."
    else:
        nivel = f"BAIXO (Prob < {limiar*100:.1f}%)"
        diretriz = "Rito padrao de gestao fiscal e contratual. Manter rotina regular de ateste de servicos/entregas."
    return nivel, diretriz


def main():
    parser = argparse.ArgumentParser(
        description="Escoragem de Contratos - Random Forest (Abordagem 4)",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    parser.add_argument(
        '--input', '-i', type=str, default='sistema_web/dados/contratos_novos_exemplo.xlsx',
        help="Caminho do arquivo de entrada (.csv ou .xlsx) contendo os contratos a escorar"
    )
    parser.add_argument(
        '--output', '-o', type=str, default='contratos_escorados_rf_ab4.csv',
        help="Caminho do arquivo de saida (.csv ou .xlsx) com as probabilidades e pareceres"
    )
    parser.add_argument(
        '--model', '-m', type=str, default='random_forest_abordagem4.joblib',
        help="Caminho do arquivo do modelo serializado (.joblib)"
    )
    parser.add_argument(
        '--threshold', '-t', type=float, default=None,
        help="Ponto de corte para decisao binaria (se omitido, usa o limiar KS calibrado no modelo)"
    )
    args = parser.parse_args()

    print("=" * 80)
    print("ESCORAGEM DE CONTRATOS: RANDOM FOREST (ABORDAGEM 4 - KS OTIMO)")
    print("=" * 80)

    # 1. Carregar Modelo
    payload, caminho_m = carregar_modelo_serializado(args.model)
    pipeline = payload['pipeline']
    limiar_modelo = payload.get('limiar_ks', 0.4632)
    max_ks_modelo = payload.get('max_ks', 0.3947)
    num_cols = payload.get('num_cols', ['Valor_Original', 'duracao_planejada_dias', 'Capital_Social_Receita', 'qtd_cont_5a_forn', 'tx_adit_geral_5a', 'fl_sem_historico_5a'])
    cat_cols = payload.get('cat_cols', ['Porte_Empresa', 'tipo_ult_adit'])

    limiar_final = args.threshold if args.threshold is not None else limiar_modelo
    print(f"      Limiar de Decisao (Threshold): {limiar_final:.4f} (Max KS de Referencia: {max_ks_modelo:.4f})")

    # 2. Carregar Dados de Entrada
    df_raw, caminho_in = carregar_dados_entrada(args.input)

    # 3. Preprocessamento da Abordagem 4
    print("\n[3/4] Aplicando preprocessamento da Abordagem 4...")
    X_prep = aplicar_preprocessamento_escoragem(df_raw, num_cols, cat_cols)
    print(f"      Preditores estruturados ({X_prep.shape[1]} colunas): {list(X_prep.columns)}")

    # 4. Escoragem Preditiva
    print("\n[4/4] Calculando probabilidades de aditamento e pareceres de risco...")
    probas = pipeline.predict_proba(X_prep)[:, 1]
    predicoes = (probas >= limiar_final).astype(int)

    df_resultado = df_raw.copy()
    df_resultado['Score_Probabilidade'] = np.round(probas, 4)
    df_resultado['Prob_Aditivo_Pct'] = [f"{p*100:.1f}%" for p in probas]
    df_resultado['Predicao_Aditivo'] = predicoes
    df_resultado['Classificacao_Aditivo'] = np.where(predicoes == 1, 'Aditivo Provavel', 'Aditivo Improvavel')

    niveis = []
    diretrizes = []
    for p in probas:
        nv, dir_gov = atribuir_governanca_e_risco(p, limiar_final)
        niveis.append(nv)
        diretrizes.append(dir_gov)

    df_resultado['Nivel_Risco'] = niveis
    df_resultado['Diretriz_Governanca'] = diretrizes

    # Resumo no terminal
    total_contratos = len(df_resultado)
    total_positivos = int(predicoes.sum())
    total_negativos = total_contratos - total_positivos

    print("\n" + "=" * 80)
    print("RESUMO DA ESCORAGEM:")
    print("=" * 80)
    print(f"Total de Contratos Escorados:      {total_contratos:,}")
    print(f"Aditivos Provaveis (Score >= {limiar_final:.4f}): {total_positivos:,} ({total_positivos/total_contratos*100:.1f}%)")
    print(f"Sem Aditivo Provavel (Baixo Risco): {total_negativos:,} ({total_negativos/total_contratos*100:.1f}%)")
    print("\nDistribuicao por Nivel de Risco:")
    for n_risco, cont in df_resultado['Nivel_Risco'].value_counts().items():
        print(f"  - {n_risco}: {cont:,} contratos ({cont/total_contratos*100:.1f}%)")

    # Exibicao de amostra
    print("\n" + "=" * 80)
    print("PRIMEIROS CONTRATOS ESCORADOS:")
    print("=" * 80)
    cols_preview = [c for c in ['Id_Contrato', 'Objeto_Contrato', 'Valor_Original', 'Score_Probabilidade', 'Prob_Aditivo_Pct', 'Classificacao_Aditivo', 'Nivel_Risco'] if c in df_resultado.columns]
    print(df_resultado[cols_preview].head(8).to_string(index=False))

    # Salvar Resultado
    caminho_salvo = tentar_salvar_arquivo(df_resultado, args.output)
    print("\n" + "=" * 80)
    print(f"RESULTADO SALVO COM SUCESSO EM: {os.path.abspath(caminho_salvo)}")
    print("=" * 80)


if __name__ == '__main__':
    main()
