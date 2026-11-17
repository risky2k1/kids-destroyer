import { beforeAll, describe, expect, it } from 'vitest';
import { seedTwoFamilies } from './db';

let s: Awaited<ReturnType<typeof seedTwoFamilies>>;
beforeAll(async () => {
  s = await seedTwoFamilies();
});

// Same query getCurrentKid/enterKidMode run with the parent's session.
const readKid = (client: typeof s.parentA.client, kidId: string) =>
  client.from('kids').select('id, family_id').eq('id', kidId).maybeSingle();

describe('kid mode across families', () => {
  it("a kid cookie from family A is not recognised under family B's parent session", async () => {
    const { data } = await readKid(s.parentB.client, s.kidA);
    expect(data).toBeNull();
  });

  it('parent cannot bump PIN counters of another family kid', async () => {
    const { data } = await s.parentB.client
      .from('kids')
      .update({ pin_failed_count: 0, pin_locked_until: null })
      .eq('id', s.kidA)
      .select('id');
    expect(data ?? []).toEqual([]);
  });

  it('own family kid is readable', async () => {
    const { data } = await readKid(s.parentA.client, s.kidA);
    expect(data?.family_id).toBe(s.famA);
  });
});
