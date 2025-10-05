import Taro from '@tarojs/taro'
import { ApiResponse } from '../types/api'

// 请求基础配置
const BASE_URL =
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : 'https://api.zhuiying.com'

// 模拟数据（开发环境使用）
const mockData = {
  '/tracker/list': {
    success: true,
    data: {
      list: [],
      total: 0,
      page: 1,
      pageSize: 20
    },
    message: 'Success'
  },
  '/user/info': {
    success: true,
    data: {
      id: 'mock-user-id',
      nickname: '测试用户',
      avatar: '',
      coins: 100,
      totalTrackers: 0,
      activeTrackers: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    message: 'Success'
  }
}

// 处理请求响应
const handleResponse = async (url: string, error?: any): Promise<any> => {
  // 开发环境直接返回模拟数据，不依赖真实网络请求
  console.log('Mock request for:', url)

  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 300))

  // 返回模拟数据
  const mockResponse = mockData[url as keyof typeof mockData]
  if (mockResponse) {
    console.log('Returning mock data for:', url, mockResponse)
    return mockResponse
  }

  // 默认成功响应
  const defaultResponse = {
    success: true,
    data: {},
    message: 'Mock Success'
  }

  console.log('Returning default mock data for:', url, defaultResponse)
  return defaultResponse
}

// 强制使用模拟数据的开关（开发阶段设为 true）
const USE_MOCK_DATA = true

// 封装请求方法
export const request = async <T = any>(options: Taro.request.Option): Promise<ApiResponse<T>> => {
  console.log('Request called with:', options.url, 'USE_MOCK_DATA:', USE_MOCK_DATA)

  // 如果启用模拟数据，直接返回模拟数据，完全跳过网络请求
  if (USE_MOCK_DATA) {
    console.log('Using mock data for:', options.url)
    return await handleResponse(options.url || '')
  }

  // 生产环境执行真实请求
  try {
    // 添加基础URL
    const fullUrl = options.url?.startsWith('http') ? options.url : `${BASE_URL}${options.url}`

    // 获取token
    const token = Taro.getStorageSync('token')

    // 设置请求头
    const header = {
      'Content-Type': 'application/json',
      ...options.header
    }

    if (token) {
      header.Authorization = `Bearer ${token}`
    }

    const response = await Taro.request({
      timeout: 10000,
      ...options,
      url: fullUrl,
      header
    })

    // 生产环境处理真实响应
    const { statusCode, data } = response
    if (statusCode !== 200) {
      throw new Error(`HTTP Error: ${statusCode}`)
    }

    return data
  } catch (error: any) {
    console.error('Request Error:', error)

    // 网络错误处理
    if (error.errMsg) {
      let message = '网络请求失败'
      if (error.errMsg.includes('timeout')) {
        message = '请求超时，请检查网络连接'
      } else if (error.errMsg.includes('fail')) {
        message = '网络连接失败，请检查网络设置'
      }

      Taro.showToast({
        title: message,
        icon: 'none'
      })
    }

    throw error
  }
}

// GET请求
export const get = async <T = any>(url: string, data?: any): Promise<ApiResponse<T>> => {
  return await request<T>({
    url,
    method: 'GET',
    data
  })
}

// POST请求
export const post = async <T = any>(url: string, data?: any): Promise<ApiResponse<T>> => {
  return await request<T>({
    url,
    method: 'POST',
    data
  })
}

// PUT请求
export const put = async <T = any>(url: string, data?: any): Promise<ApiResponse<T>> => {
  return await request<T>({
    url,
    method: 'PUT',
    data
  })
}

// DELETE请求
export const del = async <T = any>(url: string, data?: any): Promise<ApiResponse<T>> => {
  return await request<T>({
    url,
    method: 'DELETE',
    data
  })
}
