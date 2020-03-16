import Vue from 'vue'
import AppMain from './AppMain.vue'
import router from './router'
import store from './store'
import VueToast from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-default.css'
import VueClipboard from 'vue-clipboard2'
import io from 'socket.io-client'
import Emitter from 'emitter-js/dist/emitter'


import SidebarDrawer from '@/components/drawers/SidebarDrawer'
import InformationDrawer from '@/components/drawers/InformationDrawer'
import Explaniation from '@/components/explaniation/Explaniation'
import TemplateViewer from '@/components/templateViewer/TemplateViewer'
import JsonViewer from '@/components/templateViewer/JsonViewer'
import vuetify from './plugins/vuetify';

VueClipboard.config.autoSetContainer = true

Vue.config.productionTip = false
Vue.use(VueToast)
Vue.use(VueClipboard)
Vue.component('JsonViewer', JsonViewer)
Vue.component('Explaniation', Explaniation)
Vue.component('SidebarDrawer', SidebarDrawer)
Vue.component('TemplateViewer', TemplateViewer)
Vue.component('InformationDrawer', InformationDrawer)

Vue.prototype.$emitter = new Emitter();

new Vue({
  router,
  store,
  vuetify,
  render: h => h(AppMain),
  mounted () {
    const socket = io(`http://localhost:${window.location.port}`);
    socket.on('connect', () => {
      console.log('socket connect --->')
    })
    socket.on('reload', () => {
      console.log('socket reload --->')
      this.$emitter.emit('reload')
    })

  }
}).$mount('#app')
