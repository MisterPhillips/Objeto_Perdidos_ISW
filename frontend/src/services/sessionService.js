const TOKEN_KEY = 'findubb.token'
const USER_KEY = 'findubb.user'

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getSessionToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getSessionExpiration() {
  const token = getSessionToken()
  const payload = token?.split('.')[1]
  if (!payload) return null

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const claims = JSON.parse(window.atob(base64))
    return Number.isFinite(claims.exp) ? claims.exp * 1000 : null
  } catch {
    return null
  }
}

export function getSessionUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}