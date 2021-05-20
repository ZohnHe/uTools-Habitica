
function getHBUserInfo(userId, userKey, after) {
    axios.get("https://habitica.com/api/v3/user?userFields=profile,stats,tasksOrder", {
        headers: {'X-Api-User': userId, 'X-Api-Key': userKey}
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