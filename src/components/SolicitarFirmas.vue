<template>
  <v-app>
    <v-container>
        <v-form v-model="reunion_encabezado">
            <v-text-field
            v-model="objetivo"
            :rules="objetivoRules"
            label="Objetivo"
            required
            ></v-text-field>
            <v-text-field
            v-model="Fecha"
            :rules="fechaRules"
            label="Fecha"
            required
            ></v-text-field>
        </v-form>
        <h2 class="text-sm-left mb-1">Participantes</h2>
        <v-data-table
          :headers="headers"
          :items="reuniones"
          :search="search"
          hide-actions
          class="elevation-1"
        >
          <template slot="items" slot-scope="props">
            <td class="text-xs-center">{{ props.item.objetivo }}</td>
            <td class="text-xs-center">{{ props.item.fecha }}</td>
            <td class="justify-center layout px-0">
              <v-btn class="info" dark>
                Editar
              </v-btn>
              <v-btn class="info" dark>
                Firmar
              </v-btn>
            </td>
            <td class="text-xs-center">
              <v-btn class="success" dark>
                Descargar
              </v-btn>
            </td>
          </template>
          <v-alert slot="no-results" :value="true" color="error" icon="warning">
            Su búsqueda para "{{ search }}" no entregó resultados.
          </v-alert>
          <!-- <template slot="no-data">
            <v-btn color="primary" @click="initialize">Reiniciar</v-btn>
          </template> -->
        </v-data-table>
      </v-container>
      <v-btn class="info" dark to="/">
      Volver
    </v-btn>
    </v-app>
</template>

<script>
// Solo se debe de importar axios donde se necesite.
import axios from 'axios'

export default {
  name: 'Reuniones',
  data: () => ({
    search: '',
    dialog: false,
    valid: true,
    proyecto: '',
    reglasNombre: [
      v => !!v || 'El nombre es requerido.'
    ],
    reglasArea: [
      v => !!v || 'El área es requerida.'
    ],
    reglasFecha: [
      v => !!v || 'La fecha es requerida.'
    ],
    loading: true,
    headers: [
      {
        text: 'No. Nómina',
        align: 'center',
        sortable: false,
        value: 'objetivo'
      },
      { text: 'Nombre', align: 'center', value: 'fecha' },
      { text: 'Rol/Puesto', align: 'center', value: 'fecha' },
      { text: 'Área', align: 'center', value: 'reunion', sortable: false },
      { text: 'Firma', align: 'center', value: 'reunion', sortable: false },
      { text: 'Acción Firmar', align: 'center', value: 'reunion', sortable: false }
    ],
    totalReuniones: 0,
    reuniones: [],
    editedIndex: -1,
    editedItem: {
      nombre: '',
      area: '',
      fecha: ''
    },
    defaultItem: {
      nombre: '',
      area: '',
      fecha: ''
    }
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'Nueva Reunión' : 'Editar Reunión'
    }
  },
  watch: {
    dialog (val) {
      val || this.close()
    }
  },
  mounted () {
    this.reuniones = this.proyecto.reuniones
  },
  created () {
    this.proyecto = this.$route.params.proyecto
  },

  methods: {
    initialize () {},

    editItem (item) {
      this.editedIndex = this.reuniones.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem (item) {
      const index = this.reuniones.indexOf(item)
      var respuesta = confirm('¿Está seguro de eliminar esta reunión?')
      if (respuesta) {
        this.reuniones.splice(index, 1)
        // Se manda la petición delete con el id del objeto
        axios
          .delete('http://localhost:8080/proyectos/proyecto/' + item.id)
      }
    },

    close () {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },

    save () {
      if (this.$refs.form.validate()) {
        if (this.editedIndex > -1) {
          console.log('Es una edición')
          Object.assign(this.reuniones[this.editedIndex], this.editedItem)
          // console.log(this.proyectos[this.editedIndex])
          axios
            .put('http://localhost:8080/proyectos/', this.reuniones[this.editedIndex])
        } else {
          console.log('Es un nueva reunión.')
          // console.log(this.editedItem)
          axios
            .post('http://localhost:8080/proyectos/', this.editedItem)
            .then(reunion => {
              this.reuniones.push(reunion.data)
            })
            .catch(e => {
              this.errors.push(e)
            })
        }
        this.close()
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
