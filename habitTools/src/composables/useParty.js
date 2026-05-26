import { ref, reactive } from 'vue'
import {
  getHBPartyInfo,
  responsePartyQuest,
  startPartyQuest,
  sendPartyChat,
  castHabiticaSkill,
  buyHealthPotion,
  sleep,
} from '../api/habitica.js'
import { findQuestNameByKey, findCollectNameByKey } from '../api/questMap.js'

export function useParty() {
  const partyMembers = ref(0)
  const partyChat = ref([])
  const partyQuest = reactive({
    active: false,
    joinMembers: 0,
    key: '',
    isAccept: false,
    schedule: '',
    gain: '',
    canStartQuest: false,
  })

  const skillState = reactive({
    isShowSkillTasks: false,
    clickSkillKey: null,
    clickSkillName: null,
  })

  const partyDamage = ref(0)
  const partyCollected = ref(0)

  function setQuestSchedule(progress) {
    let schedule = ''
    if (!!progress.hp) {
      schedule = 'BOSS剩余血量： ' + progress.hp.toFixed(2)
      partyQuest.gain = '预计造成伤害： ' + partyDamage.value
    } else {
      schedule = '已收集的物品： '
      for (let key in progress.collect) {
        let name = findCollectNameByKey(key)
        schedule += name + '(' + progress.collect[key] + ')、'
      }
      schedule = schedule.substr(0, schedule.length - 1)
      partyQuest.gain = '预计收集到的数量： ' + partyCollected.value
    }
    partyQuest.schedule = schedule
  }

  function loadParty(partyId, userId) {
    return new Promise((resolve, reject) => {
      getHBPartyInfo(partyId, (success, data) => {
        if (success) {
          let questKey = data.quest.key
          let joinCount = 0
          let isAccept = false
          if (questKey) {
            questKey = findQuestNameByKey(questKey)
            let members = data.quest.members
            for (let member in members) {
              if (members[member]) {
                joinCount++
                if (member === userId) {
                  isAccept = true
                }
              }
            }
          }
          setQuestSchedule(data.quest.progress)
          let active = data.quest.active
          partyQuest.active = active
          partyQuest.joinMembers = joinCount
          partyQuest.key = questKey
          partyQuest.isAccept = isAccept
          partyQuest.canStartQuest = !active && (userId === data.quest.leader || userId === data.leader.id)
          partyMembers.value = data.memberCount
          partyChat.value = []
          for (let i = 0; i < data.chat.length; ++i) {
            let chat = data.chat[i]
            let user = chat.user
            partyChat.value.push({
              id: chat._id,
              text: chat.text,
              user: user ? user : '系统',
              timestamp: new Date(chat.timestamp).toLocaleString('zh', { hour12: false }),
            })
          }
          resolve(data)
        } else {
          reject(data)
        }
      })
    })
  }

  function joinQuest(partyId) {
    return new Promise((resolve, reject) => {
      responsePartyQuest(partyId, 'accept', (success, data) => {
        if (success) {
          partyQuest.isAccept = true
          partyQuest.joinMembers++
          if (partyQuest.joinMembers === partyMembers.value) {
            partyQuest.active = true
            partyQuest.canStartQuest = false
            setQuestSchedule(data.progress)
          }
          resolve(data)
        } else {
          reject(data)
        }
      })
    })
  }

  function leaveQuest(partyId) {
    return new Promise((resolve, reject) => {
      responsePartyQuest(partyId, 'leave', (success, data) => {
        if (success) {
          partyQuest.isAccept = false
          partyQuest.joinMembers--
          resolve(data)
        } else {
          reject(data)
        }
      })
    })
  }

  function forceStartQuest(partyId) {
    return new Promise((resolve, reject) => {
      startPartyQuest(partyId, (success, data) => {
        if (success) {
          partyQuest.active = true
          setQuestSchedule(data.progress)
          partyQuest.canStartQuest = false
          resolve(data)
        } else {
          reject(data)
        }
      })
    })
  }

  function sendChat(partyId, msg) {
    return new Promise((resolve, reject) => {
      sendPartyChat(partyId, msg, (success, data) => {
        if (success) {
          resolve(data)
        } else {
          reject(data)
        }
      })
    })
  }

  function castSkill(key, name, target) {
    return new Promise((resolve, reject) => {
      castHabiticaSkill(key, target, (success, data) => {
        if (success) {
          closeSkillTask()
          resolve(data)
        } else {
          reject(data)
        }
      })
    })
  }

  function buyPotion() {
    return new Promise((resolve, reject) => {
      buyHealthPotion((success, data) => {
        if (success) {
          resolve(data)
        } else {
          reject(data)
        }
      })
    })
  }

  function toggleSleep(state) {
    return new Promise((resolve, reject) => {
      sleep(state, (success, data) => {
        if (success) {
          resolve(data)
        } else {
          reject(data)
        }
      })
    })
  }

  function showSkillTask(key, name) {
    skillState.isShowSkillTasks = true
    skillState.clickSkillKey = key
    skillState.clickSkillName = name
  }

  function closeSkillTask() {
    skillState.isShowSkillTasks = false
    skillState.clickSkillKey = null
    skillState.clickSkillName = null
  }

  return {
    partyMembers,
    partyChat,
    partyQuest,
    partyDamage,
    partyCollected,
    skillState,
    loadParty,
    joinQuest,
    leaveQuest,
    forceStartQuest,
    sendChat,
    castSkill,
    buyPotion,
    toggleSleep,
    showSkillTask,
    closeSkillTask,
  }
}
