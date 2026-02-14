'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import styles from '../../../components/portfolio/Portfolio.module.css'

export default function PortfolioPage() {
  const [artworks, setArtworks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<string>('')

  useEffect(() => {
    async function fetchArtworks() {
      try {
        console.log("Checking Supabase connection...")
        const { data, error } = await supabase
          .from('artworks')
          .select('*')

        if (error) {
          setDebugInfo(`Supabase Error: ${error.message}`)
          throw error
        }

        console.log("Raw Data Received:", data)
        setArtworks(data || [])
        
        if (data && data.length === 0) {
          setDebugInfo("Connected to Supabase, but the 'artworks' table is empty.")
        }
      } catch (err: any) {
        setDebugInfo(`Fetch Error: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchArtworks()
  }, [])

  return (
    <div className={styles.wrapper}>
      {/* --- DEBUG OVERLAY: Delete this once fixed --- */}

      <h1 className={styles.title}>Atelier</h1>
      
      <div className={styles.galleryGrid}>
        {artworks.map((art) => (
          <div key={art.id} className={styles.artCard}>
            {/* If the URL is wrong, this prints the bad URL text */}
            {!art.image_url && <p style={{color: 'red'}}>Error: image_url is missing in database!</p>}
            
            <div className={styles.imageWrapper}>
              <img 
                src={art.image_url} 
                alt={art.title} 
                className={styles.artImage}
                onLoad={() => console.log(`Loaded: ${art.title}`)}
                onError={(e) => console.error(`Failed to load image at: ${art.image_url}`)}
              />
            </div>
            <div className={styles.artInfo}>
              <h3>{art.title}</h3>
              <p>{art.medium}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}