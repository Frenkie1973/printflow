// Prusa Connect API integratie
// Logt in via de Prusa Connect auth API en haalt printer status op

const PRUSA_CONNECT_URL = 'https://connect.prusa3d.com'

// Sla token op in localStorage zodat je niet elke keer opnieuw hoeft in te loggen
const TOKEN_KEY = 'prusa_connect_token'
const TOKEN_EXPIRY_KEY = 'prusa_connect_token_expiry'

async function getPrusaToken(username, password) {
  // Check of we nog een geldig token hebben
  const existing = localStorage.getItem(TOKEN_KEY)
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
  if (existing && expiry && Date.now() < parseInt(expiry)) {
    return existing
  }

  // Inloggen
  const resp = await fetch(`${PRUSA_CONNECT_URL}/p/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  if (!resp.ok) throw new Error('Prusa Connect login mislukt')
  const data = await resp.json()
  const token = data.session?.token || data.token
  if (!token) throw new Error('Geen token ontvangen')

  // 1 uur geldig
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + 3600000))
  return token
}

export async function fetchPrusaPrinters(username, password) {
  const token = await getPrusaToken(username, password)
  const resp = await fetch(`${PRUSA_CONNECT_URL}/app/printers?limit=25`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!resp.ok) {
    // Token verlopen, verwijder en probeer opnieuw
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
    const token2 = await getPrusaToken(username, password)
    const resp2 = await fetch(`${PRUSA_CONNECT_URL}/app/printers?limit=25`, {
      headers: { 'Authorization': `Bearer ${token2}` }
    })
    if (!resp2.ok) throw new Error('Kon printers niet ophalen')
    return resp2.json()
  }
  return resp.json()
}
