<template>
  <div class="book-manager-page">
    <div class="page-header">
      <h2>书籍管理</h2>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新建书籍
      </el-button>
    </div>

    <!-- 书籍列表 -->
    <div class="book-list">
      <el-row :gutter="20">
        <el-col v-for="book in bookStore.books" :key="book.id" :span="6">
          <el-card shadow="hover" class="book-card">
            <div class="book-cover">
              <el-icon :size="60" color="#909399"><Reading /></el-icon>
            </div>
            <div class="book-info">
              <h3>{{ book.title }}</h3>
              <p>{{ book.author }}</p>
              <p class="description">{{ book.description || '暂无简介' }}</p>
              <div class="book-meta">
                <el-tag size="small">{{ formatWordCount(book.wordCount) }}</el-tag>
                <span class="date">{{ formatDate(book.updatedAt) }}</span>
              </div>
            </div>
            <div class="book-actions">
              <el-button size="small" @click="handleEdit(book)">编辑</el-button>
              <el-button size="small" type="primary" @click="handleOpenBook(book.id!)">
                打开
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(book.id!)">
                删除
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新建书籍' : '编辑书籍'"
      width="600px"
    >
      <el-form :model="bookForm" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="书名" prop="title">
          <el-input v-model="bookForm.title" placeholder="请输入书名" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="bookForm.author" placeholder="请输入作者" />
        </el-form-item>
        <el-form-item label="简介" prop="description">
          <el-input
            v-model="bookForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入简介"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookStore } from '../stores/book'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Book } from '../types'

const router = useRouter()
const bookStore = useBookStore()

const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const formRef = ref()
const bookForm = ref({
  id: '',
  title: '',
  author: '',
  description: ''
})

const rules = {
  title: [{ required: true, message: '请输入书名', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }]
}

onMounted(async () => {
  await bookStore.loadBooks()
})

function handleCreate() {
  dialogMode.value = 'create'
  bookForm.value = { id: '', title: '', author: '', description: '' }
  dialogVisible.value = true
}

function handleEdit(book: Book) {
  dialogMode.value = 'edit'
  bookForm.value = {
    id: book.id!,
    title: book.title,
    author: book.author,
    description: book.description
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  try {
    await formRef.value.validate()

    if (dialogMode.value === 'create') {
      await bookStore.createBook({
        title: bookForm.value.title,
        author: bookForm.value.author,
        description: bookForm.value.description
      })
      ElMessage.success('书籍创建成功')
    } else {
      await bookStore.updateBook(bookForm.value.id, {
        title: bookForm.value.title,
        author: bookForm.value.author,
        description: bookForm.value.description
      })
      ElMessage.success('书籍更新成功')
    }

    dialogVisible.value = false
  } catch {
    ElMessage.error('请填写完整信息')
  }
}

async function handleDelete(bookId: string) {
  try {
    await ElMessageBox.confirm('确定删除此书籍吗？删除后无法恢复！', '警告', {
      type: 'warning'
    })
    await bookStore.deleteBook(bookId)
    ElMessage.success('书籍已删除')
  } catch {
    // 用户取消
  }
}

function handleOpenBook(bookId: string) {
  router.push({ path: '/editor', query: { bookId } })
}

function formatWordCount(count: number): string {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万字`
  }
  return `${count}字`
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString()
}
</script>

<style scoped>
.book-manager-page {
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

.book-list {
  margin-top: 24px;
}

.book-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.2s;
}

.book-card:hover {
  transform: translateY(-4px);
}

.book-cover {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 16px;
}

.book-info {
  text-align: center;
  margin-bottom: 16px;
}

.book-info h3 {
  margin: 0 0 8px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-info p {
  margin: 4px 0;
  color: #909399;
  font-size: 14px;
}

.description {
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.book-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.date {
  font-size: 12px;
  color: #909399;
}

.book-actions {
  display: flex;
  gap: 8px;
  border-top: 1px solid #e4e7ed;
  padding-top: 12px;
}

.book-actions .el-button {
  flex: 1;
}
</style>
