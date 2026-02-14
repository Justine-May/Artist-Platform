'use client'

import { useState, useRef } from 'react'
import { Upload, Camera, Loader2 } from 'lucide-react'
import styles from './Upload.module.css'
import { supabase } from '@/src/lib/supabase'

export default function UploadPage() {
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  const [title, setTitle] = useState('')
  const [medium, setMedium] = useState('')
  const [dimensions, setDimensions] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
    }
  }

  const handlePublish = async () => {
    if (!file || !title) {
      alert('Please select an image and provide a title.')
      return
    }

    setIsUploading(true)

    try {
      // 1. Get the current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error("You must be logged in to publish.")

      // 2. Upload Image to Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `artworks/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 3. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath)

      // 4. Insert into Database with user_id (Crucial for RLS)
      const { error: dbError } = await supabase
        .from('artworks')
        .insert([{
          title,
          medium,
          dimensions,
          image_url: publicUrl,
          user_id: user.id // The database needs this to satisfy security policies
        }])

      if (dbError) throw dbError

      alert('Success! Your artwork is now in the Atelier.')
      
      // Reset Form
      setPreview(null)
      setFile(null)
      setTitle('')
      setMedium('')
      setDimensions('')

    } catch (error: any) {
      console.error('Publishing failed:', error.message)
      alert(`Error: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Publish Artwork</h1>
      </header>

      <div className={styles.grid}>
        <div className={styles.dropZone} onClick={() => fileInputRef.current?.click()}>
          {preview ? (
            <img src={preview} className={styles.previewImage} alt="Preview" />
          ) : (
            <div style={{ textAlign: 'center', color: '#888' }}>
              <Camera size={40} strokeWidth={1} />
              <p style={{ marginTop: '10px', fontSize: '12px', letterSpacing: '1px' }}>CLICK TO UPLOAD</p>
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFile} hidden accept="image/*" />
        </div>

        <div className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Artwork Title</label>
            <input 
              type="text" 
              className={styles.inputUnderline} 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Abstract No. 5" 
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Medium</label>
            <input 
              type="text" 
              className={styles.inputUnderline} 
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              placeholder="Oil on Canvas" 
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Dimensions</label>
            <input 
              type="text" 
              className={styles.inputUnderline} 
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              placeholder="100 x 120 cm" 
            />
          </div>
          
          <button 
            className={styles.submitBtn} 
            onClick={handlePublish}
            disabled={isUploading}
          >
            {isUploading ? 'Publishing...' : 'Publish to Atelier'}
          </button>
        </div>
      </div>
    </div>
  )
}