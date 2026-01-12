import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AppSettings } from '../types'
import { db } from '../database'

export const useSettingsStore = defineStore('settings', () => {
  // 状态
  const settings = ref<AppSettings>({
    theme: 'light',
    autoSave: true,
    autoSaveInterval: 30000,
    defaultApiConfig: '',
    fontSize: 16
  })

  // 加载设置
  async function loadSettings() {
    const result = await db.settings.toArray()
    if (result.length > 0) {
      const data = result[0] as any
      settings.value = {
        theme: data.theme || 'light',
        autoSave: data.autoSave !== undefined ? data.autoSave : true,
        autoSaveInterval: data.autoSaveInterval || 30000,
        defaultApiConfig: data.defaultApiConfig || '',
        fontSize: data.fontSize || 16
      }
    }
  }

  // 更新设置
  async function updateSettings(updates: Partial<AppSettings>) {
    settings.value = { ...settings.value, ...updates }

    // 保存到数据库
    const count = await db.settings.count()
    if (count > 0) {
      // 更新第一条记录
      const all = await db.settings.toArray()
      await db.settings.update(all[0] as any, updates)
    } else {
      // 插入新记录
      await db.settings.add(settings.value as any)
    }

    // 应用主题
    if (updates.theme) {
      applyTheme(updates.theme)
    }
  }

  // 应用主题
  function applyTheme(theme: 'light' | 'dark') {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }

  // 初始化主题
  function initTheme() {
    applyTheme(settings.value.theme)
  }

  return {
    // 状态
    settings,

    // 方法
    loadSettings,
    updateSettings,
    initTheme
  }
})
