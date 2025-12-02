import request from './request'

// 获取标签列表
export function getTags(params) {
  return request({
    url: '/blog/tags',
    method: 'get',
    params
  })
}
