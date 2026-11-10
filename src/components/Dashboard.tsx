
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import {
  LayoutDashboard, ClipboardList, Package,
  Laptop, Wrench, ChartNoAxesCombined,
  LogOut, Menu, X, PanelLeftClose,
  PanelLeftOpen, CircleUserRound, ArrowUpRight,
  ShieldCheck, Database, Cpu,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { supabase } from '../lib/supabase'
import Inventory from './Inventory'

type Page =
  | 'dashboard'
  | 'visitas'
  | 'inventario'
  | 'asignaciones'
  | 'mantenimientos'
  | 'reportes'

type NavItem = {
  id: Page
  label: string
  description: string
  icon: LucideIcon
  color: string
  bg: string
}

const nav: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard',
    description: 'Resumen general', icon: LayoutDashboard,
    color: 'text-nucleo-pink', bg: 'bg-nucleo-pink-bg' },
  { id: 'visitas', label: 'Visitas técnicas',
    description: 'Servicios y visitas', icon: ClipboardList,
    color: 'text-nucleo-blue', bg: 'bg-nucleo-blue-bg' },
  { id: 'inventario', label: 'Inventario',
    description: 'Catálogo y existencias', icon: Package,
    color: 'text-nucleo-orange', bg: 'bg-nucleo-orange-bg' },
  { id: 'asignaciones', label: 'Asignaciones',
    description: 'Equipos y responsables', icon: Laptop,
    color: 'text-nucleo-purple', bg: 'bg-nucleo-purple-bg' },
  { id: 'mantenimientos', label: 'Mantenimientos',
    description: 'Preventivos y correctivos', icon: Wrench,
    color: 'text-nucleo-amber', bg: 'bg-nucleo-amber-bg' },
  { id: 'reportes', label: 'Reportes',
    description: 'Análisis y estadísticas',
    icon: ChartNoAxesCombined,
    color: 'text-nucleo-pink', bg: 'bg-nucleo-pink-bg' },
]

export default function Dashboard({ session }: { session: Session }) {
  const [page, setPage] = useState<Page>('dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [roleLoading, setRoleLoading] = useState(true)
  const [error, setError] = useState('')

  const email = session.user.email ?? 'Usuario'
  const selected = nav.find(n => n.id === page) ?? nav[0]

  useEffect(() => {
    let active = true

    async function loadRole() {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, is_active')
        .eq('id', session.user.id)
        .single()

      if (!active) return

      if (error) {
        setError('No fue posible consultar tus permisos.')
      }

      setIsAdmin(data?.role === 'admin' && data?.is_active === true)
      setRoleLoading(false)
    }

    void loadRole()
    return () => { active = false }
  }, [session.user.id])

  function navigate(next: Page) {
    setPage(next)
    setMobileOpen(false)
  }

  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) setError('No fue posible cerrar sesión.')
  }

  function Navigation({ mobile = false }: { mobile?: boolean }) {
    const compact = collapsed && !mobile

    return (
      <div className="flex h-full flex-col">
        <div className="nucleo-spectrum h-1 shrink-0" />

        <div className="flex items-center justify-between
          border-b border-mac-border p-4">
          <button
            onClick={() => navigate('dashboard')}
            className="flex min-w-0 items-center gap-3"
          >
            <img src="/nucleo-logo.png" alt="NÚCLEO"
              className="h-11 w-11 object-contain" />
            {!compact && (
              <div className="text-left">
                <h1 className="font-black tracking-widest">NÚCLEO</h1>
                <p className="text-[9px] text-mac-muted">
                  SISTEMAS IT AVANZADOS
                </p>
              </div>
            )}
          </button>

          {mobile && (
            <button onClick={() => setMobileOpen(false)}
              aria-label="Cerrar menú">
              <X size={20} />
            </button>
          )}
        </div>

        <nav aria-label="Menú principal"
          className="flex-1 space-y-1 overflow-y-auto p-3">
          {!compact && (
            <p className="px-3 py-3 font-mono text-[10px]
              tracking-widest text-mac-muted">
              MENÚ PRINCIPAL
            </p>
          )}

          {nav.map(item => {
            const Icon = item.icon
            const active = page === item.id

            return (
              <button key={item.id}
                onClick={() => navigate(item.id)}
                aria-current={active ? 'page' : undefined}
                title={compact ? item.label : undefined}
                className={`flex w-full items-center gap-3
                  rounded-xl px-3 py-3 text-left text-sm
                  transition-colors
                  ${active
                    ? 'bg-[#332032] text-white'
                    : 'text-mac-muted hover:bg-[#27212e]'}
                  ${compact ? 'justify-center' : ''}`}
              >
                <Icon size={20} className={
                  active ? item.color : 'shrink-0'
                } />
                {!compact && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-mac-border p-3">
          {!compact && (
            <div className="mb-3 flex items-center gap-3
              rounded-xl bg-[#221d29] p-3">
              <CircleUserRound size={24}
                className="text-nucleo-purple" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {email.split('@')[0]}
                </p>
                <p className="truncate text-xs text-mac-muted">
                  {email}
                </p>
              </div>
            </div>
          )}

          <button onClick={logout}
            className="mac-button-secondary flex w-full
              items-center justify-center gap-2 text-sm">
            <LogOut size={18} />
            {!compact && 'Cerrar sesión'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="nucleo-background min-h-dvh text-mac-ink">
      <aside className={`fixed inset-y-0 left-0 z-30 hidden
        border-r border-mac-border bg-[#14121b] lg:block
        ${collapsed ? 'w-20' : 'w-64'}`}>
        <Navigation />
      </aside>

      {mobileOpen && (
        <>
          <button className="fixed inset-0 z-40 bg-black/75 lg:hidden"
            aria-label="Cerrar menú"
            onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50
            w-[280px] max-w-[85vw] bg-[#14121b] lg:hidden">
            <Navigation mobile />
          </aside>
        </>
      )}

      <div className={collapsed ? 'lg:ml-20' : 'lg:ml-64'}>
        <header className="mac-topbar sticky top-0 z-20">
          <div className="nucleo-spectrum h-1" />
          <div className="flex min-h-17 items-center
            justify-between gap-3 px-5">
            <div className="flex items-center gap-3">
              <button aria-label="Abrir menú"
                className="lg:hidden"
                onClick={() => setMobileOpen(true)}>
                <Menu size={22} />
              </button>

              <button aria-label="Contraer menú"
                className="hidden lg:block"
                onClick={() => setCollapsed(!collapsed)}>
                {collapsed
                  ? <PanelLeftOpen size={20} />
                  : <PanelLeftClose size={20} />}
              </button>
              <span className="font-semibold">{selected.label}</span>
            </div>

            <span className="hidden text-xs text-mac-muted sm:block">
              NÚCLEO / CORE SYSTEM
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-7">
          {error && (
            <p role="alert" className="mb-5 rounded-lg
              border border-red-800 bg-red-950/50 p-3
              text-sm text-red-200">{error}</p>
          )}

          {page === 'inventario' ? (
            roleLoading ? (
              <p className="text-mac-muted">
                Verificando permisos...
              </p>
            ) : (
              <Inventory isAdmin={isAdmin} />
            )
          ) : page === 'dashboard' ? (
            <>
              <p className="mb-3 flex items-center gap-2
                font-mono text-xs text-nucleo-blue">
                <Cpu size={16} /> SYSTEM / OVERVIEW
              </p>

              <h2 className="text-3xl font-black sm:text-4xl">
                Bienvenido a{' '}
                <span className="nucleo-text-gradient">NÚCLEO.</span>
              </h2>

              <p className="mt-3 text-sm text-mac-muted">
                Centro de operaciones de soporte técnico.
              </p>

              <section className="mac-card mt-8 p-6 sm:p-8">
                <div className="flex flex-wrap items-center
                  justify-between gap-5">
                  <div>
                    <span className="mac-badge">
                      <ShieldCheck size={16} />
                      PLATAFORMA INTERNA
                    </span>
                    <h3 className="mt-5 text-2xl font-black">
                      Todo tu soporte en un lugar.
                    </h3>
                    <p className="mt-3 max-w-xl text-sm
                      leading-7 text-mac-muted">
                      Administra artículos, servicios técnicos,
                      asignaciones y mantenimientos.
                    </p>
                  </div>
                  <img src="/nucleo-logo.png"
                    alt="Logo NÚCLEO"
                    className="h-32 w-32 object-contain" />
                </div>
              </section>

              <h3 className="mb-5 mt-10 text-xl font-bold">
                Módulos del sistema
              </h3>

              <div className="grid gap-4 sm:grid-cols-2
                xl:grid-cols-3">
                {nav.filter(n => n.id !== 'dashboard').map(item => {
                  const Icon = item.icon
                  return (
                    <button key={item.id}
                      onClick={() => navigate(item.id)}
                      className="mac-card group flex min-h-50
                        flex-col p-6 text-left">
                      <div className={`mb-5 flex h-12 w-12
                        items-center justify-center rounded-xl
                        ${item.bg} ${item.color}`}>
                        <Icon size={25} />
                      </div>

                      <h4 className="text-lg font-bold">
                        {item.label}
                      </h4>
                      <p className="mt-2 flex-1 text-sm text-mac-muted">
                        {item.description}
                      </p>
                      <div className="mt-5 flex items-center
                        justify-between border-t border-mac-border
                        pt-4">
                        <span className="text-xs text-mac-muted">
                          Abrir módulo
                        </span>
                        <ArrowUpRight size={18}
                          className={item.color} />
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <section className="mac-card p-8 text-center">
              <div className={`mx-auto mb-5 flex h-16 w-16
                items-center justify-center rounded-xl
                ${selected.bg} ${selected.color}`}>
                <selected.icon size={30} />
              </div>

              <h2 className="text-2xl font-black">
                {selected.label}
              </h2>
              <p className="mt-3 text-mac-muted">
                Este módulo se encuentra en desarrollo.
              </p>
              <button onClick={() => navigate('dashboard')}
                className="mac-button-secondary mt-6">
                Volver al dashboard
              </button>
            </section>
          )}

          <footer className="mt-12 flex items-center
            justify-between border-t border-mac-border
            pt-6 text-xs text-mac-muted">
            <span>© {new Date().getFullYear()} NÚCLEO</span>
            <span className="flex items-center gap-2">
              <Database size={14} /> V1.0
            </span>
          </footer>
        </main>
      </div>
    </div>
  )
}
