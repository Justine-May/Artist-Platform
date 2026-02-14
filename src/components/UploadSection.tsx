'use client'

import { useState, ChangeEvent, FormEvent } from 'react'
import { supabase } from '../lib/supabase' 
import styles from '../app/dashboard/Dashboard.module.css'

export default function UploadSection() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [uploading, setUploading] = useState(false)

  // 1. Handle image selection and local preview
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)

      // Instant preview using FileReader
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  // 2. Handle the Upload Logic
  const handleUpload = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!file || !title) {
      alert('Please provide both a title and an artwork image.')
      return
    }

    setUploading(true)

    try {
      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be logged in to upload artwork.')

      /* SANitization Logic:
         Removes emojis/special characters that cause "Invalid Key" errors.
      */
      const cleanFileName = file.name
        .replace(/[^\x00-\x7F]/g, "") // Remove non-ASCII (emojis)
        .replace(/\s+/g, "-")         // Replace spaces with hyphens
        .toLowerCase()

      const filePath = `${user.id}/${Date.now()}-${cleanFileName}`

      // A. Upload file to Supabase Storage 'artworks' bucket
      const { data: storageData, error: storageError } = await supabase.storage
        .from('artworks')
        .upload(filePath, file)

      if (storageError) throw storageError

      // B. Insert metadata into the 'artworks' database table
      const { error: dbError } = await supabase
        .from('artworks')
        .insert({
          user_id: user.id,
          title: title,
          image_url: filePath,
          artist_name: user.user_metadata.full_name || 'Anonymous Artist'
        })

      if (dbError) throw dbError

      alert('Successfully published to your portfolio!')
      
      // Reset form
      setFile(null)
      setPreviewUrl(null)
      setTitle('')
      
    } catch (error: any) {
      console.error('Upload error:', error)
      alert(`Upload failed: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={styles.uploadContainer}>
      <div className={styles.uploadCard}>
        <header className={styles.uploadHeader}>
          <h2 className={styles.sideTitle}>Publish New Artwork</h2>
          <p className={styles.helperText}>Share your latest creation with the community.</p>
        </header>

        <form onSubmit={handleUpload} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Artwork Title</label>
            <input 
              type="text" 
              placeholder="e.g., Floral Anatomy #1" 
              className={styles.inputField}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Artwork File</label>
            <div 
              className={styles.dropZone}
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              {previewUrl ? (
                <img src={previewUrl} className={styles.previewImage} alt="Preview" />
              ) : (
                <div className={styles.dropZonePlaceholder}>
                  <span className={styles.uploadIcon}>↑</span>
                  <p>Click to upload image</p>
                  <span className={styles.fileTypes}>JPG, PNG or WebP</span>
                </div>
              )}
              <input 
                id="fileInput"
                type="file" 
                accept="image/*" 
                className={styles.fileInputHidden} 
                onChange={handleFileChange} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={uploading} 
            className={styles.submitButton}
          >
            {uploading ? 'Processing...' : 'Publish to Portfolio'}
          </button>
        </form>
      </div>
    </div>
  )
}