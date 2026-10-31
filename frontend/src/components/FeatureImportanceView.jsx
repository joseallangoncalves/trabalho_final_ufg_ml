import React, { useState } from 'react';

const PERM_TREINO = [
  {
    nome: 'duracao_planejada_dias',
    titulo: 'Vigência Planejada Original (Dias)',
    queda_auc: 0.1629,
    std: 0.0056,
    percent: 100,
    descricao: 'Maior determinante no treino: ao embaralhar os prazos, a ROC-AUC cai expressivos 16,29 pontos percentuais.',
  },
  {
    nome: 'Valor_Original',
    titulo: 'Vulto Financeiro Original Contratado (R$)',
    queda_auc: 0.1244,
    std: 0.0047,
    percent: 76,
    descricao: 'Segundo maior impacto preditivo: queda de 12,44% na capacidade discriminativa do modelo.',
  },
  {
    nome: 'Capital_Social_Receita',
    titulo: 'Capital Social Registrado na RFB (R$)',
    queda_auc: 0.0342,
    std: 0.0016,
    percent: 21,
    descricao: 'Capacidade patrimonial do fornecedor perante o montante contratado.',
  },
  {
    nome: 'tipo_ult_adit',
    titulo: 'Natureza do Último Aditivo Anterior',
    queda_auc: 0.0281,
    std: 0.0009,
    percent: 17,
    descricao: 'Histórico comportamental qualitativo (Prazo, Valor, Ambos ou Sem Histórico).',
  },
  {
    nome: 'Porte_Empresa',
    titulo: 'Porte Empresarial (Receita Federal)',
    queda_auc: 0.0188,
    std: 0.0016,
    percent: 12,
    descricao: 'Enquadramento tributário oficial perante a Receita Federal.',
  },
  {
    nome: 'qtd_cont_5a_forn',
    titulo: 'Volume de Contratos Concluídos (5 Anos)',
    queda_auc: 0.0076,
    std: 0.0003,
    percent: 5,
    descricao: 'Volume de entregas pregressas do fornecedor nos 5 anos anteriores.',
  },
  {
    nome: 'fl_sem_historico_5a',
    titulo: 'Indicador de Novo Fornecedor em T₀',
    queda_auc: 0.0069,
    std: 0.0003,
    percent: 4,
    descricao: 'Flag binária que isola empresas sem entregas nos 5 anos anteriores.',
  },
  {
    nome: 'tx_adit_geral_5a',
    titulo: 'Taxa Geral Histórica de Aditivos (5 Anos)',
    queda_auc: 0.0028,
    std: 0.0002,
    percent: 2,
    descricao: 'Taxa consolidada de aditamentos nos 5 anos anteriores.',
  },
];

const PERM_TESTE = [
  {
    nome: 'duracao_planejada_dias',
    titulo: 'Vigência Planejada Original (Dias)',
    queda_auc: 0.1363,
    std: 0.0145,
    percent: 100,
    descricao: 'No teste holdout independente, a vigência planejada confirma a liderança com queda média de 13,63% na ROC-AUC.',
  },
  {
    nome: 'Valor_Original',
    titulo: 'Vulto Financeiro Original Contratado (R$)',
    queda_auc: 0.1052,
    std: 0.0113,
    percent: 77,
    descricao: 'Confirma o segundo lugar em dados inéditos: redução de 10,52% na capacidade preditiva ao ser permutado.',
  },
  {
    nome: 'Capital_Social_Receita',
    titulo: 'Capital Social Registrado na RFB (R$)',
    queda_auc: 0.0249,
    std: 0.0015,
    percent: 18,
    descricao: 'Mantém relevância estável no teste (queda de 2,49% no ROC-AUC).',
  },
  {
    nome: 'tipo_ult_adit',
    titulo: 'Natureza do Último Aditivo Anterior',
    queda_auc: 0.0209,
    std: 0.0025,
    percent: 15,
    descricao: 'Mantém a 4ª posição no ranking tanto no treino quanto no teste.',
  },
  {
    nome: 'Porte_Empresa',
    titulo: 'Porte Empresarial (Receita Federal)',
    queda_auc: 0.0134,
    std: 0.0022,
    percent: 10,
    descricao: 'Estabilidade preditiva no teste com queda de 1,34% no ROC-AUC.',
  },
  {
    nome: 'qtd_cont_5a_forn',
    titulo: 'Volume de Contratos Concluídos (5 Anos)',
    queda_auc: 0.0082,
    std: 0.0008,
    percent: 6,
    descricao: 'Contribuição incremental estável na avaliação fora da amostra.',
  },
  {
    nome: 'fl_sem_historico_5a',
    titulo: 'Indicador de Novo Fornecedor em T₀',
    queda_auc: 0.0071,
    std: 0.0007,
    percent: 5,
    descricao: 'Proteção metodológica para novas empresas sem penalização artificial.',
  },
  {
    nome: 'tx_adit_geral_5a',
    titulo: 'Taxa Geral Histórica de Aditivos (5 Anos)',
    queda_auc: 0.0011,
    std: 0.0002,
    percent: 1,
    descricao: 'Impacto sutil no teste após controle por porte e tempo contratual.',
  },
];

export default function FeatureImportanceView() {
  const [activeTab, setActiveTab] = useState('teste'); // 'teste' ou 'treino'

  const dadosAtivos = activeTab === 'teste' ? PERM_TESTE : PERM_TREINO;
  const imgGrafico = activeTab === 'teste'
    ? '/classificacao_graficos/permutation_importance_teste.png'
    : '/classificacao_graficos/permutation_importance_treino.png';
  const nAmostras = activeTab === 'teste' ? '1.158 contratos (Holdout 20%)' : '3.472 contratos (Treino 60%)';
  const badgeLabel = activeTab === 'teste' ? '🧪 Teste Independente' : '🏋️ Treinamento';

  return (
    <div className="feature-importance-layout animate-fade-in">
      <div className="glass-panel section-card">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">🔍 Importância dos Preditores por Permutação (Permutation Importance)</h2>
            <p className="section-desc">
              Importâncias apuradas <strong>exclusivamente por Permutação Estocástica (Permutation Feature Importance)</strong> avaliando a perda de ROC-AUC sob 10 repetições estocásticas (Breiman, 2001; Izbicki & Santos, 2020), comparando as partições de <strong>Treinamento</strong> e <strong>Teste Independente</strong>.
            </p>
          </div>
          <span className="badge badge-champion">8 Preditores Homologados em T₀</span>
        </div>

        {/* Abas de Navegação Treino / Teste */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', marginBottom: '24px' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'teste' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('teste')}
            style={{ padding: '10px 20px', fontSize: '0.92rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            🧪 Teste Independente (N=1.158)
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'treino' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('treino')}
            style={{ padding: '10px 20px', fontSize: '0.92rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            🏋️ Treinamento (N=3.472)
          </button>
        </div>

        <div className="callout-box" style={{ marginBottom: '24px', backgroundColor: '#0f172a' }}>
          <div className="callout-icon">💡</div>
          <div>
            <h4 className="callout-title">
              Como foi calculado o Permutation Feature Importance ({badgeLabel} — {nAmostras}):
            </h4>
            <p className="callout-text" style={{ fontSize: '0.86rem', lineHeight: '1.5' }}>
              Para cada um dos 8 preditores, os valores observados naquela coluna foram embaralhados aleatoriamente mantendo as demais colunas intactas (10 repetições, semente 42). O modelo Random Forest recalcula a probabilidade e a métrica <strong>ROC-AUC</strong>. A diferença entre a ROC-AUC original e a ROC-AUC pós-embaralhamento representa a <strong>perda direta de capacidade discriminativa</strong> atribuível exclusivamente àquele preditor.
            </p>
          </div>
        </div>

        <div className="importance-list-grid">
          {dadosAtivos.map((feat, idx) => (
            <div key={idx} className="importance-item-card glass-panel">
              <div className="importance-top-row">
                <span className="feat-rank">#{idx + 1}</span>
                <span className="feat-title">{feat.titulo}</span>
                <span className="feat-code"><code>{feat.nome}</code></span>
              </div>

              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${feat.percent}%`,
                    backgroundColor: activeTab === 'teste' ? '#0d9488' : '#2563eb'
                  }}
                ></div>
              </div>

              <div className="importance-bottom-row">
                <span className="feat-desc">{feat.descricao}</span>
                <span className="feat-score" style={{ color: activeTab === 'teste' ? '#2dd4bf' : '#60a5fa' }}>
                  Queda ROC-AUC: -{(feat.queda_auc * 100).toFixed(2)}% (±{(feat.std * 100).toFixed(2)}%)
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Gráfico Oficial por Partição */}
        <div style={{ marginTop: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-subtitle" style={{ margin: 0 }}>
              📈 Gráfico de Permutation Importance ({badgeLabel})
            </h3>
            <span className="badge badge-champion">classificacao_graficos/</span>
          </div>
          <p className="section-desc" style={{ marginTop: '6px' }}>
            Gráfico oficial com barras de erro padrão (± 1 DP sobre 10 repetições estocásticas) demonstrando a consistência dos preditores entre treinamento e validação fora da amostra.
          </p>

          <div className="chart-card" style={{ marginTop: '16px' }}>
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
            <div className="chart-img-container" style={{ minHeight: '380px' }}>
              <img
                src={imgGrafico}
                alt={`Permutation Feature Importance — ${activeTab}`}
                className="chart-img"
                loading="lazy"
                style={{ maxHeight: '520px', width: 'auto', margin: '0 auto' }}
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
            <p className="chart-card-caption">
              {activeTab === 'teste' ? (
                <>
                  No <strong>Teste Independente</strong>, a <strong>Vigência Planejada (queda de 0,1363 no ROC-AUC)</strong> e o <strong>Valor Original (queda de 0,1052)</strong> são os pilares da capacidade preditiva. A proximidade da ordenação com o conjunto de treinamento confirma ausência de overfitting nos preditores principais.
                </>
              ) : (
                <>
                  No <strong>Treinamento</strong>, a <strong>Vigência Planejada (queda de 0,1629)</strong> e o <strong>Valor Original (queda de 0,1244)</strong> também lideram, com <strong>Capital Social (0,0342)</strong> e <strong>Natureza do Último Aditivo (0,0281)</strong> ocupando o segundo escalão de relevância.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="callout-box" style={{ marginTop: '28px' }}>
          <div className="callout-icon">🛡️</div>
          <div>
            <h4 className="callout-title">Vantagens Metodológicas da Permutação vs Gini (MDI)</h4>
            <p className="callout-text">
              A importância por impureza de Gini (MDI) nativa das árvores tende a superestimar variáveis contínuas com alta cardinalidade. O método de <strong>Permutation Importance</strong>, por outro lado, avalia diretamente o impacto real na métrica de negócio (ROC-AUC) ao quebrar a relação preditor-alvo, sendo o padrão-ouro recomendado pela literatura de Machine Learning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
