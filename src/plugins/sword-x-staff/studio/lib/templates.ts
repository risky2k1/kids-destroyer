import { blankDoc, starterDoc, type CharacterDoc } from './doc';

export function starterPayload(): CharacterDoc {
  return starterDoc();
}

export function blankPayload(): CharacterDoc {
  return blankDoc();
}

export { starterDoc, blankDoc };
