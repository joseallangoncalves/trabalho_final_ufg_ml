import React from 'react';

export default function ConfusionMatrixCard() {
  const matrix = {
    VP: 510,
    VN: 318,
    FP: 160,
    FN: 170,
    total: 1158,
    limiarKS: 0.4540,
    maxKS: 0.4019,
  };

  const particoes = [
    { nome: 'Treinamento (60%)', n: 3471, acc: '75,54%', auc: '0,8371', f1: '0,7918', rec: '79,16%', prec: '79,20%', esp: '70,34%' },
    { nome: 'Validação (20%)', n: 1158, acc: '70,90%', auc: '0,7587', f1: '0,7509', rec: '75,48%', prec: '74,71%', esp: '65,48%' },
    { nome: 'Teste Independente (20%)', n: 1158, acc: '71,50%', auc: '0,7652', f1: '0,7556', rec: '75,00%', prec: '76,12%', esp: '66,53%' },
  ];

  return (
    <div className="confusion-matrix-layout animate-fade-in">
      <div className="glass-panel section-card">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">🔲 Matriz de Confusão e Seleção do Limiar por Máximo KS</h2>
            <p className="section-desc">
              Resultados sobre os 1.158 contratos do conjunto de teste independente (20% da base). O limiar 0,4540 foi definido no conjunto de validação pelo critério de Máximo KS e aplicado sem ajuste ao teste.
            </p>
          </div>
          <span className="badge badge-champion">Max KS = 0,4019 • Limiar = 0,4540</span>
        </div>

        <div className="matrix-grid-container">
          {/* Visual Grid 2x2 */}
          <div className="matrix-grid">
            <div className="matrix-header-col"></div>
            <div className="matrix-header-col">Previsão: ADITIVO (1)</div>
            <div className="matrix-header-col">Previsão: SEM ADITIVO (0)</div>

            <div className="matrix-header-row">Real: ADITIVO (1)</div>
            <div className="matrix-cell cell-vp">
              <span className="cell-tag">Verdadeiro Positivo (VP)</span>
              <span className="cell-number">{matrix.VP}</span>
            </div>
            <div className="matrix-cell cell-fn">
              <span className="cell-tag">Falso Negativo (FN)</span>
              <span className="cell-number">{matrix.FN}</span>
            </div>

            <div className="matrix-header-row">Real: SEM ADITIVO (0)</div>
            <div className="matrix-cell cell-fp">
              <span className="cell-tag">Falso Positivo (FP)</span>
              <span className="cell-number">{matrix.FP}</span>
            </div>
            <div className="matrix-cell cell-vn">
              <span className="cell-tag">Verdadeiro Negativo (VN)</span>
              <span className="cell-number">{matrix.VN}</span>
            </div>
          </div>

          {/* Cards de Métricas Derivadas */}
          <div className="metrics-cards-sidebar">
            <div className="metric-kpi-card highlight-kpi">
              <span className="kpi-label">Sensibilidade (Recall)</span>
              <span className="kpi-value">75,00%</span>
              <span className="kpi-formula">VP / (VP + FN) = 510 / 680</span>
              <p className="kpi-meaning">Capacidade do modelo de capturar contratos que sofreram aditamento.</p>
            </div>

            <div className="metric-kpi-card">
              <span className="kpi-label">Precisão (Precision)</span>
              <span className="kpi-value">76,12%</span>
              <span className="kpi-formula">VP / (VP + FP) = 510 / 670</span>
              <p className="kpi-meaning">Proporção de acertos quando o modelo emite alerta de aditivo.</p>
            </div>

            <div className="metric-kpi-card">
              <span className="kpi-label">F1-Score Equilibrado</span>
              <span className="kpi-value">0,7556</span>
              <span className="kpi-formula">2 * (Prec * Rec) / (Prec + Rec)</span>
              <p className="kpi-meaning">Média harmônica que equilibra cobertura e precisão decisória.</p>
            </div>

            <div className="metric-kpi-card">
              <span className="kpi-label">Especificidade</span>
              <span className="kpi-value">66,53%</span>
              <span className="kpi-formula">VN / (VN + FP) = 318 / 478</span>
              <p className="kpi-meaning">Identificação correta de contratos executados no escopo original.</p>
            </div>

            <div className="metric-kpi-card">
              <span className="kpi-label">Acurácia Geral</span>
              <span className="kpi-value">71,50%</span>
              <span className="kpi-formula">(VP + VN) / Total = 828 / 1158</span>
              <p className="kpi-meaning">Proporção total de acertos em todo o conjunto de teste independente.</p>
            </div>

            <div className="metric-kpi-card">
              <span className="kpi-label">Área sob a Curva (ROC-AUC)</span>
              <span className="kpi-value">0,7652</span>
              <span className="kpi-formula">Poder discriminativo global</span>
              <p className="kpi-meaning">Capacidade de ranqueamento de risco em todos os limiares.</p>
            </div>
          </div>
        </div>

        {/* Tabela de Evolução nas 3 Partições (Ausência de Overfitting) */}
        <div style={{ marginTop: '32px' }}>
          <h3 className="card-subtitle">📊 Estabilidade Metodológica nas 3 Partições (Split 60/20/20)</h3>
          <div className="table-responsive">
            <table className="models-table">
              <thead>
                <tr>
                  <th>Partição</th>
                  <th>Nº Contratos</th>
                  <th>Recall</th>
                  <th>Precisão</th>
                  <th>F1-Score</th>
                  <th>Especificidade</th>
                  <th>ROC-AUC</th>
                  <th>Acurácia</th>
                </tr>
              </thead>
              <tbody>
                {particoes.map((p, idx) => (
                  <tr key={idx} className={idx === 2 ? 'row-champion' : ''}>
                    <td><strong>{p.nome}</strong></td>
                    <td>{p.n}</td>
                    <td><span className="metric-badge highlight-metric">{p.rec}</span></td>
                    <td>{p.prec}</td>
                    <td><strong>{p.f1}</strong></td>
                    <td>{p.esp}</td>
                    <td>{p.auc}</td>
                    <td>{p.acc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: '10px', fontSize: '0.84rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
            A redução entre treinamento e validação é esperada na avaliação fora da amostra. A proximidade das métricas indica estabilidade da capacidade discriminativa do modelo em novos dados.
          </p>
        </div>

        {/* Diagnósticos Gráficos Oficiais: KS e Matriz de Confusão */}
        <div style={{ marginTop: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-subtitle" style={{ margin: 0 }}>📈 Diagnósticos Gráficos: Seleção do Limiar KS & Matriz de Confusão</h3>
            <span className="badge badge-champion">classificacao_graficos/</span>
          </div>
          <p className="section-desc" style={{ marginTop: '6px' }}>
            Gráficos gerados pelo script <code>training_random_forest_ab4.py</code> para seleção do ponto de corte Max KS e avaliação no conjunto de teste independente.
          </p>

          <div className="charts-gallery-grid">
            {/* Gráfico 1: Curva KS */}
            <div className="chart-card">
              <div className="chart-card-header">
                <span className="chart-card-title">1. Seleção do Limiar por Kolmogorov-Smirnov (Validação)</span>
                <span className="badge" style={{ backgroundColor: '#1e293b' }}>Limiar Selecionado: 0,4540</span>
              </div>
              <div className="chart-img-container">
                <img
                  src="/classificacao_graficos/1_curva_ks_otimizacao.png"
                  alt="Curva de Otimização Kolmogorov-Smirnov"
                  className="chart-img"
                  loading="lazy"
                />
                <a
                  href="/classificacao_graficos/1_curva_ks_otimizacao.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chart-zoom-btn"
                  title="Abrir imagem em tamanho real"
                >
                  🔍 Expandir
                </a>
              </div>
              <p className="chart-card-caption">
                O gráfico apresenta a seleção do limiar no conjunto de validação. O ponto de corte 0,4540 foi escolhido por maximizar a diferença entre a taxa de verdadeiros positivos (TPR) e a taxa de falsos positivos (FPR), resultando em Max KS de 0,4019. Esse limiar foi aplicado, sem novo ajuste, ao conjunto de teste independente.
              </p>
            </div>

            {/* Gráfico 2: Matriz de Confusão Heatmap */}
            <div className="chart-card">
              <div className="chart-card-header">
                <span className="chart-card-title">2. Matriz de Confusão (Teste Independente/holdout N=1.158)</span>
                <span className="badge" style={{ backgroundColor: '#1e293b' }}>Acurácia: 71,50%</span>
              </div>
              <div className="chart-img-container">
                <img
                  src="/classificacao_graficos/4_matriz_confusao_teste.png"
                  alt="Matriz de Confusão no Teste Independente"
                  className="chart-img"
                  loading="lazy"
                />
                <a
                  href="/classificacao_graficos/4_matriz_confusao_teste.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chart-zoom-btn"
                  title="Abrir imagem em tamanho real"
                >
                  🔍 Expandir
                </a>
              </div>
              <p className="chart-card-caption">
                No teste independente, o modelo identificou corretamente 510 contratos com aditivo e 318 contratos sem aditivo. Foram observados 170 falsos negativos, contratos com aditivo não antecipados, e 160 falsos positivos, contratos encaminhados ao monitoramento preventivo sem ocorrência posterior de aditivo.
              </p>
            </div>
          </div>
        </div>

        {/* Justificativa Metodológica Kolmogorov-Smirnov */}
        <div className="callout-box" style={{ marginTop: '28px' }}>
          <div className="callout-icon">📐</div>
          <div>
            <h4 className="callout-title">Critério de Seleção do Limiar por Máximo Kolmogorov-Smirnov (Max KS)</h4>
            <p className="callout-text">
              O limiar padrão de 0,50 nem sempre produz a melhor separação entre contratos com e sem aditivo. O critério de Máximo KS identifica, no conjunto de validação, o ponto em que a diferença entre a taxa de verdadeiros positivos e a taxa de falsos positivos é máxima. Para o Random Forest — Abordagem 4, o limiar selecionado foi 0,4540 (Max KS = 0,4019). Aplicado ao teste independente, resultou em Recall de 75,00%, Precisão de 76,12%, Especificidade de 66,53% e Acurácia de 71,50%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
