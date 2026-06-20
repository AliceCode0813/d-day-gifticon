import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addGifticon,
  deleteGifticon,
  loadGifticons,
  saveAllGifticons,
  updateGifticon,
} from '../storage/gifticons';
import {
  cancelGifticonNotifications,
  rescheduleAllNotifications,
  scheduleGifticonNotifications,
} from '../notifications/schedule';
import { Gifticon, GifticonInput } from '../types/gifticon';
import { isExpired, sortGifticons } from '../utils/dday';
import { applyGifticonLifecycle } from '../utils/gifticonLifecycle';

export function useGifticons() {
  const [gifticons, setGifticons] = useState<Gifticon[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    const raw = await loadGifticons();
    const processed = applyGifticonLifecycle(raw);
    const purgedIds = raw
      .filter((item) => !processed.some((kept) => kept.id === item.id))
      .map((item) => item.id);

    for (const id of purgedIds) {
      await cancelGifticonNotifications(id);
    }

    const needsSave =
      processed.length !== raw.length ||
      processed.some((item) => {
        const original = raw.find((entry) => entry.id === item.id);
        return original?.closedAt !== item.closedAt;
      });

    if (needsSave) {
      await saveAllGifticons(processed);
    }

    setGifticons(sortGifticons(processed));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const activeGifticons = useMemo(
    () => gifticons.filter((item) => !item.isUsed && !isExpired(item.expiresAt)),
    [gifticons],
  );

  const listGifticons = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return gifticons;

    return gifticons.filter((item) => {
      const haystack = `${item.title} ${item.memo ?? ''}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [gifticons, query]);

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
      if (!updated.isUsed && !isExpired(updated.expiresAt)) {
        await scheduleGifticonNotifications(updated);
      }
      await refresh();
      return updated;
    },
    [refresh],
  );

  const markAsUsed = useCallback(
    async (id: string) =>
      editGifticon(id, {
        isUsed: true,
        closedAt: new Date().toISOString(),
      }),
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
    activeGifticons,
    listGifticons,
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
