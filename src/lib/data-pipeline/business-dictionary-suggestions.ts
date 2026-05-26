import { getBusinessDictionary, normalizeBusinessLabel } from "@/lib/local/business-dictionary-store";
import type { BusinessDictionarySuggestion } from "@/types/business-dictionary";
import type { BusinessDictionaryField } from "@/types/business-dictionary";

function tokenize(value: string) {
  return normalizeBusinessLabel(value)
    .split(" ")
    .filter((token) => token.length > 1);
}

function similarity(firstValue: string, secondValue: string) {
  const firstTokens = new Set(tokenize(firstValue));
  const secondTokens = new Set(tokenize(secondValue));

  if (firstTokens.size === 0 || secondTokens.size === 0) return 0;

  const intersection = [...firstTokens].filter((token) => secondTokens.has(token)).length;
  const union = new Set([...firstTokens, ...secondTokens]).size;

  return Math.round((intersection / union) * 100);
}

export function suggestBusinessDictionaryField(
  organizationId: string,
  sourceColumn: string
): BusinessDictionarySuggestion {
  const fields = getBusinessDictionary(organizationId);
  return suggestBusinessDictionaryFieldFromFields(fields, sourceColumn);
}

export function suggestBusinessDictionaryFieldFromFields(
  fields: BusinessDictionaryField[],
  sourceColumn: string
): BusinessDictionarySuggestion {
  let bestSuggestion: BusinessDictionarySuggestion = {
    matched: false,
    confidence: 0,
    sourceColumn,
    reason: "Aucun champ métier connu proche de cette colonne."
  };

  for (const field of fields) {
    const sourceColumnScores = field.sourceColumns.map((knownColumn) => similarity(sourceColumn, knownColumn));
    const labelScore = similarity(sourceColumn, field.label);
    const confidence = Math.max(labelScore, ...sourceColumnScores);

    if (confidence > bestSuggestion.confidence) {
      bestSuggestion = {
        matched: confidence >= 45,
        confidence,
        suggestedField: field,
        sourceColumn,
        reason:
          confidence >= 75
            ? `Colonne très proche du champ connu "${field.label}".`
            : `Colonne partiellement proche du vocabulaire "${field.label}".`
      };
    }
  }

  return bestSuggestion;
}
