import React from 'react';

const FEATURES_DATA = [
  {
    nome: 'duracao_planejada_dias',
    titulo: 'Vigência Planejada Original (Dias)',
    impacto: 0.312,
    percent: 100,
    descricao: 'Principal fator preditivo. Contratos com vigência prolongada (> 1.095 dias / triênio) têm probabilidade desproporcionalmente maior de aditamentos de prazo e repactuação de valor.',
  },
  {
    nome: 'Valor_Original',
    titulo: 'Vulto Financeiro Original Contratado (R$)',
    impacto: 0.248,
    percent: 80,
    descricao: 'Segundo maior determinante. Empreitadas de grande vulto orçamentário envolvem medições complexas, oscilações cambiais e maior escopo para aditivos de valor.',
  },
  {
    nome: 'tx_adit_geral_5a',
    titulo: 'Taxa Geral Histórica de Aditivos (5 Anos)',
    impacto: 0.185,
    percent: 59,
    descricao: 'Histórico consolidado de termos aditivos da contratada na Petrobras. Elimina a fragmentação e colinearidade das taxas fracionadas.',
  },
  {
    nome: 'Capital_Social_Receita',
    titulo: 'Capital Social Registrado na RFB (R$)',
    impacto: 0.124,
    percent: 40,
    descricao: 'Capacidade patrimonial do fornecedor perante o montante contratado. Fornecedores descapitalizados operando megacontratos apresentam alta fragilidade.',
  },
  {
    nome: 'tipo_ult_adit',
    titulo: 'Natureza do Último Aditivo Anterior',
    impacto: 0.052,
    percent: 17,
    descricao: 'Sinalizador qualitativo comportamental recente (PRAZO, VALOR, PRAZO E VALOR ou SEM HISTÓRICO).',
  },
  {
    nome: 'qtd_cont_5a_forn',
    titulo: 'Volume de Contratos Concluídos (5 Anos)',
    impacto: 0.041,
    percent: 13,
    descricao: 'Experiência pregressa e escala de relacionamento do fornecedor com a estatal.',
  },
  {
    nome: 'Porte_Empresa',
    titulo: 'Porte Empresarial (Receita Federal)',
    impacto: 0.023,
    percent: 7,
    descricao: 'Enquadramento tributário oficial (DEMAIS, EPP, ME ou Não Informado).',
  },
  {
    nome: 'fl_sem_historico_5a',
    titulo: 'Indicador de Novo Fornecedor em T₀',
    impacto: 0.015,
    percent: 5,
    descricao: 'Flag binária que isola empresas sem entregas nos 5 anos anteriores, prevenindo imputações indevidas de taxa zero como se fosse mérito histórico.',
  },
];

export default function FeatureImportanceView() {
  return (
    <div className="feature-importance-layout animate-fade-in">
      <div className="glass-panel section-card">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">🔍 Importância dos Preditores (Feature Importance — Abordagem 4)</h2>
            <p className="section-desc">
              Importâncias apuradas via <strong>Gini Impurity & Permutation Feature Importance</strong> sobre o conjunto de teste cego, conforme <strong>Aula 3 (Árvores e Ensembles) do Prof. Dr. Ronaldo Martins da Costa</strong>.
            </p>
          </div>
          <span className="badge badge-champion">8 Preditores Homologados em T₀</span>
        </div>

        <div className="importance-list-grid">
          {FEATURES_DATA.map((feat, idx) => (
            <div key={idx} className="importance-item-card glass-panel">
              <div className="importance-top-row">
                <span className="feat-rank">#{idx + 1}</span>
                <span className="feat-title">{feat.titulo}</span>
                <span className="feat-code"><code>{feat.nome}</code></span>
              </div>

              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${feat.percent}%` }}
                ></div>
              </div>

              <div className="importance-bottom-row">
                <span className="feat-desc">{feat.descricao}</span>
                <span className="feat-score">Peso: {(feat.impacto * 100).toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Gráfico Oficial de Feature Importance (Permutation vs Gini) */}
        <div style={{ marginTop: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-subtitle" style={{ margin: 0 }}>📊 Diagnóstico Gráfico Oficial de Permutation Importance (classificacao_graficos/)</h3>
            <span className="badge badge-champion">Permutação vs MDI Gini</span>
          </div>
          <p className="section-desc" style={{ marginTop: '6px' }}>
            Gráfico gerado em alta resolução comparando o decaimento de acurácia sob embaralhamento estocástico (Permutation Feature Importance) versus a redução média de impureza Gini nas 100 árvores do ensemble.
          </p>

          <div className="chart-card" style={{ marginTop: '16px' }}>
            <div className="chart-card-header">
              <span className="chart-card-title">5. Ranking de Importância dos 8 Preditores (Random Forest Abordagem 4)</span>
              <span className="badge" style={{ backgroundColor: '#1e293b' }}>Teste Independente N=1.158</span>
            </div>
            <div className="chart-img-container" style={{ minHeight: '380px' }}>
              <img
                src="/classificacao_graficos/5_feature_importance.png"
                alt="Feature Importance dos 8 Preditores da Abordagem 4"
                className="chart-img"
                loading="lazy"
                style={{ maxHeight: '520px', width: 'auto', margin: '0 auto' }}
              />
              <a
                href="/classificacao_graficos/5_feature_importance.png"
                target="_blank"
                rel="noopener noreferrer"
                className="chart-zoom-btn"
                title="Abrir imagem em tamanho real"
              >
                🔍 Expandir
              </a>
            </div>
            <p className="chart-card-caption">
              A <strong>Vigência Planejada (duracao_planejada_dias)</strong> e o <strong>Valor Original</strong> lideram com folga ambos os métodos de avaliação, seguidos pela <strong>Taxa Geral Histórica de Aditivos (tx_adit_geral_5a)</strong> e pelo <strong>Capital Social</strong>. O indicador booleano de novo fornecedor (<code>fl_sem_historico_5a</code>) atua como regularizador para proteger pequenas empresas sem contratos prévios.
            </p>
          </div>
        </div>

        <div className="callout-box" style={{ marginTop: '28px' }}>
          <div className="callout-icon">🛡️</div>
          <div>
            <h4 className="callout-title">Blindagem Temporal em T₀ e Exclusão de Colinearidade</h4>
            <p className="callout-text">
              Ao contrário das abordagens iniciais que mantinham 14 preditores com forte colinearidade entre si (taxas e quantidades de aditivos desmembradas por prazo, valor e simultâneos), a <strong>Abordagem 4</strong> consolida o histórico em <code>tx_adit_geral_5a</code> e <code>qtd_cont_5a_forn</code>. Isso estabilizou as árvores de decisão do Random Forest e eliminou o risco de sobreajuste em empresas pequenas com apenas 1 contrato prévio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
