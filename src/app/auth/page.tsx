'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'
import styles from './Auth.module.css'
import { ArrowLeft, Mail, Lock, Loader2, LogOut, ChevronRight } from 'lucide-react'

export default function UnifiedAuth() {
  const [view, setView] = useState<'selection' | 'auth'>('selection')
  const [role, setRole] = useState<'artist' | 'collector' | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) setCurrentUser(session.user)
    }
    getSession()
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { role: role } }
      })
      if (error) alert(error.message)
      else alert("Registration sent. Please verify your email.")
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) alert(error.message)
      else {
        const userRole = data.user?.user_metadata.role
        router.push(userRole === 'artist' ? '/dashboard' : '/collector')
      }
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error("Error signing out:", error.message)
    setCurrentUser(null)
    setView('selection')
    router.refresh()
  }

  // --- VIEW: LOGGED IN (The Clean "Active Session" UI) ---
  if (currentUser) {
    const userRole = currentUser.user_metadata?.role
    return (
      <div className={styles.container}>
        <div className={styles.authCard}>
          <div className={styles.minimalBrand}>●</div>
          <h1 className={styles.title}>ACTIVE SESSION</h1>
          <p className={styles.subtitle}>{userRole?.toUpperCase()} PORTAL</p>
          
          <div className={styles.actionGroup}>
            <button 
              className={styles.submitBtn} 
              onClick={() => router.push(userRole === 'artist' ? '/dashboard' : '/collector')}
            >
              ENTER ATELIER
            </button>
            <button onClick={handleSignOut} className={styles.signOutBtn}>
              <LogOut size={14} /> <span>LOGOUT</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --- VIEW: SELECTION ---
  if (view === 'selection') {
    return (
      <div className={styles.container}>
        <div className={styles.selectionGrid}>
          <button className={styles.roleCard} onClick={() => { setRole('artist'); setView('auth'); }}>
            <span className={styles.roleLabel}>ARTIST</span>
            <ChevronRight size={16} strokeWidth={1} />
          </button>
          <button className={styles.roleCard} onClick={() => { setRole('collector'); setView('auth'); }}>
            <span className={styles.roleLabel}>COLLECTOR</span>
            <ChevronRight size={16} strokeWidth={1} />
          </button>
        </div>
      </div>
    )
  }

  // --- VIEW: AUTH FORM ---
  return (
    <div className={styles.container}>
      <div className={styles.authCard}>
        <button onClick={() => setView('selection')} className={styles.backLink}>
          <ArrowLeft size={14} /> BACK
        </button>

        <div className={styles.tabGroup}>
          <button className={!isSignUp ? styles.activeTab : ''} onClick={() => setIsSignUp(false)}>SIGN IN</button>
          <button className={isSignUp ? styles.activeTab : ''} onClick={() => setIsSignUp(true)}>SIGN UP</button>
        </div>

        <form onSubmit={handleAuth} className={styles.form}>
          <div className={styles.inputWrapper}>
            <input type="email" placeholder="EMAIL" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="PASSWORD" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className={styles.submitBtn}>
            {loading ? <Loader2 className={styles.spin} size={16} /> : 'CONTINUE'}
          </button>
        </form>
      </div>
    </div>
  )
}