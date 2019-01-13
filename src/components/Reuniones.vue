<template>
  <v-app>
    <v-toolbar class="elevation-0">
      <v-btn icon to="/">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <v-toolbar-title> </v-toolbar-title>
    </v-toolbar>
    <v-container>
        <v-toolbar flat color="white">
        <v-text-field
            v-model="search"
            append-icon="search"
            label="Buscar"
            single-line
            hide-details
          ></v-text-field>

          <v-spacer></v-spacer>
          <v-dialog max-width="500px">
              <v-btn
              slot="activator"
              color="primary"
              dark
              class="mb-2"
              @click="nuevaReunion()"
              >
              Nueva Reunion
              </v-btn>
          </v-dialog>
        </v-toolbar>
        <v-data-table
          :headers="headers"
          :items="proyecto.reuniones"
          :search="search"
          hide-actions
          class="elevation-1"
        >
          <template slot="items" slot-scope="props">
            <td class="text-xs-center">{{ props.item.objetivo }}</td>
            <td class="text-xs-center">{{ props.item.fecha }}</td>
            <td class="justify-center layout px-0">
              <v-btn class="info" dark @click="solicitarFirmas(props.item.id)">
                Firmar
              </v-btn>
              <v-btn class="info" dark @click="reunionSeleccionada(props.item)">
                Editar
              </v-btn>
              <v-icon medium @click="deleteItem(props.item)">
                delete
              </v-icon>
            </td>
            <td class="text-xs-center">
              <v-btn class="success" dark @click="descargarPdf()">
                Descargar
              </v-btn>
            </td>
          </template>
          <v-alert slot="no-results" :value="true" color="error" icon="warning">
            Su búsqueda para "{{ search }}" no entregó resultados.
          </v-alert>
        </v-data-table>
      </v-container>
    </v-app>
</template>

<script>
// Solo se debe de importar axios donde se necesite.
import axios from 'axios'

export default {
  name: 'Reuniones',
  data: () => ({
    search: '',
    valid: true,
    proyecto: '',
    loading: true,
    headers: [
      {
        text: 'Objetivo',
        align: 'center',
        sortable: false,
        value: 'objetivo'
      },
      { text: 'Fecha', align: 'center', value: 'fecha' },
      { text: 'Acciones', align: 'center', value: 'reunion', sortable: false },
      { text: 'Descargar', align: 'center', value: 'reunion', sortable: false }
    ],
    totalReuniones: 0
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'Nueva Reunión' : 'Editar Reunión'
    }
  },
  watch: {
  },
  mounted () {},
  created () {
    this.proyecto = this.$store.getters.proyecto
  },

  methods: {
    initialize () {},

    deleteItem (item) {
      const index = this.proyecto.reuniones.indexOf(item)
      var respuesta = confirm('¿Está seguro de eliminar esta reunión?')
      if (respuesta) {
        this.proyecto.reuniones.splice(index, 1)
        // Se actualiza el state de Vuex
        this.$store.commit('guardarProyecto', this.proyecto)
        // Se actualiza el proyecto principal en la base de datos
        axios
          .put('http://localhost:8080/proyectos/', this.proyecto)
      }
    },
    reunionSeleccionada (reunion) {
      this.$store.commit('setIdReunion', reunion.id)
      this.$router.push('reunion')
    },

    nuevaReunion () {
      this.$router.push('reunion')
    },

    descargarPdf () {
      axios({
        url: 'http://localhost:8080/ejemplopdf.pdf', // your url
        method: 'GET',
        responseType: 'blob'// important
      }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'ejemplopdf.pdf')// or any other extension
        document.body.appendChild(link)
        link.click()
      })
    },

    solicitarFirmas (idReunion) {
      this.$store.commit('setIdReunion', idReunion)
      this.$router.push('firmar')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
