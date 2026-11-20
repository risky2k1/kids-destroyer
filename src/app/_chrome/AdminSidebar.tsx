'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, House } from 'lucide-react';
import { signOut } from '@/app/(auth)/login/actions';
import { can, type Principal } from '@/core/acl/access';
import { isParent, visibleNav, type NavSection } from '@/core/modules';
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
import { activeNav, adminNav } from './adminNav';
import { BrandMark } from './BrandMark';

const itemClass =
  'h-7 border-0 font-base text-sm text-foreground outline-0 shadow-none hover:bg-foreground/5 hover:text-foreground hover:outline-transparent';

const activeItemClass = `${itemClass} border-2 border-border bg-main font-heading shadow-[2px_2px_0_0_var(--color-border)] hover:bg-main data-active:bg-main data-active:text-foreground data-active:outline-transparent`;

/** Key of the parent item that holds the active link, if any. */
function parentOf(key: string | null, nav: NavSection[]): string | null {
  for (const section of nav)
    for (const item of section.items)
      if (isParent(item) && item.children.some((child) => child.key === key)) return item.key;
  return null;
}

export function AdminSidebar({
  userName,
  siteName,
  logoUrl,
  principal,
  roleName,
  disabledIds = [],
}: {
  userName: string;
  siteName: string;
  logoUrl?: string | null;
  principal: Principal;
  roleName: string;
  disabledIds?: readonly string[];
}) {
  const nav = visibleNav(adminNav(disabledIds), (p) => can(principal, p));
  const pathname = usePathname();
  const active = activeNav(pathname);
  const activeParent = parentOf(active, nav);
  const [openParents, setOpenParents] = useState<Record<string, boolean>>(() =>
    activeParent ? { [activeParent]: true } : {},
  );
  const [seenPath, setSeenPath] = useState(pathname);
  if (pathname !== seenPath) {
    setSeenPath(pathname);
    if (activeParent && !openParents[activeParent])
      setOpenParents((prev) => ({ ...prev, [activeParent]: true }));
  }

  return (
    <Sidebar className="border-r-border/10! group-data-[side=left]:border-r! **:data-[slot=sidebar-inner]:bg-background">
      <SidebarHeader className="h-10 flex-row items-center gap-1 border-b! border-b-border/10! p-2">
        <BrandMark logoUrl={logoUrl} siteName={siteName} size={5} />
        <span className="min-w-0 flex-1 truncate text-sm font-heading">{siteName}</span>
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
        {nav.map((section) => (
          <SidebarGroup key={section.id} className="border-b-0! py-1">
            <SidebarGroupLabel className="h-6 px-2 font-base! text-xs text-foreground/50">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  if (isParent(item)) {
                    const isOpen = Boolean(openParents[item.key]);
                    return (
                      <SidebarMenuItem key={item.key}>
                        <SidebarMenuButton
                          tooltip={item.label}
                          className={itemClass}
                          onClick={() =>
                            setOpenParents((prev) => ({
                              ...prev,
                              [item.key]: !prev[item.key],
                            }))
                          }
                        >
                          <Icon className={item.iconClass} />
                          <span>{item.label}</span>
                          <ChevronRight
                            className={`ml-auto size-3.5 text-foreground/40 ${isOpen ? 'rotate-90' : ''}`}
                          />
                        </SidebarMenuButton>
                        {isOpen && (
                          <SidebarMenuSub>
                            {item.children.map((child) => {
                              const ChildIcon = child.icon;
                              const on = active === child.key;
                              return (
                                <SidebarMenuSubItem key={child.key}>
                                  <SidebarMenuSubButton
                                    isActive={on}
                                    className={on ? activeItemClass : itemClass}
                                    render={<Link href={child.href} />}
                                  >
                                    <ChildIcon className={child.iconClass} />
                                    <span>{child.label}</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        )}
                      </SidebarMenuItem>
                    );
                  }

                  const on = active === item.key;
                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton
                        isActive={on}
                        tooltip={item.label}
                        className={on ? activeItemClass : itemClass}
                        render={<Link href={item.href} />}
                      >
                        <Icon className={item.iconClass} />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t! border-t-border/10!">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left hover:bg-foreground/5">
            <Avatar size="sm">
              <AvatarFallback>{userName.slice(0, 1) || '?'}</AvatarFallback>
            </Avatar>
            <span className="min-w-0 truncate text-left text-sm">
              {userName}
              <span className="block text-xs font-base text-foreground/60">{roleName}</span>
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
