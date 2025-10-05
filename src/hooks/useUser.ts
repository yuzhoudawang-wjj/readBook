import { useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { useUserContext } from '../contexts/UserContext'
import {
  getUserInfo,
  updateUserInfo,
  getCoinTransactions,
  getPushLimit,
  getAdReward,
  watchAdForReward,
  login,
  logout as logoutService,
  checkSubscriptionStatus,
  requestSubscription
} from '../services/userService'
import { User } from '../types/api'
import { locale } from '../utils/locale'

export const useUser = () => {
  const {
    state: { userInfo, coinTransactions, pushLimit, adReward, loading, error },
    setUserInfo,
    updateUserInfo: updateUserInfoInStore,
    addCoinTransaction,
    setPushLimit,
    setAdReward,
    spendCoins,
    earnCoins,
    setLoading,
    setError,
    logout: logoutFromStore,
    isLoggedIn,
    getUserStats
  } = useUserContext()

  // 登录
  const loginUser = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // 获取微信登录code
      const { code } = await Taro.login()

      // 调用登录接口
      const result = await login(code)

      // 保存token和用户信息
      Taro.setStorageSync('token', result.token)
      setUserInfo(result.userInfo)

      if (result.isNewUser) {
        Taro.showToast({
          title: locale('欢迎使用追影小程序'),
          icon: 'success'
        })
      } else {
        Taro.showToast({
          title: locale('登录成功'),
          icon: 'success'
        })
      }

      return result
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || locale('登录失败'))

      Taro.showToast({
        title: err.message || locale('登录失败'),
        icon: 'none'
      })

      throw err
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setUserInfo])

  // 登出
  const logoutUser = useCallback(async () => {
    try {
      setLoading(true)

      await logoutService()

      // 清除本地存储
      Taro.removeStorageSync('token')
      Taro.removeStorageSync('userInfo')

      // 清除store数据
      logoutFromStore()

      Taro.showToast({
        title: locale('已退出登录'),
        icon: 'success'
      })
    } catch (err: any) {
      console.error('Logout error:', err)
      // 即使接口失败也要清除本地数据
      Taro.removeStorageSync('token')
      Taro.removeStorageSync('userInfo')
      logoutFromStore()
    } finally {
      setLoading(false)
    }
  }, [setLoading, logoutFromStore])

  // 加载用户信息
  const loadUserInfo = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const userInfo = await getUserInfo()
      setUserInfo(userInfo)
    } catch (err: any) {
      console.error('Load user info error:', err)
      setError(err.message || locale('加载用户信息失败'))

      // 如果是401错误，可能是token过期，需要重新登录
      if (err.message?.includes('401') || err.message?.includes('登录')) {
        await loginUser()
      }
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setUserInfo, loginUser])

  // 更新用户信息
  const updateUser = useCallback(
    async (data: Partial<User>) => {
      try {
        setLoading(true)
        setError(null)

        const updatedUser = await updateUserInfo(data)
        setUserInfo(updatedUser)

        Taro.showToast({
          title: locale('更新成功'),
          icon: 'success'
        })

        return updatedUser
      } catch (err: any) {
        console.error('Update user info error:', err)
        setError(err.message || locale('更新用户信息失败'))

        Taro.showToast({
          title: err.message || locale('更新用户信息失败'),
          icon: 'none'
        })

        throw err
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setError, setUserInfo]
  )

  // 加载金币交易记录
  const loadCoinTransactions = useCallback(async () => {
    try {
      const data = await getCoinTransactions()
      data.list.forEach((transaction) => {
        addCoinTransaction(transaction)
      })
    } catch (err: any) {
      console.error('Load coin transactions error:', err)
      setError(err.message || locale('加载交易记录失败'))
    }
  }, [addCoinTransaction, setError])

  // 加载推送限制信息
  const loadPushLimit = useCallback(async () => {
    try {
      const limit = await getPushLimit()
      setPushLimit(limit)
    } catch (err: any) {
      console.error('Load push limit error:', err)
      setError(err.message || locale('加载推送限制信息失败'))
    }
  }, [setPushLimit, setError])

  // 加载广告奖励信息
  const loadAdReward = useCallback(async () => {
    try {
      const reward = await getAdReward()
      setAdReward(reward)
    } catch (err: any) {
      console.error('Load ad reward error:', err)
      setError(err.message || locale('加载广告奖励信息失败'))
    }
  }, [setAdReward, setError])

  // 观看广告获得奖励
  const watchAd = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // 调用微信广告API
      const adUnitId = 'your-ad-unit-id' // 替换为实际的广告位ID

      await new Promise((resolve, reject) => {
        const rewardedVideoAd = Taro.createRewardedVideoAd({
          adUnitId
        })

        rewardedVideoAd.onLoad(() => {
          console.log('广告加载成功')
        })

        rewardedVideoAd.onError((err) => {
          console.error('广告加载失败:', err)
          reject(new Error(locale('广告加载失败')))
        })

        rewardedVideoAd.onClose((res) => {
          if (res && res.isEnded) {
            resolve(res)
          } else {
            reject(new Error(locale('请观看完整广告')))
          }
        })

        rewardedVideoAd.show().catch((err) => {
          console.error('广告显示失败:', err)
          reject(new Error(locale('广告显示失败')))
        })
      })

      // 调用后端接口获得奖励
      const result = await watchAdForReward()

      if (result.success) {
        earnCoins(result.coins, locale('观看广告奖励'))
        setAdReward({
          coins: result.coins,
          available: false,
          nextAvailableTime: result.nextAvailableTime
        })

        Taro.showToast({
          title: locale('获得{coins}金币', { coins: result.coins }),
          icon: 'success'
        })
      }

      return result
    } catch (err: any) {
      console.error('Watch ad error:', err)
      setError(err.message || locale('观看广告失败'))

      Taro.showToast({
        title: err.message || locale('观看广告失败'),
        icon: 'none'
      })

      throw err
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, earnCoins, setAdReward])

  // 检查订阅状态
  const checkSubscription = useCallback(async () => {
    try {
      const status = await checkSubscriptionStatus()
      return status
    } catch (err: any) {
      console.error('Check subscription error:', err)
      setError(err.message || locale('检查订阅状态失败'))
      throw err
    }
  }, [setError])

  // 申请订阅权限
  const requestSubscriptionPermission = useCallback(
    async (templateIds: string[]) => {
      try {
        setLoading(true)
        setError(null)

        // 调用微信订阅消息API
        const result = await Taro.requestSubscribeMessage({
          tmplIds: templateIds
        })

        // 处理用户授权结果
        const acceptedTemplates: string[] = []
        const rejectedTemplates: string[] = []

        Object.keys(result).forEach((templateId) => {
          if (result[templateId] === 'accept') {
            acceptedTemplates.push(templateId)
          } else {
            rejectedTemplates.push(templateId)
          }
        })

        // 调用后端接口记录订阅状态
        await requestSubscription(templateIds)

        if (acceptedTemplates.length > 0) {
          Taro.showToast({
            title: locale('订阅成功'),
            icon: 'success'
          })
        } else {
          Taro.showToast({
            title: locale('需要订阅消息才能及时接收通知'),
            icon: 'none'
          })
        }

        return {
          success: acceptedTemplates.length > 0,
          acceptedTemplates,
          rejectedTemplates
        }
      } catch (err: any) {
        console.error('Request subscription error:', err)
        setError(err.message || locale('申请订阅权限失败'))

        Taro.showToast({
          title: err.message || locale('申请订阅权限失败'),
          icon: 'none'
        })

        throw err
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setError]
  )

  // 初始化时检查登录状态
  useEffect(() => {
    const token = Taro.getStorageSync('token')
    if (token && !userInfo) {
      loadUserInfo()
    }
  }, [userInfo]) // 只依赖 userInfo，避免 loadUserInfo 引起的循环

  return {
    // 数据
    userInfo,
    coinTransactions,
    pushLimit,
    adReward,
    loading,
    error,
    isLoggedIn: isLoggedIn(),
    stats: getUserStats(),

    // 方法
    loginUser,
    logoutUser,
    loadUserInfo,
    updateUser,
    loadCoinTransactions,
    loadPushLimit,
    loadAdReward,
    watchAd,
    checkSubscription,
    requestSubscriptionPermission,
    spendCoins,
    earnCoins
  }
}
