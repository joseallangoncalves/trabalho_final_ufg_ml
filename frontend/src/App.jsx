import React, { useState } from 'react';
import Header from './components/Header';
import ContractSimulator from './components/ContractSimulator';
import ModelsComparison from './components/ModelsComparison';
import ConfusionMatrixCard from './components/ConfusionMatrixCard';
import ClusteringView from './components/ClusteringView';
import FeatureImportanceView from './components/FeatureImportanceView';
import GovernanceLGPDView from './components/GovernanceLGPDView';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('simulator');

  return (
    <div className="app-container">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {activeTab === 'simulator' && <ContractSimulator />}
        {activeTab === 'models' && <ModelsComparison />}
        {activeTab === 'confusion' && <ConfusionMatrixCard />}
        {activeTab === 'clustering' && <ClusteringView />}
        {activeTab === 'importance' && <FeatureImportanceView />}
        {activeTab === 'governance' && <GovernanceLGPDView />}
      </main>

      <footer className="footer-container glass-panel">
        <div className="footer-content">
          <p>
            <strong>Petrobras ML — Predição de Aditivos Contratuais</strong> • Projeto Desenvolvido para a Disciplina de Aprendizado de Máquina
          </p>
          <p className="footer-sub">
            Instituto de Informática (INF) — Universidade Federal de Goiás (UFG) • Prof. Dr. Ronaldo Martins da Costa
          </p>
          <div className="footer-tags">
            <span>Lei das Estatais (Lei 13.303/16)</span>
            <span>•</span>
            <span>Conformidade LGPD (Lei 13.709/18)</span>
            <span>•</span>
            <span>Zero Data Leakage (Tempo T₀)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
