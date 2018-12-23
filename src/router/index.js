import Vue from 'vue'
import Router from 'vue-router'
import Proyectos from '@/components/Proyectos'
import Reuniones from '@/components/Reuniones'
import Reunion from '@/components/Reunion'
import SolicitarFirmas from '@/components/SolicitarFirmas'

Vue.use(Router)

export default new Router({
  mode: 'abstract',
  routes: [
    {
      path: '/',
      name: 'Proyectos',
      component: Proyectos
    },
    {
      path: '/reuniones',
      name: 'Reuniones',
      component: Reuniones,
      props: true
    },
    {
      path: '/reunion',
      name: 'Reunion',
      component: Reunion
    },
    {
      path: '/firmar',
      name: 'Firmar',
      component: SolicitarFirmas
    }
  ]
})
