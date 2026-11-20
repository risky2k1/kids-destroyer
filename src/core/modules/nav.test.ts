import { describe, expect, it } from 'vitest';
import type { ModuleManifest, NavSection } from './nav';
import { activeKey, buildNav, visibleNav } from './nav';

const DummyIcon = () => null;

describe('nav', () => {
  it('buildNav orders sections by NAV_GROUPS order even when module declares system before content', () => {
    const moduleWithReversedGroups: ModuleManifest = {
      id: 'test-module',
      name: 'Test Module',
      description: 'Test description',
      version: '1.0.0',
      permissions: [],
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
      description: 'Test description',
      version: '1.0.0',
      permissions: [],
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
      description: 'Test description',
      version: '1.0.0',
      permissions: [],
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

  describe('visibleNav', () => {
    const testSections: NavSection[] = [
      {
        id: 'content',
        label: 'Nội dung',
        items: [
          {
            key: 'catalog',
            label: 'Danh mục',
            icon: DummyIcon,
            iconClass: 'text-chart-5',
            children: [
              {
                key: 'subjects',
                label: 'Môn',
                href: '/admin/subjects',
                icon: DummyIcon,
                iconClass: 'text-chart-5',
                permission: 'catalog.manage',
              },
              {
                key: 'grades',
                label: 'Lớp',
                href: '/admin/grades',
                icon: DummyIcon,
                iconClass: 'text-chart-5',
                permission: 'catalog.manage',
              },
            ],
          },
          {
            key: 'questions',
            label: 'Câu hỏi',
            href: '/admin/questions',
            icon: DummyIcon,
            iconClass: 'text-chart-2',
            permission: 'questions.manage',
          },
        ],
      },
      {
        id: 'users',
        label: 'Người dùng',
        items: [
          {
            key: 'families',
            label: 'Gia đình',
            href: '/admin/families',
            icon: DummyIcon,
            iconClass: 'text-chart-4',
            permission: 'families.manage',
          },
          {
            key: 'parent-area',
            label: 'Khu phụ huynh',
            href: '/parent',
            icon: DummyIcon,
            iconClass: 'text-chart-3',
          },
        ],
      },
      {
        id: 'system',
        label: 'Hệ thống',
        items: [
          {
            key: 'settings',
            label: 'Cài đặt',
            href: '/admin/settings',
            icon: DummyIcon,
            iconClass: 'text-chart-4',
            permission: 'settings.manage',
          },
        ],
      },
    ];

    it('filters out links whose permission is disallowed', () => {
      const allowed = (p: string) => p === 'questions.manage';
      const visible = visibleNav(testSections, allowed);

      // questions is allowed; catalog children are not allowed, so parent is dropped;
      // in users, parent-area has no permission so it is kept;
      // in system, settings is disallowed so system group is dropped.
      expect(visible.map((s) => s.id)).toEqual(['content', 'users']);
      expect(visible[0].items.map((i) => i.key)).toEqual(['questions']);
      expect(visible[1].items.map((i) => i.key)).toEqual(['parent-area']);
    });

    it('drops parent item when all children are filtered out', () => {
      const allowed = (p: string) => p !== 'catalog.manage';
      const visible = visibleNav(testSections, allowed);
      const contentSection = visible.find((s) => s.id === 'content');
      expect(contentSection?.items.some((i) => i.key === 'catalog')).toBe(false);
    });

    it('drops empty groups when all items are filtered out', () => {
      const allowed = (p: string) => p !== 'settings.manage';
      const visible = visibleNav(testSections, allowed);
      expect(visible.some((s) => s.id === 'system')).toBe(false);
    });

    it('keeps items without permission unconditionally', () => {
      const allowed = () => false;
      const visible = visibleNav(testSections, allowed);
      expect(visible).toHaveLength(1);
      expect(visible[0].id).toBe('users');
      expect(visible[0].items).toHaveLength(1);
      expect(visible[0].items[0].key).toBe('parent-area');
    });

    it('keeps all items when all permissions are allowed', () => {
      const allowed = () => true;
      const visible = visibleNav(testSections, allowed);
      expect(visible).toHaveLength(3);
      expect(visible[0].items).toHaveLength(2);
      expect(visible[1].items).toHaveLength(2);
      expect(visible[2].items).toHaveLength(1);
    });
  });
});
