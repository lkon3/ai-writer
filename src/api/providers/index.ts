import OpenAI from 'openai'
import type { ApiConfig, GenerateRequest } from '../../types'

// 生成统一响应接口
export interface GenerateResponse {
  content: string
  finishReason?: string
}

// API提供商适配器基类
export abstract class ApiProviderAdapter {
  protected config: ApiConfig

  constructor(config: ApiConfig) {
    this.config = config
  }

  abstract generate(request: GenerateRequest): Promise<GenerateResponse>

  protected buildPrompt(request: GenerateRequest): string {
    const { prompt, context, type } = request

    let systemPrompt = ''
    switch (type) {
      case 'continue':
        systemPrompt = '你是一位专业的小说作家，擅长续写故事。请保持风格一致，内容连贯。'
        break
      case 'rewrite':
        systemPrompt = '你是一位专业的编辑，擅长润色和优化文字。'
        break
      case 'style':
        systemPrompt = '你是一位风格多样的作家，能够根据要求转换文字风格。'
        break
      case 'suggestion':
        systemPrompt = '你是一位创意顾问，擅长提供情节发展建议。'
        break
      case 'dialogue':
        systemPrompt = '你是一位对话写作专家，擅长创作自然流畅的角色对话。'
        break
      default:
        systemPrompt = '你是一位专业的AI写作助手。'
    }

    if (context) {
      return `${systemPrompt}\n\n背景内容：\n${context}\n\n${prompt}`
    }

    return `${systemPrompt}\n\n${prompt}`
  }
}

// OpenAI适配器
export class OpenAIProvider extends ApiProviderAdapter {
  private client: OpenAI

  constructor(config: ApiConfig) {
    super(config)
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL || 'https://api.openai.com/v1'
    })
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const completion = await this.client.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: 'user', content: this.buildPrompt(request) }
      ],
      temperature: request.temperature ?? this.config.temperature,
      max_tokens: request.maxTokens ?? this.config.maxTokens
    })

    return {
      content: completion.choices[0]?.message?.content || '',
      finishReason: completion.choices[0]?.finish_reason
    }
  }
}

// Anthropic (Claude) 适配器
export class AnthropicProvider extends ApiProviderAdapter {
  private client: OpenAI

  constructor(config: ApiConfig) {
    super(config)
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL || 'https://api.anthropic.com/v1'
    })
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const completion = await this.client.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: 'user', content: this.buildPrompt(request) }
      ],
      temperature: request.temperature ?? this.config.temperature,
      max_tokens: request.maxTokens ?? this.config.maxTokens
    })

    return {
      content: completion.choices[0]?.message?.content || '',
      finishReason: completion.choices[0]?.finish_reason
    }
  }
}

// DeepSeek适配器
export class DeepSeekProvider extends ApiProviderAdapter {
  private client: OpenAI

  constructor(config: ApiConfig) {
    super(config)
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL || 'https://api.deepseek.com/v1'
    })
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const completion = await this.client.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: 'user', content: this.buildPrompt(request) }
      ],
      temperature: request.temperature ?? this.config.temperature,
      max_tokens: request.maxTokens ?? this.config.maxTokens
    })

    return {
      content: completion.choices[0]?.message?.content || '',
      finishReason: completion.choices[0]?.finish_reason
    }
  }
}

// 智谱AI适配器
export class ZhipuProvider extends ApiProviderAdapter {
  private client: OpenAI

  constructor(config: ApiConfig) {
    super(config)
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL || 'https://open.bigmodel.cn/api/paas/v4'
    })
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const completion = await this.client.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: 'user', content: this.buildPrompt(request) }
      ],
      temperature: request.temperature ?? this.config.temperature,
      max_tokens: request.maxTokens ?? this.config.maxTokens
    })

    return {
      content: completion.choices[0]?.message?.content || '',
      finishReason: completion.choices[0]?.finish_reason
    }
  }
}

// Ollama本地模型适配器
export class OllamaProvider extends ApiProviderAdapter {
  private client: OpenAI

  constructor(config: ApiConfig) {
    super(config)
    this.client = new OpenAI({
      apiKey: 'ollama', // Ollama不需要API key
      baseURL: config.baseURL || 'http://localhost:11434/v1'
    })
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const completion = await this.client.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: 'user', content: this.buildPrompt(request) }
      ],
      temperature: request.temperature ?? this.config.temperature,
      max_tokens: request.maxTokens ?? this.config.maxTokens
    })

    return {
      content: completion.choices[0]?.message?.content || '',
      finishReason: completion.choices[0]?.finish_reason
    }
  }
}

// 自定义API适配器
export class CustomProvider extends ApiProviderAdapter {
  private client: OpenAI

  constructor(config: ApiConfig) {
    super(config)
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL
    })
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const completion = await this.client.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: 'user', content: this.buildPrompt(request) }
      ],
      temperature: request.temperature ?? this.config.temperature,
      max_tokens: request.maxTokens ?? this.config.maxTokens
    })

    return {
      content: completion.choices[0]?.message?.content || '',
      finishReason: completion.choices[0]?.finish_reason
    }
  }
}

// 工厂函数：根据配置创建适配器
export function createProvider(config: ApiConfig): ApiProviderAdapter {
  switch (config.provider) {
    case 'openai':
      return new OpenAIProvider(config)
    case 'anthropic':
      return new AnthropicProvider(config)
    case 'deepseek':
      return new DeepSeekProvider(config)
    case 'zhipu':
      return new ZhipuProvider(config)
    case 'ollama':
      return new OllamaProvider(config)
    case 'custom':
      return new CustomProvider(config)
    default:
      // 默认使用OpenAI兼容格式
      return new CustomProvider(config)
  }
}
