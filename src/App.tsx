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
  Wrench,
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
import { applyIncidentCommand, getIncidentCommands, summarizeIncidentCommands } from './domain/incidentActions';
import { runImprovementCycle } from './domain/improvement';
import { buildJudgeReport, formatAuditMode, formatPromptGuard } from './domain/judgeReport';
import { runPolicyOnScenario } from './domain/scenarioRunner';
import type { FleetStatus, ScoreDimension, TraceEvent } from './domain/types';

type View = 'console' | 'scenario' | 'evaluation' | 'policy' | 'trace';

type OperatorLogEntry = {
  id: string;
  source: 'system' | 'operator';
  label: string;
  detail: string;
};

type WorkQueueItem = {
  id: string;
  label: string;
  detail: string;
  complete: boolean;
};

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

const baselinePolicy = policyVersions[0];
const initialOperatorLog: OperatorLogEntry[] = [
  {
    id: 'log-scenario-loaded',
    source: 'system',
    label: 'Scenario armed',
    detail: 'Wildfire SAR Rapid Response loaded with baseline policy and seeded telemetry.',
  },
  {
    id: 'log-evaluation-ready',
    source: 'system',
    label: 'Candidate ready',
    detail: 'Thermal-contact candidate generated and waiting for operator promotion.',
  },
];

export function App() {
  const [activeView, setActiveView] = useState<View>('console');
  const [activeScenarioId, setActiveScenarioId] = useState(scenarios[0].id);
  const [activePolicy, setActivePolicy] = useState(baselinePolicy);
  const [appliedCommandIds, setAppliedCommandIds] = useState<string[]>([]);
  const [operatorLog, setOperatorLog] = useState<OperatorLogEntry[]>(initialOperatorLog);
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
  const improvementCycle = useMemo(
    () => runImprovementCycle(activeScenario, baselinePolicy, scenarios, orbitalNodes, groundStations),
    [activeScenario],
  );
  const candidatePolicy = improvementCycle.mutation.candidatePolicy;
  const candidateAlreadyActive = activePolicy.id === candidatePolicy.id;
  const canPromoteCandidate = improvementCycle.promoted && !candidateAlreadyActive;
  const incidentCommands = useMemo(() => getIncidentCommands(activeScenario), [activeScenario]);
  const incidentCommandSummary = useMemo(
    () => summarizeIncidentCommands(activeScenario, appliedCommandIds),
    [activeScenario, appliedCommandIds],
  );
  const primaryResult =
    improvementCycle.scenarioResults.find((result) => result.scenarioId === activeScenario.id) ??
    improvementCycle.scenarioResults[0];
  const baselineScore = primaryResult.baselineScore;
  const candidateScore = primaryResult.candidateScore;
  const activePolicyScore = candidateAlreadyActive ? candidateScore.total : baselineScore.total;
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
  const workQueue = useMemo<WorkQueueItem[]>(
    () => [
      {
        id: 'guardrail-canary',
        label: 'Guardrail canary held',
        detail: 'Unsafe overclaiming mutation was rejected by app-owned scores.',
        complete: !guardrailCanary.decision.promoted,
      },
      {
        id: 'stabilize-incident',
        label: 'Stabilize active incident',
        detail: 'Apply the scenario command deck until readiness reaches stabilized state.',
        complete: incidentCommandSummary.stabilized,
      },
      {
        id: 'promote-candidate',
        label: 'Promote candidate policy',
        detail: 'Make the thermal-contact candidate the active operator policy.',
        complete: candidateAlreadyActive,
      },
      {
        id: 'audit-ui',
        label: 'Run computer-use audit',
        detail: 'Generate audit frame and request Gemini proposed QA actions or exact blocker.',
        complete: computerAuditTrace.status !== 'idle' && computerAuditTrace.status !== 'loading',
      },
      {
        id: 'export-report',
        label: 'Export judge report',
        detail: 'Capture active policy, scores, Gemini state, and seeded-data guardrail.',
        complete: judgeReport.length > 0,
      },
    ],
    [
      candidateAlreadyActive,
      computerAuditTrace.status,
      guardrailCanary.decision.promoted,
      incidentCommandSummary.stabilized,
      judgeReport.length,
    ],
  );
  const completedWorkItems = workQueue.filter((item) => item.complete).length;
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
    setActivePolicy(baselinePolicy);
    setAppliedCommandIds([]);
    setOperatorLog([
      {
        id: `log-reset-${Date.now()}`,
        source: 'operator',
        label: 'Demo reset',
        detail: 'Baseline policy restored; report and audit state cleared.',
      },
      ...initialOperatorLog,
    ]);
    setComputerAuditTrace({
      status: 'idle',
      model: 'gemini-3.5-flash',
      executionMode: 'propose_only',
      actions: [],
    });
    setReportStatus('idle');
    setJudgeReport('');
    setActiveView('console');
  };
  const promoteCandidatePolicy = () => {
    if (!canPromoteCandidate) {
      return;
    }

    setActivePolicy(candidatePolicy);
    setOperatorLog((entries) => [
      {
        id: `log-promote-${Date.now()}`,
        source: 'operator',
        label: 'Candidate promoted',
        detail: `${candidatePolicy.name} is now active. Score changed from ${baselineScore.total} to ${candidateScore.total} on ${activeScenario.name}.`,
      },
      ...entries,
    ]);
    setActiveView('console');
  };
  const applyCommandToIncident = (commandId: string) => {
    const command = incidentCommands.find((item) => item.id === commandId);

    if (!command || appliedCommandIds.includes(commandId)) {
      return;
    }

    setAppliedCommandIds((ids) => applyIncidentCommand(activeScenario, ids, commandId));
    setOperatorLog((entries) => [
      {
        id: `log-command-${commandId}-${Date.now()}`,
        source: 'operator',
        label: 'Incident command applied',
        detail: `${command.label}: ${command.detail} (${command.impactLabel}).`,
      },
      ...entries,
    ]);
  };
  const copyJudgeReport = async () => {
    const report = buildJudgeReport({
      activeScenarioName: activeScenario.name,
      activePolicyName: activePolicy.name,
      activePolicyState: candidateAlreadyActive ? 'promoted' : 'baseline',
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
      incidentReadinessScore: incidentCommandSummary.readinessScore,
      incidentReadinessLabel: incidentCommandSummary.readinessLabel,
      appliedCommandLabels: incidentCommandSummary.appliedCommands.map((command) => command.label),
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
        policy: activePolicy,
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
      baselinePolicy,
      baselineScore,
      mutation: improvementCycle.mutation,
    }).then((trace) => {
      if (isCurrent) {
        setGeminiPlanTrace(trace);
      }
    });
    requestGeminiCritique({
      scenario: activeScenario,
      baselinePolicy,
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
          <strong>{activePolicy.name}</strong>
          <span>{activePolicy.summary}</span>
          <div className="score-chip">
            <Gauge size={16} />
            Active policy score {activePolicyScore}
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

            <section className="panel command-panel">
              <div className="panel-title">
                <Wrench size={18} />
                Incident command deck
              </div>
              <div className="command-summary">
                <Metric label="Readiness" value={`${incidentCommandSummary.readinessScore}%`} />
                <Metric label="Commands" value={`${incidentCommandSummary.appliedCommands.length}/${incidentCommands.length}`} />
                <Metric label="State" value={incidentCommandSummary.readinessLabel} />
              </div>
              <div className="readiness-meter" aria-label={`Incident readiness ${incidentCommandSummary.readinessScore}%`}>
                <span style={{ width: `${incidentCommandSummary.readinessScore}%` }} />
              </div>
              <div className="command-actions">
                {incidentCommands.map((command) => {
                  const applied = appliedCommandIds.includes(command.id);

                  return (
                    <button
                      className={applied ? 'command-button applied' : 'command-button'}
                      disabled={applied}
                      key={command.id}
                      onClick={() => applyCommandToIncident(command.id)}
                      type="button"
                    >
                      <div>
                        <strong>{command.label}</strong>
                        <span>{command.detail}</span>
                      </div>
                      <span className={applied ? 'event-status complete' : 'event-status ready'}>
                        {applied ? 'applied' : command.impactLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className={incidentCommandSummary.stabilized ? 'delta-banner memory-banner' : 'delta-banner'}>
                <strong>{incidentCommandSummary.stabilized ? 'Incident stabilized' : 'Incident still active'}</strong>
                <span>
                  {' '}
                  {incidentCommandSummary.remainingRisks.length > 0
                    ? `Remaining weak metrics: ${incidentCommandSummary.remainingRisks.join(', ')}.`
                    : 'All command metrics are above risk threshold.'}
                </span>
              </div>
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
                <Metric label={baselinePolicy.name} value={String(baselineScore.total)} />
                <Metric label={candidatePolicy.name} value={String(candidateScore.total)} />
              </div>
              <div className="delta-banner">
                {primaryResult.decision.delta > 0 ? '+' : ''}{primaryResult.decision.delta} points on active incident;
                {' '}{improvementCycle.averageDelta > 0 ? '+' : ''}{improvementCycle.averageDelta} average across golden scenarios
              </div>
            </section>

            <section className="panel work-queue-panel">
              <div className="panel-title">
                <ShieldCheck size={18} />
                Incident work queue
              </div>
              <div className="queue-summary">
                <Metric label="Readiness" value={`${completedWorkItems}/${workQueue.length}`} />
                <Metric label="Active policy" value={candidateAlreadyActive ? 'Promoted' : 'Baseline'} />
              </div>
              <div className="work-queue-list">
                {workQueue.map((item) => (
                  <article className="work-item" key={item.id}>
                    <div>
                      <strong>{item.label}</strong>
                      <span>{item.detail}</span>
                    </div>
                    <strong className={item.complete ? 'event-status complete' : 'event-status ready'}>
                      {item.complete ? 'done' : 'open'}
                    </strong>
                  </article>
                ))}
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

            <section className="panel activity-panel">
              <div className="panel-title">
                <Activity size={18} />
                Operations log
              </div>
              <div className="activity-list">
                {operatorLog.map((entry) => (
                  <article className="activity-row" key={entry.id}>
                    <div>
                      <strong>{entry.label}</strong>
                      <span>{entry.detail}</span>
                    </div>
                    <span className={`source-pill ${entry.source}`}>{entry.source}</span>
                  </article>
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
                    setAppliedCommandIds([]);
                    setOperatorLog((entries) => [
                      {
                        id: `log-scenario-${scenario.id}-${Date.now()}`,
                        source: 'operator',
                        label: 'Scenario selected',
                        detail: `${scenario.name} loaded for seeded evaluation.`,
                      },
                      ...entries,
                    ]);
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
                <strong>{baselinePolicy.name}</strong>
                <span>{baselinePolicy.summary}</span>
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
            <div className="workflow-actions">
              <button
                className="reset-button primary-action"
                type="button"
                onClick={promoteCandidatePolicy}
                disabled={!canPromoteCandidate}
              >
                <ShieldCheck size={16} />
                {candidateAlreadyActive ? 'Candidate active' : 'Promote candidate'}
              </button>
              <span className={candidateAlreadyActive ? 'report-status copied' : 'report-status'}>
                {candidateAlreadyActive ? `${candidatePolicy.name} is active` : 'Candidate is staged for operator approval'}
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
