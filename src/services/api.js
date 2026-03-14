// Use relative URL in development (with Vite proxy) or absolute URL in production
const API_URL = import.meta.env.VITE_API_URL

export const api = {
  // Armies
  getArmies: async () => {
    const response = await fetch(`${API_URL}/api/armies/`)
    if (!response.ok) throw new Error('Failed to fetch armies')
    const data = await response.json()
    return data.results || data
  },

  getArmy: async (id) => {
    const response = await fetch(`${API_URL}/api/armies/${id}/`)
    if (!response.ok) throw new Error('Failed to fetch army')
    return response.json()
  },

  createArmy: async (data, token) => {
    const response = await fetch(`${API_URL}/api/armies/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create army')
    return response.json()
  },

  updateArmy: async (id, data, token) => {
    const response = await fetch(`${API_URL}/api/armies/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.iconUrl?.[0] || 'Failed to update army')
    }
    return response.json()
  },

  deleteArmy: async (id, token) => {
    const response = await fetch(`${API_URL}/api/armies/${id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    if (!response.ok) throw new Error('Failed to delete army')
    return true
  },

  deleteArmyImage: async (armyId, imageId, token) => {
    const response = await fetch(`${API_URL}/api/armies/${armyId}/images/${imageId}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    if (!response.ok) throw new Error('Failed to delete image')
    return true
  },

  // Painting Guides
  getPaintingGuides: async () => {
    const response = await fetch(`${API_URL}/api/guides/`)
    if (!response.ok) throw new Error('Failed to fetch guides')
    const data = await response.json()
    return data.results || data
  },

  getGuide: async (id) => {
    const response = await fetch(`${API_URL}/api/guides/${id}/`)
    if (!response.ok) throw new Error('Failed to fetch guide')
    return response.json()
  },

  createGuide: async (data, token) => {
    const response = await fetch(`${API_URL}/api/guides/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create guide')
    return response.json()
  },

  updateGuide: async (id, data, token) => {
    const response = await fetch(`${API_URL}/api/guides/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update guide')
    return response.json()
  },

  deleteGuide: async (id, token) => {
    const response = await fetch(`${API_URL}/api/guides/${id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    if (!response.ok) throw new Error('Failed to delete guide')
    return true
  },

  likeGuide: async (id, userId) => {
    const response = await fetch(`${API_URL}/api/guides/${id}/like/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    })
    if (!response.ok) throw new Error('Failed to like guide')
    return response.json()
  },

  // Battle Reports
  getBattleReports: async () => {
    const response = await fetch(`${API_URL}/api/battle-reports/`)
    if (!response.ok) throw new Error('Failed to fetch battle reports')
    const data = await response.json()
    return data.results || data
  },

  getBattleReport: async (id) => {
    const response = await fetch(`${API_URL}/api/battle-reports/${id}/`)
    if (!response.ok) throw new Error('Failed to fetch battle report')
    return response.json()
  },

  createBattleReport: async (data, token) => {
    const response = await fetch(`${API_URL}/api/battle-reports/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create battle report')
    return response.json()
  },

  updateBattleReport: async (id, data, token) => {
    const response = await fetch(`${API_URL}/api/battle-reports/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update battle report')
    return response.json()
  },

  deleteBattleReport: async (id, token) => {
    const response = await fetch(`${API_URL}/api/battle-reports/${id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    if (!response.ok) throw new Error('Failed to delete battle report')
    return true
  },

  likeBattleReport: async (id, userId) => {
    const response = await fetch(`${API_URL}/api/battle-reports/${id}/like/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    })
    if (!response.ok) throw new Error('Failed to like battle report')
    return response.json()
  },

  login: async (username, password) => {
    const response = await fetch(`${API_URL}/api/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!response.ok) throw new Error('Login failed')
    return response.json()
  },

  // Lore Entries
  getLoreEntries: async () => {
    const response = await fetch(`${API_URL}/api/lore/`)
    if (!response.ok) throw new Error('Failed to fetch lore entries')
    const data = await response.json()
    return data.results || data
  },

  getLoreEntry: async (id) => {
    const response = await fetch(`${API_URL}/api/lore/${id}/`)
    if (!response.ok) throw new Error('Failed to fetch lore entry')
    return response.json()
  },

  createLoreEntry: async (data, token) => {
    const response = await fetch(`${API_URL}/api/lore/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create lore entry')
    return response.json()
  },

  updateLoreEntry: async (id, data, token) => {
    const response = await fetch(`${API_URL}/api/lore/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update lore entry')
    return response.json()
  },

  deleteLoreEntry: async (id, token) => {
    const response = await fetch(`${API_URL}/api/lore/${id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    if (!response.ok) throw new Error('Failed to delete lore entry')
    return true
  },
}
