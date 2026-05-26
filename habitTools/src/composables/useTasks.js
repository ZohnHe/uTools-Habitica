import { ref, watch } from 'vue'
import {
  getHBHabit,
  getHBCompletedTask,
  scoreHBTask,
  createTask,
  updateHBTask,
  deleteHBTask,
  dragHabiticaTask,
  cronTask,
  bulkUpScore,
} from '../api/habitica.js'
import { getFromDB, saveToDB, getRevFromDB, DB_KEY_TAG_SETTING, DB_KEY_SPLIT } from '../utils/db.js'
import { getColorByValue, getDateReminder } from '../utils/helpers.js'

export function useTasks() {
  const habitList = ref([])
  const dailyList = ref([])
  const todoList = ref([])
  const rewardList = ref([])
  const undoneList = ref([])

  const menuVal = ref(1)
  const selectTag = ref(0)
  const conservedTag = ref([0, 4, 7, 10, 13])
  const undoDailyNum = ref(0)
  const undoTodoNum = ref(0)
  const requestLock = ref(false)
  const showTaskList = ref([])

  const dynamicTags = ref([
    { index: 1, name: '全 部' },
    { index: 2, name: '偶 尔' },
    { index: 3, name: '经 常' },
  ])

  function getTagOptions() {
    if (menuVal.value === 1) {
      dynamicTags.value = [
        { index: 1, name: '全 部' },
        { index: 2, name: '偶 尔' },
        { index: 3, name: '经 常' },
      ]
    } else if (menuVal.value === 2) {
      dynamicTags.value = [
        { index: 4, name: '全 部' },
        { index: 5, name: '待 办' },
        { index: 6, name: '已 办' },
      ]
    } else if (menuVal.value === 3) {
      dynamicTags.value = [
        { index: 7, name: '进 行' },
        { index: 8, name: '限 时' },
        { index: 9, name: '已 办' },
      ]
    } else if (menuVal.value === 4) {
      dynamicTags.value = [
        { index: 10, name: '全 部' },
        { index: 11, name: '定 制' },
        { index: 12, name: '其 他' },
      ]
    } else if (menuVal.value === 5) {
      dynamicTags.value = [
        { index: 13, name: '全 部' },
        { index: 14, name: '成 员' },
        { index: 15, name: '系 统' },
      ]
    }
    setDefaultTag()
  }

  function setDefaultTag(reset) {
    if (conservedTag.value[0] === 0) {
      let tags = getFromDB(DB_KEY_TAG_SETTING)
      if (!tags) {
        selectTag.value = 1
        conservedTag.value[0] = 1
        return
      }
      let stringArr = tags.split(DB_KEY_SPLIT)
      for (let i = 0; i < stringArr.length; ++i) {
        conservedTag.value[i] = parseInt(stringArr[i])
      }
    } else if (reset === 0) {
      selectTag.value = 0
      return
    }
    selectTag.value = conservedTag.value[menuVal.value - 1]
  }

  function applyTagFilter(newVal) {
    if (newVal === 0) {
      selectTag.value = conservedTag.value[menuVal.value - 1]
      return
    }
    showTaskList.value = []
    let oldArr = conservedTag.value.join(DB_KEY_SPLIT)
    if (newVal === 1) {
      for (let i = 0; i < habitList.value.length; ++i) {
        showTaskList.value.push(habitList.value[i])
      }
      conservedTag.value[0] = newVal
    } else if (newVal === 2 || newVal === 3) {
      for (let i = 0; i < habitList.value.length; ++i) {
        if (
          (newVal === 2 && habitList.value[i].value < 1) ||
          (newVal === 3 && habitList.value[i].value >= 1)
        ) {
          showTaskList.value.push(habitList.value[i])
        }
      }
      conservedTag.value[0] = newVal
    } else if (newVal === 4) {
      for (let i = 0; i < dailyList.value.length; ++i) {
        showTaskList.value.push(dailyList.value[i])
      }
      conservedTag.value[1] = newVal
    } else if (newVal === 5 || newVal === 6) {
      for (let i = 0; i < dailyList.value.length; ++i) {
        let isUndo = dailyList.value[i].completed || !dailyList.value[i].isDue
        if ((newVal === 5 && !isUndo) || (newVal === 6 && isUndo)) {
          showTaskList.value.push(dailyList.value[i])
        }
      }
      conservedTag.value[1] = newVal
    } else if (newVal === 7 || newVal === 8) {
      for (let i = 0; i < todoList.value.length; ++i) {
        if (
          (newVal === 7 && !todoList.value[i].completed) ||
          (newVal === 8 && todoList.value[i].date && !todoList.value[i].completed)
        ) {
          showTaskList.value.push(todoList.value[i])
        }
      }
      conservedTag.value[2] = newVal
    } else if (newVal === 9) {
      getHBCompletedTask((success, data) => {
        if (!success) {
          // error handled by caller
          return
        }
        for (let i = 0; i < data.length; ++i) {
          let task = data[i]
          let cDate = new Date(task.dateCompleted).toLocaleString('zh', { hour12: false })
          showTaskList.value.push({
            id: task.id,
            text: task.text,
            notes: task.notes,
            value: task.value,
            color: getColorByValue(task.value),
            completed: task.completed,
            collapseChecklist: task.collapseChecklist,
            checklist: task.checklist,
            date: task.date,
            dateMsg: '完成时间：' + cDate,
          })
        }
        conservedTag.value[2] = newVal
      })
    } else if (newVal === 10 || newVal === 11) {
      for (let i = 0; i < rewardList.value.length; ++i) {
        showTaskList.value.push(rewardList.value[i])
      }
      conservedTag.value[3] = newVal
    } else if (newVal === 12) {
      conservedTag.value[3] = newVal
    }
    setTimeout(() => {
      let saveArr = conservedTag.value.join(DB_KEY_SPLIT)
      if (saveArr !== oldArr) {
        let rev = getRevFromDB(DB_KEY_TAG_SETTING)
        saveToDB(DB_KEY_TAG_SETTING, saveArr, rev)
      }
    }, 1)
  }

  watch(selectTag, (newVal) => {
    applyTagFilter(newVal)
  })

  function parseTasks(data, userInfo) {
    habitList.value = []
    dailyList.value = []
    todoList.value = []
    rewardList.value = []
    undoneList.value = []
    undoDailyNum.value = 0
    undoTodoNum.value = 0
    let now = new Date()
    for (let i = 0; i < data.length; ++i) {
      let task = data[i]
      if (task.type === 'habit') {
        habitList.value.push({
          id: task.id,
          text: task.text,
          notes: task.notes,
          value: task.value,
          color: getColorByValue(task.value),
          up: task.up,
          down: task.down,
          counterUp: task.counterUp,
          counterDown: task.counterDown,
          priority: String(task.priority),
          frequency: task.frequency,
        })
      } else if (task.type === 'daily') {
        dailyList.value.push({
          id: task.id,
          text: task.text,
          notes: task.notes,
          value: task.value,
          color: getColorByValue(task.value),
          completed: task.completed,
          isDue: task.isDue,
          repeat: task.repeat,
          everyX: task.everyX,
          collapseChecklist: task.collapseChecklist,
          checklist: task.checklist,
          priority: String(task.priority),
          frequency: task.frequency,
          startDate: task.startDate,
          streak: task.streak,
          nextDue: task.nextDue,
          daysOfMonth: task.daysOfMonth,
          weeksOfMonth: task.weeksOfMonth,
        })
        if (task.isDue && !task.completed) {
          undoDailyNum.value++
        }
      } else if (task.type === 'todo') {
        todoList.value.push({
          id: task.id,
          text: task.text,
          notes: task.notes,
          color: getColorByValue(task.value),
          completed: task.completed,
          collapseChecklist: task.collapseChecklist,
          checklist: task.checklist,
          date: task.date,
          dateMsg: getDateReminder(now, task.date),
          priority: String(task.priority),
        })
        undoTodoNum.value++
      } else if (task.type === 'reward') {
        rewardList.value.push({
          id: task.id,
          text: task.text,
          notes: task.notes,
          color: getColorByValue(0),
          cost: task.value,
        })
      }
    }
    setDefaultTag(0)

    let lastCron = new Date(userInfo.lastCron)
    let dateCron = new Date()
    dateCron.setHours(userInfo.preferences.dayStart)
    dateCron.setMinutes(0)
    dateCron.setSeconds(0)
    dateCron.setMilliseconds(0)
    let shouldCron = false
    let isNextDay = true
    if (lastCron < dateCron) {
      let nextCron = new Date(userInfo.lastCron)
      nextCron.setHours(userInfo.preferences.dayStart)
      nextCron.setMinutes(0)
      nextCron.setSeconds(0)
      nextCron.setMilliseconds(0)
      if ((now.getTime() - (nextCron.getTime() + 1000 * 60 * 60 * 24)) / 1000 / 60 / 60 < 24) {
        if (dateCron <= now) {
          shouldCron = true
        }
      } else {
        shouldCron = true
        isNextDay = false
      }
    }
    if (shouldCron) {
      const weekDay = ['su', 'm', 't', 'w', 'th', 'f', 's']
      dateCron.setDate(dateCron.getDate() - 1)
      let index = weekDay[dateCron.getDay()]
      for (let i = 0; i < dailyList.value.length; ++i) {
        let daily = dailyList.value[i]
        if (daily.completed || now.getTime() < new Date(daily.startDate).getTime()) {
          continue
        }
        if (isNextDay) {
          if (daily.isDue) {
            undoneList.value.push(daily)
          }
        } else {
          let dueDays = daily.nextDue
          for (let j = 0; j <= dueDays.length; ++j) {
            if (j === dueDays.length) {
              if (new Date(dueDays[j - 1]) > dateCron) {
                break
              }
              if (daily.frequency === 'daily') {
                if (daily.everyX === 1) {
                  undoneList.value.push(daily)
                  break
                } else {
                  let calcDate = new Date(dueDays[j - 1])
                  for (let k = 0; k <= 100; ++k) {
                    if (dateCron.toLocaleDateString() === calcDate.toLocaleDateString() || k === 100) {
                      undoneList.value.push(daily)
                      break
                    }
                    if (calcDate > dateCron) break
                    calcDate.setDate(calcDate.getDate() + daily.everyX)
                  }
                }
              } else if (daily.frequency === 'weekly') {
                if (daily.everyX === 1 && daily.repeat[index]) {
                  undoneList.value.push(daily)
                  break
                } else {
                  let calcDate = new Date(dueDays[j - 1])
                  for (let k = 0; k <= 14; ++k) {
                    if (dateCron.toLocaleDateString() === calcDate.toLocaleDateString() || k === 14) {
                      undoneList.value.push(daily)
                      break
                    }
                    if (calcDate > dateCron) break
                    calcDate.setDate(calcDate.getDate() + daily.everyX * 7)
                  }
                }
              } else if (daily.frequency === 'monthly') {
                if (daily.daysOfMonth.length + daily.weeksOfMonth.length <= 0) {
                  let calcDate = new Date(daily.startDate)
                  calcDate.setMonth(calcDate.getMonth() + daily.everyX)
                  if (dateCron.toLocaleDateString() === calcDate.toLocaleDateString()) {
                    undoneList.value.push(daily)
                    break
                  }
                } else {
                  undoneList.value.push(daily)
                  break
                }
              } else {
                undoneList.value.push(daily)
                break
              }
            } else if (dateCron.toLocaleDateString() === new Date(dueDays[j]).toLocaleDateString()) {
              undoneList.value.push(daily)
              break
            }
          }
        }
      }
    }
    return shouldCron
  }

  function loadCompletedTodos() {
    return new Promise((resolve, reject) => {
      getHBCompletedTask((success, data) => {
        if (success) {
          showTaskList.value = []
          for (let i = 0; i < data.length; ++i) {
            let task = data[i]
            let cDate = new Date(task.dateCompleted).toLocaleString('zh', { hour12: false })
            showTaskList.value.push({
              id: task.id,
              text: task.text,
              notes: task.notes,
              value: task.value,
              color: getColorByValue(task.value),
              completed: task.completed,
              collapseChecklist: task.collapseChecklist,
              checklist: task.checklist,
              date: task.date,
              dateMsg: '完成时间：' + cDate,
            })
          }
          resolve(data)
        } else {
          reject(data)
        }
      })
    })
  }

  function sync() {
    return new Promise((resolve, reject) => {
      requestLock.value = true
      getHBHabit((success, data) => {
        requestLock.value = false
        if (success) {
          resolve(data)
        } else {
          reject(data)
        }
      })
    })
  }

  function scoreTask(task, direction) {
    if (requestLock.value) return Promise.reject('locked')
    requestLock.value = true
    const currentMenu = menuVal.value
    if (currentMenu === 1 && ((direction === 'up' && !task.up) || (direction === 'down' && !task.down))) {
      requestLock.value = false
      return Promise.reject('invalid direction')
    }
    return new Promise((resolve, reject) => {
      scoreHBTask(task.id, direction, (success, data) => {
        requestLock.value = false
        if (success) {
          let tag = selectTag.value
          task.value += data.delta
          task.color = getColorByValue(task.value)
          if (currentMenu === 1) {
            direction === 'up' ? task.counterUp++ : task.counterDown++
            if ((tag === 2 && task.value >= 1) || (tag === 3 && task.value < 1)) {
              selectTag.value = 0
            }
          } else if (currentMenu !== 4) {
            let after = !task.completed
            if (currentMenu === 2 && task.isDue) {
              if (after) {
                undoDailyNum.value--
              } else {
                undoDailyNum.value++
              }
            } else if (currentMenu === 3) {
              if (tag === 9) {
                let now = new Date()
                task.dateMsg = getDateReminder(now, task.date)
                todoList.value.push(task)
                undoTodoNum.value++
              } else {
                undoTodoNum.value--
              }
            }
            task.completed = after
            selectTag.value = 0
          }
          resolve(data)
        } else {
          reject(data)
        }
      })
    })
  }

  function saveTask(taskDetails) {
    return new Promise((resolve, reject) => {
      updateHBTask(taskDetails.id, taskDetails, (success, data) => {
        if (success) {
          resolve(data)
        } else {
          reject(data)
        }
      })
    })
  }

  function removeTask(id) {
    return new Promise((resolve, reject) => {
      deleteHBTask(id, (success, data) => {
        if (success) {
          resolve(data)
        } else {
          reject(data)
        }
      })
    })
  }

  function moveTask(taskId, toIndex) {
    return new Promise((resolve, reject) => {
      dragHabiticaTask(taskId, toIndex, (success, data) => {
        if (success) {
          let arr =
            menuVal.value === 1
              ? habitList.value
              : menuVal.value === 2
                ? dailyList.value
                : menuVal.value === 3
                  ? todoList.value
                  : menuVal.value === 4
                    ? rewardList.value
                    : []
          arr.sort((a, b) => {
            return data.indexOf(a.id) - data.indexOf(b.id)
          })
          resolve(data)
        } else {
          reject(data)
        }
      })
    })
  }

  function setMenu(val) {
    menuVal.value = val
    getTagOptions()
  }

  function completeYesterday() {
    let doneList = []
    for (let i = 0; i < undoneList.value.length; ++i) {
      let task = undoneList.value[i]
      if (task.completed) {
        doneList.push({ id: task.id, direction: 'up' })
      }
    }
    if (doneList.length > 0) {
      return new Promise((resolve, reject) => {
        bulkUpScore(doneList, (success, data) => {
          if (success) {
            undoneList.value = []
            cronTask((cronSuccess) => {
              if (cronSuccess) {
                resolve(data)
              } else {
                reject('cron failed')
              }
            })
          } else {
            reject(data)
          }
        })
      })
    } else {
      return new Promise((resolve, reject) => {
        cronTask((success) => {
          if (success) {
            resolve()
          } else {
            reject('cron failed')
          }
        })
      })
    }
  }

  return {
    habitList,
    dailyList,
    todoList,
    rewardList,
    undoneList,
    menuVal,
    selectTag,
    conservedTag,
    undoDailyNum,
    undoTodoNum,
    requestLock,
    showTaskList,
    dynamicTags,
    getTagOptions,
    applyTagFilter,
    parseTasks,
    loadCompletedTodos,
    sync,
    scoreTask,
    saveTask,
    removeTask,
    moveTask,
    setMenu,
    completeYesterday,
  }
}
