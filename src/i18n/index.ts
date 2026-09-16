// src/i18n/index.ts
// Central export for i18n localization and scenario localized wrapping.

import type { Language, LocalizedScenarioData } from './types';
import type { Scenario, ScenarioNode, DecisionNode } from '../data/types';
import { getUiStrings, UI_EN, UI_HINGLISH } from './ui';
import { earthquakeHinglish } from './earthquake';
import { earthquakeWorkplaceHinglish } from './earthquakeWorkplace';
import { historicalBhujHinglish } from './historicalBhuj';
import { fireHinglish, FIRE_HINGLISH_TAKEAWAYS } from './fire';
import { fireCommercialHinglish } from './fireCommercial';
import { floodHinglish, FLOOD_HINGLISH_TAKEAWAYS } from './flood';
import { floodStreetHinglish } from './floodStreet';

export type { Language, UiStrings } from './types';
export { getUiStrings, UI_EN, UI_HINGLISH, FIRE_HINGLISH_TAKEAWAYS, FLOOD_HINGLISH_TAKEAWAYS };

const HINGLISH_SCENARIOS: Record<string, LocalizedScenarioData> = {
  earthquake: earthquakeHinglish,
  'earthquake-urban': earthquakeHinglish,
  'earthquake-workplace': earthquakeWorkplaceHinglish,
  'earthquake-bhuj-2001': historicalBhujHinglish,
  fire: fireHinglish,
  'fire-residential': fireHinglish,
  'fire-commercial': fireCommercialHinglish,
  flood: floodHinglish,
  'flood-urban': floodHinglish,
  'flood-street': floodStreetHinglish,
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
    historicalMeta: localization.historicalMeta
      ? {
          eventTitle: localization.historicalMeta.eventTitle || scenario.historicalMeta?.eventTitle || '',
          location: localization.historicalMeta.location || scenario.historicalMeta?.location || '',
          date: localization.historicalMeta.date || scenario.historicalMeta?.date || '',
          historicalContext: localization.historicalMeta.historicalContext || scenario.historicalMeta?.historicalContext || '',
          disclaimer: localization.historicalMeta.disclaimer || scenario.historicalMeta?.disclaimer || '',
        }
      : scenario.historicalMeta,
    nodes: localizedNodes,
  };
}