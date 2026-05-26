<template>
  <el-button text circle size="small" @click="toggleTheme" :title="isDarkMode ? '切换亮色' : '切换暗色'">
    <el-icon><Sunny v-if="isDarkMode" /><Moon v-else /></el-icon>
  </el-button>
</template>

<script setup>
import { inject } from 'vue'
import { Sunny, Moon } from '@element-plus/icons-vue'
const { isDarkMode, toggleTheme } = inject('theme')
</script>
