import React, { useState, useMemo } from 'react';

export default function ClusteringView() {
  const [subTab, setSubTab] = useState('perfil'); // 'perfil' | 'escoragem'

  // Clusters oficiais Cenário 1 (K-Means MinMaxScaler, k=3)
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

  // Tabela Estatística Exaustiva por Cluster (Perfil dos clusters)
  const clusterDescriptiveStats = [
    // Cluster 0 — Trienais Padrão (Intermediário)
    {
      clusterId: 0,
      clusterNome: 'Cluster 0 — Trienais Padrão',
      clusterSub: 'N = 2.738 (47,3%) • Tx Adit: 54,87%',
      cor: '#3b82f6',
      variavel: 'Valor_Original (R$)',
      media: '23.146.285,90',
      mediana: '2.846.845,26',
      desvPad: '85.251.117,50',
      cv: '368,31%',
      p5: '49.409,42',
      q1: '508.093,76',
      q3: '14.489.870,58',
      p95: '99.086.301,74',
      min: '0,01',
      max: '1.779.375.002,66',
    },
    {
      clusterId: 0,
      clusterNome: 'Cluster 0 — Trienais Padrão',
      clusterSub: 'N = 2.738 (47,3%) • Tx Adit: 54,87%',
      cor: '#3b82f6',
      variavel: 'duracao_planejada_dias',
      media: '1.101,39',
      mediana: '1.094,00',
      desvPad: '99,80',
      cv: '9,06%',
      p5: '899,00',
      q1: '1.094,00',
      q3: '1.124,00',
      p95: '1.283,30',
      min: '832,00',
      max: '1.370,00',
    },
    {
      clusterId: 0,
      clusterNome: 'Cluster 0 — Trienais Padrão',
      clusterSub: 'N = 2.738 (47,3%) • Tx Adit: 54,87%',
      cor: '#3b82f6',
      variavel: 'Capital_Social_Receita (R$)',
      media: '220.747.431,62',
      mediana: '4.650.000,00',
      desvPad: '1.348.656.014,38',
      cv: '610,95%',
      p5: '20.000,00',
      q1: '500.000,00',
      q3: '40.000.000,00',
      p95: '842.999.412,29',
      min: '0,00',
      max: '27.893.743.356,11',
    },
    {
      clusterId: 0,
      clusterNome: 'Cluster 0 — Trienais Padrão',
      clusterSub: 'N = 2.738 (47,3%) • Tx Adit: 54,87%',
      cor: '#3b82f6',
      variavel: 'qtd_cont_5a_forn',
      media: '5,77',
      mediana: '0,00',
      desvPad: '55,40',
      cv: '960,14%',
      p5: '0,00',
      q1: '0,00',
      q3: '0,00',
      p95: '5,00',
      min: '0,00',
      max: '1.557,00',
    },

    // Cluster 1 — Curtos / Operacionais
    {
      clusterId: 1,
      clusterNome: 'Cluster 1 — Fornecimentos e Curtos',
      clusterSub: 'N = 1.666 (28,8%) • Tx Adit: 44,15%',
      cor: '#10b981',
      variavel: 'Valor_Original (R$)',
      media: '15.129.115,06',
      mediana: '2.069.783,28',
      desvPad: '39.970.574,32',
      cv: '264,19%',
      p5: '67.117,88',
      q1: '497.996,62',
      q3: '11.077.931,69',
      p95: '69.964.906,68',
      min: '0,01',
      max: '538.377.651,45',
    },
    {
      clusterId: 1,
      clusterNome: 'Cluster 1 — Fornecimentos e Curtos',
      clusterSub: 'N = 1.666 (28,8%) • Tx Adit: 44,15%',
      cor: '#10b981',
      variavel: 'duracao_planejada_dias',
      media: '562,47',
      mediana: '640,00',
      desvPad: '205,55',
      cv: '36,54%',
      p5: '179,00',
      q1: '386,50',
      q3: '729,00',
      p95: '789,00',
      min: '0,00',
      max: '831,00',
    },
    {
      clusterId: 1,
      clusterNome: 'Cluster 1 — Fornecimentos e Curtos',
      clusterSub: 'N = 1.666 (28,8%) • Tx Adit: 44,15%',
      cor: '#10b981',
      variavel: 'Capital_Social_Receita (R$)',
      media: '277.367.475,79',
      mediana: '3.600.000,00',
      desvPad: '1.622.387.207,85',
      cv: '584,92%',
      p5: '1.900,00',
      q1: '500.000,00',
      q3: '31.211.487,00',
      p95: '855.000.000,00',
      min: '0,00',
      max: '32.538.937.370,00',
    },
    {
      clusterId: 1,
      clusterNome: 'Cluster 1 — Fornecimentos e Curtos',
      clusterSub: 'N = 1.666 (28,8%) • Tx Adit: 44,15%',
      cor: '#10b981',
      variavel: 'qtd_cont_5a_forn',
      media: '59,22',
      mediana: '0,00',
      desvPad: '426,87',
      cv: '720,82%',
      p5: '0,00',
      q1: '0,00',
      q3: '3,00',
      p95: '81,00',
      min: '0,00',
      max: '5.922,00',
    },

    // Cluster 2 — Longa Duração e Megacontratos
    {
      clusterId: 2,
      clusterNome: 'Cluster 2 — Longa Duração / Megacontratos',
      clusterSub: 'N = 1.383 (23,9%) • Tx Adit: 83,92%',
      cor: '#ef4444',
      variavel: 'Valor_Original (R$)',
      media: '45.727.016,80',
      mediana: '7.699.999,80',
      desvPad: '162.395.261,26',
      cv: '355,14%',
      p5: '232.344,41',
      q1: '2.017.992,76',
      q3: '27.294.089,86',
      p95: '190.706.021,20',
      min: '0,01',
      max: '3.345.927.317,66',
    },
    {
      clusterId: 2,
      clusterNome: 'Cluster 2 — Longa Duração / Megacontratos',
      clusterSub: 'N = 1.383 (23,9%) • Tx Adit: 83,92%',
      cor: '#ef4444',
      variavel: 'duracao_planejada_dias',
      media: '1.641,48',
      mediana: '1.614,00',
      desvPad: '177,99',
      cv: '10,84%',
      p5: '1.448,00',
      q1: '1.459,00',
      q3: '1.824,00',
      p95: '1.824,00',
      min: '1.318,00',
      max: '2.312,00',
    },
    {
      clusterId: 2,
      clusterNome: 'Cluster 2 — Longa Duração / Megacontratos',
      clusterSub: 'N = 1.383 (23,9%) • Tx Adit: 83,92%',
      cor: '#ef4444',
      variavel: 'Capital_Social_Receita (R$)',
      media: '777.837.292,59',
      mediana: '11.995.230,00',
      desvPad: '4.367.266.021,28',
      cv: '561,46%',
      p5: '10.000,00',
      q1: '800.000,00',
      q3: '200.089.899,00',
      p95: '2.180.359.953,00',
      min: '0,00',
      max: '65.000.000.000,00',
    },
    {
      clusterId: 2,
      clusterNome: 'Cluster 2 — Longa Duração / Megacontratos',
      clusterSub: 'N = 1.383 (23,9%) • Tx Adit: 83,92%',
      cor: '#ef4444',
      variavel: 'qtd_cont_5a_forn',
      media: '0,05',
      mediana: '0,00',
      desvPad: '0,47',
      cv: '940,00%',
      p5: '0,00',
      q1: '0,00',
      q3: '0,00',
      p95: '0,00',
      min: '0,00',
      max: '7,00',
    },
  ];

  // -------------------------------------------------------------
  // ESTADOS E DADOS PARA A ABA DE ESCORAGEM DE NOVOS CONTRATOS
  // -------------------------------------------------------------
  const SCALER_PARAMS = {
    min: [0.01, 0.0, 0.0, 0.0],
    max: [3345927317.66, 2312.0, 65000000000.0, 5922.0],
  };

  const CENTROIDS = [
    [0.00692011, 0.47642639, 0.00339734, 0.00097549], // Cluster 0: Trienais
    [0.00451921, 0.24335212, 0.00426465, 0.00999363], // Cluster 1: Curtos
    [0.01366647, 0.70998649, 0.01196673, 0.00000819], // Cluster 2: Megacontratos
  ];

  const PRESETS_CLUSTER = {
    trienal: {
      nome: '⚖️ Contrato Trienal Padrão (3 Anos)',
      data: {
        Valor_Original: 2800000,
        duracao_planejada_dias: 1095,
        Capital_Social_Receita: 5000000,
        qtd_cont_5a_forn: 2,
      },
    },
    curto: {
      nome: '🛡️ Fornecimento / Prazo Curto (6 Meses)',
      data: {
        Valor_Original: 450000,
        duracao_planejada_dias: 180,
        Capital_Social_Receita: 1200000,
        qtd_cont_5a_forn: 1,
      },
    },
    megaprojeto: {
      nome: '🚨 Megaprojeto de Engenharia / EPC (>4 Anos)',
      data: {
        Valor_Original: 42000000,
        duracao_planejada_dias: 1825,
        Capital_Social_Receita: 85000000,
        qtd_cont_5a_forn: 5,
      },
    },
    novo_forn: {
      nome: '🏢 Novo Fornecedor Sem Histórico',
      data: {
        Valor_Original: 1850000,
        duracao_planejada_dias: 730,
        Capital_Social_Receita: 3000000,
        qtd_cont_5a_forn: 0,
      },
    },
  };

  const [inputContrato, setInputContrato] = useState(PRESETS_CLUSTER.trienal.data);

  // Amostra oficial de 10 contratos anônimos (amostra_contratos_cluster.csv)
  const SAMPLE_CONTRACTS = [
    // --- CLUSTER 2: Longa Duração e Megacontratos (Alto Risco) ---
    {
      id: 'CTR-TEST-001',
      servico: 'Serviços integrados de manutenção e caldeiraria industrial',
      valorOriginal: 88926722.84,
      duracaoDias: 1519,
      capitalSocial: 55982115.0,
      qtdCont: 0,
      clusterId: 2,
      clusterNome: 'Cluster 2 — Longa Duração e Megacontratos',
      perfilRisco: 'CRÍTICO (ALTO RISCO)',
      cor: '#ef4444',
      taxaHistorica: '83,92%',
      acao: 'Comitê dedicado de governança, auditoria preventiva contínua e provisão orçamentária.',
    },
    {
      id: 'CTR-TEST-002',
      servico: 'Serviços de engenharia, planejamento e integridade de ativos',
      valorOriginal: 17473921.48,
      duracaoDias: 1519,
      capitalSocial: 29178092.0,
      qtdCont: 0,
      clusterId: 2,
      clusterNome: 'Cluster 2 — Longa Duração e Megacontratos',
      perfilRisco: 'CRÍTICO (ALTO RISCO)',
      cor: '#ef4444',
      taxaHistorica: '83,92%',
      acao: 'Comitê dedicado de governança, auditoria preventiva contínua e provisão orçamentária.',
    },
    {
      id: 'CTR-TEST-003',
      servico: 'EPC, montagem eletromecânica e infraestrutura industrial pesada',
      valorOriginal: 115325712.08,
      duracaoDias: 1904,
      capitalSocial: 40000000.0,
      qtdCont: 0,
      clusterId: 2,
      clusterNome: 'Cluster 2 — Longa Duração e Megacontratos',
      perfilRisco: 'CRÍTICO (ALTO RISCO)',
      cor: '#ef4444',
      taxaHistorica: '83,92%',
      acao: 'Comitê dedicado de governança, auditoria preventiva contínua e provisão orçamentária.',
    },

    // --- CLUSTER 0: Contratos Trienais Padrão (Risco Moderado) ---
    {
      id: 'CTR-TEST-004',
      servico: 'Serviço de brigada civil e resposta a emergências',
      valorOriginal: 20902058.11,
      duracaoDias: 1094,
      capitalSocial: 15285430.0,
      qtdCont: 0,
      clusterId: 0,
      clusterNome: 'Cluster 0 — Contratos Trienais Padrão',
      perfilRisco: 'MODERADO (ATENÇÃO)',
      cor: '#3b82f6',
      taxaHistorica: '54,87%',
      acao: 'Acompanhamento preventivo semestral e conferência de marcos no 24º mês.',
    },
    {
      id: 'CTR-TEST-005',
      servico: 'Manutenção de turbogeradores e sistemas de geração de energia',
      valorOriginal: 16933396.39,
      duracaoDias: 1094,
      capitalSocial: 5771410796.0,
      qtdCont: 0,
      clusterId: 0,
      clusterNome: 'Cluster 0 — Contratos Trienais Padrão',
      perfilRisco: 'MODERADO (ATENÇÃO)',
      cor: '#3b82f6',
      taxaHistorica: '54,87%',
      acao: 'Acompanhamento preventivo semestral e conferência de marcos no 24º mês.',
    },
    {
      id: 'CTR-TEST-006',
      servico: 'Pesquisa aplicada, ensaios laboratoriais e certificação de materiais',
      valorOriginal: 4730291.00,
      duracaoDias: 1094,
      capitalSocial: 320039400.65,
      qtdCont: 0,
      clusterId: 0,
      clusterNome: 'Cluster 0 — Contratos Trienais Padrão',
      perfilRisco: 'MODERADO (ATENÇÃO)',
      cor: '#3b82f6',
      taxaHistorica: '54,87%',
      acao: 'Acompanhamento preventivo semestral e conferência de marcos no 24º mês.',
    },

    // --- CLUSTER 1: Fornecimentos e Contratos Curtos (Baixo Risco) ---
    {
      id: 'CTR-TEST-007',
      servico: 'Monitoramento biológico marinho e consultoria em SMS',
      valorOriginal: 266684.88,
      duracaoDias: 544,
      capitalSocial: 200000.0,
      qtdCont: 0,
      clusterId: 1,
      clusterNome: 'Cluster 1 — Fornecimentos e Curtos',
      perfilRisco: 'BAIXO RISCO (SEGURO)',
      cor: '#10b981',
      taxaHistorica: '44,15%',
      acao: 'Fiscalização ordinária por amostragem e liquidação de medições padronizadas.',
    },
    {
      id: 'CTR-TEST-008',
      servico: 'Estudos ambientais de descarbonização e pegada ecológica',
      valorOriginal: 197370.00,
      duracaoDias: 364,
      capitalSocial: 5000.0,
      qtdCont: 0,
      clusterId: 1,
      clusterNome: 'Cluster 1 — Fornecimentos e Curtos',
      perfilRisco: 'BAIXO RISCO (SEGURO)',
      cor: '#10b981',
      taxaHistorica: '44,15%',
      acao: 'Fiscalização ordinária por amostragem e liquidação de medições padronizadas.',
    },
    {
      id: 'CTR-TEST-009',
      servico: 'Treinamentos técnicos de segurança operacional industrial',
      valorOriginal: 250000.0,
      duracaoDias: 364,
      capitalSocial: 5000.0,
      qtdCont: 0,
      clusterId: 1,
      clusterNome: 'Cluster 1 — Fornecimentos e Curtos',
      perfilRisco: 'BAIXO RISCO (SEGURO)',
      cor: '#10b981',
      taxaHistorica: '44,15%',
      acao: 'Fiscalização ordinária por amostragem e liquidação de medições padronizadas.',
    },
    {
      id: 'CTR-TEST-010',
      servico: 'Serviço pontual de consultoria e laudos periciais mecânicos',
      valorOriginal: 164955.0,
      duracaoDias: 179,
      capitalSocial: 1000.0,
      qtdCont: 0,
      clusterId: 1,
      clusterNome: 'Cluster 1 — Fornecimentos e Curtos',
      perfilRisco: 'BAIXO RISCO (SEGURO)',
      cor: '#10b981',
      taxaHistorica: '44,15%',
      acao: 'Fiscalização ordinária por amostragem e liquidação de medições padronizadas.',
    },
  ];

  // Cálculo matemático exato da escoragem (K-Means Cenário 1 com MinMaxScaler)
  const escoragemResultado = useMemo(() => {
    const raw = [
      Math.max(0.01, parseFloat(inputContrato.Valor_Original) || 0.01),
      Math.max(0, parseFloat(inputContrato.duracao_planejada_dias) || 0),
      Math.max(0, parseFloat(inputContrato.Capital_Social_Receita) || 0),
      Math.max(0, parseFloat(inputContrato.qtd_cont_5a_forn) || 0),
    ];

    const scaled = raw.map((val, i) => {
      const min = SCALER_PARAMS.min[i];
      const max = SCALER_PARAMS.max[i];
      const s = (val - min) / (max - min);
      return Math.min(1.0, Math.max(0.0, s));
    });

    const distances = CENTROIDS.map((c) => {
      const sumSq = c.reduce((acc, centroidVal, i) => {
        const diff = scaled[i] - centroidVal;
        return acc + diff * diff;
      }, 0);
      return Math.sqrt(sumSq);
    });

    let bestCluster = 0;
    let minDistance = distances[0];
    for (let k = 1; k < distances.length; k++) {
      if (distances[k] < minDistance) {
        minDistance = distances[k];
        bestCluster = k;
      }
    }

    // Afinidade percentual inversa da distância
    const maxDist = Math.max(...distances) + 0.001;
    const affinities = distances.map((d) => Math.max(0, 1 - d / maxDist));
    const sumAffinity = affinities.reduce((a, b) => a + b, 0);
    const affinityPcts = affinities.map((a) => ((a / sumAffinity) * 100).toFixed(1));

    return {
      clusterId: bestCluster,
      clusterData: clusters[bestCluster],
      distances,
      affinityPcts,
      scaled,
    };
  }, [inputContrato]);

  const carregarNoEscorador = (contrato) => {
    setInputContrato({
      Valor_Original: contrato.valorOriginal,
      duracao_planejada_dias: contrato.duracaoDias,
      Capital_Social_Receita: contrato.capitalSocial,
      qtd_cont_5a_forn: contrato.qtdCont,
    });
    // Rola suavemente até o escorador
    const el = document.getElementById('escorador-form-anchor');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="clustering-layout animate-fade-in">
      <div className="glass-panel section-card">
        {/* Navegação por Sub-Abas do Pilar 2 */}
        <div className="eda-subnav" style={{ marginBottom: '24px', display: 'flex', gap: '10px' }}>
          <button
            className={`subnav-btn ${subTab === 'perfil' ? 'active' : ''}`}
            onClick={() => setSubTab('perfil')}
            id="cluster-subtab-perfil"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>📊</span>
            <span>1. Perfis dos Clusters & Estatísticas</span>
          </button>
          <button
            className={`subnav-btn ${subTab === 'escoragem' ? 'active' : ''}`}
            onClick={() => setSubTab('escoragem')}
            id="cluster-subtab-escoragem"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>🎯</span>
            <span>2. Indicador de Perfis de Novos Contratos (Escoragem)</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* SUB-ABA 1: CARACTERIZAÇÃO E DIAGNÓSTICO DOS CLUSTERS          */}
        {/* ============================================================== */}
        {subTab === 'perfil' && (
          <div>
            <div className="section-header-row">
              <div>
                <h2 className="section-title">🧩 Pilar 2: Agrupamento / Clusterização de Fornecedores (Não Supervisionado)</h2>
                <p className="section-desc">
                  Segmentação comportamental via <strong>K-Means (Cenário 1 com MinMaxScaler)</strong>.
                </p>
              </div>
              <span className="badge badge-champion">K-Means (K=3) • MinMaxScaler</span>
            </div>

            {/* KPIs Metodológicos */}
            <div className="metrics-cards-sidebar" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', margin: '20px 0' }}>
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

            {/* Tabela de Medidas Descritivas Completas (Perfil dos clusters) */}
            <div style={{ marginTop: '36px' }}>
              <div className="section-header-row" style={{ marginBottom: '12px' }}>
                <div>
                  <h3 className="card-subtitle" style={{ fontSize: '1.18rem', margin: 0 }}>Perfil dos clusters</h3>
                  <p className="card-text-muted" style={{ marginTop: '4px' }}>
                    Medidas descritivas completas de tendência central, dispersão absoluta, separatrizes e Coeficiente de Variação (CV%) calculadas por cluster.
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
                      <th style={{ textAlign: 'left', minWidth: '220px' }}>Cluster</th>
                      <th style={{ textAlign: 'left', minWidth: '180px' }}>Variável Analisada</th>
                      <th>Média (μ)</th>
                      <th>Mediana (Q₂)</th>
                      <th>Desvio Padrão (σ)</th>
                      <th>Coef. Variação (CV%)</th>
                      <th>P5 (5%)</th>
                      <th>Q1 (25%)</th>
                      <th>Q3 (75%)</th>
                      <th>P95 (95%)</th>
                      <th>Mínimo</th>
                      <th>Máximo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clusterDescriptiveStats.map((row, idx) => {
                      const isNewCluster = idx % 4 === 0;
                      const isEndOfCluster = idx % 4 === 3;
                      return (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: isEndOfCluster ? '2px solid rgba(255, 255, 255, 0.14)' : '1px solid rgba(255, 255, 255, 0.04)',
                          }}
                        >
                          {isNewCluster && (
                            <td
                              rowSpan={4}
                              style={{
                                verticalAlign: 'middle',
                                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                                background: 'rgba(15, 23, 42, 0.65)',
                                padding: '16px 14px',
                                textAlign: 'left',
                              }}
                            >
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <span
                                  className="badge"
                                  style={{
                                    backgroundColor: `${row.cor}20`,
                                    color: row.cor,
                                    borderColor: row.cor,
                                    width: 'fit-content',
                                  }}
                                >
                                  Cluster {row.clusterId}
                                </span>
                                <strong style={{ color: row.cor, fontSize: '0.88rem' }}>{row.clusterNome}</strong>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{row.clusterSub}</span>
                              </div>
                            </td>
                          )}
                          <td style={{ textAlign: 'left', fontWeight: 600, color: 'var(--petro-cyan)' }}>
                            {row.variavel}
                          </td>
                          <td>{row.media}</td>
                          <td style={{ fontWeight: 700, color: 'var(--petro-green)' }}>{row.mediana}</td>
                          <td>{row.desvPad}</td>
                          <td style={{ fontWeight: 700, color: 'var(--petro-yellow)' }}>{row.cv}</td>
                          <td>{row.p5}</td>
                          <td>{row.q1}</td>
                          <td>{row.q3}</td>
                          <td>{row.p95}</td>
                          <td>{row.min}</td>
                          <td>{row.max}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Galeria de Gráficos de Diagnóstico K-Means */}
            <div style={{ marginTop: '36px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="card-subtitle" style={{ margin: 0 }}>📊 Diagnósticos Gráficos de Agrupamento</h3>
                <span className="badge badge-champion">K-Means Cenário 1</span>
              </div>
              <p className="section-desc" style={{ marginTop: '6px' }}>
                Visualização da dispersão dos clusters no plano das variáveis originais e avaliação do Método do Cotovelo (Inércia).
              </p>

              <div className="charts-gallery-grid">
                <div className="chart-card">
                  <div className="chart-card-header">
                    <span className="chart-card-title">1. Dispersão no Plano das Variáveis Originais</span>
                    <span className="badge" style={{ backgroundColor: '#1e293b' }}>Valor Original × Duração Planejada</span>
                  </div>
                  <div className="chart-img-container">
                    <img
                      src="/cluster_graficos/scatter_clusters_plano_original.png"
                      alt="Dispersão dos Clusters no Plano das Variáveis Originais"
                      className="chart-img"
                      loading="lazy"
                    />
                    <a
                      href="/cluster_graficos/scatter_clusters_plano_original.png"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="chart-zoom-btn"
                      title="Abrir imagem em tamanho real"
                    >
                      🔍 Expandir
                    </a>
                  </div>
                  <p className="chart-card-caption">
                    Dispersão dos contratos no plano de <strong>Valor Original Contratado (R$)</strong> versus <strong>Duração Planejada (dias)</strong>, evidenciando faixas nítidas de estratificação temporal e financeira dos 3 clusters.
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
          </div>
        )}

        {/* ============================================================== */}
        {/* SUB-ABA 2: ESCORAGEM DE NOVOS CONTRATOS (INDICADOR DE PERFIS)  */}
        {/* ============================================================== */}
        {subTab === 'escoragem' && (
          <div className="animate-fade-in" id="escorador-form-anchor">
            <div className="section-header-row">
              <div>
                <h2 className="section-title">🎯 Indicador de Perfis de Novos Contratos — Escoragem K-Means</h2>
                <p className="section-desc">
                  Identificação de grupos de contratos ativos.
                </p>
              </div>
              <span className="badge badge-champion">Cenário 1 • MinMaxScaler (K=3)</span>
            </div>

            {/* Presets de Teste Rápido */}
            <div style={{ margin: '20px 0 16px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                ⚡ Carregar Cenário Típico:
              </span>
              {Object.keys(PRESETS_CLUSTER).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setInputContrato(PRESETS_CLUSTER[key].data)}
                  className="subnav-btn"
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                >
                  {PRESETS_CLUSTER[key].nome}
                </button>
              ))}
            </div>

            {/* Grid Principal: Formulário dos 4 Preditores + Painel do Indicador */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '24px', marginTop: '20px' }}>
              {/* Painel do Formulário */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', background: 'rgba(15, 23, 42, 0.55)' }}>
                <h3 className="card-subtitle" style={{ margin: '0 0 16px', fontSize: '1.05rem', color: 'var(--text-main)' }}>
                  📝 Parâmetros do Novo Contrato em T₀
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* 1. Valor Original */}
                  <div className="input-group">
                    <label htmlFor="cluster_val_orig" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                      <span>1. Valor Original Contratado (R$)</span>
                      <span style={{ color: 'var(--petro-cyan)', fontFamily: 'monospace' }}>
                        {Number(inputContrato.Valor_Original || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </label>
                    <input
                      id="cluster_val_orig"
                      type="number"
                      min="1000"
                      step="50000"
                      value={inputContrato.Valor_Original}
                      onChange={(e) => setInputContrato({ ...inputContrato, Valor_Original: parseFloat(e.target.value) || 0 })}
                      className="text-input"
                      style={{ width: '100%', padding: '10px 14px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}
                    />
                  </div>

                  {/* 2. Duração Planejada em Dias */}
                  <div className="input-group">
                    <label htmlFor="cluster_duracao" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                      <span>2. Duração Planejada (Dias Corridos)</span>
                      <span style={{ color: 'var(--petro-green)', fontWeight: 700 }}>
                        {inputContrato.duracao_planejada_dias} dias (~{(inputContrato.duracao_planejada_dias / 365).toFixed(1)} anos)
                      </span>
                    </label>
                    <input
                      id="cluster_duracao"
                      type="range"
                      min="30"
                      max="2300"
                      step="15"
                      value={inputContrato.duracao_planejada_dias}
                      onChange={(e) => setInputContrato({ ...inputContrato, duracao_planejada_dias: parseInt(e.target.value, 10) || 0 })}
                      style={{ width: '100%', accentColor: 'var(--petro-cyan)', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                      <span>30 dias (~1 mês)</span>
                      <span>1.095 dias (3 anos)</span>
                      <span>2.300 dias (&gt;6 anos)</span>
                    </div>
                  </div>

                  {/* 3. Capital Social da Contratada */}
                  <div className="input-group">
                    <label htmlFor="cluster_cap_social" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                      <span>3. Capital Social da Contratada (RFB em R$)</span>
                      <span style={{ color: 'var(--petro-yellow)', fontFamily: 'monospace' }}>
                        {Number(inputContrato.Capital_Social_Receita || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </label>
                    <input
                      id="cluster_cap_social"
                      type="number"
                      min="0"
                      step="500000"
                      value={inputContrato.Capital_Social_Receita}
                      onChange={(e) => setInputContrato({ ...inputContrato, Capital_Social_Receita: parseFloat(e.target.value) || 0 })}
                      className="text-input"
                      style={{ width: '100%', padding: '10px 14px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}
                    />
                  </div>

                  {/* 4. Histórico Prévio do Fornecedor */}
                  <div className="input-group">
                    <label htmlFor="cluster_qtd_cont" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                      <span>4. Contratos Anteriores na Petrobras (Últimos 5 Anos)</span>
                      <span style={{ color: '#a78bfa', fontWeight: 700 }}>
                        {inputContrato.qtd_cont_5a_forn} {inputContrato.qtd_cont_5a_forn === 1 ? 'contrato' : 'contratos'}
                      </span>
                    </label>
                    <input
                      id="cluster_qtd_cont"
                      type="number"
                      min="0"
                      max="100"
                      value={inputContrato.qtd_cont_5a_forn}
                      onChange={(e) => setInputContrato({ ...inputContrato, qtd_cont_5a_forn: parseInt(e.target.value, 10) || 0 })}
                      className="text-input"
                      style={{ width: '100%', padding: '10px 14px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Painel de Resultado: Indicador de Perfil em T0 */}
              <div
                className="glass-panel"
                style={{
                  padding: '24px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(15, 23, 42, 0.7)',
                  borderTop: `5px solid ${escoragemResultado.clusterData.cor}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: `${escoragemResultado.clusterData.cor}25`,
                        color: escoragemResultado.clusterData.cor,
                        borderColor: escoragemResultado.clusterData.cor,
                        fontSize: '0.82rem',
                        padding: '6px 12px',
                      }}
                    >
                      Cluster {escoragemResultado.clusterId} • Indicador Atribuído
                    </span>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: escoragemResultado.clusterData.cor,
                        background: `${escoragemResultado.clusterData.cor}15`,
                        padding: '4px 10px',
                        borderRadius: '4px',
                        border: `1px solid ${escoragemResultado.clusterData.cor}40`,
                      }}
                    >
                      {escoragemResultado.clusterData.perfil}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '8px', lineHeight: '1.3' }}>
                    {escoragemResultado.clusterData.nome}
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: '1.45' }}>
                    {escoragemResultado.clusterData.descricao}
                  </p>

                  {/* Métricas Chave do Perfil */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                      background: 'rgba(0, 0, 0, 0.25)',
                      padding: '14px',
                      borderRadius: '8px',
                      marginBottom: '18px',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block' }}>
                        Taxa Histórica de Aditivos:
                      </span>
                      <strong style={{ fontSize: '1.3rem', color: escoragemResultado.clusterData.cor }}>
                        {escoragemResultado.clusterData.taxaAditivos}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block' }}>
                        Vigência Típica:
                      </span>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
                        {escoragemResultado.clusterData.duracaoMedia}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block' }}>
                        Mediana de Valor:
                      </span>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {escoragemResultado.clusterData.valorMediana}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block' }}>
                        Capital Mediano:
                      </span>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {escoragemResultado.clusterData.capitalMediano}
                      </span>
                    </div>
                  </div>

                  {/* Proximidade / Afinidade com cada Cluster */}
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                      📐 Afinidade Dimensional com os Centróides:
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {clusters.map((c) => (
                        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem' }}>
                          <span style={{ width: '80px', color: c.cor, fontWeight: 600 }}>
                            Cluster {c.id}:
                          </span>
                          <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.08)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${escoragemResultado.affinityPcts[c.id]}%`,
                                height: '100%',
                                background: c.cor,
                                transition: 'width 0.3s ease',
                              }}
                            />
                          </div>
                          <span style={{ width: '42px', textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>
                            {escoragemResultado.affinityPcts[c.id]}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Diretriz Prescritiva de Gestão */}
                <div
                  style={{
                    background: `${escoragemResultado.clusterData.cor}15`,
                    borderLeft: `4px solid ${escoragemResultado.clusterData.cor}`,
                    padding: '12px 14px',
                    borderRadius: '4px',
                    fontSize: '0.82rem',
                    color: '#e2e8f0',
                    lineHeight: '1.45',
                  }}
                >
                  <strong style={{ color: escoragemResultado.clusterData.cor, display: 'block', marginBottom: '3px' }}>
                    🛡️ Diretriz Recomendada de Governança:
                  </strong>
                  {escoragemResultado.clusterData.acao}
                </div>
              </div>
            </div>

            {/* Tabela de Escoragem em Lote de Novos Contratos */}
            <div style={{ marginTop: '36px' }}>
              <div className="section-header-row" style={{ marginBottom: '12px' }}>
                <div>
                  <h3 className="card-subtitle" style={{ fontSize: '1.18rem', margin: 0 }}>
                    📋 Amostra de Validação de Novos Contratos (amostra_contratos_cluster.csv)
                  </h3>
                  <p className="card-text-muted" style={{ marginTop: '4px' }}>
                    10 novos contratos escorados pelo pipeline K-Means Cenário 1. Clique em <strong>"Carregar no Escorador"</strong> para carregar qualquer contrato instantaneamente no simulador acima.
                  </p>
                </div>
                <div className="cv-legend-badge">
                  <span>10 Contratos Escorados</span>
                </div>
              </div>

              <div className="table-responsive">
                <table className="eda-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', minWidth: '130px' }}>ID Contrato</th>
                      <th style={{ textAlign: 'left', minWidth: '240px' }}>Objeto / Escopo do Serviço</th>
                      <th>Valor Original (R$)</th>
                      <th>Duração (dias)</th>
                      <th>Capital Social (R$)</th>
                      <th>Histórico (5a)</th>
                      <th style={{ textAlign: 'center', minWidth: '130px' }}>Cluster Predito</th>
                      <th style={{ textAlign: 'center', minWidth: '140px' }}>Perfil de Risco</th>
                      <th>Tx Histórica</th>
                      <th style={{ textAlign: 'center', minWidth: '110px' }}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_CONTRACTS.map((item) => (
                      <tr key={item.id}>
                        <td style={{ textAlign: 'left', fontWeight: 700, color: 'var(--petro-cyan)', fontFamily: 'monospace' }}>
                          {item.id}
                        </td>
                        <td style={{ textAlign: 'left', color: 'var(--text-main)', fontSize: '0.82rem' }}>
                          {item.servico}
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {item.valorOriginal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td>{item.duracaoDias} dias</td>
                        <td>{item.capitalSocial.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td>{item.qtdCont}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: `${item.cor}20`,
                              color: item.cor,
                              borderColor: item.cor,
                            }}
                          >
                            Cluster {item.clusterId}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              color: item.cor,
                            }}
                          >
                            {item.perfilRisco}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: item.cor }}>{item.taxaHistorica}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => carregarNoEscorador(item)}
                            className="subnav-btn"
                            style={{ fontSize: '0.74rem', padding: '4px 10px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}
                            title="Carregar parâmetros deste contrato no simulador acima"
                          >
                            ⚡ Carregar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
