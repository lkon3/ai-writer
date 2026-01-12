import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Prompt } from '../types'
import { db } from '../database'
import { v4 as uuidv4 } from 'uuid'

export const usePromptStore = defineStore('prompt', () => {
  // 状态
  const prompts = ref<Prompt[]>([])
  const currentPrompt = ref<Prompt | null>(null)

  // 计算属性 - 获取所有分类
  const categories = computed(() => {
    const categorySet = new Set(prompts.value.map(p => p.category))
    return Array.from(categorySet)
  })

  // 按分类获取提示词
  const getPromptsByCategory = computed(() => {
    return (category: string) => {
      return prompts.value.filter(p => p.category === category)
    }
  })

  // 加载所有提示词
  async function loadPrompts() {
    prompts.value = await db.prompts.toArray()
    // 按创建时间倒序排序
    prompts.value.sort((a, b) => b.createdAt - a.createdAt)
  }

  // 加载单个提示词
  async function loadPrompt(promptId: string) {
    const prompt = await db.prompts.get(promptId)
    if (prompt) {
      currentPrompt.value = prompt
    }
    return prompt
  }

  // 创建提示词
  async function createPrompt(prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) {
    const newPrompt: Prompt = {
      ...prompt,
      id: uuidv4(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    await db.prompts.add(newPrompt)
    await loadPrompts()
    return newPrompt
  }

  // 更新提示词
  async function updatePrompt(promptId: string, updates: Partial<Prompt>) {
    await db.prompts.update(promptId, {
      ...updates,
      updatedAt: Date.now()
    })
    if (currentPrompt.value?.id === promptId) {
      currentPrompt.value = { ...currentPrompt.value, ...updates, updatedAt: Date.now() }
    }
    await loadPrompts()
  }

  // 删除提示词
  async function deletePrompt(promptId: string) {
    await db.prompts.delete(promptId)
    if (currentPrompt.value?.id === promptId) {
      currentPrompt.value = null
    }
    await loadPrompts()
  }

  // 导出提示词
  async function exportPrompts(promptIds?: string[]) {
    let promptsToExport: Prompt[]

    if (promptIds) {
      promptsToExport = await db.prompts.where('id').anyOf(promptIds).toArray()
    } else {
      promptsToExport = await db.prompts.toArray()
    }

    return JSON.stringify(promptsToExport, null, 2)
  }

  // 导入提示词
  async function importPrompts(jsonData: string) {
    try {
      const importedPrompts: Prompt[] = JSON.parse(jsonData)

      // 验证数据格式
      for (const prompt of importedPrompts) {
        if (!prompt.name || !prompt.content || !prompt.category) {
          throw new Error('提示词格式不正确')
        }
      }

      // 添加到数据库
      const promptsToAdd = importedPrompts.map(p => ({
        ...p,
        id: uuidv4(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      }))

      await db.prompts.bulkAdd(promptsToAdd)
      await loadPrompts()

      return promptsToAdd.length
    } catch (e: any) {
      throw new Error('导入失败: ' + e.message)
    }
  }

  // 渲染提示词（替换变量）
  function renderPrompt(prompt: Prompt, variables: Record<string, string>): string {
    let content = prompt.content

    for (const varName of prompt.variables) {
      const placeholder = `{${varName}}`
      const value = variables[varName] || ''
      content = content.replace(new RegExp(placeholder, 'g'), value)
    }

    return content
  }

  return {
    // 状态
    prompts,
    currentPrompt,

    // 计算属性
    categories,
    getPromptsByCategory,

    // 方法
    loadPrompts,
    loadPrompt,
    createPrompt,
    updatePrompt,
    deletePrompt,
    exportPrompts,
    importPrompts,
    renderPrompt
  }
})
