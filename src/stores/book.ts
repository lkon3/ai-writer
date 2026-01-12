import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Book, Chapter, Outline } from '../types'
import { db } from '../database'
import { v4 as uuidv4 } from 'uuid'

export const useBookStore = defineStore('book', () => {
  // 状态
  const books = ref<Book[]>([])
  const currentBook = ref<Book | null>(null)
  const currentChapter = ref<Chapter | null>(null)
  const chapters = ref<Chapter[]>([])
  const outlines = ref<Outline[]>([])

  // 计算属性
  const bookCount = computed(() => books.value.length)
  const chapterCount = computed(() => chapters.value.length)
  const totalWordCount = computed(() =>
    chapters.value.reduce((sum, ch) => sum + ch.wordCount, 0)
  )

  // 加载所有书籍
  async function loadBooks() {
    books.value = await db.books.toArray()
    // 按更新时间倒序排序
    books.value.sort((a, b) => b.updatedAt - a.updatedAt)
  }

  // 加载单个书籍
  async function loadBook(bookId: string) {
    const book = await db.books.get(bookId)
    if (book) {
      currentBook.value = book
      await loadChapters(bookId)
      await loadOutlines(bookId)
    }
    return book
  }

  // 创建书籍
  async function createBook(book: Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'wordCount'>) {
    const newBook: Book = {
      ...book,
      id: uuidv4(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      wordCount: 0
    }
    await db.books.add(newBook)
    await loadBooks()
    return newBook
  }

  // 更新书籍
  async function updateBook(bookId: string, updates: Partial<Book>) {
    await db.books.update(bookId, {
      ...updates,
      updatedAt: Date.now()
    })
    if (currentBook.value?.id === bookId) {
      currentBook.value = { ...currentBook.value, ...updates, updatedAt: Date.now() }
    }
    await loadBooks()
  }

  // 删除书籍
  async function deleteBook(bookId: string) {
    await db.books.delete(bookId)
    // 删除相关章节和大纲
    await db.chapters.where('bookId').equals(bookId).delete()
    await db.outlines.where('bookId').equals(bookId).delete()
    if (currentBook.value?.id === bookId) {
      currentBook.value = null
      currentChapter.value = null
      chapters.value = []
      outlines.value = []
    }
    await loadBooks()
  }

  // 加载章节列表
  async function loadChapters(bookId: string) {
    chapters.value = await db.chapters
      .where('bookId')
      .equals(bookId)
      .sortBy('sortOrder')
  }

  // 创建章节
  async function createChapter(chapter: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt' | 'wordCount'>) {
    const newChapter: Chapter = {
      ...chapter,
      id: uuidv4(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      wordCount: 0
    }
    await db.chapters.add(newChapter)
    await loadChapters(chapter.bookId)

    // 更新书籍字数统计
    await updateBookWordCount(chapter.bookId)

    return newChapter
  }

  // 更新章节
  async function updateChapter(chapterId: string, updates: Partial<Chapter>) {
    const chapter = await db.chapters.get(chapterId)
    if (chapter) {
      const wordCount = updates.content ? updates.content.length : chapter.wordCount
      await db.chapters.update(chapterId, {
        ...updates,
        wordCount,
        updatedAt: Date.now()
      })

      if (currentChapter.value?.id === chapterId) {
        currentChapter.value = {
          ...currentChapter.value,
          ...updates,
          wordCount,
          updatedAt: Date.now()
        }
      }

      // 更新章节列表
      await loadChapters(chapter.bookId)
      // 更新书籍字数
      await updateBookWordCount(chapter.bookId)
    }
  }

  // 删除章节
  async function deleteChapter(chapterId: string) {
    const chapter = await db.chapters.get(chapterId)
    if (chapter) {
      await db.chapters.delete(chapterId)
      if (currentChapter.value?.id === chapterId) {
        currentChapter.value = null
      }
      await loadChapters(chapter.bookId)
      await updateBookWordCount(chapter.bookId)
    }
  }

  // 更新章节排序
  async function updateChapterOrder(chapterId: string, newOrder: number) {
    await db.chapters.update(chapterId, { sortOrder: newOrder })
    if (currentBook.value?.id) {
      await loadChapters(currentBook.value.id)
    }
  }

  // 加载大纲列表
  async function loadOutlines(bookId: string) {
    outlines.value = await db.outlines
      .where('bookId')
      .equals(bookId)
      .sortBy('sortOrder')
  }

  // 创建大纲
  async function createOutline(outline: Omit<Outline, 'id' | 'createdAt' | 'updatedAt'>) {
    const newOutline: Outline = {
      ...outline,
      id: uuidv4(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    await db.outlines.add(newOutline)
    await loadOutlines(outline.bookId)
    return newOutline
  }

  // 更新大纲
  async function updateOutline(outlineId: string, updates: Partial<Outline>) {
    await db.outlines.update(outlineId, {
      ...updates,
      updatedAt: Date.now()
    })
    if (currentBook.value?.id) {
      await loadOutlines(currentBook.value.id)
    }
  }

  // 删除大纲
  async function deleteOutline(outlineId: string) {
    await db.outlines.delete(outlineId)
    if (currentBook.value?.id) {
      await loadOutlines(currentBook.value.id)
    }
  }

  // 更新书籍字数统计
  async function updateBookWordCount(bookId: string) {
    const bookChapters = await db.chapters.where('bookId').equals(bookId).toArray()
    const totalWords = bookChapters.reduce((sum, ch) => sum + ch.wordCount, 0)
    await db.books.update(bookId, { wordCount: totalWords })
  }

  // 设置当前章节
  function setCurrentChapter(chapter: Chapter | null) {
    currentChapter.value = chapter
  }

  return {
    // 状态
    books,
    currentBook,
    currentChapter,
    chapters,
    outlines,

    // 计算属性
    bookCount,
    chapterCount,
    totalWordCount,

    // 方法
    loadBooks,
    loadBook,
    createBook,
    updateBook,
    deleteBook,
    loadChapters,
    createChapter,
    updateChapter,
    deleteChapter,
    updateChapterOrder,
    loadOutlines,
    createOutline,
    updateOutline,
    deleteOutline,
    setCurrentChapter
  }
})
