# Especificação do Frontend — Interface Web em React (Pipeline Geisiane)

**Versão da UI:** `v3.0.0` (Alinhada ao Pacote de Machine Learning da Geisiane)  
**Tecnologia:** React 19+ com Vite  
**Estilização:** Vanilla CSS Moderno (Design Tokens, Glassmorphism, Variáveis CSS, Dark Theme)  
**Localização:** `frontend/`  
**Escopo Metodológico:** Classificação Supervisionada (`fl_aditivo` via Random Forest Abordagem 4 com limiar Max KS) e Clusterização Não Supervisionada (K-Means Cenário 1 MinMaxScaler, $K=3$). Tarefa de regressão expressamente descontinuada.  

---

## 1. Diretrizes de Design e Experiência do Usuário (UX/UI)

1. **Estética Profissional e de Inteligência Corporativa:**
   - Visual moderno e corporativo, compatível com a governança da Petrobras e o rigor acadêmico do Prof. Dr. Ronaldo Martins da Costa (UFG).
   - Tipografia moderna (Inter / Outfit) para números, métricas estatísticas e percentis.
   - Paleta de cores funcional e semafórica:
     - Fundo e Estrutura: Azul Petróleo profundo e Grafite (`#0b1329`, `#111d38`, `#1e293b`).
     - Alerta / Risco Crítico: Coral e Âmbar vivo (`#ef4444`, `#f59e0b`).
     - Sucesso / Risco Baixo: Esmeralda corporativo (`#10b981`).
     - Destaque Analítico e Institucional: Dourado e Ciano tecnológico (`#06b6d4`, `#38bdf8`).
2. **Design Responsivo e Dinâmico:**
   - Grid modular com suporte a monitores Ultrawide, notebooks e tablets.
   - Microinterações em tempo real com debounce para recomputar inferências do modelo conforme o usuário ajusta sliders e inputs.

---

## 2. Estrutura de Telas e Navegação por Abas (`v3.0.0`)

A interface organiza-se em 6 abas analíticas, focadas exclusivamente na arquitetura dual:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             NAVBAR PRINCIPAL                                │
│ [Simulador Operacional] [Classificação & KS] [Matriz de Confusão]           │
│ [Clusterização K-Means] [Fatores Determinantes] [Governança LGPD]          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1. Simulador Operacional (Abordagem 4 em $T_0$)
- **Formulário com os 8 Preditores Centrais:**
  - `Valor_Original` (Input monetário em R$ com atalhos: R$ 500k, R$ 2,5 mi, R$ 10 mi, R$ 50 mi).
  - `duracao_planejada_dias` (Slider em dias com indicação em meses/anos: 180 dias, 365 dias, 1.095 dias / 3 anos, 1.825 dias / 5 anos).
  - `Capital_Social_Receita` (Input monetário em R$).
  - `qtd_cont_5a_forn` (Contador de contratos nos 5 anos anteriores).
  - `tx_adit_geral_5a` (Slider de 0% a 100%, desabilitado e zerado se `qtd_cont_5a_forn == 0`).
  - Badge automático: `fl_sem_historico_5a` ativo quando `qtd_cont_5a_forn == 0`.
  - `Porte_Empresa` (Select: DEMAIS, EPP, ME, Não Informado).
  - `tipo_ult_adit` (Select: PRAZO, VALOR, PRAZO E VALOR, SEM HISTORICO).
- **Botões de Presets Rápidos:**
  - *"Megaprojeto Estratégico"* (R$ 50 Mi, 1.800 dias, alta taxa histórica).
  - *"Contrato Trienal Padrão"* (R$ 2,8 Mi, 1.095 dias, histórico médio).
  - *"Serviço Operacional Rápido"* (R$ 800 mil, 360 dias, baixo histórico).
  - *"Novo Fornecedor (Sem Histórico)"* (R$ 1,5 Mi, 720 dias, 0 contratos em 5a).
- **Indicador Circular SVG (Risk Gauge):**
  - Mostrador de probabilidade (0% a 100%) com marcação visual do **limiar de corte Max KS ($0,4540$)**.
  - Faixas de risco: BAIXO ($<35\%$), MODERADO ($35\% - 45,4\%$), ELEVADO ($45,4\% - 65\%$), CRÍTICO ($\ge 65\%$).
- **Card de Diagnóstico de Cluster (MinMaxScaler):**
  - Destaque visual imediato: Cluster 1 (Operacional), Cluster 3/0 (Trienal) ou Cluster 2 (Estratégico Alta Complexidade).
  - Exibição da mediana histórica de valor e duração típica do cluster correspondente.

### 2. Modelos de Classificação & Curvas de Discriminação
- **Destaque do Random Forest Abordagem 4:** Parâmetros homologados (`n_estimators=100`, `max_depth=12`, `balanced`).
- **Tabela Comparativa das 3 Partições Estratificadas:** Treino (60%), Validação (20%) e Teste Cego Independente (20%).
- **Gráficos Integrados de Avaliação Global (`classificacao_graficos/`):**
  - `2_curva_roc_teste.png`: Curva ROC no teste independente ($AUC = 0,7652$), atestando separação nítida frente à diagonal aleatória.
  - `3_curva_precision_recall_teste.png`: Curva Precision-Recall evidenciando sustentação de 75,00% de precisão no ponto ótimo KS.
  - *Responsividade:* Containers fluidos com `aspect-ratio: 16/10`, `max-height: 380px`, `object-fit: contain` e ação de expansão em tela cheia (`🔍 Expandir`).

### 3. Matriz de Confusão Interativa & Calibração KS (Teste Cego $N = 1.158$)
- **Matriz 2x2 com Células Detalhadas:**
  - $VP = 517$ | $VN = 312$ | $FP = 167$ | $FN = 162$.
- **Gráficos Integrados de Calibração (`classificacao_graficos/`):**
  - `1_curva_ks_otimizacao.png`: Curva de Otimização Kolmogorov-Smirnov na partição de validação demonstrando a maximização de $TPR - FPR = 0,4019$ no limiar $0,4540$.
  - `4_matriz_confusao_teste.png`: Heatmap original de scikit-learn com contagens absolutas e proporções normalizadas da amostra cega.
  - *Critério de Não Redundância:* As curvas ROC e P-R permanecem exclusivamente na aba de Modelos, evitando sobreposição e poluição visual.

### 4. Clusterização K-Means (Cenário 1 MinMaxScaler, $K=3$)
- **Painel dos 3 Arquétipos de Negócio:**
  - *Cluster 1 — Operacional / Menor Complexidade* (28,8% da carteira, R$ 2,07 mi mediana, taxa de aditivos observada 44,2%).
  - *Cluster 0 — Intermediário / Trienais Padrão* (47,3% da carteira, R$ 2,85 mi mediana, taxa de aditivos observada 54,9%).
  - *Cluster 2 — Longa Duração e Megacontratos* (23,9% da carteira, R$ 7,70 mi mediana, taxa de aditivos observada 83,9%).
- **Gráficos Integrados de Agrupamento (`src/cluster_graficos/`):**
  - `scatter_clusters_pca2d.png`: Dispersão geométrica dos 3 grupos no plano das 2 componentes principais.
  - `metricas_escolha_k_cenario1.png`: Curva do Método do Cotovelo com inflexão acentuada de inércia em $K=3$.

### 5. Fatores Determinantes (Feature Importance)
- **Tabela de Impacto das 8 Variáveis:** Barras proporcionais de relevância em $T_0$.
- **Gráfico Oficial Integrado (`classificacao_graficos/`):**
  - `5_feature_importance.png`: Gráfico gerado por scikit-learn comparando **Permutation Feature Importance** (queda de desempenho sob embaralhamento) contra **MDI Gini Impurity** nas 100 árvores.
  - Exibição com zoom modal/expandido e adaptação fluida à largura da janela.

### 6. Governança & LGPD
- Painel de transparência evidenciando:
  - Anonimização de identificadores de pessoas físicas (MEIs e prepostos).
  - Regra de ajuste de vigência futura e apuração retroativa dinâmica em $T_0$.
  - Conformidade à Lei 13.709/2018 (LGPD) e à Lei 13.303/2016 (Lei das Estatais).

---

## 3. Arquitetura de Componentes React

```
frontend/src/
├── components/
│   ├── Header.jsx                # Cabeçalho corporativo com selos Petrobras/UFG
│   ├── ContractSimulator.jsx     # Simulador com 8 preditores da Abordagem 4
│   ├── RiskGauge.jsx             # Medidor circular em SVG com corte KS (0,4540)
│   ├── ClusterBadgeCard.jsx      # Diagnóstico rápido do cluster do contrato
│   ├── ModelsComparison.jsx      # Quadro das 3 partições e curvas ROC/KS
│   ├── ConfusionMatrixCard.jsx   # Matriz 2x2 do teste cego com cards explicativos
│   ├── ClusteringView.jsx        # Painel do K-Means (Perfis, Percentis, Silhueta)
│   ├── FeatureImportanceView.jsx # Gráficos de relevância dos 8 preditores
│   └── GovernanceLGPDView.jsx    # Painel de conformidade LGPD e integridade T0
├── App.jsx                       # Orquestrador das abas de navegação
├── App.css                       # Estilização modular com glassmorphism e design tokens
├── index.css                     # Variáveis globais, tipografia e reset
└── main.jsx                      # Entrada da aplicação React
```

---

## 4. Integração HTTP com a API Backend

- **Base URL:** `http://127.0.0.1:8000`
- **Chamadas Reativas:**
  - `POST /api/predict`: Chamado com debounce no ajuste dos inputs do simulador.
  - `POST /api/predict-cluster`: Chamado em paralelo para enquadramento instantâneo no perfil K-Means.
  - `GET /api/metrics`: Carrega métricas das 3 partições e dados da matriz de confusão.
  - `GET /api/cluster-report`: Carrega descritivos percentílicos dos 3 clusters.
  - `GET /api/feature-importance`: Carrega os coeficientes de relevância.

