'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import styles from '../../../components/portfolio/Portfolio.module.css'
import { Check, Pencil, X } from 'lucide-react'
import AboutSection from './AboutSection'
import ContactSection from './ContactSection'

export default function PortfolioPage() {
  const [artworks, setArtworks] = useState<any[]>([])
  const [filteredArtworks, setFilteredArtworks] = useState<any[]>([])
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [activeFilter, setActiveFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [heroArt, setHeroArt] = useState<any | null>(null)
  
  // --- PROFILE STATE ---
  const [artistName, setArtistName] = useState<string>("") 
  const [artistStatement, setArtistStatement] = useState<string>("") 
  const [isEditingStatement, setIsEditingStatement] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserId(user.id)
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, statement')
            .eq('id', user.id)
            .single()

          if (profile) {
            setArtistName(profile.full_name || "ATELIER ARTIST")
            setArtistStatement(profile.statement || "ART IS NOT WHAT YOU SEE, BUT WHAT YOU MAKE OTHERS SEE.")
          } else {
            const metaName = user.user_metadata?.full_name || "ATELIER ARTIST"
            setArtistName(metaName)
            setArtistStatement("Click here to add your Artist Statement.")
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }

      const { data: arts } = await supabase.from('artworks').select('*').order('created_at', { ascending: false })
      setArtworks(arts || [])
      setFilteredArtworks(arts || [])
      if (arts && arts.length > 0) setHeroArt(arts[0])
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleSaveStatement = async () => {
    if (!userId) return
    const { error } = await supabase.from('profiles').update({ statement: artistStatement }).eq('id', userId)
    if (!error) setIsEditingStatement(false)
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // --- HELPERS ---
  useEffect(() => {
    if (activeFilter === 'All') setFilteredArtworks(artworks)
    else setFilteredArtworks(artworks.filter(art => art.medium === activeFilter))
  }, [activeFilter, artworks])

  const categories = ['All', ...new Set(artworks.map(art => art.medium).filter(Boolean))]

  const showNext = useCallback(() => {
    if (selectedIdx !== null) setSelectedIdx((selectedIdx + 1) % filteredArtworks.length)
  }, [selectedIdx, filteredArtworks])

  const getSideThumbnails = () => {
    if (selectedIdx === null) return []
    const t1 = filteredArtworks[(selectedIdx + 1) % filteredArtworks.length]
    const t2 = filteredArtworks[(selectedIdx + 2) % filteredArtworks.length]
    const t3 = filteredArtworks[(selectedIdx + 3) % filteredArtworks.length]
    return [t1, t2, t3].filter(Boolean)
  }

  const currentArt = selectedIdx !== null ? filteredArtworks[selectedIdx] : null
  const sideThumbs = getSideThumbnails()

  if (loading) return <div className={styles.loading}>LOADING ATELIER...</div>

  return (
    <div className={styles.wrapper}>
      {/* --- MODAL --- */}
      {currentArt && (
        <div className={styles.modalOverlay} onClick={() => setSelectedIdx(null)}>
          <div className={styles.editorialModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.colLeft}>
              <img src={currentArt.image_url} alt={currentArt.title} className={styles.modalMainImage} />
            </div>
            <div className={styles.colCenter}>
              <div className={styles.centerContent}>
                <h1 className={styles.bigNumber}>{String(selectedIdx! + 1).padStart(2, '0')}/</h1>
                <h2 className={styles.modalCategory}>{currentArt.medium || 'ARTWORK'}</h2>
                <div className={styles.modalDesc}>
                  <p>{currentArt.description ? currentArt.description : "No description provided."}</p>
                </div>
                <div className={styles.modalMeta}>
                  <span><strong>Title:</strong> {currentArt.title}</span><br/>
                  <span><strong>Dimensions:</strong> {currentArt.dimensions}</span>
                </div>
              </div>
              <button className={styles.closeBtnText} onClick={() => setSelectedIdx(null)}>
                CLOSE <X size={14} style={{marginLeft: 5}}/>
              </button>
            </div>
            <div className={styles.colRight}>
              {sideThumbs.map((thumb, i) => (
                <div key={thumb.id || i} className={styles.sideThumbItem} onClick={() => setSelectedIdx((selectedIdx! + 1 + i) % filteredArtworks.length)}>
                  <img src={thumb.image_url} alt={thumb.title} className={styles.sideThumbImage} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className={styles.centeredHeader}>
        <h1 className={styles.headerArtistName}>{artistName}</h1>
        <nav className={styles.centeredNavBar}>
          <button onClick={() => scrollToSection('hero')} className={styles.navLink}>HOME</button>
          <button onClick={() => scrollToSection('gallery')} className={styles.navLink}>GALLERY</button>
          <button onClick={() => scrollToSection('about')} className={styles.navLink}>ABOUT</button>
          <button onClick={() => scrollToSection('contact')} className={styles.navLink}>CONTACT</button>
        </nav>
      </header>

      {/* --- HERO SECTION --- */}
      <div id="hero">
        {heroArt && (
          <section className={styles.heroSectionNew}>
            <img src={heroArt.image_url} alt={heroArt.title} className={styles.heroImageNew} />
            
            <div className={styles.heroDynamicOverlay}>
              <div className={styles.heroLeftContent}>
                 <p className={styles.heroArtworkTitle}>{heroArt.title} — {heroArt.medium}</p>
              </div>
              <div className={styles.heroRightContent}>
                 {isEditingStatement ? (
                   <div className={styles.editContainer}>
                     <textarea 
                       className={styles.statementInput}
                       value={artistStatement}
                       onChange={(e) => setArtistStatement(e.target.value)}
                       rows={5}
                     />
                     <button onClick={handleSaveStatement} className={styles.saveBtn}>
                       <Check size={16} /> SAVE
                     </button>
                   </div>
                 ) : (
                   <div className={styles.statementDisplay}>
                     <p>{artistStatement}</p>
                     <button onClick={() => setIsEditingStatement(true)} className={styles.editBtn}>
                       <Pencil size={12} />
                     </button>
                   </div>
                 )}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* --- GALLERY SECTION --- */}
      <div id="gallery" className={styles.gallerySection}>
        <div className={styles.filterWrapper}>
          <nav className={styles.filterBar}>
            {categories.map((cat: any) => (
              <button 
                key={cat}
                className={`${styles.filterBtn} ${activeFilter === cat ? styles.activeFilter : ''}`}
                onClick={() => setActiveFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </nav>
        </div>

        <div className={styles.galleryGrid}>
          {filteredArtworks.map((art, index) => (
            <div key={art.id} className={styles.artFrame} onClick={() => setSelectedIdx(index)}>
              <div className={styles.imageContainer}>
                <img src={art.image_url} alt={art.title} className={styles.image} />
                <div className={styles.hoverOverlay}>
                  <h3 className={styles.hoverTitle}>{art.title}</h3>
                  <p className={styles.hoverMedium}>{art.medium}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- ABOUT SECTION --- */}
      <AboutSection userId={userId} />

      {/* --- CONTACT SECTION --- */}
      <ContactSection userId={userId} />

    </div>
  )
}