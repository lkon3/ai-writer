// 书籍相关类型
export interface Book {
  id?: string
  title: string
  author: string
  description: string
  cover?: string
  createdAt: number
  updatedAt: number
  wordCount: number
}

// 章节类型
export interface Chapter {
  id?: string
  bookId: string
  title: string
  content: string
  sortOrder: number
  wordCount: number
  createdAt: number
  updatedAt: number
}

// 大纲类型
export interface Outline {
  id?: string
  bookId: string
  type: 'story' | 'chapter' | 'character' | 'world' | 'other'
  title: string
  content: string
  chapterId?: string
  sortOrder: number
  createdAt: number
  updatedAt: number
}

// API提供商类型
export type ApiProvider =
  | 'openai'
  | 'anthropic'
  | 'deepseek'
  | 'zhipu'
  | 'wenxin'
  | 'tongyi'
  | 'ollama'
  | 'custom'

// API配置类型
export interface ApiConfig {
  id: string
  name: string
  provider: ApiProvider
  apiKey: string
  baseURL?: string
  model: string
  temperature: number
  maxTokens: number
  isDefault: boolean
}

// 提示词类型
export interface Prompt {
  id?: string
  name: string
  description: string
  content: string
  category: string
  variables: string[]
  createdAt: number
  updatedAt: number
}

// AI生成请求类型
export interface GenerateRequest {
  prompt: string
  context?: string
  type: 'continue' | 'rewrite' | 'style' | 'suggestion' | 'dialogue' | 'custom'
  temperature?: number
  maxTokens?: number
}

// 导出格式类型
export type ExportFormat = 'txt' | 'md' | 'epub' | 'pdf'

// 应用设置类型
export interface AppSettings {
  theme: 'light' | 'dark'
  autoSave: boolean
  autoSaveInterval: number
  defaultApiConfig: string
  fontSize: number
}
