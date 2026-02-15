'use client'

import { useState, useEffect, useRef } from 'react'
import { Pencil, Check, Camera, Loader2 } from 'lucide-react'
import { supabase } from '@/src/lib/supabase'
import styles from './AboutSection.module.css'

interface AboutSectionProps {
  userId: string | null
}

export default function AboutSection({ userId }: AboutSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Content State
  const [text, setText] = useState("")
  const [statement, setStatement] = useState("") 
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!userId) return
    async function fetchAboutData() {
      const { data } = await supabase
        .from('profiles')
        .select('about_text, about_image_url, statement') 
        .eq('id', userId)
        .single()
      
      if (data) {
        setText(data.about_text || "A creative force exploring visual arts.")
        setStatement(data.statement || "ART IS NOT WHAT YOU SEE, BUT WHAT YOU MAKE OTHERS SEE.")
        setImageUrl(data.about_image_url || null)
      }
    }
    fetchAboutData()
  }, [userId])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    if (!userId) return
    setIsLoading(true)

    try {
      let finalImageUrl = imageUrl

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${userId}-about.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('profile-assets')
          .upload(filePath, imageFile, { upsert: true })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('profile-assets')
          .getPublicUrl(filePath)
        
        finalImageUrl = publicUrl
      }

      const { error: dbError } = await supabase
        .from('profiles')
        .update({
          about_text: text,
          statement: statement,
          about_image_url: finalImageUrl
        })
        .eq('id', userId)

      if (dbError) throw dbError

      setImageUrl(finalImageUrl)
      setImageFile(null)
      setPreviewUrl(null)
      setIsEditing(false)

    } catch (error) {
      console.error("Error saving about section:", error)
      alert("Failed to save changes.")
    } finally {
      setIsLoading(false)
    }
  }

  const currentDisplayImage = previewUrl || imageUrl || "https://placehold.co/800x1200/eee/999?text=Upload+Portrait"

  return (
    <section id="about" className={styles.sectionContainer}>
      
      {/* --- PART 1: SPLIT LAYOUT (Bio & Image) --- */}
      <div className={styles.splitLayout}>
        {/* Left: Image */}
        <div className={styles.imageSide} onClick={() => isEditing && fileInputRef.current?.click()}>
          <img src={currentDisplayImage} alt="About Portrait" className={styles.portraitImage} />
          {isEditing && (
            <div className={styles.imageUploadOverlay}>
              <Camera size={32} color="white" />
              <p>CHANGE PORTRAIT</p>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="image/*" />
            </div>
          )}
        </div>

        {/* Right: Bio Text */}
        <div className={styles.textSide}>
          <div className={styles.contentWrapper}>
            <div className={styles.headerRow}>
              <h2 className={styles.sectionTitle}>ABOUT THE ARTIST</h2>
              {userId && !isEditing && (
                <button onClick={() => setIsEditing(true)} className={styles.iconBtn}>
                  <Pencil size={18} />
                </button>
              )}
            </div>

            {isEditing ? (
              // --- EDIT MODE (Controls everything) ---
              <div className={styles.editForm}>
                <label className={styles.inputLabel}>BIO</label>
                <textarea 
                  className={styles.textArea} 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={8}
                  placeholder="Write your bio here..."
                />
                
                <label className={styles.inputLabel}>FULL SCREEN STATEMENT</label>
                <textarea 
                  className={styles.textArea}
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  rows={3}
                  placeholder="Your big statement..."
                />

                <div className={styles.formActions}>
                  <button onClick={() => { setIsEditing(false); setPreviewUrl(null); }} className={styles.cancelBtn}>
                    CANCEL
                  </button>
                  <button onClick={handleSave} className={styles.saveBtn} disabled={isLoading}>
                    {isLoading ? <Loader2 className={styles.spinner} size={14} /> : <Check size={14} />}
                    SAVE CHANGES
                  </button>
                </div>
              </div>
            ) : (
              // --- VIEW MODE (Just the Bio) ---
              <div className={styles.bioDisplay}>
                <p className={styles.bioText}>{text}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- PART 2: FULL WIDTH STATEMENT BANNER --- */}
      {!isEditing && (
        <div className={styles.statementBanner}>
          <div className={styles.statementContent}>
            <h3 className={styles.bigStatement}>"{statement}"</h3>
          </div>
        </div>
      )}

    </section>
  )
}