import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ApiConfig } from '../types'
import { db } from '../database'
import { v4 as uuidv4 } from 'uuid'
import { apiService } from '../api'

export const useApiStore = defineStore('api', () => {
  // 状态
  const configs = ref<ApiConfig[]>([])
  const currentConfig = ref<ApiConfig | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 提供商选项
  const providerOptions = [
    { label: 'OpenAI', value: 'openai' },
    { label: 'Anthropic (Claude)', value: 'anthropic' },
    { label: 'DeepSeek', value: 'deepseek' },
    { label: '智谱AI', value: 'zhipu' },
    { label: '本地模型 (Ollama)', value: 'ollama' },
    { label: '自定义', value: 'custom' }
  ]

  // 默认模型配置
  const defaultModels = {
    openai: 'gpt-4',
    anthropic: 'claude-3-sonnet-20240229',
    deepseek: 'deepseek-chat',
    zhipu: 'glm-4',
    ollama: 'llama2',
    custom: 'gpt-3.5-turbo'
  }

  // 加载所有API配置
  async function loadConfigs() {
    configs.value = await db.apiConfigs.toArray()
  }

  // 加载默认配置
  async function loadDefaultConfig() {
    const config = await apiService.loadDefaultConfig()
    if (config) {
      currentConfig.value = config
    }
    return config
  }

  // 创建API配置
  async function createConfig(config: Omit<ApiConfig, 'id'>) {
    const newConfig: ApiConfig = {
      ...config,
      id: uuidv4()
    }

    // 如果是第一个配置或者是默认配置，清除其他默认配置
    if (newConfig.isDefault) {
      await db.apiConfigs.where('isDefault').equals(1).modify({ isDefault: false })
    }

    await db.apiConfigs.add(newConfig)
    await loadConfigs()

    // 如果是默认配置，设置为当前配置
    if (newConfig.isDefault) {
      await setConfig(newConfig.id)
    }

    return newConfig
  }

  // 更新API配置
  async function updateConfig(configId: string, updates: Partial<ApiConfig>) {
    // 如果更新为默认配置，清除其他默认配置
    if (updates.isDefault) {
      await db.apiConfigs.where('isDefault').equals(1).modify({ isDefault: false })
    }

    await db.apiConfigs.update(configId, updates)

    if (updates.isDefault) {
      await setConfig(configId)
    }

    await loadConfigs()
  }

  // 删除API配置
  async function deleteConfig(configId: string) {
    await db.apiConfigs.delete(configId)

    // 如果删除的是当前配置，重新加载
    if (currentConfig.value?.id === configId) {
      await loadDefaultConfig()
    }

    await loadConfigs()
  }

  // 设置当前配置
  async function setConfig(configId: string) {
    await apiService.setConfig(configId)
    const config = await db.apiConfigs.get(configId)
    if (config) {
      currentConfig.value = config
    }
  }

  // 测试API配置
  async function testConfig(config: ApiConfig) {
    isLoading.value = true
    error.value = null

    try {
      const result = await apiService.testConfig(config)
      return result
    } catch (e: any) {
      error.value = e.message || 'API测试失败'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 生成内容
  async function generate(prompt: string, context?: string, type: string = 'continue') {
    isLoading.value = true
    error.value = null

    try {
      return await apiService.generate({ prompt, context, type: type as any })
    } catch (e: any) {
      error.value = e.message || '生成失败'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return {
    // 状态
    configs,
    currentConfig,
    isLoading,
    error,

    // 常量
    providerOptions,
    defaultModels,

    // 方法
    loadConfigs,
    loadDefaultConfig,
    createConfig,
    updateConfig,
    deleteConfig,
    setConfig,
    testConfig,
    generate
  }
})
