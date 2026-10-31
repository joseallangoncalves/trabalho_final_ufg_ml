import React, { useState } from 'react';

export default function FeatureImportanceView() {
  const [activeTab, setActiveTab] = useState('teste'); // 'teste' ou 'treino'

  const imgGrafico = activeTab === 'teste'
    ? '/classificacao_graficos/permutation_importance_teste.png'
    : '/classificacao_graficos/permutation_importance_treino.png';
  const badgeLabel = activeTab === 'teste' ? '🧪 Teste Independente (N=1.158)' : '🏋️ Treinamento (N=3.472)';

  return (
    <div className="feature-importance-layout animate-fade-in">
      <div className="glass-panel section-card">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">🔍 Importância dos Preditores por Permutação (Permutation Importance)</h2>
            <p className="section-desc">
              Importâncias apuradas <strong>exclusivamente por Permutação Estocástica (Permutation Feature Importance)</strong> sob 10 repetições estocásticas avaliando a perda de ROC-AUC, comparando as partições de <strong>Treinamento</strong> e <strong>Teste Independente</strong>.
            </p>
          </div>
          <span className="badge badge-champion">{badgeLabel}</span>
        </div>

        {/* Abas de Navegação Treino / Teste */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', marginBottom: '24px' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'teste' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('teste')}
            style={{ padding: '10px 22px', fontSize: '0.94rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            🧪 Teste Independente (N=1.158)
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'treino' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('treino')}
            style={{ padding: '10px 22px', fontSize: '0.94rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            🏋️ Treinamento (N=3.472)
          </button>
        </div>

        {/* Gráfico Oficial por Partição */}
        <div className="chart-card" style={{ marginTop: '8px' }}>
          <div className="chart-card-header">
            <span className="chart-card-title">
              {activeTab === 'teste'
                ? 'Permutation Feature Importance no Teste Independente (Holdout N=1.158)'
                : 'Permutation Feature Importance no Treinamento (N=3.472)'}
            </span>
            <span className="badge" style={{ backgroundColor: '#1e293b' }}>
              {activeTab === 'teste' ? 'Avaliação Fora da Amostra' : 'Ajuste In-Sample'}
            </span>
          </div>
          <div className="chart-img-container" style={{ minHeight: '440px', padding: '16px' }}>
            <img
              src={imgGrafico}
              alt={`Permutation Feature Importance — ${activeTab}`}
              className="chart-img"
              loading="lazy"
              style={{ maxHeight: '600px', width: 'auto', margin: '0 auto', display: 'block' }}
            />
            <a
              href={imgGrafico}
              target="_blank"
              rel="noopener noreferrer"
              className="chart-zoom-btn"
              title="Abrir imagem em tamanho real"
            >
              🔍 Expandir
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
