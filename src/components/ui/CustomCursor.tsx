'use client'

import { useEffect, useState } from 'react'
import styles from './CustomCursor.module.css'

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Trigger effect on links, buttons, and clickable art frames
      if (['A', 'BUTTON'].includes(target.tagName) || target.closest('[role="button"]')) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }

    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mouseover', handleHover)
    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mouseover', handleHover)
    }
  }, [])

  return (
    <div 
      className={`${styles.cursor} ${isHovering ? styles.hovering : ''}`}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    />
  )
}