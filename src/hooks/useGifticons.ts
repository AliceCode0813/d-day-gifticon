import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addGifticon,
  deleteGifticon,
  loadGifticons,
  updateGifticon,
} from '../storage/gifticons';
import {
  cancelGifticonNotifications,
  rescheduleAllNotifications,
  scheduleGifticonNotifications,
} from '../notifications/schedule';
import { Gifticon, GifticonInput } from '../types/gifticon';
import { sortGifticons } from '../utils/dday';

export function useGifticons() {
  const [gifticons, setGifticons] = useState<Gifticon[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    const items = await loadGifticons();
    setGifticons(sortGifticons(items));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const activeGifticons = useMemo(
    () => gifticons.filter((item) => !item.isUsed),
    [gifticons],
  );

  const usedGifticons = useMemo(
    () => gifticons.filter((item) => item.isUsed),
    [gifticons],
  );

  const filteredActive = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return activeGifticons;

    return activeGifticons.filter((item) => {
      const haystack = `${item.title} ${item.memo ?? ''}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [activeGifticons, query]);

  const createGifticon = useCallback(async (input: GifticonInput) => {
    const created = await addGifticon(input);
    await scheduleGifticonNotifications(created);
    await refresh();
    return created;
  }, [refresh]);

  const editGifticon = useCallback(
    async (id: string, updates: Partial<Omit<Gifticon, 'id' | 'createdAt'>>) => {
      const updated = await updateGifticon(id, updates);
      if (!updated) return null;

      await cancelGifticonNotifications(id);
      if (!updated.isUsed) {
        await scheduleGifticonNotifications(updated);
      }
      await refresh();
      return updated;
    },
    [refresh],
  );

  const markAsUsed = useCallback(
    async (id: string) => editGifticon(id, { isUsed: true }),
    [editGifticon],
  );

  const removeGifticon = useCallback(async (id: string) => {
    await cancelGifticonNotifications(id);
    await deleteGifticon(id);
    await refresh();
  }, [refresh]);

  const syncNotifications = useCallback(async () => {
    await rescheduleAllNotifications(activeGifticons);
  }, [activeGifticons]);

  return {
    gifticons,
    activeGifticons: filteredActive,
    usedGifticons,
    loading,
    query,
    setQuery,
    refresh,
    createGifticon,
    editGifticon,
    markAsUsed,
    removeGifticon,
    syncNotifications,
  };
}

export type GifticonContextValue = ReturnType<typeof useGifticons>;
