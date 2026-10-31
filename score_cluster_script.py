"""
========================================================================================
SCRIPT DE ESCORAGEM DE CLUSTERS — CENÁRIO 1 (MINMAX SCALER)
Trabalho de Aprendizado de Máquina — Governança e Auditoria de Contratos Petrobras
========================================================================================

Objetivo:
  1. Carregar o modelo de clusterização serializado ('cluster_cenario1_minmax.joblib').
  2. Receber como entrada um arquivo CSV ou Excel com novos contratos via terminal (CLI).
  3. Aplicar o MinMaxScaler treinado e classificar cada contrato no seu respectivo cluster.
  4. Enriquecer o arquivo com:
     - Cluster_ID (0, 1, 2)
     - Cluster_Nome
     - Cluster_Perfil_Risco (BAIXO RISCO, MODERADO, CRÍTICO)
     - Cluster_Taxa_Historica_Aditivos_Pct
     - Cluster_Recomendacao_Governanca
  5. Salvar o arquivo escorado com proteção automática contra bloqueios do Excel (PermissionError).
  6. Exibir um sumário executivo no terminal.

Exemplos de Uso no Terminal:
  python score_cluster_script.py
  python score_cluster_script.py -i amostra_contratos_cluster.csv
  python score_cluster_script.py -i sistema_web/dados/contratos_novos_exemplo.xlsx -o contratos_resultado.xlsx
"""

import os
import sys
import argparse
import joblib
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_MODEL_PATH = os.path.join(BASE_DIR, "cluster_cenario1_minmax.joblib")
DEFAULT_INPUT_PATH = os.path.join(BASE_DIR, "amostra_contratos_cluster.csv")
DEFAULT_OUTPUT_PATH = os.path.join(BASE_DIR, "contratos_escorados_clusters.csv")

def print_separator(title):
    print("\n" + "=" * 85)
    print(f" {title} ")
    print("=" * 85)

def carregar_modelo_cluster(model_path):
    if not os.path.exists(model_path):
        alt_path = os.path.join(BASE_DIR, "sistema_web", "backend_fastapi", "models", "cluster_cenario1_minmax.joblib")
        if os.path.exists(alt_path):
            model_path = alt_path
        else:
            print(f"\n>> [ERRO] Modelo não encontrado em: '{model_path}'")
            print("Execute primeiro o treinamento no terminal:")
            print("  python training_cluster_script.py\n")
            sys.exit(1)

    print(f">> Carregando modelo treinado: {model_path}")
    artefato = joblib.load(model_path)
    return artefato

def ler_arquivo_entrada(file_path):
    if not os.path.exists(file_path):
        print(f"\n>> [ERRO] Arquivo de entrada não encontrado: '{file_path}'")
        print("\nArquivos disponíveis no projeto prontos para teste imediato:")
        print("  • amostra_contratos_cluster.csv  (Amostra com 10 contratos em .csv)")
        print("  • sistema_web/dados/contratos_novos_exemplo.xlsx  (Amostra com 5 contratos em .xlsx)")
        print("  • ABT/abt_modelagem_aditivos.csv  (Base oficial com 5.787 contratos)")
        print("\nExemplo correto de uso no terminal:")
        print("  python score_cluster_script.py -i amostra_contratos_cluster.csv")
        print("  python score_cluster_script.py -i sistema_web/dados/contratos_novos_exemplo.xlsx\n")
        sys.exit(1)

    print(f">> Lendo arquivo de contratos: {file_path}")
    ext = os.path.splitext(file_path)[1].lower()

    if ext in ['.xlsx', '.xls']:
        df = pd.read_excel(file_path)
    elif ext == '.csv':
        try:
            df = pd.read_csv(file_path, sep=';', low_memory=False, encoding='utf-8-sig')
            if len(df.columns) <= 1:
                df = pd.read_csv(file_path, sep=',', low_memory=False, encoding='utf-8-sig')
        except Exception:
            df = pd.read_csv(file_path, sep=',', low_memory=False, encoding='latin1')
    else:
        raise ValueError(f"Formato não suportado: '{ext}'. Utilize .csv ou .xlsx.")

    print(f">> Total de registros lidos: {len(df):,}")
    return df

def escorar_contratos(df, artefato):
    scaler = artefato['scaler']
    kmeans = artefato['kmeans']
    features = artefato['features']
    nomes_clusters = artefato['cluster_names']
    perfis = {p['cluster_id']: p for p in artefato['cluster_profiles']}

    df_proc = df.copy()

    # Validação e imputação das variáveis requeridas
    for col in features:
        if col not in df_proc.columns:
            print(f">> [AVISO] Coluna '{col}' ausente no arquivo. Preenchendo com 0.0.")
            df_proc[col] = 0.0
        else:
            df_proc[col] = pd.to_numeric(df_proc[col], errors='coerce').fillna(0.0)

    # Normalização MinMaxScaler e Predição K-Means
    X_raw = df_proc[features].values
    X_scaled = scaler.transform(X_raw)
    cluster_ids = kmeans.predict(X_scaled)

    def obter_recomendacao(risco_str):
        if "CRÍTICO" in risco_str or "ALTO" in risco_str:
            return "ALTO RISCO (CRÍTICO): Empreitadas de grande porte e longa vigência. Exige comitê prévio de governança, auditoria trimestral de medições físicas e reserva orçamentária para aditivos."
        elif "BAIXO" in risco_str or "SEGURO" in risco_str:
            return "BAIXO RISCO: Contratos operacionais e de curto prazo. Fiscalização de rotina e liquidação convencional de medições."
        else:
            return "RISCO MODERADO: Contratos trienais padrão da Petrobras. Acompanhamento semestral de marcos contratuais e conferência de repactuações de preços."

    df_proc['Cluster_ID'] = cluster_ids
    df_proc['Cluster_Nome'] = [nomes_clusters.get(cid, f"Cluster {cid}") for cid in cluster_ids]
    df_proc['Cluster_Perfil_Risco'] = [perfis.get(cid, {}).get('perfil_risco', 'N/A') for cid in cluster_ids]
    df_proc['Cluster_Taxa_Historica_Aditivos_Pct'] = [perfis.get(cid, {}).get('taxa_aditivo_pct', 0.0) for cid in cluster_ids]
    df_proc['Cluster_Recomendacao_Governanca'] = [obter_recomendacao(p) for p in df_proc['Cluster_Perfil_Risco']]

    return df_proc

def exibir_sumario_escoragem(df_escorado):
    print_separator("RELATÓRIO EXECUTIVO DE ESCORAGEM DE CLUSTERS")
    
    tot = len(df_escorado)
    print(f"Total de Contratos Escorados: {tot:,}")

    # Distribuição por Cluster
    dist = df_escorado.groupby(['Cluster_ID', 'Cluster_Nome', 'Cluster_Perfil_Risco']).agg(
        Qtd_Contratos=('Valor_Original', 'count'),
        Valor_Total=('Valor_Original', 'sum'),
        Valor_Medio=('Valor_Original', 'mean'),
        Duracao_Media=('duracao_planejada_dias', 'mean'),
        Taxa_Historica_Aditivos=('Cluster_Taxa_Historica_Aditivos_Pct', 'first')
    ).reset_index()

    dist['Percentual_Lote'] = (dist['Qtd_Contratos'] / tot) * 100.0

    print("\nDistribuição dos Novos Contratos pelos Perfis de Risco:")
    for _, row in dist.iterrows():
        print(f"\n[*] {row['Cluster_Nome']} [{row['Cluster_Perfil_Risco']}]:")
        print(f"    • Contratos Classificados: {row['Qtd_Contratos']} ({row['Percentual_Lote']:.1f}% do lote)")
        print(f"    • Taxa Histórica de Aditivo do Cluster: {row['Taxa_Historica_Aditivos']:.1f}%")
        print(f"    • Volume Financeiro: R$ {row['Valor_Total']:,.2f} (Média: R$ {row['Valor_Medio']:,.2f})")
        print(f"    • Vigência Média Prevista: {row['Duracao_Media']:.0f} dias")

    print("\n" + "-" * 85)
    print("Amostra dos Primeiros Contratos Escorados:")
    cols_preview = [
        'Valor_Original', 'duracao_planejada_dias', 'Capital_Social_Receita',
        'Cluster_ID', 'Cluster_Perfil_Risco', 'Cluster_Taxa_Historica_Aditivos_Pct'
    ]
    for id_col in reversed(['Numero_Contrato', 'Fornecedor_Nome', 'CNPJ']):
        if id_col in df_escorado.columns:
            cols_preview.insert(0, id_col)

    cols_existentes = [c for c in cols_preview if c in df_escorado.columns]
    print(df_escorado[cols_existentes].head(10).to_string(index=False))

def salvar_saida(df_escorado, output_path):
    ext = os.path.splitext(output_path)[1].lower()
    caminho_final = output_path
    tentativas = 0

    while True:
        try:
            if ext in ['.xlsx', '.xls']:
                df_escorado.to_excel(caminho_final, index=False)
            else:
                df_escorado.to_csv(caminho_final, index=False, sep=';', encoding='utf-8-sig')
            print(f"\n>> Base de contratos escorados exportada com sucesso para: '{caminho_final}'")
            break
        except PermissionError:
            tentativas += 1
            nome_base, ext_base = os.path.splitext(output_path)
            caminho_final = f"{nome_base}_{tentativas}{ext_base}"
            print(f">> [AVISO] O arquivo '{output_path}' está aberto no Excel ou em outro programa.")
            print(f">> Salvando automaticamente como alternativa: '{caminho_final}'...")
            if tentativas >= 10:
                print(f">> [ERRO] Não foi possível salvar o arquivo devido a bloqueios no sistema.")
                raise

def main():
    parser = argparse.ArgumentParser(
        description="Script de Escoragem em Lote de Novos Contratos Petrobras (K-Means MinMaxScaler Cenário 1)"
    )
    parser.add_argument(
        "-i", "--input",
        default=DEFAULT_INPUT_PATH,
        help="Caminho do arquivo CSV ou Excel com os novos contratos para escorar."
    )
    parser.add_argument(
        "-o", "--output",
        default=DEFAULT_OUTPUT_PATH,
        help="Caminho do arquivo de saída com as predições e enriquecimento gerencial."
    )
    parser.add_argument(
        "-m", "--model",
        default=DEFAULT_MODEL_PATH,
        help="Caminho do modelo serializado de clusterização (.joblib)."
    )

    args = parser.parse_args()

    print_separator("INICIANDO ESCORAGEM DE CLUSTERS (TERMINAL CLI)")
    artefato = carregar_modelo_cluster(args.model)
    df_input = ler_arquivo_entrada(args.input)
    df_escorado = escorar_contratos(df_input, artefato)
    exibir_sumario_escoragem(df_escorado)
    salvar_saida(df_escorado, args.output)
    print("\n>> Escoragem concluída com sucesso!\n")

if __name__ == "__main__":
    main()
