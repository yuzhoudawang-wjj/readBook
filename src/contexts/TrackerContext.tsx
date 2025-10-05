import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { Tracker } from '../types/api'

// 状态接口
interface TrackerState {
  list: Tracker[]
  loading: boolean
  error: string | null
}

// Action 类型
type TrackerAction =
  | { type: 'SET_LIST'; payload: Tracker[] }
  | { type: 'ADD_TRACKER'; payload: Tracker }
  | { type: 'UPDATE_TRACKER'; payload: { id: string; updates: Partial<Tracker> } }
  | { type: 'REMOVE_TRACKER'; payload: string }
  | { type: 'BATCH_REMOVE'; payload: string[] }
  | { type: 'START_TRACKER'; payload: string }
  | { type: 'STOP_TRACKER'; payload: string }
  | { type: 'BATCH_START'; payload: string[] }
  | { type: 'BATCH_STOP'; payload: string[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR' }

// 初始状态
const initialState: TrackerState = {
  list: [],
  loading: false,
  error: null
}

// Reducer
const trackerReducer = (state: TrackerState, action: TrackerAction): TrackerState => {
  switch (action.type) {
    case 'SET_LIST':
      return { ...state, list: action.payload, error: null }

    case 'ADD_TRACKER':
      return {
        ...state,
        list: [...state.list, action.payload],
        error: null
      }

    case 'UPDATE_TRACKER':
      return {
        ...state,
        list: state.list.map((tracker) =>
          tracker.id === action.payload.id ? { ...tracker, ...action.payload.updates } : tracker
        ),
        error: null
      }

    case 'REMOVE_TRACKER':
      return {
        ...state,
        list: state.list.filter((tracker) => tracker.id !== action.payload),
        error: null
      }

    case 'BATCH_REMOVE':
      return {
        ...state,
        list: state.list.filter((tracker) => !action.payload.includes(tracker.id)),
        error: null
      }

    case 'START_TRACKER':
      return {
        ...state,
        list: state.list.map((tracker) =>
          tracker.id === action.payload
            ? { ...tracker, status: 'active' as const, updatedAt: new Date().toISOString() }
            : tracker
        ),
        error: null
      }

    case 'STOP_TRACKER':
      return {
        ...state,
        list: state.list.map((tracker) =>
          tracker.id === action.payload
            ? { ...tracker, status: 'stopped' as const, updatedAt: new Date().toISOString() }
            : tracker
        ),
        error: null
      }

    case 'BATCH_START':
      return {
        ...state,
        list: state.list.map((tracker) =>
          action.payload.includes(tracker.id)
            ? { ...tracker, status: 'active' as const, updatedAt: new Date().toISOString() }
            : tracker
        ),
        error: null
      }

    case 'BATCH_STOP':
      return {
        ...state,
        list: state.list.map((tracker) =>
          action.payload.includes(tracker.id)
            ? { ...tracker, status: 'stopped' as const, updatedAt: new Date().toISOString() }
            : tracker
        ),
        error: null
      }

    case 'SET_LOADING':
      return { ...state, loading: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload }

    case 'CLEAR':
      return initialState

    default:
      return state
  }
}

// Context 接口
interface TrackerContextType {
  state: TrackerState
  dispatch: React.Dispatch<TrackerAction>

  // 便捷方法
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

  // 选择器
  getActiveTrackers: () => Tracker[]
  getStoppedTrackers: () => Tracker[]
  getTrackerById: (id: string) => Tracker | undefined
  getTrackersByPlatform: (platform: 'weibo' | 'xiaohongshu') => Tracker[]
  getStats: () => { total: number; active: number; stopped: number }
}

// 创建 Context
const TrackerContext = createContext<TrackerContextType | undefined>(undefined)

// Provider 组件
export const TrackerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(trackerReducer, initialState)

  // 便捷方法
  const setList = (list: Tracker[]) => dispatch({ type: 'SET_LIST', payload: list })
  const addTracker = (tracker: Tracker) => dispatch({ type: 'ADD_TRACKER', payload: tracker })
  const updateTracker = (id: string, updates: Partial<Tracker>) =>
    dispatch({ type: 'UPDATE_TRACKER', payload: { id, updates } })
  const removeTracker = (id: string) => dispatch({ type: 'REMOVE_TRACKER', payload: id })
  const batchRemove = (ids: string[]) => dispatch({ type: 'BATCH_REMOVE', payload: ids })
  const startTracker = (id: string) => dispatch({ type: 'START_TRACKER', payload: id })
  const stopTracker = (id: string) => dispatch({ type: 'STOP_TRACKER', payload: id })
  const batchStart = (ids: string[]) => dispatch({ type: 'BATCH_START', payload: ids })
  const batchStop = (ids: string[]) => dispatch({ type: 'BATCH_STOP', payload: ids })
  const setLoading = (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading })
  const setError = (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error })
  const clear = () => dispatch({ type: 'CLEAR' })

  // 选择器
  const getActiveTrackers = () => state.list.filter((tracker) => tracker.status === 'active')
  const getStoppedTrackers = () => state.list.filter((tracker) => tracker.status === 'stopped')
  const getTrackerById = (id: string) => state.list.find((tracker) => tracker.id === id)
  const getTrackersByPlatform = (platform: 'weibo' | 'xiaohongshu') =>
    state.list.filter((tracker) => tracker.platform === platform)
  const getStats = () => ({
    total: state.list.length,
    active: getActiveTrackers().length,
    stopped: getStoppedTrackers().length
  })

  const contextValue: TrackerContextType = {
    state,
    dispatch,
    setList,
    addTracker,
    updateTracker,
    removeTracker,
    batchRemove,
    startTracker,
    stopTracker,
    batchStart,
    batchStop,
    setLoading,
    setError,
    clear,
    getActiveTrackers,
    getStoppedTrackers,
    getTrackerById,
    getTrackersByPlatform,
    getStats
  }

  return <TrackerContext.Provider value={contextValue}>{children}</TrackerContext.Provider>
}

// Hook
export const useTrackerContext = () => {
  const context = useContext(TrackerContext)
  if (context === undefined) {
    throw new Error('useTrackerContext must be used within a TrackerProvider')
  }
  return context
}
