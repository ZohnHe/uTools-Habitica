const DB_KEY_USER_INFO = "USER_INFO";
const DB_KEY_TAG_SETTING = "TAG_SETTING";
const DB_KEY_SPLIT = "@";

function getFromDB(key) {
    let value = utools.db.get(key);
    if (!value) {
        return null;
    }
    return value.data;
}
function getRevFromDB(key) {
    let value = utools.db.get(key);
    if (!value) {
        return null;
    }
    return value._rev;
}

function saveToDB(key, value, rev) {
    if (rev) {
        return utools.db.put({_id: key, data: value, _rev: rev});
    } else {
        return utools.db.put({_id: key, data: value});
    }
}

function delInDB(key) {
    utools.db.remove(key);
}

function openBrowser(uri) {
    utools.shellOpenExternal(uri);
}