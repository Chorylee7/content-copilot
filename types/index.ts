export interface Article {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

export type AIAction = 'polish' | 'continue' | 'expand' | 'outline' | 'title' | 'summarize'

export interface AIActionConfig {
  key: AIAction
  label: string
  icon: string
  prompt: string
}

export type Platform = 'wechat' | 'xiaohongshu'
