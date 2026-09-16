// src/data/types.ts
// Scenario data model — all types for the DAG-based scenario system.
// Safety-critical content (isCorrect, scoreImpact, insight) must always be
// static, sourced from NDMA/SACHET/112 ERSS (primary) or FEMA/Red Cross (supplementary).

export type DisasterType = 'earthquake' | 'fire' | 'flood';

export type NodeType = 'intro' | 'decision' | 'consequence' | 'outcome' | 'report';

export interface BaseNode {
  id: string;
  type: NodeType;
}

export interface IntroNode extends BaseNode {
  type: 'intro';
  narrativeText: string;
  atmosphere?: string;
  nextNodeId: string;
}

export interface Choice {
  id: string;
  /** First-person, action-oriented label shown to the player */
  label: string;
  isCorrect: boolean;
  /** Positive or negative point impact */
  scoreImpact: number;
  consequenceText: string;
  /** Sourced preparedness fact — NDMA/SACHET/112 ERSS primary; FEMA/Red Cross supplementary */
  insight: string;
  insightSource: string;
  nextNodeId: string;
}

export interface DecisionNode extends BaseNode {
  type: 'decision';
  situationText: string;
  contextHint?: string;
  choices: Choice[];
  /** Seconds. Undefined = untimed. */
  timeLimit?: number;
  /** Choice auto-selected if timer expires */
  defaultChoiceId?: string;
}

export interface ConsequenceNode extends BaseNode {
  type: 'consequence';
  narrativeText: string;
  nextNodeId: string;
}

export interface OutcomeNode extends BaseNode {
  type: 'outcome';
  survived: boolean;
  narrativeText: string;
  nextNodeId: string;
}

export interface ReportNode extends BaseNode {
  type: 'report';
  // Report data is assembled dynamically from GameState.decisions
}

export type ScenarioNode =
  | IntroNode
  | DecisionNode
  | ConsequenceNode
  | OutcomeNode
  | ReportNode;

export interface Scenario {
  id: DisasterType;
  title: string;
  subtitle: string;
  theme: DisasterType;
  startNodeId: string;
  nodes: Record<string, ScenarioNode>;
}
