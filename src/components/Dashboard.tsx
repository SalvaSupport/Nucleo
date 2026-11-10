
import { useState } from 'react'
import type { ElementType } from 'react'
import type { Session } from '@supabase/supabase-js'
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Laptop,
  Wrench,
  ChartNoAxesCombined,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  ShieldCheck,
  CircleUserRound,
  ArrowUpRight,
  Database,
  Cpu,
  Settings2,
} from 'lucide-react'

import { supabase } from '../lib/supabase'

type Page =
  | 'dashboard'
  | 'visitas'
  | 'inventario'
  | 'asignaciones'
  | 'mantenimientos'
  | 'reportes'

interface DashboardProps {
  session: Session
}

interface NavigationItem {
  id: Page
  name: string
  description: string
  icon: ElementType
  color: string
  bg: string
  border: string
}

const navigation: NavigationItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Resumen general del sistema',
    icon: LayoutDashboard,
    color: 'text-nucleo-pink',
    bg: 'bg-nucleo-pink-bg',
    border: 'border-[#783c62]',
  },
  {
    id: 'visitas',
    name: 'Visitas técnicas',
    description: 'Registro y seguimiento de servicios',
    icon: ClipboardList,
    color: 'text-nucleo-blue',
    bg: 'bg-nucleo-blue-bg',
    border: 'border-[#284c79]',
  },
  {
    id: 'inventario',
    name: 'Inventario',
    description: 'Materiales, equipos y existencias',
    icon: Package,
    color: 'text-nucleo-orange',
    bg: 'bg-nucleo-orange-bg',
    border: 'border-[#79503b]',
  },
  {
    id: 'asignaciones',
    name: 'Asignaciones',
    description: 'Entrega y devolución de equipos',
    icon: Laptop,
    color: 'text-nucleo-purple',
    bg: 'bg-nucleo-purple-bg',
    border: 'border-[#553d80]',
  },
  {
    id: 'mantenimientos',
    name: 'Mantenimientos',
    description: 'Programación y seguimiento',
    icon: Wrench,
    color: 'text-nucleo-amber',
    bg: 'bg-nucleo-amber-bg',
    border: 'border-[#79603b]',
  },
  {
    id: 'reportes',
    name: 'Reportes',
    description: 'Indicadores y estadísticas',
    icon: ChartNoAxesCombined,
    color: 'text-nucleo-pink',
    bg: 'bg-nucleo-pink-bg',
    border: 'border-[#783c62]',
  },
]

export default function Dashboard({ session }: DashboardProps) {
  const [page, setPage] = useState<Page>('dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState('')

  const email = session.user.email ?? 'Usuario'
  const username = email.split('@')[0]

  const currentPage =
    navigation.find(item => item.id === page) ?? navigation[0]

  function navigate(next: Page) {
    setPage(next)
    setMobileOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function logout() {
    if (signingOut) return

    setSigningOut(true)
    setError('')

    try {
      const { error: authError } = await supabase.auth.signOut()

      if (authError) throw authError
    } catch (err) {
      console.error(err)
      setError('No fue posible cerrar la sesión.')
    } finally {
      setSigningOut(false)
    }
  }

  function SidebarContent() {
    return (
      <div className="flex h-full flex-col">

        {/* Identidad */}
        <div className="nucleo-spectrum h-1 shrink-0" />

        <div className="flex items-center justify-between gap-2 border-b
          border-mac-border px-4 py-5">

          <button
            onClick={() => navigate('dashboard')}
            className="flex min-w-0 items-center gap-3 text-left"
            title="Ir al inicio"
          >
            <img
              src="/nucleo-logo.png"
              alt="NÚCLEO"
              className="h-11 w-11 shrink-0 rounded-lg object-contain"
            />

            {!collapsed && (
              <div className="min-w-0">
                <h1 className="text-base font-black tracking-[.16em]">
                  NÚCLEO
                </h1>
                <p className="font-mono text-[9px] text-mac-muted">
                  SISTEMAS IT AVANZADOS
                </p>
              </div>
            )}
          </button>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-mac-muted hover:bg-[#292332]
              lg:hidden"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navegación */}
        <nav
          className="flex-1 space-y-1 overflow-y-auto px-3 py-6"
          aria-label="Navegación principal"
        >
          {!collapsed && (
            <p className="mb-4 px-3 font-mono text-[10px]
              tracking-[.15em] text-[#817889]">
              MENÚ PRINCIPAL
            </p>
          )}

          {navigation.map(item => {
            const Icon = item.icon
            const active = page === item.id

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                title={collapsed ? item.name : undefined}
                aria-current={active ? 'page' : undefined}
                className={`flex w-full items-center gap-3 rounded-xl
                  border px-3 py-3 text-left transition-colors
                  ${active
                    ? 'border-[#713a63] bg-[#322032] text-white'
                    : 'border-transparent text-mac-muted hover:bg-[#25202d] hover:text-white'
                  }
                  ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon
                  size={20}
                  className={active ? item.color : 'shrink-0'}
                />

                {!collapsed && (
                  <>
                    <span className="flex-1 text-sm font-semibold">
                      {item.name}
                    </span>

                    {active && (
                      <span className="h-2 w-2 rounded-full
                        bg-nucleo-pink" />
                    )}
                  </>
                )}
              </button>
            )
          })}
        </nav>

        {/* Perfil y cierre */}
        <div className="border-t border-mac-border p-3">

          {!collapsed && (
            <div className="mb-3 flex items-center gap-3 rounded-xl
              bg-[#211c29] p-3">
              <div className="flex h-10 w-10 shrink-0 items-center
                justify-center rounded-xl bg-nucleo-purple-bg
                text-nucleo-purple">
                <CircleUserRound size={21} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold">
                  {username}
                </p>
                <p className="truncate text-xs text-mac-muted">
                  {email}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            disabled={signingOut}
            title={collapsed ? 'Cerrar sesión' : undefined}
            className={`mac-button-secondary flex w-full
              items-center gap-3 text-sm disabled:opacity-60
              ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={18} />
            {!collapsed && (
              <span>
                {signingOut ? 'Cerrando...' : 'Cerrar sesión'}
              </span>
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="nucleo-background min-h-dvh text-mac-ink">

      {/* Sidebar escritorio */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden
          border-r border-mac-border bg-[#14121b]
          transition-[width] duration-200 lg:block
          ${collapsed ? 'w-[84px]' : 'w-[260px]'}`}
      >
        <SidebarContent />
      </aside>

      {/* Fondo móvil */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menú lateral"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
        />
      )}

      {/* Sidebar móvil */}
      {mobileOpen && (
        <aside
          className="fixed inset-y-0 left-0 z-50 w-[280px]
            max-w-[85vw] bg-[#14121b] shadow-2xl lg:hidden"
        >
          <SidebarContent />
        </aside>
      )}

      {/* Área principal */}
      <div
        className={`min-h-dvh transition-[margin] duration-200
          ${collapsed ? 'lg:ml-[84px]' : 'lg:ml-[260px]'}`}
      >

        {/* Barra superior */}
        <header className="mac-topbar sticky top-0 z-20">
          <div className="nucleo-spectrum h-1" />

          <div className="flex min-h-[72px] items-center
            justify-between gap-3 px-4 sm:px-7">

            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-lg border border-mac-border
                  p-2 text-mac-muted lg:hidden"
                aria-label="Abrir menú"
              >
                <Menu size={20} />
              </button>

              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden rounded-lg border border-mac-border
                  p-2 text-mac-muted hover:text-white lg:flex"
                title={collapsed ? 'Expandir menú' : 'Contraer menú'}
              >
                {collapsed
                  ? <PanelLeftOpen size={19} />
                  : <PanelLeftClose size={19} />}
              </button>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold">
                  {currentPage.name}
                </p>
                <p className="hidden font-mono text-[10px]
                  text-mac-muted sm:block">
                  NÚCLEO / CORE SYSTEM
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-2 rounded-full
                border border-[#315d4b] bg-[#15271f] px-3 py-2
                text-xs text-[#77d8aa] sm:flex">
                <span className="h-2 w-2 rounded-full bg-[#53c69a]" />
                Sesión activa
              </span>

              <div
                className="flex h-10 w-10 items-center justify-center
                  rounded-xl border border-[#553d80]
                  bg-nucleo-purple-bg text-nucleo-purple"
                title={email}
              >
                <CircleUserRound size={21} />
              </div>
            </div>
          </div>
        </header>

        {/* Página */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-7 lg:py-10">

          {error && (
            <div role="alert" className="mb-6 rounded-xl border
              border-[#8c405d] bg-[#391d2e] p-4 text-sm
              text-[#ffb2cb]">
              {error}
            </div>
          )}

          {page === 'dashboard' ? (
            <>
              {/* Presentación */}
              <div className="mb-8">
                <p className="mb-3 flex items-center gap-2 font-mono
                  text-xs tracking-widest text-nucleo-blue">
                  <Cpu size={16} />
                  SYSTEM / OVERVIEW
                </p>

                <h2 className="text-3xl font-black sm:text-4xl">
                  Bienvenido a{' '}
                  <span className="nucleo-text-gradient">
                    NÚCLEO.
                  </span>
                </h2>

                <p className="mt-3 text-sm text-mac-muted">
                  Tu centro de operaciones de soporte técnico.
                </p>
              </div>

              {/* Banner */}
              <div className="mac-card relative mb-9 overflow-hidden p-6
                sm:p-8">
                <div className="absolute -right-10 -top-12 h-52 w-52
                  rounded-full bg-nucleo-pink/10 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-40 w-40
                  rounded-full bg-nucleo-blue/10 blur-3xl" />

                <div className="relative flex flex-col items-start
                  justify-between gap-6 sm:flex-row sm:items-center">
                  <div className="max-w-xl">
                    <span className="mac-badge">
                      <ShieldCheck size={15} />
                      PLATAFORMA INTERNA
                    </span>

                    <h3 className="mt-5 text-2xl font-black">
                      Todo tu soporte en un lugar.
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-mac-muted">
                      Organiza servicios, inventario, equipos y
                      mantenimientos desde una misma plataforma.
                    </p>
                  </div>

                  <img
                    src="/nucleo-logo.png"
                    alt="Logo de NÚCLEO"
                    className="h-32 w-32 shrink-0 object-contain"
                  />
                </div>
              </div>

              {/* Indicadores pendientes */}
              <div className="mb-9 grid gap-4 sm:grid-cols-3">
                {[
                  {
                    title: 'Servicios registrados',
                    icon: ClipboardList,
                    color: 'text-nucleo-blue',
                  },
                  {
                    title: 'Artículos de inventario',
                    icon: Package,
                    color: 'text-nucleo-orange',
                  },
                  {
                    title: 'Equipos asignados',
                    icon: Laptop,
                    color: 'text-nucleo-purple',
                  },
                ].map(metric => {
                  const Icon = metric.icon

                  return (
                    <div key={metric.title} className="mac-card p-5">
                      <Icon size={22} className={metric.color} />

                      <p className="mt-4 text-sm text-mac-muted">
                        {metric.title}
                      </p>

                      <p className="mt-2 font-mono text-lg font-bold
                        text-white">
                        Sin datos
                      </p>

                      <p className="mt-1 text-xs text-mac-muted">
                        Pendiente de conexión
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Módulos */}
              <div className="mb-5 flex flex-wrap items-center
                justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black">
                    Módulos del sistema
                  </h3>
                  <p className="mt-1 text-sm text-mac-muted">
                    Selecciona una sección para continuar.
                  </p>
                </div>
                <span className="font-mono text-xs text-mac-muted">
                  05 MÓDULOS
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {navigation.filter(m => m.id !== 'dashboard').map(
                  (item, index) => {
                    const Icon = item.icon

                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate(item.id)}
                        className="mac-card group flex min-h-[210px]
                          flex-col p-6 text-left
                          hover:-translate-y-1"
                      >
                        <div className="mb-5 flex w-full
                          items-center justify-between">
                          <div className={`flex h-12 w-12
                            items-center justify-center rounded-xl
                            border ${item.bg} ${item.border}
                            ${item.color}`}>
                            <Icon size={24} />
                          </div>
                          <span className="font-mono text-xs
                            text-mac-muted">
                            0{index + 1}
                          </span>
                        </div>

                        <h4 className="text-lg font-bold">
                          {item.name}
                        </h4>

                        <p className="mt-2 flex-1 text-sm
                          leading-6 text-mac-muted">
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
                  }
                )}
              </div>
            </>
          ) : (
            /* Pantallas de los módulos */
            <>
              <div className="mb-7 flex flex-wrap items-center gap-2
                text-xs text-mac-muted">
                <button
                  onClick={() => navigate('dashboard')}
                  className="hover:text-nucleo-pink"
                >
                  Dashboard
                </button>
                <ChevronRight size={14} />
                <span className={currentPage.color}>
                  {currentPage.name}
                </span>
              </div>

              <div className="mb-8 flex items-center gap-4">
                <div className={`flex h-14 w-14 shrink-0
                  items-center justify-center rounded-2xl
                  border ${currentPage.bg}
                  ${currentPage.border} ${currentPage.color}`}>
                  <currentPage.icon size={27} />
                </div>

                <div>
                  <h2 className="text-2xl font-black sm:text-3xl">
                    {currentPage.name}
                  </h2>
                  <p className="mt-1 text-sm text-mac-muted">
                    {currentPage.description}
                  </p>
                </div>
              </div>

              <div className="mac-card flex min-h-[350px] flex-col
                items-center justify-center p-7 text-center">
                <div className={`mb-6 flex h-20 w-20 items-center
                  justify-center rounded-2xl border
                  ${currentPage.bg}
                  ${currentPage.border} ${currentPage.color}`}>
                  <currentPage.icon size={38} strokeWidth={1.5} />
                </div>

                <h3 className="text-xl font-black">
                  Módulo preparado
                </h3>

                <p className="mt-3 max-w-md text-sm leading-7
                  text-mac-muted">
                  La navegación está funcionando. El siguiente
                  paso será conectar este módulo con las tablas
                  y operaciones reales de Supabase.
                </p>

                <button
                  onClick={() => navigate('dashboard')}
                  className="mac-button-secondary mt-7 flex
                    items-center gap-2 text-sm"
                >
                  <LayoutDashboard size={17} />
                  Volver al dashboard
                </button>
              </div>
            </>
          )}

          {/* Footer */}
          <footer className="mt-12 flex flex-wrap items-center
            justify-between gap-3 border-t border-mac-border pt-6
            font-mono text-[11px] text-mac-muted">
            <span>
              © {new Date().getFullYear()} NÚCLEO
            </span>

            <span className="flex items-center gap-2">
              <Database size={13} />
              CORE SYSTEM / V1.0
            </span>
          </footer>
        </main>
      </div>
    </div>
  )
}
