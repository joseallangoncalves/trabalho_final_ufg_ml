"""
Esquemas Pydantic v2 para a API de Predição e Segmentação Contratual Petrobras.
Alinhado à Abordagem 4 de Random Forest (Geisiane) e ao K-Means Cenário 1 (MinMaxScaler).
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class ContractInputSchema(BaseModel):
    # --- Preditores Primários da Abordagem 4 (Geisiane) ---
    Valor_Original: float = Field(
        ..., gt=0, description="Valor inicial contratado em Reais (R$)"
    )
    duracao_planejada_dias: int = Field(
        ..., gt=0, description="Duração prevista da vigência original em dias"
    )
    Capital_Social_Receita: float = Field(
        default=5000000.0, ge=0.0, description="Capital social registrado na Receita Federal (R$)"
    )
    qtd_cont_5a_forn: int = Field(
        default=2, ge=0, description="Contratos concluídos pelo fornecedor nos últimos 5 anos"
    )
    tx_adit_geral_5a: float = Field(
        default=0.40, ge=0.0, le=1.0, description="Taxa geral histórica de aditivos (5 anos)"
    )
    Porte_Empresa: str = Field(
        default="DEMAIS", description="Porte empresarial oficial (DEMAIS, EPP, ME ou Não Informado)"
    )
    tipo_ult_adit: str = Field(
        default="PRAZO", description="Tipo do último aditivo anterior (PRAZO, VALOR, PRAZO E VALOR, SEM HISTORICO)"
    )
    fl_sem_historico_5a: Optional[int] = Field(
        default=None, description="1 se novo fornecedor sem contratos em 5 anos; calculado automaticamente se None"
    )

    # --- Preditores Opcionais / Legados (Mantidos com defaults para máxima compatibilidade) ---
    tipo_fundamento_licitacao: Optional[str] = Field(
        default="Licitacao_Geral_Art28", description="Modalidade licitatória (Lei 13.303/16)"
    )
    qtd_cont_forn_tot: Optional[int] = Field(
        default=5, ge=0, description="Histórico total absoluto de contratos prévios"
    )
    Natureza_Juridica: Optional[str] = Field(
        default="2062", description="Código de natureza jurídica na Receita"
    )
    qtd_adit_prazo_5a: Optional[int] = Field(default=0, ge=0)
    tx_adit_prazo_5a: Optional[float] = Field(default=0.0, ge=0.0, le=1.0)
    qtd_adit_pv_5a: Optional[int] = Field(default=0, ge=0)
    tx_adit_pv_5a: Optional[float] = Field(default=0.0, ge=0.0, le=1.0)
    qtd_adit_val_5a: Optional[int] = Field(default=0, ge=0)
    tx_adit_val_5a: Optional[float] = Field(default=0.0, ge=0.0, le=1.0)


class ContributingFactor(BaseModel):
    feature: str
    impacto_direcao: str
    descricao: str


class PredictionResponseSchema(BaseModel):
    previsao_aditivo: int
    rotulo: str
    probabilidade_aditivo: float
    probabilidade_sem_aditivo: float
    limiar_decisao_ks: float
    max_ks: float
    nivel_risco: str
    cor_alerta: str
    parecer_governanca: str
    fatores_relevantes: List[ContributingFactor]


class ClusterResponseSchema(BaseModel):
    cluster_id: int
    cluster_nome: str
    cluster_perfil_risco: str
    cluster_taxa_historica: float
    mediana_valor: float
    duracao_media: float
    recomendacao_gestao: str
