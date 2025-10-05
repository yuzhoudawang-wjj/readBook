import { get, post } from '../utils/request'
import { User, CoinTransaction, PushLimit, AdReward } from '../types/api'

/**
 * 获取用户信息
 * @returns 用户信息
 */
export const getUserInfo = async (): Promise<User> => {
  const response = await get<User>('/user/info')
  return response.data
}

/**
 * 更新用户信息
 * @param data 更新数据
 * @returns 更新后的用户信息
 */
export const updateUserInfo = async (data: Partial<User>): Promise<User> => {
  const response = await post<User>('/user/update', data)
  return response.data
}

/**
 * 获取金币交易记录
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 交易记录列表
 */
export const getCoinTransactions = async (
  page: number = 1,
  pageSize: number = 20
): Promise<{
  list: CoinTransaction[]
  total: number
  page: number
  pageSize: number
}> => {
  const response = await get<{
    list: CoinTransaction[]
    total: number
    page: number
    pageSize: number
  }>('/user/coin-transactions', { page, pageSize })
  return response.data
}

/**
 * 获取推送限制信息
 * @returns 推送限制信息
 */
export const getPushLimit = async (): Promise<PushLimit> => {
  const response = await get<PushLimit>('/user/push-limit')
  return response.data
}

/**
 * 获取广告奖励信息
 * @returns 广告奖励信息
 */
export const getAdReward = async (): Promise<AdReward> => {
  const response = await get<AdReward>('/user/ad-reward')
  return response.data
}

/**
 * 观看广告获得奖励
 * @returns 奖励结果
 */
export const watchAdForReward = async (): Promise<{
  success: boolean
  coins: number
  nextAvailableTime: string
}> => {
  const response = await post<{
    success: boolean
    coins: number
    nextAvailableTime: string
  }>('/user/watch-ad')
  return response.data
}

/**
 * 消费金币
 * @param amount 消费数量
 * @param reason 消费原因
 * @returns 消费结果
 */
export const spendCoins = async (
  amount: number,
  reason: string
): Promise<{
  success: boolean
  remainingCoins: number
  transactionId: string
}> => {
  const response = await post<{
    success: boolean
    remainingCoins: number
    transactionId: string
  }>('/user/spend-coins', { amount, reason })
  return response.data
}

/**
 * 赚取金币
 * @param amount 赚取数量
 * @param reason 赚取原因
 * @returns 赚取结果
 */
export const earnCoins = async (
  amount: number,
  reason: string
): Promise<{
  success: boolean
  totalCoins: number
  transactionId: string
}> => {
  const response = await post<{
    success: boolean
    totalCoins: number
    transactionId: string
  }>('/user/earn-coins', { amount, reason })
  return response.data
}

/**
 * 用户登录
 * @param code 微信登录code
 * @returns 登录结果
 */
export const login = async (
  code: string
): Promise<{
  token: string
  userInfo: User
  isNewUser: boolean
}> => {
  const response = await post<{
    token: string
    userInfo: User
    isNewUser: boolean
  }>('/auth/login', { code })
  return response.data
}

/**
 * 用户登出
 * @returns 登出结果
 */
export const logout = async (): Promise<{ success: boolean }> => {
  const response = await post<{ success: boolean }>('/auth/logout')
  return response.data
}

/**
 * 检查用户订阅状态
 * @returns 订阅状态
 */
export const checkSubscriptionStatus = async (): Promise<{
  subscribed: boolean
  templateIds: string[]
}> => {
  const response = await get<{
    subscribed: boolean
    templateIds: string[]
  }>('/user/subscription-status')
  return response.data
}

/**
 * 申请订阅消息权限
 * @param templateIds 模板ID数组
 * @returns 申请结果
 */
export const requestSubscription = async (
  templateIds: string[]
): Promise<{
  success: boolean
  acceptedTemplates: string[]
  rejectedTemplates: string[]
}> => {
  const response = await post<{
    success: boolean
    acceptedTemplates: string[]
    rejectedTemplates: string[]
  }>('/user/request-subscription', { templateIds })
  return response.data
}
