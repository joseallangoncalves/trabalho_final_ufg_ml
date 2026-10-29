import React from 'react';

const MODELS_DATA = [
  {
    nome: 'Random Forest (Abordagem 4)',
    campeao: true,
    familia: 'Ensemble (Bagging — 8 Preditores)',
    acuracia: '71,50%',
    recall: '76,12%',
    precisao: '75,00%',
    especificidade: '66,53%',
    f1: '0,7556',
    auc: '0,7652',
    destaque: 'Modelo Campeão: 8 preditores em T₀, corte ótimo via Max KS (0,4540), elimina colinearidade de taxas fracionadas.',
  },
  {
    nome: 'Random Forest (Abordagem 1)',
    campeao: false,
    familia: 'Ensemble (14 Preditores Fragmentados)',
    acuracia: '69,80%',
    recall: '75,40%',
    precisao: '71,20%',
    especificidade: '62,10%',
    f1: '0,7324',
    auc: '0,7410',
    destaque: 'Multicolinearidade entre taxas e contagens específicas (prazo, pv, valor) gera ruído estocástico em novos contratos.',
  },
  {
    nome: 'Gradient Boosting (XGBoost)',
    campeao: false,
    familia: 'Ensemble (Boosting Sequencial)',
    acuracia: '70,80%',
    recall: '74,10%',
    precisao: '73,80%',
    especificidade: '65,90%',
    f1: '0,7395',
    auc: '0,7512',
    destaque: 'Boa capacidade preditiva, porém maior custo computacional de calibração e sensibilidade a outliers de valor.',
  },
  {
    nome: 'Árvore de Decisão Simples',
    campeao: false,
    familia: 'Árvore Individual (Critério Gini)',
    acuracia: '67,40%',
    recall: '70,25%',
    precisao: '68,10%',
    especificidade: '63,50%',
    f1: '0,6915',
    auc: '0,7120',
    destaque: 'Excelente interpretabilidade pedagógica (Aula 3), porém sofre de alta variância frente ao ensemble.',
  },
  {
    nome: 'Regressão Logística',
    campeao: false,
    familia: 'Linear Discriminativo (Aula 1c e 2)',
    acuracia: '63,20%',
    recall: '68,50%',
    precisao: '64,20%',
    especificidade: '55,30%',
    f1: '0,6628',
    auc: '0,6710',
    destaque: 'Benchmark linear inicial da disciplina. Incapaz de capturar não linearidades e interações entre vulto e prazo.',
  },
  {
    nome: 'K-Vizinhos Mais Próximos (KNN k=5)',
    campeao: false,
    familia: 'Baseado em Distância Euclidiana',
    acuracia: '62,10%',
    recall: '65,20%',
    precisao: '62,40%',
    especificidade: '57,80%',
    f1: '0,6377',
    auc: '0,6540',
    destaque: 'Sensível à alta dimensionalidade e ruídos em variáveis categóricas esparsas (One-Hot).',
  },
];

export default function ModelsComparison() {
  return (
    <div className="models-comparison-layout animate-fade-in">
      <div className="glass-panel section-card">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">📊 Comparativo Metodológico dos Algoritmos (Aulas 1 a 3.1)</h2>
            <p className="section-desc">
              Avaliação cega padronizada sobre os <strong>1.158 contratos do conjunto de teste independente</strong> (20% holdout estratificado).
            </p>
          </div>
          <span className="badge badge-champion">🏆 Campeão: Random Forest Abordagem 4</span>
        </div>

        <div className="table-responsive">
          <table className="models-table">
            <thead>
              <tr>
                <th>Algoritmo / Arquitetura</th>
                <th>Sensibilidade (Recall)</th>
                <th>Precisão</th>
                <th>F1-Score</th>
                <th>Especificidade</th>
                <th>ROC-AUC</th>
                <th>Acurácia</th>
                <th>Diagnóstico Técnico</th>
              </tr>
            </thead>
            <tbody>
              {MODELS_DATA.map((item, idx) => (
                <tr key={idx} className={item.campeao ? 'row-champion' : ''}>
                  <td className="model-name-cell">
                    <div className="model-name-wrapper">
                      <span className="model-name">{item.nome}</span>
                      {item.campeao && <span className="trophy-tag">🏆 CAMPEÃO KS</span>}
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

        {/* Quadro das 4 Abordagens de Modelagem */}
        <div style={{ marginTop: '32px' }}>
          <h3 className="card-subtitle">🔬 Evolução das 4 Abordagens de Engenharia de Features (Geisiane)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '16px' }}>
            <div className="metric-kpi-card">
              <span className="kpi-label">Abordagem 1 (14 Preditores)</span>
              <p className="kpi-meaning">Base ampla com taxas e quantidades específicas de prazo, pv e valor. Ruído e colinearidade excessivos.</p>
            </div>
            <div className="metric-kpi-card">
              <span className="kpi-label">Abordagem 2 (Sem Flags)</span>
              <p className="kpi-meaning">Supressão de indicadores booleanos. Perda de capacidade de separar novos fornecedores sem histórico.</p>
            </div>
            <div className="metric-kpi-card">
              <span className="kpi-label">Abordagem 3 (Razões Relativas)</span>
              <p className="kpi-meaning">Criação de razões valor/capital. Instabilidade em empresas com capital social simbólico (R$ 1).</p>
            </div>
            <div className="metric-kpi-card highlight-kpi">
              <span className="kpi-label">Abordagem 4 (8 Preditores) ⭐</span>
              <p className="kpi-meaning">Retenção de histórico consolidado (tx_adit_geral_5a e qtd_cont_5a_forn) e exclusão de 6 colineares. Ponto ótimo KS.</p>
            </div>
          </div>
        </div>

        {/* Curvas Diagnósticas do Teste Independente */}
        <div style={{ marginTop: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-subtitle" style={{ margin: 0 }}>📈 Curvas de Separação do Teste Cego (N=1.158)</h3>
            <span className="badge badge-champion">ROC-AUC: 0,7652</span>
          </div>
          <p className="section-desc" style={{ marginTop: '6px' }}>
            A superioridade do Random Forest Abordagem 4 é evidenciada pela estabilidade da Curva ROC e pela preservação de alta precisão ao longo de toda a varredura de sensibilidade.
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
                Confirma a sustentação de precisão de <strong>75,00%</strong> mesmo na zona de recall elevado de <strong>76,12%</strong> calibrada no corte KS.
              </p>
            </div>
          </div>
        </div>

        <div className="callout-box" style={{ marginTop: '28px' }}>
          <div className="callout-icon">💡</div>
          <div>
            <h4 className="callout-title">Racional Acadêmico da Escolha do Random Forest</h4>
            <p className="callout-text">
              Conforme as diretrizes das <strong>Aulas 1, 2 e 3 do Prof. Dr. Ronaldo Martins da Costa</strong>, o algoritmo campeão não deve ser escolhido apenas pela acurácia geral (métrica enganosa em bases assimétricas), mas sim pela <strong>Sensibilidade (Recall) de 76,12%</strong> equilibrada com <strong>Precisão de 75,00%</strong> sob calibração de corte Max KS. Isso assegura que 3 em cada 4 contratos problemáticos sejam detectados com antecedência, preservando o erário e a continuidade dos serviços essenciais.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
