import { post, get } from './fetch.js'

const api = {
  component: '/public/api/component',
  listComponent: '/public/api/components',
  codeDetail: '/codeDetail',
  getVerify: '/verify'
}

export default {
  actions: {
    addComponent: ({ state }, data) => {
      return post(api.component, data)
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
