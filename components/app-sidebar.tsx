'use client'

import * as React from 'react'
import { useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FileText,
  FileBox,
  Building2,
  Settings,
  Sun,
  Moon,
  LogOut,
  ShieldCheck,
  User,
  KeyRound,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Route } from '@/lib/routes'
import { Logo } from '@/components/logo'
import { LogoExpanded } from '@/components/logo-expanded'
import { useAuth } from '@/lib/auth-context'
import { Badge } from '@/components/ui/badge'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'
import { CompanySelector } from '@/components/ui/CompanySelector'
import { ChangePasswordModal } from '@/components/auth/ChangePasswordModal'

const NAVIGATION_ITEMS = [
  { title: 'Org', icon: Building2, route: Route.ORG_HOME },
  { title: 'SOPs', icon: FileText, route: Route.SOP_HOME },
  { title: 'Logs', icon: FileBox, route: Route.LOG_HOME },
] as const

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { state } = useSidebar()
  const { theme, setTheme } = useTheme()
  const { user, logout, isAdmin } = useAuth()
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push(Route.LOGIN)
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {/* Collapsed: Show only logo (centered) + spacer for company selector */}
        <div
          className={`flex flex-col transition-opacity duration-150 ${state === 'collapsed' ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'}`}
        >
          <div className="flex items-center justify-center py-4">
            <Link
              href="/"
              className="text-sidebar-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <Logo className="h-[75px] w-[75px]" />
            </Link>
          </div>
          {/* Spacer to match company selector height */}
          <div className="px-4 pb-2">
            <div className="h-10" />
          </div>
        </div>

        {/* Expanded: Show full logo with text and company selector */}
        <div
          className={`transition-opacity duration-150 ${state === 'expanded' ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'}`}
        >
          <div className="px-4 py-4">
            <Link
              href="/"
              className="block text-sidebar-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <LogoExpanded className="h-[75px] w-full" />
            </Link>
          </div>

          {/* Company Selector */}
          <div className="px-4 pb-2">
            <CompanySelector
              className="w-full md:w-full"
              popoverClassName="md:w-full"
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {useMemo(
                () =>
                  NAVIGATION_ITEMS.map((item) => {
                    const isActive = pathname === item.route
                    return (
                      <SidebarMenuItem key={item.route}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => router.push(item.route)}
                          tooltip={item.title}
                          className="w-full"
                        >
                          <item.icon className="size-6" />
                          <span className="text-lg">{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  }),
                [pathname, router]
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          {/* Admin Link - only for admins */}
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => router.push(Route.ADMIN_USERS)}
                tooltip="User Management"
                isActive={pathname === Route.ADMIN_USERS}
              >
                <ShieldCheck className="size-6" />
                <span className="text-lg">Users</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => router.push(Route.SETTINGS)}
              tooltip="Settings"
            >
              <Settings className="size-6" />
              <span className="text-lg">Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              tooltip="Toggle Theme"
            >
              <div className="relative size-6">
                <Sun className="absolute size-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute size-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </div>
              <span className="text-lg">Theme</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* User Profile Section */}
        <SidebarSeparator />
        <div className="px-2 py-2">
          {/* Collapsed: Show user icon only */}
          <div
            className={`flex flex-col items-center transition-opacity duration-150 ${state === 'collapsed' ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'}`}
          >
            <button
              onClick={handleLogout}
              className="flex items-center justify-center size-10 rounded-md hover:bg-sidebar-accent text-sidebar-foreground"
              title={`Logout (${user?.email})`}
            >
              <User className="size-5" />
            </button>
          </div>

          {/* Expanded: Show full user info */}
          <div
            className={`transition-opacity duration-150 ${state === 'expanded' ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'}`}
          >
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="flex items-center justify-center size-9 rounded-full bg-sidebar-accent text-sidebar-foreground shrink-0">
                <User className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user?.email}
                </p>
              </div>
              <Badge
                variant={isAdmin ? 'default' : 'secondary'}
                className="shrink-0 text-xs"
              >
                {user?.role || 'VIEWER'}
              </Badge>
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <SidebarMenuButton
                onClick={() => setIsChangePasswordOpen(true)}
                tooltip="Change Password"
                className="w-full"
              >
                <KeyRound className="size-5" />
                <span className="text-sm">Change Password</span>
              </SidebarMenuButton>
              <SidebarMenuButton
                onClick={handleLogout}
                tooltip="Logout"
                className="w-full"
              >
                <LogOut className="size-5" />
                <span className="text-sm">Logout</span>
              </SidebarMenuButton>
            </div>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
      <ChangePasswordModal
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      />
    </Sidebar>
  )
}
