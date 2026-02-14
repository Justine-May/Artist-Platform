'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import styles from './Portfolio.module.css'

export default function PortfolioView() {
  return (
    <div className={styles.portfolioWrapper}>
      <div className={styles.portfolioContent}>
         {/* Your Portfolio Header, Gallery, and About Section go here */}
         <h1 className={styles.portfolioTitle}>PORTFOLIO</h1>
         <p className={styles.meinLabel}>ATELIER VIEW</p>
      </div>
    </div>
  )
}