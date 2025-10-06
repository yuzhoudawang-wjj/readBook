import { createStore } from 'zustand/vanilla'
import { persist, createJSONStorage } from 'zustand/middleware'
import Taro from '@tarojs/taro'
import { useSyncExternalStore } from 'use-sync-external-store/shim'
import { User, CoinTransaction, PushLimit, AdReward } from '../types/api'

export interface UserState {
  userInfo: User | null
  coinTransactions: CoinTransaction[]
  pushLimit: PushLimit | null
  adReward: AdReward | null
  loading: boolean
  error: string | null
}

interface UserActions {
  setUserInfo: (user: User) => void
  updateUserInfo: (updates: Partial<User>) => void
  updateCoins: (amount: number) => void
  addCoinTransaction: (tx: CoinTransaction) => void
  setPushLimit: (limit: PushLimit) => void
  updatePushCount: (count: number) => void
  setAdReward: (reward: AdReward) => void
  watchAdForReward: (coins: number, nextAvailableTime: string) => void
  spendCoins: (amount: number, reason: string) => boolean
  earnCoins: (amount: number, reason: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void

  // selectors (pure derived helpers)
  getUserCoins: () => number
  canAfford: (amount: number) => boolean
  getRecentTransactions: (limit?: number) => CoinTransaction[]
  canWatchAd: () => boolean
  isLoggedIn: () => boolean
  getUserStats: () => {
    coins: number
    totalTrackers: number
    activeTrackers: number
    canWatchAd: boolean
  } | null
}

export type UserStore = UserState & UserActions

const initialState: UserState = {
  userInfo: null,
  coinTransactions: [],
  pushLimit: null,
  adReward: null,
  loading: false,
  error: null
}

const taroJSONStorage = createJSONStorage<UserStore>(() => ({
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

export const userStore = createStore<UserStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUserInfo: (user) => set({ userInfo: user, error: null }),
      updateUserInfo: (updates) =>
        set((state) => ({
          userInfo: state.userInfo ? { ...state.userInfo, ...updates } : null,
          error: null
        })),
      updateCoins: (amount) =>
        set((state) => ({
          userInfo: state.userInfo
            ? { ...state.userInfo, coins: Math.max(0, state.userInfo.coins + amount) }
            : null,
          error: null
        })),
      addCoinTransaction: (tx) =>
        set((state) => ({
          coinTransactions: [tx, ...state.coinTransactions].slice(0, 100),
          error: null
        })),
      setPushLimit: (limit) => set({ pushLimit: limit, error: null }),
      updatePushCount: (count) =>
        set((state) => ({
          pushLimit: state.pushLimit ? { ...state.pushLimit, currentCount: count } : null,
          error: null
        })),
      setAdReward: (reward) => set({ adReward: reward, error: null }),
      watchAdForReward: (coins, nextAvailableTime) =>
        set((state) => {
          if (!state.adReward?.available || !state.userInfo) return state
          const transaction: CoinTransaction = {
            id: Date.now().toString(),
            type: 'earn',
            amount: coins,
            reason: '观看广告奖励',
            createdAt: new Date().toISOString()
          }
          return {
            ...state,
            userInfo: { ...state.userInfo, coins: state.userInfo.coins + coins },
            coinTransactions: [transaction, ...state.coinTransactions].slice(0, 100),
            adReward: {
              ...state.adReward,
              available: false,
              nextAvailableTime
            },
            error: null
          }
        }),
      spendCoins: (amount, reason) => {
        const state = get()
        if (!state.userInfo || state.userInfo.coins < amount) {
          return false
        }
        const transaction: CoinTransaction = {
          id: Date.now().toString(),
          type: 'spend',
          amount,
          reason,
          createdAt: new Date().toISOString()
        }
        set({
          userInfo: { ...state.userInfo, coins: state.userInfo.coins - amount },
          coinTransactions: [transaction, ...state.coinTransactions].slice(0, 100),
          error: null
        })
        return true
      },
      earnCoins: (amount, reason) =>
        set((state) => {
          if (!state.userInfo) return state
          const transaction: CoinTransaction = {
            id: Date.now().toString(),
            type: 'earn',
            amount,
            reason,
            createdAt: new Date().toISOString()
          }
          return {
            ...state,
            userInfo: { ...state.userInfo, coins: state.userInfo.coins + amount },
            coinTransactions: [transaction, ...state.coinTransactions].slice(0, 100),
            error: null
          }
        }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      logout: () => set({ ...initialState }),

      getUserCoins: () => get().userInfo?.coins || 0,
      canAfford: (amount) => (get().userInfo?.coins || 0) >= amount,
      getRecentTransactions: (limit: number = 10) => get().coinTransactions.slice(0, limit),
      canWatchAd: () => {
        const s = get()
        if (!s.adReward) return false
        if (s.adReward.available) return true
        if (!s.adReward.nextAvailableTime) return false
        return new Date() >= new Date(s.adReward.nextAvailableTime)
      },
      isLoggedIn: () => !!get().userInfo,
      getUserStats: () => {
        const s = get()
        if (!s.userInfo) return null
        return {
          coins: s.userInfo.coins,
          totalTrackers: s.userInfo.totalTrackers,
          activeTrackers: s.userInfo.activeTrackers,
          canWatchAd: s.canWatchAd()
        }
      }
    }),
    {
      name: 'user-store',
      storage: taroJSONStorage,
      partialize: (state) => ({
        userInfo: state.userInfo,
        coinTransactions: state.coinTransactions,
        pushLimit: state.pushLimit,
        adReward: state.adReward
      })
    }
  )
)

export function useUserStore<TSelected>(selector: (state: UserStore) => TSelected): TSelected {
  return useSyncExternalStore(
    userStore.subscribe,
    () => selector(userStore.getState()),
    () => selector(userStore.getState())
  )
}
