'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import styles from './BiddingPage.module.css'
import { Clock, ArrowUpRight, History, Loader2 } from 'lucide-react'

export default function BiddingSection() {
  const [artworks, setArtworks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Initial Fetch of Active Auctions
    const fetchAuctions = async () => {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('is_auction', true)
        .order('end_time', { ascending: true })

      if (error) console.error('Error fetching auctions:', error)
      else setArtworks(data || [])
      setLoading(false)
    }

    fetchAuctions()

    // 2. Real-Time Subscription
    const subscription = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'artworks' },
        (payload) => {
          setArtworks((current) =>
            current.map((art) => (art.id === payload.new.id ? payload.new : art))
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  if (loading) return (
    <div className={styles.loadingState}>
      <Loader2 className={styles.spin} size={20} />
      <span>SYNCING WITH ATELIER...</span>
    </div>
  )

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>LIVE AUCTIONS</h1>
          <p className={styles.subtitle}>Real-time bid monitoring for your collection.</p>
        </div>
        <div className={styles.liveIndicator}>
          <span className={styles.pulseDot}></span>
          LIVE DATABASE SYNC
        </div>
      </header>

      <div className={styles.grid}>
        <section className={styles.activeSection}>
          <h2 className={styles.sectionTitle}>CURRENT LISTINGS</h2>
          {artworks.length === 0 ? (
            <p className={styles.emptyMsg}>No active auctions found.</p>
          ) : (
            artworks.map((art) => (
              <div key={art.id} className={styles.bidCard}>
                <div className={styles.bidInfo}>
                  <h3>{art.title || 'Untitled Work'}</h3>
                  <div className={styles.meta}>
                    <Clock size={12} /> 
                    <span>Ends: {new Date(art.end_time).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className={styles.priceInfo}>
                  <span className={styles.priceLabel}>CURRENT BID</span>
                  <span className={styles.priceValue}>${Number(art.price).toLocaleString()}</span>
                </div>
                <button className={styles.actionBtn}>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            ))
          )}
        </section>

        <aside className={styles.historySection}>
          <h2 className={styles.sectionTitle}>STUDIO STATS</h2>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>TOTAL VALUATION</span>
            <span className={styles.statValue}>
              ${artworks.reduce((acc, art) => acc + Number(art.price), 0).toLocaleString()}
            </span>
          </div>
        </aside>
      </div>
    </div>
  )
}