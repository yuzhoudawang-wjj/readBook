import Taro from '@tarojs/taro'
import { locale } from './locale'

// 页面路径常量
export const PAGES = {
  HOME: '/pages/home/index',
  TRACKER_LIST: '/pages/tracker-list/index',
  TRACKER_DETAIL: '/pages/tracker-detail/index'
} as const

/**
 * 导航到指定页面
 * @param url 页面路径
 * @param params 页面参数
 */
export const navigateTo = (url: string, params?: Record<string, any>) => {
  let fullUrl = url

  if (params) {
    const query = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join('&')
    fullUrl = `${url}?${query}`
  }

  Taro.navigateTo({
    url: fullUrl
  }).catch((error) => {
    console.error('Navigation error:', error)
    Taro.showToast({
      title: locale('页面跳转失败'),
      icon: 'none'
    })
  })
}

/**
 * 重定向到指定页面
 * @param url 页面路径
 * @param params 页面参数
 */
export const redirectTo = (url: string, params?: Record<string, any>) => {
  let fullUrl = url

  if (params) {
    const query = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join('&')
    fullUrl = `${url}?${query}`
  }

  Taro.redirectTo({
    url: fullUrl
  }).catch((error) => {
    console.error('Redirect error:', error)
    Taro.showToast({
      title: locale('页面跳转失败'),
      icon: 'none'
    })
  })
}

/**
 * 返回上一页
 * @param delta 返回的页面数，默认为1
 */
export const navigateBack = (delta: number = 1) => {
  Taro.navigateBack({
    delta
  }).catch((error) => {
    console.error('Navigate back error:', error)
    // 如果返回失败，尝试跳转到首页
    redirectTo(PAGES.HOME)
  })
}

/**
 * 切换到Tab页面
 * @param url Tab页面路径
 */
export const switchTab = (url: string) => {
  Taro.switchTab({
    url
  }).catch((error) => {
    console.error('Switch tab error:', error)
    Taro.showToast({
      title: locale('页面切换失败'),
      icon: 'none'
    })
  })
}

/**
 * 重新加载当前页面
 */
export const reLaunch = (url: string, params?: Record<string, any>) => {
  let fullUrl = url

  if (params) {
    const query = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join('&')
    fullUrl = `${url}?${query}`
  }

  Taro.reLaunch({
    url: fullUrl
  }).catch((error) => {
    console.error('ReLaunch error:', error)
    Taro.showToast({
      title: locale('页面重载失败'),
      icon: 'none'
    })
  })
}

/**
 * 获取当前页面参数
 * @returns 页面参数对象
 */
export const getCurrentPageParams = (): Record<string, any> => {
  const pages = Taro.getCurrentPages()
  const currentPage = pages[pages.length - 1]
  return currentPage?.options || {}
}

/**
 * 获取当前页面路径
 * @returns 当前页面路径
 */
export const getCurrentPagePath = (): string => {
  const pages = Taro.getCurrentPages()
  const currentPage = pages[pages.length - 1]
  return currentPage?.route || ''
}

/**
 * 检查是否可以返回上一页
 * @returns 是否可以返回
 */
export const canNavigateBack = (): boolean => {
  const pages = Taro.getCurrentPages()
  return pages.length > 1
}
