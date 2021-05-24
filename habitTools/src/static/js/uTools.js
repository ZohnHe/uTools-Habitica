const DB_KEY_USER_INFO = "USER_INFO";
const DB_KEY_SPLIT = "@";

function getFromDB(key) {
    let valueJson = utools.db.get(key);
    if (!valueJson) {
        return null;
    }
    let value = valueJson.data;
    return window.atob(value);
}

function saveToDB(key, value) {
    let sign = window.btoa(value);
    return utools.db.put({_id: key, data: sign});
}

function delInDB(key) {
    utools.db.remove(key);
}

function openBrowser(uri) {
    utools.shellOpenExternal(uri);
}