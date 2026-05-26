<template>
  <div class="todo-view">
    <TaskList
      v-model="tasks.showTaskList"
      type="todo"
      group="todo"
      @score="onScore"
      @check="onCheck"
      @detail="onDetail"
      @drag="onDrag"
    />
    <TaskDetail
      v-model="detailVisible"
      type="todo"
      :task="selectedTask"
      @save="onSave"
      @delete="onDelete"
    />
  </div>
</template>

<script setup>
import { ref, inject, watch } from 'vue'
import { scoreHBCheckList } from '../api/habitica.js'
import TaskList from '../components/TaskList.vue'
import TaskDetail from '../components/TaskDetail.vue'

const tasks = inject('tasks')

const detailVisible = ref(false)
const selectedTask = ref(null)

watch(() => tasks.selectTag.value, (newVal) => {
  if (newVal === 9) {
    tasks.loadCompletedTodos()
  }
}, { immediate: true })

function onScore(task, direction) {
  tasks.scoreTask(task, direction)
}

function onCheck(taskId, checkListId) {
  scoreHBCheckList(taskId, checkListId)
}

function onDetail(task) {
  selectedTask.value = task
  detailVisible.value = true
}

function onDrag(task, oldIndex, newIndex) {
  tasks.moveTask(task.id, newIndex)
}

function onSave(taskDetails) {
  tasks.saveTask(taskDetails)
}

function onDelete(id) {
  tasks.removeTask(id)
}
</script>

<style scoped>
.todo-view {
  padding: 8px;
}
</style>
