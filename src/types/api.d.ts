// 全局API类型定义

// 追踪器相关类型
export interface Tracker {
  id: string
  title: string
  url: string
  platform: 'weibo' | 'xiaohongshu'
  status: 'active' | 'stopped'
  frequency: number // 追踪频率（分钟）
  createdAt: string
  updatedAt: string
  lastChecked?: string
  coinsCost: number // 消耗的金币数量
}

// 用户相关类型
export interface User {
  id: string
  nickname: string
  avatar?: string
  coins: number // 金币余额
  totalTrackers: number // 总追踪数量
  activeTrackers: number // 活跃追踪数量
}

// API响应基础类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
}

// 追踪器创建请求
export interface CreateTrackerRequest {
  url: string
  frequency?: number
}

// 追踪器更新请求
export interface UpdateTrackerRequest {
  id: string
  frequency?: number
  status?: 'active' | 'stopped'
}

// 追踪器列表响应
export interface TrackerListResponse {
  list: Tracker[]
  total: number
  page: number
  pageSize: number
}

// 金币相关类型
export interface CoinTransaction {
  id: string
  type: 'earn' | 'spend'
  amount: number
  reason: string
  createdAt: string
}

// 推送限制类型
export interface PushLimit {
  dailyLimit: number
  currentCount: number
  resetTime: string
}

// 广告奖励类型
export interface AdReward {
  coins: number
  available: boolean
  nextAvailableTime?: string
}
