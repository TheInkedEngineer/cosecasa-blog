"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

const STORAGE_KEY = "cosecasa-admin-pending"
const MAX_STORAGE_BYTES = 8 * 1024 * 1024 // ~8MB safe window inside localStorage limits
const encoder = typeof TextEncoder !== "undefined" ? new TextEncoder() : null

export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024 // 2MB per image as defined in migration plan

export interface PendingImage {
  name: string
  dataUrl: string
  size: number
}

export interface PendingUpload {
  slug: string
  title: string
  markdown: string
  images: PendingImage[]
}

export interface PendingChangesState {
  uploads: PendingUpload[]
  deletes: string[]
}

interface PendingChangesContextValue {
  state: PendingChangesState
  addUpload: (upload: PendingUpload) => void
  removeUpload: (slug: string) => void
  addDelete: (slug: string) => void
  removeDelete: (slug: string) => void
  clearAll: () => void
  storageUsed: number
  storageLimit: number
  hasPending: boolean
  isReady: boolean
}

const defaultState: PendingChangesState = { uploads: [], deletes: [] }

const PendingChangesContext = createContext<PendingChangesContextValue | undefined>(undefined)

function calculateStorageBytes(state: PendingChangesState): number {
  if (!encoder) {
    return JSON.stringify(state).length
  }
  const serialized = JSON.stringify(state)
  return encoder.encode(serialized).length
}

function assertWithinStorageLimit(nextState: PendingChangesState) {
  const used = calculateStorageBytes(nextState)
  if (used > MAX_STORAGE_BYTES) {
    throw new Error(
      "Pending changes exceed the safe local storage limit (~8MB). Publish or remove items before adding more.",
    )
  }
}

function sanitizeSlug(value: string): string {
  return value.trim()
}

export function PendingChangesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PendingChangesState>(defaultState)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as PendingChangesState
        if (parsed && Array.isArray(parsed.uploads) && Array.isArray(parsed.deletes)) {
          setState({
            uploads: parsed.uploads,
            deletes: parsed.deletes,
          })
        }
      }
    } catch (error) {
      console.error("Failed to parse pending changes from localStorage", error)
      window.localStorage.removeItem(STORAGE_KEY)
    } finally {
      setIsReady(true)
    }
  }, [])

  useEffect(() => {
    if (!isReady) {
      return
    }

    try {
      if (state.uploads.length === 0 && state.deletes.length === 0) {
        window.localStorage.removeItem(STORAGE_KEY)
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      }
    } catch (error) {
      console.error("Failed to persist pending changes", error)
    }
  }, [state, isReady])

  const storageUsed = useMemo(() => calculateStorageBytes(state), [state])
  const hasPending = state.uploads.length > 0 || state.deletes.length > 0

  const addUpload = useCallback((upload: PendingUpload) => {
    setState((prev) => {
      const normalizedSlug = sanitizeSlug(upload.slug)
      const nextUploads = [...prev.uploads.filter((item) => item.slug !== normalizedSlug), {
        ...upload,
        slug: normalizedSlug,
      }]
      const nextState: PendingChangesState = {
        uploads: nextUploads,
        deletes: prev.deletes.filter((slug) => slug !== normalizedSlug),
      }
      assertWithinStorageLimit(nextState)
      return nextState
    })
  }, [])

  const removeUpload = useCallback((slug: string) => {
    const normalizedSlug = sanitizeSlug(slug)
    setState((prev) => {
      const nextState: PendingChangesState = {
        uploads: prev.uploads.filter((item) => item.slug !== normalizedSlug),
        deletes: prev.deletes,
      }
      return nextState
    })
  }, [])

  const addDelete = useCallback((slug: string) => {
    const normalizedSlug = sanitizeSlug(slug)
    if (!normalizedSlug) {
      return
    }
    setState((prev) => {
      if (prev.deletes.includes(normalizedSlug)) {
        return prev
      }
      const nextState: PendingChangesState = {
        uploads: prev.uploads.filter((item) => item.slug !== normalizedSlug),
        deletes: [...prev.deletes, normalizedSlug],
      }
      assertWithinStorageLimit(nextState)
      return nextState
    })
  }, [])

  const removeDelete = useCallback((slug: string) => {
    const normalizedSlug = sanitizeSlug(slug)
    setState((prev) => ({
      uploads: prev.uploads,
      deletes: prev.deletes.filter((item) => item !== normalizedSlug),
    }))
  }, [])

  const clearAll = useCallback(() => {
    setState(defaultState)
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error("Failed to clear pending changes", error)
    }
  }, [])

  const value = useMemo<PendingChangesContextValue>(
    () => ({
      state,
      addUpload,
      removeUpload,
      addDelete,
      removeDelete,
      clearAll,
      storageUsed,
      storageLimit: MAX_STORAGE_BYTES,
      hasPending,
      isReady,
    }),
    [state, addUpload, removeUpload, addDelete, removeDelete, clearAll, storageUsed, hasPending, isReady],
  )

  return <PendingChangesContext.Provider value={value}>{children}</PendingChangesContext.Provider>
}

export function usePendingChanges(): PendingChangesContextValue {
  const context = useContext(PendingChangesContext)
  if (!context) {
    throw new Error("usePendingChanges must be used within a PendingChangesProvider")
  }
  return context
}

export function validateImageSize(file: File): void {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(
      `Image "${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum allowed: 2MB. Please compress or resize the image.`,
    )
  }
}

export function estimateTotalUploadSize(upload: PendingUpload): number {
  const markdownBytes = encoder ? encoder.encode(upload.markdown).length : upload.markdown.length
  const imagesBytes = upload.images.reduce((total, image) => total + image.size, 0)
  return markdownBytes + imagesBytes
}

