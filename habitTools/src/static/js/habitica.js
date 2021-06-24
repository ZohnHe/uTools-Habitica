const USER_INFO_URL = "https://habitica.com/api/v3/user";
const TASKS_URL = "https://habitica.com/api/v3/tasks/user";
const TASKS_UPDATE_URL = "https://habitica.com/api/v3/tasks/";
const CRON_URL = "https://habitica.com/api/v3/cron";
const BULK_SCORE = "https://habitica.com/api/v4/tasks/bulk-score";
var headers = {'x-client': "ab029ac0-b53c-451b-829b-1138d283a40c-habitTools", 'x-api-user': '', 'x-api-key': ''};

function getHBUserInfo(doAfter) {
    axios.get(USER_INFO_URL, {headers: headers}).then(res => {
        res.data.success ? doAfter(true, res.data.data) : doAfter(false, res.data.error);
    }).catch(err => {
        console.error("getHBUserInfo request habitica error: ", err);
        doAfter(false, err.response.status);
    });
}

function getHBHabit(after) {
    axios.get(TASKS_URL, {headers: headers}).then(res => {
        if (res.data.success) {after(res.data.data);}
    }).catch(err => {
        console.error("getHBHabit request habitica error: ", err);
        after(null);
    });
}

function getColorByValue(value) {
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

function updateHBTask(id, body) {
    axios.put(TASKS_UPDATE_URL + id, body, {headers: headers});
}

function scoreHBTask(id, direction, doAfter) {
    axios.post(TASKS_UPDATE_URL + id + "/score/" + direction, {}, {headers: headers}).then(res => {
        res.data.success ? doAfter(true, res.data.data) : doAfter(false, res.data.error);
    }).catch(err => {
        console.error("scoreHBTask request habitica error: ", err);
        doAfter(false, err.response.status);
    });
}

function scoreHBCheckList(taskId, checkListId) {
    axios.post(TASKS_UPDATE_URL + taskId + "/checklist/" + checkListId + "/score", {}, {headers: headers});
}

function createTask(text, type, doAfter) {
    axios.post(TASKS_URL, {"text": text, "type": type}, {headers: headers}).then(res => {
        doAfter(res.data.success);
    }).catch(err => {
        console.error("createTask request habitica error: ", err);
        doAfter(null);
    });
}
function bulkUpScore(body) {
    axios.post(BULK_SCORE, body, {headers: headers});
}

function cronTask(after) {
    axios.post(CRON_URL, null, {headers: headers}).then(res => {
        after(res.data.success);
    }).catch(err => {
        console.error("cronTask request habitica error: ", err);
        after(null);
    });
}