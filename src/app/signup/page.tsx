'use client'

import { ChangeEvent, FormEvent, useState } from 'react'
import { supabase } from '../../lib/supabase' // Ensure this path matches your lib folder
import Link from 'next/link'
import styles from './Signup.module.css' // IMPORT YOUR CSS HERE

// Interfaces for Type Safety
interface Exhibit {
  title: string;
  gallery: string;
  location: string;
}

interface ArtistFormData {
  artistName: string;
  email: string;
  password: string;
  bio: string;
  statement: string;
  exhibits: Exhibit[];
  profilePic: File | null;
  sampleArtwork: File | null;
}

export default function SignUp() {
  const [step, setStep] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)
  
  const [formData, setFormData] = useState<ArtistFormData>({
    artistName: '',
    email: '',
    password: '',
    bio: '',
    statement: '',
    exhibits: [{ title: '', gallery: '', location: '' }],
    profilePic: null,
    sampleArtwork: null
  })

  // --- Logic Functions ---

  const nextStep = () => setStep(prev => prev + 1)
  const prevStep = () => setStep(prev => prev - 1)

  const addExhibit = () => {
    setFormData({
      ...formData,
      exhibits: [...formData.exhibits, { title: '', gallery: '', location: '' }]
    })
  }

  const updateExhibit = (index: number, field: keyof Exhibit, value: string) => {
    const updated = [...formData.exhibits]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, exhibits: updated })
  }

  const deleteExhibit = (index: number) => {
    if (formData.exhibits.length > 1) {
      setFormData({
        ...formData,
        exhibits: formData.exhibits.filter((_, i) => i !== index)
      })
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, field: 'profilePic' | 'sampleArtwork') => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, [field]: e.target.files[0] })
    }
  }

  const isStep3Complete = formData.exhibits.length >= 5 && 
    formData.exhibits.every(ex => ex.title.trim() !== '' && ex.gallery.trim() !== '' && ex.location.trim() !== '');

  // --- Final Submit to Supabase ---

  const handleFinalSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.artistName,
            bio: formData.bio,
            artist_statement: formData.statement,
            exhibit_history: formData.exhibits
          }
        }
      })

      if (authError) throw authError

      // 2. Upload Images if they exist (requires a 'profiles' bucket in Supabase)
      if (authData.user) {
        const userId = authData.user.id
        
        if (formData.profilePic) {
          await supabase.storage.from('profiles').upload(`${userId}/avatar`, formData.profilePic)
        }
        if (formData.sampleArtwork) {
          await supabase.storage.from('profiles').upload(`${userId}/sample-artwork`, formData.sampleArtwork)
        }
      }

      alert('Registration successful! Please check your email to verify your account.')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.mainWrapper}>
      {/* LEFT: Fixed Illustration */}
      <section className={styles.leftSection}>
        <img src="/artist1.svg" className={styles.illustration} alt="Art Studio" />
        <div className={styles.leftContent}>
          <h2 className={styles.leftTitle}>CONNECTED TO ART</h2>
          <h1 className={styles.leftSubtitle}>MY HOBBY, MY PASSION</h1>
        </div>
      </section>

      {/* RIGHT: Multi-Step Form */}
      <section className={styles.rightSection}>
        <div className={styles.topNav}>
          Already a member? <Link href="/login">Sign In</Link>
        </div>

        <div className={styles.formWrapper}>
          <div className={styles.stepIndicator}>Step {step} of 4</div>
          
          <h1 className={styles.title}>
            {step === 1 && "Join Artist Platform"}
            {step === 2 && "Tell us about your art"}
            {step === 3 && "Exhibition History"}
            {step === 4 && "Final Touches"}
          </h1>

          <form onSubmit={step === 4 ? handleFinalSubmit : (e) => e.preventDefault()}>
            
            {/* STEP 1: Basic Credentials */}
            {step === 1 && (
              <div className={styles.formStep}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Name</label>
                  <input type="text" className={styles.inputField} value={formData.artistName} onChange={(e) => setFormData({...formData, artistName: e.target.value})} required />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Email</label>
                  <input type="email" className={styles.inputField} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Password</label>
                  <input type="password" placeholder="6+ characters" className={styles.inputField} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                </div>
                <button type="button" onClick={nextStep} className={styles.submitButton}>Continue</button>
              </div>
            )}

            {/* STEP 2: Bio & Statement */}
            {step === 2 && (
              <div className={styles.formStep}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Brief artist bio</label>
                  <textarea rows={3} className={styles.textArea} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Artist Statement</label>
                  <textarea rows={3} className={styles.textArea} value={formData.statement} onChange={(e) => setFormData({...formData, statement: e.target.value})} />
                </div>
                <div className={styles.buttonRow}>
                  <button type="button" onClick={prevStep} className={styles.secondaryButton}>Back</button>
                  <button type="button" onClick={nextStep} className={styles.submitButton}>Continue</button>
                </div>
              </div>
            )}

            {/* STEP 3: Exhibits (Gatekeeper) */}
            {step === 3 && (
              <div className={styles.formStep}>
                <div className={styles.requirementHeader}>
                  <p className={styles.label}>Previous Exhibitions</p>
                  <span className={formData.exhibits.length >= 5 ? styles.countSuccess : styles.countPending}>
                    {formData.exhibits.length}/5 Min.
                  </span>
                </div>
                
                <div className={styles.scrollArea}>
                  {formData.exhibits.map((ex, index) => (
                    <div key={index} className={styles.exhibitCard}>
                      <div className={styles.cardHeader}>
                        <span>Exhibit #{index + 1}</span>
                        {formData.exhibits.length > 1 && (
                          <button type="button" onClick={() => deleteExhibit(index)} className={styles.deleteLink}>Remove</button>
                        )}
                      </div>
                      <input type="text" placeholder="Exhibit Title" className={styles.inputField} value={ex.title} onChange={(e) => updateExhibit(index, 'title', e.target.value)} required />
                      <div className={styles.inputRow}>
                        <input type="text" placeholder="Gallery" className={styles.inputField} value={ex.gallery} onChange={(e) => updateExhibit(index, 'gallery', e.target.value)} required />
                        <input type="text" placeholder="Location" className={styles.inputField} value={ex.location} onChange={(e) => updateExhibit(index, 'location', e.target.value)} required />
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addExhibit} className={styles.addBtn}>+ Add Another</button>
                <div className={styles.buttonRow}>
                  <button type="button" onClick={prevStep} className={styles.secondaryButton}>Back</button>
                  <button type="button" onClick={nextStep} disabled={!isStep3Complete} className={isStep3Complete ? styles.submitButton : styles.disabledButton}>
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Media Upload */}
            {step === 4 && (
              <div className={styles.formStep}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Artist Profile Photo</label>
                  <div className={styles.fileBox}>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'profilePic')} />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Sample Artwork</label>
                  <div className={styles.fileBox}>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'sampleArtwork')} />
                  </div>
                </div>
                <div className={styles.buttonRow}>
                  <button type="button" onClick={prevStep} className={styles.secondaryButton}>Back</button>
                  <button type="submit" disabled={loading} className={styles.submitButton}>
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </div>
            )}

          </form>
        </div>
      </section>
    </div>
  )
}