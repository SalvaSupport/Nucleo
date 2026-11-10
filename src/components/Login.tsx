
import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Cpu,
  Mail,
} from 'lucide-react'

import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (loading) return

    setLoading(true)
    setError('')

    try {
      const { error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

      if (authError) throw authError

      // App.tsx detectará automáticamente la sesión.
    } catch (err) {
      console.error('Error de autenticación:', err)

      setError(
        'No fue posible iniciar sesión. Verifica tus credenciales.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="nucleo-background min-h-dvh text-mac-ink">
      <div className="flex min-h-dvh flex-col">

        {/* HEADER */}
        <header className="mac-topbar">
          <div
            className="mx-auto flex max-w-7xl items-center
            justify-between px-5 py-4 sm:px-8"
          >
            <div className="flex items-center gap-3">
              <Cpu
                size={20}
                className="text-nucleo-pink"
              />

              <div>
                <span
                  className="block text-sm font-black
                  tracking-[0.18em]"
                >
                  NÚCLEO
                </span>

                <span
                  className="block font-mono text-[10px]
                  tracking-wider text-mac-muted"
                >
                  SISTEMAS IT AVANZADOS
                </span>
              </div>
            </div>

            <span
              className="font-mono text-xs
              text-nucleo-blue"
            >
              SYSTEM / V1.0
            </span>
          </div>
        </header>

        {/* CONTENIDO */}
        <div
          className="mx-auto grid w-full max-w-6xl flex-1
          items-center gap-10 px-5 py-12
          lg:grid-cols-2 lg:gap-20 lg:px-10"
        >

          {/* LOGO E IDENTIDAD */}
          <section className="flex flex-col items-center text-center">

            <div className="relative w-full max-w-[360px]">

              {/* Iluminación multicolor */}
              <div
                className="absolute inset-12 rounded-full
                bg-nucleo-pink/20 blur-[80px]"
              />

              <div
                className="absolute bottom-0 right-0
                h-32 w-32 rounded-full
                bg-nucleo-blue/15 blur-[60px]"
              />

              <div
                className="absolute left-0 top-0
                h-28 w-28 rounded-full
                bg-nucleo-orange/15 blur-[60px]"
              />

              <img
                src="/nucleo-logo.png"
                alt="NÚCLEO - Sistemas IT Avanzados"
                className="relative mx-auto w-full object-contain"
              />
            </div>

            <div className="mac-badge mt-6">
              <span
                className="h-2 w-2 rounded-full
                bg-mac-success"
              />
              PLATAFORMA DE SOPORTE
            </div>

            <h1
              className="mt-7 text-3xl font-black
              tracking-tight sm:text-4xl"
            >
              El centro de todas
              <span className="nucleo-text-gradient mt-1 block">
                tus operaciones.
              </span>
            </h1>

            <p
              className="mt-5 max-w-md text-sm
              leading-7 text-mac-muted"
            >
              Servicios técnicos, inventario, asignaciones,
              mantenimientos y reportes conectados
              en una sola plataforma.
            </p>

            <div
              className="mt-8 flex items-center gap-3
              font-mono text-[10px] tracking-widest
              text-mac-muted"
            >
              <span className="h-px w-8 bg-nucleo-blue" />
              CORE SYSTEM
              <span className="h-px w-8 bg-nucleo-orange" />
              IT MANAGEMENT
            </div>
          </section>

          {/* FORMULARIO */}
          <section
            className="mac-window w-full max-w-[460px]
            justify-self-center overflow-hidden"
          >

            {/* Línea de colores */}
            <div className="nucleo-spectrum h-1.5 w-full" />

            {/* Encabezado de ventana */}
            <div
              className="flex items-center justify-between
              border-b border-mac-border bg-[#201b28]
              px-5 py-4"
            >
              <div className="flex gap-2">
                <span
                  className="h-3 w-3 rounded-full
                  bg-nucleo-pink"
                />
                <span
                  className="h-3 w-3 rounded-full
                  bg-nucleo-orange"
                />
                <span
                  className="h-3 w-3 rounded-full
                  bg-nucleo-blue"
                />
              </div>

              <span
                className="font-mono text-[11px]
                tracking-widest text-mac-muted"
              >
                AUTH / LOGIN
              </span>

              <LockKeyhole
                size={16}
                className="text-nucleo-purple"
              />
            </div>

            <div className="p-6 sm:p-9">

              {/* Título */}
              <div className="mb-8">
                <div
                  className="mb-5 flex h-12 w-12
                  items-center justify-center rounded-xl
                  border border-[#663650]
                  bg-nucleo-pink-bg text-nucleo-pink"
                >
                  <ShieldCheck size={24} />
                </div>

                <h2 className="text-2xl font-black">
                  Iniciar sesión
                </h2>

                <p className="mt-2 text-sm text-mac-muted">
                  Ingresa tus credenciales para acceder a NÚCLEO.
                </p>
              </div>

              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >

                {/* CORREO */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 flex items-center
                    gap-2 text-sm font-semibold"
                  >
                    <Mail
                      size={16}
                      className="text-nucleo-blue"
                    />
                    Correo electrónico
                  </label>

                  <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    placeholder="usuario@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mac-input"
                    required
                  />
                </div>

                {/* CONTRASEÑA */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 flex items-center
                    gap-2 text-sm font-semibold"
                  >
                    <LockKeyhole
                      size={16}
                      className="text-nucleo-orange"
                    />
                    Contraseña
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Ingresa tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mac-input pr-12"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      aria-label={
                        showPassword
                          ? 'Ocultar contraseña'
                          : 'Mostrar contraseña'
                      }
                      className="absolute right-3 top-1/2
                      -translate-y-1/2 rounded-md p-1
                      text-mac-muted hover:text-nucleo-pink"
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>

                {/* ERROR */}
                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border
                    border-[#8c405d] bg-[#391d2e]
                    p-3 text-sm text-[#ffb2cb]"
                  >
                    {error}
                  </div>
                )}

                {/* BOTÓN */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mac-button flex w-full
                  items-center justify-center gap-2"
                >
                  {loading ? (
                    'Verificando credenciales...'
                  ) : (
                    <>
                      Acceder a NÚCLEO
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* SEGURIDAD */}
              <div
                className="mt-8 flex items-center
                justify-center gap-2 border-t
                border-mac-border pt-5 text-center
                text-xs text-mac-muted"
              >
                <ShieldCheck
                  size={16}
                  className="text-mac-success"
                />
                Acceso exclusivo para personal autorizado
              </div>
            </div>
          </section>
        </div>

        {/* FOOTER */}
        <footer
          className="border-t border-mac-border
          px-5 py-5 text-center font-mono
          text-[11px] text-mac-muted"
        >
          © {new Date().getFullYear()} NÚCLEO
          {' · '}
          SISTEMAS IT AVANZADOS
        </footer>
      </div>
    </main>
  )
}
