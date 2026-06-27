import {
  Activity,
  BrainCircuit,
  Copy,
  Gauge,
  GitCompare,
  MousePointerClick,
  Radar,
  RefreshCw,
  RotateCcw,
  Satellite,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { buildAuditSnapshot } from './ai/auditSnapshot';
import type { GeminiComputerAuditTrace } from './ai/geminiComputerAudit';
import { requestGeminiComputerAudit } from './ai/geminiComputerAudit';
import type { GeminiCritiqueTrace, GeminiPlanTrace } from './ai/geminiPlan';
import { requestGeminiCritique, requestGeminiPlan } from './ai/geminiPlan';
import { OrbitMap } from './components/OrbitMap';
import { groundStations, orbitalNodes, policyVersions, scenarios, traceEvents } from './data/demoState';
import { decidePromotion, evaluatePlan } from './domain/evaluator';
import { runImprovementCycle } from './domain/improvement';
import { buildJudgeReport, formatAuditMode, formatPromptGuard } from './domain/judgeReport';
import { runPolicyOnScenario } from './domain/scenarioRunner';
import type { FleetStatus, ScoreDimension, TraceEvent } from './domain/types';

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

const scoreDimensionLabels: Array<{ key: ScoreDimension; label: string }> = [
  { key: 'freshness', label: 'Freshness' },
  { key: 'power', label: 'Power' },
  { key: 'thermal', label: 'Thermal' },
  { key: 'contact', label: 'Contact' },
  { key: 'dataReduction', label: 'Data reduction' },
  { key: 'risk', label: 'Risk' },
  { key: 'explanation', label: 'Explanation' },
  { key: 'guardrail', label: 'Guardrail' },
];

export function App() {
  const [activeView, setActiveView] = useState<View>('console');
  const [activeScenarioId, setActiveScenarioId] = useState(scenarios[0].id);
  const [geminiPlanTrace, setGeminiPlanTrace] = useState<GeminiPlanTrace>({
    status: 'idle',
    model: 'gemini-3.5-flash',
  });
  const [geminiCritiqueTrace, setGeminiCritiqueTrace] = useState<GeminiCritiqueTrace>({
    status: 'idle',
    model: 'gemini-3.5-flash',
  });
  const [computerAuditTrace, setComputerAuditTrace] = useState<GeminiComputerAuditTrace>({
    status: 'idle',
    model: 'gemini-3.5-flash',
    executionMode: 'propose_only',
    actions: [],
  });
  const [reportStatus, setReportStatus] = useState<'idle' | 'copied' | 'blocked'>('idle');
  const [judgeReport, setJudgeReport] = useState('');
  const [geminiRunId, setGeminiRunId] = useState(0);
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
  const learningFailureSignature =
    improvementCycle.mutation.targetFailures.length > 0
      ? improvementCycle.mutation.targetFailures.join(', ')
      : 'no below-threshold failures';
  const guardrailCanary = useMemo(() => {
    const unsafePolicy = {
      ...candidatePolicy,
      id: `${candidatePolicy.id}-guardrail-canary`,
      name: 'unsafe overclaim canary',
      summary: 'Removes seeded-data and no-control guardrails to prove the promotion gate blocks unsafe mutations.',
      guardrails: [],
    };
    const unsafePlan = runPolicyOnScenario(activeScenario, unsafePolicy, orbitalNodes, groundStations);
    const unsafeScore = evaluatePlan(activeScenario, unsafePolicy, unsafePlan, orbitalNodes, groundStations);

    return {
      policy: unsafePolicy,
      score: unsafeScore,
      decision: decidePromotion(baselineScore, unsafeScore),
    };
  }, [activeScenario, baselineScore, candidatePolicy]);
  const totalRawGb = useMemo(() => scenarios.reduce((sum, scenario) => sum + scenario.rawGb, 0), []);
  const runtimeTraceEvents = useMemo<TraceEvent[]>(
    () => [
      {
        ...traceEvents[0],
        status: 'complete',
        detail: `${activeScenario.name} loaded with ${activeScenario.rawGb} GB raw input and a ${activeScenario.freshnessMinutes} minute freshness target.`,
      },
      {
        ...traceEvents[1],
        source: geminiPlanTrace.status === 'live' ? 'gemini-live' : geminiPlanTrace.status === 'loading' ? 'operator' : 'gemini-fallback',
        status: geminiPlanTrace.status === 'loading' ? 'running' : geminiPlanTrace.status === 'live' ? 'complete' : 'blocked',
        detail: getGeminiTraceDetail(geminiPlanTrace),
      },
      {
        ...traceEvents[2],
        source: geminiCritiqueTrace.status === 'live' ? 'gemini-live' : geminiCritiqueTrace.status === 'loading' ? 'operator' : 'gemini-fallback',
        status: geminiCritiqueTrace.status === 'loading' ? 'running' : geminiCritiqueTrace.status === 'live' ? 'complete' : 'blocked',
        detail: getGeminiCritiqueDetail(geminiCritiqueTrace),
      },
      {
        ...traceEvents[3],
        status: 'complete',
        detail: `App-owned evaluator swept ${scenarios.length} seeded scenarios; average candidate delta ${signedDelta(improvementCycle.averageDelta)}; ${improvementCycle.promoted ? 'promotion accepted' : 'promotion held'}.`,
      },
      {
        ...traceEvents[4],
        source: computerAuditTrace.status === 'live' ? 'gemini-live' : computerAuditTrace.status === 'loading' ? 'operator' : 'gemini-fallback',
        status: computerAuditTrace.status === 'idle' ? 'ready' : computerAuditTrace.status === 'loading' ? 'running' : computerAuditTrace.status === 'live' ? 'complete' : 'blocked',
        detail: getComputerAuditDetail(computerAuditTrace),
      },
    ],
    [activeScenario, computerAuditTrace, geminiCritiqueTrace, geminiPlanTrace, improvementCycle.averageDelta, improvementCycle.promoted],
  );
  const resetDemo = () => {
    setActiveScenarioId(scenarios[0].id);
    setActiveView('console');
  };
  const copyJudgeReport = async () => {
    const report = buildJudgeReport({
      activeScenarioName: activeScenario.name,
      baselineScore: baselineScore.total,
      candidatePolicyName: candidatePolicy.name,
      candidateScore: candidateScore.total,
      averageDelta: improvementCycle.averageDelta,
      promoted: improvementCycle.promoted,
      planStatus: geminiPlanTrace.status,
      planError: geminiPlanTrace.error,
      critiqueStatus: geminiCritiqueTrace.status,
      critiqueError: geminiCritiqueTrace.error,
      auditStatus: computerAuditTrace.status,
      auditError: computerAuditTrace.error,
      auditExecutionMode: computerAuditTrace.executionMode,
      auditPromptInjectionDetection: computerAuditTrace.promptInjectionDetection,
    });
    setJudgeReport(report);

    try {
      await navigator.clipboard.writeText(report);
      setReportStatus('copied');
    } catch {
      setReportStatus('blocked');
    }
  };
  const runComputerAudit = async () => {
    setComputerAuditTrace({
      status: 'loading',
      model: 'gemini-3.5-flash',
      executionMode: 'propose_only',
      promptInjectionDetection: true,
      actions: [],
    });

    try {
      const snapshot = buildAuditSnapshot({
        activeView,
        scenario: activeScenario,
        policy: currentPolicy,
        improvementCycle,
        planTrace: geminiPlanTrace,
        critiqueTrace: geminiCritiqueTrace,
      });
      const trace = await requestGeminiComputerAudit({
        task: 'Inspect this OrbitForge demo state and propose the next UI action or inspection that would most improve judge readiness.',
        ...snapshot,
      });

      setComputerAuditTrace(trace);
    } catch (error) {
      setComputerAuditTrace({
        status: 'fallback',
        model: 'gemini-fallback',
        error: error instanceof Error ? error.message : 'Unknown local audit snapshot failure',
        actions: [
          {
            name: 'blocked',
            intent: 'Local audit snapshot could not be generated, so use manual browser QA.',
            safetyDecision: 'blocked',
          },
        ],
      });
    }
  };

  useEffect(() => {
    let isCurrent = true;

    setGeminiPlanTrace({ status: 'loading', model: 'gemini-3.5-flash' });
    setGeminiCritiqueTrace({ status: 'loading', model: 'gemini-3.5-flash' });
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
    requestGeminiCritique({
      scenario: activeScenario,
      baselinePolicy: currentPolicy,
      candidatePolicy,
      baselineScore,
      candidateScore,
      mutation: improvementCycle.mutation,
      scenarioResults: improvementCycle.scenarioResults,
      promotionDecision: {
        promoted: improvementCycle.promoted,
        averageDelta: improvementCycle.averageDelta,
        reasons: improvementCycle.reasons,
        scenarioCount: scenarios.length,
      },
    }).then((trace) => {
      if (isCurrent) {
        setGeminiCritiqueTrace(trace);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [activeScenario.id, geminiRunId]);

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
          <div className="topbar-actions">
            <button className="reset-button" type="button" onClick={copyJudgeReport}>
              <Copy size={16} />
              Copy report
            </button>
            <button className="reset-button" type="button" onClick={resetDemo}>
              <RotateCcw size={16} />
              Reset demo
            </button>
            {reportStatus !== 'idle' && (
              <span className={reportStatus === 'copied' ? 'report-status copied' : 'report-status blocked'}>
                {reportStatus === 'copied' ? 'Report copied' : 'Clipboard blocked'}
              </span>
            )}
          </div>
        </header>

        {judgeReport && (
          <section className="panel report-panel" aria-label="Judge report export">
            <div>
              <p className="eyebrow">{reportStatus === 'blocked' ? 'Manual copy report' : 'Judge report'}</p>
              <pre>{judgeReport}</pre>
            </div>
          </section>
        )}

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
              <OrbitMap
                blockedStationIds={activeScenario.blockedGroundStationIds}
                nodes={orbitalNodes}
                stations={groundStations}
              />
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
                {runtimeTraceEvents.map((event) => (
                  <div className="trace-row" key={event.id}>
                    <span>{event.label}</span>
                    <div className="trace-row-meta">
                      <strong className={`event-status ${event.status}`}>{event.status}</strong>
                      <span className={`source-pill ${event.source}`}>{event.source}</span>
                    </div>
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
              Deterministic evaluation harness
            </div>
            <div className="evaluation-summary">
              <article>
                <p className="eyebrow">Active incident delta</p>
                <strong>{signedDelta(primaryResult.decision.delta)}</strong>
                <span>{primaryResult.decision.reasons[0]}</span>
              </article>
              <article>
                <p className="eyebrow">Promotion gate</p>
                <strong>{improvementCycle.promoted ? 'Accepted' : 'Held'}</strong>
                <span>{improvementCycle.reasons[improvementCycle.reasons.length - 1]}</span>
              </article>
              <article>
                <p className="eyebrow">Golden sweep</p>
                <strong>{signedDelta(improvementCycle.averageDelta)}</strong>
                <span>{scenarios.length} seeded scenarios checked for regression.</span>
              </article>
            </div>
            <div className="score-grid">
              {scoreDimensionLabels.map((dimension) => (
                <Metric
                  key={dimension.key}
                  label={dimension.label}
                  value={`${baselineScore.dimensions[dimension.key]} -> ${candidateScore.dimensions[dimension.key]}`}
                />
              ))}
            </div>
            <div className="delta-banner rejection-banner">
              <strong>Guardrail canary held</strong>
              <span>
                {' '}{guardrailCanary.policy.name} scored {guardrailCanary.score.dimensions.guardrail} on guardrail and
                {guardrailCanary.decision.promoted ? ' unexpectedly passed' : ' was blocked'} because seeded-data/no-control guardrails were removed.
              </span>
            </div>
            <p className="eyebrow sweep-label">Golden scenario sweep</p>
            <div className="scenario-table compact-table">
              {improvementCycle.scenarioResults.map((result) => {
                const scenario = scenarios.find((item) => item.id === result.scenarioId);

                return (
                  <article className="score-sweep-row" key={result.scenarioId}>
                    <div>
                      <strong>{scenario?.name ?? result.scenarioId}</strong>
                      <span>{result.candidateScore.failures.length > 0 ? result.candidateScore.failures.join(', ') : 'No candidate failures below threshold.'}</span>
                    </div>
                    <Metric label="Baseline" value={String(result.baselineScore.total)} />
                    <Metric label="Candidate" value={String(result.candidateScore.total)} />
                    <Metric label="Delta" value={signedDelta(result.decision.delta)} />
                  </article>
                );
              })}
            </div>
            <p className="risk-note">Promotion will be decided by app-owned deterministic scores, not Gemini self-grading.</p>
          </section>
        )}

        {activeView === 'policy' && (
          <section className="panel full-panel">
            <div className="panel-title">
              <GitCompare size={18} />
              Candidate policy patch
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
              {' '}Average sweep {signedDelta(improvementCycle.averageDelta)}.
            </div>
            <div className="delta-banner memory-banner">
              <strong>Learning memory write</strong>
              <span>
                {' '}Seeded memory records {activeScenario.id} failure signature {learningFailureSignature} as candidate patch;
                retained only after golden sweep {signedDelta(improvementCycle.averageDelta)} and guardrail canary hold.
              </span>
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
            <div className="trace-toolbar">
              <button
                className="reset-button"
                type="button"
                onClick={() => setGeminiRunId((value) => value + 1)}
                disabled={geminiPlanTrace.status === 'loading' || geminiCritiqueTrace.status === 'loading'}
              >
                <RefreshCw size={16} />
                Retry Gemini
              </button>
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
                <Metric label="Latency" value={formatLatency(geminiPlanTrace)} />
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
                  <pre>{geminiPlanTrace.outputText || geminiPlanTrace.error || 'No model output captured yet.'}</pre>
                </div>
              </div>
            </article>
            <article className="gemini-output critique-output">
              <div>
                <p className="eyebrow">Gemini improvement critique</p>
                <h3>{geminiCritiqueTrace.status === 'live' ? 'Critique received' : 'Critique fallback'}</h3>
                <p>{geminiCritiqueTrace.critique?.summary ?? geminiCritiqueTrace.error ?? 'Waiting for Gemini critique.'}</p>
              </div>
              <div className="score-grid">
                <Metric label="Model" value={geminiCritiqueTrace.model} />
                <Metric label="Status" value={geminiCritiqueTrace.status} />
                <Metric label="Recommendation" value={geminiCritiqueTrace.critique?.promotionRecommendation ?? '--'} />
                <Metric label="Latency" value={formatLatency(geminiCritiqueTrace)} />
              </div>
              {geminiCritiqueTrace.critique && (
                <div className="diff-list">
                  {geminiCritiqueTrace.critique.failureAnalysis.map((line) => (
                    <code key={line}>failure: {line}</code>
                  ))}
                  <code>experiment: {geminiCritiqueTrace.critique.proposedExperiment}</code>
                  <code>metric move: {geminiCritiqueTrace.critique.expectedMetricMove}</code>
                  <code>guardrails: {geminiCritiqueTrace.critique.guardrailConcerns.join(', ')}</code>
                  <code>judge note: {geminiCritiqueTrace.critique.judgeNarrative}</code>
                </div>
              )}
              <div className="trace-preview-grid">
                <div>
                  <p className="eyebrow">Critique prompt preview</p>
                  <pre>{geminiCritiqueTrace.promptPreview ?? 'No critique prompt context captured yet.'}</pre>
                </div>
                <div>
                  <p className="eyebrow">Critique output preview</p>
                  <pre>{geminiCritiqueTrace.outputText || geminiCritiqueTrace.error || 'No critique output captured yet.'}</pre>
                </div>
              </div>
            </article>
            <article className="gemini-output audit-output">
              <div className="audit-header">
                <div>
                  <p className="eyebrow">Gemini computer-use audit</p>
                  <h3>{computerAuditTrace.status === 'live' ? 'Audit received' : computerAuditTrace.status === 'idle' ? 'Audit ready' : 'Audit fallback'}</h3>
                  <p>{computerAuditTrace.outputText || computerAuditTrace.error || 'Generate a local audit frame and ask Gemini 3.5 Flash computer-use to suggest the next QA action.'}</p>
                </div>
                <button
                  className="reset-button"
                  type="button"
                  onClick={runComputerAudit}
                  disabled={computerAuditTrace.status === 'loading'}
                >
                  <MousePointerClick size={16} />
                  Run audit
                </button>
              </div>
              <div className="score-grid">
                <Metric label="Model" value={computerAuditTrace.model} />
                <Metric label="Status" value={computerAuditTrace.status} />
                <Metric label="Actions" value={String(computerAuditTrace.actions.length)} />
                <Metric label="Latency" value={formatLatency(computerAuditTrace)} />
                <Metric label="Mode" value={formatAuditMode(computerAuditTrace.executionMode)} />
                <Metric label="Prompt guard" value={formatPromptGuard(computerAuditTrace.promptInjectionDetection)} />
              </div>
              {computerAuditTrace.actions.length > 0 && (
                <div className="diff-list">
                  {computerAuditTrace.actions.map((action, index) => (
                    <code key={`${action.name}-${index}`}>
                      {action.name}: {action.intent}
                      {typeof action.x === 'number' && typeof action.y === 'number' ? ` @ ${action.x},${action.y}` : ''}
                      {action.safetyDecision ? ` (${action.safetyDecision})` : ''}
                    </code>
                  ))}
                </div>
              )}
              <div className="trace-preview-grid">
                <div>
                  <p className="eyebrow">Audit prompt preview</p>
                  <pre>{computerAuditTrace.promptPreview ?? 'No computer-use prompt captured yet.'}</pre>
                </div>
                <div>
                  <p className="eyebrow">Audit output preview</p>
                  <pre>{computerAuditTrace.outputText || computerAuditTrace.error || 'No computer-use output captured yet.'}</pre>
                </div>
              </div>
            </article>
            <div className="trace-list">
              {runtimeTraceEvents.map((event) => (
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

function signedDelta(value: number): string {
  return `${value > 0 ? '+' : ''}${value}`;
}

function getGeminiTraceDetail(trace: GeminiPlanTrace): string {
  if (trace.status === 'loading') {
    return 'Gemini 3.5 Flash request is running against the seeded scenario context.';
  }

  if (trace.status === 'live') {
    return `Gemini 3.5 Flash returned a ${trace.plan?.placement ?? 'plan'} recommendation with confidence ${trace.plan?.confidence ?? '--'}.`;
  }

  if (trace.error) {
    return `Gemini live path is blocked, so the app is showing a labeled fallback: ${trace.error}`;
  }

  return 'Gemini trace has not started yet.';
}

function getGeminiCritiqueDetail(trace: GeminiCritiqueTrace): string {
  if (trace.status === 'loading') {
    return 'Gemini 3.5 Flash is critiquing deterministic evaluator results.';
  }

  if (trace.status === 'live') {
    return `Gemini critique recommends ${trace.critique?.promotionRecommendation ?? 'review'} and proposes ${trace.critique?.proposedExperiment ?? 'a follow-up experiment'}.`;
  }

  if (trace.error) {
    return `Gemini critique path is blocked, so fallback critique is labeled: ${trace.error}`;
  }

  return 'Gemini critique has not started yet.';
}

function getComputerAuditDetail(trace: GeminiComputerAuditTrace): string {
  if (trace.status === 'idle') {
    return 'Computer-use audit is ready to run from the current seeded UI state.';
  }

  if (trace.status === 'loading') {
    return 'Gemini 3.5 Flash computer-use audit is inspecting the generated audit frame.';
  }

  if (trace.status === 'live') {
    return `Computer-use audit returned ${trace.actions.length} proposed action${trace.actions.length === 1 ? '' : 's'} for judge-readiness QA.`;
  }

  if (trace.error) {
    return `Computer-use audit is blocked, so the app shows the exact fallback reason: ${trace.error}`;
  }

  return 'Computer-use audit status is unavailable.';
}

function formatLatency(trace: GeminiPlanTrace | GeminiCritiqueTrace | GeminiComputerAuditTrace): string {
  if (trace.cacheHit) {
    return 'cache';
  }

  return trace.latencyMs ? `${trace.latencyMs} ms` : '--';
}
