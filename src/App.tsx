import { Activity, BrainCircuit, Gauge, GitCompare, Radar, RotateCcw, Satellite, ShieldCheck, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { GeminiPlanTrace } from './ai/geminiPlan';
import { requestGeminiPlan } from './ai/geminiPlan';
import { groundStations, orbitalNodes, policyVersions, scenarios, traceEvents } from './data/demoState';
import { runImprovementCycle } from './domain/improvement';
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
  const [activeScenarioId, setActiveScenarioId] = useState(scenarios[0].id);
  const [geminiPlanTrace, setGeminiPlanTrace] = useState<GeminiPlanTrace>({
    status: 'idle',
    model: 'gemini-3.5-flash',
  });
  const activeScenario = scenarios.find((scenario) => scenario.id === activeScenarioId) ?? scenarios[0];
  const currentPolicy = policyVersions[0];
  const improvementCycle = useMemo(
    () => runImprovementCycle(activeScenario, currentPolicy, scenarios, orbitalNodes, groundStations),
    [activeScenario, currentPolicy],
  );
  const candidatePolicy = improvementCycle.mutation.candidatePolicy;
  const primaryResult =
    improvementCycle.scenarioResults.find((result) => result.scenarioId === activeScenario.id) ??
    improvementCycle.scenarioResults[0];
  const baselineScore = primaryResult.baselineScore;
  const candidateScore = primaryResult.candidateScore;
  const totalRawGb = useMemo(() => scenarios.reduce((sum, scenario) => sum + scenario.rawGb, 0), []);
  const resetDemo = () => {
    setActiveScenarioId(scenarios[0].id);
    setActiveView('console');
  };

  useEffect(() => {
    let isCurrent = true;

    setGeminiPlanTrace({ status: 'loading', model: 'gemini-3.5-flash' });
    requestGeminiPlan({
      scenario: activeScenario,
      baselinePolicy: currentPolicy,
      baselineScore,
      mutation: improvementCycle.mutation,
    }).then((trace) => {
      if (isCurrent) {
        setGeminiPlanTrace(trace);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [activeScenario.id]);

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
            Improvement score {baselineScore.total}
          </div>
        </section>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Gemini self-improvement stack</p>
            <h2>{viewLabels.find((view) => view.id === activeView)?.label}</h2>
          </div>
          <button className="reset-button" type="button" onClick={resetDemo}>
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
                <Metric label={currentPolicy.name} value={String(baselineScore.total)} />
                <Metric label={candidatePolicy.name} value={String(candidateScore.total)} />
              </div>
              <div className="delta-banner">
                {primaryResult.decision.delta > 0 ? '+' : ''}{primaryResult.decision.delta} points on active incident;
                {' '}{improvementCycle.averageDelta > 0 ? '+' : ''}{improvementCycle.averageDelta} average across golden scenarios
              </div>
            </section>

            <section className="panel">
              <div className="panel-title">
                <BrainCircuit size={18} />
                Gemini trace status
              </div>
              <div className="trace-list compact">
                {[
                  traceEvents[0],
                  {
                    ...traceEvents[1],
                    source: geminiPlanTrace.status === 'live' ? 'gemini-live' : 'gemini-fallback',
                    status: geminiPlanTrace.status === 'loading' ? 'running' : geminiPlanTrace.status === 'live' ? 'complete' : 'blocked',
                  } as const,
                  traceEvents[2],
                ].map((event) => (
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
                <button
                  className={scenario.id === activeScenario.id ? 'scenario-row active' : 'scenario-row'}
                  key={scenario.id}
                  type="button"
                  onClick={() => {
                    setActiveScenarioId(scenario.id);
                    setActiveView('console');
                  }}
                >
                  <div>
                    <strong>{scenario.name}</strong>
                    <span>{scenario.expectedBehavior}</span>
                  </div>
                  <Metric label="Raw" value={`${scenario.rawGb} GB`} />
                  <Metric label="Target" value={`${scenario.targetGb} GB`} />
                  <Metric label="Freshness" value={`${scenario.freshnessMinutes}m`} />
                </button>
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
              <Metric label="Freshness" value={String(baselineScore.dimensions.freshness)} />
              <Metric label="Power" value={String(baselineScore.dimensions.power)} />
              <Metric label="Thermal" value={String(baselineScore.dimensions.thermal)} />
              <Metric label="Contact" value={String(baselineScore.dimensions.contact)} />
              <Metric label="Data reduction" value={String(baselineScore.dimensions.dataReduction)} />
              <Metric label="Risk" value={String(baselineScore.dimensions.risk)} />
              <Metric label="Explanation" value={String(baselineScore.dimensions.explanation)} />
              <Metric label="Guardrail" value={String(baselineScore.dimensions.guardrail)} />
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
            <div className="delta-banner">
              {improvementCycle.promoted ? 'Promotion accepted' : 'Promotion held'}: {improvementCycle.reasons[0]}
            </div>
            <div className="diff-list">
              {improvementCycle.mutation.diff.map((line) => (
                <code key={line}>{line}</code>
              ))}
            </div>
            <div className="scenario-table compact-table">
              {improvementCycle.scenarioResults.map((result) => {
                const scenario = scenarios.find((item) => item.id === result.scenarioId);

                return (
                  <article className="score-sweep-row" key={result.scenarioId}>
                    <div>
                      <strong>{scenario?.name ?? result.scenarioId}</strong>
                      <span>{result.decision.reasons[0]}</span>
                    </div>
                    <Metric label="Baseline" value={String(result.baselineScore.total)} />
                    <Metric label="Candidate" value={String(result.candidateScore.total)} />
                    <Metric label="Delta" value={`${result.decision.delta > 0 ? '+' : ''}${result.decision.delta}`} />
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {activeView === 'trace' && (
          <section className="panel full-panel">
            <div className="panel-title">
              <Sparkles size={18} />
              Inspectable Gemini and eval trace
            </div>
            <article className="gemini-output">
              <div>
                <p className="eyebrow">Live operator plan</p>
                <h3>{geminiPlanTrace.status === 'live' ? 'Gemini plan received' : 'Gemini plan fallback'}</h3>
                <p>{geminiPlanTrace.plan?.rationale ?? geminiPlanTrace.error ?? 'Waiting for Gemini operator plan.'}</p>
              </div>
              <div className="score-grid">
                <Metric label="Model" value={geminiPlanTrace.model} />
                <Metric label="Status" value={geminiPlanTrace.status} />
                <Metric label="Confidence" value={String(geminiPlanTrace.plan?.confidence ?? '--')} />
                <Metric label="Latency" value={geminiPlanTrace.latencyMs ? `${geminiPlanTrace.latencyMs} ms` : '--'} />
              </div>
              {geminiPlanTrace.plan && (
                <div className="diff-list">
                  <code>placement: {geminiPlanTrace.plan.placement}</code>
                  <code>constraints: {geminiPlanTrace.plan.constraintsUsed.join(', ')}</code>
                  <code>risks: {geminiPlanTrace.plan.risks.join(', ')}</code>
                  <code>policy patch: {geminiPlanTrace.plan.recommendedPolicyPatch}</code>
                </div>
              )}
              <div className="trace-preview-grid">
                <div>
                  <p className="eyebrow">Prompt/context preview</p>
                  <pre>{geminiPlanTrace.promptPreview ?? 'No live prompt context captured yet.'}</pre>
                </div>
                <div>
                  <p className="eyebrow">Model output preview</p>
                  <pre>{geminiPlanTrace.outputText ?? geminiPlanTrace.error ?? 'No model output captured yet.'}</pre>
                </div>
              </div>
            </article>
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
