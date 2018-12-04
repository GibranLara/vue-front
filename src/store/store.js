import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    proyecto: ''
  },
  mutations: {
    change (state, proyecto) {
      state.proyecto = proyecto
    }
  },
  getters: {
    proyecto: state => state.proyecto
  }
})
