<template>
  <div class="settings-page">
    <h2>设置</h2>

    <el-tabs v-model="activeTab">
      <!-- API配置 -->
      <el-tab-pane label="API配置" name="api">
        <div class="tab-content">
          <div class="section-header">
            <h3>API服务配置</h3>
            <el-button type="primary" @click="handleCreateConfig">
              <el-icon><Plus /></el-icon>
              添加配置
            </el-button>
          </div>

          <!-- API配置列表 -->
          <div class="config-list">
            <el-card v-for="config in apiStore.configs" :key="config.id" class="config-card">
              <div class="config-header">
                <div class="config-info">
                  <h4>{{ config.name }}</h4>
                  <el-tag :type="config.isDefault ? 'success' : 'info'" size="small">
                    {{ config.isDefault ? '默认' : '备用' }}
                  </el-tag>
                  <el-tag size="small" style="margin-left: 8px">
                    {{ getProviderLabel(config.provider) }}
                  </el-tag>
                </div>
                <div class="config-actions">
                  <el-button size="small" @click="handleTestConfig(config)" :loading="testingConfigId === config.id">
                    <el-icon><Connection /></el-icon>
                    测试
                  </el-button>
                  <el-button size="small" @click="handleEditConfig(config)">
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-button>
                  <el-button size="small" type="danger" @click="handleDeleteConfig(config.id)">
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </div>
              </div>
              <div class="config-details">
                <div class="detail-item">
                  <label>模型：</label>
                  <span>{{ config.model }}</span>
                </div>
                <div class="detail-item">
                  <label>API地址：</label>
                  <span>{{ config.baseURL || '默认' }}</span>
                </div>
                <div class="detail-item">
                  <label>温度：</label>
                  <span>{{ config.temperature }}</span>
                </div>
                <div class="detail-item">
                  <label>最大Token：</label>
                  <span>{{ config.maxTokens }}</span>
                </div>
              </div>
            </el-card>
          </div>

          <el-empty v-if="apiStore.configs.length === 0" description="暂无API配置" />
        </div>
      </el-tab-pane>

      <!-- 应用设置 -->
      <el-tab-pane label="应用设置" name="app">
        <div class="tab-content">
          <el-form :model="settingsForm" label-width="120px" style="max-width: 600px">
            <el-form-item label="主题">
              <el-radio-group v-model="settingsForm.theme">
                <el-radio label="light">浅色</el-radio>
                <el-radio label="dark">深色</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="自动保存">
              <el-switch v-model="settingsForm.autoSave" />
            </el-form-item>

            <el-form-item label="保存间隔" v-if="settingsForm.autoSave">
              <el-input-number
                v-model="settingsForm.autoSaveInterval"
                :min="5000"
                :step="5000"
                :disabled="!settingsForm.autoSave"
              />
              <span style="margin-left: 8px">毫秒</span>
            </el-form-item>

            <el-form-item label="字体大小">
              <el-input-number
                v-model="settingsForm.fontSize"
                :min="12"
                :max="24"
                :step="1"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleSaveSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 关于 -->
      <el-tab-pane label="关于" name="about">
        <div class="tab-content">
          <el-card>
            <h3>AI写作助手</h3>
            <p>版本：1.0.0</p>
            <p>一款功能完整的AI辅助写作工具</p>

            <h4>功能特性</h4>
            <ul>
              <li>支持多家主流AI服务提供商</li>
              <li>自定义提示词模板</li>
              <li>完整的书籍和章节管理</li>
              <li>大纲功能（故事梗概、人物设定、世界观）</li>
              <li>AI续写、润色、风格转换等功能</li>
              <li>多格式导出（TXT、MD、EPUB、PDF）</li>
            </ul>

            <h4>支持的AI服务</h4>
            <ul>
              <li>OpenAI (GPT-4, GPT-3.5)</li>
              <li>Anthropic (Claude)</li>
              <li>DeepSeek</li>
              <li>智谱AI (GLM)</li>
              <li>本地模型 (Ollama)</li>
              <li>自定义API端点</li>
            </ul>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- API配置对话框 -->
    <el-dialog
      v-model="configDialogVisible"
      :title="configDialogMode === 'create' ? '添加API配置' : '编辑API配置'"
      width="600px"
    >
      <el-form :model="configForm" :rules="configRules" ref="configFormRef" label-width="100px">
        <el-form-item label="配置名称" prop="name">
          <el-input v-model="configForm.name" placeholder="请输入配置名称" />
        </el-form-item>

        <el-form-item label="服务商" prop="provider">
          <el-select
            v-model="configForm.provider"
            placeholder="请选择服务商"
            @change="handleProviderChange"
            style="width: 100%"
          >
            <el-option
              v-for="option in apiStore.providerOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="API密钥" prop="apiKey">
          <el-input
            v-model="configForm.apiKey"
            type="password"
            placeholder="请输入API密钥"
            show-password
          />
        </el-form-item>

        <el-form-item label="API地址" prop="baseURL" v-if="configForm.provider === 'custom' || configForm.provider === 'ollama'">
          <el-input v-model="configForm.baseURL" placeholder="请输入API地址（可选）" />
        </el-form-item>

        <el-form-item label="模型" prop="model">
          <el-select v-model="configForm.model" placeholder="请选择模型" allow-create filterable style="width: 100%">
            <el-option
              v-for="model in modelOptions"
              :key="model"
              :label="model"
              :value="model"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="温度">
          <el-slider v-model="configForm.temperature" :min="0" :max="2" :step="0.1" />
        </el-form-item>

        <el-form-item label="最大Token">
          <el-input-number v-model="configForm.maxTokens" :min="100" :max="32000" :step="100" />
        </el-form-item>

        <el-form-item label="设为默认">
          <el-switch v-model="configForm.isDefault" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="configDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfigSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApiStore } from '../stores/api'
import { useSettingsStore } from '../stores/settings'
import { ElMessage } from 'element-plus'
import type { ApiConfig } from '../types'

const apiStore = useApiStore()
const settingsStore = useSettingsStore()

const activeTab = ref('api')
const configDialogVisible = ref(false)
const configDialogMode = ref<'create' | 'edit'>('create')
const configFormRef = ref()
const testingConfigId = ref<string | null>(null)

const configForm = ref({
  id: '',
  name: '',
  provider: 'openai' as ApiConfig['provider'],
  apiKey: '',
  baseURL: '',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
  isDefault: false
})

const configRules = {
  name: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
  provider: [{ required: true, message: '请选择服务商', trigger: 'change' }],
  apiKey: [{ required: true, message: '请输入API密钥', trigger: 'blur' }],
  model: [{ required: true, message: '请选择模型', trigger: 'change' }]
}

const settingsForm = ref({
  theme: 'light' as 'light' | 'dark',
  autoSave: true,
  autoSaveInterval: 30000,
  fontSize: 16
})

const modelOptions = computed(() => {
  const models: Record<string, string[]> = {
    openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    anthropic: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    deepseek: ['deepseek-chat', 'deepseek-coder'],
    zhipu: ['glm-4', 'glm-3-turbo'],
    ollama: ['llama2', 'mistral', 'codellama'],
    custom: ['gpt-3.5-turbo', 'gpt-4']
  }
  return models[configForm.value.provider] || []
})

onMounted(async () => {
  await apiStore.loadConfigs()
  await settingsStore.loadSettings()
  settingsForm.value = { ...settingsStore.settings }
})

function handleCreateConfig() {
  configDialogMode.value = 'create'
  configForm.value = {
    id: '',
    name: '',
    provider: 'openai',
    apiKey: '',
    baseURL: '',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    isDefault: false
  }
  configDialogVisible.value = true
}

function handleEditConfig(config: ApiConfig) {
  configDialogMode.value = 'edit'
  configForm.value = { ...config }
  configDialogVisible.value = true
}

async function handleConfigSubmit() {
  try {
    await configFormRef.value.validate()

    const data = {
      name: configForm.value.name,
      provider: configForm.value.provider,
      apiKey: configForm.value.apiKey,
      baseURL: configForm.value.baseURL,
      model: configForm.value.model,
      temperature: configForm.value.temperature,
      maxTokens: configForm.value.maxTokens,
      isDefault: configForm.value.isDefault
    }

    if (configDialogMode.value === 'create') {
      await apiStore.createConfig(data)
      ElMessage.success('配置已添加')
    } else {
      await apiStore.updateConfig(configForm.value.id, data)
      ElMessage.success('配置已更新')
    }

    configDialogVisible.value = false
  } catch {
    ElMessage.error('请填写完整信息')
  }
}

async function handleTestConfig(config: ApiConfig) {
  testingConfigId.value = config.id
  try {
    const result = await apiStore.testConfig(config)
    if (result) {
      ElMessage.success('API连接成功')
    } else {
      ElMessage.error('API连接失败')
    }
  } catch {
    ElMessage.error('API连接失败')
  } finally {
    testingConfigId.value = null
  }
}

async function handleDeleteConfig(configId: string) {
  await apiStore.deleteConfig(configId)
  ElMessage.success('配置已删除')
}

function handleProviderChange() {
  // 切换服务商时更新默认模型
  const defaultModels: Record<string, string> = {
    openai: 'gpt-4',
    anthropic: 'claude-3-sonnet-20240229',
    deepseek: 'deepseek-chat',
    zhipu: 'glm-4',
    ollama: 'llama2',
    custom: 'gpt-3.5-turbo'
  }
  configForm.value.model = defaultModels[configForm.value.provider] || 'gpt-3.5-turbo'
}

function getProviderLabel(provider: ApiConfig['provider']): string {
  const option = apiStore.providerOptions.find(o => o.value === provider)
  return option?.label || provider
}

async function handleSaveSettings() {
  await settingsStore.updateSettings(settingsForm.value)
  ElMessage.success('设置已保存')
}
</script>

<style scoped>
.settings-page {
  padding: 24px;
  min-height: 100%;
}

.settings-page h2 {
  margin: 0 0 24px;
  color: #303133;
}

.tab-content {
  padding: 16px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: #303133;
}

.config-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-card {
  border: 1px solid #e4e7ed;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.config-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.config-info h4 {
  margin: 0;
  color: #303133;
}

.config-actions {
  display: flex;
  gap: 8px;
}

.config-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-item label {
  color: #909399;
  font-size: 14px;
  min-width: 80px;
}

.detail-item span {
  color: #303133;
  font-size: 14px;
}

.tab-content h4 {
  margin: 20px 0 12px;
  color: #303133;
}

.tab-content ul {
  margin: 0;
  padding-left: 20px;
}

.tab-content li {
  margin-bottom: 8px;
  color: #606266;
}
</style>
