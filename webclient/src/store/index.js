import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const port = window.location.port
const baseUrl = `//${window.location.hostname}:${port}`
const getUrl = (url) => baseUrl + url

export default new Vuex.Store({
  state: {
    currentHelper: {}
  },
  mutations: {
    setCurrentHelper (state, helper) {
      state.currentHelper = helper
    }
  },
  actions: {
    showError (err) {
      console.log(err)
      Vue.$toast.error(err)
    },
    copyToClipboard (context, data) {
      Vue.prototype.$copyText(data).then(function () {
        Vue.$toast.success('Copied! 👍')
      }, function () {
        context.dispatch('showError', 'Can not copy 😔')
      })
    },
    getTemplate (context, url) {
      return new Promise((resolve, reject) => {
        fetch(getUrl(url)).then(response => {
          response.blob().then(blob => resolve(URL.createObjectURL(blob)))
        }).catch(err => {
          reject(err)
        })
      })
    },
    getJson (context, url) {
      return new Promise((resolve, reject) => {
        fetch(getUrl(url)).then(response => {
          response.json().then(json => resolve(json))
        }).catch(err => {
          reject(err)
        })
      })
    },
    getHelpers (context, url) {
      return new Promise((resolve, reject) => {
        fetch(getUrl(url)).then(response => {
          response.json().then(json => resolve(json))
        }).catch(err => {
          reject(err)
        })
      })
    }
  },
  modules: {
  }
})
