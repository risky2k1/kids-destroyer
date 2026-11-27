import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { generateJson } from './gemini';

function jsonResponse(text: string, status = 200) {
  return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }), {
    status,
  });
}

describe('generateJson', () => {
  it('uses the next model when the first is unavailable', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response('no', { status: 503 }))
      .mockResolvedValueOnce(jsonResponse('{"ok":true}'));
    const result = await generateJson(
      'prompt',
      { type: 'OBJECT' },
      {
        models: ['first', 'second'],
        fetchImpl,
      },
    );
    expect(result).toEqual({ ok: true, json: { ok: true }, model: 'second' });
  });

  it('is busy when every model is rate limited', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('no', { status: 429 }));
    const result = await generateJson(
      'prompt',
      { type: 'OBJECT' },
      {
        models: ['a', 'b'],
        fetchImpl,
      },
    );
    expect(result).toEqual({ ok: false, reason: 'busy' });
  });

  it('stops on a config error and does not call the next model', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('no', { status: 401 }));
    const result = await generateJson(
      'prompt',
      { type: 'OBJECT' },
      {
        models: ['a', 'b'],
        fetchImpl,
      },
    );
    expect(result).toEqual({ ok: false, reason: 'config' });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('tries the next model when the text is not json', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse('not-json'))
      .mockResolvedValueOnce(jsonResponse('{"ok":1}'));
    const result = await generateJson(
      'prompt',
      { type: 'OBJECT' },
      {
        models: ['a', 'b'],
        fetchImpl,
      },
    );
    expect(result).toMatchObject({ ok: true, model: 'b' });
  });

  it('treats a timeout as a model failure', async () => {
    const fetchImpl = vi.fn((_url: string, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () =>
          reject(new DOMException('aborted', 'AbortError')),
        );
      });
    });
    const result = await generateJson(
      'prompt',
      { type: 'OBJECT' },
      {
        models: ['slow'],
        fetchImpl: fetchImpl as typeof fetch,
        timeoutMs: 10,
      },
    );
    expect(result).toEqual({ ok: false, reason: 'busy' });
  });
});
