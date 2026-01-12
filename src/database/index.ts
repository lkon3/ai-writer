import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { Book, Chapter, Outline, ApiConfig, Prompt, AppSettings } from '../types'

class AIWriterDatabase extends Dexie {
  books!: Table<Book>
  chapters!: Table<Chapter>
  outlines!: Table<Outline>
  apiConfigs!: Table<ApiConfig>
  prompts!: Table<Prompt>
  settings!: Table<AppSettings>

  constructor() {
    super('AIWriterDB')
    this.version(1).stores({
      books: 'id, title, author, createdAt, updatedAt',
      chapters: 'id, bookId, sortOrder, createdAt',
      outlines: 'id, bookId, type, chapterId, sortOrder',
      apiConfigs: 'id, provider, isDefault',
      prompts: 'id, category, createdAt',
      settings: 'key'
    })
  }
}

export const db = new AIWriterDatabase()

// 数据库初始化和默认数据
export async function initDatabase() {
  await db.open()

  // 检查是否需要初始化默认设置
  const settingsCount = await db.settings.count()
  if (settingsCount === 0) {
    await db.settings.add({
      theme: 'light',
      autoSave: true,
      autoSaveInterval: 30000,
      defaultApiConfig: '',
      fontSize: 16
    } as any)
  }

  // 检查是否需要初始化默认提示词
  const promptsCount = await db.prompts.count()
  if (promptsCount === 0) {
    await initDefaultPrompts()
  }
}

// 初始化默认提示词
async function initDefaultPrompts() {
  const defaultPrompts: Omit<Prompt, 'id'>[] = [
    {
      name: '📖 提示词使用说明',
      description: '了解如何创建和使用提示词模板',
      content: '=== 提示词使用指南 ===\n\n【什么是提示词？】\n提示词是给AI的指令模板，帮助你快速生成所需内容。\n\n【如何使用变量？】\n使用大括号包裹变量名，例如：{content}、{style}、{scene}\n使用时会提示你填入这些变量的具体值。\n\n【示例】\n提示词内容：\n请将以下{content}改为{style}风格\n\n使用时填入：\n{content} = "这是一段文字"\n{style} = "幽默"\n\nAI将收到：\n请将以下这是一段文字改为幽默风格\n\n【常用变量建议】\n- {content} - 要处理的内容\n- {style} - 目标风格\n- {scene} - 场景描述\n- {characters} - 角色信息\n- {length} - 字数要求\n\n现在你可以创建自己的提示词了！',
      category: '使用说明',
      variables: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      name: '续写故事',
      description: '基于当前内容续写故事',
      content: '请基于以下内容续写故事，保持风格一致，内容连贯：\n\n当前内容：\n{content}\n\n续写要求：\n1. 保持与上文风格一致\n2. 推进情节发展\n3. 字数约500字',
      category: '写作辅助',
      variables: ['content'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      name: '润色文字',
      description: '优化文字表达，使文笔更优美',
      content: '请润色以下文字，使其更加流畅优美：\n\n{content}\n\n要求：\n1. 保持原意不变\n2. 提升文字表现力\n3. 修正语法和标点错误',
      category: '文字优化',
      variables: ['content'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      name: '生成对话',
      description: '生成角色对话',
      content: '请为以下场景生成角色对话：\n\n场景描述：{scene}\n角色：{characters}\n\n要求：\n1. 对话自然流畅\n2. 符合角色性格\n3. 推动情节发展',
      category: '对话生成',
      variables: ['scene', 'characters'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      name: '风格转换',
      description: '改变文字风格',
      content: '请将以下文字转换为{style}风格：\n\n{content}',
      category: '风格转换',
      variables: ['content', 'style'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      name: '情节建议',
      description: '提供情节发展建议',
      content: '基于以下故事背景，请提供3个可能的情节发展建议：\n\n{content}\n\n每个建议应包含：\n1. 情节概述\n2. 可能的转折点\n3. 预期效果',
      category: '创意构思',
      variables: ['content'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ]

  await db.prompts.bulkAdd(defaultPrompts)
}

// 导出数据库实例和工具函数
export default db
