// src/i18n/index.ts
// Central export for i18n localization and scenario localized wrapping.

import type { Language, LocalizedScenarioData } from './types';
import type { Scenario, ScenarioNode, DecisionNode } from '../data/types';
import { getUiStrings, UI_EN, UI_HINGLISH } from './ui';
import { earthquakeHinglish } from './earthquake';
import { fireHinglish } from './fire';
import { floodHinglish } from './flood';

export type { Language, UiStrings } from './types';
export { getUiStrings, UI_EN, UI_HINGLISH };

const HINGLISH_SCENARIOS: Record<string, LocalizedScenarioData> = {
  earthquake: earthquakeHinglish,
  fire: fireHinglish,
  flood: floodHinglish,
};

/**
 * Returns a localized Scenario object.
 * If language is 'en', returns original.
 * If language is 'hinglish', replaces text fields with Hinglish translations.
 */
export function getLocalizedScenario(scenario: Scenario, lang: Language): Scenario {
  if (lang !== 'hinglish') {
    return scenario;
  }

  const localization = HINGLISH_SCENARIOS[scenario.id];
  if (!localization) {
    return scenario;
  }

  const localizedNodes: Record<string, ScenarioNode> = {};

  for (const [nodeId, originalNode] of Object.entries(scenario.nodes)) {
    const locNode = localization.nodes[nodeId];

    if (!locNode) {
      localizedNodes[nodeId] = originalNode;
      continue;
    }

    if (originalNode.type === 'decision') {
      const origDecision = originalNode as DecisionNode;
      const updatedChoices = origDecision.choices.map((choice) => {
        const locChoice = locNode.choices?.[choice.id];
        if (!locChoice) return choice;

        return {
          ...choice,
          label: locChoice.label || choice.label,
          consequenceText: locChoice.consequenceText || choice.consequenceText,
          insight: locChoice.insight || choice.insight,
          insightSource: locChoice.insightSource || choice.insightSource,
        };
      });

      localizedNodes[nodeId] = {
        ...origDecision,
        situationText: locNode.situationText || origDecision.situationText,
        contextHint: locNode.contextHint || origDecision.contextHint,
        choices: updatedChoices,
      };
    } else if (originalNode.type === 'outcome') {
      localizedNodes[nodeId] = {
        ...originalNode,
        narrativeText: locNode.narrativeText || originalNode.narrativeText,
      };
    } else {
      localizedNodes[nodeId] = originalNode;
    }
  }

  return {
    ...scenario,
    title: localization.title || scenario.title,
    subtitle: localization.subtitle || scenario.subtitle,
    nodes: localizedNodes,
  };
}