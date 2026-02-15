'use client'

import { useState, useEffect } from 'react'
import { Pencil, Check, Loader2, Instagram, Linkedin, Twitter } from 'lucide-react'
import { supabase } from '@/src/lib/supabase'
import styles from './ContactSection.module.css'

interface ContactSectionProps {
  userId: string | null
}

export default function ContactSection({ userId }: ContactSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [email, setEmail] = useState("")
  const [instagram, setInstagram] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [twitter, setTwitter] = useState("")

  useEffect(() => {
    if (!userId) return
    async function fetchData() {
      const { data } = await supabase
        .from('profiles')
        .select('contact_email, social_instagram, social_linkedin, social_twitter') 
        .eq('id', userId)
        .single()
      
      if (data) {
        setEmail(data.contact_email || "contact@studio.com")
        setInstagram(data.social_instagram || "")
        setLinkedin(data.social_linkedin || "")
        setTwitter(data.social_twitter || "")
      }
    }
    fetchData()
  }, [userId])

  const handleSave = async () => {
    if (!userId) return
    setIsLoading(true)
    const { error } = await supabase.from('profiles').update({
      contact_email: email,
      social_instagram: instagram,
      social_linkedin: linkedin,
      social_twitter: twitter
    }).eq('id', userId)
    setIsLoading(false)
    if (!error) setIsEditing(false)
  }

  return (
    <section id="contact" className={styles.contactSection}>
      <div className={styles.container}>
        <h1 className={styles.mainTitle}>Contact me</h1>

        <div className={styles.grid}>
          {/* LEFT COLUMN: INFO */}
          <div className={styles.infoCol}>
            <div className={styles.locationBlock}>
              <p className={styles.label}>Manhattan, New York</p>
              <p className={styles.label}>2026</p>
            </div>

            <div className={styles.hoursBlock}>
              <p className={styles.label}>Office hours</p>
              <p className={styles.label}>Monday - Friday</p>
              <p className={styles.label}>11 AM - 2 PM</p>
            </div>

            {userId && !isEditing && (
              <button onClick={() => setIsEditing(true)} className={styles.editBtn}>
                <Pencil size={14} /> EDIT CONTACT DETAILS
              </button>
            )}
          </div>

          {/* RIGHT COLUMN: FORM OR EDIT BOX */}
          <div className={styles.formCol}>
            {isEditing ? (
              <div className={styles.editForm}>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={styles.formInput} />
                <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram URL" className={styles.formInput} />
                <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn URL" className={styles.formInput} />
                <div className={styles.formActions}>
                  <button onClick={handleSave} className={styles.saveBtn}>
                    {isLoading ? <Loader2 className={styles.spinner} size={16} /> : "SAVE"}
                  </button>
                  <button onClick={() => setIsEditing(false)} className={styles.cancelBtn}>CANCEL</button>
                </div>
              </div>
            ) : (
              <form className={styles.actualForm} onSubmit={(e) => e.preventDefault()}>
                <div className={styles.formRow}>
                  <div className={styles.inputGroup}>
                    <label>First Name</label>
                    <input type="text" className={styles.formInput} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Last Name</label>
                    <input type="text" className={styles.formInput} />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label>Email (required)</label>
                  <input type="email" className={styles.formInput} required />
                </div>
                <div className={styles.inputGroup}>
                  <label>Project description</label>
                  <textarea className={styles.formTextarea} rows={3}></textarea>
                </div>
                <button type="submit" className={styles.submitBtn}>Submit</button>
              </form>
            )}
          </div>
        </div>

        {/* BOTTOM SECTION: BOLD CONTACTS */}
        <div className={styles.footerContact}>
          <div className={styles.contactItem}>
            <a href={`mailto:${email}`} className={styles.boldLink}>{email}</a>
          </div>
          <div className={styles.contactItem}>
             <p className={styles.boldLink}>(+48) 762 864 075</p>
          </div>
        </div>

        {/* SUB FOOTER: SOCIALS */}
        <div className={styles.subFooter}>
          <div className={styles.subLeft}>
            <p className={styles.smallText}>&copy; 2026 Portfolio Atelier</p>
          </div>
          <div className={styles.subRight}>
            <div className={styles.socialLinks}>
              {instagram && <a href={instagram} target="_blank">Instagram</a>}
              {linkedin && <a href={linkedin} target="_blank">LinkedIn</a>}
              <a href="#">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}