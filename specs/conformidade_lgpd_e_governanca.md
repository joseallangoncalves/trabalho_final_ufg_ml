# Diretrizes de Conformidade com a LGPD e Governança de Dados
**Projeto de Machine Learning Petrobras (Série 46) — Geisiane**

**Legislação de Referência:** Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD), Lei das Estatais (Lei nº 13.303/2016) e Marco Legal das Startups (LC nº 182/2021)  
**Instituição:** Universidade Federal de Goiás (UFG) — Instituto de Informática (INF)  
**Disciplina:** Aprendizado de Máquina — Prof. Dr. Ronaldo Martins da Costa  
**Versão:** `v3.0.0` (Alinhada ao Pacote de Machine Learning da Geisiane)  
**Status:** Vigente / Homologado  

---

## 1. Princípios Fundamentais da LGPD Aplicados ao Projeto

Em estrita consonância com a Lei nº 13.709/2018 e as normas de transparência e integridade em compras públicas, o pipeline concebido por Geisiane fundamenta-se nos seguintes princípios:

| Princípio da LGPD (Art. 6º) | Implementação no Pipeline de Machine Learning da Geisiane |
| :--- | :--- |
| **Finalidade e Adequação** | Os dados de contratações públicas são utilizados unicamente para fins acadêmicos e auditoria preventiva de risco contratual em benefício da governança pública. |
| **Necessidade (Minimização)** | Utilização estrita dos 8 preditores consolidados na **Abordagem 4** e das 4 variáveis ex-ante no **K-Means Cenário 1**. Descarte sumário de quaisquer dados cadastrais supérfluos ou excessivos. |
| **Livre Acesso e Transparência** | Disponibilização de explicações sobre as variáveis preditoras (Permutation Importance e Gini) e métricas auditáveis em 3 partições independentes. |
| **Não Discriminação** | Vedação a qualquer inferência baseada em dados pessoais, origem ou atributos discriminatórios; a predição fundamenta-se puramente na capacidade patrimonial, complexidade operacional e histórico contratual. |
| **Segurança e Prevenção** | Descarte e mascaramento de identificadores de pessoas físicas (especialmente MEIs e prepostos com CPF na razão social ou CNPJ) antes de qualquer etapa de treinamento ou exposição pública. |

---

## 2. Tratamento de Dados Identificadores e Pessoais (LGPD)

Na base analítica consolidada (`dados/abt_modelagem_aditivos.csv`), foram aplicados filtros de higienização prévia para blindar a privacidade de pessoas naturais:

| Campo Original | Risco LGPD Identificado | Tratamento no Pipeline Geisiane |
| :--- | :--- | :--- |
| **`Fornecedor`** | Pode conter nome civil de pessoa física (MEI / empresário individual). | **Excluído definitivamente da modelagem e da exibição na interface.** |
| **`CNPJ` / `CNPJ_Basico`** | Em cadastros MEI, os dígitos centrais correspondem ao CPF do titular. | **Excluído do treinamento preditivo.** Caso exibido no simulador, aplicar máscara: `**.***.*** / 0001-**`. |
| **`Razao_Social_Receita`** | Nome oficial empresarial que frequentemente contém o nome próprio civil do sócio. | **Excluído do pipeline de modelagem.** |
| **`Qualificacao_Responsavel`** | Código do responsável legal. | Descartado para predição ou agregado estritamente sem vínculo a identificadores fiscais. |
| **`Objeto`** | Texto aberto com descrição dos serviços. | Higienizado e não utilizado como preditor direto para evitar citação incidental de fiscais ou prepostos. |

---

## 3. Protocolo Anti-Leakage (Prevenção Rígida de Vazamento de Informação em $T_0$)

O vazamento de dados pós-fato (*data leakage*) é uma infração metodológica severa que invalida a capacidade generalizadora do modelo em ambiente produtivo. O pipeline de Geisiane estabelece salvaguardas rigorosas no momento $T_0$ (celebração do contrato):

### 3.1 Linha do Tempo e Separação Temporal

```
    Data da Celebração Contratual (T0)              Execução / Término do Contrato (T1)
───────────────┬────────────────────────────────────────────┬───────────────────>
  AUTORIZADO (EX-ANTE):  │                         VEDADO (LEAKAGE PÓS-FATO):  │
  • Valor Original (R$)  │                         • Qtd_Aditivos_Total        │
  • Duração Planejada    │                         • Valores Aditivados (R$)   │
  • Capital Social RFB   │                         • Saldo Bruto Residual      │
  • Porte da Empresa     │                         • Saldo Inativo Contábil    │
  • Histórico Forn. (5a) │                         • Datas dos Termos Aditivos │
```

### 3.2 Regras Específicas de Engenharia de Dados Homologadas
1. **Ajuste de Vigência Futura:**
   Para contratos cujo encerramento contratual teórico cadastral ultrapassa a data de corte (`Fim_Vigencia > Data_Atual`), a vigência observada é truncada na data corrente, eliminando anomalias temporais no cálculo da duração observada.
2. **Janela Retroativa Dinâmica de 5 Anos em $T_0$:**
   A experiência anterior do fornecedor é apurada **estritamente nos 5 anos imediatamente anteriores** à celebração de cada contrato específico (`qtd_cont_5a_forn`, `tx_adit_geral_5a`), eliminando o risco de computar contratos futuros como histórico.
3. **Indicador Explícito de Novo Fornecedor (`fl_sem_historico_5a`):**
   Fornecedores sem histórico na janela de 5 anos recebem valor $1$ nessa *flag*, e sua taxa histórica de aditivos é fixada em $0.0$, eliminando imputações residuais ou arbitrárias.
4. **Isolamento de Pré-processamento (`ColumnTransformer`):**
   A imputação de medianas para preditores numéricos e a codificação *One-Hot* de atributos categóricos são ajustadas (`fit`) **estritamente sobre a partição de Treinamento (60%)**. As partições de validação e teste cego recebem unicamente `transform()`.

---

## 4. Governança da Clusterização Não Supervisionada (Cenário 1)

1. **Princípio de Não Causalidade:**
   A formação dos clusters K-Means baseia-se unicamente nas 4 dimensões ex-ante pactuadas em $T_0$ (`Valor_Original`, `duracao_planejada_dias`, `Capital_Social_Receita` e `qtd_cont_5a_forn`). Nenhuma variável de desfecho (`fl_aditivo`, `aditivo_SN` ou `tx_adit_geral_5a`) entra no cálculo das distâncias euclidianas.
2. **Avaliação a Posteriori:**
   A taxa observada de contratos aditivados em cada cluster (44,2% no Operacional, 54,9% no Trienal e 83,9% no Estratégico) é apurada após o modelo concluído, servindo como **diagnóstico de vulnerabilidade**, e não como viés de causalidade algorítmica.

