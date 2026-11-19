import { describe, expect, it } from 'vitest';
import {
  canReveal,
  itemScore,
  nextStep,
  retryQuestionIds,
  statusAfterRound1,
  totalOutOf10,
} from './scoring';

const a = { questionId: 'a', points: 1, needsManual: false, r1: 0, r2: 1 };
const b = { questionId: 'b', points: 2, needsManual: false, r1: 1 };
const c = { questionId: 'c', points: 1, needsManual: true, manual: null };

describe('scoring', () => {
  it('takes the best auto score and full points after a correct retry', () => {
    expect(itemScore(a)).toBe(1);
    expect(itemScore(b)).toBe(1);
    expect(itemScore({ ...a, r2: undefined })).toBe(0);
    expect(itemScore(c)).toBe(0);
    expect(itemScore({ ...c, manual: 0.5 })).toBe(0.5);
  });

  it('scales the total to 10 with one decimal', () => {
    expect(totalOutOf10([a, b])).toBe(10);
    expect(totalOutOf10([{ ...a, r2: undefined }, b])).toBe(6.7);
    expect(totalOutOf10([])).toBe(0);
  });

  it('retries only auto-graded questions that were wrong on round 1', () => {
    expect(retryQuestionIds([{ ...a, r2: undefined }, b, c])).toEqual(['a']);
    expect(retryQuestionIds([b, c])).toEqual([]);
  });

  it('keeps the assignment submitted when any item needs a manual score', () => {
    expect(statusAfterRound1([a, b])).toBe('reviewed');
    expect(statusAfterRound1([a, c])).toBe('submitted');
  });

  it('reveals answers only after the quiz is finished', () => {
    expect(canReveal({ round1Submitted: true, round2Submitted: false, retryCount: 1 })).toBe(false);
    expect(canReveal({ round1Submitted: true, round2Submitted: false, retryCount: 0 })).toBe(true);
    expect(canReveal({ round1Submitted: true, round2Submitted: true, retryCount: 1 })).toBe(true);
    expect(canReveal({ round1Submitted: false, round2Submitted: false, retryCount: 0 })).toBe(
      false,
    );
  });

  it('picks the next kid step', () => {
    expect(nextStep({ round1Submitted: false, round2Submitted: false, retryCount: 0 })).toBe(
      'play1',
    );
    expect(nextStep({ round1Submitted: true, round2Submitted: false, retryCount: 2 })).toBe(
      'play2',
    );
    expect(nextStep({ round1Submitted: true, round2Submitted: false, retryCount: 0 })).toBe('done');
    expect(nextStep({ round1Submitted: true, round2Submitted: true, retryCount: 2 })).toBe('done');
  });
});
