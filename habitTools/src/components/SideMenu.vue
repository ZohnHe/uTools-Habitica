<template>
  <aside class="sidebar">
    <!-- User Header -->
    <div class="sidebar-header">
      <el-row align="middle">
        <el-col :span="7">
          <el-popover placement="bottom-start" trigger="hover" :width="120">
            <template #reference>
              <el-avatar shape="square" :src="user.profile.avatar" :size="48" />
            </template>
            <div style="display:flex;gap:8px;justify-content:center;">
              <el-button text size="small" @click="onSync">
                <el-icon><Refresh /></el-icon> 同步
              </el-button>
              <el-divider direction="vertical" />
              <el-button text size="small" @click="onLogout">
                <el-icon><SwitchButton /></el-icon> 注销
              </el-button>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="17" class="user-info">
          <el-link @click="openHabitica" target="_blank" class="user-name" :title="user.profile.name">
            {{ ellipsisName(user.profile.name) }}
          </el-link>
          <el-tooltip effect="light" placement="bottom-start" :show-after="1000" :content="user.profile.username">
            <p class="user-meta">{{ ellipsisUserName(user.profile.username) }} · 等级 {{ user.profile.level }}</p>
          </el-tooltip>
        </el-col>
      </el-row>
    </div>

    <!-- Navigation Menu -->
    <div class="sidebar-menu">
      <el-menu :default-active="String(tasks.menuVal.value)" @select="handleSelect">
        <el-menu-item index="1">
          <el-icon><Clock /></el-icon>
          <span>习惯</span>
        </el-menu-item>
        <el-menu-item index="2">
          <el-icon><Sunrise /></el-icon>
          <span>
            每日任务
            <el-badge v-if="tasks.undoDailyNum.value > 0" :value="tasks.undoDailyNum.value" class="menu-badge" />
          </span>
        </el-menu-item>
        <el-menu-item index="3">
          <el-icon><Finished /></el-icon>
          <span>
            待办事项
            <el-badge v-if="tasks.undoTodoNum.value > 0" :value="tasks.undoTodoNum.value" class="menu-badge" />
          </span>
        </el-menu-item>
        <el-menu-item index="4">
          <template v-if="tasks.menuVal.value !== 4">
            <el-icon><IceCreamSquare /></el-icon>
            <span>奖励</span>
          </template>
          <template v-else>
            <div class="reward-menu-item">
              <div class="reward-icon-small">
                <svg viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><circle cx="12" cy="12" r="12" fill="#FFA623"/><path fill="#FFF" d="M6.3 17.7c-3.1-3.1-3.1-8.2 0-11.3 3.1-3.1 8.2-3.1 11.3 0" opacity=".5"/><path fill="#FFF" d="M17.7 6.3c3.1 3.1 3.1 8.2 0 11.3-3.1 3.1-8.2 3.1-11.3 0" opacity=".25"/><path fill="#BF7D1A" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" opacity=".5"/><path fill="#BF7D1A" d="M13 9v2h-2V9H9v6h2v-2h2v2h2V9z" opacity=".75"/></g></svg>
              </div>
              <span class="reward-gold">{{ user.profile.GP.toFixed(2) }}</span>
            </div>
          </template>
        </el-menu-item>
        <el-menu-item index="5" @click="openParty">
          <el-icon><Refresh v-if="tasks.menuVal.value === 5" /><ChatLineRound v-else /></el-icon>
          <span>{{ tasks.menuVal.value === 5 ? '刷新队伍' : '队伍' }}</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- Tag Filters -->
    <div class="sidebar-tags">
      <el-tag
        v-for="tag in tasks.dynamicTags.value"
        :key="tag.index"
        :type="tasks.selectTag.value === tag.index ? 'primary' : 'info'"
        effect="plain"
        class="tag-item"
        :class="{ active: tasks.selectTag.value === tag.index }"
        @click="tasks.selectTag.value = tag.index"
      >
        {{ tag.name }}
      </el-tag>
    </div>
  </aside>
</template>

<script setup>
import { inject } from 'vue'
import ThemeToggle from './ThemeToggle.vue'
import { Refresh, SwitchButton, Clock, Sunrise, Finished, IceCreamSquare, ChatLineRound } from '@element-plus/icons-vue'
import { ellipsisName, ellipsisUserName } from '../utils/helpers.js'

const user = inject('user')
const tasks = inject('tasks')

function handleSelect(index) {
  const val = parseInt(index)
  if (val === 5) {
    openParty()
  } else {
    tasks.setMenu(val)
  }
}

function openParty() {
  tasks.setMenu(5)
}

function onSync() {
  user.sync().catch(() => {})
}

function onLogout() {
  user.logout()
}

function openHabitica() {
  const url = 'https://habitica.com'
  if (window.utools) {
    window.utools.shellOpenExternal(url)
  } else {
    window.open(url, '_blank')
  }
}
</script>

<style scoped>
.sidebar {
  width: 220px;
  background-color: var(--bg-sidebar);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color);
}
.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}
.user-info {
  padding-left: 8px;
  overflow: hidden;
}
.user-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.user-meta {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sidebar-menu {
  flex: 1;
  overflow-y: auto;
}
.sidebar-menu :deep(.el-menu) {
  border-right: none;
  background-color: transparent;
}
.sidebar-menu :deep(.el-menu-item) {
  color: var(--text-primary);
}
.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: var(--hb-primary);
  color: var(--text-inverse);
}
.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: var(--bg-hover);
}
.sidebar-menu :deep(.el-menu-item.is-active:hover) {
  background-color: var(--hb-primary);
}
.menu-badge {
  margin-left: 6px;
}
.reward-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.reward-icon-small {
  width: 20px;
  height: 20px;
}
.reward-gold {
  font-weight: 600;
  color: var(--gold-color);
}
.sidebar-tags {
  padding: 12px;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag-item {
  cursor: pointer;
  transition: all 0.2s;
}
.tag-item.active {
  background-color: var(--hb-primary);
  color: var(--text-inverse);
  border-color: var(--hb-primary);
}
</style>
