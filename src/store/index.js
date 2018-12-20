import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    proyecto: 'hola desde vuex',
    idReunion: ''
  },
  mutations: {
    guardarProyecto (state, proyecto) {
      state.proyecto = proyecto
    },
    setIdReunion (state, id) {
      state.idReunion = id
    }
  },
  getters: {
    proyecto: state => state.proyecto,
    idReunion: state => state.idReunion
  }
})
