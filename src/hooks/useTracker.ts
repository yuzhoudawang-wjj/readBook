import { useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { useTrackerContext } from '../contexts/TrackerContext'
import { useUserContext } from '../contexts/UserContext'
import {
  getTrackerList,
  createTracker,
  updateTracker,
  deleteTracker,
  batchDeleteTrackers,
  startTracker,
  stopTracker,
  batchStartTrackers,
  batchStopTrackers,
  parseShareUrl
} from '../services/trackerService'
import { CreateTrackerRequest, UpdateTrackerRequest } from '../types/api'
import { locale } from '../utils/locale'

export const useTracker = () => {
  const {
    state: { list, loading, error },
    setList,
    addTracker: addTrackerToStore,
    updateTracker: updateTrackerInStore,
    removeTracker: removeTrackerFromStore,
    batchRemove: batchRemoveFromStore,
    startTracker: startTrackerInStore,
    stopTracker: stopTrackerInStore,
    batchStart: batchStartInStore,
    batchStop: batchStopInStore,
    setLoading,
    setError,
    getStats
  } = useTrackerContext()

  const { spendCoins } = useUserContext()

  // 加载追踪器列表
  const loadTrackers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await getTrackerList()
      setList(data.list)
    } catch (err: any) {
      console.error('Load trackers error:', err)
      setError(err.message || locale('加载追踪器列表失败'))
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setList])

  // 创建追踪器
  const addTracker = useCallback(
    async (data: CreateTrackerRequest) => {
      try {
        setLoading(true)
        setError(null)

        // 检查金币余额
        const coinsCost = 10 // 假设创建追踪器需要10金币
        const canAfford = spendCoins(coinsCost, locale('创建追踪器'))

        if (!canAfford) {
          throw new Error(locale('金币余额不足'))
        }

        const tracker = await createTracker(data)
        addTrackerToStore(tracker)

        Taro.showToast({
          title: locale('追踪器创建成功'),
          icon: 'success'
        })

        return tracker
      } catch (err: any) {
        console.error('Add tracker error:', err)
        setError(err.message || locale('创建追踪器失败'))

        Taro.showToast({
          title: err.message || locale('创建追踪器失败'),
          icon: 'none'
        })

        throw err
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setError, addTrackerToStore, spendCoins]
  )

  // 更新追踪器
  const updateTrackerInfo = useCallback(
    async (data: UpdateTrackerRequest) => {
      try {
        setLoading(true)
        setError(null)

        const tracker = await updateTracker(data)
        updateTrackerInStore(data.id, tracker)

        Taro.showToast({
          title: locale('更新成功'),
          icon: 'success'
        })

        return tracker
      } catch (err: any) {
        console.error('Update tracker error:', err)
        setError(err.message || locale('更新追踪器失败'))

        Taro.showToast({
          title: err.message || locale('更新追踪器失败'),
          icon: 'none'
        })

        throw err
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setError, updateTrackerInStore]
  )

  // 删除追踪器
  const removeTracker = useCallback(
    async (id: string) => {
      try {
        setLoading(true)
        setError(null)

        await deleteTracker(id)
        removeTrackerFromStore(id)

        Taro.showToast({
          title: locale('删除成功'),
          icon: 'success'
        })
      } catch (err: any) {
        console.error('Remove tracker error:', err)
        setError(err.message || locale('删除追踪器失败'))

        Taro.showToast({
          title: err.message || locale('删除追踪器失败'),
          icon: 'none'
        })

        throw err
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setError, removeTrackerFromStore]
  )

  // 批量删除追踪器
  const batchRemove = useCallback(
    async (ids: string[]) => {
      try {
        setLoading(true)
        setError(null)

        await batchDeleteTrackers(ids)
        batchRemoveFromStore(ids)

        Taro.showToast({
          title: locale('批量删除成功'),
          icon: 'success'
        })
      } catch (err: any) {
        console.error('Batch remove trackers error:', err)
        setError(err.message || locale('批量删除失败'))

        Taro.showToast({
          title: err.message || locale('批量删除失败'),
          icon: 'none'
        })

        throw err
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setError, batchRemoveFromStore]
  )

  // 启动追踪器
  const startTracking = useCallback(
    async (id: string) => {
      try {
        setLoading(true)
        setError(null)

        await startTracker(id)
        startTrackerInStore(id)

        Taro.showToast({
          title: locale('追踪已启动'),
          icon: 'success'
        })
      } catch (err: any) {
        console.error('Start tracker error:', err)
        setError(err.message || locale('启动追踪失败'))

        Taro.showToast({
          title: err.message || locale('启动追踪失败'),
          icon: 'none'
        })

        throw err
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setError, startTrackerInStore]
  )

  // 停止追踪器
  const stopTracking = useCallback(
    async (id: string) => {
      try {
        setLoading(true)
        setError(null)

        await stopTracker(id)
        stopTrackerInStore(id)

        Taro.showToast({
          title: locale('追踪已停止'),
          icon: 'success'
        })
      } catch (err: any) {
        console.error('Stop tracker error:', err)
        setError(err.message || locale('停止追踪失败'))

        Taro.showToast({
          title: err.message || locale('停止追踪失败'),
          icon: 'none'
        })

        throw err
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setError, stopTrackerInStore]
  )

  // 批量启动追踪器
  const batchStart = useCallback(
    async (ids: string[]) => {
      try {
        setLoading(true)
        setError(null)

        await batchStartTrackers(ids)
        batchStartInStore(ids)

        Taro.showToast({
          title: locale('批量启动成功'),
          icon: 'success'
        })
      } catch (err: any) {
        console.error('Batch start trackers error:', err)
        setError(err.message || locale('批量启动失败'))

        Taro.showToast({
          title: err.message || locale('批量启动失败'),
          icon: 'none'
        })

        throw err
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setError, batchStartInStore]
  )

  // 批量停止追踪器
  const batchStop = useCallback(
    async (ids: string[]) => {
      try {
        setLoading(true)
        setError(null)

        await batchStopTrackers(ids)
        batchStopInStore(ids)

        Taro.showToast({
          title: locale('批量停止成功'),
          icon: 'success'
        })
      } catch (err: any) {
        console.error('Batch stop trackers error:', err)
        setError(err.message || locale('批量停止失败'))

        Taro.showToast({
          title: err.message || locale('批量停止失败'),
          icon: 'none'
        })

        throw err
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setError, batchStopInStore]
  )

  // 解析分享链接
  const parseUrl = useCallback(
    async (url: string) => {
      try {
        setLoading(true)
        setError(null)

        const result = await parseShareUrl(url)

        if (!result.valid) {
          throw new Error(locale('链接格式不正确或不支持该平台'))
        }

        return result
      } catch (err: any) {
        console.error('Parse URL error:', err)
        setError(err.message || locale('解析链接失败'))

        Taro.showToast({
          title: err.message || locale('解析链接失败'),
          icon: 'none'
        })

        throw err
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setError]
  )

  // 初始化时加载数据
  useEffect(() => {
    loadTrackers()
  }, []) // 只在组件挂载时执行一次

  return {
    // 数据
    list,
    loading,
    error,
    stats: getStats(),

    // 方法
    loadTrackers,
    addTracker,
    updateTracker: updateTrackerInfo,
    removeTracker,
    batchRemove,
    startTracking,
    stopTracking,
    batchStart,
    batchStop,
    parseUrl
  }
}
