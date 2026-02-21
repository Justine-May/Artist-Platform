'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import styles from './Collector.module.css'
import { Gavel, Heart, Search, Filter } from 'lucide-react'
import Link from 'next/link'

export default function CollectorAtelier() {
  const [works, setWorks] = useState<any[]>([])

  useEffect(() => {
    const fetchExhibition = async () => {
      const { data } = await supabase
        .from('artworks')
        .select('*')
        .order('display_order', { ascending: true })
      setWorks(data || [])
    }
    fetchExhibition()
  }, [])

  return (
    <div className={styles.container}>
      {/* Curator's Header */}
      <header className={styles.exhibitionHeader}>
        <div className={styles.brand}>● ATELIER / EXHIBITION</div>
        <div className={styles.controls}>
          <Search size={18} strokeWidth={1.5} />
          <Filter size={18} strokeWidth={1.5} />
        </div>
      </header>

      {/* Hero Exhibition Text */}
      <section className={styles.hero}>
        <h1>FLORAL ANATOMY</h1>
        <p>A solo exhibition by Justine May Estacio</p>
      </section>

      {/* The Gallery Grid */}
      <div className={styles.galleryGrid}>
        {works.map((work) => (
          <Link href={`/collector/artwork/${work.id}`} key={work.id} className={styles.workCard}>
            <div className={styles.imageWrapper}>
              {/* Fallback if no image URL exists yet */}
              <div className={styles.placeholderImage}>IMAGE_LOADING</div>
              <div className={styles.overlay}>
                <button className={styles.bidIcon}><Gavel size={16} /></button>
              </div>
            </div>
            <div className={styles.workDetails}>
              <div className={styles.workTitleRow}>
                <h3>{work.title}</h3>
                <Heart size={14} className={styles.wishlist} />
              </div>
              <p className={styles.price}>
                {work.is_auction ? 'Current Bid: ' : 'Price: '}
                ${Number(work.price).toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}