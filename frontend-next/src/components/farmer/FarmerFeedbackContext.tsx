"use client"

import React, { createContext, useContext, useState, useCallback, useMemo } from "react"
import { usePathname } from "next/navigation"

export interface FeedbackOpenOptions {
  category?: string
  feedbackType?: string
  sourcePage?: string
  guidedOption?: string
  quickRating?: string
}

interface FarmerFeedbackContextType {
  isOpen: boolean
  options: FeedbackOpenOptions
  openFeedback: (opts?: FeedbackOpenOptions) => void
  closeFeedback: () => void
}

const FarmerFeedbackContext = createContext<FarmerFeedbackContextType>({
  isOpen: false,
  options: {},
  openFeedback: () => {},
  closeFeedback: () => {},
})

export function FarmerFeedbackProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<FeedbackOpenOptions>({})
  const pathname = usePathname()

  const openFeedback = useCallback(
    (opts: FeedbackOpenOptions = {}) => {
      setOptions({
        sourcePage: opts.sourcePage || pathname || "/",
        category: opts.category,
        feedbackType: opts.feedbackType,
        guidedOption: opts.guidedOption,
        quickRating: opts.quickRating,
      })
      setIsOpen(true)
    },
    [pathname]
  )

  const closeFeedback = useCallback(() => {
    setIsOpen(false)
  }, [])

  const value = useMemo(
    () => ({
      isOpen,
      options,
      openFeedback,
      closeFeedback,
    }),
    [isOpen, options, openFeedback, closeFeedback]
  )

  return (
    <FarmerFeedbackContext.Provider value={value}>
      {children}
    </FarmerFeedbackContext.Provider>
  )
}

export function useFarmerFeedback() {
  return useContext(FarmerFeedbackContext)
}
