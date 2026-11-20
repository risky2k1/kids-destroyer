import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const mockNotFound = vi.fn();
vi.mock('next/navigation', () => ({
  notFound: () => mockNotFound(),
}));

const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock('@/core/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: mockFrom,
  })),
}));

describe('core/modules/server', () => {
  it('disabledModules returns disabled module ids', async () => {
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockResolvedValue({
      data: [{ id: 'sword-x-staff' }, { id: 'kids-learning' }],
      error: null,
    });

    const { disabledModules } = await import('./server');
    const result = await disabledModules();
    expect(result).toEqual(['sword-x-staff', 'kids-learning']);
    expect(mockFrom).toHaveBeenCalledWith('modules');
    expect(mockSelect).toHaveBeenCalledWith('id');
    expect(mockEq).toHaveBeenCalledWith('enabled', false);
  });

  it('requireModule calls notFound when module is disabled', async () => {
    mockNotFound.mockClear();
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockResolvedValue({
      data: [{ id: 'disabled-plugin' }],
      error: null,
    });

    // Reset module cache to re-run cached disabledModules
    const { requireModule } = await import('./server');
    await requireModule('disabled-plugin');
    expect(mockNotFound).toHaveBeenCalledTimes(1);

    mockNotFound.mockClear();
    await requireModule('enabled-plugin');
    expect(mockNotFound).not.toHaveBeenCalled();
  });
});
