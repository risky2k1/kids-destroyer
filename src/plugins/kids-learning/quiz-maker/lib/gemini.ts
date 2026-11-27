import 'server-only';

type Success = { ok: true; json: unknown; model: string };
type Failure = { ok: false; reason: 'busy' | 'config' };

function modelsFrom(opts?: { models?: string[] }) {
  const raw = opts?.models ?? (process.env.GEMINI_MODELS ?? '').split(',');
  return raw.map((model) => model.trim()).filter(Boolean);
}

export async function generateJson(
  prompt: string,
  responseSchema: object,
  opts?: { models?: string[]; fetchImpl?: typeof fetch; timeoutMs?: number },
): Promise<Success | Failure> {
  const models = modelsFrom(opts);
  const fetchImpl = opts?.fetchImpl ?? fetch;
  const timeoutMs = opts?.timeoutMs ?? 30_000;
  if (models.length === 0) return { ok: false, reason: 'config' };

  for (const model of models) {
    try {
      const res = await fetchImpl(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': process.env.GEMINI_API_KEY ?? '',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', responseSchema },
          }),
          signal: AbortSignal.timeout(timeoutMs),
        },
      );
      if (res.status === 400 || res.status === 401 || res.status === 403) {
        console.warn(model, res.status);
        return { ok: false, reason: 'config' };
      }
      if (!res.ok) {
        console.warn(model, res.status);
        continue;
      }
      const body = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = (body.candidates?.[0]?.content?.parts ?? [])
        .map((part) => part.text ?? '')
        .join('');
      if (!text) {
        console.warn(model, 'empty');
        continue;
      }
      try {
        return { ok: true, json: JSON.parse(text), model };
      } catch {
        console.warn(model, 'unparsable');
      }
    } catch {
      console.warn(model, 'timeout');
    }
  }
  return { ok: false, reason: 'busy' };
}
