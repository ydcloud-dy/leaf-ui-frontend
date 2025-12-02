import request from './request'

// 用户登录
export function login(data) {
  return request({
    url: '/blog/auth/login',
    method: 'post',
    data
  })
}

// 用户注册
export function register(data) {
  return request({
    url: '/blog/auth/register',
    method: 'post',
    data
  })
}

// 获取当前用户信息
export function getUserInfo() {
  return request({
    url: '/blog/auth/me',
    method: 'get'
  })
}

// 更新用户信息
export function updateUserInfo(data) {
  return request({
    url: '/blog/auth/profile',
    method: 'put',
    data
  })
}

// 修改密码
export function changePassword(data) {
  return request({
    url: '/blog/auth/password',
    method: 'put',
    data
  })
}

// 获取用户统计信息
export function getUserStats() {
  return request({
    url: '/blog/user/stats',
    method: 'get'
  })
}
