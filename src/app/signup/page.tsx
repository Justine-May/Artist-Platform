'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase' // Ensure this path matches your lib folder
import Link from 'next/link'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-4">
      
      {/* THIS IS THE MAIN CONTAINER YOU ASKED ABOUT */}
      <div className="bg-white rounded-[2rem] shadow-xl flex max-w-4xl w-full overflow-hidden min-h-[550px]">
        
        {/* Left Side: Form Section (Always 1/2) */}
        <div className="w-1/2 p-8 md:p-12 flex flex-col justify-center items-center text-center">
          <h1 className="text-3xl font-bold text-[#FF5A5F] mb-4">Create Account</h1>
          
          <p className="text-xs text-stone-400 mb-6">Enter your details to join the community</p>
          
          <form className="w-full space-y-3">
            <input 
              type="text" placeholder="Name" 
              className="w-full p-3 bg-[#F0F2F5] rounded-lg outline-none text-sm"
              onChange={(e) => setName(e.target.value)}
            />
            <input 
              type="email" placeholder="Email" 
              className="w-full p-3 bg-[#F0F2F5] rounded-lg outline-none text-sm"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input 
              type="password" placeholder="Password" 
              className="w-full p-3 bg-[#F0F2F5] rounded-lg outline-none text-sm"
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex gap-4 pt-4">
              <button className="flex-1 bg-[#FF5A5F] text-white py-3 rounded-xl font-bold text-sm">
                Sign Up
              </button>
              <Link href="/login" className="flex-1 border-2 border-[#FF5A5F] text-[#FF5A5F] py-3 rounded-xl font-bold text-sm text-center">
                Sign In
              </Link>
            </div>
          </form>
        </div>

        {/* Right Side: Image Section (Always 1/2) */}
        <div className="w-1/2 relative bg-[]">
          <img 
            src="/artist1.svg" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-90"
            alt="Artist Illustration"
          />
        </div>

      </div>
      {/* END OF MAIN CONTAINER */}

    </div>
  )
}