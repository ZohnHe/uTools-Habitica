import { ref, reactive } from 'vue'
import { getFromDB, saveToDB, delInDB, DB_KEY_USER_INFO, DB_KEY_SPLIT } from '../utils/db.js'
import { headers, getHBUserInfo } from '../api/habitica.js'

export function useUser() {
  const isLoading = ref(true)
  const loginDialog = ref(false)
  const requestLock = ref(false)
  const userForm = reactive({ user: '', key: '' })

  const profile = reactive({
    name: '', username: '', level: 0, sleep: false,
    HP: 0, EXP: 0, maxEXP: 0, MP: 0, maxMP: 0, GP: 0,
    userClass: '', avatar: '', partyId: '',
    partyDamage: 0, partyCollected: 0,
    lastCron: null, dayStart: 0,
  })

  function isNotLogin() {
    if (!headers['x-api-user']) {
      const userInfo = getFromDB(DB_KEY_USER_INFO)
      if (!userInfo) return true
      const values = window.atob(userInfo).split(DB_KEY_SPLIT)
      headers['x-api-key'] = values[0]
      headers['x-api-user'] = values[1]
    }
    return false
  }

  function setProfile(userInfo) {
    profile.name = userInfo.profile.name
    profile.username = userInfo.auth.local.username
    profile.level = userInfo.stats.lvl
    profile.sleep = userInfo.preferences.sleep
    profile.HP = userInfo.stats.hp
    profile.EXP = userInfo.stats.exp
    profile.maxEXP = userInfo.stats.toNextLevel
    profile.MP = userInfo.stats.mp
    profile.maxMP = userInfo.stats.maxMP
    profile.GP = userInfo.stats.gp
    profile.userClass = userInfo.stats.class
    profile.avatar = `/svg/${userInfo.stats.class}.svg`
    profile.lastCron = userInfo.lastCron
    profile.dayStart = userInfo.preferences.dayStart
    if (userInfo.party) {
      profile.partyId = userInfo.party._id
      profile.partyDamage = userInfo.party.quest.progress.up.toFixed(2)
      profile.partyCollected = userInfo.party.quest.progress.collectedItems
    }
  }

  function login() {
    const user = userForm.user
    const key = userForm.key
    if (!user.trim() || !key.trim()) {
      loginDialog.value = true
      return Promise.reject('请输入你的凭证')
    }
    headers['x-api-user'] = user
    headers['x-api-key'] = key
    return new Promise((resolve, reject) => {
      getHBUserInfo((success, data) => {
        if (success) {
          setProfile(data)
          saveToDB(DB_KEY_USER_INFO, window.btoa(key + DB_KEY_SPLIT + user))
          userForm.key = ''
          userForm.user = ''
          isLoading.value = false
          resolve(data)
        } else {
          loginDialog.value = true
          reject(data)
        }
      })
    })
  }

  function logout() {
    isLoading.value = true
    headers['x-api-user'] = ''
    headers['x-api-key'] = ''
    delInDB(DB_KEY_USER_INFO)
    delInDB('TAG_SETTING')
    loginDialog.value = true
  }

  function sync() {
    return new Promise((resolve, reject) => {
      getHBUserInfo((success, data) => {
        if (success) {
          setProfile(data)
          resolve(data)
        } else {
          reject(data)
        }
      })
    })
  }

  return {
    isLoading, loginDialog, requestLock, userForm, profile,
    isNotLogin, login, logout, sync,
  }
}
