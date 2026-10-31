import React from 'react';

export default function FeatureImportanceView() {
  const imgGrafico = '/classificacao_graficos/1_importancia_permutacao_teste.png';

  return (
    <div className="feature-importance-layout animate-fade-in">
      <div className="glass-panel section-card">
        {/* Título e Subtítulo */}
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Importância Global das Variáveis — Random Forest, Abordagem 4</h2>
            <p className="section-desc">
              Avaliação das variáveis que mais contribuíram para a discriminação entre contratos com e sem aditivo. A importância por permutação foi calculada no conjunto de teste independente.
            </p>
          </div>
          <span className="badge badge-champion">8 Preditores Homologados</span>
        </div>

        {/* Gráfico Principal */}
        <div className="chart-card" style={{ marginTop: '24px' }}>
          <div className="chart-card-header">
            <span className="chart-card-title">1. Importância por Permutação — Teste Independente</span>
            <span className="badge" style={{ backgroundColor: '#1e293b' }}>
              Teste Independente N=1.158
            </span>
          </div>

          <div className="chart-img-container" style={{ minHeight: '440px', padding: '16px' }}>
            <img
              src={imgGrafico}
              alt="1. Importância por Permutação — Teste Independente"
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

        {/* Texto interpretativo para a aba */}
        <div className="callout-box" style={{ marginTop: '24px' }}>
          <div className="callout-icon">📌</div>
          <div>
            <p className="callout-text" style={{ fontSize: '0.88rem', lineHeight: '1.6', color: 'var(--text-bright)', marginBottom: '8px' }}>
              A análise indica predominância das variáveis estruturais do contrato, especialmente <code>duracao_planejada_dias</code> e <code>Valor_Original</code>, na discriminação do risco de aditivo. O histórico consolidado do fornecedor, o porte empresarial e o tipo do último aditivo disponível antes de T₀ apresentam contribuição adicional, porém menor.
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
