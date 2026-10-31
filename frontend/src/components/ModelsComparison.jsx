import React from 'react';

const MODELS_DATA = [
  {
    nome: 'Random Forest ⭐',
    campeao: true,
    familia: 'Ensemble de Árvores (Bagging)',
    recall: '75,00%',
    precisao: '76,12%',
    f1: '0,7556',
    especificidade: '66,53%',
    auc: '0,7652',
    acuracia: '71,50%',
    destaque: 'Modelo selecionado pelo melhor equilíbrio geral entre capacidade de antecipar aditivos, discriminação, F1-score e acurácia.',
  },
  {
    nome: 'XGBoost',
    campeao: false,
    familia: 'Gradient Boosting Sequencial',
    recall: '63,53%',
    precisao: '79,27%',
    f1: '0,7053',
    especificidade: '76,36%',
    auc: '0,7565',
    acuracia: '68,83%',
    destaque: 'Maior precisão e especificidade, mas menor Recall: deixa de antecipar uma parcela maior dos contratos com aditivo.',
  },
  {
    nome: 'Regressão Logística',
    campeao: false,
    familia: 'Modelo Linear Discriminativo',
    recall: '70,00%',
    precisao: '75,20%',
    f1: '0,7251',
    especificidade: '67,15%',
    auc: '0,7275',
    acuracia: '68,83%',
    destaque: 'Modelo linear de referência, com desempenho intermediário e menor capacidade de representar relações não lineares.',
  },
  {
    nome: 'KNN (k=5)',
    campeao: false,
    familia: 'Baseado em Distância Euclidiana',
    recall: '62,21%',
    precisao: '77,47%',
    f1: '0,6900',
    especificidade: '74,27%',
    auc: '0,7279',
    acuracia: '67,18%',
    destaque: 'Sensível à escala, à dimensionalidade e à codificação das variáveis categóricas.',
  },
  {
    nome: 'Árvore de Decisão Simples',
    campeao: false,
    familia: 'Árvore Individual (Critério Gini)',
    recall: '42,06%',
    precisao: '81,95%',
    f1: '0,5559',
    especificidade: '86,82%',
    auc: '0,7443',
    acuracia: '60,54%',
    destaque: 'Modelo conservador: acerta quando alerta, mas deixa de identificar muitos contratos que efetivamente tiveram aditivo. Adequado para interpretação, não para seleção final.',
  },
];

export default function ModelsComparison() {
  return (
    <div className="models-comparison-layout animate-fade-in">
      <div className="glass-panel section-card">
        {/* 1. Título da aba */}
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Comparativo Metodológico dos Algoritmos e Abordagens</h2>
            <p className="section-desc">
              Avaliação realizada com divisão estratificada da base em 60% para treinamento, 20% para validação e 20% para teste independente. As métricas abaixo correspondem ao conjunto de teste, com 1.158 contratos.
            </p>
          </div>
          <span className="badge badge-champion">Modelo selecionado: Random Forest — Abordagem 4</span>
        </div>

        {/* 2. Tabela comparativa dos modelos — Abordagem 4 */}
        <div style={{ marginTop: '20px' }}>
          <h3 className="card-subtitle" style={{ marginBottom: '12px' }}>
            Tabela Comparativa dos Modelos — Abordagem 4
          </h3>
          <div className="table-responsive">
            <table className="models-table">
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>Algoritmo / Arquitetura</th>
                  <th style={{ width: '10%' }}>Sensibilidade (Recall)</th>
                  <th style={{ width: '10%' }}>Precisão</th>
                  <th style={{ width: '9%' }}>F1-score</th>
                  <th style={{ width: '10%' }}>Especificidade</th>
                  <th style={{ width: '9%' }}>ROC-AUC</th>
                  <th style={{ width: '9%' }}>Acurácia</th>
                  <th style={{ width: '21%' }}>Diagnóstico técnico</th>
                </tr>
              </thead>
              <tbody>
                {MODELS_DATA.map((item, idx) => (
                  <tr key={idx} className={item.campeao ? 'row-champion' : ''}>
                    <td className="model-name-cell">
                      <div className="model-name-wrapper">
                        <span className="model-name">{item.nome}</span>
                        {item.campeao && <span className="trophy-tag">SELECIONADO</span>}
                      </div>
                      <span className="model-family">{item.familia}</span>
                    </td>
                    <td>
                      <span className={`metric-badge ${item.campeao ? 'highlight-metric' : ''}`}>
                        {item.recall}
                      </span>
                    </td>
                    <td><strong>{item.precisao}</strong></td>
                    <td><strong>{item.f1}</strong></td>
                    <td>{item.especificidade}</td>
                    <td>{item.auc}</td>
                    <td>{item.acuracia}</td>
                    <td className="model-desc-cell">{item.destaque}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Resumo da evolução das abordagens de variáveis */}
        <div style={{ marginTop: '36px' }}>
          <h3 className="card-subtitle" style={{ marginBottom: '16px' }}>
            Resumo da evolução das abordagens de variáveis
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div className="metric-kpi-card" style={{ padding: '16px' }}>
              <span className="kpi-label" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                Abordagem 1 — Zeros mantidos
              </span>
              <p className="kpi-meaning" style={{ marginTop: '8px', lineHeight: '1.45', fontSize: '0.84rem' }}>
                <strong>Configuração:</strong> 14 variáveis, incluindo taxas e quantidades específicas de aditivos por prazo, valor e prazo/valor. Para fornecedores sem histórico nos cinco anos anteriores, as taxas foram preenchidas com zero.
              </p>
              <p className="kpi-meaning" style={{ marginTop: '8px', lineHeight: '1.45', fontSize: '0.84rem', color: '#94a3b8' }}>
                <strong>Resultado:</strong> configuração mais detalhada, porém com maior redundância entre as variáveis históricas específicas.
              </p>
            </div>

            <div className="metric-kpi-card" style={{ padding: '16px' }}>
              <span className="kpi-label" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                Abordagem 2 — Taxas ausentes sem histórico
              </span>
              <p className="kpi-meaning" style={{ marginTop: '8px', lineHeight: '1.45', fontSize: '0.84rem' }}>
                <strong>Configuração:</strong> mesma estrutura da Abordagem 1, mas as taxas históricas foram mantidas como ausentes para fornecedores sem contratos anteriores no período de cinco anos.
              </p>
              <p className="kpi-meaning" style={{ marginTop: '8px', lineHeight: '1.45', fontSize: '0.84rem', color: '#94a3b8' }}>
                <strong>Resultado:</strong> permitiu avaliar se a ausência de histórico deveria ser tratada como informação distinta de uma taxa igual a zero. O desempenho permaneceu muito próximo ao da Abordagem 1.
              </p>
            </div>

            <div className="metric-kpi-card" style={{ padding: '16px' }}>
              <span className="kpi-label" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                Abordagem 3 — Apenas taxa geral
              </span>
              <p className="kpi-meaning" style={{ marginTop: '8px', lineHeight: '1.45', fontSize: '0.84rem' }}>
                <strong>Configuração:</strong> removeu as taxas específicas de aditivos por prazo, valor e prazo/valor, mantendo somente tx_adit_geral_5a e as quantidades específicas.
              </p>
              <p className="kpi-meaning" style={{ marginTop: '8px', lineHeight: '1.45', fontSize: '0.84rem', color: '#94a3b8' }}>
                <strong>Resultado:</strong> reduziu parcialmente a redundância das taxas históricas, preservando a medida consolidada de recorrência de aditivos.
              </p>
            </div>

            <div className="metric-kpi-card highlight-kpi" style={{ padding: '16px', borderColor: '#38bdf8' }}>
              <span className="kpi-label" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8' }}>
                Abordagem 4 — Configuração final parcimoniosa ⭐
              </span>
              <p className="kpi-meaning" style={{ marginTop: '8px', lineHeight: '1.45', fontSize: '0.84rem' }}>
                <strong>Configuração:</strong> removeu taxas e quantidades específicas de aditivos por prazo, valor e prazo/valor. Manteve as variáveis estruturais, qtd_cont_5a_forn, tx_adit_geral_5a, fl_sem_historico_5a, porte da empresa e tipo do último aditivo do fornecedor disponível antes do início da vigência.
              </p>
              <p className="kpi-meaning" style={{ marginTop: '8px', lineHeight: '1.45', fontSize: '0.84rem', color: '#e0f2fe' }}>
                <strong>Resultado:</strong> selecionada por reduzir a redundância entre preditores sem perda relevante de desempenho, favorecendo um modelo mais simples, estável e aplicável a novos contratos.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Conclusão metodológica */}
        <div className="callout-box" style={{ marginTop: '32px' }}>
          <div className="callout-icon">💡</div>
          <div>
            <h4 className="callout-title" style={{ fontSize: '1rem', marginBottom: '8px' }}>
              Conclusão metodológica
            </h4>
            <p className="callout-text" style={{ fontSize: '0.88rem', lineHeight: '1.55', marginBottom: '8px' }}>
              A Abordagem 4 foi adotada como especificação final por combinar menor complexidade e menor redundância das métricas históricas de aditivos.
            </p>
            <p className="callout-text" style={{ fontSize: '0.88rem', lineHeight: '1.55', marginBottom: '8px' }}>
              Entre os algoritmos testados nessa abordagem, o Random Forest foi selecionado como modelo final. Embora o XGBoost apresente maior precisão e especificidade, o Random Forest alcança maior sensibilidade (75,00% contra 63,53%), antecipando uma quantidade maior de contratos que efetivamente receberam aditivo.
            </p>
            <p className="callout-text" style={{ fontSize: '0.88rem', lineHeight: '1.55' }}>
              Para o objetivo preventivo da análise — identificar previamente contratos com maior chance de aditamento — essa maior capacidade de detecção torna o Random Forest a alternativa mais adequada.
            </p>
          </div>
        </div>

        {/* Curvas Diagnósticas do Teste Independente */}
        <div style={{ marginTop: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-subtitle" style={{ margin: 0 }}>📈 Curvas de Separação do Teste Independente (N = 1.158)</h3>
            <span className="badge badge-champion">ROC-AUC: 0,7652</span>
          </div>
          <p className="section-desc" style={{ marginTop: '6px' }}>
            O Random Forest — Abordagem 4 foi selecionado por apresentar o melhor equilíbrio geral no conjunto de teste independente. O modelo obteve Recall de 75,00%, Precisão de 76,12%, F1-score de 0,7556, ROC-AUC de 0,7652 e acurácia de 71,50%.
          </p>

          <div className="charts-gallery-grid">
            <div className="chart-card">
              <div className="chart-card-header">
                <span className="chart-card-title">Curva ROC (Receiver Operating Characteristic)</span>
                <span className="badge" style={{ backgroundColor: '#1e293b' }}>AUC = 0,7652</span>
              </div>
              <div className="chart-img-container">
                <img
                  src="/classificacao_graficos/2_curva_roc_teste.png"
                  alt="Curva ROC no Teste Independente"
                  className="chart-img"
                  loading="lazy"
                />
                <a
                  href="/classificacao_graficos/2_curva_roc_teste.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chart-zoom-btn"
                  title="Abrir imagem em tamanho real"
                >
                  🔍 Expandir
                </a>
              </div>
              <p className="chart-card-caption">
                Compara a taxa de acertos em aditivos (TPR) contra os falsos alarmes (FPR). Distancia-se substancialmente da diagonal aleatória (AUC 0,50).
              </p>
            </div>

            <div className="chart-card">
              <div className="chart-card-header">
                <span className="chart-card-title">Curva Precision-Recall (P-R)</span>
                <span className="badge" style={{ backgroundColor: '#1e293b' }}>Avg Prec = 0,75</span>
              </div>
              <div className="chart-img-container">
                <img
                  src="/classificacao_graficos/3_curva_precision_recall_teste.png"
                  alt="Curva Precision-Recall no Teste Independente"
                  className="chart-img"
                  loading="lazy"
                />
                <a
                  href="/classificacao_graficos/3_curva_precision_recall_teste.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chart-zoom-btn"
                  title="Abrir imagem em tamanho real"
                >
                  🔍 Expandir
                </a>
              </div>
              <p className="chart-card-caption">
                Mostra o comportamento conjunto entre precisão e sensibilidade ao longo dos diferentes limiares. No ponto operacional selecionado, o modelo alcança Recall de 75,00% e Precisão de 76,12%.
              </p>
            </div>
          </div>
        </div>

        {/* Quadro Análise */}
        <div className="callout-box" style={{ marginTop: '28px' }}>
          <div className="callout-icon">💡</div>
          <div>
            <h4 className="callout-title" style={{ fontSize: '1rem', marginBottom: '8px' }}>
              Análise
            </h4>
            <p className="callout-text" style={{ fontSize: '0.88rem', lineHeight: '1.55' }}>
              A escolha do modelo não se baseou apenas na acurácia. O Random Forest foi selecionado por apresentar o melhor equilíbrio entre Sensibilidade (Recall de 75,00%), Precisão (76,12%), F1-score (0,7556) e ROC-AUC (0,7652). Para a finalidade preventiva, o modelo permite antecipar aproximadamente três em cada quatro contratos que efetivamente tiveram aditivo, preservando precisão adequada para direcionar o monitoramento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
