import { get, post, put, del } from '../utils/request'
import {
  Tracker,
  CreateTrackerRequest,
  UpdateTrackerRequest,
  TrackerListResponse
} from '../types/api'

/**
 * 获取追踪器列表
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 追踪器列表
 */
export const getTrackerList = async (
  page: number = 1,
  pageSize: number = 20
): Promise<TrackerListResponse> => {
  const response = await get<TrackerListResponse>('/tracker/list', {
    page,
    pageSize
  })
  return response.data
}

/**
 * 获取追踪器详情
 * @param id 追踪器ID
 * @returns 追踪器详情
 */
export const getTrackerDetail = async (id: string): Promise<Tracker> => {
  const response = await get<Tracker>(`/tracker/${id}`)
  return response.data
}

/**
 * 创建追踪器
 * @param data 创建请求数据
 * @returns 创建的追踪器
 */
export const createTracker = async (data: CreateTrackerRequest): Promise<Tracker> => {
  const response = await post<Tracker>('/tracker', data)
  return response.data
}

/**
 * 更新追踪器
 * @param data 更新请求数据
 * @returns 更新后的追踪器
 */
export const updateTracker = async (data: UpdateTrackerRequest): Promise<Tracker> => {
  const { id, ...updateData } = data
  const response = await put<Tracker>(`/tracker/${id}`, updateData)
  return response.data
}

/**
 * 删除追踪器
 * @param id 追踪器ID
 * @returns 删除结果
 */
export const deleteTracker = async (id: string): Promise<boolean> => {
  const response = await del<{ success: boolean }>(`/tracker/${id}`)
  return response.data.success
}

/**
 * 批量删除追踪器
 * @param ids 追踪器ID数组
 * @returns 删除结果
 */
export const batchDeleteTrackers = async (ids: string[]): Promise<boolean> => {
  const response = await post<{ success: boolean }>('/tracker/batch-delete', { ids })
  return response.data.success
}

/**
 * 启动追踪器
 * @param id 追踪器ID
 * @returns 更新后的追踪器
 */
export const startTracker = async (id: string): Promise<Tracker> => {
  const response = await post<Tracker>(`/tracker/${id}/start`)
  return response.data
}

/**
 * 停止追踪器
 * @param id 追踪器ID
 * @returns 更新后的追踪器
 */
export const stopTracker = async (id: string): Promise<Tracker> => {
  const response = await post<Tracker>(`/tracker/${id}/stop`)
  return response.data
}

/**
 * 批量启动追踪器
 * @param ids 追踪器ID数组
 * @returns 操作结果
 */
export const batchStartTrackers = async (ids: string[]): Promise<boolean> => {
  const response = await post<{ success: boolean }>('/tracker/batch-start', { ids })
  return response.data.success
}

/**
 * 批量停止追踪器
 * @param ids 追踪器ID数组
 * @returns 操作结果
 */
export const batchStopTrackers = async (ids: string[]): Promise<boolean> => {
  const response = await post<{ success: boolean }>('/tracker/batch-stop', { ids })
  return response.data.success
}

/**
 * 解析分享链接
 * @param url 分享链接
 * @returns 解析结果
 */
export const parseShareUrl = async (
  url: string
): Promise<{
  title: string
  platform: 'weibo' | 'xiaohongshu'
  valid: boolean
}> => {
  const response = await post<{
    title: string
    platform: 'weibo' | 'xiaohongshu'
    valid: boolean
  }>('/tracker/parse-url', { url })
  return response.data
}

/**
 * 检查追踪器状态
 * @param id 追踪器ID
 * @returns 状态信息
 */
export const checkTrackerStatus = async (
  id: string
): Promise<{
  status: 'active' | 'stopped'
  lastChecked: string
  nextCheck: string
}> => {
  const response = await get<{
    status: 'active' | 'stopped'
    lastChecked: string
    nextCheck: string
  }>(`/tracker/${id}/status`)
  return response.data
}
