import axios from 'axios'

const API_ROOT = 'https://habitica.com'
const USER_INFO_URL = `${API_ROOT}/api/v4/user`
const TASKS_UPDATE_URL = `${API_ROOT}/api/v4/tasks/`
const TASKS_URL = `${TASKS_UPDATE_URL}user`
const CRON_URL = `${API_ROOT}/api/v4/cron`
const BULK_SCORE_URL = `${API_ROOT}/api/v4/tasks/bulk-score`
const COMPLETED_TASK_URL = `${API_ROOT}/api/v4/tasks/user?type=completedTodos`
const PARTY_URL = `${API_ROOT}/api/v4/groups/`
const CAST_URL = `${USER_INFO_URL}/class/cast/`
const BUY_HEALTH_URL = `${USER_INFO_URL}/buy-health-potion`
const SLEEP_URL = `${USER_INFO_URL}/sleep`

export const headers = {
  'x-client': 'ab029ac0-b53c-451b-829b-1138d283a40c-habitTools',
  'x-api-user': '',
  'x-api-key': '',
}

function getErrResponseMsg(err) {
  let msg = null
  if (err.response) {
    if (err.response.status === 429) {
      msg = '操作频繁，休息一会'
    } else if (err.response.data) {
      msg = err.response.data.message
    } else {
      msg = err.response.status
    }
  } else {
    msg = '与Habitica通信异常，需检查网络环境'
  }
  return msg
}

export function getHBUserInfo(doAfter) {
  axios.get(USER_INFO_URL, { headers: headers }).then(rsp => {
    rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error)
  }).catch(err => {
    console.error('getHBUserInfo error: ', err)
    doAfter(false, getErrResponseMsg(err))
  })
}

export function getHBHabit(doAfter) {
  axios.get(TASKS_URL, { headers: headers }).then(rsp => {
    rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error)
  }).catch(err => {
    console.error('getHBHabit error: ', err)
    doAfter(false, getErrResponseMsg(err))
  })
}

export function updateHBTask(id, body, doAfter) {
  axios.put(`${TASKS_UPDATE_URL}${id}`, body, { headers: headers }).then(rsp => {
    rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error)
  }).catch(err => {
    console.error('updateHBTask error: ', err)
    doAfter(false, getErrResponseMsg(err))
  })
}

export function scoreHBTask(id, direction, doAfter) {
  axios.post(`${TASKS_UPDATE_URL}${id}/score/${direction}`, {}, { headers: headers }).then(rsp => {
    rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error)
  }).catch(err => {
    console.error('scoreHBTask error: ', err)
    doAfter(false, getErrResponseMsg(err))
  })
}

export function scoreHBCheckList(taskId, checkListId) {
  axios.post(`${TASKS_UPDATE_URL}${taskId}/checklist/${checkListId}/score`, {}, { headers: headers })
}

export function createTask(text, type, doAfter) {
  axios.post(TASKS_URL, { text: text, type: type }, { headers: headers }).then(rsp => {
    rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error)
  }).catch(err => {
    console.error('createTask error: ', err)
    doAfter(false, getErrResponseMsg(err))
  })
}

export function bulkUpScore(body, doAfter) {
  axios.post(BULK_SCORE_URL, body, { headers: headers }).then(rsp => {
    rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error)
  }).catch(err => {
    console.error('bulkUpScore error: ', err)
    doAfter(false, getErrResponseMsg(err))
  })
}

export function cronTask(doAfter) {
  axios.post(CRON_URL, null, { headers: headers }).then(rsp => {
    doAfter(rsp.data.success)
  }).catch(err => {
    console.error('cronTask error: ', err)
    doAfter(false)
  })
}

export function getHBCompletedTask(doAfter) {
  axios.get(COMPLETED_TASK_URL, { headers: headers }).then(rsp => {
    rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error)
  }).catch(err => {
    console.error('getHBCompletedTask error: ', err)
    doAfter(false, getErrResponseMsg(err))
  })
}

export function deleteHBTask(id, doAfter) {
  axios.delete(`${TASKS_UPDATE_URL}${id}`, { headers: headers }).then(rsp => {
    rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error)
  }).catch(err => {
    console.error('deleteHBTask error: ', err)
    doAfter(false, getErrResponseMsg(err))
  })
}

export function getHBPartyInfo(partyId, doAfter) {
  axios.get(`${PARTY_URL}${partyId}`, { headers: headers }).then(rsp => {
    rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error)
  }).catch(err => {
    console.error('getHBPartyInfo error: ', err)
    doAfter(false, getErrResponseMsg(err))
  })
}

export function responsePartyQuest(id, direction, doAfter) {
  axios.post(`${PARTY_URL}${id}/quests/${direction}`, {}, { headers: headers }).then(rsp => {
    rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error)
  }).catch(err => {
    console.error('responsePartyQuest error: ', err)
    doAfter(false, getErrResponseMsg(err))
  })
}

export function sendPartyChat(id, msg, doAfter) {
  axios.post(`${PARTY_URL}${id}/chat`, { message: msg }, { headers: headers }).then(rsp => {
    rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error)
  }).catch(err => {
    console.error('sendPartyChat error: ', err)
    doAfter(false, getErrResponseMsg(err))
  })
}

export function dragHabiticaTask(taskId, index, doAfter) {
  axios.post(`${TASKS_UPDATE_URL}${taskId}/move/to/${index}`, {}, { headers: headers }).then(rsp => {
    rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error)
  }).catch(err => {
    console.error('dragHabiticaTask error: ', err)
    doAfter(false, getErrResponseMsg(err))
  })
}

export function castHabiticaSkill(spellId, targetId, doAfter) {
  const param = targetId ? `?targetId=${targetId}` : ''
  axios.post(`${CAST_URL}${spellId}${param}`, {}, { headers: headers }).then(rsp => {
    rsp.data.success ? doAfter(true, rsp.data.data.user.stats) : doAfter(false, rsp.data.error)
  }).catch(err => {
    console.error('castHabiticaSkill error: ', err)
    doAfter(false, getErrResponseMsg(err))
  })
}

export function buyHealthPotion(doAfter) {
  axios.post(BUY_HEALTH_URL, {}, { headers: headers }).then(rsp => {
    rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error)
  }).catch(err => {
    console.error('buyHealthPotion error: ', err)
    doAfter(false, getErrResponseMsg(err))
  })
}

export function sleep(state, doAfter) {
  axios.post(SLEEP_URL, { data: state }, { headers: headers }).then(rsp => {
    rsp.data.success ? doAfter(true) : doAfter(false, 'Habitica服务器异常')
  }).catch(err => {
    console.error('buyHealthPotion error: ', err)
    doAfter(false, getErrResponseMsg(err))
  })
}

export function startPartyQuest(partyId, doAfter) {
  axios.post(`${PARTY_URL}${partyId}/quests/force-start`, {}, { headers: headers }).then(rsp => {
    rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error)
  }).catch(err => {
    console.error('startPartyQuest error: ', err)
    doAfter(false, getErrResponseMsg(err))
  })
}
