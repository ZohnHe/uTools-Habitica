const USER_INFO_URL = "https://habitica.com/api/v3/user";
const TASKS_URL = "https://habitica.com/api/v3/tasks/user";
const TASKS_UPDATE_URL = "https://habitica.com/api/v3/tasks/";
const CRON_URL = "https://habitica.com/api/v3/cron";
const BULK_SCORE = "https://habitica.com/api/v4/tasks/bulk-score";
const COMPLETED_TASK_URL = "https://habitica.com/api/v4/tasks/user?type=completedTodos";
const PARTY_URL = "https://habitica.com/api/v3/groups/";
var headers = {'x-client': "ab029ac0-b53c-451b-829b-1138d283a40c-habitTools", 'x-api-user': '', 'x-api-key': ''};

function getHBUserInfo(doAfter) {
    axios.get(USER_INFO_URL, {headers: headers}).then(rsp => {
        rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error);
    }).catch(err => {
        console.error("getHBUserInfo request habitica error: ", err);
        doAfter(false, err.response.status);
    });
}

function getHBHabit(after) {
    axios.get(TASKS_URL, {headers: headers}).then(rsp => {
        if (rsp.data.success) after(rsp.data.data);
    }).catch(err => {
        console.error("getHBHabit request habitica error: ", err);
        after(null);
    });
}

function getColorByValue(value) {
    value = value ? Math.floor(value) : 0;
    if (value >= 10) {
        return "#438EB6";
    } else if (value >= 5) {
        return "#339DA8";
    } else if (value > 0) {
        return "#229F72";
    } else if (value === 0) {
        return "#DDA146";
    } else if (value > -10) {
        return "#DF7C39";
    } else {
        return "#C64F53";
    }
}

function updateHBTask(id, body, doAfter) {
    axios.put(TASKS_UPDATE_URL + id, body, {headers: headers}).then(rsp => {
        rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error);
    }).catch(err => {
        console.error("updateHBTask request habitica error: ", err);
        doAfter(false, err.response.status);
    });
}

function scoreHBTask(id, direction, doAfter) {
    axios.post(TASKS_UPDATE_URL + id + "/score/" + direction, {}, {headers: headers}).then(rsp => {
        rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error);
    }).catch(err => {
        console.error("scoreHBTask request habitica error: ", err);
        doAfter(false, err.response.status);
    });
}

function scoreHBCheckList(taskId, checkListId) {
    axios.post(TASKS_UPDATE_URL + taskId + "/checklist/" + checkListId + "/score", {}, {headers: headers});
}

function createTask(text, type, doAfter) {
    axios.post(TASKS_URL, {"text": text, "type": type}, {headers: headers}).then(rsp => {
        doAfter(rsp.data.success);
    }).catch(err => {
        console.error("createTask request habitica error: ", err);
        doAfter(null);
    });
}
function bulkUpScore(body, doAfter) {
    axios.post(BULK_SCORE, body, {headers: headers}).then(rsp => {
        rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error);
    }).catch(err => {
        console.error("bulkUpScore request habitica error: ", err);
        doAfter(false, err.response.status);
    });
}

function cronTask(doAfter) {
    axios.post(CRON_URL, null, {headers: headers}).then(rsp => {
        doAfter(rsp.data.success);
    }).catch(err => {
        console.error("cronTask request habitica error: ", err);
        doAfter(false);
    });
}

function getHBCompletedTask(after) {
    axios.get(COMPLETED_TASK_URL, {headers: headers}).then(rsp => {
        if (rsp.data.success) {after(rsp.data.data);}
    }).catch(err => {
        console.error("getHBCompletedTask request habitica error: ", err);
        after(null);
    });
}

function getDateReminder(now, date) {
    if (!date) {
        return null;
    }
    let diff = Math.floor((new Date(date).getTime() - now.getTime()) / 1000 / 60 / 60 / 24);
    if (diff > 0) {
        return "还剩 " + diff + " 天";
    } else if (diff < 0) {
        return "超时 " + Math.abs(diff) + " 天";
    } else {
        return "期限为今日";
    }
}

function deleteHBTask(id, doAfter) {
    axios.delete(TASKS_UPDATE_URL + id, {headers: headers}).then(rsp => {
        rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error);
    }).catch(err => {
        console.error("deleteHBTask request habitica error: ", err);
        doAfter(false, err.response.status);
    });
}

function getHBPartyInfo(partyId, doAfter) {
    axios.get(PARTY_URL + partyId, {headers: headers}).then(rsp => {
        rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error);
    }).catch(err => {
        console.error("getHBPartyInfo request habitica error: ", err);
        doAfter(false, err.response.status);
    });
}

function responsePartyQuest(id, direction, doAfter) {
    axios.post(PARTY_URL + id + "/quests/" + direction, {}, {headers: headers}).then(rsp => {
        rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error);
    }).catch(err => {
        console.error("responsePartyQuest request habitica error: ", err);
        doAfter(false, err.response.status);
    });
}

function sendPartyChat(id, msg, doAfter) {
    axios.post(PARTY_URL + id + "/chat", {message: msg}, {headers: headers}).then(rsp => {
        doAfter(rsp.data.success);
    }).catch(err => {
        console.error("sendPartyChat request habitica error: ", err);
        doAfter(null);
    });
}
