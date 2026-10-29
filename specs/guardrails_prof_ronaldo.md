# Guardrails Metodológicos e Conceituais — Prof. Dr. Ronaldo Martins da Costa (UFG)
**Pipeline Homologado da Geisiane (Random Forest Abordagem 4 & K-Means Cenário 1 MinMaxScaler)**

**Versão:** `v3.0.0`  
**Instituição:** Universidade Federal de Goiás (UFG) — Instituto de Informática (INF)  
**Disciplina:** Aprendizado de Máquina  
**Escopo do Projeto:** Classificação Supervisionada (`fl_aditivo`) e Clusterização Não Supervisionada (K-Means), com exclusão definitiva de Regressão.  

---

## 1. Alinhamento com o Material Didático das Aulas

O projeto atende com exatidão às convenções, bibliotecas e boas práticas apresentadas nas aulas do Prof. Dr. Ronaldo Martins da Costa (UFG / INF):

| Aula / Documento | Tópico Central | Guardrails Obrigatórios no Projeto Geisiane |
| :--- | :--- | :--- |
| **`am-aula-1a_-_Apresentacao.pdf`** | Visão Geral & Paradigmas | Separação conceitual estrita: Paradigma Supervisionado (Classificação Binária de Risco) e Não Supervisionado (Clusterização de Perfis Contratuais). Pipeline reproduzível, auditável e versionado. |
| **`am-aula-1b_-_Revisao.pdf`** | Python Científico | Vetorização via `NumPy` e `pandas`, tratamento analítico de matrizes e pré-processamento estruturado. |
| **`am-aula-2_-_Supervisionados_-_Treinamento.pdf`** | Metodologia de Treinamento & Métricas | • **Partição Estratificada 60/20/20**: 60% Treino (3.471), 20% Validação (1.158) para calibração, e 20% Teste Independente Cego (1.158).<br>• **Calibração de Limiar via Kolmogorov-Smirnov**: Maximização da separabilidade estatística $KS = \max(TPR - FPR) = 0,4019$, fixando o limiar de decisão ótimo em **$0,4540$**.<br>• **Matriz de Confusão 2x2**: Avaliação de $VP$, $VN$, $FP$ e $FN$ (com foco em minimizar Falsos Negativos, evitando contratos de risco desassistidos).<br>• **Métricas Completas**: Recall/Sensibilidade (76,12% no teste cego), Precisão (75,00%), F1-Score (0,7556), ROC-AUC (0,7652), Especificidade (66,53%) e Acurácia (71,50%). |
| **`am-aula-3_-_Supervisionados_-_Algoritmos.pdf`** | Algoritmos de Classificação & Avaliadores | • Seleção do **Random Forest Classifier** (`n_estimators=100`, `max_depth=12`, `class_weight='balanced'`).<br>• **Abordagem 4**: Eliminação de ruído e multicolinearidade pela remoção das 6 variáveis específicas de aditivo, mantendo 8 preditores consolidados.<br>• Diagnóstico por **Permutation Feature Importance** e impureza de Gini. |
| **`am-aula-4.1_-_Nao_Supervisionados.pdf`** | Clusterização & Diagnósticos | • **K-Means Cenário 1** com algoritmo `k-means++`.<br>• **Normalização Obrigatória via `MinMaxScaler`**: Equalização das ordens de grandeza monetárias (bilhões em R$) e temporais (dias e contagens) no hipercubo unitário $[0, 1]^4$.<br>• **Seleção Parcimoniosa de $K=3$**: Respaldada pelo Método do Cotovelo (Inércia $WCSS$), Coeficiente de Silhueta ($0,6082$), Davies-Bouldin ($0,5223$) e Calinski-Harabasz ($9.753$).<br>• **Princípio de Não Causalidade**: Variáveis de aditivo estritamente excluídas da formação geométrica dos clusters. A taxa observada de aditivos é apurada **apenas a posteriori** como medida de validação externa. |

> **Nota de Escopo:** Em consonância com a deliberação estratégica do projeto, a tarefa de regressão para estimativa contínua de montantes em reais foi suprimida, concentrando esforços na solidez da decisão probabilística binária e na segmentação ex-ante.

---

## 2. Regras Rígidas de Engenharia de Dados & Prevenção de Leakage ($T_0$)

1. **Isolamento Absoluto no Momento $T_0$:**
   - Para prever o risco no momento da celebração contratual, nenhuma informação posterior à assinatura pode alimentar os modelos.
   - **Variáveis Vedadas (Leakage):** `Saldo_Bruto`, `Saldo_Inativo`, contagem ou valores de aditivos ocorridos durante a execução, prazos finais postergados e datas de aditivos.
   - **Ajuste de Vigência Futura:** Para contratos cujo término teórico cadastral exceda a data de corte (`Fim_Vigencia > Data_Atual`), a vigência observada é truncada na data corrente.
   - **Janela Dinâmica de 5 Anos Retroativos:** O histórico do fornecedor é apurado estritamente nos 5 anos anteriores à celebração do contrato específico (`qtd_cont_5a_forn`, `tx_adit_geral_5a`), com indicador booleano `fl_sem_historico_5a = 1` para novos participantes.

2. **Isolamento de Pré-Processamento (`Pipeline` e `ColumnTransformer`):**
   - Na classificação supervisionada, a imputação de dados faltantes (mediana para numéricas, 'Nenhum' para categóricas) e a codificação `OneHotEncoder` são ajustadas (`fit`) **exclusivamente na partição de treinamento (60%)**.
   - As partições de validação e teste cego, bem como novos dados de inferência em produção, sofrem estritamente `transform()`.
   - Na clusterização, o `MinMaxScaler` opera sobre as 4 variáveis contínuas em $T_0$ (`Valor_Original`, `duracao_planejada_dias`, `Capital_Social_Receita`, `qtd_cont_5a_forn`), preservando a consistência geométrica.

---

## 3. Critérios de Avaliação e Limiar Ótimo (Aula 2)

A avaliação da classificação binária adota calibração estatística rigorosa:
- **Matriz de Confusão 2x2:**
  - $VP$ ($517$ no teste): Contrato com aditivo previsto corretamente como aditivado.
  - $VN$ ($312$ no teste): Contrato sem aditivo previsto corretamente como não aditivado.
  - $FP$ ($167$ no teste): Falsos alarmes controlados (custo gerenciável de acompanhamento adicional).
  - $FN$ ($162$ no teste): Falha em prever aditivo (**risco crítico de descontinuidade operacional ou insegurança orçamentária**).
- **Otimização por Kolmogorov-Smirnov:**
  $$KS = \max_{t} |TPR(t) - FPR(t)| = 0,4019 \implies t^* = 0,4540$$
  O limiar de $0,4540$ substitui o corte ingênuo de $0,50$, garantindo a máxima separação entre as funções de distribuição acumulada de contratos aditivados e não aditivados.
- **Equilíbrio Operacional:**
  - Recall: **76,12%** | Precisão: **75,00%** | F1-Score: **0,7556** | ROC-AUC: **0,7652**.
  - Esse equilíbrio impede a geração descontrolada de falsos positivos na rotina de suprimentos da Petrobras, mantendo elevada capacidade preditiva.

---

## 4. Guardrails da Clusterização K-Means (Aula 4.1)

1. **Justificativa Metodológica do MinMaxScaler:**
   A distância Euclidiana multidimensional em variáveis com escalas desproporcionais ($10^9$ em `Valor_Original` vs. $10^2$ em `duracao_planejada_dias`) tornaria a otimização unidimensional em torno do valor financeiro. O `MinMaxScaler` equaliza todas as 4 dimensões no intervalo $[0, 1]$, permitindo que a duração planejada e a maturidade histórica do fornecedor influenciem proporcionalmente os centróides.
2. **Cenário 1 — Pureza Ex-Ante:**
   Vedada a utilização de taxas de aditivo (`aditivo_SN` ou `tx_adit_geral_5a`) na determinação dos agrupamentos. O K-Means responde à pergunta: *"Quais os grupos naturais de contratações pactuadas em $T_0$?"*, e não *"Quais os contratos que tiveram aditivo?"*.
3. **Parcimônia de $K=3$ e Interpretação Operacional:**
   A escolha de 3 clusters é orientada pela utilidade gerencial e respaldada pelos diagnósticos:
   - **Cluster 1 (28,8%):** Operacional / Menor Complexidade (Mediana R$ 2,07 mi | Duração 562 dias | Taxa Aditivos 44,2%).
   - **Cluster 3 / 0 (47,3%):** Intermediário / Trienais Padrão (Mediana R$ 2,85 mi | Duração 1.101 dias | Taxa Aditivos 54,9%).
   - **Cluster 2 (23,9%):** Estratégico / Alta Complexidade (Mediana R$ 7,70 mi | Duração 1.641 dias | Taxa Aditivos 83,9%).

