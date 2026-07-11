import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addGifticon,
  addGifticons,
  deleteGifticon,
  loadGifticons,
  replaceAllGifticons,
  saveAllGifticons,
  updateGifticon,
} from '../storage/gifticons';
import {
  cancelGifticonNotifications,
  rescheduleAllNotifications,
  scheduleGifticonNotifications,
} from '../notifications/schedule';
import { Gifticon, GifticonFilter, GifticonInput } from '../types/gifticon';
import { isExpired, sortGifticons } from '../utils/dday';
import { applyGifticonLifecycle } from '../utils/gifticonLifecycle';
import { formatAmount } from '../utils/parseGifticonText';

export function useGifticons() {
  const [gifticons, setGifticons] = useState<Gifticon[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<GifticonFilter>('active');

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

  const filterCounts = useMemo(() => {
    let active = 0;
    let used = 0;
    let expired = 0;

    for (const item of gifticons) {
      if (item.isUsed) {
        used += 1;
      } else if (isExpired(item.expiresAt)) {
        expired += 1;
      } else {
        active += 1;
      }
    }

    return { active, used, expired };
  }, [gifticons]);

  const listGifticons = useMemo(() => {
    const byFilter = gifticons.filter((item) => {
      if (filter === 'used') return item.isUsed;
      if (filter === 'expired') return !item.isUsed && isExpired(item.expiresAt);
      return !item.isUsed && !isExpired(item.expiresAt);
    });

    const normalized = query.trim().toLowerCase();
    if (!normalized) return byFilter;

    return byFilter.filter((item) => {
      const amountText = formatAmount(item.amount) ?? '';
      const haystack = `${item.title} ${item.brand ?? ''} ${item.memo ?? ''} ${amountText}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [filter, gifticons, query]);

  const createGifticon = useCallback(async (input: GifticonInput) => {
    const created = await addGifticon(input);
    await scheduleGifticonNotifications(created);
    await refresh();
    return created;
  }, [refresh]);

  const createGifticons = useCallback(async (inputs: GifticonInput[]) => {
    const created = await addGifticons(inputs);
    for (const item of created) {
      await scheduleGifticonNotifications(item);
    }
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

  const replaceGifticons = useCallback(async (items: Gifticon[]) => {
    for (const item of gifticons) {
      await cancelGifticonNotifications(item.id);
    }

    const processed = applyGifticonLifecycle(items);
    await replaceAllGifticons(processed);
    await refresh();

    const nextActive = processed.filter((item) => !item.isUsed && !isExpired(item.expiresAt));
    await rescheduleAllNotifications(nextActive);
  }, [gifticons, refresh]);

  const mergeGifticons = useCallback(async (items: Gifticon[]) => {
    const existingIds = new Set(gifticons.map((item) => item.id));
    const merged = [...gifticons];

    for (const item of items) {
      if (existingIds.has(item.id)) {
        merged.push({
          ...item,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        });
      } else {
        merged.push(item);
      }
    }

    const processed = applyGifticonLifecycle(merged);
    await replaceAllGifticons(processed);
    await refresh();

    const nextActive = processed.filter((item) => !item.isUsed && !isExpired(item.expiresAt));
    await rescheduleAllNotifications(nextActive);
  }, [gifticons, refresh]);

  const syncNotifications = useCallback(async () => {
    await rescheduleAllNotifications(activeGifticons);
  }, [activeGifticons]);

  return {
    gifticons,
    activeGifticons,
    listGifticons,
    filterCounts,
    loading,
    query,
    setQuery,
    filter,
    setFilter,
    refresh,
    createGifticon,
    createGifticons,
    editGifticon,
    markAsUsed,
    removeGifticon,
    replaceGifticons,
    mergeGifticons,
    syncNotifications,
  };
}

export type GifticonContextValue = ReturnType<typeof useGifticons>;
