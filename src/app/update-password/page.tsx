'use client'

import { useState, FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import styles from '../signup/Signup.module.css'

export default function UpdatePassword() {
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      alert("Passwords do not match!")
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Password updated successfully!')
      router.push('/login')
    }
    setLoading(false)
  }

  return (
    <div className={styles.mainWrapper}>
      {/* LEFT SECTION (60%) */}
      <section className={styles.leftSection}>
        <img src="/artist1.svg" className={styles.illustration} alt="Art Studio" />
      </section>

      {/* RIGHT SECTION (40%) */}
      <section className={styles.rightSection}>
        <div className={styles.formWrapper} style={{ marginTop: '100px' }}>
          <h1 className={styles.title}>Set New Password</h1>
          <p style={{ color: '#6e6d7a', fontSize: '14px', marginBottom: '30px' }}>
            Please choose a strong password to secure your artist account.
          </p>
          
          <form onSubmit={handleUpdate} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>New Password</label>
              <input 
                type="password" 
                placeholder="6+ characters"
                className={styles.inputField} 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Confirm New Password</label>
              <input 
                type="password" 
                placeholder="Repeat password"
                className={styles.inputField} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>

            <button disabled={loading} className={styles.submitButton}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}