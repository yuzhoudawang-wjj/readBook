import { createStore } from 'zustand/vanilla'
import { persist, createJSONStorage } from 'zustand/middleware'
import Taro from '@tarojs/taro'
import { useSyncExternalStore } from 'use-sync-external-store/shim'
import { Tracker } from '../types/api'

export interface TrackerState {
  list: Tracker[]
  loading: boolean
  error: string | null
}

interface TrackerActions {
  setList: (list: Tracker[]) => void
  addTracker: (tracker: Tracker) => void
  updateTracker: (id: string, updates: Partial<Tracker>) => void
  removeTracker: (id: string) => void
  batchRemove: (ids: string[]) => void
  startTracker: (id: string) => void
  stopTracker: (id: string) => void
  batchStart: (ids: string[]) => void
  batchStop: (ids: string[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clear: () => void

  // selectors
  getActiveTrackers: () => Tracker[]
  getStoppedTrackers: () => Tracker[]
  getTrackerById: (id: string) => Tracker | undefined
  getTrackersByPlatform: (platform: 'weibo' | 'xiaohongshu') => Tracker[]
  getStats: () => { total: number; active: number; stopped: number }
}

export type TrackerStore = TrackerState & TrackerActions

const initialState: TrackerState = {
  list: [],
  loading: false,
  error: null
}

const taroJSONStorage = createJSONStorage<TrackerStore>(() => ({
  getItem: (name: string) => {
    const value = Taro.getStorageSync(name)
    return value ?? null
  },
  setItem: (name: string, value: string) => {
    Taro.setStorageSync(name, value)
  },
  removeItem: (name: string) => {
    Taro.removeStorageSync(name)
  }
}))

export const trackerStore = createStore<TrackerStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setList: (list) => set({ list, error: null }),
      addTracker: (tracker) => set((state) => ({ list: [...state.list, tracker], error: null })),
      updateTracker: (id, updates) =>
        set((state) => ({
          list: state.list.map((t) => (t.id === id ? { ...t, ...updates } : t)),
          error: null
        })),
      removeTracker: (id) =>
        set((state) => ({ list: state.list.filter((t) => t.id !== id), error: null })),
      batchRemove: (ids) =>
        set((state) => ({ list: state.list.filter((t) => !ids.includes(t.id)), error: null })),
      startTracker: (id) =>
        set((state) => ({
          list: state.list.map((t) =>
            t.id === id
              ? { ...t, status: 'active' as const, updatedAt: new Date().toISOString() }
              : t
          ),
          error: null
        })),
      stopTracker: (id) =>
        set((state) => ({
          list: state.list.map((t) =>
            t.id === id
              ? { ...t, status: 'stopped' as const, updatedAt: new Date().toISOString() }
              : t
          ),
          error: null
        })),
      batchStart: (ids) =>
        set((state) => ({
          list: state.list.map((t) =>
            ids.includes(t.id)
              ? { ...t, status: 'active' as const, updatedAt: new Date().toISOString() }
              : t
          ),
          error: null
        })),
      batchStop: (ids) =>
        set((state) => ({
          list: state.list.map((t) =>
            ids.includes(t.id)
              ? { ...t, status: 'stopped' as const, updatedAt: new Date().toISOString() }
              : t
          ),
          error: null
        })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clear: () => set({ ...initialState }),

      getActiveTrackers: () => get().list.filter((t) => t.status === 'active'),
      getStoppedTrackers: () => get().list.filter((t) => t.status === 'stopped'),
      getTrackerById: (id) => get().list.find((t) => t.id === id),
      getTrackersByPlatform: (platform) => get().list.filter((t) => t.platform === platform),
      getStats: () => ({
        total: get().list.length,
        active: get().getActiveTrackers().length,
        stopped: get().getStoppedTrackers().length
      })
    }),
    {
      name: 'tracker-store',
      storage: taroJSONStorage,
      partialize: (state) => ({ list: state.list })
    }
  )
)

export function useTrackerStore<TSelected>(
  selector: (state: TrackerStore) => TSelected
): TSelected {
  return useSyncExternalStore(
    trackerStore.subscribe,
    () => selector(trackerStore.getState()),
    () => selector(trackerStore.getState())
  )
}
