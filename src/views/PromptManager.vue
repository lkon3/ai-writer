<template>
  <div class="prompt-manager-page">
    <div class="page-header">
      <h2>提示词管理</h2>
      <div class="header-actions">
        <el-button @click="handleImport">
          <el-icon><Upload /></el-icon>
          导入
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建提示词
        </el-button>
      </div>
    </div>

    <!-- 分类筛选 -->
    <div class="category-filter">
      <el-radio-group v-model="selectedCategory" @change="handleCategoryChange">
        <el-radio-button label="全部" />
        <el-radio-button
          v-for="category in allCategories"
          :key="category"
          :label="category"
        />
      </el-radio-group>
    </div>

    <!-- 提示词列表 -->
    <div class="prompt-list">
      <el-table :data="filteredPrompts" style="width: 100%">
        <el-table-column prop="name" label="名称" width="200" />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" />
        <el-table-column label="变量" width="150">
          <template #default="{ row }">
            <el-tag
              v-for="variable in row.variables"
              :key="variable"
              size="small"
              style="margin-right: 4px"
            >
              {{ variable }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id!)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新建提示词' : '编辑提示词'"
      width="700px"
    >
      <el-form :model="promptForm" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="promptForm.name" placeholder="请输入提示词名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select
            v-model="promptForm.category"
            placeholder="请选择或输入分类"
            allow-create
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="category in allCategories"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="promptForm.description" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="提示词内容" prop="content">
          <div style="margin-bottom: 8px;">
            <span style="color: #606266; font-size: 13px;">常用变量（点击插入）：</span>
            <el-tooltip
              v-for="varInfo in commonVariables"
              :key="varInfo.name"
              :content="varInfo.desc"
              placement="top"
            >
              <el-tag
                size="small"
                style="margin-left: 4px; margin-right: 4px; margin-bottom: 4px; cursor: pointer;"
                @click="insertVariable(varInfo.name)"
              >
                {{ varInfo.name }}
              </el-tag>
            </el-tooltip>
          </div>
          <el-input
            v-model="promptForm.content"
            type="textarea"
            :rows="10"
            placeholder="请输入提示词内容，使用 {变量名} 表示变量&#10;&#10;例如：请将以下{content}改为{style}风格&#10;注意：必须使用英文花括号 {}，不要使用中文花括号 ｛｝"
          />
          <div style="margin-top: 8px; font-size: 12px;">
            <span v-if="extractedVariables.length > 0" style="color: #67c23a;">
              ✓ 已识别变量：{{ extractedVariables.join('、') }}
            </span>
            <span v-else style="color: #909399;">
              未识别到变量，请使用英文花括号，例如：{变量名}
            </span>
          </div>
        </el-form-item>
        <el-form-item label="变量">
          <div v-if="extractedVariables.length > 0" style="display: flex; flex-wrap: wrap; gap: 8px;">
            <el-tag
              v-for="variable in extractedVariables"
              :key="variable"
              closable
              @close="handleRemoveVariable(variable)"
            >
              {{ variable }}
            </el-tag>
          </div>
          <div v-else style="color: #909399; font-size: 13px;">
            在内容中使用 {变量名} 格式来定义变量
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看对话框 -->
    <el-dialog v-model="viewDialogVisible" title="提示词详情" width="600px">
      <div v-if="currentPrompt" class="prompt-detail">
        <div class="detail-item">
          <label>名称：</label>
          <span>{{ currentPrompt.name }}</span>
        </div>
        <div class="detail-item">
          <label>分类：</label>
          <el-tag>{{ currentPrompt.category }}</el-tag>
        </div>
        <div class="detail-item">
          <label>描述：</label>
          <span>{{ currentPrompt.description }}</span>
        </div>
        <div class="detail-item">
          <label>内容：</label>
          <pre class="prompt-content">{{ currentPrompt.content }}</pre>
        </div>
        <div class="detail-item" v-if="currentPrompt.variables.length > 0">
          <label>变量：</label>
          <el-tag
            v-for="variable in currentPrompt.variables"
            :key="variable"
            style="margin-right: 8px"
          >
            {{ variable }}
          </el-tag>
        </div>
      </div>
    </el-dialog>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleFileChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePromptStore } from '../stores/prompt'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Prompt } from '../types'

const promptStore = usePromptStore()

// 常用变量列表
const commonVariables = [
  { name: '{content}', desc: '要处理的内容' },
  { name: '{style}', desc: '目标风格' },
  { name: '{length}', desc: '字数要求' },
  { name: '{scene}', desc: '场景描述' },
  { name: '{characters}', desc: '角色信息' },
  { name: '{genre}', desc: '作品类型' },
  { name: '{tone}', desc: '语气语调' },
  { name: '{audience}', desc: '目标读者' }
]

// 默认分类选项
const defaultCategories = [
  '写作辅助',
  '文字优化',
  '对话生成',
  '风格转换',
  '创意构思',
  '人物设定',
  '情节设计',
  '场景描写'
]

const selectedCategory = ref('全部')
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const formRef = ref()
const fileInputRef = ref()
const currentPrompt = ref<Prompt | null>(null)

const promptForm = ref({
  id: '',
  name: '',
  category: '',
  description: '',
  content: '',
  variables: [] as string[]
})

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入提示词内容', trigger: 'blur' }]
}

// 所有分类选项（默认分类 + 已有分类，去重）
const allCategories = computed(() => {
  const categories = new Set([...defaultCategories, ...promptStore.categories])
  return Array.from(categories)
})

const filteredPrompts = computed(() => {
  if (selectedCategory.value === '全部') {
    return promptStore.prompts
  }
  return promptStore.prompts.filter(p => p.category === selectedCategory.value)
})

const extractedVariables = computed(() => {
  const matches = promptForm.value.content.match(/\{([^}]+)\}/g) || []
  return [...new Set(matches.map(m => m.slice(1, -1)))]
})

onMounted(async () => {
  await promptStore.loadPrompts()
})

function handleCategoryChange() {
  // 分类变化时自动过滤
}

function handleCreate() {
  dialogMode.value = 'create'
  promptForm.value = {
    id: '',
    name: '',
    category: '',
    description: '',
    content: '',
    variables: []
  }
  dialogVisible.value = true
}

function handleEdit(prompt: Prompt) {
  dialogMode.value = 'edit'
  promptForm.value = {
    id: prompt.id!,
    name: prompt.name,
    category: prompt.category,
    description: prompt.description,
    content: prompt.content,
    variables: [...prompt.variables]
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  try {
    await formRef.value.validate()

    const data = {
      name: promptForm.value.name,
      category: promptForm.value.category,
      description: promptForm.value.description,
      content: promptForm.value.content,
      variables: extractedVariables.value
    }

    if (dialogMode.value === 'create') {
      await promptStore.createPrompt(data)
      ElMessage.success('提示词创建成功')
    } else {
      await promptStore.updatePrompt(promptForm.value.id, data)
      ElMessage.success('提示词更新成功')
    }

    dialogVisible.value = false
  } catch {
    ElMessage.error('请填写完整信息')
  }
}

async function handleDelete(promptId: string) {
  try {
    await ElMessageBox.confirm('确定删除此提示词吗？', '提示', {
      type: 'warning'
    })
    await promptStore.deletePrompt(promptId)
    ElMessage.success('提示词已删除')
  } catch {
    // 用户取消
  }
}

function handleView(prompt: Prompt) {
  currentPrompt.value = prompt
  viewDialogVisible.value = true
}

function handleRemoveVariable(variable: string) {
  promptForm.value.content = promptForm.value.content.replace(
    new RegExp(`\\{${variable}\\}`, 'g'),
    ''
  )
}

// 插入变量到光标位置
function insertVariable(variableName: string) {
  const textarea = document.querySelector('textarea') as HTMLTextAreaElement
  const start = textarea?.selectionStart || promptForm.value.content.length
  const end = textarea?.selectionEnd || promptForm.value.content.length

  const before = promptForm.value.content.substring(0, start)
  const after = promptForm.value.content.substring(end)

  promptForm.value.content = before + variableName + after

  // 设置光标位置到插入的变量后面
  setTimeout(() => {
    textarea?.setSelectionRange(start + variableName.length, start + variableName.length)
    textarea?.focus()
  }, 0)
}

async function handleExport() {
  try {
    const json = await promptStore.exportPrompts()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prompts_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch {
    ElMessage.error('导出失败')
  }
}

function handleImport() {
  fileInputRef.value?.click()
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    try {
      const text = await file.text()
      const count = await promptStore.importPrompts(text)
      ElMessage.success(`成功导入 ${count} 个提示词`)
    } catch (e: any) {
      ElMessage.error(e.message)
    }
    target.value = ''
  }
}
</script>

<style scoped>
.prompt-manager-page {
  padding: 24px;
  min-height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.category-filter {
  margin-bottom: 24px;
}

.prompt-list {
  background-color: #fff;
  border-radius: 4px;
  padding: 16px;
}

.prompt-detail {
  padding: 16px;
}

.detail-item {
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
}

.detail-item label {
  font-weight: 600;
  min-width: 80px;
  color: #606266;
}

.prompt-content {
  flex: 1;
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}
</style>
