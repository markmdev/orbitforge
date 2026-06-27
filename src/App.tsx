import {
  Activity,
  BrainCircuit,
  Clock3,
  Copy,
  Gauge,
  GitCompare,
  MousePointerClick,
  Play,
  Radar,
  RefreshCw,
  RotateCcw,
  Satellite,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { buildAuditSnapshot } from './ai/auditSnapshot';
import type { GeminiComputerAuditTrace } from './ai/geminiComputerAudit';
import { requestGeminiComputerAudit } from './ai/geminiComputerAudit';
import type { GeminiHealthTrace } from './ai/geminiHealth';
import { requestGeminiHealth } from './ai/geminiHealth';
import type { GeminiCritiqueTrace, GeminiPlanTrace } from './ai/geminiPlan';
import { requestGeminiCritique, requestGeminiPlan } from './ai/geminiPlan';
import { OrbitMap } from './components/OrbitMap';
import { groundStations, orbitalNodes, policyVersions, scenarios, traceEvents } from './data/demoState';
import { decidePromotion, evaluatePlan } from './domain/evaluator';
import { applyIncidentCommand, getIncidentCommands, summarizeIncidentCommands } from './domain/incidentActions';
import { runImprovementCycle } from './domain/improvement';
import { buildJudgeReport, formatAuditMode, formatPromptGuard } from './domain/judgeReport';
import { buildLearningMemoryEntry, type LearningMemoryEntry, upsertLearningMemory } from './domain/learningMemory';
import { buildMissionExecution, type MissionExecution } from './domain/missionExecution';
import { createStressDrill } from './domain/scenarioDrill';
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
  action?: WorkQueueAction;
  actionLabel?: string;
  actionDisabled?: boolean;
  gate?: string;
};

type WorkQueueAction = 'apply-next-command' | 'run-improvement' | 'promote-candidate' | 'run-mission' | 'run-audit' | 'export-report';

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
const learningMemoryStorageKey = 'orbitforge.learning-memory.v1';
const initialOperatorLog: OperatorLogEntry[] = [
  {
    id: 'log-scenario-loaded',
    source: 'system',
    label: 'Scenario armed',
    detail: 'Wildfire SAR Rapid Response loaded with baseline policy and seeded telemetry.',
  },
  {
    id: 'log-improvement-idle',
    source: 'system',
    label: 'Improvement idle',
    detail: 'Run an improvement pass from Policy Lab before a candidate can be promoted.',
  },
];

export function App() {
  const [activeView, setActiveView] = useState<View>('console');
  const [scenarioLibrary, setScenarioLibrary] = useState(scenarios);
  const [activeScenarioId, setActiveScenarioId] = useState(scenarios[0].id);
  const [activePolicy, setActivePolicy] = useState(baselinePolicy);
  const [stagedImprovementKey, setStagedImprovementKey] = useState<string | null>(null);
  const [promotedImprovementKey, setPromotedImprovementKey] = useState<string | null>(null);
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
  const [geminiHealthTrace, setGeminiHealthTrace] = useState<GeminiHealthTrace>({
    status: 'loading',
    model: 'gemini-3.5-flash',
    cacheEntries: 0,
    liveCallRequired: false,
  });
  const [reportStatus, setReportStatus] = useState<'idle' | 'copied' | 'blocked'>('idle');
  const [judgeReport, setJudgeReport] = useState('');
  const [geminiRunId, setGeminiRunId] = useState(0);
  const [missionExecution, setMissionExecution] = useState<MissionExecution | null>(null);
  const [learningMemory, setLearningMemory] = useState<LearningMemoryEntry[]>(loadLearningMemoryEntries);
  const critiqueRequestIdRef = useRef(0);
  const activeScenario = scenarioLibrary.find((scenario) => scenario.id === activeScenarioId) ?? scenarios[0];
  const improvementCycle = useMemo(
    () => runImprovementCycle(activeScenario, baselinePolicy, scenarioLibrary, orbitalNodes, groundStations),
    [activeScenario, scenarioLibrary],
  );
  const improvementKey = `${activeScenario.id}:${improvementCycle.mutation.id}`;
  const improvementStaged = stagedImprovementKey === improvementKey;
  const candidatePolicy = improvementCycle.mutation.candidatePolicy;
  const candidateAlreadyActive = promotedImprovementKey === improvementKey && activePolicy.id === candidatePolicy.id;
  const canPromoteCandidate = improvementStaged && improvementCycle.promoted && !candidateAlreadyActive;
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
  const currentMemoryEntry = learningMemory.find((entry) => entry.id === `${activeScenario.id}:${improvementCycle.mutation.id}`);
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
        action: 'apply-next-command',
        actionLabel: incidentCommandSummary.appliedCommands.length > 0 ? 'Apply next command' : 'Start stabilization',
      },
      {
        id: 'run-improvement',
        label: 'Run improvement pass',
        detail: 'Stage a scenario-scoped candidate from evaluator failures and Gemini critique.',
        complete: improvementStaged,
        action: 'run-improvement',
        actionLabel: geminiCritiqueTrace.status === 'loading' ? 'Running pass' : 'Run pass',
        actionDisabled: geminiCritiqueTrace.status === 'loading',
      },
      {
        id: 'promote-candidate',
        label: 'Promote candidate policy',
        detail: 'Make the thermal-contact candidate the active operator policy.',
        complete: candidateAlreadyActive,
        action: 'promote-candidate',
        actionLabel: 'Promote',
        actionDisabled: !canPromoteCandidate,
        gate: improvementStaged ? 'Evaluator gate must accept the staged policy.' : 'Run improvement pass first.',
      },
      {
        id: 'run-mission',
        label: 'Run mission plan',
        detail: 'Execute the active policy into a seeded timeline and data-product handoff.',
        complete: candidateAlreadyActive && missionExecution !== null,
        action: 'run-mission',
        actionLabel: missionExecution ? 'Rerun mission' : 'Run mission',
        actionDisabled: !candidateAlreadyActive,
        gate: 'Promote the candidate policy first.',
      },
      {
        id: 'audit-ui',
        label: 'Run computer-use audit',
        detail: 'Generate audit frame and request Gemini proposed QA actions or exact blocker.',
        complete: computerAuditTrace.status !== 'idle' && computerAuditTrace.status !== 'loading',
        action: 'run-audit',
        actionLabel: computerAuditTrace.status === 'loading' ? 'Audit running' : 'Run audit',
        actionDisabled: !missionExecution || computerAuditTrace.status === 'loading',
        gate: 'Run mission plan first.',
      },
      {
        id: 'export-report',
        label: 'Export judge report',
        detail: 'Capture active policy, scores, Gemini state, and seeded-data guardrail.',
        complete: judgeReport.length > 0,
        action: 'export-report',
        actionLabel: 'Export report',
        actionDisabled: computerAuditTrace.status === 'idle' || computerAuditTrace.status === 'loading',
        gate: 'Run audit first.',
      },
    ],
    [
      candidateAlreadyActive,
      canPromoteCandidate,
      computerAuditTrace.status,
      geminiCritiqueTrace.status,
      guardrailCanary.decision.promoted,
      incidentCommandSummary.appliedCommands.length,
      improvementStaged,
      incidentCommandSummary.stabilized,
      judgeReport.length,
      missionExecution,
    ],
  );
  const completedWorkItems = workQueue.filter((item) => item.complete).length;
  const nextWorkItem = workQueue.find((item) => !item.complete);
  const totalRawGb = useMemo(() => scenarioLibrary.reduce((sum, scenario) => sum + scenario.rawGb, 0), [scenarioLibrary]);
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
        source:
          geminiCritiqueTrace.status === 'live'
            ? 'gemini-live'
            : geminiCritiqueTrace.status === 'fallback'
              ? 'gemini-fallback'
              : 'operator',
        status:
          geminiCritiqueTrace.status === 'idle'
            ? 'ready'
            : geminiCritiqueTrace.status === 'loading'
              ? 'running'
              : geminiCritiqueTrace.status === 'live'
                ? 'complete'
                : 'blocked',
        detail: getGeminiCritiqueDetail(geminiCritiqueTrace),
      },
      {
        ...traceEvents[3],
        status: improvementStaged ? 'complete' : 'ready',
        detail: improvementStaged
          ? `App-owned evaluator swept ${scenarioLibrary.length} seeded scenarios; average candidate delta ${signedDelta(improvementCycle.averageDelta)}; ${improvementCycle.promoted ? 'promotion accepted' : 'promotion held'}.`
          : `App-owned evaluator is ready; run improvement pass to stage a candidate across ${scenarioLibrary.length} seeded scenarios.`,
      },
      {
        ...traceEvents[4],
        source: computerAuditTrace.status === 'live' ? 'gemini-live' : computerAuditTrace.status === 'loading' ? 'operator' : 'gemini-fallback',
        status: computerAuditTrace.status === 'idle' ? 'ready' : computerAuditTrace.status === 'loading' ? 'running' : computerAuditTrace.status === 'live' ? 'complete' : 'blocked',
        detail: getComputerAuditDetail(computerAuditTrace),
      },
    ],
    [
      activeScenario,
      computerAuditTrace,
      geminiCritiqueTrace,
      geminiPlanTrace,
      improvementCycle.averageDelta,
      improvementCycle.promoted,
      improvementStaged,
      scenarioLibrary.length,
    ],
  );
  const resetDemo = () => {
    setScenarioLibrary(scenarios);
    setActiveScenarioId(scenarios[0].id);
    setActivePolicy(baselinePolicy);
    setStagedImprovementKey(null);
    setPromotedImprovementKey(null);
    setMissionExecution(null);
    critiqueRequestIdRef.current += 1;
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
    setGeminiCritiqueTrace({ status: 'idle', model: 'gemini-3.5-flash' });
    setReportStatus('idle');
    setJudgeReport('');
    setActiveView('console');
  };
  const promoteCandidatePolicy = () => {
    if (!canPromoteCandidate) {
      return;
    }

    setActivePolicy(candidatePolicy);
    setPromotedImprovementKey(improvementKey);
    setMissionExecution(null);
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
    setMissionExecution(null);
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
  const runImprovementPass = () => {
    const requestId = critiqueRequestIdRef.current + 1;
    critiqueRequestIdRef.current = requestId;
    const memoryEntry = buildLearningMemoryEntry({
      scenario: activeScenario,
      mutation: improvementCycle.mutation,
      candidatePolicy,
      failureSignature: learningFailureSignature,
      activeDelta: primaryResult.decision.delta,
      averageDelta: improvementCycle.averageDelta,
      guardrailHeld: !guardrailCanary.decision.promoted,
      promoted: improvementCycle.promoted,
      createdAt: new Date().toISOString(),
    });
    const nextLearningMemory = upsertLearningMemory(learningMemory, memoryEntry);

    setStagedImprovementKey(improvementKey);
    setPromotedImprovementKey(null);
    setActivePolicy(baselinePolicy);
    setMissionExecution(null);
    setLearningMemory(nextLearningMemory);
    saveLearningMemoryEntries(nextLearningMemory);
    setGeminiCritiqueTrace({ status: 'loading', model: 'gemini-3.5-flash' });
    setOperatorLog((entries) => [
      {
        id: `log-improvement-${activeScenario.id}-${Date.now()}`,
        source: 'operator',
        label: 'Improvement pass run',
        detail: `${improvementCycle.mutation.summary} Candidate ${candidatePolicy.name} is staged for promotion review.`,
      },
      ...entries,
    ]);
    requestGeminiCritique({
      learningMemory: nextLearningMemory.slice(0, 4),
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
        scenarioCount: scenarioLibrary.length,
      },
    }).then((trace) => {
      if (critiqueRequestIdRef.current === requestId) {
        setGeminiCritiqueTrace(trace);
      }
    });
  };
  const generateStressDrill = () => {
    const drillSequence = scenarioLibrary.filter((scenario) => scenario.id.startsWith('stress-')).length + 1;
    const drill = createStressDrill(activeScenario, drillSequence);

    setScenarioLibrary((library) => [...library, drill]);
    setActiveScenarioId(drill.id);
    setActivePolicy(baselinePolicy);
    setStagedImprovementKey(null);
    setPromotedImprovementKey(null);
    setMissionExecution(null);
    critiqueRequestIdRef.current += 1;
    setAppliedCommandIds([]);
    setComputerAuditTrace({
      status: 'idle',
      model: 'gemini-3.5-flash',
      executionMode: 'propose_only',
      actions: [],
    });
    setGeminiCritiqueTrace({ status: 'idle', model: 'gemini-3.5-flash' });
    setReportStatus('idle');
    setJudgeReport('');
    setOperatorLog((entries) => [
      {
        id: `log-stress-drill-${drill.id}-${Date.now()}`,
        source: 'operator',
        label: 'Stress drill generated',
        detail: `${drill.name} added to seeded scenario library and selected for evaluation.`,
      },
      ...entries,
    ]);
    setActiveView('console');
  };
  const copyJudgeReport = async () => {
    const report = buildJudgeReport({
      activeScenarioName: activeScenario.name,
      activePolicyName: activePolicy.name,
      activePolicyState: candidateAlreadyActive ? 'promoted' : 'baseline',
      baselineScore: baselineScore.total,
      candidatePolicyName: improvementStaged ? candidatePolicy.name : 'not staged',
      candidateScore: improvementStaged ? candidateScore.total : null,
      averageDelta: improvementStaged ? improvementCycle.averageDelta : 0,
      promoted: improvementStaged && improvementCycle.promoted,
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
      runtimeHealthStatus: geminiHealthTrace.status,
      runtimeHealthError: geminiHealthTrace.error,
      runtimeHealthCacheEntries: geminiHealthTrace.cacheEntries,
      missionStatus: missionExecution ? missionExecution.freshnessStatus : 'not_run',
      missionProductName: missionExecution?.dataProductName,
      missionFreshnessMinutes: missionExecution?.deliveredFreshnessMinutes,
      missionNodeName: missionExecution?.nodeName,
      missionStationName: missionExecution?.stationName,
      missionPlacement: missionExecution?.placement,
      missionReadinessBonusMinutes: missionExecution?.readinessBonusMinutes,
      manifestStatus: missionExecution?.manifestStatus,
      manifestVerifiedCount: missionExecution?.manifest.filter((item) => item.validation === 'verified').length,
      manifestItemCount: missionExecution?.manifest.length,
      manifestTotalGb: missionExecution?.manifest.reduce((sum, item) => sum + item.sizeGb, 0),
      manifestWatermarkStatus: getManifestWatermarkStatus(missionExecution),
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
        improvementStaged,
        missionExecution,
        learningMemory: learningMemory.slice(0, 4),
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
        executionMode: 'propose_only',
        promptInjectionDetection: true,
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
  const runMissionPlan = () => {
    const execution = buildMissionExecution(
      activeScenario,
      activePolicy,
      orbitalNodes,
      groundStations,
      incidentCommandSummary.readinessScore,
    );

    setMissionExecution(execution);
    setOperatorLog((entries) => [
      {
        id: `log-execution-${activeScenario.id}-${Date.now()}`,
        source: 'operator',
        label: 'Mission plan run',
        detail: `${execution.dataProductName} ${execution.freshnessStatus === 'met' ? 'ready' : 'late'} at T+${execution.deliveredFreshnessMinutes}m via ${execution.nodeName} and ${execution.stationName}.`,
      },
      ...entries,
    ]);
    setActiveView('console');
  };
  const runWorkQueueAction = (action: WorkQueueAction) => {
    if (action === 'apply-next-command') {
      const nextCommand = incidentCommands.find((command) => !appliedCommandIds.includes(command.id));

      if (nextCommand) {
        applyCommandToIncident(nextCommand.id);
      }

      return;
    }

    if (action === 'run-improvement') {
      runImprovementPass();
      return;
    }

    if (action === 'promote-candidate') {
      promoteCandidatePolicy();
      return;
    }

    if (action === 'run-mission') {
      runMissionPlan();
      return;
    }

    if (action === 'run-audit') {
      void runComputerAudit();
      return;
    }

    void copyJudgeReport();
  };

  useEffect(() => {
    let isCurrent = true;

    requestGeminiHealth().then((trace) => {
      if (isCurrent) {
        setGeminiHealthTrace(trace);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;

    setGeminiPlanTrace({ status: 'loading', model: 'gemini-3.5-flash' });
    requestGeminiPlan({
      learningMemory: learningMemory.slice(0, 4),
      scenario: activeScenario,
      baselinePolicy,
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
  }, [activeScenario.id, geminiRunId, learningMemory, improvementCycle.mutation, baselineScore]);

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
          <>
            <section className="next-action-strip" aria-label="Next operator action">
              <div className="next-action-copy">
                <p className="eyebrow">{nextWorkItem ? 'Next operator action' : 'Demo loop ready'}</p>
                <strong>{nextWorkItem?.label ?? 'Judge report exported'}</strong>
                <span>
                  {nextWorkItem
                    ? nextWorkItem.actionDisabled && nextWorkItem.gate
                      ? nextWorkItem.gate
                      : nextWorkItem.detail
                    : 'All workflow proof is complete and ready for the judge report.'}
                </span>
              </div>
              <div className="next-action-progress">
                <span>Queue</span>
                <strong>{completedWorkItems}/{workQueue.length}</strong>
              </div>
              <button
                className="queue-action next-action-button"
                type="button"
                onClick={() => {
                  if (nextWorkItem?.action) {
                    runWorkQueueAction(nextWorkItem.action);
                  }
                }}
                disabled={!nextWorkItem?.action || nextWorkItem.actionDisabled}
              >
                {nextWorkItem?.actionLabel ?? 'Loop ready'}
              </button>
            </section>

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
                <Metric label={candidatePolicy.name} value={improvementStaged ? String(candidateScore.total) : 'Run pass'} />
              </div>
              <div className="delta-banner">
                {improvementStaged
                  ? `${primaryResult.decision.delta > 0 ? '+' : ''}${primaryResult.decision.delta} points on active incident; ${improvementCycle.averageDelta > 0 ? '+' : ''}${improvementCycle.averageDelta} average across golden scenarios`
                  : 'Run an improvement pass in Policy Lab to stage a scenario-scoped candidate.'}
              </div>
            </section>

            <section className="panel mission-execution-panel">
              <div className="panel-title">
                <Clock3 size={18} />
                Mission execution timeline
              </div>
              <div className="execution-summary">
                <Metric label="Data product" value={missionExecution ? `${missionExecution.targetGb} GB` : 'Not run'} />
                <Metric
                  label="Freshness"
                  value={
                    missionExecution
                      ? `T+${missionExecution.deliveredFreshnessMinutes}m ${missionExecution.freshnessStatus}`
                      : '--'
                  }
                />
                <Metric
                  label="Path"
                  value={missionExecution ? `${missionExecution.nodeName} -> ${missionExecution.stationName}` : 'Awaiting run'}
                />
              </div>
              <div className="workflow-actions">
                <button className="reset-button primary-action" type="button" onClick={runMissionPlan}>
                  <Play size={16} />
                  {missionExecution ? 'Rerun mission plan' : 'Run mission plan'}
                </button>
                <span className={missionExecution?.freshnessStatus === 'met' ? 'report-status copied' : 'report-status'}>
                  {missionExecution
                    ? `${missionExecution.dataProductName} ${missionExecution.freshnessStatus}`
                    : 'No mission execution yet'}
                </span>
              </div>
              {missionExecution ? (
                <>
                  <div className="timeline-list">
                    {missionExecution.steps.map((step) => (
                      <article className="timeline-step" key={step.id}>
                        <span className="timeline-minute">T+{step.minute}m</span>
                        <div>
                          <strong>{step.label}</strong>
                          <span>{step.detail}</span>
                        </div>
                        <strong className={`event-status ${step.status}`}>{step.status}</strong>
                      </article>
                    ))}
                  </div>
                  <div className="manifest-list">
                    <div className="manifest-header">
                      <strong>Data product manifest</strong>
                      <span>
                        {missionExecution.manifest.filter((item) => item.validation === 'verified').length}/{missionExecution.manifest.length}{' '}
                        verified / {missionExecution.targetGb} GB / watermark {getManifestWatermarkStatus(missionExecution)}
                      </span>
                    </div>
                    {missionExecution.manifest.map((item) => (
                      <article className="manifest-row" key={item.id}>
                        <code>{item.id}</code>
                        <div>
                          <strong>{item.region}</strong>
                          <span>
                            {item.sizeGb} GB / T+{item.freshnessMinute}m / confidence {item.confidenceScore}%
                          </span>
                        </div>
                        <span className={`event-status ${item.validation === 'verified' ? 'complete' : 'blocked'}`}>
                          {item.validation}
                        </span>
                      </article>
                    ))}
                  </div>
                </>
              ) : (
                <div className="delta-banner">
                  Run the active policy to produce a seeded timeline, data product, freshness result, and report evidence.
                </div>
              )}
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
                  <article className="work-item" data-work-item={item.id} key={item.id}>
                    <div>
                      <strong>{item.label}</strong>
                      <span>{item.detail}</span>
                      {!item.complete && item.gate && item.actionDisabled && <span className="work-item-gate">{item.gate}</span>}
                    </div>
                    <div className="work-item-controls">
                      <strong className={item.complete ? 'event-status complete' : 'event-status ready'}>
                        {item.complete ? 'done' : 'open'}
                      </strong>
                      {!item.complete && item.action && item.actionLabel && (
                        <button
                          className="queue-action"
                          type="button"
                          onClick={() => {
                            if (item.action) {
                              runWorkQueueAction(item.action);
                            }
                          }}
                          disabled={item.actionDisabled}
                        >
                          {item.actionLabel}
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel">
              <div className="panel-title">
                <BrainCircuit size={18} />
                Gemini trace status
              </div>
              <div className="runtime-health-strip">
                <Metric label="Runtime health" value={formatRuntimeHealth(geminiHealthTrace)} />
                <Metric label="Trace cache" value={String(geminiHealthTrace.cacheEntries)} />
              </div>
              {geminiHealthTrace.error && (
                <p className="runtime-health-note">{geminiHealthTrace.error}</p>
              )}
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
          </>
        )}

        {activeView === 'scenario' && (
          <section className="panel full-panel">
            <div className="panel-title">
              <Radar size={18} />
              Seeded scenario library
            </div>
            <div className="scenario-toolbar">
              <button className="reset-button primary-action" type="button" onClick={generateStressDrill}>
                <Sparkles size={16} />
                Generate stress drill
              </button>
              <span className="report-status">Library {scenarioLibrary.length} scenarios</span>
            </div>
            <div className="scenario-table">
              {scenarioLibrary.map((scenario) => (
                <button
                  className={scenario.id === activeScenario.id ? 'scenario-row active' : 'scenario-row'}
                  key={scenario.id}
                  type="button"
                  onClick={() => {
                    setActiveScenarioId(scenario.id);
                    setActivePolicy(baselinePolicy);
                    setStagedImprovementKey(null);
                    setPromotedImprovementKey(null);
                    setMissionExecution(null);
                    critiqueRequestIdRef.current += 1;
                    setAppliedCommandIds([]);
                    setComputerAuditTrace({
                      status: 'idle',
                      model: 'gemini-3.5-flash',
                      executionMode: 'propose_only',
                      actions: [],
                    });
                    setReportStatus('idle');
                    setJudgeReport('');
                    setGeminiCritiqueTrace({ status: 'idle', model: 'gemini-3.5-flash' });
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
            <div className="data-banner">Seeded workload library: {scenarioLibrary.length} scenarios, {totalRawGb} GB raw orbital data, zero real satellite control.</div>
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
                <strong>{improvementStaged ? signedDelta(primaryResult.decision.delta) : '--'}</strong>
                <span>{improvementStaged ? primaryResult.decision.reasons[0] : 'Run improvement pass to compare a staged candidate.'}</span>
              </article>
              <article>
                <p className="eyebrow">Promotion gate</p>
                <strong>{improvementStaged ? (improvementCycle.promoted ? 'Accepted' : 'Held') : 'Not staged'}</strong>
                <span>{improvementStaged ? improvementCycle.reasons[improvementCycle.reasons.length - 1] : 'No candidate is eligible for promotion yet.'}</span>
              </article>
              <article>
                <p className="eyebrow">Golden sweep</p>
                <strong>{improvementStaged ? signedDelta(improvementCycle.averageDelta) : '--'}</strong>
                <span>{scenarioLibrary.length} seeded scenarios checked for regression.</span>
              </article>
            </div>
            <div className="score-grid">
              {scoreDimensionLabels.map((dimension) => (
                <Metric
                  key={dimension.key}
                  label={dimension.label}
                  value={
                    improvementStaged
                      ? `${baselineScore.dimensions[dimension.key]} -> ${candidateScore.dimensions[dimension.key]}`
                      : `${baselineScore.dimensions[dimension.key]} -> --`
                  }
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
                const scenario = scenarioLibrary.find((item) => item.id === result.scenarioId);

                return (
                  <article className="score-sweep-row" key={result.scenarioId}>
                    <div>
                      <strong>{scenario?.name ?? result.scenarioId}</strong>
                      <span>
                        {improvementStaged
                          ? result.candidateScore.failures.length > 0
                            ? result.candidateScore.failures.join(', ')
                            : 'No candidate failures below threshold.'
                          : 'Candidate not staged yet.'}
                      </span>
                    </div>
                    <Metric label="Baseline" value={String(result.baselineScore.total)} />
                    <Metric label="Candidate" value={improvementStaged ? String(result.candidateScore.total) : '--'} />
                    <Metric label="Delta" value={improvementStaged ? signedDelta(result.decision.delta) : '--'} />
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
                <strong>{improvementStaged ? candidatePolicy.name : 'Not staged'}</strong>
                <span>{improvementStaged ? candidatePolicy.summary : 'Run improvement pass to create the candidate patch.'}</span>
              </div>
            </div>
            <div className="delta-banner">
              {improvementStaged
                ? `${improvementCycle.promoted ? 'Promotion accepted' : 'Promotion held'}: ${improvementCycle.reasons[0]} Average sweep ${signedDelta(improvementCycle.averageDelta)}.`
                : 'Run improvement pass to create a scenario-scoped candidate patch.'}
            </div>
            <div className="delta-banner memory-banner">
              <strong>Learning memory write</strong>
              <span>
                {' '}
                {currentMemoryEntry
                  ? `Seeded memory retained ${currentMemoryEntry.failureSignature} -> ${currentMemoryEntry.candidatePolicyName}; active delta ${signedDelta(currentMemoryEntry.activeDelta)}, sweep ${signedDelta(currentMemoryEntry.averageDelta)}, guardrail ${currentMemoryEntry.guardrailStatus}.`
                  : `No retained memory has been written for ${activeScenario.id} yet.`}
              </span>
            </div>
            <div className="memory-ledger">
              <div className="manifest-header">
                <strong>Recent learning memory</strong>
                <span>{learningMemory.length}/8 retained</span>
              </div>
              {learningMemory.length > 0 ? (
                learningMemory.slice(0, 4).map((entry) => (
                  <article className="memory-row" key={entry.id}>
                    <div>
                      <strong>{entry.scenarioName}</strong>
                      <span>{entry.failureSignature}</span>
                    </div>
                    <span>
                      {signedDelta(entry.activeDelta)} active / {signedDelta(entry.averageDelta)} sweep
                    </span>
                    <strong className={`event-status ${entry.retained ? 'complete' : 'blocked'}`}>
                      {entry.retained ? 'retained' : 'held'}
                    </strong>
                  </article>
                ))
              ) : (
                <div className="delta-banner">
                  Run an improvement pass to write seeded learning memory into this browser.
                </div>
              )}
            </div>
            <div className="workflow-actions">
              <button
                className="reset-button primary-action"
                type="button"
                onClick={runImprovementPass}
              >
                <Sparkles size={16} />
                {improvementStaged ? 'Refresh improvement pass' : 'Run improvement pass'}
              </button>
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
                {candidateAlreadyActive
                  ? `${candidatePolicy.name} is active`
                  : improvementStaged
                    ? 'Candidate is staged for operator approval'
                    : 'No candidate staged'}
              </span>
            </div>
            {improvementStaged && (
              <div className="diff-list">
                {improvementCycle.mutation.diff.map((line) => (
                  <code key={line}>{line}</code>
                ))}
              </div>
            )}
            <div className="scenario-table compact-table">
              {improvementCycle.scenarioResults.map((result) => {
                const scenario = scenarioLibrary.find((item) => item.id === result.scenarioId);

                return (
                  <article className="score-sweep-row" key={result.scenarioId}>
                    <div>
                      <strong>{scenario?.name ?? result.scenarioId}</strong>
                      <span>{improvementStaged ? result.decision.reasons[0] : 'Waiting for explicit improvement run.'}</span>
                    </div>
                    <Metric label="Baseline" value={String(result.baselineScore.total)} />
                    <Metric label="Candidate" value={improvementStaged ? String(result.candidateScore.total) : '--'} />
                    <Metric label="Delta" value={improvementStaged ? `${result.decision.delta > 0 ? '+' : ''}${result.decision.delta}` : '--'} />
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

function getManifestWatermarkStatus(execution?: MissionExecution | null): 'attached' | 'pending' | 'mixed' | undefined {
  if (!execution) {
    return undefined;
  }

  const watermarkStates = new Set(execution.manifest.map((item) => item.watermark));

  return watermarkStates.size === 1 ? execution.manifest[0]?.watermark : 'mixed';
}

function loadLearningMemoryEntries(): LearningMemoryEntry[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(learningMemoryStorageKey);
    const parsed: unknown = stored ? JSON.parse(stored) : [];

    return Array.isArray(parsed) ? parsed.filter(isLearningMemoryEntry) : [];
  } catch {
    return [];
  }
}

function saveLearningMemoryEntries(entries: LearningMemoryEntry[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(learningMemoryStorageKey, JSON.stringify(entries));
}

function isLearningMemoryEntry(value: unknown): value is LearningMemoryEntry {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const entry = value as Partial<LearningMemoryEntry>;

  return (
    typeof entry.id === 'string' &&
    typeof entry.scenarioId === 'string' &&
    typeof entry.scenarioName === 'string' &&
    typeof entry.mutationId === 'string' &&
    typeof entry.candidatePolicyName === 'string' &&
    typeof entry.failureSignature === 'string' &&
    typeof entry.activeDelta === 'number' &&
    typeof entry.averageDelta === 'number' &&
    (entry.guardrailStatus === 'held' || entry.guardrailStatus === 'regressed') &&
    typeof entry.retained === 'boolean' &&
    typeof entry.createdAt === 'string'
  );
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

function formatRuntimeHealth(trace: GeminiHealthTrace): string {
  if (trace.status === 'loading') {
    return 'checking';
  }

  return trace.status;
}
