'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/src/lib/supabase'
import styles from './Upload.module.css'
import { Gavel, Tag, Plus, Loader2, DollarSign, TrendingUp, CheckCircle2, Calendar, Upload, X } from 'lucide-react'

export default function UploadArtwork() {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [title, setTitle] = useState('')
  const [medium, setMedium] = useState('')
  const [dimensions, setDimensions] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  
  const [isBidding, setIsBidding] = useState(false)
  const [isSale, setIsSale] = useState(false)
  
  const [price, setPrice] = useState('') 
  const [increment, setIncrement] = useState('10') 
  const [endDate, setEndDate] = useState('') 

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
    }
    getUser()
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fileName = `${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('artworks').upload(fileName, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('artworks').getPublicUrl(fileName)
      setImageUrl(data.publicUrl)
    } catch (error: any) {
      alert("Upload failed: " + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageUrl) return alert("Please upload an image.")
    if (!userId) return alert("Please log in.")
    if (isBidding && !endDate) return alert("Please set an auction end date.")
    
    setLoading(true)
    const payload = {
      user_id: userId,
      title,
      medium,
      dimensions,
      description,
      image_url: imageUrl,
      is_auction: isBidding,
      is_for_sale: isSale,
      price: parseFloat(price) || 0,
      bid_increment: isBidding ? parseFloat(increment) : null,
      end_time: isBidding && endDate ? new Date(endDate).toISOString() : null,
      display_order: 0 
    }

    const { error } = await supabase.from('artworks').insert([payload])
    if (error) {
      alert(`Error: ${error.message}`)
    } else {
      alert("Artwork Published!")
      setTitle(''); setMedium(''); setDimensions(''); setDescription(''); setImageUrl('');
      setIsBidding(false); setIsSale(false); setEndDate(''); setPrice(''); setIncrement('10');
    }
    setLoading(false)
  }

  return (
    <div className={styles.uploadBox}>
      <form onSubmit={handleUpload}>
        <div className={styles.uploadZone} onClick={() => fileInputRef.current?.click()}>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{display: 'none'}} />
          {imageUrl ? (
            <img src={imageUrl} alt="Preview" className={styles.previewImage} />
          ) : (
            <div className={styles.placeholder}>
              {uploading ? <Loader2 className={styles.spin} /> : <Upload size={24} />}
              <span>{uploading ? 'Uploading...' : 'Click to upload artwork'}</span>
            </div>
          )}
        </div>

        <div className={styles.mainFields}>
          <input className={styles.input} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input className={styles.input} placeholder="Medium" value={medium} onChange={(e) => setMedium(e.target.value)} />
          <input className={styles.input} placeholder="Dimensions" value={dimensions} onChange={(e) => setDimensions(e.target.value)} />
          <textarea className={styles.textarea} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>

        <div className={styles.decisionArea}>
          <button type="button" className={`${styles.toggleBtn} ${isSale ? styles.saleActive : ''}`} onClick={() => setIsSale(!isSale)}>
            <Tag size={14} /> FOR SALE
          </button>
          <button type="button" className={`${styles.toggleBtn} ${isBidding ? styles.biddingActive : ''}`} onClick={() => setIsBidding(!isBidding)}>
            <Gavel size={14} /> BIDDING
          </button>
        </div>

        {/* --- REBUILT PRICING SECTION --- */}
        {(isSale || isBidding) && (
          <div className={styles.pricingWrapper}>
            <div className={styles.row}>
              <div className={styles.fieldItem}>
                 <label className={styles.label}>{isBidding ? 'START BID' : 'FIXED PRICE'}</label>
                 <div className={styles.inputWithIcon}>
                   <DollarSign size={14} className={styles.fieldIcon} />
                   <input type="number" className={styles.numInput} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
                 </div>
              </div>

              {/* Explicit Bidding Fields */}
              {isBidding && (
                <>
                  <div className={styles.fieldItem}>
                     <label className={styles.label}>INCREMENT</label>
                     <div className={styles.inputWithIcon}>
                       <TrendingUp size={14} className={styles.fieldIcon} />
                       <input type="number" className={styles.numInput} value={increment} onChange={(e) => setIncrement(e.target.value)} />
                     </div>
                  </div>
                  <div className={styles.fieldItem}>
                     <label className={styles.label}>ENDS ON</label>
                     <div className={styles.inputWithIcon}>
                       <Calendar size={14} className={styles.fieldIcon} />
                       <input type="datetime-local" className={styles.numInput} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                     </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <button type="submit" className={styles.submitBtn} disabled={loading || uploading}>
          {loading ? <Loader2 className={styles.spin} /> : <Plus size={16} />} 
          PUBLISH TO PORTFOLIO
        </button>
      </form>
    </div>
  )
}