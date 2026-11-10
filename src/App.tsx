
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { LockKeyhole, LogOut, RefreshCw } from 'lucide-react'

import { supabase } from './lib/supabase'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

type UserRole =
  | 'pending'
  | 'admin'
  | 'technician'
  | 'viewer'

interface UserProfile {
  id: string
  full_name: string
  role: UserRole
  is_active: boolean
}

function LoadingScreen({ message }: { message: string }) {
  return (
    <main className="nucleo-background flex min-h-dvh
      flex-col items-center justify-center gap-5 px-5">

      <img
        src="/nucleo-logo.png"
        alt="NÚCLEO"
        className="w-36 object-contain"
      />

      <div className="nucleo-spectrum h-1 w-36 rounded-full" />

      <p className="text-center font-mono text-xs
        tracking-widest text-mac-muted">
        {message}
      </p>
    </main>
  )
}

function AccessDenied({
  onRetry,
  reason,
}: {
  onRetry: () => void
  reason: 'pending' | 'error'
}) {
  const [signingOut, setSigningOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  async function logout() {
    setSigningOut(true)
    setLogoutError('')

    const { error } = await supabase.auth.signOut()

    if (error) {
      setLogoutError('No fue posible cerrar sesión.')
    }

    setSigningOut(false)
  }

  return (
    <main className="nucleo-background flex min-h-dvh
      items-center justify-center px-5 py-10">

      <section className="mac-window w-full max-w-md
        overflow-hidden text-center">

        <div className="nucleo-spectrum h-1.5" />

        <div className="p-8">
          <div className="mx-auto mb-6 flex h-16 w-16
            items-center justify-center rounded-2xl
            border border-[#783c62] bg-nucleo-pink-bg
            text-nucleo-pink">
            <LockKeyhole size={30} />
          </div>

          <h1 className="text-2xl font-black">
            {reason === 'pending'
              ? 'Acceso pendiente'
              : 'No se pudo validar tu acceso'}
          </h1>

          <p className="mt-4 text-sm leading-7 text-mac-muted">
            {reason === 'pending'
              ? 'Tu cuenta está registrada, pero necesita autorización para ingresar a NÚCLEO.'
              : 'No pudimos comprobar los permisos de tu cuenta. Intenta nuevamente o contacta al administrador.'}
          </p>

          {logoutError && (
            <p role="alert" className="mt-4 text-sm text-[#ffb2cb]">
              {logoutError}
            </p>
          )}

          <button
            onClick={onRetry}
            className="mac-button mt-7 flex w-full
              items-center justify-center gap-2"
          >
            <RefreshCw size={17} />
            Verificar nuevamente
          </button>

          <button
            onClick={logout}
            disabled={signingOut}
            className="mac-button-secondary mt-3 flex w-full
              items-center justify-center gap-2"
          >
            <LogOut size={17} />
            {signingOut ? 'Cerrando...' : 'Cerrar sesión'}
          </button>
        </div>
      </section>
    </main>
  )
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Escuchar la sesión de Supabase
  useEffect(() => {
    let mounted = true

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (!mounted) return

        setSession(currentSession)
        setAuthLoading(false)
      }
    )

    async function initialize() {
      const { data, error } = await supabase.auth.getSession()

      if (!mounted) return

      if (error) {
        console.error('Error de sesión:', error)
      }

      setSession(current =>
        current ?? data.session
      )
      setAuthLoading(false)
    }

    void initialize()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Consultar permisos del usuario autenticado
  useEffect(() => {
    const userId = session?.user.id

    if (!userId) {
      setProfile(null)
      setProfileLoading(false)
      setProfileError(false)
      return
    }

    let cancelled = false

    async function loadProfile() {
      setProfileLoading(true)
      setProfileError(false)

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, is_active')
        .eq('id', userId!)
        .single()

      if (cancelled) return

      if (error || !data) {
        console.error('Error al consultar perfil:', error)
        setProfile(null)
        setProfileError(true)
      } else {
        setProfile(data as UserProfile)
        setProfileError(false)
      }

      setProfileLoading(false)
    }

    void loadProfile()

    return () => {
      cancelled = true
    }
  }, [session?.user.id, refreshKey])

  if (authLoading) {
    return <LoadingScreen message="VALIDANDO SESIÓN..." />
  }

  if (!session) {
    return <Login />
  }

  if (
    profileLoading ||
    (profile !== null && profile.id !== session.user.id)
  ) {
    return <LoadingScreen message="VERIFICANDO PERMISOS..." />
  }

  if (profileError || !profile) {
    return (
      <AccessDenied
        reason="error"
        onRetry={() => setRefreshKey(k => k + 1)}
      />
    )
  }

  if (
    !profile.is_active ||
    profile.role === 'pending'
  ) {
    return (
      <AccessDenied
        reason="pending"
        onRetry={() => setRefreshKey(k => k + 1)}
      />
    )
  }

  return <Dashboard session={session} />
}
