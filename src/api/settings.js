import axios from 'axios'

/**
 * 获取站点设置（公开接口，不需要认证）
 * 直接使用 axios 而不是 request，避免 401 时的自动跳转
 */
export const getSettings = () => {
  return axios({
    url: '/api/blog/settings',
    method: 'get'
  }).then(response => {
    // 适配后端返回格式
    if (response.data.code === 0) {
      return response.data
    }
    return { data: {} }
  }).catch(error => {
    // 静默处理错误
    console.warn('Settings API failed, using defaults:', error.message)
    return { data: {} }
  })
}
