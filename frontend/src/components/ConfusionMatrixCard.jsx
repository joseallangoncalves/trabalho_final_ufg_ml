import React from 'react';

export default function ConfusionMatrixCard() {
  const matrix = {
    VP: 517,
    VN: 312,
    FP: 167,
    FN: 162,
    total: 1158,
    limiarKS: 0.4540,
    maxKS: 0.4019,
  };

  const particoes = [
    { nome: 'Treinamento (60%)', n: 3471, acc: '75,54%', auc: '0,8371', f1: '0,7918', rec: '79,16%', prec: '79,20%', esp: '70,34%' },
    { nome: 'Validação (20%)', n: 1158, acc: '70,90%', auc: '0,7587', f1: '0,7509', rec: '75,48%', prec: '74,71%', esp: '65,48%' },
    { nome: 'Teste Cego (20%)', n: 1158, acc: '71,50%', auc: '0,7652', f1: '0,7556', rec: '76,12%', prec: '75,00%', esp: '66,53%' },
  ];

  return (
    <div className="confusion-matrix-layout animate-fade-in">
      <div className="glass-panel section-card">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">🔲 Matriz de Confusão & Calibração Kolmogorov-Smirnov (Max KS)</h2>
            <p className="section-desc">
              Resultados sobre os <strong>1.158 contratos de teste cego</strong> (20% da base Petrobras nunca vistos no treino), operando sob o limiar calibrado por Max KS (<strong>0,4540</strong>).
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
              <span className="cell-desc">Aditivos detectados preventivamente em T₀</span>
            </div>
            <div className="matrix-cell cell-fn">
              <span className="cell-tag">Falso Negativo (FN)</span>
              <span className="cell-number">{matrix.FN}</span>
              <span className="cell-desc">Aditivos não antecipados (Minimizado pelo KS)</span>
            </div>

            <div className="matrix-header-row">Real: SEM ADITIVO (0)</div>
            <div className="matrix-cell cell-fp">
              <span className="cell-tag">Falso Positivo (FP)</span>
              <span className="cell-number">{matrix.FP}</span>
              <span className="cell-desc">Sem aditivo real, sob monitoramento preventivo</span>
            </div>
            <div className="matrix-cell cell-vn">
              <span className="cell-tag">Verdadeiro Negativo (VN)</span>
              <span className="cell-number">{matrix.VN}</span>
              <span className="cell-desc">Execuções regulares confirmadas</span>
            </div>
          </div>

          {/* Cards de Métricas Derivadas */}
          <div className="metrics-cards-sidebar">
            <div className="metric-kpi-card highlight-kpi">
              <span className="kpi-label">Sensibilidade (Recall)</span>
              <span className="kpi-value">76,12%</span>
              <span className="kpi-formula">VP / (VP + FN) = 517 / 679</span>
              <p className="kpi-meaning">Capacidade do modelo de capturar contratos que sofreram aditamento.</p>
            </div>

            <div className="metric-kpi-card">
              <span className="kpi-label">Precisão (Precision)</span>
              <span className="kpi-value">75,00%</span>
              <span className="kpi-formula">VP / (VP + FP) = 517 / 684</span>
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
              <span className="kpi-formula">VN / (VN + FP) = 312 / 479</span>
              <p className="kpi-meaning">Identificação correta de contratos executados no escopo original.</p>
            </div>

            <div className="metric-kpi-card">
              <span className="kpi-label">Acurácia Geral</span>
              <span className="kpi-value">71,50%</span>
              <span className="kpi-formula">(VP + VN) / Total = 829 / 1158</span>
              <p className="kpi-meaning">Proporção total de acertos em todo o conjunto de teste cego.</p>
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
        </div>

        {/* Diagnósticos Gráficos Oficiais: KS e Matriz de Confusão */}
        <div style={{ marginTop: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-subtitle" style={{ margin: 0 }}>📈 Diagnósticos Gráficos: Calibração KS & Matriz de Confusão</h3>
            <span className="badge badge-champion">classificacao_graficos/</span>
          </div>
          <p className="section-desc" style={{ marginTop: '6px' }}>
            Gráficos gerados pelo script <code>training_random_forest_ab4.py</code> para comprovação da calibração pelo corte Max KS e distribuição da amostra cega de teste.
          </p>

          <div className="charts-gallery-grid">
            {/* Gráfico 1: Curva KS */}
            <div className="chart-card">
              <div className="chart-card-header">
                <span className="chart-card-title">1. Curva de Otimização Kolmogorov-Smirnov (Validação)</span>
                <span className="badge" style={{ backgroundColor: '#1e293b' }}>Limiar Ótimo: 0,4540</span>
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
                Ponto de máxima separação estatística entre a taxa de verdadeiros positivos (TPR) e falsos positivos (FPR). O corte ótimo foi fixado em <strong>0,4540</strong> (Max KS = 0,4019), maximizando a cobertura preventiva.
              </p>
            </div>

            {/* Gráfico 2: Matriz de Confusão Heatmap */}
            <div className="chart-card">
              <div className="chart-card-header">
                <span className="chart-card-title">2. Matriz de Confusão Oficial (Teste Cego N=1.158)</span>
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
                Heatmap de contagens absolutas e proporções normalizadas do teste cego: <strong>517 Verdadeiros Positivos (76,1%)</strong> e <strong>312 Verdadeiros Negativos (66,5%)</strong> sob o corte calibrado.
              </p>
            </div>
          </div>
        </div>

        {/* Guardrail Teórico Kolmogorov-Smirnov */}
        <div className="callout-box" style={{ marginTop: '28px' }}>
          <div className="callout-icon">📐</div>
          <div>
            <h4 className="callout-title">Por que calibrar pelo Máximo Kolmogorov-Smirnov (Max KS)?</h4>
            <p className="callout-text">
              Em problemas de risco de crédito e governança contratual, o corte padrão ingênuo de 0,50 desconsidera o custo assimétrico entre deixar passar um contrato de alto risco (Falso Negativo) versus realizar auditoria preventiva em contrato regular (Falso Positivo). O método de <strong>Kolmogorov-Smirnov</strong> localiza o ponto onde a distância entre a distribuição acumulada de contratos com aditivo (TPR) e sem aditivo (FPR) é máxima ($KS = 0,4019$). Esse ponto ótimo ocorreu em <strong>0,4540</strong>, elevando o recall no teste cego para <strong>76,12%</strong> com precisão de <strong>75,00%</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
