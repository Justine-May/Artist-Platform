'use client'
import { FormEvent, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from '../signup/Signup.module.css'

export default function Login() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  return (
    <div className={styles.mainWrapper}>
      <section className={styles.leftSection}>
        <img src="/artist1.svg" className={styles.illustration} alt="Art Studio" />
        <div className={styles.leftContent}>
          <h2 className={styles.leftTitle}>WELCOME BACK</h2>
          <h1 className={styles.leftSubtitle}>CONTINUE YOUR JOURNEY</h1>
        </div>
      </section>

      <section className={styles.rightSection}>
        <div className={styles.topNav}>
          Not a member? <Link href="/signup">Sign Up</Link>
        </div>

        <div className={styles.formWrapper}>
          <h1 className={styles.title}>Log in to Artist Platform</h1>
          
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email Address</label>
              <input 
                type="email" 
                className={styles.inputField} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            <div className={styles.inputGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className={styles.label}>Password</label>
                <Link href="/forgot-password" style={{ fontSize: '12px', color: '#4f46e5', fontWeight: '600' }}>
                  Forgot?
                </Link>
              </div>
              <input 
                type="password" 
                placeholder="Enter your password" 
                className={styles.inputField} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>

            <button disabled={loading} className={styles.submitButton}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}