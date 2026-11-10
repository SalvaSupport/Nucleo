
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'

import { supabase } from './lib/supabase'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Recuperar la sesión existente
    async function loadSession() {
      const { data, error } = await supabase.auth.getSession()

      if (!mounted) return

      if (error) {
        console.error('Error al recuperar sesión:', error)
      }

      setSession(data.session)
      setLoading(false)
    }

    // Detectar inicio o cierre de sesión
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (!mounted) return

        setSession(currentSession)
        setLoading(false)
      }
    )

    void loadSession()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Pantalla de carga
  if (loading) {
    return (
      <div className="nucleo-background flex min-h-dvh
        flex-col items-center justify-center gap-5">

        <img
          src="/nucleo-logo.png"
          alt="NÚCLEO"
          className="w-40 object-contain"
        />

        <div className="nucleo-spectrum h-1 w-36
          rounded-full" />

        <p className="font-mono text-xs tracking-widest
          text-mac-muted">
          INICIANDO NÚCLEO...
        </p>
      </div>
    )
  }

  // Sin sesión
  if (!session) {
    return <Login />
  }

  // Usuario autenticado
  return <Dashboard session={session} />
}
