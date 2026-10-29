import React from 'react';

export default function GovernanceLGPDView() {
  return (
    <div className="governance-layout animate-fade-in">
      <div className="glass-panel section-card">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">🛡️ Governança de Dados, Conformidade com LGPD e Guardrails</h2>
            <p className="section-desc">
              Garantias metodológicas e legais aplicadas no projeto em conformidade com a <strong>Lei nº 13.709/2018 (LGPD)</strong> e as diretrizes do <strong>Prof. Dr. Ronaldo Martins da Costa (UFG / INF)</strong>.
            </p>
          </div>
          <span className="badge badge-lgpd">Certificação de Conformidade</span>
        </div>

        <div className="governance-cards-grid">
          {/* Card 1: LGPD */}
          <div className="gov-card glass-panel">
            <div className="gov-icon">🔒</div>
            <h3 className="gov-title">Conformidade com a LGPD (Lei 13.709/18)</h3>
            <p className="gov-text">
              Para resguardar dados pessoais de microempreendedores (MEI) e prepostos legais, todos os identificadores diretos foram <strong>eliminados do treinamento</strong>:
            </p>
            <ul className="gov-list">
              <li>🚫 <strong>Razão Social & Nome do Fornecedor:</strong> Removidos do modelo e da exibição.</li>
              <li>🚫 <strong>CNPJ / CPF de Sócios:</strong> Descartados para prevenir qualquer correlação pessoal.</li>
              <li>✔️ <strong>Princípio da Minimização:</strong> Uso exclusivo de atributos contratuais objetivos e estatísticos.</li>
            </ul>
          </div>

          {/* Card 2: Anti-Leakage */}
          <div className="gov-card glass-panel">
            <div className="gov-icon">⏳</div>
            <h3 className="gov-title">Protocolo Rígido Anti-Leakage (Tempo T₀)</h3>
            <p className="gov-text">
              Blindagem temporal estrita no momento da assinatura da contratação. Não há risco de previsão enviesada ou artificial:
            </p>
            <ul className="gov-list">
              <li>🚫 <strong>Sem Variáveis Pós-Fato:</strong> Saldos residuais, datas de aditivos e valores aditivados foram expurgados.</li>
              <li>✔️ <strong>Fit Isolado no Treino:</strong> Scaler e One-Hot Encoder ajustados apenas nas 4.629 amostras de treino.</li>
              <li>✔️ <strong>Teste Cego Real:</strong> 1.158 contratos nunca vistos avaliados sem contaminação.</li>
            </ul>
          </div>

          {/* Card 3: Guardrails Acadêmicos UFG */}
          <div className="gov-card glass-panel">
            <div className="gov-icon">🎓</div>
            <h3 className="gov-title">Guardrails Metodológicos (Aulas 1 a 4)</h3>
            <p className="gov-text">
              Aderência rigorosa à metodologia ensinada pelo Prof. Dr. Ronaldo Martins da Costa:
            </p>
            <ul className="gov-list">
              <li>✔️ <strong>Normalização Crítica:</strong> MinMaxScaler para K-Means e preservação de escalas no Random Forest.</li>
              <li>✔️ <strong>Split Estratificado 60/20/20:</strong> Treino (3.471), Validação (1.158) e Teste Independente Cego (1.158).</li>
              <li>✔️ <strong>Calibração Kolmogorov-Smirnov (Max KS):</strong> Corte ótimo em 0,4540 priorizando Sensibilidade (Recall 76,12%).</li>
            </ul>
          </div>
        </div>

        <div className="callout-box" style={{ marginTop: '24px' }}>
          <div className="callout-icon">📋</div>
          <div>
            <h4 className="callout-title">Documentação Completa de Engenharia</h4>
            <p className="callout-text">
              Consulte a pasta de especificações técnicas do repositório: <code>specs/guardrails_prof_ronaldo.md</code>, <code>specs/conformidade_lgpd_e_governanca.md</code> e o plano versionado em <code>specs/plano_implementacao.md</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
