const clientValue = "ab029ac0-b53c-451b-829b-1138d283a40c-habitTools";

function getHBUserInfo(userId, userKey, after) {
    axios.get("https://habitica.com/api/v3/user", {
        headers: {'x-client': clientValue, 'x-api-user': userId, 'x-api-key': userKey}
    }).then(res => {
        if (res.data.success) {
            after(res.data.data);
        }
    }).catch(err => {
        console.error("request habitica error: " + err);
        after(null);
    });
}

function getHBHabit() {
    console.info("获取habitica的习惯列表");
    setTimeout(function () {
        let message = '';
        console.info("habitica 返回： " + message);
        return message;
    },3000);
}