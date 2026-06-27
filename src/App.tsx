import { Activity, BrainCircuit, Gauge, GitCompare, Radar, RotateCcw, Satellite, ShieldCheck, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { groundStations, orbitalNodes, policyVersions, scenarios, traceEvents } from './data/demoState';
import type { FleetStatus } from './domain/types';

type View = 'console' | 'scenario' | 'evaluation' | 'policy' | 'trace';

const viewLabels: Array<{ id: View; label: string }> = [
  { id: 'console', label: 'Console' },
  { id: 'scenario', label: 'Scenario Lab' },
  { id: 'evaluation', label: 'Evaluation' },
  { id: 'policy', label: 'Policy Lab' },
  { id: 'trace', label: 'Gemini Trace' },
];

const statusCopy: Record<FleetStatus, string> = {
  nominal: 'Nominal',
  watch: 'Watch',
  degraded: 'Degraded',
};

export function App() {
  const [activeView, setActiveView] = useState<View>('console');
  const activeScenario = scenarios[0];
  const currentPolicy = policyVersions[0];
  const candidatePolicy = policyVersions[1];
  const totalRawGb = useMemo(() => scenarios.reduce((sum, scenario) => sum + scenario.rawGb, 0), []);

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="OrbitForge navigation">
        <div className="brand-lockup">
          <div className="brand-mark">
            <Satellite size={22} strokeWidth={2.2} />
          </div>
          <div>
            <p className="eyebrow">Seeded mission ops</p>
            <h1>OrbitForge</h1>
          </div>
        </div>

        <nav className="nav-list" aria-label="Primary views">
          {viewLabels.map((view) => (
            <button
              key={view.id}
              className={activeView === view.id ? 'nav-item active' : 'nav-item'}
              type="button"
              onClick={() => setActiveView(view.id)}
            >
              {view.label}
            </button>
          ))}
        </nav>

        <section className="mission-card" aria-label="Current policy state">
          <p className="eyebrow">Active agent policy</p>
          <strong>{currentPolicy.name}</strong>
          <span>{currentPolicy.summary}</span>
          <div className="score-chip">
            <Gauge size={16} />
            Improvement score {currentPolicy.score}
          </div>
        </section>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Gemini self-improvement stack</p>
            <h2>{viewLabels.find((view) => view.id === activeView)?.label}</h2>
          </div>
          <button className="reset-button" type="button">
            <RotateCcw size={16} />
            Reset demo
          </button>
        </header>

        {activeView === 'console' && (
          <div className="view-grid console-grid">
            <section className="panel hero-panel">
              <div className="panel-title">
                <Radar size={18} />
                Active incident
              </div>
              <h3>{activeScenario.name}</h3>
              <p>{activeScenario.incident}</p>
              <div className="incident-metrics">
                <Metric label="Raw input" value={`${activeScenario.rawGb} GB`} />
                <Metric label="Target product" value={`${activeScenario.targetGb} GB`} />
                <Metric label="Freshness" value={`${activeScenario.freshnessMinutes} min`} />
              </div>
              <p className="risk-note">{activeScenario.primaryRisk}</p>
            </section>

            <section className="panel">
              <div className="panel-title">
                <Activity size={18} />
                Fleet health
              </div>
              <div className="node-list">
                {orbitalNodes.map((node) => (
                  <article className="node-row" key={node.id}>
                    <div>
                      <strong>{node.name}</strong>
                      <span>{node.role}</span>
                    </div>
                    <span className={`status-pill ${node.status}`}>{statusCopy[node.status]}</span>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel">
              <div className="panel-title">
                <GitCompare size={18} />
                Improvement proof
              </div>
              <div className="comparison-row">
                <Metric label={currentPolicy.name} value={String(currentPolicy.score)} />
                <Metric label={candidatePolicy.name} value={String(candidatePolicy.score)} />
              </div>
              <div className="delta-banner">+{candidatePolicy.score - currentPolicy.score} points after thermal/contact policy mutation</div>
            </section>

            <section className="panel">
              <div className="panel-title">
                <BrainCircuit size={18} />
                Gemini trace status
              </div>
              <div className="trace-list compact">
                {traceEvents.slice(0, 3).map((event) => (
                  <div className="trace-row" key={event.id}>
                    <span>{event.label}</span>
                    <strong>{event.status}</strong>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeView === 'scenario' && (
          <section className="panel full-panel">
            <div className="panel-title">
              <Radar size={18} />
              Seeded scenario library
            </div>
            <div className="scenario-table">
              {scenarios.map((scenario) => (
                <article className="scenario-row" key={scenario.id}>
                  <div>
                    <strong>{scenario.name}</strong>
                    <span>{scenario.expectedBehavior}</span>
                  </div>
                  <Metric label="Raw" value={`${scenario.rawGb} GB`} />
                  <Metric label="Target" value={`${scenario.targetGb} GB`} />
                  <Metric label="Freshness" value={`${scenario.freshnessMinutes}m`} />
                </article>
              ))}
            </div>
            <div className="data-banner">Seeded workload library: {scenarios.length} scenarios, {totalRawGb} GB raw orbital data, zero real satellite control.</div>
          </section>
        )}

        {activeView === 'evaluation' && (
          <section className="panel full-panel">
            <div className="panel-title">
              <ShieldCheck size={18} />
              Deterministic scorecard shell
            </div>
            <div className="score-grid">
              {['Freshness', 'Power', 'Thermal', 'Contact', 'Data reduction', 'Risk', 'Explanation', 'Guardrail'].map((label, index) => (
                <Metric key={label} label={label} value={String([84, 78, 51, 58, 91, 64, 73, 100][index])} />
              ))}
            </div>
            <p className="risk-note">Promotion will be decided by app-owned deterministic scores, not Gemini self-grading.</p>
          </section>
        )}

        {activeView === 'policy' && (
          <section className="panel full-panel">
            <div className="panel-title">
              <GitCompare size={18} />
              Policy mutation preview
            </div>
            <div className="policy-diff">
              <div>
                <p className="eyebrow">Baseline</p>
                <strong>{currentPolicy.name}</strong>
                <span>{currentPolicy.summary}</span>
              </div>
              <div>
                <p className="eyebrow">Candidate</p>
                <strong>{candidatePolicy.name}</strong>
                <span>{candidatePolicy.summary}</span>
              </div>
            </div>
            <div className="delta-banner">Promotion gate pending evaluator implementation.</div>
          </section>
        )}

        {activeView === 'trace' && (
          <section className="panel full-panel">
            <div className="panel-title">
              <Sparkles size={18} />
              Inspectable Gemini and eval trace
            </div>
            <div className="trace-list">
              {traceEvents.map((event) => (
                <article className="trace-card" key={event.id}>
                  <div>
                    <strong>{event.label}</strong>
                    <span>{event.detail}</span>
                  </div>
                  <span className={`source-pill ${event.source}`}>{event.source}</span>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="panel ground-strip" aria-label="Ground contact windows">
          {groundStations.map((station) => (
            <article key={station.id}>
              <strong>{station.name}</strong>
              <span>{station.linkType.toUpperCase()} contact in {station.nextContactMinutes}m</span>
              <span className={`status-pill ${station.status}`}>{station.downlinkMbps} Mbps</span>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
