<template>
  <div class="book-analysis-page">
    <div class="page-header">
      <h2>AI拆书分析</h2>
      <el-button type="primary" @click="handleNewAnalysis">
        <el-icon><Plus /></el-icon>
        新建分析
      </el-button>
    </div>

    <!-- 分析表单 -->
    <el-card v-if="showForm" class="analysis-form">
      <h3>输入书籍内容</h3>
      <el-form :model="analysisForm" label-width="100px">
        <el-form-item label="书名">
          <el-input v-model="analysisForm.bookName" placeholder="请输入书名" />
        </el-form-item>
        <el-form-item label="书籍内容">
          <el-input
            v-model="analysisForm.content"
            type="textarea"
            :rows="15"
            placeholder="请粘贴书籍内容（建议输入开头3-5章，约5000-10000字，分析效果更佳）"
          />
          <div style="margin-top: 8px; color: #909399; font-size: 12px;">
            当前字数：{{ analysisForm.content.length }}
          </div>
        </el-form-item>
        <el-form-item label="分析类型">
          <el-checkbox-group v-model="analysisForm.analysisTypes">
            <el-checkbox label="opening">开头三章分析</el-checkbox>
            <el-checkbox label="plot">主线剧情</el-checkbox>
            <el-checkbox label="characters">人物分析</el-checkbox>
            <el-checkbox label="world">世界设定</el-checkbox>
            <el-checkbox label="style">写作风格</el-checkbox>
            <el-checkbox label="subplots">支线剧情</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAnalyze" :loading="analyzing" :disabled="!analysisForm.content">
            <el-icon><MagicStick /></el-icon>
            开始分析
          </el-button>
          <el-button @click="showForm = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 分析结果 -->
    <div v-if="analysisResult && !showForm" class="analysis-result">
      <el-card>
        <div class="result-header">
          <h3>{{ analysisForm.bookName || '书籍分析报告' }}</h3>
          <el-button type="primary" @click="handleNewAnalysis">
            <el-icon><Plus /></el-icon>
            新建分析
          </el-button>
        </div>

        <el-tabs v-model="activeTab">
          <el-tab-pane v-if="analysisResult.opening" label="开头分析">
            <div class="result-content">
              <h4>开头三章分析</h4>
              <div class="content">{{ analysisResult.opening }}</div>
            </div>
          </el-tab-pane>

          <el-tab-pane v-if="analysisResult.plot" label="主线剧情">
            <div class="result-content">
              <h4>主线剧情</h4>
              <div class="content">{{ analysisResult.plot }}</div>
            </div>
          </el-tab-pane>

          <el-tab-pane v-if="analysisResult.characters" label="人物分析">
            <div class="result-content">
              <h4>主要人物</h4>
              <div class="content">{{ analysisResult.characters }}</div>
            </div>
          </el-tab-pane>

          <el-tab-pane v-if="analysisResult.world" label="世界设定">
            <div class="result-content">
              <h4>世界观设定</h4>
              <div class="content">{{ analysisResult.world }}</div>
            </div>
          </el-tab-pane>

          <el-tab-pane v-if="analysisResult.style" label="写作风格">
            <div class="result-content">
              <h4>写作风格分析</h4>
              <div class="content">{{ analysisResult.style }}</div>
            </div>
          </el-tab-pane>

          <el-tab-pane v-if="analysisResult.subplots" label="支线剧情">
            <div class="result-content">
              <h4>支线剧情</h4>
              <div class="content">{{ analysisResult.subplots }}</div>
            </div>
          </el-tab-pane>
        </el-tabs>

        <div class="result-actions">
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>
            导出报告
          </el-button>
          <el-button @click="handleSaveToBook">
            <el-icon><Reading /></el-icon>
            保存到书籍大纲
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 空状态 -->
    <el-empty v-if="!analysisResult && !showForm" description="点击上方新建分析开始">
      <el-button type="primary" @click="handleNewAnalysis">新建分析</el-button>
    </el-empty>

    <!-- 保存到书籍对话框 -->
    <el-dialog v-model="saveToBookDialogVisible" title="保存到书籍" width="500px">
      <el-form :model="saveToBookForm" label-width="100px">
        <el-form-item label="选择书籍">
          <el-select v-model="saveToBookForm.bookId" placeholder="请选择书籍" style="width: 100%">
            <el-option
              v-for="book in bookStore.books"
              :key="book.id"
              :label="book.title"
              :value="book.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="saveToBookDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmSaveToBook">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBookStore } from '../stores/book'
import { useApiStore } from '../stores/api'
import { ElMessage } from 'element-plus'

const bookStore = useBookStore()
const apiStore = useApiStore()

const showForm = ref(false)
const analyzing = ref(false)
const activeTab = ref('opening')
const saveToBookDialogVisible = ref(false)

const analysisForm = ref({
  bookName: '',
  content: '',
  analysisTypes: ['opening', 'plot', 'characters', 'world', 'style', 'subplots'] as string[]
})

const analysisResult = ref<Record<string, string>>({})
const saveToBookForm = ref({ bookId: '' })

onMounted(async () => {
  await bookStore.loadBooks()
})

function handleNewAnalysis() {
  analysisForm.value = {
    bookName: '',
    content: '',
    analysisTypes: ['opening', 'plot', 'characters', 'world', 'style', 'subplots']
  }
  analysisResult.value = {}
  showForm.value = true
}

async function handleAnalyze() {
  if (!analysisForm.value.content.trim()) {
    ElMessage.warning('请输入书籍内容')
    return
  }

  if (analysisForm.value.analysisTypes.length === 0) {
    ElMessage.warning('请至少选择一种分析类型')
    return
  }

  if (!apiStore.currentConfig) {
    ElMessage.warning('请先在设置中配置API密钥')
    return
  }

  analyzing.value = true
  analysisResult.value = {}

  try {
    // 构建分析提示词
    const content = analysisForm.value.content.substring(0, 15000) // 限制长度

    // 开头分析
    if (analysisForm.value.analysisTypes.includes('opening')) {
      ElMessage.info('正在分析开头...')
      const openingPrompt = `请分析以下小说开头的吸引力和特点：\n\n${content}\n\n请从以下几个方面分析：\n1. 开篇方式（直接切入/倒叙/伏笔等）\n2. 开头节奏\n3. 人物引入方式\n4. 世界观建立方式\n5. 悬念设置\n6. 改进建议`
      const opening = await apiStore.generate(openingPrompt, '', 'custom')
      analysisResult.value.opening = opening.content
    }

    // 主线剧情
    if (analysisForm.value.analysisTypes.includes('plot')) {
      ElMessage.info('正在分析主线剧情...')
      const plotPrompt = `请分析以下小说内容的主线剧情：\n\n${content}\n\n请分析：\n1. 核心冲突是什么\n2. 主角的目标\n3. 故事主线走向\n4. 主要转折点\n5. 预期的结局走向`
      const plot = await apiStore.generate(plotPrompt, '', 'custom')
      analysisResult.value.plot = plot.content
    }

    // 人物分析
    if (analysisForm.value.analysisTypes.includes('characters')) {
      ElMessage.info('正在分析人物...')
      const charactersPrompt = `请分析以下小说内容中的主要人物：\n\n${content}\n\n请分析：\n1. 主要角色有哪些\n2. 每个角色的性格特点\n3. 角色之间的关系\n4. 角色动机\n5. 角色成长空间`
      const characters = await apiStore.generate(charactersPrompt, '', 'custom')
      analysisResult.value.characters = characters.content
    }

    // 世界设定
    if (analysisForm.value.analysisTypes.includes('world')) {
      ElMessage.info('正在分析世界设定...')
      const worldPrompt = `请分析以下小说内容的世界观设定：\n\n${content}\n\n请分析：\n1. 时代背景\n2. 地理环境\n3. 社会结构\n4. 力量体系（如果有）\n5. 特殊规则\n6. 世界观的完整性和一致性`
      const world = await apiStore.generate(worldPrompt, '', 'custom')
      analysisResult.value.world = world.content
    }

    // 写作风格
    if (analysisForm.value.analysisTypes.includes('style')) {
      ElMessage.info('正在分析写作风格...')
      const stylePrompt = `请分析以下小说内容的写作风格：\n\n${content}\n\n请分析：\n1. 叙述视角（第一人称/第三人称）\n2. 语言风格（朴实/华丽/幽默等）\n3. 节奏特点\n4. 描写方式\n5. 对话特点\n6. 风格建议`
      const style = await apiStore.generate(stylePrompt, '', 'custom')
      analysisResult.value.style = style.content
    }

    // 支线剧情
    if (analysisForm.value.analysisTypes.includes('subplots')) {
      ElMessage.info('正在分析支线剧情...')
      const subplotsPrompt = `请分析以下小说内容中的支线剧情：\n\n${content}\n\n请分析：\n1. 有哪些支线剧情\n2. 支线与主线的关系\n3. 支线的作用\n4. 支线发展建议`
      const subplots = await apiStore.generate(subplotsPrompt, '', 'custom')
      analysisResult.value.subplots = subplots.content
    }

    showForm.value = false
    ElMessage.success('分析完成！')

    // 设置第一个有结果的标签为活动标签
    const firstResult = Object.keys(analysisResult.value)[0]
    if (firstResult) {
      activeTab.value = firstResult
    }
  } catch (error: any) {
    ElMessage.error(error.message || '分析失败')
  } finally {
    analyzing.value = false
  }
}

function handleExport() {
  let report = `# ${analysisForm.bookName || '书籍分析报告'}\n\n`

  if (analysisResult.value.opening) {
    report += `## 开头三章分析\n\n${analysisResult.value.opening}\n\n`
  }
  if (analysisResult.value.plot) {
    report += `## 主线剧情\n\n${analysisResult.value.plot}\n\n`
  }
  if (analysisResult.value.characters) {
    report += `## 人物分析\n\n${analysisResult.value.characters}\n\n`
  }
  if (analysisResult.value.world) {
    report += `## 世界设定\n\n${analysisResult.value.world}\n\n`
  }
  if (analysisResult.value.style) {
    report += `## 写作风格\n\n${analysisResult.value.style}\n\n`
  }
  if (analysisResult.value.subplots) {
    report += `## 支线剧情\n\n${analysisResult.value.subplots}\n\n`
  }

  const blob = new Blob([report], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${analysisForm.bookName || '书籍分析'}_${Date.now()}.md`
  a.click()
  URL.revokeObjectURL(url)

  ElMessage.success('导出成功')
}

function handleSaveToBook() {
  if (bookStore.books.length === 0) {
    ElMessage.warning('请先创建书籍')
    return
  }
  saveToBookDialogVisible.value = true
}

async function handleConfirmSaveToBook() {
  if (!saveToBookForm.value.bookId) {
    ElMessage.warning('请选择书籍')
    return
  }

  try {
    // 保存各项分析结果到大纲
    if (analysisResult.value.opening) {
      await bookStore.createOutline({
        bookId: saveToBookForm.value.bookId,
        type: 'story',
        title: '开头分析',
        content: analysisResult.value.opening,
        sortOrder: 0
      })
    }
    if (analysisResult.value.plot) {
      await bookStore.createOutline({
        bookId: saveToBookForm.value.bookId,
        type: 'story',
        title: '主线剧情',
        content: analysisResult.value.plot,
        sortOrder: 1
      })
    }
    if (analysisResult.value.characters) {
      await bookStore.createOutline({
        bookId: saveToBookForm.value.bookId,
        type: 'character',
        title: '主要人物',
        content: analysisResult.value.characters,
        sortOrder: 0
      })
    }
    if (analysisResult.value.world) {
      await bookStore.createOutline({
        bookId: saveToBookForm.value.bookId,
        type: 'world',
        title: '世界观设定',
        content: analysisResult.value.world,
        sortOrder: 0
      })
    }
    if (analysisResult.value.style) {
      await bookStore.createOutline({
        bookId: saveToBookForm.value.bookId,
        type: 'other',
        title: '写作风格',
        content: analysisResult.value.style,
        sortOrder: 0
      })
    }
    if (analysisResult.value.subplots) {
      await bookStore.createOutline({
        bookId: saveToBookForm.value.bookId,
        type: 'story',
        title: '支线剧情',
        content: analysisResult.value.subplots,
        sortOrder: 2
      })
    }

    ElMessage.success('已保存到书籍大纲')
    saveToBookDialogVisible.value = false
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  }
}
</script>

<style scoped>
.book-analysis-page {
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

.analysis-form {
  margin-bottom: 24px;
}

.analysis-form h3 {
  margin: 0 0 20px;
  color: #303133;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.result-header h3 {
  margin: 0;
  color: #303133;
}

.result-content {
  padding: 16px 0;
}

.result-content h4 {
  margin: 0 0 12px;
  color: #303133;
  font-size: 16px;
}

.result-content .content {
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
}

.result-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  gap: 12px;
}
</style>
