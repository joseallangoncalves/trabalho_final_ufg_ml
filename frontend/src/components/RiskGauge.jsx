import React from 'react';

export default function RiskGauge({ probability, riskLevel, label, color, limiarKS = 0.448 }) {
  const percent = Math.round(probability * 100);
  const limiarPercent = Math.round(limiarKS * 100);
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="risk-gauge-card glass-panel animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="card-subtitle" style={{ margin: 0 }}>Índice Probabilístico de Aditivo</h3>
        <span className="badge" style={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#94a3b8', fontSize: '0.75rem' }}>
          Corte KS: {limiarPercent}%
        </span>
      </div>

      <div className="gauge-wrapper">
        <svg className="gauge-svg" width="160" height="160" viewBox="0 0 160 160">
          <circle
            className="gauge-bg"
            cx="80"
            cy="80"
            r={radius}
            strokeWidth="12"
          />
          <circle
            className="gauge-progress"
            cx="80"
            cy="80"
            r={radius}
            strokeWidth="12"
            stroke={color || '#06b6d4'}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease' }}
          />
        </svg>

        <div className="gauge-content">
          <span className="gauge-number" style={{ color: color || '#f8fafc' }}>
            {percent}%
          </span>
          <span className="gauge-caption">Chance de Aditivo</span>
        </div>
      </div>

      <div className="risk-status-badge" style={{ backgroundColor: `${color}20`, borderColor: color, color }}>
        <span className="status-dot" style={{ backgroundColor: color }}></span>
        <span className="status-text">{label || (riskLevel + ' RISCO')}</span>
      </div>

      <p className="gauge-footnote">
        {percent >= 70
          ? '🚨 Risco Crítico: Altíssima propensão a termo aditivo. Requer comitê de governança e fiscalização reforçada.'
          : percent >= limiarPercent
          ? `⚡ Risco Moderado: Probabilidade acima do ponto de corte Kolmogorov-Smirnov (${limiarPercent}%). Exige acompanhamento preventivo.`
          : `✅ Baixo Risco: Probabilidade abaixo do limiar KS (${limiarPercent}%). Contrato com alta previsibilidade de execução regular.`}
      </p>
    </div>
  );
}
