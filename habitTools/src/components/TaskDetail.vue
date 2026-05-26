<template>
  <el-drawer
    v-model="visible"
    title="编辑"
    direction="rtl"
    size="50%"
    :show-close="false"
    class="task-detail-drawer"
  >
    <template #header>
      <div class="drawer-header">
        <span>编辑</span>
        <div class="drawer-actions">
          <el-button size="small" @click="close">取消</el-button>
          <el-button size="small" type="danger" @click="onDelete">删除</el-button>
          <el-button size="small" type="primary" @click="onSave">保存</el-button>
        </div>
      </div>
    </template>

    <el-form :model="form" label-width="60px">
      <el-form-item label="标题">
        <el-input v-model="form.text" />
      </el-form-item>
      <el-form-item label="注释">
        <el-input type="textarea" v-model="form.notes" />
      </el-form-item>

      <!-- Habit: up/down -->
      <el-row :gutter="20" style="margin-bottom: 20px" v-if="type === 'habit'">
        <el-col :span="6" :offset="7" class="task-icon clickable" :class="[form.up ? '' : 'task-completed']">
          <el-icon @click="form.up = !form.up"><CirclePlus /></el-icon>
        </el-col>
        <el-col :span="6" class="task-icon clickable" :class="[form.down ? '' : 'task-completed']">
          <el-icon @click="form.down = !form.down"><Remove /></el-icon>
        </el-col>
      </el-row>

      <!-- Checklist for Daily / Todo -->
      <el-form-item label="清单" v-if="type === 'daily' || type === 'todo'">
        <el-input
          size="small"
          placeholder="新的清单项目"
          v-model="newCheckItem"
          @keyup.enter="addCheckItem"
        >
          <template #prefix>
            <el-icon><Plus /></el-icon>
          </template>
        </el-input>
        <el-input
          v-for="item in form.checklist"
          :key="item.id"
          size="medium"
          v-model="item.text"
          clearable
          @clear="removeCheckItem(item.id)"
          @blur="trimCheckItem(item)"
        />
      </el-form-item>

      <!-- Priority (all except reward) -->
      <el-form-item label="难度" v-if="type !== 'reward'">
        <el-select v-model="form.priority" placeholder="请选择难度" class="full-width">
          <el-option label="琐事" :value="0.1" />
          <el-option label="简单" :value="1" />
          <el-option label="中等" :value="1.5" />
          <el-option label="困难" :value="2" />
        </el-select>
      </el-form-item>

      <!-- Habit: frequency -->
      <el-form-item label="周期" v-if="type === 'habit'">
        <el-select v-model="form.frequency" placeholder="请选择连击归零的周期" class="full-width">
          <el-option label="每日" value="daily" />
          <el-option label="每周" value="weekly" />
          <el-option label="每月" value="monthly" />
        </el-select>
      </el-form-item>

      <!-- Daily: start date -->
      <el-form-item label="开始" v-if="type === 'daily'">
        <el-date-picker
          v-model="form.startDate"
          align="center"
          type="date"
          placeholder="选择任务开始日期"
          :clearable="false"
          class="full-width"
        />
      </el-form-item>

      <!-- Daily: frequency + everyX -->
      <el-form-item label="周期" v-if="type === 'daily'" class="edit-color">
        每
        <el-input-number v-model="form.everyX" size="small" controls-position="right" :min="0" style="width: 40%" />
        <el-select v-model="form.frequency" size="small" style="width: 30%">
          <el-option label="日" value="daily" />
          <el-option label="周" value="weekly" />
          <el-option label="月" value="monthly" />
          <el-option label="年" value="yearly" />
        </el-select>
        重复一次
      </el-form-item>

      <!-- Daily: weekly repeat -->
      <el-form-item label="每周" v-if="type === 'daily' && form.frequency === 'weekly'" class="edit-color">
        <el-tag
          v-for="day in weekDays"
          :key="day.key"
          type="info"
          effect="plain"
          :class="{ 'tag-selected': form.repeat?.[day.key] }"
          @click="toggleRepeat(day.key)"
        >
          {{ day.label }}
        </el-tag>
        激活
      </el-form-item>

      <!-- Habit: counter -->
      <el-form-item label="连击" v-if="type === 'habit'">
        <el-row :gutter="20" style="text-align: center; margin-bottom: 20px">
          <el-col :span="11">
            <el-tooltip content="积极的连击" placement="bottom" effect="light">
              <el-input-number v-model="form.counterUp" size="small" controls-position="right" :min="0" />
            </el-tooltip>
          </el-col>
          <el-col :span="11" :offset="1">
            <el-tooltip content="消极的连击" placement="bottom" effect="light">
              <el-input-number v-model="form.counterDown" size="small" controls-position="right" :min="0" />
            </el-tooltip>
          </el-col>
        </el-row>
      </el-form-item>

      <!-- Daily: streak -->
      <el-form-item label="连击" v-if="type === 'daily'">
        <el-input-number v-model="form.streak" size="small" controls-position="right" :min="0" class="full-width" />
      </el-form-item>

      <!-- Todo: due date -->
      <el-form-item label="截至" v-if="type === 'todo'">
        <el-date-picker
          v-model="form.date"
          align="center"
          type="date"
          placeholder="选择任务截至日期"
          class="full-width"
        />
      </el-form-item>

      <!-- Reward: cost -->
      <el-form-item label="花费" v-if="type === 'reward'">
        <el-input-number v-model="form.value" size="small" controls-position="right" :min="0" class="full-width" />
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { CirclePlus, Remove, Plus } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  type: { type: String, required: true },
  task: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue', 'save', 'delete'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const weekDays = [
  { key: 'su', label: '日' },
  { key: 'm', label: '一' },
  { key: 't', label: '二' },
  { key: 'w', label: '三' },
  { key: 'th', label: '四' },
  { key: 'f', label: '五' },
  { key: 's', label: '六' }
]

const form = ref({})
const newCheckItem = ref('')

watch(() => props.task, (task) => {
  if (task) {
    form.value = JSON.parse(JSON.stringify(task))
    if (!form.value.repeat) form.value.repeat = { su: false, m: false, t: false, w: false, th: false, f: false, s: false }
    if (!form.value.checklist) form.value.checklist = []
  }
}, { immediate: true })

function close() {
  visible.value = false
}

function onSave() {
  emit('save', form.value)
  close()
}

function onDelete() {
  emit('delete', props.task?.id)
  close()
}

function toggleRepeat(key) {
  if (!form.value.repeat) form.value.repeat = {}
  form.value.repeat[key] = !form.value.repeat[key]
}

function addCheckItem() {
  const text = newCheckItem.value.trim()
  if (!text) return
  form.value.checklist.push({
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    text,
    completed: false
  })
  newCheckItem.value = ''
}

function removeCheckItem(id) {
  form.value.checklist = form.value.checklist.filter(c => c.id !== id)
}

function trimCheckItem(item) {
  if (!item.text || !item.text.trim()) {
    removeCheckItem(item.id)
  } else {
    item.text = item.text.trim()
  }
}
</script>

<style scoped>
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.drawer-actions {
  display: flex;
  gap: 8px;
}
.full-width {
  width: 100% !important;
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
.edit-color {
  color: var(--text-secondary);
}
.tag-selected {
  color: var(--hb-primary) !important;
  border-color: var(--hb-primary) !important;
}
:deep(.el-form-item__label) {
  color: var(--text-primary);
}
</style>
