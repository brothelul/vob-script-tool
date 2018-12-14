import { post, get } from './fetch.js'

const api = {
  add: '/add',
  listComponent: '/public/api/component',
  codeDetail: '/codeDetail',
  getVerify: '/verify'
}

export default {
  actions: {
    add: ({ state }, data) => {
      return post(api.add, data)
    },
    listComponent: ( ) => {
      return get(api.listComponent)
    },
    codeDetail: ({ state }, id) => {
      return get(api.codeDetail, { id })
    },
    getVerify: ( ) => {
      return get(api.getVerify)
    }
  }
}
