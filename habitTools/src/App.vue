<template>
  <div class="app-root">
    <!-- Loading -->
    <div v-if="user.isLoading.value" class="full-screen loading-container">
      <Loading />
    </div>

    <!-- Login -->
    <div v-else-if="user.loginDialog.value" class="full-screen">
      <LoginView />
    </div>

    <!-- Main Layout -->
    <div v-else class="main-layout full-screen">
      <SideMenu />
      <div class="content-area">
        <StatusBar :profile="user.profile" />
        <div class="view-container">
          <HabitView v-if="tasks.menuVal.value === 1" />
          <DailyView v-else-if="tasks.menuVal.value === 2" />
          <TodoView v-else-if="tasks.menuVal.value === 3" />
          <RewardView v-else-if="tasks.menuVal.value === 4" />
          <PartyView v-else-if="tasks.menuVal.value === 5" />
        </div>
        <CreateInput ref="createInputRef" :menu-val="tasks.menuVal.value" @submit="onCreateSubmit" />
      </div>
    </div>

    <!-- Undone Dialog -->
    <UndoneDialog
      v-model="showUndoneDialog"
      :undone-list="tasks.undoneList.value"
      @score="onUndoneScore"
      @confirm="onUndoneConfirm"
    />

    <!-- Status Toast -->
    <StatusToast ref="statusToastRef" />
  </div>
</template>

<script setup>
import { ref, provide, watch, onMounted, onUnmounted } from 'vue'
import { useTheme } from './composables/useTheme.js'
import { useUser } from './composables/useUser.js'
import { useTasks } from './composables/useTasks.js'
import { useParty } from './composables/useParty.js'
import { useShortcut } from './composables/useShortcut.js'
import { createTask } from './api/habitica.js'

import Loading from './components/Loading.vue'
import LoginView from './views/LoginView.vue'
import SideMenu from './components/SideMenu.vue'
import StatusBar from './components/StatusBar.vue'
import CreateInput from './components/CreateInput.vue'
import UndoneDialog from './components/UndoneDialog.vue'
import StatusToast from './components/StatusToast.vue'

import HabitView from './views/HabitView.vue'
import DailyView from './views/DailyView.vue'
import TodoView from './views/TodoView.vue'
import RewardView from './views/RewardView.vue'
import PartyView from './views/PartyView.vue'

const theme = useTheme()
const user = useUser()
const tasks = useTasks()
const party = useParty()

provide('theme', theme)
provide('user', user)
provide('tasks', tasks)
provide('party', party)

const createInputRef = ref(null)
const statusToastRef = ref(null)
const showUndoneDialog = ref(false)

// utools plugin enter
onMounted(() => {
  if (window.utools) {
    window.utools.onPluginEnter(() => {
      doSync()
    })
  }
  initLogin()
})

function initLogin() {
  if (user.isNotLogin()) {
    user.loginDialog.value = true
    user.isLoading.value = false
  } else {
    doSync()
  }
}

function doSync() {
  user.sync()
    .then((userInfo) => {
      return tasks.sync().then((taskData) => {
        const shouldCron = tasks.parseTasks(taskData, userInfo)
        if (shouldCron && tasks.undoneList.value.length > 0) {
          showUndoneDialog.value = true
        } else if (shouldCron) {
          tasks.completeYesterday().catch(() => {})
        }
        if (userInfo.party && userInfo.party._id) {
          party.loadParty(userInfo.party._id, userInfo._id).catch(() => {})
        }
      })
    })
    .catch(() => {
      // keep current state on error
    })
    .finally(() => {
      user.isLoading.value = false
    })
}

// Global click to intercept external links
function onGlobalClick(e) {
  const a = e.target.closest('a')
  if (a && a.href && a.href.startsWith('http') && !a.href.includes(window.location.host)) {
    e.preventDefault()
    if (window.utools) {
      window.utools.shellOpenExternal(a.href)
    } else {
      window.open(a.href, '_blank')
    }
  }
}
onMounted(() => document.addEventListener('click', onGlobalClick))
onUnmounted(() => document.removeEventListener('click', onGlobalClick))

// Watch stats changes for toast
let prevHP = user.profile.HP
let prevEXP = user.profile.EXP
let prevMP = user.profile.MP
let prevGP = user.profile.GP

watch(() => user.profile.HP, (newVal) => {
  const diff = newVal - prevHP
  if (diff !== 0 && statusToastRef.value) {
    statusToastRef.value.show({ hp: diff })
  }
  prevHP = newVal
})
watch(() => user.profile.EXP, (newVal) => {
  const diff = newVal - prevEXP
  if (diff !== 0 && statusToastRef.value) {
    statusToastRef.value.show({ exp: diff })
  }
  prevEXP = newVal
})
watch(() => user.profile.MP, (newVal) => {
  const diff = newVal - prevMP
  if (diff !== 0 && statusToastRef.value) {
    statusToastRef.value.show({ mp: diff })
  }
  prevMP = newVal
})
watch(() => user.profile.GP, (newVal) => {
  const diff = newVal - prevGP
  if (diff !== 0 && statusToastRef.value) {
    statusToastRef.value.show({ gp: diff })
  }
  prevGP = newVal
})

// Shortcuts
useShortcut({
  onMenuChange: (idx) => {
    if (idx >= 1 && idx <= 5) {
      if (idx === 5) {
        tasks.setMenu(5)
        doSyncParty()
      } else {
        tasks.setMenu(idx)
      }
    }
  },
  onFocusInput: () => {
    createInputRef.value?.focus()
  },
  onSync: () => {
    doSync()
  },
  onToggleTheme: () => {
    theme.toggleTheme()
  },
  onEsc: () => {
    // no-op for now
  }
})

function doSyncParty() {
  if (user.profile.partyId) {
    party.loadParty(user.profile.partyId, user.profile.username).catch(() => {})
  }
}

// Create input submit
function onCreateSubmit(text) {
  const menu = tasks.menuVal.value
  if (menu === 5) {
    if (!user.profile.partyId) return
    party.sendChat(user.profile.partyId, text)
      .then(() => {
        doSyncParty()
      })
      .catch(() => {})
    return
  }
  const typeMap = { 1: 'habit', 2: 'daily', 3: 'todo', 4: 'reward' }
  const type = typeMap[menu]
  if (!type) return
  createTask(text, type, (success, data) => {
    if (success) {
      doSync()
    }
  })
}

// Undone dialog handlers
function onUndoneScore(task, direction) {
  task.completed = direction === 'up'
}

function onUndoneConfirm() {
  tasks.completeYesterday()
    .then(() => {
      showUndoneDialog.value = false
      doSync()
    })
    .catch(() => {})
}
</script>

<style scoped>
.app-root {
  width: 100%;
  height: 100%;
}
.full-screen {
  width: 100%;
  height: 100%;
}
.main-layout {
  display: flex;
  width: 100%;
  height: 100%;
}
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.view-container {
  flex: 1;
  overflow-y: auto;
  background-color: var(--bg-base);
}
</style>
