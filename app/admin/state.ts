export interface DeleteState {
  success?: boolean
  error?: string
}

export const initialDeleteState: DeleteState = {}

export interface DeleteArticleState {
  success?: boolean
  error?: string
  redirectTo?: string
}

export const initialDeleteArticleState: DeleteArticleState = {}
