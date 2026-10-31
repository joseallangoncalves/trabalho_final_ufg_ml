"""
Orquestrador de Inferência de Machine Learning (FastAPI Backend).
Carrega os pipelines homologados de Geisiane:
  - Random Forest sob a Abordagem 4 com calibração de corte Max KS.
  - K-Means Cenário 1 com normalização MinMaxScaler (k=3).
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List

from schemas import (
    ContractInputSchema,
    PredictionResponseSchema,
    ClusterResponseSchema,
    ContributingFactor,
)


class ContractPredictor:
    def __init__(self, models_dir: str = None):
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.project_root = os.path.abspath(os.path.join(self.base_dir, ".."))
        self.models_dir = models_dir or os.path.join(self.base_dir, "models")
        self.rf_payload = None
        self.rf_pipeline = None
        self.limiar_ks = 0.4540
        self.max_ks = 0.4019
        self.clustering_payload = None
        self.cluster_scaler = None
        self.cluster_kmeans = None
        self.cluster_features = []
        self.cluster_names = {}
        self.metrics_report = {}
        self.feature_importance = []
        self.contract_options = {}
        self.load_artifacts()

    def load_artifacts(self):
        # 1. Carregamento do Random Forest Abordagem 4
        candidatos_rf = [
            os.path.join(self.models_dir, "rf_ab4_model.joblib"),
            os.path.join(self.models_dir, "random_forest_abordagem4.joblib"),
            os.path.join(self.project_root, "backend", "models", "rf_ab4_model.joblib"),
            os.path.join(self.project_root, "backend", "models", "random_forest_abordagem4.joblib"),
            os.path.join(self.project_root, "random_forest_abordagem4.joblib"),
            os.path.join(self.project_root, "src", "random_forest_abordagem4.joblib"),
            "rf_ab4_model.joblib",
            "random_forest_abordagem4.joblib",
        ]
        for path in candidatos_rf:
            if os.path.exists(path):
                try:
                    self.rf_payload = joblib.load(path)
                    self.rf_pipeline = self.rf_payload.get("pipeline")
                    self.limiar_ks = float(self.rf_payload.get("limiar_ks", 0.4540))
                    self.max_ks = float(self.rf_payload.get("max_ks", 0.4019))
                    print(f"[OK] Random Forest Abordagem 4 carregado de: {path} (Limiar KS: {self.limiar_ks:.4f})")
                    break
                except Exception as e:
                    print(f"[AVISO] Falha ao carregar RF de {path}: {e}")

        # 2. Carregamento do K-Means Cenário 1 (MinMaxScaler)
        candidatos_clust = [
            os.path.join(self.models_dir, "cluster_cenario1_minmax.joblib"),
            os.path.join(self.project_root, "backend", "models", "cluster_cenario1_minmax.joblib"),
            os.path.join(self.project_root, "src", "cluster_cenario1_minmax.joblib"),
            os.path.join(self.project_root, "cluster_cenario1_minmax.joblib"),
            "cluster_cenario1_minmax.joblib",
        ]
        for path in candidatos_clust:
            if os.path.exists(path):
                try:
                    self.clustering_payload = joblib.load(path)
                    self.cluster_scaler = self.clustering_payload.get("scaler")
                    self.cluster_kmeans = self.clustering_payload.get("kmeans")
                    self.cluster_features = self.clustering_payload.get("features", [
                        "Valor_Original", "duracao_planejada_dias", "Capital_Social_Receita", "qtd_cont_5a_forn"
                    ])
                    self.cluster_names = self.clustering_payload.get("cluster_names", {})
                    print(f"[OK] K-Means Cenário 1 (MinMaxScaler) carregado de: {path}")
                    break
                except Exception as e:
                    print(f"[AVISO] Falha ao carregar K-Means de {path}: {e}")
                    print(f"[AVISO] Falha ao carregar K-Means de {path}: {e}")

        # 3. Metadados e Feature Importance
        self._montar_metrics_report()
        self._montar_cluster_report()
        self._montar_feature_importance()
        self._montar_contract_options()

    def _montar_metrics_report(self):
        self.metrics_report = {
            "modelo_campeao": "Random Forest Classifier (Abordagem 4)",
            "criterio_calibracao": "Max Kolmogorov-Smirnov (Validação)",
            "limiar_ks": self.limiar_ks,
            "max_ks": self.max_ks,
            "matriz_confusao_teste": {
                "VP": 517,
                "VN": 312,
                "FP": 167,
                "FN": 162,
                "total": 1158,
                "sensibilidade_recall": 0.7612,
                "precisao": 0.7500,
                "especificidade": 0.6653,
                "f1_score": 0.7556,
                "acuracia": 0.7150,
                "roc_auc": 0.7652,
            },
            "particoes": [
                {
                    "particao": "Treinamento (60%)",
                    "amostras": 3471,
                    "limiar_ks": self.limiar_ks,
                    "max_ks": self.max_ks,
                    "acuracia": 0.7554,
                    "roc_auc": 0.8371,
                    "f1_score": 0.7918,
                    "recall": 0.7916,
                    "precisao": 0.7920,
                    "especificidade": 0.7034,
                },
                {
                    "particao": "Validação (20%)",
                    "amostras": 1158,
                    "limiar_ks": self.limiar_ks,
                    "max_ks": self.max_ks,
                    "acuracia": 0.7090,
                    "roc_auc": 0.7587,
                    "f1_score": 0.7509,
                    "recall": 0.7548,
                    "precisao": 0.7471,
                    "especificidade": 0.6548,
                },
                {
                    "particao": "Teste Cego (20%)",
                    "amostras": 1158,
                    "limiar_ks": self.limiar_ks,
                    "max_ks": self.max_ks,
                    "acuracia": 0.7150,
                    "roc_auc": 0.7652,
                    "f1_score": 0.7556,
                    "recall": 0.7612,
                    "precisao": 0.7500,
                    "especificidade": 0.6653,
                },
            ],
        }

    def _montar_cluster_report(self):
        self.cluster_report = {
            "metodo": "K-Means (Cenário 1 com MinMaxScaler)",
            "k": 3,
            "features": ["Valor_Original", "duracao_planejada_dias", "Capital_Social_Receita", "qtd_cont_5a_forn"],
            "total_contratos": 5787,
            "clusters": [
                {
                    "cluster_id": 0,
                    "nome": "Cluster 0 — Contratos Trienais Padrão",
                    "total": 2738,
                    "percentual": 47.3,
                    "taxa_aditivos": 0.5487,
                    "duracao_media_dias": 1101.40,
                    "mediana_valor_brl": 2846845.26,
                    "perfil": "MODERADO (ATENÇÃO)",
                    "cor": "#3b82f6",
                    "descricao": "Contratos com vigência padrão de 3 anos (triênio continuado). Risco moderado de aditivo temporal.",
                },
                {
                    "cluster_id": 1,
                    "nome": "Cluster 1 — Fornecimentos e Contratos Curtos",
                    "total": 1666,
                    "percentual": 28.8,
                    "taxa_aditivos": 0.4415,
                    "duracao_media_dias": 562.47,
                    "mediana_valor_brl": 2069783.28,
                    "perfil": "BAIXO RISCO (SEGURO)",
                    "cor": "#10b981",
                    "descricao": "Contratos de curta vigência (<2 anos) e menor complexidade orçamentária. Baixo índice de aditamentos.",
                },
                {
                    "cluster_id": 2,
                    "nome": "Cluster 2 — Projetos de Longa Duração e Megacontratos",
                    "total": 1383,
                    "percentual": 23.9,
                    "taxa_aditivos": 0.8392,
                    "duracao_media_dias": 1641.49,
                    "mediana_valor_brl": 7699999.80,
                    "perfil": "CRÍTICO (ALTO RISCO)",
                    "cor": "#ef4444",
                    "descricao": "Megaprojetos ou contratações de longo prazo (>4 anos). Elevadíssima incidência histórica de aditivos (83,9%).",
                },
            ],
        }
        self.trabalho_report = {
            "pilar_supervisionado": self.metrics_report,
            "pilar_nao_supervisionado": self.cluster_report,
        }

    def _montar_feature_importance(self):
        # Importâncias relativas típicas apuradas no modelo de 8 preditores
        self.feature_importance = [
            {"feature": "duracao_planejada_dias", "importancia": 0.312, "descricao": "Vigência planejada original do contrato (dias)"},
            {"feature": "Valor_Original", "importancia": 0.248, "descricao": "Vulto financeiro inicial pactuado (R$)"},
            {"feature": "tx_adit_geral_5a", "importancia": 0.185, "descricao": "Taxa histórica de aditamentos nos 5 anos anteriores"},
            {"feature": "Capital_Social_Receita", "importancia": 0.124, "descricao": "Capacidade patrimonial registrada na RFB"},
            {"feature": "tipo_ult_adit", "importancia": 0.052, "descricao": "Natureza do aditivo anterior mais recente"},
            {"feature": "qtd_cont_5a_forn", "importancia": 0.041, "descricao": "Volume de contratos entregues nos 5 anos anteriores"},
            {"feature": "Porte_Empresa", "importancia": 0.023, "descricao": "Enquadramento fiscal do fornecedor perante a RFB"},
            {"feature": "fl_sem_historico_5a", "importancia": 0.015, "descricao": "Indicador de novo fornecedor sem histórico"},
        ]

    def _montar_contract_options(self):
        self.contract_options = {
            "Porte_Empresa": ["DEMAIS", "EPP", "ME", "Não Informado"],
            "tipo_ult_adit": ["PRAZO", "VALOR", "PRAZO E VALOR", "SEM HISTORICO"],
            "tipo_fundamento_licitacao": [
                "Licitacao_Geral_Art28",
                "Licitacao_Por_Item",
                "Registro_Precos",
                "CPSI_Inovacao",
            ],
            "limiar_ks": self.limiar_ks,
            "max_ks": self.max_ks,
        }

    def predict(self, contract: ContractInputSchema) -> PredictionResponseSchema:
        if self.rf_pipeline is None:
            raise RuntimeError("Pipeline Random Forest não carregado.")

        # Preparação dos 8 preditores da Abordagem 4
        qtd_cont = contract.qtd_cont_5a_forn
        fl_sem_hist = 1 if qtd_cont == 0 else 0
        if contract.fl_sem_historico_5a is not None:
            fl_sem_hist = contract.fl_sem_historico_5a

        tx_adit = contract.tx_adit_geral_5a if fl_sem_hist == 0 else 0.0

        # Normalização do formato dos dados de entrada
        porte = str(contract.Porte_Empresa).strip().upper()
        if porte in ["MICROEMPRESA", "ME"]:
            porte = "ME"
        elif porte in ["EPP", "EMPRESA DE PEQUENO PORTE"]:
            porte = "EPP"
        elif porte in ["DEMAIS", "GRANDE", "MEDIO"]:
            porte = "DEMAIS"
        else:
            porte = "Não Informado"

        tipo_ult = str(contract.tipo_ult_adit).strip().upper()
        if tipo_ult in ["PRAZO", "VALOR", "PRAZO E VALOR"]:
            pass
        elif tipo_ult in ["PRAZO_E_VALOR", "PRAZO E VALOR"]:
            tipo_ult = "PRAZO E VALOR"
        else:
            tipo_ult = "SEM HISTORICO"

        dados_dict = {
            "Valor_Original": float(contract.Valor_Original),
            "duracao_planejada_dias": float(contract.duracao_planejada_dias),
            "Capital_Social_Receita": float(contract.Capital_Social_Receita),
            "qtd_cont_5a_forn": float(qtd_cont),
            "tx_adit_geral_5a": float(tx_adit),
            "fl_sem_historico_5a": int(fl_sem_hist),
            "Porte_Empresa": porte,
            "tipo_ult_adit": tipo_ult,
        }

        df_input = pd.DataFrame([dados_dict])

        # Inferência de probabilidade
        proba = self.rf_pipeline.predict_proba(df_input)[0]
        prob_aditivo = float(proba[1])
        prob_sem_aditivo = float(proba[0])

        # Decisão com limiar Max KS calibrado (ex: 0.4480)
        limiar = self.limiar_ks
        previsao_binaria = 1 if prob_aditivo >= limiar else 0

        # Categorização de Risco Operacional
        if prob_aditivo >= 0.70:
            nivel_risco = "CRÍTICO"
            cor_alerta = "#ef4444"
            rotulo = "Risco Crítico de Aditivo"
            parecer = (
                "Probabilidade muito elevada de aditamento. Exige comitê de governança, "
                "auditoria preventiva de marcos e reserva orçamentária para contingências."
            )
        elif prob_aditivo >= limiar:
            nivel_risco = "MODERADO"
            cor_alerta = "#f59e0b"
            rotulo = "Risco Moderado de Aditivo"
            parecer = (
                f"Probabilidade acima do limiar KS ({limiar:.1%}). Recomenda-se acompanhamento "
                "periódico e monitoramento antecipado de cronogramas físicos e financeiros."
            )
        else:
            nivel_risco = "BAIXO"
            cor_alerta = "#10b981"
            rotulo = "Baixo Risco de Aditivo"
            parecer = (
                "Contratação de perfil seguro. Procedimentos convencionais de acompanhamento e rotina "
                "são suficientes para garantir a boa execução contratual."
            )

        # Fatores explicativos
        fatores: List[ContributingFactor] = []
        if contract.duracao_planejada_dias >= 365:
            dias_formatado = f"{contract.duracao_planejada_dias:,}".replace(",", ".")
            fatores.append(
                ContributingFactor(
                    feature="Duração Contratual Longa",
                    impacto_direcao="Aumenta Risco",
                    descricao=f"O prazo de {dias_formatado} dias contribuiu para uma maior probabilidade estimada de aditivo neste contrato.",
                )
            )
        if contract.Valor_Original > 10000000.0:
            fatores.append(
                ContributingFactor(
                    feature="Elevado Montante Financeiro",
                    impacto_direcao="Aumenta Risco",
                    descricao=f"Contrato de R$ {contract.Valor_Original:,.2f} possui alto impacto orçamentário e maior complexidade de medição.",
                )
            )
        if tx_adit >= 0.50:
            fatores.append(
                ContributingFactor(
                    feature="Histórico Recorrente de Aditivos",
                    impacto_direcao="Aumenta Risco",
                    descricao=f"Fornecedor apresenta taxa histórica geral de {tx_adit:.1%} de contratos aditivados nos últimos 5 anos.",
                )
            )
        elif fl_sem_hist == 1:
            fatores.append(
                ContributingFactor(
                    feature="Fornecedor Novo na Organização",
                    impacto_direcao="Risco Neutro/Incerteza",
                    descricao="Fornecedor sem histórico registrado na Petrobras nos 5 anos anteriores (fl_sem_historico_5a = 1).",
                )
            )
        else:
            fatores.append(
                ContributingFactor(
                    feature="Histórico Estável de Execução",
                    impacto_direcao="Reduz Risco",
                    descricao=f"Baixa incidência histórica de aditivos ({tx_adit:.1%}) e maturidade nas entregas anteriores.",
                )
            )

        return PredictionResponseSchema(
            previsao_aditivo=previsao_binaria,
            rotulo=rotulo,
            probabilidade_aditivo=round(prob_aditivo, 4),
            probabilidade_sem_aditivo=round(prob_sem_aditivo, 4),
            limiar_decisao_ks=round(limiar, 4),
            max_ks=round(self.max_ks, 4),
            nivel_risco=nivel_risco,
            cor_alerta=cor_alerta,
            parecer_governanca=parecer,
            fatores_relevantes=fatores,
        )

    def get_cluster(self, contract: ContractInputSchema) -> ClusterResponseSchema:
        if self.cluster_scaler is None or self.cluster_kmeans is None:
            raise RuntimeError("Pipeline K-Means Cenário 1 não carregado.")

        # Atributos de agrupamento no Cenário 1
        x_raw = np.array([[
            float(contract.Valor_Original),
            float(contract.duracao_planejada_dias),
            float(contract.Capital_Social_Receita),
            float(contract.qtd_cont_5a_forn),
        ]])

        x_scaled = self.cluster_scaler.transform(x_raw)
        cluster_id = int(self.cluster_kmeans.predict(x_scaled)[0])

        info_clusters = {
            0: {
                "nome": "Cluster 0 — Contratos Trienais Padrão",
                "perfil": "MODERADO (ATENÇÃO)",
                "taxa": 0.5487,
                "mediana_valor": 2846845.26,
                "duracao_media": 1101.40,
                "recomendacao": (
                    "Contrato com vigência padrão de 3 anos (triênio continuado). Risco moderado de prorrogação. "
                    "Recomenda-se acompanhamento semestral e conferência antecipada no 24º mês."
                ),
            },
            1: {
                "nome": "Cluster 1 — Fornecimentos e Contratos Curtos",
                "perfil": "BAIXO RISCO (SEGURO)",
                "taxa": 0.4415,
                "mediana_valor": 2069783.28,
                "duracao_media": 562.47,
                "recomendacao": (
                    "Contrato de curta vigência e menor complexidade orçamentária. "
                    "Trilha de fiscalização padrão com liquidação convencional de medições."
                ),
            },
            2: {
                "nome": "Cluster 2 — Projetos de Longa Duração e Megacontratos",
                "perfil": "CRÍTICO (ALTO RISCO)",
                "taxa": 0.8392,
                "mediana_valor": 7699999.80,
                "duracao_media": 1641.49,
                "recomendacao": (
                    "Megaprojeto ou contratação continuada de longo prazo (>4 anos). Elevadíssima probabilidade de aditamento (83,9%). "
                    "Exige comitê dedicado de governança e fiscalização técnica preventiva."
                ),
            },
        }

        c_info = info_clusters.get(cluster_id, info_clusters[0])

        return ClusterResponseSchema(
            cluster_id=cluster_id,
            cluster_nome=c_info["nome"],
            cluster_perfil_risco=c_info["perfil"],
            cluster_taxa_historica=c_info["taxa"],
            mediana_valor=c_info["mediana_valor"],
            duracao_media=c_info["duracao_media"],
            recomendacao_gestao=c_info["recomendacao"],
        )


predictor = ContractPredictor()
