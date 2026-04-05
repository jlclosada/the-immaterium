/**
 * Centralized React Query hooks
 * Replaces scattered useEffect + useState patterns with:
 *  - Automatic caching (5 min stale, 30 min memory)
 *  - Background refetching
 *  - Optimistic updates for likes/comments
 *  - Shared cache across components (navigate back → instant)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

/* ── Query Keys ─────────────────────────────────────────────────────────── */
export const QK = {
  armies:       () => ['armies'],
  army:         (id) => ['armies', id],
  games:        () => ['games'],
  guides:       () => ['guides'],
  guide:        (id) => ['guides', id],
  battleReports:() => ['battleReports'],
  battleReport: (id) => ['battleReports', id],
  lore:         () => ['lore'],
  loreEntry:    (id) => ['lore', id],
  news:         () => ['news'],
  newsArticle:  (id) => ['news', id],
  listings:     (params) => ['listings', params || {}],
  listing:      (id) => ['listings', 'detail', id],
  comments:     (type, id) => ['comments', type, id],
  paints:       (search) => ['paints', search || ''],
  search:       (query) => ['search', query],
};

/* ── Armies ─────────────────────────────────────────────────────────────── */
export function useArmies() {
  return useQuery({
    queryKey: QK.armies(),
    queryFn: api.getArmies,
  });
}

export function useArmy(id) {
  return useQuery({
    queryKey: QK.army(id),
    queryFn: () => api.getArmy(id),
    enabled: !!id,
  });
}

export function useGames() {
  return useQuery({
    queryKey: QK.games(),
    queryFn: api.getGames,
    staleTime: 1000 * 60 * 60, // games rarely change — 1 hour
  });
}

/* ── Guides ─────────────────────────────────────────────────────────────── */
export function useGuides() {
  return useQuery({
    queryKey: QK.guides(),
    queryFn: api.getPaintingGuides,
  });
}

export function useGuide(id) {
  return useQuery({
    queryKey: QK.guide(id),
    queryFn: () => api.getGuide(id),
    enabled: !!id,
  });
}

/* ── Battle Reports ─────────────────────────────────────────────────────── */
export function useBattleReports() {
  return useQuery({
    queryKey: QK.battleReports(),
    queryFn: api.getBattleReports,
  });
}

export function useBattleReport(id) {
  return useQuery({
    queryKey: QK.battleReport(id),
    queryFn: () => api.getBattleReport(id),
    enabled: !!id,
  });
}

/* ── Lore ───────────────────────────────────────────────────────────────── */
export function useLoreEntries() {
  return useQuery({
    queryKey: QK.lore(),
    queryFn: api.getLoreEntries,
  });
}

export function useLoreEntry(id) {
  return useQuery({
    queryKey: QK.loreEntry(id),
    queryFn: () => api.getLoreEntry(id),
    enabled: !!id,
  });
}

/* ── News ───────────────────────────────────────────────────────────────── */
export function useNews() {
  return useQuery({
    queryKey: QK.news(),
    queryFn: api.getNewsArticles,
  });
}

export function useNewsArticle(id) {
  return useQuery({
    queryKey: QK.newsArticle(id),
    queryFn: () => api.getNewsArticle(id),
    enabled: !!id,
  });
}

/* ── Marketplace ────────────────────────────────────────────────────────── */
export function useListings(params) {
  return useQuery({
    queryKey: QK.listings(params),
    queryFn: () => api.getListings(params),
  });
}

export function useListing(id) {
  return useQuery({
    queryKey: QK.listing(id),
    queryFn: () => api.getListing(id),
    enabled: !!id,
  });
}

/* ── Paints ─────────────────────────────────────────────────────────────── */
export function usePaints(search) {
  return useQuery({
    queryKey: QK.paints(search),
    queryFn: () => api.getPaints(search),
    staleTime: 1000 * 60 * 60, // paint catalog rarely changes
  });
}

/* ── Comments ───────────────────────────────────────────────────────────── */
export function useComments(contentType, contentId) {
  return useQuery({
    queryKey: QK.comments(contentType, contentId),
    queryFn: () => api.getComments(contentType, contentId),
    enabled: !!contentType && !!contentId,
  });
}

export function useAddComment(contentType, contentId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentData) => api.addComment(contentType, contentId, commentData),
    onSuccess: (newComment) => {
      // Optimistic append to cache — no refetch needed
      queryClient.setQueryData(QK.comments(contentType, contentId), (old) =>
        old ? [...old, newComment] : [newComment]
      );
    },
  });
}

/* ── Like mutations (optimistic) ────────────────────────────────────────── */
export function useLikeGuide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }) => api.likeGuide(id, userId),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(QK.guide(id), (old) =>
        old ? { ...old, likes: data.likes } : old
      );
    },
  });
}

export function useLikeNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }) => api.likeNewsArticle(id, userId),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(QK.newsArticle(id), (old) =>
        old ? { ...old, likes: data.likes } : old
      );
    },
  });
}

/* ── Search ─────────────────────────────────────────────────────────────── */
export function useSearch(query) {
  return useQuery({
    queryKey: QK.search(query),
    queryFn: () => api.globalSearch(query),
    enabled: !!query && query.length >= 2,
    staleTime: 1000 * 30, // search results stale after 30s
  });
}
