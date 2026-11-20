import {
  ArrowUpRight,
  BookOpen,
  CircleHelp,
  ClipboardList,
  GraduationCap,
  Puzzle,
  Send,
  Shapes,
  Tags,
  Users,
} from 'lucide-react';
import type { ModuleManifest } from '@/core/modules';
import { PATHS } from '@/core/routes';

export const kidsLearningManifest: ModuleManifest = {
  id: 'kids-learning',
  name: 'Học tập cho trẻ',
  nav: [
    {
      group: 'content',
      key: 'catalog',
      label: 'Danh mục',
      icon: Shapes,
      iconClass: 'text-chart-5',
      children: [
        {
          key: 'subjects',
          href: PATHS.admin.subjects,
          label: 'Môn học',
          icon: BookOpen,
          iconClass: 'text-chart-5',
        },
        {
          key: 'grades',
          href: PATHS.admin.grades,
          label: 'Lớp',
          icon: GraduationCap,
          iconClass: 'text-chart-5',
        },
        {
          key: 'topics',
          href: PATHS.admin.topics,
          label: 'Chủ đề',
          icon: Tags,
          iconClass: 'text-chart-5',
        },
      ],
    },
    {
      group: 'content',
      key: 'questions',
      href: PATHS.admin.questions,
      label: 'Câu hỏi',
      icon: CircleHelp,
      iconClass: 'text-chart-2',
    },
    {
      group: 'content',
      key: 'quizzes',
      href: PATHS.admin.quizzes,
      label: 'Đề',
      icon: ClipboardList,
      iconClass: 'text-chart-3',
    },
    {
      group: 'users',
      key: 'families',
      href: PATHS.admin.families,
      label: 'Gia đình',
      icon: Users,
      iconClass: 'text-chart-4',
    },
    {
      group: 'users',
      key: 'assignments',
      href: PATHS.admin.assignments,
      label: 'Giao bài',
      icon: Send,
      iconClass: 'text-chart-3',
    },
    {
      group: 'users',
      key: 'parent-area',
      href: PATHS.parent.root,
      label: 'Khu phụ huynh',
      icon: ArrowUpRight,
      iconClass: 'text-chart-3',
    },
    {
      group: 'system',
      key: 'plugins',
      href: PATHS.admin.plugins,
      label: 'Dạng câu',
      icon: Puzzle,
      iconClass: 'text-chart-1',
    },
  ],
};
