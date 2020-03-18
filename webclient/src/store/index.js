import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const port = process.env.NODE_ENV === "development" ? 3000 : window.location.port
const baseUrl = `//${window.location.hostname}:${port}`
const getUrl = (url) => baseUrl + url

export default new Vuex.Store({
  state: {
    port,
    currentHelper: {}
  },
  mutations: {
    setCurrentHelper (state, helper) {
      state.currentHelper = helper
    },
    setLoading (state, value) {
      state.loading = value
    }
  },
  actions: {
    showError (err) {
      console.error('Nodriza Builder (ERROR)', err)
      Vue.prototype.$toast.error(err.toString())
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
    exportHelpers (context) {
      return new Promise((resolve, reject) => {
        context.commit('setLoading', true)
        fetch(getUrl('/helpers/export'), { method: 'POST' }).then(response => {
          response.json().then(json => {
            context.commit('setLoading', false)
            resolve(json)
          })
        }).catch(err => {
          context.commit('setLoading', false)
          reject(err)
        })
      })
    },
    getJson () {
      return new Promise((resolve, reject) => {
        fetch(getUrl('/doc/json')).then(response => {
          response.json().then(json => resolve(json))
        }).catch(err => {
          reject(err)
        })
      })
    },
    getHelpers () {
      return new Promise((resolve, reject) => {
        fetch(getUrl('/helpers')).then(response => {
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

