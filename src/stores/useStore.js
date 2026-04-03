import { create } from 'zustand';
import { api } from '../services/api';

// Persistent anonymous user ID — generated once per browser, stored in localStorage
function getOrCreateUserId() {
  const key = 'wg-user-id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export const useStore = create((set, get) => ({
  // UI state
  selectedImage: null,
  selectedGuide: null,
  selectedBattleReport: null,
  menuOpen: false,

  // Language state
  language: localStorage.getItem('language') || 'es', // 'es' | 'en'
  setLanguage: (lang) => {
    localStorage.setItem('language', lang);
    set({ language: lang });
  },

  // Auth state
  token: localStorage.getItem('token') || null,
  username: localStorage.getItem('username') || null,
  user: null,          // Full user profile object
  purchases: [],       // List of purchased guide IDs
  authModalOpen: false, // Global auth modal visibility

  setToken: (token, username) => {
    localStorage.setItem('token', token);
    if (username) localStorage.setItem('username', username);
    set({ token, username: username || get().username });
  },
  setUser: (user, purchases = []) => {
    set({ user, purchases });
  },
  openAuthModal: () => set({ authModalOpen: true }),
  closeAuthModal: () => set({ authModalOpen: false }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    set({ token: null, username: null, user: null, purchases: [] });
  },

  // Data state (fetched from API)
  armies: [],
  paintingGuides: [],
  battleReports: [],

  // Loading state
  isLoading: false,
  error: null,

  // Social Features State (persisted in localStorage)
  userLikes: JSON.parse(localStorage.getItem('wg-likes') || '[]'),
  userFavorites: JSON.parse(localStorage.getItem('wg-favorites') || '[]'),

  // Actions
  fetchInitialData: async () => {
    set({ isLoading: true });
    try {
      const [armies, guides, reports] = await Promise.all([
        api.getArmies(),
        api.getPaintingGuides(),
        api.getBattleReports()
      ]);
      set({
        armies,
        paintingGuides: guides,
        battleReports: reports,
        isLoading: false
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
      set({ error: error.message, isLoading: false });
    }
  },

  selectImage: (image) => set({ selectedImage: image }),
  clearSelectedImage: () => set({ selectedImage: null }),

  toggleMenu: () => set((state) => ({ menuOpen: !state.menuOpen })),

  addImageToArmy: (armyId, imageData) => {
    set((state) => ({
      armies: state.armies.map(army =>
        army.id === armyId
          ? { ...army, images: [...army.images, imageData] }
          : army
      )
    }));
  },

  removeImageFromArmy: (armyId, imageId) => {
    set((state) => ({
      armies: state.armies.map(army =>
        army.id === armyId
          ? { ...army, images: army.images.filter(img => img.id !== imageId) }
          : army
      )
    }));
  },

  // Painting Guide Actions
  selectGuide: (guideId) => {
    const guide = get().paintingGuides.find(g => g.id === guideId);
    if (guide) {
      set({ selectedGuide: guide });
      // Optionally increment views here or via effect
    }
  },

  clearSelectedGuide: () => set({ selectedGuide: null }),

  // Battle Report Actions
  selectBattleReport: (reportId) => {
    const report = get().battleReports.find(r => r.id === reportId);
    if (report) {
      set({ selectedBattleReport: report });
    }
  },

  clearSelectedBattleReport: () => set({ selectedBattleReport: null }),

  // Social Actions
  toggleLike: async (contentId, contentType) => {
    const userLikes = get().userLikes;
    const isLiked = userLikes.includes(contentId);
    const userId = getOrCreateUserId();

    // Optimistic update + persist
    if (isLiked) {
      const updated = userLikes.filter(id => id !== contentId);
      set({ userLikes: updated });
      localStorage.setItem('wg-likes', JSON.stringify(updated));

      if (contentType === 'guide') {
        set({ paintingGuides: get().paintingGuides.map(g => g.id === contentId ? { ...g, likes: (g.likes || 1) - 1 } : g) });
        try { await api.likeGuide(contentId, userId); } catch (e) { console.error(e); }
      } else if (contentType === 'report') {
        set({ battleReports: get().battleReports.map(r => r.id === contentId ? { ...r, likes: (r.likes || 1) - 1 } : r) });
        try { await api.likeBattleReport(contentId, userId); } catch (e) { console.error(e); }
      } else if (contentType === 'lore') {
        try { await api.likeLoreEntry(contentId, userId); } catch (e) { console.error(e); }
      } else if (contentType === 'news') {
        try { await api.likeNewsArticle(contentId, userId); } catch (e) { console.error(e); }
      }
    } else {
      const updated = [...userLikes, contentId];
      set({ userLikes: updated });
      localStorage.setItem('wg-likes', JSON.stringify(updated));

      if (contentType === 'guide') {
        set({ paintingGuides: get().paintingGuides.map(g => g.id === contentId ? { ...g, likes: (g.likes || 0) + 1 } : g) });
        try { await api.likeGuide(contentId, userId); } catch (e) { console.error(e); }
      } else if (contentType === 'report') {
        set({ battleReports: get().battleReports.map(r => r.id === contentId ? { ...r, likes: (r.likes || 0) + 1 } : r) });
        try { await api.likeBattleReport(contentId, userId); } catch (e) { console.error(e); }
      } else if (contentType === 'lore') {
        try { await api.likeLoreEntry(contentId, userId); } catch (e) { console.error(e); }
      } else if (contentType === 'news') {
        try { await api.likeNewsArticle(contentId, userId); } catch (e) { console.error(e); }
      }
    }
  },

  toggleFavorite: (contentId) => {
    const userFavorites = get().userFavorites;
    const isFavorited = userFavorites.includes(contentId);

    if (isFavorited) {
      const updated = userFavorites.filter(id => id !== contentId);
      set({ userFavorites: updated });
      localStorage.setItem('wg-favorites', JSON.stringify(updated));
    } else {
      const updated = [...userFavorites, contentId];
      set({ userFavorites: updated });
      localStorage.setItem('wg-favorites', JSON.stringify(updated));
    }
  },

  addComment: (contentId, contentType, commentText, author = 'Usuario') => {
    const newComment = {
      id: `comment-${Date.now()}`,
      author,
      text: commentText,
      date: new Date().toISOString(),
      likes: 0
    };

    if (contentType === 'guide') {
      set({
        paintingGuides: get().paintingGuides.map(g =>
          g.id === contentId ? { ...g, comments: [...g.comments || [], newComment] } : g
        )
      });
    } else if (contentType === 'report') {
      set({
        battleReports: get().battleReports.map(r =>
          r.id === contentId ? { ...r, comments: [...r.comments || [], newComment] } : r
        )
      });
    }
  },

  incrementViews: (contentId, contentType) => {
    if (contentType === 'guide') {
      set({
        paintingGuides: get().paintingGuides.map(g =>
          g.id === contentId ? { ...g, views: g.views + 1 } : g
        )
      });
    } else if (contentType === 'report') {
      set({
        battleReports: get().battleReports.map(r =>
          r.id === contentId ? { ...r, views: r.views + 1 } : r
        )
      });
    }
  },
}));
