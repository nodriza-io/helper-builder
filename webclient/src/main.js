import Vue from 'vue'
import AppMain from './AppMain.vue'
import router from './router'
import store from './store'
import VueToast from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import VueClipboard from 'vue-clipboard2'
import io from 'socket.io-client'
import Emitter from 'emitter-js/dist/emitter'


import SidebarDrawer from '@/components/drawers/SidebarDrawer'
import InformationDrawer from '@/components/drawers/InformationDrawer'
import Explaniation from '@/components/explaniation/Explaniation'
import TemplateViewer from '@/components/templateViewer/TemplateViewer'
import JsonViewer from '@/components/templateViewer/JsonViewer'
import PageLoading from '@/components/loading/PageLoading'
import vuetify from './plugins/vuetify';

VueClipboard.config.autoSetContainer = true

Vue.config.productionTip = false
Vue.use(VueToast, { 
  position: 'top-right',
  queue: false,
})
Vue.use(VueClipboard)
Vue.component('JsonViewer', JsonViewer)
Vue.component('PageLoading', PageLoading)
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
    const socket = io(`http://localhost:${this.$store?.state?.port}`);
    Vue.prototype.$socketio = socket
    Vue.prototype.$socketio.on('connect', () => {})
    Vue.prototype.$socketio.on('reload', () => {
      this.$emitter.emit('reload')
    })
  }
}).$mount('#app')
