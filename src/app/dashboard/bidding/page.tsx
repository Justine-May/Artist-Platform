'use client'
import styles from '../../../components/bidding/Bidding.module.css';
export default function BiddingPage() {
  return (
    <div className={styles.contentPadding}>
      <h1 className={styles.pageTitle}>Live Bidding</h1>
      <div className={styles.card}>
        <p>No active auctions found. Start a new auction from your portfolio.</p>
      </div>
    </div>
  )
}