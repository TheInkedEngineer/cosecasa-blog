import type { UploadedAsset } from "../upload/state"

export interface UploadImagesState {
  success: boolean
  prefix?: string
  images?: UploadedAsset[]
  error?: string
}

export const initialUploadImagesState: UploadImagesState = { success: false }
