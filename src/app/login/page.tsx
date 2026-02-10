'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { alert(error.message) } 
    else { router.push('/dashboard') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4">
      {/* Main Container - 'flex-row' is the key for side-by-side */}
      <div className="bg-white rounded-[1rem] shadow-2xl flex flex-row max-w-4xl w-full overflow-hidden min-h-[600px]">
        
        {/* LEFT SIDE: The Illustration (NO HIDDEN CLASS) */}
        <div className="w-1/2 relative bg-[] flex flex-col items-center justify-center text-center p-10 text-white">
          <img 
            src="/artist2.svg" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-90"
            alt="Artist Illustration"
          />
        </div>

        {/* RIGHT SIDE: The Form */}
        <div className="w-1/2 p-12 flex flex-col justify-center items-center text-center">
          <h1 className="text-3xl font-bold text-[#FF5A5F] mb-6">Sign In</h1>
          
          <form onSubmit={handleLogin} className="w-full space-y-4">
            <input 
              type="email" placeholder="Email" 
              className="w-full p-4 bg-[#F0F2F5] rounded-xl outline-none"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input 
              type="password" placeholder="Password" 
              className="w-full p-4 bg-[#F0F2F5] rounded-xl outline-none"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              disabled={loading}
              className="w-full bg-[#FF5A5F] text-white py-4 rounded-xl font-bold mt-4 shadow-lg shadow-red-200"
            >
              {loading ? '...' : 'Sign In'}
            </button>
          </form>
          
          <p className="mt-8 text-xs text-stone-400">
            Don't have an account? <Link href="/signup" className="text-[#FF5A5F] font-bold">Sign Up</Link>
          </p>
        </div>

      </div>
    </div>
  )
}