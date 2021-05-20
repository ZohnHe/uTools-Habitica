//https://u.tools/docs/developer/api.html#utools-api
const DB_KEY_USER_INFO = "USER_INFO";
const DB_KEY_SPLIT = "@";

function getFromDB(key) {
    let valueJson = utools.db.get(key);
    if (!valueJson) {
        console.info("db get null!");
        return null;
    }
    let value = valueJson.data;
    console.info("db get = " + value);
    return window.atob(value);
}

function saveToDB(key, value) {
    let sign = window.btoa(value);
    return utools.db.put({_id: key, data: sign});
}

function openBrowser(uri) {
    utools.shellOpenExternal(uri);
}