import React, { useState } from 'react';

export default function DatasetEDAView() {
  const [subTab, setSubTab] = useState('resumo');
  const [filterCategory, setFilterCategory] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImg, setSelectedImg] = useState(null);

  // 1. Dicionário Completo das 17 Variáveis da Tabela Analítica (Seção 3 do Relatório)
  const fullDictionary = [
    { name: 'Numero_Contrato', label: 'Número do Contrato', type: 'Categórico Nominal', category: 'identificador', role: 'Identificador Chave', scale: 'Texto / Numérico', desc: 'Chave primária única do contrato no ERP Corporativo SAP Petrobras (Série 46).' },
    { name: 'fl_aditivo', label: 'Ocorrência de Aditivo (Target)', type: 'Binário (0/1)', category: 'target', role: 'Variável Alvo (Target)', scale: '0 = Não (41,28%), 1 = Sim (58,72%)', desc: '1 se o contrato sofreu qualquer termo aditivo de prazo e/ou valor; 0 se encerrou sem termos aditivos.' },
    { name: 'Valor_Original', label: 'Valor Original Contratado', type: 'Numérico Contínuo', category: 'contratual', role: 'Preditivo (Cluster/Classif)', scale: 'Reais (R$)', desc: 'Valor total monetário inicial pactuado na assinatura original. Apresenta forte assimetria (+14,77) e cauda longa.' },
    { name: 'duracao_planejada_dias', label: 'Duração Planejada Original', type: 'Numérico Discreto', category: 'contratual', role: 'Preditivo (Cluster/Classif)', scale: 'Dias Corridos', desc: 'Prazo previsto entre o início e o fim estipulado no edital original. Distribuição simétrica centrada em 1.094 dias (3 anos).' },
    { name: 'Capital_Social_Receita', label: 'Capital Social Registrado', type: 'Numérico Contínuo', category: 'cadastral', role: 'Preditivo (Cluster/Classif)', scale: 'Reais (R$)', desc: 'Porte patrimonial registrado da empresa perante a Receita Federal do Brasil (RFB). Reflete solidez econômico-financeira.' },
    { name: 'Porte_Empresa', label: 'Porte Empresarial (Receita Federal)', type: 'Categórico Nominal', category: 'cadastral', role: 'Preditivo (Classificação)', scale: 'Demais (77,1%), EPP (11,9%), ME (9,1%), Exterior (2,0%)', desc: 'Porte oficial da contratada perante a RFB (Demais = Médio e Grande Porte).' },
    { name: 'qtd_cont_5a_forn', label: 'Contratos nos 5 Anos Anteriores', type: 'Numérico Discreto', category: 'historico', role: 'Preditivo (Cluster/Classif)', scale: 'Contagem Inteira', desc: 'Total de contratos do fornecedor finalizados nos 5 anos imediatamente anteriores à assinatura do contrato analisado.' },
    { name: 'fl_sem_historico_5a', label: 'Flag Sem Histórico nos 5 Anos', type: 'Binário (0/1)', category: 'historico', role: 'Preditivo (Classificação)', scale: '1 = Sem Histórico (75%), 0 = Com Histórico', desc: 'Indicador lógico de ausência de contratos elegíveis nos 5 anos anteriores. Resolve matematicamente a divisão 0/0 nas taxas.' },
    { name: 'qtd_adit_prazo_5a', label: 'Aditivos de Prazo nos 5 Anos', type: 'Numérico Discreto', category: 'historico', role: 'Preditivo (Classificação)', scale: 'Contagem Inteira', desc: 'Contratos anteriores do fornecedor com aditivo exclusivo de prazo celebrados na janela de 5 anos.' },
    { name: 'tx_adit_prazo_5a', label: 'Taxa de Aditivos de Prazo (5 Anos)', type: 'Numérico Contínuo', category: 'historico', role: 'Preditivo (Classificação)', scale: 'Proporção [0, 1]', desc: 'Razão entre contratos com aditivo de prazo e o total de contratos do fornecedor nos 5 anos.' },
    { name: 'qtd_adit_pv_5a', label: 'Aditivos Simultâneos Prazo/Valor (5 Anos)', type: 'Numérico Discreto', category: 'historico', role: 'Preditivo (Classificação)', scale: 'Contagem Inteira', desc: 'Contratos anteriores do fornecedor com aditivo conjunto de prazo e valor celebrados na janela de 5 anos.' },
    { name: 'tx_adit_pv_5a', label: 'Taxa Aditivos Prazo/Valor (5 Anos)', type: 'Numérico Contínuo', category: 'historico', role: 'Preditivo (Classificação)', scale: 'Proporção [0, 1]', desc: 'Razão entre contratos com aditivo conjunto de prazo/valor e o total de contratos nos 5 anos.' },
    { name: 'qtd_adit_val_5a', label: 'Aditivos de Valor nos 5 Anos', type: 'Numérico Discreto', category: 'historico', role: 'Preditivo (Classificação)', scale: 'Contagem Inteira', desc: 'Contratos anteriores do fornecedor com aditivo exclusivo de valor na janela de 5 anos.' },
    { name: 'tx_adit_val_5a', label: 'Taxa de Aditivos de Valor (5 Anos)', type: 'Numérico Contínuo', category: 'historico', role: 'Preditivo (Classificação)', scale: 'Proporção [0, 1]', desc: 'Razão entre contratos com aditivo de valor e o total de contratos do fornecedor nos 5 anos.' },
    { name: 'tx_adit_geral_5a', label: 'Taxa Geral Histórica de Aditivos', type: 'Numérico Contínuo', category: 'historico', role: 'Preditivo (Classificação Ab4)', scale: 'Proporção [0, 1]', desc: 'Taxa consolidada de contratos com qualquer termo aditivo nos 5 anos anteriores. Preditores central da Abordagem 4.' },
    { name: 'tipo_ult_adit', label: 'Tipo do Último Aditivo do Fornecedor', type: 'Categórico Nominal', category: 'historico', role: 'Preditivo (Classificação)', scale: 'Nenhum (44,1%), Prazo_e_Valor (39,5%), Valor (10,0%), Prazo (6,5%)', desc: 'Natureza jurídica da última alteração contratual executada pelo fornecedor antes da nova celebração.' },
    { name: 'tipo_fundamento_licitacao', label: 'Fundamento Jurídico da Licitação', type: 'Categórico Nominal', category: 'contratual', role: 'Contextual / Controle', scale: 'Licitação Art. 28 CAPUT | Licitação por Item | Registro de Preços Art. 66', desc: 'Enquadramento oficial da contratação na base: "Licitação, Lei 13.303, Art. 28, CAPUT", "Licitação, Lei 13.303, Art. 28 CAPUT - licitação por item" e "Sistema de Registros de Preços - Licitação, Lei 13.303/16, Art.66".' }
  ];

  // 2. Tabela de Medidas Descritivas Exaustivas com CV% e Q90 (Seção 5.3 do Relatório)
  const fullDescriptiveStats = [
    { var: 'Valor_Original (R$)', mean: '26.225.491,98', sd: '101.586.861,87', cv: '387,36%', min: '0,01', q1: '712.743,14', med: '3.441.387,15', q3: '16.745.151,00', q90: '53.021.146,45', q95: '105.103.475,39', iqr: '16.032.407,86', max: '3.345.927.317,66', skew: '+14,77' },
    { var: 'Capital_Social_Receita (R$)', mean: '370.000.362,61', sd: '2.494.064.845,85', cv: '674,07%', min: '0,00', q1: '500.000,00', med: '5.000.000,00', q3: '55.693.962,00', q90: '423.343.768,00', q95: '1.115.078.257,20', iqr: '55.193.962,00', max: '65.000.000.000,00', skew: '+16,40' },
    { var: 'duracao_planejada_dias', mean: '1.076,00', sd: '421,03', cv: '39,13%', min: '0', q1: '754,00', med: '1.094,00', q3: '1.334,00', q90: '1.704,80', q95: '1.824,00', iqr: '580,00', max: '2.312', skew: '-0,03' },
    { var: 'qtd_cont_5a_forn', mean: '19,80', sd: '233,57', cv: '1.179,46%', min: '0', q1: '0,00', med: '0,00', q3: '0,00', q90: '3,00', q95: '10,00', iqr: '0,00', max: '5.922', skew: '+17,97' },
    { var: 'qtd_adit_prazo_5a', mean: '0,32', sd: '2,77', cv: '869,65%', min: '0', q1: '0,00', med: '0,00', q3: '0,00', q90: '0,00', q95: '1,00', iqr: '0,00', max: '69', skew: '+15,87' },
    { var: 'qtd_adit_pv_5a', mean: '0,26', sd: '2,32', cv: '891,47%', min: '0', q1: '0,00', med: '0,00', q3: '0,00', q90: '0,00', q95: '1,00', iqr: '0,00', max: '55', skew: '+15,54' },
    { var: 'qtd_adit_val_5a', mean: '0,15', sd: '1,20', cv: '798,03%', min: '0', q1: '0,00', med: '0,00', q3: '0,00', q90: '0,00', q95: '0,00', iqr: '0,00', max: '33', skew: '+17,69' },
    { var: 'tx_adit_geral_5a', mean: '0,03', sd: '0,16', cv: '455,08%', min: '0,00', q1: '0,00', med: '0,00', q3: '0,00', q90: '0,00', q95: '0,20', iqr: '0,00', max: '1,00', skew: '+5,01' }
  ];

  // 4. Testes Não-Paramétricos de Mann-Whitney U (Seção 6.2 do Relatório)
  const mannWhitneyTests = [
    { var: 'Valor_Original', semQ1: 'R$ 380,0 mil', semMed: 'R$ 1,34 Milhão', semQ3: 'R$ 6,55 mi', semQ95: 'R$ 47,81 mi', comQ1: 'R$ 1,51 mi', comMed: 'R$ 6,38 Milhões', comQ3: 'R$ 31,34 mi', comQ95: 'R$ 106,62 mi', statU: '2.553.077', pval: '< 0,0001', h0: 'Rejeitada' },
    { var: 'duracao_planejada_dias', semQ1: '557 dias', semMed: '1.094 dias', semQ3: '1.096 dias', semQ95: '1.767 dias', comQ1: '869 dias', comMed: '1.124 dias', comQ3: '1.459 dias', comQ95: '2.016 dias', statU: '2.621.690', pval: '< 0,0001', h0: 'Rejeitada' },
    { var: 'Capital_Social_Receita', semQ1: 'R$ 300,0 mil', semMed: 'R$ 3,00 Milhões', semQ3: 'R$ 20,00 mi', semQ95: 'R$ 180,0 mi', comQ1: 'R$ 1,00 mi', comMed: 'R$ 7,00 Milhões', comQ3: 'R$ 51,70 mi', comQ95: 'R$ 400,0 mi', statU: '3.482.220', pval: '< 0,0001', h0: 'Rejeitada' },
    { var: 'qtd_cont_5a_forn', semQ1: '0', semMed: '0', semQ3: '1', semQ95: '18', comQ1: '0', comMed: '0', comQ3: '2', comQ95: '29', statU: '4.418.759', pval: '< 0,0001', h0: 'Rejeitada' }
  ];

  // 5. Testes Qui-Quadrado Categóricos (Seção 6.3 do Relatório)
  const chiSquareTests = [
    { var: 'Porte da Empresa', cat: 'Microempresa (ME)', sem: '48,85%', com: '51,15%', n: '524', chi2: '68,62 (GL 3)', pval: '8,43 × 10⁻¹⁵', cramer: '0,109 (Fraca)' },
    { var: 'Porte da Empresa', cat: 'Pequeno Porte (EPP)', sem: '53,49%', com: '46,51%', n: '688', chi2: '—', pval: '—', cramer: '—' },
    { var: 'Porte da Empresa', cat: 'Demais (Médio / Grande)', sem: '38,62%', com: '61,38%', n: '4.461', chi2: '—', pval: '—', cramer: '—' },
    { var: 'Porte da Empresa', cat: 'Não Encontrado / Exterior', sem: '36,84%', com: '63,16%', n: '114', chi2: '—', pval: '—', cramer: '—' },
    { var: 'Tipo do Último Aditivo', cat: 'Nenhum', sem: '43,61%', com: '56,39%', n: '2.550', chi2: '25,25 (GL 3)', pval: '1,37 × 10⁻⁵', cramer: '0,066 (Desprezível)' },
    { var: 'Tipo do Último Aditivo', cat: 'Prazo', sem: '40,16%', com: '59,84%', n: '376', chi2: '—', pval: '—', cramer: '—' },
    { var: 'Tipo do Último Aditivo', cat: 'Valor', sem: '46,45%', com: '53,55%', n: '577', chi2: '—', pval: '—', cramer: '—' },
    { var: 'Tipo do Último Aditivo', cat: 'Prazo_e_Valor', sem: '37,57%', com: '62,43%', n: '2.284', chi2: '—', pval: '—', cramer: '—' }
  ];

  // 6. Síntese dos Insights para a Modelagem (Seção 8 do Relatório)
  const modelingInsights = [
    { finding: 'Assimetria severa (> +14) em grandezas monetárias e capital', decision: 'Adoção obrigatória do MinMaxScaler no K-Means e árvores de decisão (Random Forest) na classificação', impact: 'Evitou dominância do valor em reais no cálculo de distâncias euclidianas e garantiu invariância a outliers' },
    { finding: 'Ausência de correlação linear perfeita entre preditores', decision: 'Preservação de Valor_Original, duracao_planejada_dias, Capital_Social_Receita e qtd_cont_5a_forn no Cenário 1', impact: 'Gerou partições equilibradas e parcimoniosas no clustering (Silhueta = 0,6082)' },
    { finding: 'Salto abrupto de medianas em contratos aditivados (5x no valor e +33% no prazo)', decision: 'Seleção das variáveis de vigência e valor como separadores primários (split raiz)', impact: 'Proporcionou máxima separação estatística, atingindo KS = 0,5034 e ROC-AUC = 0,8172' },
    { finding: 'Inflação de zeros nas métricas históricas de aditivo dos fornecedores', decision: 'Criação da flag binária fl_sem_historico_5a e imputação lógica em zero para novos fornecedores', impact: 'Incorporou o histórico de reincidência sem excluir empresas novas entrantes no cadastro' },
    { finding: 'Equilíbrio natural da classe dependente (58,7% com aditivo vs 41,3% sem)', decision: 'Descarte de técnicas artificiais de sobreamostragem (SMOTE) e calibração do threshold ótimo pelo KS', impact: 'Eliminou ruídos sintéticos e otimizou a captura de contratos críticos na gestão preventiva' }
  ];

  // 7. Gráficos de Alta Resolução da Pasta eda_graficos/
  const edaCharts = [
    { id: '02_boxplots_bivariados_variaveis_vs_target.png', title: 'Boxplots Bivariados: Numéricas vs fl_aditivo', desc: 'Contraste direto das medianas e quartis entre contratos Sem Aditivo (0) e Com Aditivo (1) com teste de Mann-Whitney U.' },
    { id: '01_distribuicao_target_fl_aditivo.png', title: 'Distribuição da Variável Alvo (fl_aditivo)', desc: 'Proporção balanceada de 58,72% de contratos aditivados (3.398) contra 41,28% sem aditivos (2.389).' },
    { id: '03_bivariada_categoricas_vs_target.png', title: 'Análise Bivariada Categórica (Porte e Último Aditivo)', desc: 'Frequência percentual dentro de cada categoria com testes Qui-Quadrado e V de Cramér.' },
    { id: '04_histogramas_univariados_variaveis_chave.png', title: 'Histogramas Univariados com Média e Mediana', desc: 'Curvas de densidade e distribuição das 4 variáveis centrais, ilustrando a assimetria e simetria das features.' },
    { id: '05_matriz_correlacao_spearman_estratificada.png', title: 'Matriz de Correlação de Spearman Estratificada', desc: 'Comparativo de correlações não-paramétricas entre o Grupo 0 (Sem Aditivo) e Grupo 1 (Com Aditivo).' }
  ];

  // Filtragem dinâmica do dicionário
  const filteredVars = fullDictionary.filter((item) => {
    const matchesCategory = filterCategory === 'todas' || item.category === filterCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.desc.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="eda-container fade-in">
      {/* Top Banner de Resumo Executivo */}
      <section className="section-card glass-panel eda-hero-banner">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Base de Dados e Análise Exploratória dos Dados</h2>
            <p className="section-subtitle">
              Visão geral sobre a construção da Tabela Analítica de Modelagem (ABT), dicionário de variáveis, análise univariada e bidimensional das variáveis explicativas.
            </p>
          </div>

          <div className="eda-quick-stats">
            <div className="quick-stat-card">
              <span className="qstat-val">5.787</span>
              <span className="qstat-lbl">Contratos Únicos</span>
            </div>
            <div className="quick-stat-card">
              <span className="qstat-val">R$ 151,8 Bi</span>
              <span className="qstat-lbl">Volume Financeiro</span>
            </div>
            <div className="quick-stat-card">
              <span className="qstat-val text-red">58,72%</span>
              <span className="qstat-lbl">Taxa de Aditivos</span>
            </div>
            <div className="quick-stat-card">
              <span className="qstat-val text-cyan">1.094 d</span>
              <span className="qstat-lbl">Mediana Duração</span>
            </div>
          </div>
        </div>

        {/* Sub-navegação temática fiel ao relatório */}
        <div className="eda-subnav">
          <button className={`subnav-btn ${subTab === 'resumo' ? 'active' : ''}`} onClick={() => setSubTab('resumo')}>
            1. Origem & Pipeline
          </button>
          <button className={`subnav-btn ${subTab === 'dicionario' ? 'active' : ''}`} onClick={() => setSubTab('dicionario')}>
            2. Dicionário (17 Variáveis)
          </button>
          <button className={`subnav-btn ${subTab === 'descritiva' ? 'active' : ''}`} onClick={() => setSubTab('descritiva')}>
            3. Análise Descritiva
          </button>
          <button className={`subnav-btn ${subTab === 'bivariada' ? 'active' : ''}`} onClick={() => setSubTab('bivariada')}>
            4. Análise Bidimensional (Boxplots)
          </button>
          <button className={`subnav-btn ${subTab === 'insights' ? 'active' : ''}`} onClick={() => setSubTab('insights')}>
            5. Insights & Modelagem
          </button>
          <button className={`subnav-btn ${subTab === 'graficos' ? 'active' : ''}`} onClick={() => setSubTab('graficos')}>
            6. Galeria Gráficos HD
          </button>
        </div>
      </section>

      {/* SEÇÃO 1: Origem dos Dados, Pipeline e Regras de Negócio */}
      {subTab === 'resumo' && (
        <div className="eda-grid-layout">
          <div className="section-card glass-panel">
            <h3 className="card-inner-title">Origem dos Dados e Cruzamento Institucional</h3>
            <p className="card-text-muted">
              A base analítica foi concebida a partir da fusão de dois ecossistemas públicos de dados:
            </p>
            <div className="origin-cards-grid">
              <div className="origin-box">
                <h4>Portal da Transparência da Petrobras</h4>
                <p>
                  Extração estruturada de contratações, valores originais, vigências e termos aditivos celebrados via serviço corporativo (API OutSystems). Abrange 833 mil registros de compras.
                </p>
              </div>
              <div className="origin-box">
                <h4>Dados Abertos da Receita Federal (RFB)</h4>
                <p>
                  Enriquecimento cadastral via CNPJ da matriz (CNPJ Básico) e filiais, integrando porte empresarial oficial, capital social registrado e código de natureza jurídica.
                </p>
              </div>
            </div>

            <h3 className="card-inner-title" style={{ marginTop: '24px' }}>Filtros de Elegibilidade e Regras de Negócio</h3>
            <ul className="filter-rules-list">
              <li>
                <strong>Série Contratual 46:</strong> Filtra apenas contratações em sua maioria associadas a contratos de serviços e do tipo licitação.
              </li>
              <li>
                <strong>Regime Jurídico da Lei das Estatais (Lei 13.303/16):</strong> Foco estrito em licitações regidas pelas modalidades oficiais da base:
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <code style={{ fontSize: '0.84rem', padding: '3px 8px', background: 'rgba(56, 189, 248, 0.08)', borderRadius: '4px', width: 'fit-content' }}>
                    Licitação, Lei 13.303, Art. 28, CAPUT
                  </code>
                  <code style={{ fontSize: '0.84rem', padding: '3px 8px', background: 'rgba(56, 189, 248, 0.08)', borderRadius: '4px', width: 'fit-content' }}>
                    Licitação, Lei 13.303, Art. 28 CAPUT - licitação por item
                  </code>
                  <code style={{ fontSize: '0.84rem', padding: '3px 8px', background: 'rgba(56, 189, 248, 0.08)', borderRadius: '4px', width: 'fit-content' }}>
                    Sistema de Registros de Preços - Licitação, Lei 13.303/16, Art.66
                  </code>
                </div>
              </li>
              <li>
                <strong>Eliminação de Censura Temporal à Direita:</strong> Seleção exclusiva de contratos em situação finalizada (<em>Concluído</em>, <em>Concluído - rescisão</em> ou <em>Concluído - distrato</em>). Contratos em aberto foram excluídos para garantir ciclo completo de aditivos observado sem viés.
              </li>
              <li>
                <strong>Janela Retroativa de 5 Anos:</strong> O histórico de desempenho de cada fornecedor foi calculado dinamicamente nos 5 anos imediatamente anteriores à assinatura de cada contrato.
              </li>
            </ul>
          </div>

          <div className="section-card glass-panel">
            <h3 className="card-inner-title">Balanceamento Natural da Variável Dependente (fl_aditivo)</h3>
            <div className="target-balance-card">
              <div className="balance-bar-container">
                <div className="bar-part bar-com" style={{ width: '58.72%' }}>
                  <span>Com Aditivo: 58,72% (3.398 contratos)</span>
                </div>
                <div className="bar-part bar-sem" style={{ width: '41.28%' }}>
                  <span>Sem Aditivo: 41,28% (2.389 contratos)</span>
                </div>
              </div>
              <p className="card-text-muted" style={{ marginTop: '14px', fontSize: '0.85rem' }}>
                A variável resposta apresenta uma distribuição balanceada naturalmente.
              </p>
            </div>

            <h3 className="card-inner-title" style={{ marginTop: '24px' }}>Integridade Cadastral e Dados Faltantes</h3>
            <div className="origin-cards-grid" style={{ marginTop: '12px' }}>
              <div className="origin-box">
                <h4 className="text-green">100% de Completude</h4>
                <p>Todos os atributos nativos contratuais e preditivos não apresentam nenhum valor ausente após saneamento.</p>
              </div>
              <div className="origin-box">
                <h4 className="text-cyan">114 Internacionais</h4>
                <p>Contratos de fornecedores estrangeiros sem CNPJ foram consolidados na classe explícita <em>"Não Encontrado / Exterior"</em> sem descarte de linhas.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEÇÃO 2: Dicionário Completo de 17 Variáveis */}
      {subTab === 'dicionario' && (
        <div className="section-card glass-panel">
          <div className="section-header-row">
            <div>
              <h3 className="card-inner-title">Dicionário Completo de Variáveis da Base Analítica (ABT)</h3>
              <p className="card-text-muted">
                Detalhamento dos 17 atributos estruturados na esteira de dados conforme a Seção 3 do relatório técnico.
              </p>
            </div>

            <div className="filter-pill-row" style={{ marginBottom: 0 }}>
              <input
                type="text"
                placeholder="Buscar variável..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="eda-search-input"
              />
              {['todas', 'target', 'contratual', 'cadastral', 'historico', 'identificador'].map((cat) => (
                <button
                  key={cat}
                  className={`filter-pill-btn ${filterCategory === cat ? 'active' : ''}`}
                  onClick={() => setFilterCategory(cat)}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="table-responsive">
            <table className="eda-table" style={{ textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ width: '180px' }}>Nome da Variável</th>
                  <th style={{ width: '140px' }}>Tipo Estatístico</th>
                  <th style={{ width: '160px' }}>Papel Metodológico</th>
                  <th style={{ width: '180px' }}>Escala / Domínio</th>
                  <th>Descrição Semântica e Regra de Cálculo</th>
                </tr>
              </thead>
              <tbody>
                {filteredVars.map((v) => (
                  <tr key={v.name}>
                    <td className="font-semibold text-cyan">
                      <code>{v.name}</code>
                    </td>
                    <td><span className="var-meta-val">{v.type}</span></td>
                    <td><span className={`var-badge badge-${v.category}`}>{v.role}</span></td>
                    <td style={{ fontSize: '0.78rem' }}>{v.scale}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SEÇÃO 3: Análise Descritiva das Variáveis Explicativas */}
      {subTab === 'descritiva' && (
        <div className="section-card glass-panel">
          <div className="section-header-row">
            <div>
              <h3 className="card-inner-title">Tabela 1: Medidas descritivas das variáveis explicativas</h3>
              <p className="card-text-muted">
                Medidas de tendência central, dispersão absoluta e relativa (CV%), separatrizes e assimetria calculadas sobre as <strong>5.787 observações</strong> da base analítica.
              </p>
            </div>
            <div className="cv-legend-badge">
              <span>CV = (σ / μ) × 100% | DesvPad / Média</span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="eda-table">
              <thead>
                <tr>
                  <th>Variável Analisada</th>
                  <th>Média (μ)</th>
                  <th>Desvio Padrão (σ)</th>
                  <th>Coef. Variação (CV%)</th>
                  <th>Mínimo</th>
                  <th>Q1 (25%)</th>
                  <th>Mediana (Q2)</th>
                  <th>Q3 (75%)</th>
                  <th>Q90 (90%)</th>
                  <th>Q95 (95%)</th>
                  <th>IQR</th>
                  <th>Máximo</th>
                  <th>Assimetria</th>
                </tr>
              </thead>
              <tbody>
                {fullDescriptiveStats.map((row, idx) => (
                  <tr key={idx} className={row.var.includes('Valor') || row.var.includes('duracao') ? 'highlight-row' : ''}>
                    <td className="font-semibold text-cyan">{row.var}</td>
                    <td>{row.mean}</td>
                    <td>{row.sd}</td>
                    <td className="font-bold text-yellow">{row.cv}</td>
                    <td>{row.min}</td>
                    <td>{row.q1}</td>
                    <td className="font-bold text-green">{row.med}</td>
                    <td>{row.q3}</td>
                    <td>{row.q90}</td>
                    <td>{row.q95}</td>
                    <td>{row.iqr}</td>
                    <td>{row.max}</td>
                    <td className={parseFloat(row.skew) > 10 ? 'text-red font-semibold' : 'text-muted'}>{row.skew}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Interpretações das Medidas Descritivas */}
          <div className="origin-cards-grid" style={{ marginTop: '24px' }}>
            <div className="origin-box">
              <h4 className="text-yellow">Valor_Original (R$)</h4>
              <p style={{ lineHeight: '1.6', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                a média é de R$ 26.225.491,98 e a mediana, de R$ 3.441.387,15, indicando influência de contratos com valores muito elevados sobre a média. Aproximadamente 25% dos contratos possuem valor de até R$ 712.743,14, enquanto cerca de 25% apresentam valor superior a R$ 16.745.151,00. O percentil 95 é de R$ 105.103.475,39; portanto, aproximadamente 5% dos contratos superam esse valor. A assimetria positiva elevada (14,77), o CV de 387,36% e o máximo de R$ 3.345.927.317,66 evidenciam forte dispersão e presença de valores extremos.
              </p>
            </div>

            <div className="origin-box">
              <h4 className="text-cyan">Capital_Social_Receita (R$)</h4>
              <p style={{ lineHeight: '1.6', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                a mediana é de R$ 5.000.000,00. Aproximadamente 25% das observações possuem valor de até R$ 500.000,00, enquanto cerca de 25% apresentam valor superior a R$ 55.693.962,00. O percentil 95 é de R$ 1.115.078.257,20 e o máximo chega a R$ 65.000.000.000,00. A assimetria de 16,40 e o CV de 674,07% demonstram forte heterogeneidade; assim, a mediana e os quartis descrevem melhor o comportamento típico da variável.
              </p>
            </div>

            <div className="origin-box">
              <h4 className="text-green">duracao_planejada_dias</h4>
              <p style={{ lineHeight: '1.6', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                a duração média é de 1.076 dias, aproximadamente 2,95 anos, e a mediana é de 1.094 dias, próxima de três anos. Aproximadamente 25% dos contratos possuem duração planejada de até 754 dias, enquanto 25% possuem duração superior a 1.334 dias. O percentil 95 é de 1.824 dias, aproximadamente cinco anos. A assimetria próxima de zero (-0,03) sugere distribuição aproximadamente simétrica, enquanto o CV de 39,13% indica dispersão moderada.
              </p>
            </div>

            <div className="origin-box">
              <h4 style={{ color: '#38bdf8' }}>qtd_cont_5a_forn</h4>
              <p style={{ lineHeight: '1.6', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                o primeiro quartil, a mediana e o terceiro quartil são iguais a zero, indicando que pelo menos 75% dos registros não possuem contratos elegíveis na janela de cinco anos. O percentil 90 é igual a 3 e o percentil 95 é igual a 10. A elevada assimetria e o máximo de 5.922 contratos revelam que poucos fornecedores concentram históricos contratuais muito elevados. A variável fl_sem_historico_5a identifica os registros sem histórico elegível.
              </p>
            </div>

            <div className="origin-box">
              <h4 style={{ color: '#a78bfa' }}>Quantidades de aditivos (qtd_adit_prazo_5a, qtd_adit_pv_5a e qtd_adit_val_5a)</h4>
              <p style={{ lineHeight: '1.6', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                As quantidades de aditivos (qtd_adit_prazo_5a, qtd_adit_pv_5a e qtd_adit_val_5a) apresentam primeiro quartil, mediana e terceiro quartil iguais a zero, indicando ausência de ocorrências em pelo menos 75% dos registros. O percentil 95 é igual a 1 para aditivos de prazo e de prazo e valor, e igual a zero para aditivos de valor, evidenciando eventos pouco frequentes.
              </p>
            </div>

            <div className="origin-box">
              <h4 style={{ color: '#f43f5e' }}>Taxa geral de aditivos (tx_adit_geral_5a)</h4>
              <p style={{ lineHeight: '1.6', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                A taxa de aditivos geral (tx_adit_geral_5a) também apresenta primeiro quartil, mediana e terceiro quartil iguais a zero, com percentil 95 de 0,20. A interpretação deve distinguir registros sem histórico elegível (qtd_cont_5a_forn = 0), para os quais não há denominador para cálculo da taxa, de registros com histórico e taxa zero, que representam ausência observada de aditivos.
              </p>
            </div>
          </div>

          {/* Distribuição por Porte da Empresa (Receita Federal) - Maioria Demais (Médio/Grande) */}
          <div className="section-card glass-panel" style={{ marginTop: '24px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
            <div className="section-header-row" style={{ marginBottom: '14px' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: '600', margin: 0 }}>
                  Distribuição Cadastral por Porte da Empresa (Receita Federal)
                </h4>
                <p className="card-text-muted" style={{ fontSize: '0.84rem', marginTop: '4px' }}>
                  A grande maioria dos contratos corporativos analisados pertence a empresas de <strong>Médio e Grande Porte (Demais)</strong>.
                </p>
              </div>
              <div className="cv-legend-badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                <span>Maioria Absoluta: 77,1% (4.461 contratos)</span>
              </div>
            </div>

            {/* Barra Visual Proporcional de Porte */}
            <div style={{ display: 'flex', height: '36px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', marginBottom: '16px' }}>
              <div style={{ width: '77.09%', background: 'linear-gradient(90deg, #0284c7, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.82rem', fontWeight: 'bold' }}>
                Demais (Médio / Grande): 77,1% (4.461)
              </div>
              <div style={{ width: '11.89%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold' }}>
                EPP: 11,9% (688)
              </div>
              <div style={{ width: '9.05%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold' }}>
                ME: 9,1% (524)
              </div>
              <div style={{ width: '1.97%', background: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.65rem' }}>
                Ext: 2%
              </div>
            </div>

            {/* Grid dos Portes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px', background: 'rgba(56, 189, 248, 0.08)', borderRadius: '6px', borderLeft: '3px solid #38bdf8' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#38bdf8', fontWeight: '600' }}>Maioria Expressiva</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f8fafc', marginTop: '2px' }}>77,1% (4.461)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Demais (Médio / Grande Porte)</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '6px', borderLeft: '3px solid #10b981' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#10b981', fontWeight: '600' }}>Pequeno Porte</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f8fafc', marginTop: '2px' }}>11,9% (688)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Empresa de Pequeno Porte (EPP)</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '6px', borderLeft: '3px solid #f59e0b' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#f59e0b', fontWeight: '600' }}>Microempresa</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f8fafc', marginTop: '2px' }}>9,1% (524)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Microempresa (ME)</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(100, 116, 139, 0.08)', borderRadius: '6px', borderLeft: '3px solid #64748b' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '600' }}>Internacional</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f8fafc', marginTop: '2px' }}>2,0% (114)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Não Encontrado / Exterior</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEÇÃO 5: Análise Bivariada, Boxplots & Testes de Hipótese */}
      {subTab === 'bivariada' && (
        <div className="section-card glass-panel">
          <div className="section-header-row">
            <div>
              <h3 className="card-inner-title">Análise Bidimensional: Contraste Direto "Sem Aditivo (0)" vs "Com Aditivo (1)"</h3>
              <p className="card-text-muted">
                Resultados formais do <strong>Teste Não-Paramétrico de Mann-Whitney U</strong> e comparação de quartis (Seção 6.2 do relatório):
              </p>
            </div>
            <div className="cv-legend-badge">
              <span>Significância p &lt; 0,0001 em todas as variáveis</span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="eda-table">
              <thead>
                <tr>
                  <th>Variável Analisada</th>
                  <th>Sem: Q1</th>
                  <th>Sem: Mediana (Q2)</th>
                  <th>Sem: Q3</th>
                  <th>Sem: Q95</th>
                  <th>Com: Q1</th>
                  <th>Com: Mediana (Q2)</th>
                  <th>Com: Q3</th>
                  <th>Com: Q95</th>
                  <th>Estatística U</th>
                  <th>p-valor</th>
                  <th>Hipótese H₀ (Igualdade de Mediana da Distribuição)</th>
                </tr>
              </thead>
              <tbody>
                {mannWhitneyTests.map((row, idx) => (
                  <tr key={idx} className={row.var.includes('Valor') || row.var.includes('duracao') ? 'highlight-row' : ''}>
                    <td className="font-semibold text-cyan">{row.var}</td>
                    <td>{row.semQ1}</td>
                    <td className="font-bold text-green">{row.semMed}</td>
                    <td>{row.semQ3}</td>
                    <td>{row.semQ95}</td>
                    <td>{row.comQ1}</td>
                    <td className="font-bold text-red">{row.comMed}</td>
                    <td>{row.comQ3}</td>
                    <td>{row.comQ95}</td>
                    <td>{row.statU}</td>
                    <td className="font-bold text-green">{row.pval}</td>
                    <td className="font-bold text-red">{row.h0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Interpretação Estatística dos Testes de Mann-Whitney U */}
          <div className="section-card glass-panel" style={{ marginTop: '22px', background: 'rgba(15, 23, 42, 0.45)', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
            <h4 style={{ color: '#38bdf8', marginBottom: '12px', fontSize: '1rem', fontWeight: '600' }}>
              Interpretação dos Testes Estatísticos de Hipótese (Mann-Whitney U)
            </h4>
            <p style={{ lineHeight: '1.65', fontSize: '0.88rem', color: 'var(--text-main)', margin: '0 0 10px 0' }}>
              Os testes de Mann-Whitney U rejeitaram a hipótese de igualdade de mediana da distribuição para todas as variáveis analisadas (p &lt; 0,0001). Portanto, contratos com e sem aditivo apresentam perfis estatisticamente distintos.
            </p>
            <p style={{ lineHeight: '1.65', fontSize: '0.88rem', color: 'var(--text-main)', margin: '0 0 10px 0' }}>
              Os contratos aditivados possuem valor original mediano de R$ 6,38 milhões, aproximadamente 4,8 vezes superior ao dos contratos sem aditivo (R$ 1,34 milhão). Também apresentam duração planejada ligeiramente maior na mediana — 1.124 contra 1.094 dias —, mas a diferença se torna mais evidente nos contratos mais longos: o terceiro quartil passa de 1.096 para 1.459 dias.
            </p>
            <p style={{ lineHeight: '1.65', fontSize: '0.88rem', color: 'var(--text-main)', margin: 0 }}>
              O capital social mediano das contratadas com aditivo é de R$ 7,0 milhões, mais que o dobro do grupo sem aditivo (R$ 3,0 milhões), sugerindo associação entre contratos de maior porte e maior ocorrência de aditamentos.
            </p>
          </div>

          {/* Boxplots Bivariados - Apenas variáveis numéricas (Valores e Duração) */}
          <div className="bivariate-img-preview" style={{ marginTop: '24px' }}>
            <h4 style={{ marginBottom: '12px', color: 'var(--text-main)' }}>Boxplots Bivariados: Contraste das Variáveis Numéricas vs fl_aditivo:</h4>
            <div className="img-frame-card" onClick={() => setSelectedImg('/eda_graficos/02_boxplots_bivariados_variaveis_vs_target.png?v=3panels')}>
              <img 
                src="/eda_graficos/02_boxplots_bivariados_variaveis_vs_target.png?v=3panels" 
                alt="Boxplots Bivariados das Variáveis Numéricas vs Target"
                className="eda-responsive-img" 
              />
              <div className="img-zoom-hint">Clique para ampliar o gráfico em alta resolução</div>
            </div>
          </div>

          {/* Teste Qui-Quadrado Categórico - Mantido ABAIXO do boxplot conforme solicitado */}
          <div style={{ marginTop: '28px' }}>
            <h4 style={{ marginBottom: '12px', color: 'var(--text-main)', fontSize: '1.05rem' }}>
              Associação das Categóricas com fl_aditivo (Teste Qui-Quadrado & V de Cramér)
            </h4>
            <div className="table-responsive">
              <table className="eda-table">
                <thead>
                  <tr>
                    <th>Variável</th>
                    <th>Categoria Avaliada</th>
                    <th>% Sem Aditivo (0)</th>
                    <th>% Com Aditivo (1)</th>
                    <th>Total Contratos (N)</th>
                    <th>Chi² (Graus Liberdade)</th>
                    <th>p-valor</th>
                    <th>V de Cramér</th>
                  </tr>
                </thead>
                <tbody>
                  {chiSquareTests.map((r, i) => (
                    <tr key={i} className={r.com.includes('6') ? 'highlight-row' : ''}>
                      <td className="font-semibold text-cyan">{r.var}</td>
                      <td style={{ textAlign: 'left' }}>{r.cat}</td>
                      <td>{r.sem}</td>
                      <td className={parseFloat(r.com) > 60 ? 'font-bold text-red' : 'font-bold'}>{r.com}</td>
                      <td>{r.n}</td>
                      <td>{r.chi2}</td>
                      <td>{r.pval}</td>
                      <td className="font-bold text-yellow">{r.cramer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SEÇÃO 6: Insights para Modelagem e Correlação */}
      {subTab === 'insights' && (
        <div className="section-card glass-panel">
          <h3 className="card-inner-title">Síntese dos Insights da EDA e Implicações Metodológicas na Modelagem</h3>
          <p className="card-text-muted">
            Matriz de rastreabilidade entre os achados estatísticos da EDA e as decisões de engenharia e algoritmos adotadas no projeto (Seção 8 do relatório técnico):
          </p>

          <div className="table-responsive" style={{ marginTop: '16px' }}>
            <table className="eda-table" style={{ textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ width: '28%' }}>Achado Estatístico da EDA</th>
                  <th style={{ width: '36%' }}>Decisão Metodológica no Pipeline</th>
                  <th style={{ width: '36%' }}>Impacto no Desempenho dos Modelos</th>
                </tr>
              </thead>
              <tbody>
                {modelingInsights.map((row, idx) => (
                  <tr key={idx}>
                    <td className="font-semibold text-yellow" style={{ fontSize: '0.82rem' }}>{row.finding}</td>
                    <td className="text-cyan" style={{ fontSize: '0.82rem' }}>{row.decision}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{row.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bivariate-img-preview" style={{ marginTop: '24px' }}>
            <h4 style={{ marginBottom: '12px', color: 'var(--text-main)' }}>Matriz de Correlação de Spearman Estratificada:</h4>
            <div className="img-frame-card" onClick={() => setSelectedImg('/eda_graficos/05_matriz_correlacao_spearman_estratificada.png')}>
              <img 
                src="/eda_graficos/05_matriz_correlacao_spearman_estratificada.png" 
                alt="Matriz de Correlação de Spearman"
                className="eda-responsive-img" 
              />
              <div className="img-zoom-hint">Clique para ampliar o heatmap de correlação</div>
            </div>
          </div>
        </div>
      )}

      {/* SEÇÃO 7: Galeria de Gráficos em Alta Resolução */}
      {subTab === 'graficos' && (
        <div className="section-card glass-panel">
          <h3 className="card-inner-title">Galeria de Gráficos Diagnósticos em Alta Resolução</h3>
          <p className="card-text-muted">
            Painel visual com as 5 figuras geradas na esteira de auditoria exploratória. Clique sobre qualquer imagem para visualizar em tela cheia com zoom interativo.
          </p>

          <div className="gallery-grid">
            {edaCharts.map((ch) => (
              <div key={ch.id} className="gallery-card" onClick={() => setSelectedImg(`/eda_graficos/${ch.id}`)}>
                <div className="gallery-img-wrapper">
                  <img src={`/eda_graficos/${ch.id}`} alt={ch.title} loading="lazy" />
                  <div className="gallery-overlay">
                    <span>Expandir em Alta Resolução</span>
                  </div>
                </div>
                <div className="gallery-meta">
                  <h4>{ch.title}</h4>
                  <p>{ch.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Interativo de Zoom de Imagens */}
      {selectedImg && (
        <div className="eda-modal-overlay" onClick={() => setSelectedImg(null)}>
          <div className="eda-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="eda-modal-close" onClick={() => setSelectedImg(null)}>✕</button>
            <img src={selectedImg} alt="Visualização em alta resolução" className="eda-modal-img" />
          </div>
        </div>
      )}
    </div>
  );
}
