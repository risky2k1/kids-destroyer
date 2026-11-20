import { describe, expect, it } from 'vitest';
import type { ModuleManifest } from './nav';
import { activeKey, buildNav } from './nav';

const DummyIcon = () => null;

describe('nav', () => {
  it('buildNav orders sections by NAV_GROUPS order even when module declares system before content', () => {
    const moduleWithReversedGroups: ModuleManifest = {
      id: 'test-module',
      name: 'Test Module',
      nav: [
        {
          group: 'system',
          key: 'sys-item',
          label: 'Sys Item',
          href: '/admin/sys',
          icon: DummyIcon,
          iconClass: 'text-chart-1',
        },
        {
          group: 'content',
          key: 'content-item',
          label: 'Content Item',
          href: '/admin/content',
          icon: DummyIcon,
          iconClass: 'text-chart-2',
        },
      ],
    };

    const sections = buildNav([moduleWithReversedGroups]);
    expect(sections.map((s) => s.id)).toEqual(['content', 'system']);
    expect(sections[0].items[0].key).toBe('content-item');
    expect(sections[1].items[0].key).toBe('sys-item');
  });

  it('buildNav drops empty groups', () => {
    const moduleWithOnlyUsers: ModuleManifest = {
      id: 'test-users',
      name: 'Test Users',
      nav: [
        {
          group: 'users',
          key: 'user-item',
          label: 'User Item',
          href: '/admin/users',
          icon: DummyIcon,
          iconClass: 'text-chart-3',
        },
      ],
    };

    const sections = buildNav([moduleWithOnlyUsers]);
    expect(sections.map((s) => s.id)).toEqual(['users']);
  });

  it('activeKey handles exact match, prefix match at segment boundary, non-match for sibling prefix, and child link', () => {
    const testManifest: ModuleManifest = {
      id: 'test-manifest',
      name: 'Test Manifest',
      nav: [
        {
          group: 'content',
          key: 'parent-item',
          label: 'Parent Item',
          icon: DummyIcon,
          iconClass: 'text-chart-5',
          children: [
            {
              key: 'child-1',
              label: 'Child 1',
              href: '/a/b',
              icon: DummyIcon,
              iconClass: 'text-chart-5',
            },
          ],
        },
        {
          group: 'content',
          key: 'standalone-item',
          label: 'Standalone',
          href: '/other',
          icon: DummyIcon,
          iconClass: 'text-chart-1',
        },
      ],
    };

    const sections = buildNav([testManifest]);

    // Exact match on child link
    expect(activeKey('/a/b', sections)).toBe('child-1');

    // Prefix match at segment boundary (/a/b/x)
    expect(activeKey('/a/b/x', sections)).toBe('child-1');

    // Non-match when prefix is not a segment boundary (/a/bc)
    expect(activeKey('/a/bc', sections)).toBeNull();

    // Exact match on regular item
    expect(activeKey('/other', sections)).toBe('standalone-item');

    // Completely unknown path
    expect(activeKey('/unknown', sections)).toBeNull();
  });
});
