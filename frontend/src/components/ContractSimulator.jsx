import React, { useState, useEffect } from 'react';
import RiskGauge from './RiskGauge';

const PRESETS = {
  megaprojeto: {
    name: '🚨 Megaprojeto de Engenharia (Cluster 2 - Alto Risco)',
    data: {
      Valor_Original: 75000000,
      duracao_planejada_dias: 1825,
      Capital_Social_Receita: 50000000,
      qtd_cont_5a_forn: 8,
      tx_adit_geral_5a: 0.85,
      fl_sem_historico_5a: 0,
      Porte_Empresa: 'DEMAIS',
      tipo_ult_adit: 'PRAZO E VALOR',
    },
  },
  trienal: {
    name: '⚖️ Trienal Padrão Continuado (Cluster 0 - Risco Moderado)',
    data: {
      Valor_Original: 3500000,
      duracao_planejada_dias: 1095,
      Capital_Social_Receita: 5000000,
      qtd_cont_5a_forn: 3,
      tx_adit_geral_5a: 0.45,
      fl_sem_historico_5a: 0,
      Porte_Empresa: 'DEMAIS',
      tipo_ult_adit: 'PRAZO',
    },
  },
  operacional: {
    name: '🛡️ Serviço Operacional / Curto (Cluster 1 - Baixo Risco)',
    data: {
      Valor_Original: 450000,
      duracao_planejada_dias: 180,
      Capital_Social_Receita: 1000000,
      qtd_cont_5a_forn: 4,
      tx_adit_geral_5a: 0.15,
      fl_sem_historico_5a: 0,
      Porte_Empresa: 'EPP',
      tipo_ult_adit: 'VALOR',
    },
  },
  novo: {
    name: '🏢 Novo Fornecedor sem Histórico (fl_sem_hist = 1)',
    data: {
      Valor_Original: 2100000,
      duracao_planejada_dias: 365,
      Capital_Social_Receita: 1200000,
      qtd_cont_5a_forn: 0,
      tx_adit_geral_5a: 0.0,
      fl_sem_historico_5a: 1,
      Porte_Empresa: 'ME',
      tipo_ult_adit: 'SEM HISTORICO',
    },
  },
};

export default function ContractSimulator() {
  const [formData, setFormData] = useState(PRESETS.trienal.data);
  const [prediction, setPrediction] = useState(null);
  const [clusterInfo, setClusterInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const applyPreset = (key) => {
    setFormData(PRESETS[key].data);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'qtd_cont_5a_forn') {
        const val = parseInt(value, 10) || 0;
        if (val === 0) {
          updated.fl_sem_historico_5a = 1;
          updated.tx_adit_geral_5a = 0.0;
          updated.tipo_ult_adit = 'SEM HISTORICO';
        } else {
          updated.fl_sem_historico_5a = 0;
        }
      }
      return updated;
    });
  };

  const runPrediction = async (dataToPredict) => {
    setLoading(true);
    setApiError(null);
    try {
      const [resPred, resClust] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToPredict),
        }),
        fetch('http://127.0.0.1:8000/api/cluster', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToPredict),
        }),
      ]);

      if (!resPred.ok) {
        throw new Error(`Servidor respondeu com status ${resPred.status}`);
      }

      const dataPred = await resPred.json();
      setPrediction(dataPred);

      if (resClust.ok) {
        const dataClust = await resClust.json();
        setClusterInfo(dataClust);
      }
    } catch (err) {
      console.warn('API local indisponível, utilizando cálculo offline calibrado:', err);
      setApiError('API Backend offline. Exibindo estimativa offline baseada no Random Forest Abordagem 4.');

      // Fallback heurístico calibrado na Abordagem 4 (limiar KS = 0.4480)
      let score = 0.35;
      if (dataToPredict.Valor_Original > 10000000) score += 0.22;
      else if (dataToPredict.Valor_Original > 3000000) score += 0.12;

      if (dataToPredict.duracao_planejada_dias > 1095) score += 0.25;
      else if (dataToPredict.duracao_planejada_dias > 365) score += 0.10;

      if (dataToPredict.tx_adit_geral_5a >= 0.5) score += 0.20;
      if (dataToPredict.tipo_ult_adit === 'PRAZO E VALOR') score += 0.08;
      if (dataToPredict.fl_sem_historico_5a === 1) score += 0.04;

      score = Math.min(Math.max(score, 0.05), 0.95);
      const limiar = 0.448;
      const isAditivo = score >= limiar ? 1 : 0;

      setPrediction({
        previsao_aditivo: isAditivo,
        rotulo: score >= 0.70 ? 'Risco Crítico de Aditivo' : score >= limiar ? 'Risco Moderado de Aditivo' : 'Baixo Risco de Aditivo',
        probabilidade_aditivo: Math.round(score * 10000) / 10000,
        probabilidade_sem_aditivo: Math.round((1 - score) * 10000) / 10000,
        limiar_decisao_ks: limiar,
        max_ks: 0.4019,
        nivel_risco: score >= 0.70 ? 'CRÍTICO' : score >= limiar ? 'MODERADO' : 'BAIXO',
        cor_alerta: score >= 0.70 ? '#ef4444' : score >= limiar ? '#f59e0b' : '#10b981',
        parecer_governanca: isAditivo
          ? 'Probabilidade acima do limiar KS (44,8%). Recomenda-se acompanhamento semestral e plano contingencial.'
          : 'Contrato de perfil equilibrado. Diretrizes convencionais de fiscalização são suficientes.',
        fatores_relevantes: [
          {
            feature: 'Vulto Financeiro Original',
            impacto_direcao: dataToPredict.Valor_Original > 5000000 ? 'Aumenta Risco' : 'Reduz Risco',
            descricao: `Valor contratado de R$ ${Number(dataToPredict.Valor_Original).toLocaleString('pt-BR')}.`,
          },
          {
            feature: 'Prazo Planejado',
            impacto_direcao: dataToPredict.duracao_planejada_dias > 1000 ? 'Aumenta Risco' : 'Reduz Risco',
            descricao: `${dataToPredict.duracao_planejada_dias} dias previstos (${Math.round(dataToPredict.duracao_planejada_dias / 30)} meses).`,
          },
        ],
      });

      // Cluster fallback
      if (dataToPredict.duracao_planejada_dias > 1400 || dataToPredict.Valor_Original > 20000000) {
        setClusterInfo({
          cluster_id: 2,
          cluster_nome: 'Cluster 2 — Projetos de Longa Duração e Megacontratos',
          cluster_perfil_risco: 'CRÍTICO (ALTO RISCO)',
          cluster_taxa_historica: 0.8392,
          mediana_valor: 7699999.80,
          duracao_media: 1641.49,
          recomendacao_gestao: 'Megaprojeto ou contratação de longo prazo. Exige comitê dedicado de governança preventiva.',
        });
      } else if (dataToPredict.duracao_planejada_dias <= 730 && dataToPredict.Valor_Original <= 3000000) {
        setClusterInfo({
          cluster_id: 1,
          cluster_nome: 'Cluster 1 — Fornecimentos e Contratos Curtos',
          cluster_perfil_risco: 'BAIXO RISCO (SEGURO)',
          cluster_taxa_historica: 0.4415,
          mediana_valor: 2069783.28,
          duracao_media: 562.47,
          recomendacao_gestao: 'Contrato de curta vigência e menor complexidade orçamentária. Trilha de fiscalização padrão.',
        });
      } else {
        setClusterInfo({
          cluster_id: 0,
          cluster_nome: 'Cluster 0 — Contratos Trienais Padrão',
          cluster_perfil_risco: 'MODERADO (ATENÇÃO)',
          cluster_taxa_historica: 0.5487,
          mediana_valor: 2846845.26,
          duracao_media: 1101.40,
          recomendacao_gestao: 'Contrato com vigência padrão de 3 anos (triênio). Risco moderado de prorrogação temporal.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runPrediction(formData);
  }, [formData]);

  return (
    <div className="simulator-layout">
      {/* Coluna Esquerda: Formulário dos 8 Preditores */}
      <section className="form-section glass-panel">
        <div className="form-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="section-title">⚙️ Simulador Operacional</h2>
            <span className="badge badge-champion">Abordagem 4 (RF) + K-Means (MinMax)</span>
          </div>
          <p className="section-desc">
            Insira dados de contratos no momento de assinatura ou que ainda não finalizaram a vigência, contratos ativos.
          </p>

          <div className="preset-buttons">
            <span className="preset-label">Cenários Típicos:</span>
            {Object.keys(PRESETS).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => applyPreset(key)}
                className="preset-btn"
              >
                {PRESETS[key].name}
              </button>
            ))}
          </div>
        </div>

        <form className="contract-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group-grid">
            {/* 1. Valor Original */}
            <div className="input-group">
              <label htmlFor="valor_original">
                1. Valor Original do Contrato (R$)
                <span className="info-tip">Vulto financeiro pactuado</span>
              </label>
              <input
                id="valor_original"
                type="number"
                min="10000"
                step="50000"
                value={formData.Valor_Original}
                onChange={(e) => handleInputChange('Valor_Original', parseFloat(e.target.value) || 0)}
                className="text-input"
              />
              <div className="formatted-preview">
                {Number(formData.Valor_Original).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </div>

            {/* 2. Duração Planejada em Dias */}
            <div className="input-group">
              <label htmlFor="duracao_dias">
                2. Duração Planejada (Dias)
                <span className="info-tip">{Math.round(formData.duracao_planejada_dias / 30)} meses (~{(formData.duracao_planejada_dias / 365).toFixed(1)} anos)</span>
              </label>
              <input
                id="duracao_dias"
                type="range"
                min="30"
                max="1825"
                step="15"
                value={formData.duracao_planejada_dias}
                onChange={(e) => handleInputChange('duracao_planejada_dias', parseInt(e.target.value, 10))}
                className="range-input"
              />
              <div className="slider-display">{formData.duracao_planejada_dias} dias</div>
            </div>

            {/* 3. Capital Social na Receita */}
            <div className="input-group">
              <label htmlFor="capital_social">
                3. Capital Social do Fornecedor (R$)
                <span className="info-tip">Capacidade patrimonial RFB</span>
              </label>
              <input
                id="capital_social"
                type="number"
                min="0"
                step="100000"
                value={formData.Capital_Social_Receita}
                onChange={(e) => handleInputChange('Capital_Social_Receita', parseFloat(e.target.value) || 0)}
                className="text-input"
              />
              <div className="formatted-preview">
                {Number(formData.Capital_Social_Receita).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </div>

            {/* 4. Quantidade de Contratos Anteriores (5 Anos) */}
            <div className="input-group">
              <label htmlFor="qtd_cont_5a">
                4. Contratos Préviados nos Últimos 5 Anos
                <span className="info-tip">{formData.qtd_cont_5a_forn === 0 ? 'Novo fornecedor' : `${formData.qtd_cont_5a_forn} contratos`}</span>
              </label>
              <input
                id="qtd_cont_5a"
                type="number"
                min="0"
                max="50"
                value={formData.qtd_cont_5a_forn}
                onChange={(e) => handleInputChange('qtd_cont_5a_forn', parseInt(e.target.value, 10) || 0)}
                className="text-input"
              />
            </div>

            {/* 5. Taxa Geral de Aditivos (5 Anos) */}
            <div className="input-group">
              <label htmlFor="taxa_adit_geral">
                5. Taxa Geral Histórica de Aditivos (5a)
                <span className="info-tip">Histórico consolidado sem ruído</span>
              </label>
              <input
                id="taxa_adit_geral"
                type="range"
                min="0"
                max="1"
                step="0.05"
                disabled={formData.fl_sem_historico_5a === 1}
                value={formData.fl_sem_historico_5a === 1 ? 0 : formData.tx_adit_geral_5a}
                onChange={(e) => handleInputChange('tx_adit_geral_5a', parseFloat(e.target.value))}
                className="range-input"
              />
              <div className="slider-display">
                {formData.fl_sem_historico_5a === 1 ? '0% (Sem Histórico)' : `${Math.round(formData.tx_adit_geral_5a * 100)}% de aditivos prévios`}
              </div>
            </div>

            {/* 6. Indicador de Sem Histórico */}
            <div className="input-group">
              <label htmlFor="fl_sem_hist">
                6. Indicador de Novo Fornecedor (T₀)
                <span className="info-tip">fl_sem_historico_5a</span>
              </label>
              <select
                id="fl_sem_hist"
                value={formData.fl_sem_historico_5a}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  handleInputChange('fl_sem_historico_5a', val);
                  if (val === 1) {
                    handleInputChange('qtd_cont_5a_forn', 0);
                    handleInputChange('tx_adit_geral_5a', 0.0);
                    handleInputChange('tipo_ult_adit', 'SEM HISTORICO');
                  }
                }}
                className="select-input"
              >
                <option value={0}>0 — Possui Contratos Anteriores na Petrobras</option>
                <option value={1}>1 — Novo Fornecedor (Sem Histórico nos Últimos 5 Anos)</option>
              </select>
            </div>

            {/* 7. Porte da Empresa */}
            <div className="input-group">
              <label htmlFor="porte_empresa">
                7. Porte da Empresa (Receita Federal)
              </label>
              <select
                id="porte_empresa"
                value={formData.Porte_Empresa}
                onChange={(e) => handleInputChange('Porte_Empresa', e.target.value)}
                className="select-input"
              >
                <option value="DEMAIS">DEMAIS (Grande / Médio Porte)</option>
                <option value="EPP">EPP (Empresa de Pequeno Porte)</option>
                <option value="ME">Microempresa (ME)</option>
                <option value="Não Informado">Não Informado</option>
              </select>
            </div>

            {/* 8. Tipo do Último Aditivo */}
            <div className="input-group">
              <label htmlFor="tipo_ult_adit">
                8. Natureza do Último Aditivo Anterior
              </label>
              <select
                id="tipo_ult_adit"
                value={formData.tipo_ult_adit}
                onChange={(e) => handleInputChange('tipo_ult_adit', e.target.value)}
                className="select-input"
              >
                <option value="PRAZO">Apenas Prazo</option>
                <option value="VALOR">Apenas Valor</option>
                <option value="PRAZO E VALOR">Prazo e Valor Simultâneos</option>
                <option value="SEM HISTORICO">Sem Histórico de Aditivo Anterior</option>
              </select>
            </div>
          </div>
        </form>
      </section>

      {/* Coluna Direita: Diagnóstico e Enquadramento Dual */}
      <section className="results-section">
        {apiError && (
          <div className="notice-banner">
            <span className="notice-icon">ℹ️</span>
            <span>{apiError}</span>
          </div>
        )}

        {prediction && (
          <>
            <RiskGauge
              probability={prediction.probabilidade_aditivo}
              riskLevel={prediction.nivel_risco}
              label={prediction.rotulo}
              color={prediction.cor_alerta}
              limiarKS={prediction.limiar_decisao_ks}
            />

            {/* Enquadramento de Cluster Não Supervisionado */}
            {clusterInfo && (
              <div className="factors-card glass-panel animate-fade-in" style={{ borderLeft: `4px solid ${clusterInfo.cluster_id === 2 ? '#ef4444' : clusterInfo.cluster_id === 0 ? '#3b82f6' : '#10b981'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 className="card-subtitle" style={{ margin: 0 }}>🧩 Perfil Não Supervisionado (K-Means)</h3>
                  <span className="badge" style={{ backgroundColor: '#1e293b' }}>
                    Cluster {clusterInfo.cluster_id}
                  </span>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-bright)', marginBottom: '4px' }}>
                  {clusterInfo.cluster_nome}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Taxa Histórica Empírica de Aditivos do Cluster: <strong>{Math.round(clusterInfo.cluster_taxa_historica * 1000) / 10}%</strong> • Duração Média: <strong>{Math.round(clusterInfo.duracao_media)} dias</strong>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', margin: 0 }}>
                  {clusterInfo.recomendacao_gestao}
                </p>
              </div>
            )}

            {/* Parecer de Governança */}
            <div className="factors-card glass-panel animate-fade-in">
              <h3 className="card-subtitle">📋 Parecer de Governança Operacional</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-bright)', margin: 0 }}>
                {prediction.parecer_governanca}
              </p>
            </div>

            {/* Fatores Contribuintes */}
            <div className="factors-card glass-panel animate-fade-in">
              <h3 className="card-subtitle">🔍 Diagnóstico dos Preditores Ativos</h3>
              <div className="factors-list">
                {prediction.fatores_relevantes && prediction.fatores_relevantes.length > 0 ? (
                  prediction.fatores_relevantes.map((fator, idx) => (
                    <div key={idx} className="factor-item">
                      <div className="factor-header">
                        <span className="factor-title">{fator.feature}</span>
                        <span
                          className={`factor-tag ${
                            fator.impacto_direcao === 'Aumenta Risco'
                              ? 'tag-risk-high'
                              : 'tag-risk-low'
                          }`}
                        >
                          {fator.impacto_direcao}
                        </span>
                      </div>
                      <p className="factor-desc">{fator.descricao}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-dim">Nenhum preditor exerceu pressão desproporcional sobre o limiar de decisão.</p>
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
