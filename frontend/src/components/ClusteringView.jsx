import React from 'react';

export default function ClusteringView() {
  const clusters = [
    {
      id: 0,
      nome: 'Cluster 0 — Contratos Trienais Padrão',
      totalContratos: 2738,
      percentual: '47,3%',
      taxaAditivos: '54,87%',
      valorMediana: 'R$ 2.846.845,26',
      duracaoMedia: '1.101 dias (~3 anos)',
      capitalMediano: 'R$ 5.000.000,00',
      experienciaMedia: '2,6 contratos',
      perfil: 'MODERADO (ATENÇÃO)',
      cor: '#3b82f6',
      descricao: 'Contratos continuados com vigência típica de 3 anos (triênio regulamentar). Apresentam risco intermediário de extensão de prazo.',
      acao: 'Acompanhamento preventivo semestral e conferência de marcos no 24º mês de execução.',
    },
    {
      id: 1,
      nome: 'Cluster 1 — Fornecimentos e Contratos Curtos',
      totalContratos: 1666,
      percentual: '28,8%',
      taxaAditivos: '44,15%',
      valorMediana: 'R$ 2.069.783,28',
      duracaoMedia: '562 dias (~1,5 ano)',
      capitalMediano: 'R$ 2.500.000,00',
      experienciaMedia: '1,8 contratos',
      perfil: 'BAIXO RISCO (SEGURO)',
      cor: '#10b981',
      descricao: 'Aquisições pontuais de bens, insumos operacionais e serviços rápidos. Menor incidência de aditivos de prazo ou valor.',
      acao: 'Fiscalização contratual ordinária por amostragem e liquidação de medições padronizadas.',
    },
    {
      id: 2,
      nome: 'Cluster 2 — Longa Duração e Megacontratos',
      totalContratos: 1383,
      percentual: '23,9%',
      taxaAditivos: '83,92%',
      valorMediana: 'R$ 7.699.999,80',
      duracaoMedia: '1.641 dias (>4 anos)',
      capitalMediano: 'R$ 48.000.000,00',
      experienciaMedia: '4,9 contratos',
      perfil: 'CRÍTICO (ALTO RISCO)',
      cor: '#ef4444',
      descricao: 'Megaprojetos de engenharia submarina, sondas de perfuração e plantas industriais. 83,92% sofrem prorrogações e repactuações.',
      acao: 'Comitê dedicado de governança, auditoria preventiva contínua e provisão orçamentária para contingências.',
    },
  ];

  return (
    <div className="clustering-layout animate-fade-in">
      <div className="glass-panel section-card">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">🧩 Pilar 2: Agrupamento / Clusterização de Fornecedores (Não Supervisionado)</h2>
            <p className="section-desc">
              Segmentação comportamental via <strong>K-Means (Cenário 1 com MinMaxScaler)</strong>, conforme <strong>Aula 4.1 do Prof. Dr. Ronaldo Martins da Costa (UFG)</strong>.
            </p>
          </div>
          <span className="badge badge-champion">K-Means (K=3) • MinMaxScaler</span>
        </div>

        {/* KPIs Metodológicos */}
        <div className="metrics-cards-sidebar" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', margin: '20px 0' }}>
          <div className="metric-kpi-card highlight-kpi">
            <span className="kpi-label">Algoritmo Homologado</span>
            <span className="kpi-value" style={{ fontSize: '1.2rem' }}>K-Means (K=3)</span>
            <span className="kpi-meaning">Cenário 1: 4 preditores contratuais conhecidos em T₀.</span>
          </div>

          <div className="metric-kpi-card">
            <span className="kpi-label">Normalização</span>
            <span className="kpi-value" style={{ fontSize: '1.2rem' }}>MinMaxScaler</span>
            <span className="kpi-meaning">Equiparação das dimensões no hipercubo [0, 1]⁴.</span>
          </div>

          <div className="metric-kpi-card">
            <span className="kpi-label">Universo Analisado</span>
            <span className="kpi-value">5.787</span>
            <span className="kpi-meaning">Contratos reais Petrobras (100% da ABT consolidada).</span>
          </div>

          <div className="metric-kpi-card">
            <span className="kpi-label">Não Causalidade</span>
            <span className="kpi-value" style={{ fontSize: '1.1rem' }}>T₀ Estrito</span>
            <span className="kpi-meaning">Zero variáveis pós-fato na formação dos centróides.</span>
          </div>
        </div>

        {/* Cards dos 3 Clusters Reais */}
        <div className="clusters-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '24px' }}>
          {clusters.map((c) => (
            <div key={c.id} className="gov-card glass-panel" style={{ borderTop: `4px solid ${c.cor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="badge" style={{ backgroundColor: `${c.cor}20`, color: c.cor, borderColor: c.cor }}>
                  Cluster {c.id} ({c.percentual})
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                  {c.totalContratos} contratos
                </span>
              </div>

              <h3 className="gov-title" style={{ fontSize: '1.05rem', minHeight: '44px' }}>{c.nome}</h3>
              <p className="gov-text" style={{ minHeight: '56px' }}>{c.descricao}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', fontSize: '0.84rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Taxa de Aditivos Real:</span>
                  <strong style={{ color: c.cor }}>{c.taxaAditivos}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Mediana do Valor Original:</span>
                  <strong>{c.valorMediana}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Duração Média:</span>
                  <strong>{c.duracaoMedia}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Capital Social Mediano:</span>
                  <strong>{c.capitalMediano}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Histórico Médio (5a):</span>
                  <strong>{c.experienciaMedia}</strong>
                </div>
              </div>

              <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px dashed var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                <strong>Diretriz de Gestão:</strong> {c.acao}
              </div>
            </div>
          ))}
        </div>

        {/* Tabela de Centróides Normalizados e Desnormalizados */}
        <div style={{ marginTop: '32px' }}>
          <h3 className="card-subtitle">📐 Caracterização dos Centróides (4 Preditores em T₀)</h3>
          <div className="table-responsive">
            <table className="models-table">
              <thead>
                <tr>
                  <th>Cluster / Arquétipo</th>
                  <th>Representatividade</th>
                  <th>Valor Original (Mediana)</th>
                  <th>Duração Média</th>
                  <th>Capital Social (Mediana)</th>
                  <th>Contratos 5a</th>
                  <th>Taxa Aditivos Real</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong style={{ color: '#3b82f6' }}>Cluster 0</strong> — Trienais Padrão</td>
                  <td>2.738 (47,3%)</td>
                  <td>R$ 2.846.845,26</td>
                  <td>1.101,4 dias</td>
                  <td>R$ 5.000.000,00</td>
                  <td>2,6 contratos</td>
                  <td><span className="badge" style={{ backgroundColor: '#3b82f620', color: '#3b82f6' }}>54,87%</span></td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#10b981' }}>Cluster 1</strong> — Curtos / Operacionais</td>
                  <td>1.666 (28,8%)</td>
                  <td>R$ 2.069.783,28</td>
                  <td>562,5 dias</td>
                  <td>R$ 2.500.000,00</td>
                  <td>1,8 contratos</td>
                  <td><span className="badge" style={{ backgroundColor: '#10b98120', color: '#10b981' }}>44,15%</span></td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#ef4444' }}>Cluster 2</strong> — Longa Duração / Megacontratos</td>
                  <td>1.383 (23,9%)</td>
                  <td>R$ 7.699.999,80</td>
                  <td>1.641,5 dias</td>
                  <td>R$ 48.000.000,00</td>
                  <td>4,9 contratos</td>
                  <td><span className="badge" style={{ backgroundColor: '#ef444420', color: '#ef4444' }}>83,92%</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Galeria de Gráficos de Diagnóstico K-Means */}
        <div style={{ marginTop: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-subtitle" style={{ margin: 0 }}>📊 Diagnósticos Gráficos de Agrupamento (cluster_graficos/)</h3>
            <span className="badge badge-champion">K-Means Cenário 1</span>
          </div>
          <p className="section-desc" style={{ marginTop: '6px' }}>
            Gráficos gerados pelo script <code>training_cluster_script.py</code> demonstrando a métrica do Cotovelo (Inércia) e a dispersão geométrica dos clusters projetados via PCA 2D.
          </p>

          <div className="charts-gallery-grid">
            <div className="chart-card">
              <div className="chart-card-header">
                <span className="chart-card-title">1. Projeção PCA 2D dos 3 Clusters</span>
                <span className="badge" style={{ backgroundColor: '#1e293b' }}>K=3 • MinMaxScaler</span>
              </div>
              <div className="chart-img-container">
                <img
                  src="/cluster_graficos/scatter_clusters_pca2d.png"
                  alt="Dispersão PCA 2D dos 3 Clusters de Fornecedores"
                  className="chart-img"
                  loading="lazy"
                />
                <a
                  href="/cluster_graficos/scatter_clusters_pca2d.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chart-zoom-btn"
                  title="Abrir imagem em tamanho real"
                >
                  🔍 Expandir
                </a>
              </div>
              <p className="chart-card-caption">
                Separação no plano das 2 componentes principais. Evidencia a formação nítida dos 3 grupos: fornecedores operacionais, trienais e megaprojetos.
              </p>
            </div>

            <div className="chart-card">
              <div className="chart-card-header">
                <span className="chart-card-title">2. Método do Cotovelo & Métricas de K</span>
                <span className="badge" style={{ backgroundColor: '#1e293b' }}>K ∈ [2, 6]</span>
              </div>
              <div className="chart-img-container">
                <img
                  src="/cluster_graficos/metricas_escolha_k_cenario1.png"
                  alt="Método do Cotovelo e Curvas de Inércia"
                  className="chart-img"
                  loading="lazy"
                />
                <a
                  href="/cluster_graficos/metricas_escolha_k_cenario1.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chart-zoom-btn"
                  title="Abrir imagem em tamanho real"
                >
                  🔍 Expandir
                </a>
              </div>
              <p className="chart-card-caption">
                Queda acentuada da Inércia (WCSS) com estabilização do cotovelo em <strong>K=3</strong>, conciliando coesão interna com interpretabilidade executiva.
              </p>
            </div>
          </div>
        </div>

        {/* Guardrails Metodológicos da Aula 4.1 */}
        <div className="callout-box" style={{ marginTop: '28px' }}>
          <div className="callout-icon">🎓</div>
          <div>
            <h4 className="callout-title">Guardrails da Aula 4.1 do Prof. Dr. Ronaldo (Não Supervisionado)</h4>
            <p className="callout-text">
              1. <strong>Necessidade Crítica de Normalização:</strong> Atributos com escalas discrepantes (como valores monetários na casa de dezenas de milhões de Reais versus prazos em centenas de dias) distorceriam as distâncias euclidianas. A adoção do <code>MinMaxScaler</code> comprime todas as dimensões no intervalo $[0, 1]$, conferindo peso equilibrado a cada feature.<br />
              2. <strong>Princípio da Não Causalidade:</strong> O agrupamento é gerado <em>ex-ante</em> sem conhecimento da variável-alvo (<code>fl_aditivo</code>). A taxa de aditivos é observada <em>a posteriori</em> como métrica diagnóstica de validação externa do modelo.<br />
              3. <strong>Método do Cotovelo:</strong> O hiperparâmetro $K=3$ estabiliza a redução da Inércia (WCSS) preservando clara interpretabilidade executiva.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
