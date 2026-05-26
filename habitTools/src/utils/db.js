export function getFromDB(key) {
  const value = utools.db.get(key)
  if (!value) return null
  return value.data
}

export function getRevFromDB(key) {
  const value = utools.db.get(key)
  if (!value) return null
  return value._rev
}

export function saveToDB(key, value, rev) {
  if (rev) {
    return utools.db.put({ _id: key, data: value, _rev: rev })
  }
  return utools.db.put({ _id: key, data: value })
}

export function delInDB(key) {
  utools.db.remove(key)
}

export function openBrowser(uri) {
  utools.shellOpenExternal(uri)
}

export const DB_KEY_USER_INFO = 'USER_INFO'
export const DB_KEY_TAG_SETTING = 'TAG_SETTING'
export const DB_KEY_SPLIT = '@'
