import type { Studio } from '../types';
import type { SkillPatch } from './patch';

export function patchAddCompanion(studio: Studio, companionId: string): Studio {
  return {
    ...studio,
    companions: studio.companions.map((row) =>
      row.companion_id === companionId
        ? { ...row, opened: true, character_id: studio.character.id }
        : row,
    ),
  };
}

export function patchCompanion(studio: Studio, companionId: string, level: number): Studio {
  return {
    ...studio,
    companions: studio.companions.map((row) =>
      row.companion_id === companionId ? { ...row, level } : row,
    ),
  };
}

export function patchFantomon(studio: Studio, fantomonId: string, patch: SkillPatch): Studio {
  return {
    ...studio,
    fantomons: studio.fantomons.map((pet) => {
      if (pet.id === fantomonId) {
        return {
          ...pet,
          owned: patch.owned ?? pet.owned,
          quality: patch.quality ?? pet.quality,
          stars: patch.stars ?? pet.stars,
          equippedSlot: patch.equippedSlot ?? pet.equippedSlot,
        };
      }
      if (patch.equippedSlot && patch.equippedSlot > 0 && pet.equippedSlot === patch.equippedSlot) {
        return { ...pet, equippedSlot: 0 };
      }
      return pet;
    }),
  };
}
