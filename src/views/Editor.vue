<template>
  <div class="editor-page">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="book-selector">
        <el-select
          v-model="selectedBookId"
          placeholder="选择书籍"
          @change="handleBookChange"
          style="width: 200px"
        >
          <el-option
            v-for="book in bookStore.books"
            :key="book.id"
            :label="book.title"
            :value="book.id"
          />
        </el-select>
      </div>

      <div class="toolbar-actions">
        <el-button type="primary" @click="handleSave" :loading="saving">
          <el-icon><DocumentCheck /></el-icon>
          保存
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>

    <div class="editor-container" v-if="currentBook">
      <!-- 左侧章节导航 -->
      <div class="chapter-panel">
        <div class="panel-header">
          <h4>章节</h4>
          <el-button size="small" @click="handleAddChapter">
            <el-icon><Plus /></el-icon>
            新建
          </el-button>
        </div>
        <div class="chapter-list">
          <div
            v-for="chapter in bookStore.chapters"
            :key="chapter.id"
            class="chapter-item"
            :class="{ active: currentChapter?.id === chapter.id }"
            @click="handleSelectChapter(chapter)"
          >
            <div class="chapter-title">
              <el-icon><Document /></el-icon>
              {{ chapter.title }}
            </div>
            <div class="chapter-actions">
              <el-button size="small" text @click.stop="handleEditChapter(chapter)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button size="small" text @click.stop="handleSplitChapter(chapter)" :disabled="!chapter.content || chapter.wordCount < 100">
                <el-icon><Crop /></el-icon>
              </el-button>
              <el-button size="small" text type="danger" @click.stop="handleDeleteChapter(chapter.id!)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 中央编辑区 -->
      <div class="editor-main">
        <div v-if="currentChapter" class="chapter-editor">
          <input
            v-model="currentChapter.title"
            class="chapter-title-input"
            @blur="updateChapterTitle"
          />
          <div class="word-count">字数：{{ currentChapter.wordCount }}</div>
          <textarea
            v-model="currentChapter.content"
            class="content-textarea"
            @input="handleContentChange"
            placeholder="开始写作..."
          />
        </div>
        <div v-else class="empty-state">
          <el-empty description="请选择或创建章节">
            <el-button type="primary" @click="handleAddChapter">创建第一章</el-button>
          </el-empty>
        </div>
      </div>

      <!-- 右侧AI助手 -->
      <div class="ai-panel">
        <div class="panel-header">
          <h4>AI助手</h4>
        </div>

        <!-- 快捷操作 -->
        <div class="quick-actions">
          <el-button-group>
            <el-button size="small" @click="handleAIAction('continue')">
              <el-icon><MagicStick /></el-icon>
              续写
            </el-button>
            <el-button size="small" @click="handleAIAction('rewrite')">
              <el-icon><Refresh /></el-icon>
              润色
            </el-button>
          </el-button-group>
        </div>

        <!-- 提示词选择 -->
        <div class="prompt-selector">
          <el-select v-model="selectedPromptId" placeholder="选择提示词" size="small" style="flex: 1">
            <el-option
              v-for="prompt in promptStore.prompts"
              :key="prompt.id"
              :label="prompt.name"
              :value="prompt.id"
            />
          </el-select>
          <el-button size="small" @click="handleUsePrompt" :disabled="!selectedPromptId">
            使用
          </el-button>
        </div>

        <!-- 生成内容 -->
        <div class="ai-content">
          <el-input
            v-model="aiPrompt"
            type="textarea"
            :rows="4"
            placeholder="输入AI指令..."
          />
          <el-button
            type="primary"
            @click="handleGenerate"
            :loading="apiStore.isLoading"
            style="margin-top: 12px; width: 100%"
          >
            生成
          </el-button>
        </div>

        <!-- 生成结果 -->
        <div v-if="generatedContent" class="generated-result">
          <div class="result-header">
            <span>生成结果</span>
            <el-button size="small" text @click="insertGenerated">
              <el-icon><Plus /></el-icon>
              插入
            </el-button>
          </div>
          <div class="result-content">{{ generatedContent }}</div>
        </div>
      </div>
    </div>

    <div v-else class="empty-page">
      <el-empty description="请先创建或选择一本书籍">
        <el-button type="primary" @click="router.push('/books')">创建书籍</el-button>
      </el-empty>
    </div>

    <!-- 章节编辑对话框 -->
    <el-dialog v-model="chapterDialogVisible" title="编辑章节" width="500px">
      <el-form :model="chapterForm" label-width="80px">
        <el-form-item label="章节标题">
          <el-input v-model="chapterForm.title" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="chapterDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleChapterDialogConfirm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 变量输入对话框 -->
    <el-dialog v-model="variableDialogVisible" title="填写变量" width="500px">
      <el-form :model="variableForm" label-width="100px">
        <el-form-item
          v-for="variable in currentPromptVariables"
          :key="variable"
          :label="variable"
        >
          <el-input
            v-model="variableForm[variable]"
            :placeholder="`请输入${variable}`"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="variableDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleVariableConfirm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 拆分章节对话框 -->
    <el-dialog v-model="splitDialogVisible" title="拆分章节" width="600px">
      <el-form :model="splitForm" label-width="100px">
        <el-form-item label="拆分方式">
          <el-radio-group v-model="splitForm.mode">
            <el-radio label="wordcount">按字数拆分</el-radio>
            <el-radio label="paragraph">按段落数拆分</el-radio>
            <el-radio label="marker">按标记拆分</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="splitForm.mode === 'wordcount'" label="每节字数">
          <el-input-number
            v-model="splitForm.wordCount"
            :min="500"
            :max="10000"
            :step="100"
          />
          <span style="margin-left: 8px; color: #909399;">字</span>
        </el-form-item>

        <el-form-item v-if="splitForm.mode === 'paragraph'" label="每节段落数">
          <el-input-number
            v-model="splitForm.paragraphCount"
            :min="1"
            :max="50"
          />
          <span style="margin-left: 8px; color: #909399;">个段落</span>
        </el-form-item>

        <el-form-item v-if="splitForm.mode === 'marker'" label="拆分标记">
          <el-input
            v-model="splitForm.marker"
            placeholder="例如：=== 或 【拆分】"
            style="width: 200px"
          />
          <div style="margin-top: 8px; color: #909399; font-size: 12px;">
            在内容中插入此标记，拆分时会从这里分开
          </div>
        </el-form-item>

        <el-form-item label="预计拆分">
          <div style="color: #409eff;">
            {{ splitPreview.parts }} 部分，平均每部分约 {{ splitPreview.avgWords }} 字
          </div>
        </el-form-item>

        <el-form-item label="预览">
          <div style="max-height: 200px; overflow-y: auto; border: 1px solid #e4e7ed; padding: 12px; border-radius: 4px;">
            <div
              v-for="(part, index) in splitPreview.preview"
              :key="index"
              style="padding: 8px; border-bottom: 1px solid #f0f0f0;"
            >
              <div style="font-weight: 600; margin-bottom: 4px;">第 {{ index + 1 }} 部分</div>
              <div style="color: #606266; font-size: 12px;">{{ part.substring(0, 100) }}{{ part.length > 100 ? '...' : '' }}</div>
              <div style="color: #909399; font-size: 12px; margin-top: 4px;">{{ part.length }} 字</div>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="splitDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSplitConfirm">确定拆分</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBookStore } from '../stores/book'
import { useApiStore } from '../stores/api'
import { usePromptStore } from '../stores/prompt'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Chapter } from '../types'

const router = useRouter()
const bookStore = useBookStore()
const apiStore = useApiStore()
const promptStore = usePromptStore()

const selectedBookId = ref<string>('')
const currentBook = computed(() => bookStore.currentBook)
const currentChapter = computed(() => bookStore.currentChapter)
const saving = ref(false)
const selectedPromptId = ref<string>('')
const aiPrompt = ref('')
const generatedContent = ref('')

// 章节编辑
const chapterDialogVisible = ref(false)
const chapterForm = ref({ title: '', id: '' })

// 变量输入
const variableDialogVisible = ref(false)
const variableForm = ref<Record<string, string>>({})
const currentPromptVariables = computed(() => {
  if (!selectedPromptId.value) return []
  const prompt = promptStore.prompts.find(p => p.id === selectedPromptId.value)
  return prompt?.variables || []
})

// 拆分章节
const splitDialogVisible = ref(false)
const splitChapter = ref<Chapter | null>(null)
const splitForm = ref({
  mode: 'wordcount',
  wordCount: 2000,
  paragraphCount: 5,
  marker: '==='
})

// 拆分预览
const splitPreview = computed(() => {
  if (!splitChapter.value?.content) {
    return { parts: 0, avgWords: 0, preview: [] }
  }

  const content = splitChapter.value.content
  let parts: string[] = []

  if (splitForm.value.mode === 'wordcount') {
    const wordCount = splitForm.value.wordCount
    for (let i = 0; i < content.length; i += wordCount) {
      parts.push(content.substring(i, i + wordCount))
    }
  } else if (splitForm.value.mode === 'paragraph') {
    const paragraphs = content.split(/\n\n+/)
    const perPart = splitForm.value.paragraphCount
    for (let i = 0; i < paragraphs.length; i += perPart) {
      parts.push(paragraphs.slice(i, i + perPart).join('\n\n'))
    }
  } else if (splitForm.value.mode === 'marker') {
    parts = content.split(splitForm.value.marker).filter(p => p.trim())
  }

  const totalWords = content.length
  return {
    parts: parts.length,
    avgWords: parts.length > 0 ? Math.round(totalWords / parts.length) : 0,
    preview: parts.slice(0, 5) // 只显示前5部分
  }
})

onMounted(async () => {
  await bookStore.loadBooks()
  await promptStore.loadPrompts()
  await apiStore.loadDefaultConfig()

  if (bookStore.books.length > 0) {
    const bookId = router.query.bookId as string
    if (bookId) {
      selectedBookId.value = bookId
      await handleBookChange(bookId)
    } else {
      selectedBookId.value = bookStore.books[0].id!
      await handleBookChange(selectedBookId.value)
    }
  }
})

async function handleBookChange(bookId: string) {
  await bookStore.loadBook(bookId)
  if (bookStore.chapters.length > 0) {
    bookStore.setCurrentChapter(bookStore.chapters[0])
  }
}

async function handleSelectChapter(chapter: Chapter) {
  bookStore.setCurrentChapter(chapter)
}

async function handleAddChapter() {
  if (!currentBook.value) return

  const count = bookStore.chapters.length
  const newChapter = await bookStore.createChapter({
    bookId: currentBook.value.id!,
    title: `第${count + 1}章`,
    content: '',
    sortOrder: count,
    wordCount: 0
  })

  bookStore.setCurrentChapter(newChapter)
  ElMessage.success('章节已创建')
}

function handleEditChapter(chapter: Chapter) {
  chapterForm.value = {
    id: chapter.id!,
    title: chapter.title
  }
  chapterDialogVisible.value = true
}

async function handleChapterDialogConfirm() {
  await bookStore.updateChapter(chapterForm.value.id, { title: chapterForm.value.title })
  chapterDialogVisible.value = false
  ElMessage.success('章节已更新')
}

async function handleDeleteChapter(chapterId: string) {
  try {
    await ElMessageBox.confirm('确定删除此章节吗？', '提示', {
      type: 'warning'
    })
    await bookStore.deleteChapter(chapterId)
    ElMessage.success('章节已删除')
  } catch {
    // 用户取消
  }
}

async function handleContentChange() {
  if (currentChapter.value) {
    const wordCount = currentChapter.value.content.length
    await bookStore.updateChapter(currentChapter.value.id!, {
      content: currentChapter.value.content,
      wordCount
    })
  }
}

async function updateChapterTitle() {
  if (currentChapter.value) {
    await bookStore.updateChapter(currentChapter.value.id!, {
      title: currentChapter.value.title
    })
  }
}

async function handleSave() {
  saving.value = true
  try {
    if (currentChapter.value) {
      await handleContentChange()
    }
    ElMessage.success('保存成功')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

function handleExport() {
  ElMessage.info('导出功能开发中...')
}

async function handleAIAction(type: string) {
  if (!currentChapter.value?.content) {
    ElMessage.warning('请先输入一些内容')
    return
  }

  switch (type) {
    case 'continue':
      aiPrompt.value = '请续写以下内容：'
      break
    case 'rewrite':
      aiPrompt.value = '请润色以下内容：'
      break
  }
}

async function handleGenerate() {
  if (!apiStore.currentConfig) {
    ElMessage.warning('请先在设置中配置API')
    router.push('/settings')
    return
  }

  if (!currentChapter.value) {
    ElMessage.warning('请先选择章节')
    return
  }

  try {
    const result = await apiStore.generate(
      aiPrompt.value + '\n\n' + (currentChapter.value.content?.slice(-500) || ''),
      currentChapter.value.content,
      'continue'
    )
    generatedContent.value = result.content
  } catch (error: any) {
    ElMessage.error(error.message || '生成失败')
  }
}

function insertGenerated() {
  if (currentChapter.value && generatedContent.value) {
    currentChapter.value.content += generatedContent.value
    generatedContent.value = ''
    handleContentChange()
  }
}

// 使用提示词
function handleUsePrompt() {
  if (!selectedPromptId.value) return

  const prompt = promptStore.prompts.find(p => p.id === selectedPromptId.value)
  if (!prompt) return

  // 如果没有变量，直接使用
  if (prompt.variables.length === 0) {
    aiPrompt.value = prompt.content
    return
  }

  // 有变量，打开输入对话框
  variableForm.value = {}
  prompt.variables.forEach(v => {
    variableForm.value[v] = ''
  })
  variableDialogVisible.value = true
}

// 确认变量输入
function handleVariableConfirm() {
  const prompt = promptStore.prompts.find(p => p.id === selectedPromptId.value)
  if (!prompt) return

  // 替换变量
  let content = prompt.content
  prompt.variables.forEach(variable => {
    const value = variableForm.value[variable] || ''
    content = content.replace(new RegExp(`\\{${variable}\\}`, 'g'), value)
  })

  aiPrompt.value = content
  variableDialogVisible.value = false
}

// 拆分章节
function handleSplitChapter(chapter: Chapter) {
  if (!chapter.content || chapter.wordCount < 100) {
    ElMessage.warning('内容太少，无需拆分')
    return
  }
  splitChapter.value = chapter
  splitDialogVisible.value = true
}

// 确认拆分
async function handleSplitConfirm() {
  if (!splitChapter.value || !currentBook.value) return

  const content = splitChapter.value.content
  let parts: string[] = []

  // 执行拆分
  if (splitForm.value.mode === 'wordcount') {
    const wordCount = splitForm.value.wordCount
    for (let i = 0; i < content.length; i += wordCount) {
      parts.push(content.substring(i, i + wordCount))
    }
  } else if (splitForm.value.mode === 'paragraph') {
    const paragraphs = content.split(/\n\n+/)
    const perPart = splitForm.value.paragraphCount
    for (let i = 0; i < paragraphs.length; i += perPart) {
      const part = paragraphs.slice(i, i + perPart).join('\n\n')
      if (part.trim()) parts.push(part)
    }
  } else if (splitForm.value.mode === 'marker') {
    parts = content.split(splitForm.value.marker).filter(p => p.trim())
  }

  if (parts.length <= 1) {
    ElMessage.warning('无法拆分，请调整拆分参数')
    return
  }

  try {
    // 确认拆分
    await ElMessageBox.confirm(
      `将把"${splitChapter.value.title}"拆分成 ${parts.length} 个部分，原章节将被保留。确定继续？`,
      '确认拆分',
      { type: 'warning' }
    )

    const baseTitle = splitChapter.value.title.replace(/ \(\d+\)$/, '')
    const startIndex = bookStore.chapters.findIndex(c => c.id === splitChapter.value!.id)

    // 创建新章节
    for (let i = 0; i < parts.length; i++) {
      await bookStore.createChapter({
        bookId: currentBook.value.id!,
        title: `${baseTitle} (${i + 1})`,
        content: parts[i].trim(),
        sortOrder: startIndex + i + 1,
        wordCount: parts[i].length
      })
    }

    ElMessage.success(`成功拆分成 ${parts.length} 个章节`)
    splitDialogVisible.value = false

    // 刷新章节列表
    await bookStore.loadChapters(currentBook.value.id!)
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.editor-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.toolbar-actions {
  display: flex;
  gap: 12px;
}

.editor-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.chapter-panel {
  width: 250px;
  background-color: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.panel-header h4 {
  margin: 0;
  font-size: 14px;
}

.chapter-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.chapter-item {
  padding: 10px 12px;
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.chapter-item:hover {
  background-color: #ecf5ff;
}

.chapter-item.active {
  background-color: #409eff;
  color: #fff;
}

.chapter-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.chapter-actions {
  display: none;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e4e7ed;
}

.chapter-item:hover .chapter-actions {
  display: flex;
  gap: 4px;
}

.editor-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  overflow: hidden;
}

.chapter-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px;
}

.chapter-title-input {
  font-size: 24px;
  font-weight: 600;
  border: none;
  outline: none;
  padding: 8px 0;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 8px;
}

.word-count {
  color: #909399;
  font-size: 12px;
  margin-bottom: 16px;
}

.content-textarea {
  flex: 1;
  border: none;
  resize: none;
  font-size: 16px;
  line-height: 1.8;
  outline: none;
}

.ai-panel {
  width: 300px;
  background-color: #f5f7fa;
  border-left: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.quick-actions {
  margin-bottom: 16px;
}

.prompt-selector {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
}

.ai-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.generated-result {
  margin-top: 16px;
  padding: 12px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
}

.result-content {
  max-height: 200px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.empty-state,
.empty-page {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
