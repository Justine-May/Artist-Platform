'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/src/lib/supabase'
import { Gavel, Clock, ArrowUpRight } from 'lucide-react'
import styles from './BiddingModule.module.css'

export default function BiddingModule({ artworkId, startPrice }: any) {
  const [currentBid, setCurrentBid] = useState(startPrice)
  const [bidAmount, setBidAmount] = useState(startPrice + 10)
  const [isLosing, setIsLosing] = useState(false)

  useEffect(() => {
    // Subscribe to real-time updates for this artwork's bid
    const channel = supabase
      .channel(`bid-${artworkId}`)
      .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'auctions', 
          filter: `artwork_id=eq.${artworkId}` 
      }, (payload) => {
        setCurrentBid(payload.new.current_bid)
        setBidAmount(payload.new.current_bid + 10)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [artworkId])

  const placeBid = async () => {
    // Logic to update Supabase 'auctions' table
    const { error } = await supabase
      .from('auctions')
      .update({ current_bid: bidAmount, bid_count: 5 }) // bid_count would be dynamic
      .eq('artwork_id', artworkId)
    
    if (error) alert("Bid too low!")
  }

  return (
    <div className={styles.biddingContainer}>
      <div className={styles.bidHeader}>
        <span className={styles.liveTag}><div className={styles.dot} /> LIVE AUCTION</span>
        <span className={styles.timer}><Clock size={12} /> 22h : 14m : 05s</span>
      </div>

      <div className={styles.priceRow}>
        <div className={styles.priceItem}>
          <p className={styles.label}>Current Bid</p>
          <h2 className={styles.amount}>${currentBid.toLocaleString()}</h2>
        </div>
        <div className={styles.priceItem}>
          <p className={styles.label}>Reserve Price</p>
          <p className={styles.value}>Met</p>
        </div>
      </div>

      <div className={styles.inputWrapper}>
        <input 
          type="number" 
          value={bidAmount} 
          onChange={(e) => setBidAmount(Number(e.target.value))}
          className={styles.bidInput}
        />
        <button onClick={placeBid} className={styles.bidBtn}>
          PLACE BID <Gavel size={14} />
        </button>
      </div>
      
      <p className={styles.finePrint}>Minimum increment: $10.00</p>
    </div>
  )
}