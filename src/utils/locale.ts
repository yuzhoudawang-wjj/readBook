// 国际化工具函数
// 目前只返回原文本，后续可扩展为多语言支持

/**
 * 国际化文本处理函数
 * @param text 需要国际化的文本
 * @param params 可选的参数对象，用于文本插值
 * @returns 处理后的文本
 */
export const locale = (text: string, params?: Record<string, any>): string => {
  // 目前直接返回原文本
  // 后续可以根据当前语言设置返回对应的翻译文本

  if (!params) {
    return text
  }

  // 简单的文本插值处理
  let result = text
  Object.keys(params).forEach((key) => {
    const placeholder = `{${key}}`
    result = result.replace(new RegExp(placeholder, 'g'), params[key])
  })

  return result
}

/**
 * 获取当前语言设置
 * @returns 当前语言代码
 */
export const getCurrentLanguage = (): string => {
  // 从微信小程序获取系统语言
  const systemInfo = wx.getSystemInfoSync()
  return systemInfo.language || 'zh_CN'
}

/**
 * 设置当前语言
 * @param language 语言代码
 */
export const setCurrentLanguage = (language: string): void => {
  wx.setStorageSync('app_language', language)
}

/**
 * 格式化数字显示
 * @param num 数字
 * @returns 格式化后的字符串
 */
export const formatNumber = (num: number): string => {
  if (num < 1000) {
    return num.toString()
  } else if (num < 10000) {
    return `${(num / 1000).toFixed(1)}k`
  } else {
    return `${(num / 10000).toFixed(1)}w`
  }
}

/**
 * 格式化时间显示
 * @param timestamp 时间戳或时间字符串
 * @returns 格式化后的时间字符串
 */
export const formatTime = (timestamp: string | number): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) {
    return locale('刚刚')
  } else if (diff < hour) {
    const minutes = Math.floor(diff / minute)
    return locale('{minutes}分钟前', { minutes })
  } else if (diff < day) {
    const hours = Math.floor(diff / hour)
    return locale('{hours}小时前', { hours })
  } else if (diff < 7 * day) {
    const days = Math.floor(diff / day)
    return locale('{days}天前', { days })
  } else {
    return date.toLocaleDateString()
  }
}
