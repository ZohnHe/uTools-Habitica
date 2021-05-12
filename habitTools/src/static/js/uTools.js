//https://u.tools/docs/developer/api.html#utools-api

function getFromDB(key) {
    return utools.db.get(key);
}

function openBrowser(uri) {
    utools.shellOpenExternal(uri);
}