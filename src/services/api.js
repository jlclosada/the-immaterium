// Use relative URL in development (with Vite proxy) or absolute URL in production
const API_URL = import.meta.env.VITE_API_URL || ''

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

  // Paints catalogue
  getPaints: async (search = '') => {
    const params = search ? `?search=${encodeURIComponent(search)}` : ''
    const response = await fetch(`${API_URL}/api/paints/${params}`)
    if (!response.ok) throw new Error('Failed to fetch paints')
    const data = await response.json()
    return data.results || data
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

  // News
  getNewsArticles: async () => {
    const response = await fetch(`${API_URL}/api/news/`)
    if (!response.ok) throw new Error('Failed to fetch news')
    const data = await response.json()
    return data.results || data
  },
  getNewsArticle: async (id) => {
    const response = await fetch(`${API_URL}/api/news/${id}/`)
    if (!response.ok) throw new Error('Failed to fetch article')
    return response.json()
  },
  createNewsArticle: async (data, token) => {
    const response = await fetch(`${API_URL}/api/news/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create article')
    return response.json()
  },
  updateNewsArticle: async (id, data, token) => {
    const response = await fetch(`${API_URL}/api/news/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update article')
    return response.json()
  },
  deleteNewsArticle: async (id, token) => {
    const response = await fetch(`${API_URL}/api/news/${id}/`, {
      method: 'DELETE',
      headers: { Authorization: `Token ${token}` },
    })
    if (!response.ok) throw new Error('Failed to delete article')
    return true
  },

  // Users (admin only)
  getUsers: async (token) => {
    const response = await fetch(`${API_URL}/api/users/`, {
      headers: { Authorization: `Token ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch users')
    return response.json()
  },

  createUser: async (data, token) => {
    const response = await fetch(`${API_URL}/api/users/create/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
      body: JSON.stringify(data),
    })
    const json = await response.json()
    if (!response.ok) throw new Error(json.error || 'Failed to create user')
    return json
  },

  deleteUser: async (userId, token) => {
    const response = await fetch(`${API_URL}/api/users/${userId}/delete/`, {
      method: 'DELETE',
      headers: { Authorization: `Token ${token}` },
    })
    if (!response.ok) {
      const json = await response.json().catch(() => ({}))
      throw new Error(json.error || 'Failed to delete user')
    }
    return true
  },

  toggleUserActive: async (userId, token) => {
    const response = await fetch(`${API_URL}/api/users/${userId}/toggle-active/`, {
      method: 'PATCH',
      headers: { Authorization: `Token ${token}` },
    })
    const json = await response.json()
    if (!response.ok) throw new Error(json.error || 'Failed to toggle user status')
    return json
  },

  getGames: async () => {
    const response = await fetch(`${API_URL}/api/games/`)
    if (!response.ok) throw new Error('Failed to fetch games')
    const data = await response.json()
    return data.results || data
  },

  // New Recruit integration
  newRecruitExport: async ({ report, login, password }) => {
    const response = await fetch(`${API_URL}/api/new-recruit/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password, report }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error al exportar a New Recruit')
    return data
  },

  // Global Search
  search: async (query, type = 'all') => {
    const params = new URLSearchParams({ q: query })
    if (type !== 'all') params.append('type', type)
    const response = await fetch(`${API_URL}/api/search/?${params}`)
    if (!response.ok) throw new Error('Search failed')
    return response.json()
  },

  // Army Builder
  getBuilderFactions: async () => {
    const response = await fetch(`${API_URL}/api/builder/factions/`)
    if (!response.ok) throw new Error('Failed to fetch builder factions')
    return response.json()
  },

  getBuilderFaction: async (id) => {
    const response = await fetch(`${API_URL}/api/builder/factions/${id}/`)
    if (!response.ok) throw new Error('Failed to fetch faction')
    return response.json()
  },

  getBuilderLists: async (ownerId) => {
    const response = await fetch(`${API_URL}/api/builder/lists/?owner_id=${ownerId}`)
    if (!response.ok) throw new Error('Failed to fetch army lists')
    return response.json()
  },

  createBuilderList: async (data) => {
    const response = await fetch(`${API_URL}/api/builder/lists/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create army list')
    return response.json()
  },

  updateBuilderList: async (id, data) => {
    const response = await fetch(`${API_URL}/api/builder/lists/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update army list')
    return response.json()
  },

  deleteBuilderList: async (id) => {
    const response = await fetch(`${API_URL}/api/builder/lists/${id}/`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete army list')
    return true
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
      headers: { Authorization: `Token ${token}` },
    })
    if (!response.ok) throw new Error('Failed to delete lore entry')
    return true
  },

  // ── Marketplace ─────────────────────────────────────
  getListings: async (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    const response = await fetch(`${API_URL}/api/listings/${qs ? '?' + qs : ''}`)
    if (!response.ok) throw new Error('Failed to fetch listings')
    const data = await response.json()
    return data.results || data
  },

  getListing: async (id) => {
    const response = await fetch(`${API_URL}/api/listings/${id}/`)
    if (!response.ok) throw new Error('Failed to fetch listing')
    return response.json()
  },

  createListing: async (data, token) => {
    const response = await fetch(`${API_URL}/api/listings/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create listing')
    return response.json()
  },

  updateListing: async (id, data, token) => {
    const response = await fetch(`${API_URL}/api/listings/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update listing')
    return response.json()
  },

  deleteListing: async (id, token) => {
    const response = await fetch(`${API_URL}/api/listings/${id}/`, {
      method: 'DELETE',
      headers: { Authorization: `Token ${token}` },
    })
    if (!response.ok) throw new Error('Failed to delete listing')
    return true
  },

  setListingStatus: async (id, listingStatus, token) => {
    const response = await fetch(`${API_URL}/api/listings/${id}/set-status/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
      body: JSON.stringify({ status: listingStatus }),
    })
    if (!response.ok) throw new Error('Failed to update listing status')
    return response.json()
  },

  createPurchaseRequest: async (data) => {
    const response = await fetch(`${API_URL}/api/purchase-requests/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create purchase request')
    return response.json()
  },

  getPurchaseRequests: async (token) => {
    const response = await fetch(`${API_URL}/api/purchase-requests/`, {
      headers: { Authorization: `Token ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch purchase requests')
    const data = await response.json()
    return data.results || data
  },

  setPurchaseRequestStatus: async (id, reqStatus, token, extraData = {}) => {
    const response = await fetch(`${API_URL}/api/purchase-requests/${id}/set-status/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
      body: JSON.stringify({ status: reqStatus, ...extraData }),
    })
    if (!response.ok) throw new Error('Failed to update request status')
    return response.json()
  },

  getPendingRequestsCount: async (token) => {
    const response = await fetch(`${API_URL}/api/purchase-requests/pending-count/`, {
      headers: { Authorization: `Token ${token}` },
    })
    if (!response.ok) return 0
    const data = await response.json()
    return data.count || 0
  },

  // ── User Auth ──────────────────────────────────────────────────────────────

  register: async (name, email, password) => {
    const res = await fetch(`${API_URL}/api/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error al registrarse')
    return data
  },

  loginWithEmail: async (email, password) => {
    const res = await fetch(`${API_URL}/api/auth/login-email/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Credenciales incorrectas')
    return data
  },

  googleAuth: async (credential) => {
    const res = await fetch(`${API_URL}/api/auth/google/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error con Google Sign-In')
    return data
  },

  getMe: async (token) => {
    const res = await fetch(`${API_URL}/api/auth/me/`, {
      headers: { Authorization: `Token ${token}` },
    })
    if (!res.ok) throw new Error('Sesión expirada')
    return res.json()
  },

  logoutUser: async (token) => {
    await fetch(`${API_URL}/api/auth/logout/`, {
      method: 'POST',
      headers: { Authorization: `Token ${token}` },
    }).catch(() => {})
  },

  // ── Stripe ────────────────────────────────────────────────────────────────

  createCheckoutSession: async (guideId, token) => {
    const res = await fetch(`${API_URL}/api/stripe/create-checkout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ guide_id: guideId }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error al crear sesión de pago')
    return data
  },

  getMyPurchases: async (token) => {
    const res = await fetch(`${API_URL}/api/auth/purchases/`, {
      headers: { Authorization: `Token ${token}` },
    })
    if (!res.ok) return { purchases: [] }
    return res.json()
  },
}
