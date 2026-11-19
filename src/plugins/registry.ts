/* Heterogeneous lookup: each plugin file keeps a precise type. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { QuestionTypePlugin } from '@/core/plugins';
import { essayPlugin } from './question-essay';
import { fillPlugin } from './question-fill';
import { matchPlugin } from './question-match';
import { mcqPlugin } from './question-mcq';
import { numberPlugin } from './question-number';
import { orderPlugin } from './question-order';

export const PLUGINS: Record<string, QuestionTypePlugin<any, any, any>> = {
  mcq: mcqPlugin,
  fill: fillPlugin,
  number: numberPlugin,
  order: orderPlugin,
  match: matchPlugin,
  essay: essayPlugin,
};

export function getPlugin(id: string): QuestionTypePlugin<any, any, any> | undefined {
  return PLUGINS[id];
}

export const PLUGIN_IDS: string[] = Object.keys(PLUGINS);
