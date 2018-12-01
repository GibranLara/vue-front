// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
// import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader
import Vue from 'vue'
import App from './App'
import router from './router'
import Vuetify from 'vuetify'
import 'material-design-icons-iconfont/dist/material-design-icons.css' // Forzozamente deben cargarse antes que el css main
import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify)
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
  mounted () {
    this.$router.replace('/')
  }
})
