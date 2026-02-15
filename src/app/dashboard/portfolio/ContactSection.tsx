'use client'

import { useState, useEffect } from 'react'
import { Pencil, Check, Loader2, Instagram, Linkedin, Twitter, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react'
import { supabase } from '@/src/lib/supabase'
import styles from './ContactSection.module.css'

interface ContactSectionProps {
  userId: string | null
}

export default function ContactSection({ userId }: ContactSectionProps) {
  // Profile Content States
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [email, setEmail] = useState("")
  const [instagram, setInstagram] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [twitter, setTwitter] = useState("")
  const [location, setLocation] = useState("")
  const [availability, setAvailability] = useState("")

  // Form Submission State
  const [status, setStatus] = useState<'IDLE' | 'SENDING' | 'SUCCESS' | 'ERROR'>('IDLE')

  useEffect(() => {
    if (!userId) return
    async function fetchData() {
      const { data } = await supabase
        .from('profiles')
        .select('contact_email, social_instagram, social_linkedin, social_twitter, artist_location, availability') 
        .eq('id', userId)
        .single()
      
      if (data) {
        setEmail(data.contact_email || "hello@studio.com")
        setInstagram(data.social_instagram || "")
        setLinkedin(data.social_linkedin || "")
        setTwitter(data.social_twitter || "")
        setLocation(data.artist_location || "Binangonan, Rizal")
        setAvailability(data.availability || "Open for Commissions")
      }
    }
    fetchData()
  }, [userId])

  const handleSaveProfile = async () => {
    if (!userId) return
    setIsSaving(true)
    const { error } = await supabase.from('profiles').update({
      contact_email: email,
      social_instagram: instagram,
      social_linkedin: linkedin,
      social_twitter: twitter,
      artist_location: location,
      availability: availability
    }).eq('id', userId)
    
    setIsSaving(false)
    if (!error) setIsEditing(false)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('SENDING')
    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const response = await fetch(`https://formspree.io/f/mdalgpkb`, { 
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })
      if (response.ok) {
        setStatus('SUCCESS')
        form.reset()
      } else {
        setStatus('ERROR')
      }
    } catch {
      setStatus('ERROR')
    }
  }

  return (
    <section id="contact" className={styles.contactSection}>
      <div className={styles.container}>
        <h1 className={styles.mainTitle}>Contact me</h1>

        <div className={styles.grid}>
          {/* LEFT: INFO */}
          <div className={styles.infoCol}>
            <div className={styles.infoItem}>
              <p className={styles.labelTitle}>Location</p>
              <p className={styles.labelValue}>{location}</p>
            </div>
            <div className={styles.infoItem}>
              <p className={styles.labelTitle}>Availability</p>
              <p className={styles.labelValue}>{availability}</p>
            </div>
            {userId && !isEditing && (
              <button onClick={() => setIsEditing(true)} className={styles.editBtn}>
                <Pencil size={12} /> EDIT INFO
              </button>
            )}
          </div>

          {/* RIGHT: FORM */}
          <div className={styles.formCol}>
            {isEditing ? (
              <div className={styles.editForm}>
                <div className={styles.inputGroup}><label>Location</label><input value={location} onChange={(e) => setLocation(e.target.value)} className={styles.formInput} /></div>
                <div className={styles.inputGroup}><label>Availability</label><input value={availability} onChange={(e) => setAvailability(e.target.value)} className={styles.formInput} /></div>
                <div className={styles.inputGroup}><label>Email</label><input value={email} onChange={(e) => setEmail(e.target.value)} className={styles.formInput} /></div>
                <div className={styles.inputGroup}><label>Instagram URL</label><input value={instagram} onChange={(e) => setInstagram(e.target.value)} className={styles.formInput} /></div>
                <div className={styles.inputGroup}><label>LinkedIn URL</label><input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className={styles.formInput} /></div>
                <div className={styles.inputGroup}><label>Twitter/X URL</label><input value={twitter} onChange={(e) => setTwitter(e.target.value)} className={styles.formInput} /></div>
                
                <div className={styles.formActions}>
                  <button onClick={handleSaveProfile} className={styles.saveBtn} disabled={isSaving}>
                    {isSaving ? <Loader2 className={styles.spinner} size={14}/> : <Check size={14}/>} SAVE
                  </button>
                  <button onClick={() => setIsEditing(false)} className={styles.cancelBtn}>CANCEL</button>
                </div>
              </div>
            ) : status === 'SUCCESS' ? (
              <div className={styles.statusMessage}><CheckCircle2 size={40} /><h2>Sent</h2><button onClick={() => setStatus('IDLE')} className={styles.submitBtn}>Again</button></div>
            ) : (
              <form className={styles.actualForm} onSubmit={handleSubmit}>
                <div className={styles.formRow}>
                  <div className={styles.inputGroup}><label>First Name</label><input name="firstName" className={styles.formInput} required /></div>
                  <div className={styles.inputGroup}><label>Last Name</label><input name="lastName" className={styles.formInput} /></div>
                </div>
                <div className={styles.inputGroup}><label>Email (required)</label><input type="email" name="email" className={styles.formInput} required /></div>
                <div className={styles.inputGroup}><label>Project description</label><textarea name="message" className={styles.formTextarea} rows={3} required></textarea></div>
                <button type="submit" className={styles.submitBtn} disabled={status === 'SENDING'}>Submit</button>
              </form>
            )}
          </div>
        </div>

        {/* CENTERED EMAIL & SOCIALS */}
        <div className={styles.bigFooter}>
          <div className={styles.emailWrapper}>
            <a href={`mailto:${email}`} className={styles.boldEmail}>{email}</a>
          </div>
          
          <div className={styles.socialRow}>
            {instagram && <a href={instagram} target="_blank" className={styles.socialLink}><Instagram size={24} /></a>}
            {linkedin && <a href={linkedin} target="_blank" className={styles.socialLink}><Linkedin size={24} /></a>}
            {twitter && <a href={twitter} target="_blank" className={styles.socialLink}><Twitter size={24} /></a>}
          </div>
        </div>

        <div className={styles.subFooter}>
          <p className={styles.smallText}>&copy; {new Date().getFullYear()} Atelier Portfolio</p>
          <p className={styles.smallText}>Project Ligaya</p>
        </div>
      </div>
    </section>
  )
}