import { execSync } from 'node:child_process';
import type { TestProject } from 'vitest/node';

// Reads URL/keys of the LOCAL supabase stack (`pnpm exec supabase start`) — never the remote project.
export default function setup(project: TestProject) {
  const out = execSync('pnpm exec supabase status -o env', { encoding: 'utf8' });
  const env = Object.fromEntries(
    out
      .split('\n')
      .map((l) => l.match(/^([A-Z_]+)="?(.*?)"?$/))
      .filter((m): m is RegExpMatchArray => !!m)
      .map((m) => [m[1], m[2]]),
  );
  if (!env.API_URL?.startsWith('http://127.0.0.1')) throw new Error('Local supabase not running');
  project.provide('sb', {
    url: env.API_URL,
    anonKey: env.ANON_KEY,
    serviceKey: env.SERVICE_ROLE_KEY,
  });
}

declare module 'vitest' {
  export interface ProvidedContext {
    sb: { url: string; anonKey: string; serviceKey: string };
  }
}
