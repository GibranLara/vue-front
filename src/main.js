// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
// import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader
import Vue from 'vue'
import App from './App'
import store from './store'
import router from './router'
import Vuetify from 'vuetify'
import 'material-design-icons-iconfont/dist/material-design-icons.css' // Forzozamente deben cargarse antes que el css main
import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify, {
  theme: {
    // 393e44, 1D2731, 1A2930
    primary: '#1D2731',
    secondary: '#339989',
    accent: '#197567',
    error: '#b71c1c',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107'
  }
})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>',
  mounted () {
    this.$router.replace('/')
  }
})
