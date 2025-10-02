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
const MAX_STORAGE_BYTES = 4 * 1024 * 1024 // ~8MB safe window inside localStorage limits
const encoder = typeof TextEncoder !== "undefined" ? new TextEncoder() : null

export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024 // 2MB per image as defined in migration plan

export interface PendingImage {
  name: string
  dataUrl: string
  size: number
}

export interface PendingUpload {
  slug: string
  title?: string
  markdown?: string
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
  appendImages: (slug: string, images: PendingImage[], metadata?: { title?: string }) => void
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
      "Pending changes exceed the safe local storage limit (~4MB). Publish or remove items before adding more.",
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

  const mergeUploads = (existing: PendingUpload | undefined, incoming: PendingUpload): PendingUpload => {
    const usedNames = new Set<string>()
    existing?.images.forEach((image) => usedNames.add(image.name))

    const combinedImages: PendingImage[] = []

    if (existing) {
      combinedImages.push(...existing.images)
    }

    ;(incoming.images ?? []).forEach((image) => {
      if (usedNames.has(image.name)) {
        const uniqueName = ensureUniqueImageName(image.name, usedNames)
        combinedImages.push({ ...image, name: uniqueName })
      } else {
        usedNames.add(image.name)
        combinedImages.push(image)
      }
    })

    return {
      slug: incoming.slug,
      title: incoming.title ?? existing?.title,
      markdown: incoming.markdown ?? existing?.markdown,
      images: combinedImages,
    }
  }

  const addUpload = useCallback((upload: PendingUpload) => {
    setState((prev) => {
      const normalizedSlug = sanitizeSlug(upload.slug)
      const existing = prev.uploads.find((item) => item.slug === normalizedSlug)
      const nextUpload = mergeUploads(existing, {
        ...upload,
        slug: normalizedSlug,
        images: upload.images ?? [],
      })
      const remainingUploads = prev.uploads.filter((item) => item.slug !== normalizedSlug)
      const nextState: PendingChangesState = {
        uploads: [...remainingUploads, nextUpload],
        deletes: prev.deletes.filter((slug) => slug !== normalizedSlug),
      }
      assertWithinStorageLimit(nextState)
      return nextState
    })
  }, [])

  const appendImages = useCallback(
    (slug: string, images: PendingImage[], metadata?: { title?: string }) => {
      if (!images.length) {
        return
      }

      setState((prev) => {
        const normalizedSlug = sanitizeSlug(slug)
        const existing = prev.uploads.find((item) => item.slug === normalizedSlug)
        const nextUpload = mergeUploads(existing, {
          slug: normalizedSlug,
          title: metadata?.title,
          images,
        })
        const remainingUploads = prev.uploads.filter((item) => item.slug !== normalizedSlug)
        const nextState: PendingChangesState = {
          uploads: [...remainingUploads, nextUpload],
          deletes: prev.deletes.filter((item) => item !== normalizedSlug),
        }
        assertWithinStorageLimit(nextState)
        return nextState
      })
    },
    [],
  )

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
      appendImages,
      addDelete,
      removeDelete,
      clearAll,
      storageUsed,
      storageLimit: MAX_STORAGE_BYTES,
      hasPending,
      isReady,
    }),
    [
      state,
      addUpload,
      removeUpload,
      appendImages,
      addDelete,
      removeDelete,
      clearAll,
      storageUsed,
      hasPending,
      isReady,
    ],
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
  const markdownLength = upload.markdown ? upload.markdown.length : 0
  const markdownBytes = encoder ? encoder.encode(upload.markdown ?? "").length : markdownLength
  const imagesBytes = (upload.images ?? []).reduce((total, image) => total + image.size, 0)
  return markdownBytes + imagesBytes
}

function ensureUniqueImageName(name: string, usedNames: Set<string>): string {
  if (!usedNames.has(name)) {
    usedNames.add(name)
    return name
  }

  const extensionMatch = name.match(/\.([a-z0-9]+)$/i)
  const extension = extensionMatch ? `.${extensionMatch[1]}` : ""
  const base = extension ? name.slice(0, -extension.length) : name

  let attempt = 1
  let candidate = `${base}-${attempt}${extension}`

  while (usedNames.has(candidate)) {
    attempt += 1
    candidate = `${base}-${attempt}${extension}`
  }

  usedNames.add(candidate)
  return candidate
}
