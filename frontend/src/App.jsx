import React, { useState } from 'react';
import Header from './components/Header';
import ContractSimulator from './components/ContractSimulator';
import DatasetEDAView from './components/DatasetEDAView';
import ModelsComparison from './components/ModelsComparison';
import ConfusionMatrixCard from './components/ConfusionMatrixCard';
import ClusteringView from './components/ClusteringView';
import FeatureImportanceView from './components/FeatureImportanceView';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('dataset');

  return (
    <div className="app-container">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {activeTab === 'dataset' && <DatasetEDAView />}
        {activeTab === 'simulator' && <ContractSimulator />}
        {activeTab === 'models' && <ModelsComparison />}
        {activeTab === 'confusion' && <ConfusionMatrixCard />}
        {activeTab === 'clustering' && <ClusteringView />}
        {activeTab === 'importance' && <FeatureImportanceView />}
      </main>

      <footer className="footer-container glass-panel">
        <div className="footer-content">
          <p>
            <strong>Petrobras ML — Predição de Aditivos Contratuais</strong> • Projeto Desenvolvido para a Disciplina de Aprendizado de Máquina
          </p>
          <p className="footer-sub">
            Instituto de Informática (INF) — Universidade Federal de Goiás (UFG) • Prof. Dr. Ronaldo Martins da Costa
        </div>
      </footer>
    </div>
  );
}
