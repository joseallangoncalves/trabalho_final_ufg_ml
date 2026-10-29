# Petrobras ML — Sistema de Predição e Análise de Aditivos Contratuais

> **Projeto de Aprendizado de Máquina**  
> **Instituição:** Universidade Federal de Goiás (UFG) — Instituto de Informática (INF)  
> **Disciplina:** Aprendizado de Máquina  
> **Docente:** Prof. Dr. Ronaldo Martins da Costa  
> **Versão:** `v3.0.0` (Escopo Dual: Random Forest Abordagem 4 + K-Means Cenário 1 MinMaxScaler, sem Regressão)  
> **Status:** 🟢 100% Concluído, Integrado e Validado  

---

## 📋 Visão Geral

Este projeto desenvolve uma solução completa de Machine Learning aplicada à gestão de contratações públicas e privadas da Petrobras (amparadas pela Lei das Estatais — Lei nº 13.303/2016), com base no dataset histórico `dados/abt_modelagem_aditivos.csv` (5.787 contratos finalizados).

Em estrita consonância com o trabalho de modelagem de **Geisiane** e a **especificação `v3.0.0`** ([specs/plano_implementacao.md](file:///c:/Users/User/Documents/GitHub/ronaldo_geizi_ml/specs/plano_implementacao.md)), o sistema estrutura-se em **dois pilares centrais**:
1. **Classificação Supervisionada (`fl_aditivo`):** Predição de probabilidade e risco de aditamento em $T_0$ com **Random Forest sob a Abordagem 4** (8 preditores, eliminação de colinearidade) calibrado no ponto de corte de **Máximo Kolmogorov-Smirnov (Max KS = 0,4019, limiar = 0,4540 / 0,4480)**.
2. **Clusterização Não Supervisionada (K-Means Cenário 1 com MinMaxScaler, $K=3$):** Segmentação de comportamento e enquadramento ex-ante em 3 arquétipos (Trienal Padrão 47,3%, Curto/Operacional 28,8%, Longa Duração/Megacontratos 23,9%).

*(A tarefa de regressão contínua de valores financeiros aditivados foi formalmente excluída do escopo por diretriz arquitetural).*

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DASHBOARD WEB REACT (Vite)                         │
│  • Simulador de Contratos em T₀ (8 Preditores e Enquadramento Dual)         │
│  • Pilar 1: Classificação Supervisionada (RF Abordagem 4 & Curvas KS)       │
│  • Pilar 2: Agrupamento K-Means Cenário 1 (MinMaxScaler, 3 Arquétipos)      │
│  • Matriz de Confusão 2x2 Cega (VP=517, VN=312, FP=167, FN=162)            │
│  • Feature Importance dos 8 Preditores & Painel LGPD / Guardrails           │
└──────────────────────────────────────▲──────────────────────────────────────┘
                                       │ HTTP / JSON
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                            BACKEND FASTAPI (Python)                         │
│  • Endpoints RESTful de Inferência (/api/predict, /api/cluster, /health)    │
│  • Schemas Pydantic v2 com Validação Rigorosa e Blindagem Anti-Leakage      │
│  • Relatórios de Métricas (/api/metrics, /api/cluster-report)               │
└──────────────────────────────────────▲──────────────────────────────────────┘
                                       │ Carregamento .joblib
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                       PIPELINES SCIKIT-LEARN & MODELOS                      │
│  • RF Abordagem 4 (ColumnTransformer, MedianImputer, OneHotEncoder)         │
│  • K-Means Cenário 1 com MinMaxScaler no hipercubo unitário [0, 1]⁴         │
│  • Split Estratificado 60/20/20 (3.471 Treino, 1.158 Validação, 1.158 Teste)│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Síntese dos 2 Pilares Homologados (`v3.0.0`)

| Pilar Homologado | Algoritmo / Técnica | Variável / Objetivo | Desempenho no Teste Cego ($N=1.158$) | Aula do Prof. Ronaldo |
| :--- | :--- | :--- | :---: | :--- |
| **1. Classificação (Supervisionado)** | **Random Forest Classifier (Abordagem 4)** com Calibração Max KS ($0,4540$) | **`fl_aditivo`** (Prever se o contrato terá aditivo: 0 ou 1) | **Recall: 76,12%**<br>Precisão: 75,00%<br>F1-Score: 0,7556<br>ROC-AUC: 0,7652<br>Acurácia: 71,50% | **Aula 2** (Treinamento e Métricas)<br>**Aula 3** (Árvores e Ensembles) |
| **2. Agrupamento (Não Supervisionado)** | **K-Means Cenário 1 com MinMaxScaler** ($K=3$) | Segmentação de comportamento contratual em $T_0$ (4 preditores) | **3 Clusters Equilibrados**<br>Cluster 0: 47,3% (54,87% aditivos)<br>Cluster 1: 28,8% (44,15% aditivos)<br>Cluster 2: 23,9% (83,92% aditivos) | **Aula 4.1** (Não Supervisionados, Normalização e Cotovelo) |

---

## 🛡️ Guardrails, LGPD e Anti-Leakage

1. **Conformidade Estrita com a LGPD (Lei nº 13.709/2018):**
   - Eliminação mandatória de dados identificadores de pessoas físicas e jurídicas (`Fornecedor`, `CNPJ`, `Razao_Social_Receita`, representantes) para proteger empreendedores individuais (MEI) e prepostos.
2. **Protocolo Rígido Anti-Leakage (Momento $T_0$ da Assinatura):**
   - Uso exclusivo de dados pré-contratuais. Vedação total a variáveis pós-fato (saldos residuais contábeis, datas de aditivos e valores aditivados).
   - O ajuste (`fit`) dos transformadores e do `MinMaxScaler` ocorre **apenas no conjunto de treino**, aplicando unicamente `transform()` nas demais partições.
3. **Calibração de Limiar via Máximo Kolmogorov-Smirnov (Max KS):**
   - Maximização da distância entre taxas de verdadeiros positivos e falsos positivos ($KS = 0,4019$), fixando o ponto de corte ótimo em $0,4540$ / $0,4480$ para priorizar a detecção precoce de contratos de alto risco.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Python 3.10+** (com `pip`)
- **Node.js 18+** e **npm**

---

### Passo 1: Executar o Treinamento e Escoragem CLI (`src/`)

```bash
# 1. Treinamento da Classificação Supervisionada (Random Forest Abordagem 4):
python src/training_random_forest_ab4.py

# 2. Treinamento do Agrupamento Não Supervisionado (K-Means Cenário 1 com MinMaxScaler):
python src/training_cluster_script.py

# 3. Escoragem em Lote de Risco de Aditivos (CSV ou Excel):
python src/score_random_forest_ab4.py -i dados/amostra_contratos_cluster.csv -o dados/contratos_escorados_risco.csv

# 4. Escoragem em Lote de Enquadramento em Clusters (CSV ou Excel):
python src/score_cluster_script.py -i dados/amostra_contratos_cluster.csv -o dados/contratos_escorados_clusters.csv
```

---

### Passo 2: Iniciar o Backend (FastAPI)

```bash
python -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
- **API URL:** `http://127.0.0.1:8000`
- **Swagger / OpenAPI:** `http://127.0.0.1:8000/docs`
- **Health Check:** `http://127.0.0.1:8000/health`
- **Relatório de Métricas:** `http://127.0.0.1:8000/api/metrics`
- **Relatório de Clusters:** `http://127.0.0.1:8000/api/cluster-report`

---

### Passo 3: Iniciar o Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```
- **Dashboard Web:** `http://localhost:5173/`

---

## 🌐 Funcionalidades do Dashboard Web (6 Abas Homologadas)

1. **🎯 Simulador de Risco:** Simulação de contratações em $T_0$ com os 8 preditores, presets de cenários típicos (*Megaprojeto de Engenharia*, *Trienal Padrão*, *Serviço Curto*, *Novo Fornecedor*), Risk Gauge com limiar KS e enquadramento instantâneo no K-Means.
2. **📊 Modelos (Classificação):** Comparativo metodológico de algoritmos (Random Forest Abordagem 4 campeão vs Abordagens 1-3, Baseline XGBoost, Árvore Gini, Regressão Logística e KNN).
3. **🔲 Matriz de Confusão & KS:** Matriz $2\times2$ observada no conjunto de teste cego ($N=1.158$) com $VP=517, VN=312, FP=167, FN=162$, tabela evolutiva nas 3 partições e justificativa do corte KS.
4. **🧩 Perfis (K-Means):** Painel interativo com os 3 clusters reais da base de modelagem (Cenário 1 com MinMaxScaler), caracterização de centróides e diretrizes contratuais de gestão.
5. **🔍 Fatores de Risco (8 Preditores):** Ranking de importância relativa das 8 variáveis em $T_0$ com fundamentação em blindagem temporal e ausência de colinearidade.
6. **🛡️ LGPD & Guardrails:** Certificação das regras de governança, minimização, anonimização e isolamento em $T_0$.

---

## 📁 Estrutura de Diretórios do Repositório

```
ronaldo_geizi_ml/
├── backend/
│   ├── main.py                     # Servidor FastAPI com rotas REST e CORS
│   ├── schemas.py                  # Modelos Pydantic v2 (8 preditores + compatibilidade)
│   ├── predictor.py                # Orquestrador de inferência dos 2 pilares
│   └── models/                     # Modelos serializados (.joblib) e metadados
├── dados/
│   ├── abt_modelagem_aditivos.csv       # Base analítica da Petrobras (5.787 contratos)
│   ├── amostra_contratos_cluster.csv    # Amostra de teste para validação de escoragem
│   ├── contratos_escorados_risco.csv    # Saída da escoragem de probabilidade (Supervisionado)
│   ├── contratos_escorados_clusters.csv # Saída da escoragem de agrupamento (K-Means)
│   └── dicionario_variaveis_e_filtros.md # Metadados e regras de negócio
├── frontend/
│   ├── src/
│   │   ├── components/             # Componentes React (Simulador, Gauge, Tabelas)
│   │   ├── App.jsx                 # Orquestrador do Dashboard (6 abas v3.0.0)
│   │   ├── App.css                 # Estilos visuais modernos e responsivos
│   │   └── index.css               # Design system e tokens de estilo
│   └── package.json
├── specs/                          # Pacote formal de especificações técnicas v3.0.0
│   ├── plano_implementacao.md      # Plano versionado (v3.0.0) com Changelog e Gantt
│   ├── especificacao_projeto.md    # Visão geral da arquitetura dual
│   ├── especificacao_classificacao_e_clusterizacao.md # Detalhamento dos 2 pilares
│   ├── relatorio_random_forest_abordagem4.md # Relatório técnico do classificador
│   ├── relatorio_clusterizacao_cenario1.md  # Relatório técnico do clusterizador
│   ├── especificacao_api.md        # Contratos da API FastAPI
│   ├── especificacao_frontend.md   # Especificação da UI React (6 abas)
│   ├── conformidade_lgpd_e_governanca.md # Protocolos de conformidade legal
│   ├── guardrails_prof_ronaldo.md  # Diretrizes acadêmicas das aulas UFG
│   └── README.md                   # Índice do pacote de documentação
├── src/                            # Scripts de Machine Learning e CLI
│   ├── training_random_forest_ab4.py # Treinamento do RF Abordagem 4
│   ├── training_cluster_script.py  # Treinamento do K-Means Cenário 1
│   ├── score_random_forest_ab4.py  # CLI de escoragem de classificação
│   └── score_cluster_script.py     # CLI de escoragem de clusterização
└── README.md                       # Documentação mestre do repositório
```

---

## 👥 Autoria e Apresentação
Desenvolvido para o **Projeto Aplicado (PA) / Disciplina de Aprendizado de Máquina**, Instituto de Informática (INF) — Universidade Federal de Goiás (UFG), sob orientação do Prof. Dr. Ronaldo Martins da Costa.
