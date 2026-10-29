# Especificação da API — Backend FastAPI (Pipeline Geisiane)

**Versão da API:** `v3.0.0` (Alinhada ao Pacote de Machine Learning da Geisiane)  
**Framework:** FastAPI 0.136+ (Python 3.10+)  
**Validação de Esquemas:** Pydantic v2  
**Localização:** `backend/`  
**Escopo Metodológico:** Classificação Supervisionada (`fl_aditivo` via Random Forest Abordagem 4 com corte Max KS) e Clusterização Não Supervisionada (K-Means Cenário 1 MinMaxScaler, $K=3$). Tarefa de regressão expressamente descontinuada.  

---

## 1. Visão Geral da Arquitetura de Serviços

A API serve como camada desacoplada de inferência para os modelos homologados de Geisiane no momento $T_0$:
1. **Inferência de Classificação (`fl_aditivo`):** Predição da probabilidade de aditamento, classificação binária com o limiar ótimo calibrado via Kolmogorov-Smirnov ($t^* = 0,4540$, $KS = 0,4019$), categorização de nível de risco e indicação dos fatores determinantes.
2. **Inferência de Clusterização (K-Means Cenário 1, MinMaxScaler):** Atribuição do contrato a um dos 3 arquétipos de governança (Operacional, Intermediário/Trienal ou Estratégico de Alta Complexidade).
3. **Métricas Acadêmicas e Auditoria:** Exposição das matrizes de confusão e métricas completas nas 3 partições (Treino 60%, Validação 20%, Teste Cego 20%).

---

## 2. Modelos Pydantic (Esquemas de Dados)

### 2.1 Esquema de Entrada: `ContractInputSchema`
Alinhado à **Abordagem 4**, que consolida o histórico em 8 preditores pré-contratuais, mantendo campos legados como opcionais com valores *default* para compatibilidade:

```python
from pydantic import BaseModel, Field
from typing import Optional

class ContractInputSchema(BaseModel):
    # --- Preditores Centrais da Abordagem 4 (Geisiane) ---
    Valor_Original: float = Field(..., gt=0, description="Valor inicial pactuado em Reais (R$)")
    duracao_planejada_dias: int = Field(..., gt=0, description="Prazo inicial pactuado em dias corridos")
    Capital_Social_Receita: float = Field(default=0.0, ge=0, description="Capital social perante a RFB (R$)")
    qtd_cont_5a_forn: int = Field(default=0, ge=0, description="Quantidade de contratos finalizados nos 5 anos anteriores")
    tx_adit_geral_5a: float = Field(default=0.0, ge=0.0, le=1.0, description="Taxa geral histórica de aditivos (5 anos)")
    fl_sem_historico_5a: Optional[int] = Field(default=None, description="1 se novo fornecedor sem contratos em 5 anos; se None, calculado automaticamente")
    Porte_Empresa: str = Field(default="DEMAIS", description="DEMAIS, EPP, ME ou Não Informado")
    tipo_ult_adit: str = Field(default="SEM HISTORICO", description="PRAZO, VALOR, PRAZO E VALOR ou SEM HISTORICO")

    # --- Campos Cadastrais Complementares / Legados (Opcionais) ---
    tipo_fundamento_licitacao: Optional[str] = Field(default="Licitacao_Geral_Art28", description="Fundamento legal")
    qtd_cont_forn_tot: Optional[int] = Field(default=0, ge=0, description="Total histórico absoluto de contratos")
    Natureza_Juridica: Optional[int] = Field(default=2062, description="Código da natureza jurídica")
```

### 2.2 Esquema de Resposta de Classificação: `PredictionResponseSchema`
```python
from pydantic import BaseModel
from typing import List

class ContributingFactor(BaseModel):
    feature: str
    impacto_direcao: str  # "Aumenta Risco" ou "Reduz Risco"
    descricao: str

class PredictionResponseSchema(BaseModel):
    previsao_classe: int              # 0 (Sem Aditivo) ou 1 (Com Aditivo)
    rotulo: str                      # "Sem Risco de Aditivo" ou "Alto Risco de Aditivo"
    probabilidade_aditivo: float      # ex: 0.6120
    probabilidade_sem_aditivo: float  # ex: 0.3880
    limiar_decisao_ks: float          # 0.4540 (Calibrado via Kolmogorov-Smirnov)
    max_ks: float                     # 0.4019
    nivel_risco: str                  # "BAIXO" (<0.35), "MODERADO" (0.35-0.454), "ELEVADO" (0.454-0.65), "CRÍTICO" (>=0.65)
    parecer_governanca: str
    fatores_relevantes: List[ContributingFactor]
```

### 2.3 Esquema de Resposta de Clusterização: `ClusterResponseSchema`
```python
class ClusterResponseSchema(BaseModel):
    cluster_id: int                  # 1, 2 ou 3 (ou 0 conforme representação interna)
    cluster_nome: str                # ex: "Cluster 1: Operacional / Menor Complexidade"
    segmento_operacional: str        # "Operacional", "Intermediário Trienal" ou "Estratégico Alta Complexidade"
    proporcao_carteira: str          # "28,8%", "47,3%" ou "23,9%"
    mediana_valor_brl: float
    duracao_media_dias: float
    taxa_observada_aditivos: float   # ex: 0.442, 0.549 ou 0.839
    descricao_perfil: str
    diretriz_governanca: str
```

---

## 3. Endpoints RESTful Homologados

### 3.1 `POST /api/predict`
- **Finalidade:** Inferência probabilística com Random Forest Abordagem 4 e ponto de corte ótimo $t^* = 0,4540$.
- **Payload:** `ContractInputSchema`.
- **Retorno (`200 OK`):** `PredictionResponseSchema`.

### 3.2 `POST /api/predict-cluster`
- **Finalidade:** Diagnóstico de perfil ex-ante via K-Means Cenário 1 com normalização `MinMaxScaler`.
- **Payload:** `ContractInputSchema` (utiliza `Valor_Original`, `duracao_planejada_dias`, `Capital_Social_Receita` e `qtd_cont_5a_forn`).
- **Retorno (`200 OK`):** `ClusterResponseSchema`.

### 3.3 `GET /api/metrics`
- **Finalidade:** Relatório acadêmico completo com métricas nas 3 partições e Matriz de Confusão 2x2 do teste cego.
- **Retorno (`200 OK`):**
  ```json
  {
    "modelo_campeao": "Random Forest Classifier (Abordagem 4)",
    "criterio_calibracao": "Max Kolmogorov-Smirnov (Validação)",
    "limiar_ks": 0.4540,
    "max_ks": 0.4019,
    "particao_teste": {
      "amostras": 1158,
      "recall_sensibilidade": 0.7612,
      "precisao": 0.7500,
      "f1_score": 0.7556,
      "roc_auc": 0.7652,
      "especificidade": 0.6653,
      "acuracia": 0.7150,
      "matriz_confusao": {
        "VP": 517,
        "VN": 312,
        "FP": 167,
        "FN": 162
      }
    },
    "particao_validacao": {
      "amostras": 1158,
      "recall_sensibilidade": 0.7548,
      "precisao": 0.7471,
      "f1_score": 0.7509,
      "roc_auc": 0.7587,
      "acuracia": 0.7090
    },
    "particao_treino": {
      "amostras": 3471,
      "recall_sensibilidade": 0.7916,
      "precisao": 0.7920,
      "f1_score": 0.7918,
      "roc_auc": 0.8371,
      "acuracia": 0.7554
    }
  }
  ```

### 3.4 `GET /api/cluster-report`
- **Finalidade:** Retorna as estatísticas descritivas percentílicas, diagnósticos de Silhueta ($0,6082$), Davies-Bouldin ($0,5223$) e diretrizes dos 3 clusters.

### 3.5 `GET /api/feature-importance`
- **Finalidade:** Importância dos preditores da Abordagem 4 calculados por Permutação e Gini.

### 3.6 `GET /api/contract-options`
- **Finalidade:** Domínios de valores para popular os campos do formulário no frontend (ex.: opções de `Porte_Empresa` e `tipo_ult_adit`).

### 3.7 `GET /health`
- **Finalidade:** Status do servidor e verificação do carregamento dos artefatos `rf_ab4_model.joblib` e `cluster_cenario1_minmax.joblib`.

---

## 4. Endpoints Excluídos

- ❌ `POST /api/predict-value` — **Descontinuado e Excluído:** O projeto não processa inferência de regressão para valores financeiros aditivados.

