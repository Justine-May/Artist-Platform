'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import styles from '../../../components/portfolio/Portfolio.module.css'
import { Check, Clock, LayoutGrid, Loader2, Pencil, RotateCcw, Save, Trash2, X, Gavel, Tag } from 'lucide-react'
import AboutSection from './AboutSection'
import ContactSection from './ContactSection'
                                                                  
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// --- SORTABLE ITEM COMPONENT ---
function SortableArt({ art, index, onIdClick, onLocalDelete, userId, isLayoutMode, onToggleAuction }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: art.id, disabled: !isLayoutMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.3 : 1,
    scale: isDragging ? '1.05' : '1',
    cursor: isLayoutMode ? (isDragging ? 'grabbing' : 'grab') : 'pointer'
  };

  return (
    <div ref={setNodeRef} style={style} className={`${styles.artFrame} ${isLayoutMode ? styles.layoutModeActive : ''}`}>
      <div className={styles.imageContainer}>
        <div 
          className={styles.dragSurface} 
          {...(isLayoutMode ? { ...attributes, ...listeners } : {})}
        >
            <img src={art.image_url} alt={art.title} className={styles.image} />
        </div>
        
        <div className={styles.hoverOverlay}>
          <div 
            className={styles.overlayClickArea} 
            onClick={() => !isLayoutMode && onIdClick(index)}
          >
            <h3 className={styles.hoverTitle}>{art.title}</h3>
            <p className={styles.hoverMedium}>{art.medium}</p>
            {art.is_auction && <span className={styles.auctionBadge}>LIVE AUCTION</span>}
          </div>
          
          {/* --- ADMIN CONTROLS --- */}
          {userId && isLayoutMode && (
            <div className={styles.adminActionOverlay}>
              <button 
                className={`${styles.statusToggleBtn} ${art.is_auction ? styles.activeAuction : ''}`}
                onClick={(e) => { e.stopPropagation(); onToggleAuction(art.id); }}
                title={art.is_auction ? "Switch to Fixed Sale" : "Switch to Bidding"}
              >
                {art.is_auction ? <Gavel size={14} /> : <Tag size={14} />}
                <span>{art.is_auction ? 'BIDDING' : 'SALE'}</span>
              </button>
              
              <button 
                className={styles.boutiqueTrashBtn} 
                onClick={(e) => onLocalDelete(e, art.id)}
              >
                <Trash2 size={15} strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const [artworks, setArtworks] = useState<any[]>([])
  const [originalArtworks, setOriginalArtworks] = useState<any[]>([]) 
  const [filteredArtworks, setFilteredArtworks] = useState<any[]>([])
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [activeFilter, setActiveFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [isLayoutMode, setIsLayoutMode] = useState(false)
  const [isSavingLayout, setIsSavingLayout] = useState(false)
  const [heroArt, setHeroArt] = useState<any | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [artistName, setArtistName] = useState("")

  const [bidAmount, setBidAmount] = useState<number>(0)
  const [isPlacingBid, setIsPlacingBid] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserId(user.id)
          const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
          setArtistName(profile?.full_name || "ATELIER ARTIST")
        }

        let { data: arts } = await supabase
          .from('artworks')
          .select('*')
          .order('display_order', { ascending: true })

        if (!arts || arts.length === 0) {
          const { data: fallback } = await supabase
            .from('artworks')
            .select('*')
            .order('created_at', { ascending: false })
          arts = fallback
        }

        setArtworks(arts || [])
        setOriginalArtworks(arts || []) 
        setFilteredArtworks(arts || [])
        if (arts && arts.length > 0) setHeroArt(arts[0])
      } catch (err) {
        console.error("Fetch failed", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // --- TOGGLE HANDLER ---
  const toggleAuctionStatus = (id: string) => {
    setArtworks(prev => prev.map(art => 
      art.id === id ? { ...art, is_auction: !art.is_auction } : art
    ))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setArtworks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const handleSaveLayout = async () => {
    if (!userId) return
    setIsSavingLayout(true)
    try {
      const updates = artworks.map((art, index) => ({
        id: art.id,
        display_order: index,
        is_auction: art.is_auction // Added this to persist the choice
      }))
      for (const update of updates) {
        await supabase.from('artworks').update({ 
          display_order: update.display_order,
          is_auction: update.is_auction 
        }).eq('id', update.id)
      }
      setIsLayoutMode(false)
      setOriginalArtworks([...artworks])
    } finally {
      setIsSavingLayout(false)
    }
  }

  const handleLocalDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setArtworks(prev => prev.filter(art => art.id !== id))
  }

  const handlePlaceBid = async (artworkId: string) => {
    setIsPlacingBid(true)
    setTimeout(() => {
      alert(`Bid of $${bidAmount} placed!`)
      setIsPlacingBid(false)
    }, 1000)
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  }

  useEffect(() => {
    if (activeFilter === 'All') setFilteredArtworks(artworks)
    else setFilteredArtworks(artworks.filter(art => art.medium === activeFilter))
  }, [activeFilter, artworks])

  const categories = ['All', ...new Set(originalArtworks.map(art => art.medium).filter(Boolean))]
  const currentArt = selectedIdx !== null ? filteredArtworks[selectedIdx] : null

  if (loading) return <div className={styles.loading}>LOADING ATELIER...</div>

  return (
    <div className={styles.wrapper}>
      {/* (Keep Modal, Header, Hero as they are) */}
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
                <div className={styles.modalDesc}><p>{currentArt.description}</p></div>
                <div className={styles.modalMeta}>
                    <span><strong>Title:</strong> {currentArt.title}</span><br/>
                    <span><strong>Dimensions:</strong> {currentArt.dimensions}</span>
                </div>

                {currentArt.is_auction && (
                  <div className={styles.auctionContainer}>
                    <div className={styles.auctionHeader}>
                      <span className={styles.liveDot}>● LIVE</span>
                      <span className={styles.timeLeft}><Clock size={12}/> 22h : 14m</span>
                    </div>
                    <div className={styles.bidInfo}>
                      <p className={styles.bidLabel}>Current Bid</p>
                      <h3 className={styles.currentPrice}>${currentArt.current_bid || currentArt.price || '0'}</h3>
                    </div>
                    <div className={styles.bidInputArea}>
                      <input 
                        type="number" 
                        placeholder="Enter bid"
                        className={styles.bidInput}
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                      />
                      <button 
                        className={styles.placeBidBtn}
                        onClick={() => handlePlaceBid(currentArt.id)}
                        disabled={isPlacingBid}
                      >
                        {isPlacingBid ? 'PLACING...' : 'PLACE BID'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button className={styles.closeBtnText} onClick={() => setSelectedIdx(null)}>CLOSE <X size={14}/></button>
            </div>
          </div>
        </div>
      )}

      <header className={`${styles.centeredHeader} ${styles.stickyHeader}`}>
        <h1 className={styles.headerArtistName}>{artistName}</h1>
        <nav className={styles.centeredNavBar}>
          <button onClick={() => scrollToSection('hero')} className={styles.navLink}>HOME</button>
          <button onClick={() => scrollToSection('gallery')} className={styles.navLink}>GALLERY</button>
          <button onClick={() => scrollToSection('about')} className={styles.navLink}>ABOUT</button>
          <button onClick={() => scrollToSection('contact')} className={styles.navLink}>CONTACT</button>
        </nav>
      </header>

      <div id="hero">
        {heroArt ? (
          <section className={styles.heroSectionNew}>
            <img src={heroArt.image_url} alt={heroArt.title} className={styles.heroImageNew} />
            <div className={styles.heroDynamicOverlay}>
              <div className={styles.heroLeftContent}>
                 <p className={styles.heroArtworkTitle}>{heroArt.title} — {heroArt.medium}</p>
              </div>
            </div>
          </section>
        ) : (
          <div className={styles.heroPlaceholder}>No Hero Image Found.</div>
        )}
      </div>

      <div id="gallery" className={styles.gallerySection}>
        <div className={styles.filterWrapper}>
          <nav className={styles.filterBar}>
            <div className={styles.filterList}>
              {categories.map((cat: any) => (
                <button key={cat} className={`${styles.filterBtn} ${activeFilter === cat ? styles.activeFilter : ''}`} onClick={() => setActiveFilter(cat)}>{cat}</button>
              ))}
            </div>

            <div className={styles.utilityActions}>
              {userId && (
                <>
                  {!isLayoutMode ? (
                    <button onClick={() => setIsLayoutMode(true)} className={styles.editLayoutBtn}>
                      <LayoutGrid size={14} /> EDIT LAYOUT
                    </button>
                  ) : (
                    <button onClick={handleSaveLayout} className={styles.saveLayoutBtn} disabled={isSavingLayout}>
                      {isSavingLayout ? <Loader2 className={styles.spinner} size={14}/> : <Save size={14} />}
                      CONFIRM
                    </button>
                  )}
                </>
              )}
            </div>
          </nav>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredArtworks.map(i => i.id)} strategy={rectSortingStrategy}>
            <div className={`${styles.galleryGrid} ${isLayoutMode ? styles.gridEditing : ''}`}>
              {filteredArtworks.map((art, index) => (
                <SortableArt 
                    key={art.id} 
                    art={art} 
                    index={index} 
                    userId={userId}
                    isLayoutMode={isLayoutMode}
                    onToggleAuction={toggleAuctionStatus}
                    onIdClick={setSelectedIdx}
                    onLocalDelete={handleLocalDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <AboutSection userId={userId} />
      <ContactSection userId={userId} />
    </div>
  )
}