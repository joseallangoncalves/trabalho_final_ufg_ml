import React from 'react';

export default function Header({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dataset', label: 'Base de Dados & EDA', icon: '📊' },
    { id: 'simulator', label: 'Simulador de Risco', icon: '⚡' },
    { id: 'models', label: 'Modelos (Classificação)', icon: '📈' },
    { id: 'confusion', label: 'Matriz de Confusão & KS', icon: '📐' },
    { id: 'clustering', label: 'Perfis (K-Means)', icon: '👥' },
    { id: 'importance', label: 'Fatores de Risco', icon: '🔍' },
  ];

  return (
    <header className="header-container glass-panel">
      <div className="header-top">
        <div className="header-branding">
          <div className="logo-badge">
            <span className="logo-icon">⛽</span>
          </div>
          <div>
            <div className="tags-row">
              <span className="badge badge-champion">🏆 Modelo Campeão: Random Forest</span>
              <span className="badge badge-lgpd">🛡️ LGPD Compliant</span>
              <span className="badge badge-ufg">🎓 UFG / INF • Prof. Dr. Ronaldo Martins</span>
            </div>
            <h1 className="header-title">Predição de Aditivos em Contratos da Petrobras</h1>
            <p className="header-subtitle">
              Sistema de Machine Learning Supervisionado para mitigação de riscos e predição antecipada de termos aditivos (Lei 13.303/16).
            </p>
          </div>
        </div>
      </div>

      <nav className="nav-tabs" aria-label="Navegação do Dashboard">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`nav-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </header>
  );
}
