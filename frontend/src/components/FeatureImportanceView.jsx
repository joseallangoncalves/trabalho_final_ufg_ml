import React, { useState } from 'react';

export default function FeatureImportanceView() {
  const [activeTab, setActiveTab] = useState('teste'); // 'teste' ou 'treino'

  const imgGrafico = activeTab === 'teste'
    ? '/classificacao_graficos/1_importancia_permutacao_teste.png'
    : '/classificacao_graficos/2_importancia_permutacao_treino.png';

  const chartTitle = activeTab === 'teste'
    ? '1. Importância por Permutação — Teste Independente'
    : '2. Importância por Permutação — Treinamento';

  const partitionBadge = activeTab === 'teste'
    ? 'Teste Independente N=1.158'
    : 'Treinamento N=3.472';

  return (
    <div className="feature-importance-layout animate-fade-in">
      <div className="glass-panel section-card">
        {/* Título e Subtítulo */}
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Importância Global das Variáveis — Random Forest, Abordagem 4</h2>
            <p className="section-desc">
              Avaliação das variáveis que mais contribuíram para a discriminação entre contratos com e sem aditivo. A importância por permutação foi calculada no conjunto de teste independente e no conjunto de treinamento.
            </p>
          </div>
          <span className="badge badge-champion">8 Preditores Homologados</span>
        </div>

        {/* Abas para alternar entre Teste Independente e Treinamento */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', marginBottom: '8px' }}>
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

        {/* Gráfico de Permutação */}
        <div className="chart-card" style={{ marginTop: '16px' }}>
          <div className="chart-card-header">
            <span className="chart-card-title">{chartTitle}</span>
            <span className="badge" style={{ backgroundColor: '#1e293b' }}>
              {partitionBadge}
            </span>
          </div>

          <div className="chart-img-container" style={{ minHeight: '440px', padding: '16px' }}>
            <img
              src={imgGrafico}
              alt={chartTitle}
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

          {/* Texto abaixo do gráfico */}
          <div style={{ padding: '16px 20px', backgroundColor: 'rgba(15, 23, 42, 0.65)', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <p style={{ margin: 0, fontSize: '0.90rem', lineHeight: '1.6', color: 'var(--text-bright)' }}>
              A duração planejada e o valor original são os preditores com maior contribuição para a capacidade discriminativa do modelo. Ao embaralhar essas variáveis, observa-se a maior redução da ROC-AUC, indicando que elas concentram a principal informação preditiva da Abordagem 4.
            </p>
          </div>
        </div>

        {/* Texto interpretativo para a aba com trecho atualizado */}
        <div className="callout-box" style={{ marginTop: '24px' }}>
          <div className="callout-icon">📌</div>
          <div>
            <p className="callout-text" style={{ fontSize: '0.88rem', lineHeight: '1.6', color: 'var(--text-bright)', marginBottom: '8px' }}>
              A análise indica predominância das variáveis estruturais do contrato, especialmente <code>duracao_planejada_dias</code> e <code>Valor_Original</code>, na discriminação do risco de aditivo. O histórico consolidado do fornecedor, o porte empresarial e o tipo do último aditivo disponível antes da vigência para o fornecedor apresentam contribuição adicional, porém menor.
            </p>
            <p className="callout-text" style={{ fontSize: '0.86rem', lineHeight: '1.6', color: 'var(--text-dim)', margin: 0, fontStyle: 'italic' }}>
              As importâncias expressam contribuição preditiva para o modelo, não relação causal. Portanto, não se deve interpretar que a alteração isolada de uma variável necessariamente provocará aumento ou redução da probabilidade de aditivo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
