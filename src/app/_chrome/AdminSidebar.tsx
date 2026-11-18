'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  GraduationCap,
  House,
  Puzzle,
  Shapes,
  Tags,
  Users,
} from 'lucide-react';
import { signOut } from '@/app/(auth)/login/actions';
import { PATHS } from '@/core/routes';
import { Avatar, AvatarFallback } from '@/themes/neobrutal/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/themes/neobrutal/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
} from '@/themes/neobrutal/ui/sidebar';
import { activeNav, type NavKey } from './adminNav';

const hardShadow = 'shadow-[2px_2px_0_0_var(--color-border)]';

const itemClass =
  'h-7 border-0 font-base text-sm text-foreground outline-0 shadow-none hover:bg-foreground/5 hover:text-foreground hover:outline-transparent';

const activeItemClass = `${itemClass} border-2 border-border bg-main font-heading shadow-[2px_2px_0_0_var(--color-border)] hover:bg-main data-active:bg-main data-active:text-foreground data-active:outline-transparent`;

const CATALOG: { key: NavKey; href: string; label: string; icon: typeof BookOpen }[] = [
  { key: 'subjects', href: PATHS.admin.subjects, label: 'Môn học', icon: BookOpen },
  { key: 'grades', href: PATHS.admin.grades, label: 'Lớp', icon: GraduationCap },
  { key: 'topics', href: PATHS.admin.topics, label: 'Chủ đề', icon: Tags },
];

export function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const active = activeNav(pathname);
  const catalogActive = active === 'subjects' || active === 'grades' || active === 'topics';
  const [catalogOpen, setCatalogOpen] = useState(catalogActive);
  const [seenPath, setSeenPath] = useState(pathname);
  if (pathname !== seenPath) {
    setSeenPath(pathname);
    if (catalogActive) setCatalogOpen(true);
  }

  return (
    <Sidebar className="border-r-border/10! group-data-[side=left]:border-r! **:data-[slot=sidebar-inner]:bg-background">
      <SidebarHeader className="h-10 flex-row items-center gap-1 border-b! border-b-border/10! p-2">
        <span
          className={`flex size-5 shrink-0 items-center justify-center rounded-sm border-2 border-border bg-main text-xs font-bold ${hardShadow}`}
        >
          K
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-heading">Kids CMS</span>
        <ChevronDown className="size-3.5 shrink-0 text-foreground/60" />
        <SidebarTrigger className="size-7 border-0 bg-transparent text-foreground/60 shadow-none hover:bg-foreground/5 hover:text-foreground" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="px-2 pt-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={active === 'home'}
              tooltip="Trang chủ"
              className={active === 'home' ? activeItemClass : itemClass}
              render={<Link href={PATHS.admin.root} />}
            >
              <House className="text-foreground/60" />
              <span>Trang chủ</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarGroup className="border-b-0! py-1">
          <SidebarGroupLabel className="h-6 px-2 font-base! text-xs text-foreground/50">
            Nội dung
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Danh mục"
                  className={itemClass}
                  onClick={() => setCatalogOpen((open) => !open)}
                >
                  <Shapes className="text-chart-5" />
                  <span>Danh mục</span>
                  <ChevronRight
                    className={`ml-auto size-3.5 text-foreground/40 ${catalogOpen ? 'rotate-90' : ''}`}
                  />
                </SidebarMenuButton>
                {catalogOpen && (
                  <SidebarMenuSub>
                    {CATALOG.map((item) => {
                      const Icon = item.icon;
                      const on = active === item.key;
                      return (
                        <SidebarMenuSubItem key={item.key}>
                          <SidebarMenuSubButton
                            isActive={on}
                            className={on ? activeItemClass : itemClass}
                            render={<Link href={item.href} />}
                          >
                            <Icon className="text-chart-5" />
                            <span>{item.label}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={active === 'questions'}
                  tooltip="Câu hỏi"
                  className={active === 'questions' ? activeItemClass : itemClass}
                  render={<Link href={PATHS.admin.questions} />}
                >
                  <CircleHelp className="text-chart-2" />
                  <span>Câu hỏi</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={active === 'quizzes'}
                  tooltip="Đề"
                  className={active === 'quizzes' ? activeItemClass : itemClass}
                  render={<Link href={PATHS.admin.quizzes} />}
                >
                  <ClipboardList className="text-chart-3" />
                  <span>Đề</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="border-b-0! py-1">
          <SidebarGroupLabel className="h-6 px-2 font-base! text-xs text-foreground/50">
            Người dùng
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={active === 'families'}
                  tooltip="Gia đình"
                  className={active === 'families' ? activeItemClass : itemClass}
                  render={<Link href={PATHS.admin.families} />}
                >
                  <Users className="text-chart-4" />
                  <span>Gia đình</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Khu phụ huynh"
                  className={itemClass}
                  render={<Link href={PATHS.parent.root} />}
                >
                  <ArrowUpRight className="text-chart-3" />
                  <span>Khu phụ huynh</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="border-b-0! py-1">
          <SidebarGroupLabel className="h-6 px-2 font-base! text-xs text-foreground/50">
            Hệ thống
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={active === 'plugins'}
                  tooltip="Dạng câu"
                  className={active === 'plugins' ? activeItemClass : itemClass}
                  render={<Link href={PATHS.admin.plugins} />}
                >
                  <Puzzle className="text-chart-1" />
                  <span>Dạng câu</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t! border-t-border/10!">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left hover:bg-foreground/5">
            <Avatar size="sm">
              <AvatarFallback>{userName.slice(0, 1) || '?'}</AvatarFallback>
            </Avatar>
            <span className="min-w-0 truncate text-left text-sm">
              {userName}
              <span className="block text-xs font-base text-foreground/60">Quản trị</span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start">
            <form action={signOut}>
              <DropdownMenuItem render={<button type="submit" className="w-full text-left" />}>
                Đăng xuất
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
