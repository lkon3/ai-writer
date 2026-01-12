<template>
  <div class="home-page">
    <div class="welcome-card">
      <h1>欢迎使用AI写作助手</h1>
      <p class="subtitle">智能AI辅助创作，让写作更高效</p>

      <div class="stats-row">
        <el-card class="stat-card">
          <el-statistic title="书籍总数" :value="bookCount">
            <template #suffix>本</template>
          </el-statistic>
        </el-card>
        <el-card class="stat-card">
          <el-statistic title="总字数" :value="totalWords">
            <template #suffix>字</template>
          </el-statistic>
        </el-card>
        <el-card class="stat-card">
          <el-statistic title="提示词数量" :value="promptCount">
            <template #suffix>个</template>
          </el-statistic>
        </el-card>
      </div>

      <div class="quick-actions">
        <h3>快速开始</h3>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card shadow="hover" class="action-card" @click="router.push('/books')">
              <div class="action-content">
                <el-icon :size="40" color="#409eff"><FolderAdd /></el-icon>
                <h4>创建新书</h4>
                <p>开始新的写作项目</p>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="action-card" @click="handleOpenEditor">
              <div class="action-content">
                <el-icon :size="40" color="#67c23a"><Edit /></el-icon>
                <h4>继续写作</h4>
                <p>继续创作内容</p>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="action-card" @click="router.push('/analysis')">
              <div class="action-content">
                <el-icon :size="40" color="#909399"><DataAnalysis /></el-icon>
                <h4>AI拆书</h4>
                <p>分析书籍内容</p>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="action-card" @click="router.push('/settings')">
              <div class="action-content">
                <el-icon :size="40" color="#e6a23c"><Setting /></el-icon>
                <h4>配置API</h4>
                <p>设置AI服务</p>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 最近书籍 -->
      <div v-if="recentBooks.length > 0" class="recent-books">
        <h3>最近编辑</h3>
        <el-row :gutter="20">
          <el-col v-for="book in recentBooks" :key="book.id" :span="6">
            <el-card shadow="hover" class="book-card" @click="openBook(book.id!)">
              <div class="book-cover">
                <el-icon :size="50"><Reading /></el-icon>
              </div>
              <div class="book-info">
                <h4>{{ book.title }}</h4>
                <p>{{ book.author }}</p>
                <el-tag size="small">{{ formatWordCount(book.wordCount) }}</el-tag>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookStore } from '../stores/book'
import { usePromptStore } from '../stores/prompt'
import { ElMessage } from 'element-plus'

const router = useRouter()
const bookStore = useBookStore()
const promptStore = usePromptStore()

const recentBooks = computed(() => bookStore.books.slice(0, 4))
const bookCount = computed(() => bookStore.bookCount)
const totalWords = computed(() => bookStore.books.reduce((sum, b) => sum + b.wordCount, 0))
const promptCount = computed(() => promptStore.prompts.length)

onMounted(async () => {
  await bookStore.loadBooks()
  await promptStore.loadPrompts()
})

function handleOpenEditor() {
  if (bookStore.books.length > 0) {
    router.push('/editor')
  } else {
    ElMessage.info('请先创建一本书')
    router.push('/books')
  }
}

async function openBook(bookId: string) {
  await bookStore.loadBook(bookId)
  router.push('/editor')
}

function formatWordCount(count: number): string {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万字`
  }
  return `${count}字`
}
</script>

<style scoped>
.home-page {
  padding: 24px;
  min-height: 100%;
}

.welcome-card {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #303133;
  margin-bottom: 8px;
}

.subtitle {
  text-align: center;
  color: #909399;
  margin-bottom: 40px;
}

.stats-row {
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  flex: 1;
  text-align: center;
}

.quick-actions {
  margin-bottom: 40px;
}

.quick-actions h3 {
  margin-bottom: 20px;
  color: #303133;
}

.action-card {
  cursor: pointer;
  transition: transform 0.2s;
  height: 160px;
}

.action-card:hover {
  transform: translateY(-4px);
}

.action-content {
  text-align: center;
}

.action-content h4 {
  margin: 16px 0 8px;
  color: #303133;
}

.action-content p {
  color: #909399;
  font-size: 14px;
  margin: 0;
}

.recent-books h3 {
  margin-bottom: 20px;
  color: #303133;
}

.book-card {
  cursor: pointer;
  margin-bottom: 20px;
  height: 200px;
}

.book-cover {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 12px;
}

.book-info {
  text-align: center;
}

.book-info h4 {
  margin: 0 0 8px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-info p {
  margin: 0 0 8px;
  color: #909399;
  font-size: 14px;
}
</style>
