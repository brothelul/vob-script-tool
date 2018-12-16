/**
 * Created by Administrator on 2018/12/14.
 */
/**
 * Created by Administrator on 2018/12/11.
 */
import axios from 'axios'
import {Notification} from 'element-ui'

// 添加请求拦截器
axios.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  config.url = 'http://localhost:8888' + config.url
  return config
}, function (error) {
  // 对请求错误做些什么
  Notification.error({
    title: '请求失败',
    duration: 0,
    message: error.message
  })
  return Promise.reject(error)
})

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
  // 对响应数据做点什么
  return response
}, function (error) {
  let message = error.response.data ? error.response.data.message : error.message
  // 对响应错误做点什么
  Notification.error({
    title: '请求失败',
    duration: 0,
    message: message
  })
  return Promise.reject(error)
})

axios.defaults.headers.post['Content-Type'] = 'application/json'

export default axios
