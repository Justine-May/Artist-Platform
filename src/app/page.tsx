'use client'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'

export default function Home() {
  const [status, setStatus] = useState('Connecting...')

  useEffect(() => {
    async function check() {
      const { error } = await supabase.from('profiles').select('*').limit(1)
      if (error) setStatus(`Error: ${error.message}`)
      else setStatus('Connected Successfully!')
    }
    check()
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen text-2xl font-bold">
      {status}
    </div>
  )
}