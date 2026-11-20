/* Heterogeneous lookup: each plugin file keeps a precise type. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { QuestionTypePlugin } from './types';
import { essayPlugin } from './essay';
import { fillPlugin } from './fill';
import { matchPlugin } from './match';
import { mcqPlugin } from './mcq';
import { numberPlugin } from './number';
import { orderPlugin } from './order';
import { voicePlugin } from './voice';

export const PLUGINS: Record<string, QuestionTypePlugin<any, any, any>> = {
  mcq: mcqPlugin,
  fill: fillPlugin,
  number: numberPlugin,
  order: orderPlugin,
  match: matchPlugin,
  essay: essayPlugin,
  voice: voicePlugin,
};

export function getPlugin(id: string): QuestionTypePlugin<any, any, any> | undefined {
  return PLUGINS[id];
}

export const PLUGIN_IDS: string[] = Object.keys(PLUGINS);
