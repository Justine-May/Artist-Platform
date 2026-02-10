'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function ArtistDashboard() {
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUpdate = async () => {
    setLoading(true)
    // 1. Get the current logged-in user's ID
    const { data: { user } } = await supabase.auth.getUser()

    // 2. Update their specific row in the profiles table
    const { error } = await supabase
      .from('profiles')
      .update({ artist_name: name, bio: bio })
      .eq('id', user?.id) // This matches the RLS policy you created!

    if (error) alert(error.message)
    else alert('Profile Updated!')
    setLoading(false)
  }

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Artist Dashboard</h1>
      <div className="flex flex-col gap-4">
        <input 
          placeholder="Artist Name" 
          className="border p-2 rounded text-black"
          onChange={(e) => setName(e.target.value)} 
        />
        <textarea 
          placeholder="Your Bio" 
          className="border p-2 rounded h-32 text-black"
          onChange={(e) => setBio(e.target.value)} 
        />
        <button 
          onClick={handleUpdate}
          disabled={loading}
          className="bg-black text-white p-2 rounded font-bold hover:bg-gray-800"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  )
}