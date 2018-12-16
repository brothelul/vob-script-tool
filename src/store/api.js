import { post, get } from './fetch.js'

const api = {
  component: '/public/api/component',
  listComponent: '/public/api/components',
  listObjs: '/public/api/vobObjs',
  getVerify: '/verify'
}

export default {
  actions: {
    addComponent: ({state}, data) => {
      return post(api.component, data)
    },
    listComponent: ( ) => {
      return get(api.listComponent)
    },
    listObjs: () => {
      return get(api.listObjs)
    },
    getVerify: ( ) => {
      return get(api.getVerify)
    }
  }
}
