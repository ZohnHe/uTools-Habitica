const USER_INFO_URL = "https://habitica.com/api/v3/user";
const TASKS_URL = "https://habitica.com/api/v3/tasks/user";
const TASKS_UPDATE_URL = "https://habitica.com/api/v3/tasks/";
var headers = {'x-client': "ab029ac0-b53c-451b-829b-1138d283a40c-habitTools", 'x-api-user': '', 'x-api-key': ''};

function getHBUserInfo(after) {
    axios.get(USER_INFO_URL, {headers: headers}).then(res => {
        if (res.data.success) {after(res.data.data);}
    }).catch(err => {
        console.error("getHBUserInfo request habitica error: ", err);
        after(null);
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
    }else if (value >= 5) {
        return "#339DA8";
    }else if (value > 0) {
        return "#229F72";
    }else if (value === 0) {
        return "#DDA146";
    }else if (value > -10) {
        return "#DF7C39";
    }else {
        return "#C64F53";
    }
}

function updateHBTask(id, body) {
    axios.put(TASKS_UPDATE_URL + id, body, {headers: headers});
}

function scoreHBTask(id, direction, after) {
    axios.post(TASKS_UPDATE_URL + id + "/score/" + direction, {}, {headers: headers}).then(res => {
        if (res.data.success) {after(res.data.data);}
    }).catch(err => {
        console.error("scoreHBTask request habitica error: ", err);
        after(null);
    });
}

function scoreHBCheckList(taskId, checkListId) {
    axios.post(TASKS_UPDATE_URL + taskId + "/checklist/" + checkListId + "/score", {}, {headers: headers});
}