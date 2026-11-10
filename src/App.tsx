
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'

import {
  ClipboardList,
  Package,
  Laptop,
  Wrench,
  ChartNoAxesCombined,
  LogOut,
  ArrowUpRight,
  ShieldCheck,
  Cpu,
  Activity,
} from 'lucide-react'

import { supabase } from './lib/supabase'
import Login from './components/Login'

/* =========================================
   MÓDULOS DE NÚCLEO
========================================= */

const modules = [
  {
    name: 'Visitas técnicas',
    description:
      'Registro y seguimiento de servicios técnicos.',
    icon: ClipboardList,
    color: 'text-nucleo-blue',
    background: 'bg-nucleo-blue-bg',
    border: 'border-[#284c79]',
    number: '01',
  },
  {
    name: 'Inventario',
    description:
      'Materiales, refacciones y control de existencias.',
    icon: Package,
    color: 'text-nucleo-orange',
    background: 'bg-nucleo-orange-bg',
    border: 'border-[#79503b]',
    number: '02',
  },
  {
    name: 'Asignación de equipos',
    description:
      'Entrega, custodia y devolución de activos.',
    icon: Laptop,
    color: 'text-nucleo-purple',
    background: 'bg-nucleo-purple-bg',
    border: 'border-[#553d80]',
    number: '03',
  },
  {
    name: 'Mantenimientos',
    description:
      'Programación y seguimiento de actividades.',
    icon: Wrench,
    color: 'text-nucleo-amber',
    background: 'bg-nucleo-amber-bg',
    border: 'border-[#79603b]',
    number: '04',
  },
  {
    name: 'Reportes y estadísticas',
    description:
      'Información, indicadores y estadísticas de operación.',
    icon: ChartNoAxesCombined,
    color: 'text-nucleo-pink',
    background: 'bg-nucleo-pink-bg',
    border: 'border-[#783c62]',
    number: '05',
  },
]

/* =========================================
   APLICACIÓN PRINCIPAL
========================================= */

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  /* =========================================
     CERRAR SESIÓN
  ========================================= */

  async function handleLogout() {
    if (signingOut) return

    setSigningOut(true)
    setLogoutError('')

    try {
      const { error } = await supabase.auth.signOut()

      if (error) throw error
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      setLogoutError(
        'No fue posible cerrar sesión. Inténtalo nuevamente.'
      )
    } finally {
      setSigningOut(false)
    }
  }

  /* =========================================
     PANTALLA DE CARGA
  ========================================= */

  if (loading) {
    return (
      <div
        className="nucleo-background flex min-h-dvh
        flex-col items-center justify-center gap-5"
      >
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full
            bg-nucleo-pink/25 blur-3xl"
          />

          <img
            src="/nucleo-logo.png"
            alt="NÚCLEO"
            className="relative w-40 object-contain"
          />
        </div>

        <div className="nucleo-spectrum h-1 w-36 rounded-full" />

        <p
          className="font-mono text-xs tracking-widest
          text-mac-muted"
        >
          INICIANDO NÚCLEO...
        </p>
      </div>
    )
  }

  /* =========================================
     LOGIN
  ========================================= */

  if (!session) {
    return <Login />
  }

  const email = session.user.email ?? 'Usuario'
  const userName = email.split('@')[0]

  /* =========================================
     DASHBOARD
  ========================================= */

  return (
    <main className="nucleo-background min-h-dvh text-mac-ink">

      {/* HEADER */}
      <header className="mac-topbar sticky top-0 z-20">

        {/* Línea de colores de marca */}
        <div className="nucleo-spectrum h-1 w-full" />

        <div
          className="mx-auto flex max-w-7xl flex-wrap
          items-center justify-between gap-4
          px-5 py-4 sm:px-8"
        >

          {/* LOGO */}
          <div className="flex items-center gap-3">
            <img
              src="/nucleo-logo.png"
              alt="NÚCLEO"
              className="h-12 w-12 rounded-lg object-contain"
            />

            <div>
              <h1
                className="text-base font-black
                tracking-[0.16em]"
              >
                NÚCLEO
              </h1>

              <p
                className="font-mono text-[10px]
                tracking-wider text-mac-muted"
              >
                SISTEMAS IT AVANZADOS
              </p>
            </div>
          </div>

          {/* ACCIONES */}
          <div className="flex items-center gap-3">

            <span
              className="hidden items-center gap-2
              rounded-full border border-[#315d4b]
              bg-[#15271f] px-3 py-2
              text-xs text-[#77d8aa] sm:flex"
            >
              <Activity size={14} />
              Sesión activa
            </span>

            <span
              className="hidden max-w-[220px]
              truncate text-xs text-mac-muted md:block"
              title={email}
            >
              {email}
            </span>

            <button
              onClick={handleLogout}
              disabled={signingOut}
              className="mac-button-secondary flex
              items-center gap-2 text-sm
              disabled:opacity-60"
            >
              <LogOut size={16} />

              <span className="hidden sm:inline">
                {signingOut
                  ? 'Cerrando...'
                  : 'Cerrar sesión'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <div
        className="mx-auto max-w-7xl
        px-5 py-9 sm:px-8 lg:py-12"
      >

        {/* ERROR AL CERRAR SESIÓN */}
        {logoutError && (
          <div
            role="alert"
            className="mb-6 rounded-lg border
            border-[#8c405d] bg-[#391d2e]
            p-4 text-sm text-[#ffb2cb]"
          >
            {logoutError}
          </div>
        )}

        {/* BIENVENIDA */}
        <section className="mb-9">

          <div
            className="mb-4 flex items-center gap-2
            font-mono text-xs tracking-wide text-mac-muted"
          >
            <Cpu
              size={15}
              className="text-nucleo-blue"
            />
            CORE SYSTEM / DASHBOARD
          </div>

          <h2
            className="text-3xl font-black
            tracking-tight sm:text-4xl"
          >
            Bienvenido a{' '}
            <span className="nucleo-text-gradient">
              NÚCLEO.
            </span>
          </h2>

          <p className="mt-3 text-sm text-mac-muted">
            Hola, {userName}. Este es tu centro de
            operaciones de soporte técnico.
          </p>
        </section>

        {/* PANEL PRINCIPAL */}
        <section
          className="mac-card relative mb-10
          overflow-hidden p-6 sm:p-8"
        >
          {/* Luz rosa */}
          <div
            className="absolute -right-16 -top-20
            h-64 w-64 rounded-full
            bg-nucleo-pink/10 blur-3xl"
          />

          {/* Luz azul */}
          <div
            className="absolute -bottom-20 left-1/3
            h-52 w-52 rounded-full
            bg-nucleo-blue/5 blur-3xl"
          />

          <div
            className="relative flex flex-col gap-6
            sm:flex-row sm:items-center
            sm:justify-between"
          >
            <div className="max-w-xl">

              <span className="mac-badge mb-4">
                <ShieldCheck size={14} />
                PLATAFORMA INTERNA
              </span>

              <h3
                className="text-xl font-black
                sm:text-2xl"
              >
                Tu centro de control.
              </h3>

              <p
                className="mt-3 text-sm leading-7
                text-mac-muted"
              >
                Centraliza las visitas técnicas,
                administra tu inventario, controla
                las asignaciones y supervisa los
                mantenimientos desde una sola plataforma.
              </p>

              {/* Indicadores decorativos */}
              <div
                className="mt-6 flex flex-wrap
                items-center gap-2"
              >
                <span
                  className="rounded-full border
                  border-[#284c79]
                  bg-nucleo-blue-bg px-3 py-1.5
                  text-xs text-nucleo-blue"
                >
                  Servicios
                </span>

                <span
                  className="rounded-full border
                  border-[#79503b]
                  bg-nucleo-orange-bg px-3 py-1.5
                  text-xs text-nucleo-orange"
                >
                  Inventario
                </span>

                <span
                  className="rounded-full border
                  border-[#553d80]
                  bg-nucleo-purple-bg px-3 py-1.5
                  text-xs text-nucleo-purple"
                >
                  Equipos
                </span>
              </div>
            </div>

            {/* LOGO */}
            <div
              className="relative flex shrink-0
              items-center justify-center"
            >
              <div
                className="absolute inset-0 rounded-full
                bg-nucleo-purple/15 blur-3xl"
              />

              <img
                src="/nucleo-logo.png"
                alt="NÚCLEO"
                className="relative h-32 w-32 object-contain"
              />
            </div>
          </div>
        </section>

        {/* MÓDULOS */}
        <section>

          <div
            className="mb-6 flex flex-wrap
            items-center justify-between gap-3"
          >
            <div>
              <h3 className="text-xl font-black">
                Módulos del sistema
              </h3>

              <p className="mt-1 text-sm text-mac-muted">
                Herramientas de administración
                y gestión de soporte técnico.
              </p>
            </div>

            <span
              className="rounded-full border
              border-mac-border bg-mac-panel
              px-4 py-2 font-mono
              text-xs text-mac-muted"
            >
              {modules.length} MÓDULOS
            </span>
          </div>

          {/* GRID DE MÓDULOS */}
          <div
            className="grid gap-5
            sm:grid-cols-2 lg:grid-cols-3"
          >
            {modules.map(
              ({
                name,
                description,
                icon: Icon,
                color,
                background,
                border,
                number,
              }) => (
                <article
                  key={name}
                  className="mac-card group flex
                  min-h-[230px] flex-col
                  justify-between p-6"
                >
                  <div>

                    {/* ICONO Y NÚMERO */}
                    <div
                      className="mb-5 flex
                      items-start justify-between"
                    >
                      <div
                        className={`flex h-13 w-13
                        items-center justify-center
                        rounded-xl border
                        ${background} ${color} ${border}`}
                      >
                        <Icon
                          size={25}
                          strokeWidth={1.8}
                        />
                      </div>

                      <span
                        className="font-mono text-xs
                        text-mac-muted"
                      >
                        {number}
                      </span>
                    </div>

                    {/* INFORMACIÓN */}
                    <h4 className="text-lg font-bold">
                      {name}
                    </h4>

                    <p
                      className="mt-2 text-sm
                      leading-6 text-mac-muted"
                    >
                      {description}
                    </p>
                  </div>

                  {/* PIE DE TARJETA */}
                  <div
                    className="mt-6 flex items-center
                    justify-between border-t
                    border-mac-border pt-4"
                  >
                    <span
                      className="font-mono text-xs
                      text-mac-muted"
                    >
                      EN DESARROLLO
                    </span>

                    <ArrowUpRight
                      size={19}
                      className={color}
                    />
                  </div>
                </article>
              )
            )}
          </div>
        </section>

        {/* PIE DE PÁGINA */}
        <footer
          className="mt-14 flex flex-wrap
          items-center justify-between gap-3
          border-t border-mac-border pt-6
          font-mono text-[11px]
          text-mac-muted"
        >
          <span>
            © {new Date().getFullYear()} NÚCLEO
          </span>

          <span>
            CORE SYSTEM / VERSION 1.0
          </span>
        </footer>
      </div>
    </main>
  )
}
