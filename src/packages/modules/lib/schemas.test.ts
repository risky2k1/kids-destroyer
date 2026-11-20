import { describe, expect, it } from 'vitest';
import { moduleToggleInput } from './schemas';

describe('moduleToggleInput', () => {
  it('accepts valid id and enabled=true', () => {
    const res = moduleToggleInput.safeParse({ id: 'kids-learning', enabled: 'true' });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data).toEqual({ id: 'kids-learning', enabled: true });
    }
  });

  it('accepts valid id and enabled=false', () => {
    const res = moduleToggleInput.safeParse({ id: 'sword-x-staff', enabled: 'false' });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data).toEqual({ id: 'sword-x-staff', enabled: false });
    }
  });

  it('rejects invalid ids', () => {
    expect(moduleToggleInput.safeParse({ id: '', enabled: 'true' }).success).toBe(false);
    expect(moduleToggleInput.safeParse({ id: 'a', enabled: 'true' }).success).toBe(false);
    expect(moduleToggleInput.safeParse({ id: '1plugin', enabled: 'true' }).success).toBe(false);
    expect(moduleToggleInput.safeParse({ id: 'Plugin', enabled: 'true' }).success).toBe(false);
    expect(moduleToggleInput.safeParse({ id: 'plugin_name', enabled: 'true' }).success).toBe(false);
    expect(moduleToggleInput.safeParse({ id: 'a'.repeat(42), enabled: 'true' }).success).toBe(
      false,
    );
  });

  it('rejects invalid enabled values', () => {
    expect(moduleToggleInput.safeParse({ id: 'test-plugin', enabled: '1' }).success).toBe(false);
    expect(moduleToggleInput.safeParse({ id: 'test-plugin', enabled: '0' }).success).toBe(false);
    expect(moduleToggleInput.safeParse({ id: 'test-plugin', enabled: 'yes' }).success).toBe(false);
    expect(moduleToggleInput.safeParse({ id: 'test-plugin', enabled: true }).success).toBe(false);
  });
});
