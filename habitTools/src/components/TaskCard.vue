<template>
  <el-card shadow="hover" :body-style="{ color: task.color }" class="task-card" @click="handleDetail">
    <!-- Habit mode -->
    <template v-if="type === 'habit'">
      <el-row :gutter="18" class="item-center">
        <el-col :span="2" class="task-icon clickable" :class="[task.up ? '' : 'task-completed']">
          <el-icon @click.stop="score('up')"><CirclePlus /></el-icon>
        </el-col>
        <el-col :span="20">
          <div class="task-title" v-html="markedText(task.text)" />
          <div class="task-notes" v-html="markedText(task.notes)" />
        </el-col>
        <el-col :span="2" class="task-icon clickable" :class="[task.down ? '' : 'task-completed']">
          <el-icon @click.stop="score('down')"><Remove /></el-icon>
        </el-col>
      </el-row>
      <el-row class="item-center">
        <el-col :span="22">
          <p class="count-task">+{{ task.counterUp }}<el-divider direction="vertical" />-{{ task.counterDown }}</p>
        </el-col>
      </el-row>
    </template>

    <!-- Daily / Todo mode -->
    <template v-else-if="type === 'daily' || type === 'todo'">
      <el-row :gutter="18" :class="{ 'task-completed': isCompleted }" class="item-center">
        <el-col :span="2" class="task-icon clickable">
          <div v-if="isCompleted" @click.stop="score('down')">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div v-else class="todo-circle" @click.stop="score('up')" />
        </el-col>
        <el-col :span="20">
          <div class="task-title" v-html="markedText(task.text)" />
          <div class="task-notes" v-html="markedText(task.notes)" />
        </el-col>
        <el-col :span="2" class="task-icon clickable" v-if="hasChecklist">
          <el-icon @click.stop="toggleCollapse">
            <ArrowLeft v-if="collapsed" />
            <ArrowDown v-else />
          </el-icon>
        </el-col>
      </el-row>
      <el-row v-if="type === 'todo' && task.dateMsg" class="item-center">
        <el-col :span="22"><p class="count-task">{{ task.dateMsg }}</p></el-col>
      </el-row>
      <div v-if="hasChecklist && !collapsed" @click.stop>
        <el-divider class="checklist-line" />
        <div v-for="ck in task.checklist" :key="ck.id" class="checklist">
          <el-checkbox v-model="ck.completed" :style="{ color: checkboxColor }" @change="check(ck.id)">
            <div class="task-notes" v-html="markedText(ck.text)" />
          </el-checkbox>
        </div>
      </div>
    </template>

    <!-- Reward mode -->
    <template v-else-if="type === 'reward'">
      <el-row :gutter="18" class="item-center">
        <el-col :span="3">
          <div class="clickable" @click.stop="score('down')">
            <div class="reward-icon">
              <svg viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><circle cx="12" cy="12" r="12" fill="#FFA623"/><path fill="#FFF" d="M6.3 17.7c-3.1-3.1-3.1-8.2 0-11.3 3.1-3.1 8.2-3.1 11.3 0" opacity=".5"/><path fill="#FFF" d="M17.7 6.3c3.1 3.1 3.1 8.2 0 11.3-3.1 3.1-8.2 3.1-11.3 0" opacity=".25"/><path fill="#BF7D1A" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" opacity=".5"/><path fill="#BF7D1A" d="M13 9v2h-2V9H9v6h2v-2h2v2h2V9z" opacity=".75"/></g></svg>
            </div>
            <div class="reward-cost">{{ task.cost }}</div>
          </div>
        </el-col>
        <el-col :span="20">
          <div class="task-title" v-html="markedText(task.text)" />
          <div class="task-notes" v-html="markedText(task.notes)" />
        </el-col>
      </el-row>
    </template>
  </el-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import { CirclePlus, Remove, CircleCheck, ArrowLeft, ArrowDown } from '@element-plus/icons-vue'
import { markedText } from '../utils/helpers.js'

const props = defineProps({
  type: { type: String, required: true },
  task: { type: Object, required: true }
})
const emit = defineEmits(['score', 'check', 'detail'])

const collapsed = ref(props.task.collapseChecklist ?? true)

const isCompleted = computed(() => {
  if (props.type === 'daily') return props.task.completed || !props.task.isDue
  return props.task.completed
})

const hasChecklist = computed(() => {
  return props.task.checklist && props.task.checklist.length > 0
})

const checkboxColor = computed(() => {
  if (props.type === 'daily') {
    return props.task.isDue ? props.task.color : '#C3C0C8'
  }
  return props.task.color
})

function score(direction) {
  emit('score', props.task, direction)
}

function check(checkListId) {
  emit('check', props.task.id, checkListId)
}

function handleDetail() {
  emit('detail', props.task)
}

function toggleCollapse() {
  collapsed.value = !collapsed.value
}
</script>

<style scoped>
.task-card {
  margin-bottom: 2px;
  font-size: 15px;
  background-color: var(--bg-card);
  cursor: pointer;
}
.task-card :deep(.el-card__body) {
  padding: 18px 20px;
}
.task-card :deep(.el-card__body:hover) {
  background-color: var(--bg-hover);
}
.task-notes {
  margin: 0;
  font: 13px Extra Small;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}
.task-title {
  padding-bottom: 0.5em;
  color: var(--text-primary);
}
.task-title :deep(p),
.task-notes :deep(*) {
  margin: 0;
}
.task-icon {
  text-align: center;
  font-size: 26px;
  color: var(--text-primary);
}
.clickable:hover {
  cursor: pointer;
}
.task-completed {
  color: #C3C0C8 !important;
}
.task-completed .task-title,
.task-completed .task-notes {
  color: #C3C0C8 !important;
}
.todo-circle {
  border-radius: 100%;
  border: 2px solid currentColor;
  width: 19px;
  height: 19px;
  margin: 5px auto;
}
.count-task {
  float: right;
  color: var(--text-muted);
  margin: 0 auto;
  font: 12px Extra Small;
  letter-spacing: 0.5px;
}
.checklist-line {
  margin: 12px 0;
}
.checklist {
  padding-left: 6%;
}
.checklist :deep(.el-checkbox) {
  display: inline-flex;
  align-items: stretch;
  flex-direction: row;
  white-space: pre-wrap;
  word-break: break-all;
}
.checklist .task-notes {
  margin: 0 0 0.5em 0;
  display: flex;
}
.checklist :deep(.el-checkbox__input) {
  margin-top: 1px;
}
.checklist :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #C3C0C8;
  border-color: #C3C0C8;
}
.checklist :deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #C3C0C8;
  text-decoration: line-through;
}
.reward-icon {
  margin: 0 auto;
  width: 1.8em;
  text-align: center;
}
.reward-cost {
  font: 12px Extra Small;
  color: var(--gold-color);
  text-align: center;
}
.item-center {
  display: flex;
  align-items: center;
}
</style>
