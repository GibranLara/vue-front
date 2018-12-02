import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    saludo: 'Hola Chaval'
  },
  mutations: {
    change (state, saludo) {
      state.saludo = saludo
    }
  },
  getters: {
    saludo: state => state.saludo
  }
})
