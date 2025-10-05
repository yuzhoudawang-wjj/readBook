import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { User, CoinTransaction, PushLimit, AdReward } from '../types/api'

// 状态接口
interface UserState {
  userInfo: User | null
  coinTransactions: CoinTransaction[]
  pushLimit: PushLimit | null
  adReward: AdReward | null
  loading: boolean
  error: string | null
}

// Action 类型
type UserAction =
  | { type: 'SET_USER_INFO'; payload: User }
  | { type: 'UPDATE_USER_INFO'; payload: Partial<User> }
  | { type: 'UPDATE_COINS'; payload: number }
  | { type: 'ADD_COIN_TRANSACTION'; payload: CoinTransaction }
  | { type: 'SET_PUSH_LIMIT'; payload: PushLimit }
  | { type: 'UPDATE_PUSH_COUNT'; payload: number }
  | { type: 'SET_AD_REWARD'; payload: AdReward }
  | { type: 'WATCH_AD_REWARD'; payload: { coins: number; nextAvailableTime: string } }
  | { type: 'SPEND_COINS'; payload: { amount: number; reason: string } }
  | { type: 'EARN_COINS'; payload: { amount: number; reason: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' }

// 初始状态
const initialState: UserState = {
  userInfo: null,
  coinTransactions: [],
  pushLimit: null,
  adReward: null,
  loading: false,
  error: null
}

// Reducer
const userReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case 'SET_USER_INFO':
      return { ...state, userInfo: action.payload, error: null }

    case 'UPDATE_USER_INFO':
      return {
        ...state,
        userInfo: state.userInfo ? { ...state.userInfo, ...action.payload } : null,
        error: null
      }

    case 'UPDATE_COINS':
      return {
        ...state,
        userInfo: state.userInfo
          ? { ...state.userInfo, coins: Math.max(0, state.userInfo.coins + action.payload) }
          : null,
        error: null
      }

    case 'ADD_COIN_TRANSACTION':
      return {
        ...state,
        coinTransactions: [action.payload, ...state.coinTransactions].slice(0, 100),
        error: null
      }

    case 'SET_PUSH_LIMIT':
      return { ...state, pushLimit: action.payload, error: null }

    case 'UPDATE_PUSH_COUNT':
      return {
        ...state,
        pushLimit: state.pushLimit ? { ...state.pushLimit, currentCount: action.payload } : null,
        error: null
      }

    case 'SET_AD_REWARD':
      return { ...state, adReward: action.payload, error: null }

    case 'WATCH_AD_REWARD':
      if (!state.adReward?.available || !state.userInfo) {
        return state
      }

      const transaction: CoinTransaction = {
        id: Date.now().toString(),
        type: 'earn',
        amount: action.payload.coins,
        reason: '观看广告奖励',
        createdAt: new Date().toISOString()
      }

      return {
        ...state,
        userInfo: { ...state.userInfo, coins: state.userInfo.coins + action.payload.coins },
        coinTransactions: [transaction, ...state.coinTransactions].slice(0, 100),
        adReward: {
          ...state.adReward,
          available: false,
          nextAvailableTime: action.payload.nextAvailableTime
        },
        error: null
      }

    case 'SPEND_COINS':
      if (!state.userInfo || state.userInfo.coins < action.payload.amount) {
        return state // 余额不足，不执行操作
      }

      const spendTransaction: CoinTransaction = {
        id: Date.now().toString(),
        type: 'spend',
        amount: action.payload.amount,
        reason: action.payload.reason,
        createdAt: new Date().toISOString()
      }

      return {
        ...state,
        userInfo: { ...state.userInfo, coins: state.userInfo.coins - action.payload.amount },
        coinTransactions: [spendTransaction, ...state.coinTransactions].slice(0, 100),
        error: null
      }

    case 'EARN_COINS':
      if (!state.userInfo) return state

      const earnTransaction: CoinTransaction = {
        id: Date.now().toString(),
        type: 'earn',
        amount: action.payload.amount,
        reason: action.payload.reason,
        createdAt: new Date().toISOString()
      }

      return {
        ...state,
        userInfo: { ...state.userInfo, coins: state.userInfo.coins + action.payload.amount },
        coinTransactions: [earnTransaction, ...state.coinTransactions].slice(0, 100),
        error: null
      }

    case 'SET_LOADING':
      return { ...state, loading: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload }

    case 'LOGOUT':
      return initialState

    default:
      return state
  }
}

// Context 接口
interface UserContextType {
  state: UserState
  dispatch: React.Dispatch<UserAction>

  // 便捷方法
  setUserInfo: (userInfo: User) => void
  updateUserInfo: (updates: Partial<User>) => void
  updateCoins: (amount: number) => void
  addCoinTransaction: (transaction: CoinTransaction) => void
  setPushLimit: (limit: PushLimit) => void
  updatePushCount: (count: number) => void
  setAdReward: (reward: AdReward) => void
  watchAdForReward: (coins: number, nextAvailableTime: string) => void
  spendCoins: (amount: number, reason: string) => boolean
  earnCoins: (amount: number, reason: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void

  // 选择器
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

// 创建 Context
const UserContext = createContext<UserContextType | undefined>(undefined)

// Provider 组件
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState)

  // 便捷方法
  const setUserInfo = (userInfo: User) => dispatch({ type: 'SET_USER_INFO', payload: userInfo })
  const updateUserInfo = (updates: Partial<User>) =>
    dispatch({ type: 'UPDATE_USER_INFO', payload: updates })
  const updateCoins = (amount: number) => dispatch({ type: 'UPDATE_COINS', payload: amount })
  const addCoinTransaction = (transaction: CoinTransaction) =>
    dispatch({ type: 'ADD_COIN_TRANSACTION', payload: transaction })
  const setPushLimit = (limit: PushLimit) => dispatch({ type: 'SET_PUSH_LIMIT', payload: limit })
  const updatePushCount = (count: number) => dispatch({ type: 'UPDATE_PUSH_COUNT', payload: count })
  const setAdReward = (reward: AdReward) => dispatch({ type: 'SET_AD_REWARD', payload: reward })
  const watchAdForReward = (coins: number, nextAvailableTime: string) =>
    dispatch({ type: 'WATCH_AD_REWARD', payload: { coins, nextAvailableTime } })

  const spendCoins = (amount: number, reason: string): boolean => {
    if (!state.userInfo || state.userInfo.coins < amount) {
      return false
    }
    dispatch({ type: 'SPEND_COINS', payload: { amount, reason } })
    return true
  }

  const earnCoins = (amount: number, reason: string) =>
    dispatch({ type: 'EARN_COINS', payload: { amount, reason } })
  const setLoading = (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading })
  const setError = (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error })
  const logout = () => dispatch({ type: 'LOGOUT' })

  // 选择器
  const getUserCoins = () => state.userInfo?.coins || 0
  const canAfford = (amount: number) => (state.userInfo?.coins || 0) >= amount
  const getRecentTransactions = (limit: number = 10) => state.coinTransactions.slice(0, limit)
  const canWatchAd = () => {
    if (!state.adReward) return false
    if (state.adReward.available) return true
    if (!state.adReward.nextAvailableTime) return false
    return new Date() >= new Date(state.adReward.nextAvailableTime)
  }
  const isLoggedIn = () => !!state.userInfo
  const getUserStats = () => {
    if (!state.userInfo) return null
    return {
      coins: state.userInfo.coins,
      totalTrackers: state.userInfo.totalTrackers,
      activeTrackers: state.userInfo.activeTrackers,
      canWatchAd: canWatchAd()
    }
  }

  const contextValue: UserContextType = {
    state,
    dispatch,
    setUserInfo,
    updateUserInfo,
    updateCoins,
    addCoinTransaction,
    setPushLimit,
    updatePushCount,
    setAdReward,
    watchAdForReward,
    spendCoins,
    earnCoins,
    setLoading,
    setError,
    logout,
    getUserCoins,
    canAfford,
    getRecentTransactions,
    canWatchAd,
    isLoggedIn,
    getUserStats
  }

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
}

// Hook
export const useUserContext = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider')
  }
  return context
}
