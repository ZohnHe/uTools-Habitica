const CLIENT_VALUE = "ab029ac0-b53c-451b-829b-1138d283a40c-habitTools";
const USER_INFO_URL = "https://habitica.com/api/v3/user";
const TASKS_URL = "https://habitica.com/api/v3/tasks/user";

function getHBUserInfo(user, key, after) {
    axios.get(USER_INFO_URL, {
        headers: {'x-client': CLIENT_VALUE, 'x-api-user': user, 'x-api-key': key}
    }).then(res => {
        if (res.data.success) {
            after(res.data.data);
        }
    }).catch(err => {
        console.error("getHBUserInfo request habitica error: " + err);
        after(null);
    });
}

function getHBHabit(user, key, after) {
    axios.get(TASKS_URL, {
        headers: {'x-client': CLIENT_VALUE, 'x-api-user': user, 'x-api-key': key}
    }).then(res => {
        if (res.data.success) {
            after(res.data.data);
        }
    }).catch(err => {
        console.error("getHBHabit request habitica error: " + err);
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
    } else {
        return "#C64F53";
    }
}