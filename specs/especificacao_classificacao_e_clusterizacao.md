# Especificação Técnica — Classificação e Clusterização (Pipeline Geisiane)

> **Projeto:** Sistema de Predição e Análise de Contratos da Petrobras (Série 46)  
> **Instituição:** Universidade Federal de Goiás (UFG) — Instituto de Informática (INF)  
> **Disciplina:** Aprendizado de Máquina — Prof. Dr. Ronaldo Martins da Costa  
> **Versão da Especificação:** `v3.0.0` (Alinhada ao Pacote de Machine Learning da Geisiane)  
> **Status:** Vigente / Homologado  

---

## 1. Deliberação de Escopo e Justificativa Arquitetural

Esta especificação define o detalhamento técnico e metodológico da **arquitetura dual** concebida e validada por Geisiane, estruturada estritamente em **Classificação Supervisionada** e **Clusterização Não Supervisionada**, com a **exclusão definitiva de tarefas de Regressão**.

### 1.1 Racional de Exclusão da Regressão
1. **Mitigação de Ruído e Assimetria Extrema:** A modelagem contínua de montantes financeiros aditivados (`Valor_Aditivado_BRL`) em contratações públicas apresenta distribuição de cauda pesada (*Pareto-like*) com assimetria severa, decorrente de aditamentos atípicos e imprevistos de execução.
2. **Prioridade na Decisão em $T_0$:** No ato da celebração do contrato, as perguntas fundamentais para a governança e auditoria da Petrobras são:
   - **Risco de Aditamento:** Qual a probabilidade do contrato sofrer termo aditivo? — **Classificação Binária** (Random Forest Abordagem 4 com corte KS calibrado).
   - **Segmentação Estratégica:** A qual perfil histórico e porte operacional este contrato pertence? — **Clusterização** (K-Means Cenário 1 com MinMaxScaler, $K=3$).
3. **Conformidade com os Guardrails da Disciplina:** O arranjo atende de forma pragmática às Aulas 2, 3 e 4.1 do Prof. Dr. Ronaldo Martins da Costa.

---

## 2. Visão Geral da Arquitetura Dual Integrada

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   DASHBOARD WEB REACT (Vite + Vanilla CSS)                  │
│  • Simulador de Contratos em T₀ (8 Atributos da Abordagem 4)                │
│  • Pilar 1: Risk Gauge calibrado com Limiar KS (0,4540) & Matriz 2x2 Teste  │
│  • Pilar 2: Segmentação K-Means (MinMaxScaler, K=3), Radar e Dispersão 2D   │
│  • Diagnóstico de Importância (Permutação e Gini) & Painel Governança LGPD │
└──────────────────────────────────────▲──────────────────────────────────────┘
                                       │ HTTP REST (JSON)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                            BACKEND FASTAPI (Python)                         │
│  • POST /api/predict          -> Inferência Random Forest Abordagem 4       │
│  • POST /api/predict-cluster  -> Atribuição de Cluster K-Means Cenário 1    │
│  • GET  /api/metrics          -> Métricas das 3 Partições (Treino, Val, Test)│
│  • GET  /api/cluster-report   -> Estatísticas dos 3 Perfis e Percentis      │
│  • GET  /api/feature-importance & GET /api/contract-options                 │
└──────────────────────────────────────▲──────────────────────────────────────┘
                                       │ Carregamento .joblib
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                   ARTEFATOS E PIPELINES DO PACOTE GEISIANE                  │
│  • rf_ab4_model.joblib            (Classificador Random Forest Abordagem 4) │
│  • cluster_cenario1_minmax.joblib (Scaler MinMaxScaler + K-Means K=3)       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Pilar 1: Classificação Supervisionada (`fl_aditivo`) — Abordagem 4

### 3.1 Definição do Problema e Target
- **Alvo (`Target`):** `fl_aditivo` $\in \{0, 1\}$.
  - `1`: Contrato com ao menos um termo aditivo de prazo e/ou valor (58,72% da base).
  - `0`: Contrato executado sem qualquer termo aditivo (41,28% da base).
- **Momento Temporal ($T_0$):** Dados pré-contratuais conhecidos no ato da contratação. Nenhuma variável posterior à assinatura alimenta o modelo.

### 3.2 Racional e Preditores da Abordagem 4
Ao contrário de formulações iniciais que utilizavam taxas e contagens específicas e fragmentadas de aditivos de prazo, valor e prazo+valor (gerando colinearidade e dispersão estocástica), a **Abordagem 4** remove essas 6 variáveis ruidosas:
- **Variáveis Excluídas:** `tx_adit_prazo_5a`, `tx_adit_pv_5a`, `tx_adit_val_5a`, `qtd_adit_prazo_5a`, `qtd_adit_pv_5a`, `qtd_adit_val_5a`.
- **Conjunto Consolidado de 8 Preditores:**
  1. `Valor_Original` (Numérica): Montante inicial acordado em Reais (R$).
  2. `duracao_planejada_dias` (Numérica): Prazo original estipulado em dias corridos.
  3. `Capital_Social_Receita` (Numérica): Capacidade patrimonial da empresa perante a Receita Federal (R$).
  4. `qtd_cont_5a_forn` (Numérica): Quantidade de contratos concluídos pelo fornecedor nos 5 anos anteriores.
  5. `tx_adit_geral_5a` (Numérica): Taxa geral histórica de aditivos do fornecedor na janela de 5 anos.
  6. `fl_sem_historico_5a` (Numérica binária): Indicador de fornecedor novo sem histórico nos 5 anos ($1$ se `qtd_cont_5a_forn == 0`, senão $0$).
  7. `Porte_Empresa` (Categórica): Porte fiscal (DEMAIS, EPP, ME, Não Informado).
  8. `tipo_ult_adit` (Categórica): Tipo do último aditivo pretérito (PRAZO, VALOR, PRAZO E VALOR, SEM HISTORICO).

### 3.3 Pipeline de Pré-processamento
```python
preprocessor = ColumnTransformer(transformers=[
    ("num", Pipeline([
        ("imputer", SimpleImputer(strategy="median"))
        # Preserva escala original para o Random Forest
    ]), [
        "Valor_Original", "duracao_planejada_dias", "Capital_Social_Receita",
        "qtd_cont_5a_forn", "tx_adit_geral_5a", "fl_sem_historico_5a"
    ]),
    ("cat", Pipeline([
        ("imputer", SimpleImputer(strategy="constant", fill_value="SEM HISTORICO")),
        ("ohe", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ]), ["Porte_Empresa", "tipo_ult_adit"])
])
```

### 3.4 Configuração do Random Forest
- **Ensemble:** `RandomForestClassifier(n_estimators=100, max_depth=12, class_weight='balanced', random_state=42)`
- **Particionamento Estratificado:** 60% Treinamento (3.471), 20% Validação (1.158), 20% Teste Independente Cego (1.158).

### 3.5 Calibração de Limiar via Kolmogorov-Smirnov (Max KS)
A determinação do ponto de corte ótimo foi realizada na partição de validação identificando o ponto de máxima divergência entre verdadeiros positivos e falsos positivos:
$$KS = \max_{t} |TPR(t) - FPR(t)| = 0,4019 \implies t^* = 0,4540$$

### 3.6 Resultados Homologados nas 3 Partições

| Partição | Amostras | Limiar KS | Max KS | Acurácia | ROC-AUC | F1-Score | Recall (Sensibilidade) | Precisão | Especificidade |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Treinamento (60%)** | 3.471 | 0,4540 | 0,4019 | 75,54% | 0,8371 | 0,7918 | 79,16% | 79,20% | 70,34% |
| **Validação (20%)** | 1.158 | 0,4540 | 0,4019 | 70,90% | 0,7587 | 0,7509 | 75,48% | 74,71% | 65,48% |
| **Teste Cego (20%)** | 1.158 | 0,4540 | 0,4019 | **71,50%** | **0,7652** | **0,7556** | **76,12%** | **75,00%** | **66,53%** |

- **Matriz de Confusão no Teste Independente ($N = 1.158$):**
  - $VP = 517$ (Aditivos previstos com sucesso)
  - $VN = 312$ (Contratos sem aditivo confirmados)
  - $FP = 167$ (Falsos alarmes controlados)
  - $FN = 162$ (Contratos aditivados não detectados em $T_0$)

---

## 4. Pilar 2: Clusterização Não Supervisionada (K-Means Cenário 1, MinMaxScaler)

### 4.1 Objetivo e Princípio de Não Causalidade
Agrupar os contratos em perfis comportamentais ex-ante a partir de seus atributos contratuais e cadastrais conhecidos em $T_0$.
> [!IMPORTANT]
> Nenhuma variável de aditivo participou da formação dos centróides. A taxa observada de aditivos foi mensurada **a posteriori** exclusivamente como diagnóstico de risco de cada arquétipo.

### 4.2 Atributos de Agrupamento e MinMaxScaler
O escalonador `MinMaxScaler` comprime as 4 dimensões no hipercubo unitário $[0, 1]^4$, equalizando montantes financeiros bilionários com prazos em dias e experiência em número de contratos:
1. `Valor_Original` (expressão monetária inicial em R$).
2. `duracao_planejada_dias` (prazo inicial em dias corridos).
3. `Capital_Social_Receita` (capacidade patrimonial em R$).
4. `qtd_cont_5a_forn` (histórico de volume de contratos anteriores).

### 4.3 Diagnósticos de $K \in [2, 6]$ e Seleção de $K=3$
- **Inércia / Cotovelo (WCSS):** Ponto de inflexão nítido em $K=3$.
- **Coeficiente de Silhueta:** $0,6082$ (máxima estabilidade dimensional).
- **Índice Davies-Bouldin:** $0,5223$ (mínima sobreposição par-a-par).
- **Critério Calinski-Harabasz:** $9.753$ (alta razão de dispersão inter/intragrupos).

### 4.4 Taxonomia e Arquétipos Homologados ($K=3$)

| Segmento de Negócio | Cluster ID | Contratos | Proporção | Mediana Valor | Duração Média | Taxa Obs. Aditivos | Diretriz de Governança |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Operacional / Menor Complexidade** | Cluster 1 | 1.667 | 28,8% | R$ 2,07 mi | 562 dias (~1,5 ano) | **44,2%** | Contratos curtos e pontuais; menor exposição; gestão padrão de rotina. |
| **Intermediário / Trienais Padrão** | Cluster 3 (0) | 2.739 | 47,3% | R$ 2,85 mi | 1.101 dias (~3,0 anos) | **54,9%** | Maior contingente da carteira; contratos continuados padrão; acompanhamento regular com alertas a partir de 24 meses. |
| **Estratégico de Alta Complexidade** | Cluster 2 | 1.381 | 23,9% | R$ 7,70 mi | 1.641 dias (~4,5 anos) | **83,9%** | Megaprojetos e grandes concessões; altíssima materialidade; comitê gestor de mudanças e fiscalização intensiva. |

---

## 5. Contratos de Interface dos Serviços (FastAPI)

### 5.1 Endpoints Homologados
1. `POST /api/predict` — Inferência probabilística com Random Forest Abordagem 4 e limiar KS calibrado (0,4540).
2. `POST /api/predict-cluster` — Diagnóstico e atribuição ao cluster K-Means Cenário 1 (MinMaxScaler).
3. `GET /api/metrics` — Relatório de métricas das 3 partições (Treino, Validação e Teste) e Matriz de Confusão 2x2.
4. `GET /api/cluster-report` — Estatísticas descritivas completas por percentis dos 3 clusters.
5. `GET /api/feature-importance` — Importância dos preditores por Permutação e Gini.
6. `GET /api/contract-options` — Domínios categóricos e limites para validação na UI.
7. `GET /health` — Monitoramento de status da API e integridade dos arquivos `.joblib`.

### 5.2 Endpoints Excluídos
- ❌ `POST /api/predict-value` — Removido definitivamente do projeto (regressão suprimida).

---

## 6. Critérios de Homologação e Aceite

1. **Classificação Validada:** Random Forest Abordagem 4 com limiar Max KS ($0,4540$), Recall $\ge 76\%$ e Precisão $\ge 75\%$ no teste cego.
2. **Clusterização Validada:** K-Means Cenário 1 com MinMaxScaler e $K=3$, com Silhueta $> 0,60$ e perfis operacionais equilibrados.
3. **Serialização e Autonomia:** Artefatos `rf_ab4_model.joblib` e `cluster_cenario1_minmax.joblib` carregáveis de forma independente tanto por scripts CLI quanto pela API web.
4. **Isolamento $T_0$ e LGPD:** Blindagem comprovada contra vazamento de dados pós-fato e exclusão de identificadores de pessoas físicas.

