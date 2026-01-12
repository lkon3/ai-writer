import { createProvider, type GenerateResponse } from './providers'
import type { ApiConfig, GenerateRequest } from '../types'
import { db } from '../database'

// API服务类
export class ApiService {
  private currentConfig: ApiConfig | null = null

  // 加载默认API配置
  async loadDefaultConfig(): Promise<ApiConfig | null> {
    const configs = await db.apiConfigs.where('isDefault').equals(1).toArray()
    if (configs.length > 0) {
      this.currentConfig = configs[0]
      return this.currentConfig
    }

    // 如果没有默认配置，返回第一个
    const allConfigs = await db.apiConfigs.toArray()
    if (allConfigs.length > 0) {
      this.currentConfig = allConfigs[0]
      return this.currentConfig
    }

    return null
  }

  // 设置当前API配置
  async setConfig(configId: string): Promise<void> {
    const config = await db.apiConfigs.get(configId)
    if (config) {
      this.currentConfig = config
    }
  }

  // 生成内容
  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    if (!this.currentConfig) {
      await this.loadDefaultConfig()
    }

    if (!this.currentConfig) {
      throw new Error('请先配置API密钥')
    }

    const provider = createProvider(this.currentConfig)
    return provider.generate(request)
  }

  // 流式生成（支持实时显示）
  async *generateStream(request: GenerateRequest): AsyncGenerator<string> {
    if (!this.currentConfig) {
      await this.loadDefaultConfig()
    }

    if (!this.currentConfig) {
      throw new Error('请先配置API密钥')
    }

    const provider = createProvider(this.currentConfig)
    // 这里简化处理，实际应该实现真正的流式输出
    const response = await provider.generate(request)
    yield response.content
  }

  // 测试API连接
  async testConfig(config: ApiConfig): Promise<boolean> {
    try {
      const provider = createProvider(config)
      await provider.generate({
        prompt: '测试',
        type: 'custom',
        maxTokens: 10
      })
      return true
    } catch (error) {
      console.error('API测试失败:', error)
      return false
    }
  }
}

// 导出单例
export const apiService = new ApiService()
