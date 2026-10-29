# Pacote de Especificações Técnicas — Projeto ML Petrobras (UFG)
**Pipeline Homologado de Machine Learning — Geisiane**

Este diretório reúne todas as especificações técnicas, metodológicas e operacionais do projeto de Machine Learning para a predição e análise de contratos da Petrobras (Série 46), estruturado formalmente sob o **escopo dual de Classificação Supervisionada (Random Forest Abordagem 4 com corte Max KS) e Clusterização Não Supervisionada (K-Means Cenário 1 com MinMaxScaler, $K=3$)**, com exclusão definitiva de Regressão.

---

## 📂 Índice do Pacote de Especificações (`v3.0.0`)

| Documento | Versão | Descrição |
| :--- | :---: | :--- |
| **[plano_implementacao.md](file:///c:/Users/User/Documents/GitHub/ronaldo_geizi_ml/specs/plano_implementacao.md)** | `v1.0.0` | **Plano Mestre de Implementação (Geisiane)**: Roteiro técnico passo a passo, inventário de scripts CLI, matriz de integração, alinhamentos do WhatsApp e critérios de homologação. |
| **[especificacao_projeto.md](file:///c:/Users/User/Documents/GitHub/ronaldo_geizi_ml/specs/especificacao_projeto.md)** | `v3.0.0` | **Especificação Técnica Geral**: Engenharia de atributos em $T_0$, split estratificado 60/20/20, síntese do Random Forest Abordagem 4 e do K-Means Cenário 1. |
| **[guardrails_prof_ronaldo.md](file:///c:/Users/User/Documents/GitHub/ronaldo_geizi_ml/specs/guardrails_prof_ronaldo.md)** | `v3.0.0` | **Guardrails Acadêmicos (Prof. Ronaldo)**: Alinhamento formal com as Aulas 1 a 4, calibração estatística via Kolmogorov-Smirnov, prioridade ao Recall e pureza ex-ante do K-Means com MinMaxScaler. |
| **[especificacao_classificacao_e_clusterizacao.md](file:///c:/Users/User/Documents/GitHub/ronaldo_geizi_ml/specs/especificacao_classificacao_e_clusterizacao.md)** | `v3.0.0` | **Especificação Central do Escopo Dual**: Detalhamento da Abordagem 4 (8 preditores consolidados), calibração Max KS ($0,4540$), diagnósticos de $K \in [2, 6]$ e os 3 arquétipos de negócio. |
| **[especificacao_api.md](file:///c:/Users/User/Documents/GitHub/ronaldo_geizi_ml/specs/especificacao_api.md)** | `v3.0.0` | **Especificação da API (FastAPI)**: Modelos Pydantic v2 (`ContractInputSchema`, `PredictionResponseSchema`, `ClusterResponseSchema`), endpoints REST e artefatos `.joblib`. |
| **[especificacao_frontend.md](file:///c:/Users/User/Documents/GitHub/ronaldo_geizi_ml/specs/especificacao_frontend.md)** | `v3.0.0` | **Especificação do Frontend (React)**: Arquitetura de 6 abas (Simulador com 8 preditores, Classificação & KS, Matriz 2x2 do teste cego, K-Means, Fatores Determinantes e LGPD). |
| **[conformidade_lgpd_e_governanca.md](file:///c:/Users/User/Documents/GitHub/ronaldo_geizi_ml/specs/conformidade_lgpd_e_governanca.md)** | `v3.0.0` | **Diretrizes de LGPD e Anti-Leakage**: Anonimização de MEIs e prepostos, janela retroativa dinâmica de 5 anos em $T_0$, ajuste de vigência futura e princípio de não causalidade. |
| **[trabalho.md](file:///c:/Users/User/Documents/GitHub/ronaldo_geizi_ml/specs/trabalho.md)** | — | **Enunciado de Referência**: Instruções originais da disciplina para fins de consulta histórica. |

---

## 🚀 Evolução das Versões

- **`v1.0.0` / `v1.0.1`**: Especificações iniciais, governança LGPD e blindagem anti-leakage preliminar.
- **`v1.1.0`**: Homologação preliminar de Classificação Supervisionada.
- **`v1.2.0`**: Inclusão exploratória dos 3 pilares incluindo regressão financeira contínua.
- **`v2.0.0`**: Reorientação de escopo: exclusão formal de regressão contínua.
- **`v3.0.0`**: **Consolidação Definitiva com o Pacote de Machine Learning da Geisiane (Atual)**:
  - **Pilar Supervisionado:** Adoção do **Random Forest sob a Abordagem 4** (exclusão das 6 variáveis específicas de aditivo fragmentadas, retendo 8 preditores robustos), partição 60/20/20 e calibração de ponto de corte ótimo via **Máximo Kolmogorov-Smirnov ($KS = 0,4019$, limiar $0,4540$)**, atingindo Recall de 76,12% e Precisão de 75,00% no teste independente.
  - **Pilar Não Supervisionado:** Adoção do **K-Means Cenário 1 com normalização MinMaxScaler ($K=3$)**, garantindo pureza ex-ante em $T_0$ com 4 dimensões (`Valor_Original`, `duracao_planejada_dias`, `Capital_Social_Receita`, `qtd_cont_5a_forn`) e 3 arquétipos operacionais perfeitamente balanceados (Operacional 28,8%, Trienal 47,3%, Estratégico 23,9%).
  - **Governança & Integração:** Atualização de todos os esquemas de API, contratos de dados, interface React e salvaguardas de LGPD / anti-leakage em $T_0$.

