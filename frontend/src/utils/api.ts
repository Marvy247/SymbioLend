const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const api = {
  state:   () => fetch(`${BASE}/api/state`).then(r => r.json()),
  loans:   () => fetch(`${BASE}/api/loans`).then(r => r.json()),
  agents:  () => fetch(`${BASE}/api/agents`).then(r => r.json()),
  market:  () => fetch(`${BASE}/api/market`).then(r => r.json()),
  tick:    () => fetch(`${BASE}/api/tick`, { method: 'POST' }).then(r => r.json()),
  events:  () => new EventSource(`${BASE}/api/events`),
}
