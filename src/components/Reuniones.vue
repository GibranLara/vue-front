<template>
  <v-app>
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
          <v-dialog v-model="dialog" max-width="500px">
              <v-btn
              slot="activator"
              color="primary"
              dark
              class="mb-2"
              :to="{name: 'Reunion'}"
              >
              Nueva Reunion
              </v-btn>
            <v-card>
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>
              <!-- Este es el dialogo de edición-->
              <v-card-text>
                <!-- Para poder validar debe de haber un form para hacer referencia -->
                <v-form v-model="valid" ref="form" lazy-validation>
                <v-container grid-list-md>
                  <v-layout wrap>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          v-model="editedItem.nombre"
                          :rules="reglasNombre"
                          name="nombre"
                          label="Nombre"
                          required>
                        </v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md6>
                        <v-text-field
                        v-model="editedItem.area"
                        :rules="reglasArea"
                        label="Área"
                        required>
                        </v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md6>
                        <v-text-field
                        v-model="editedItem.fecha"
                        :rules="reglasFecha"
                        label="Fecha"
                        required>
                        </v-text-field>
                      </v-flex>
                  </v-layout>
                </v-container>
                    </v-form>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" flat @click.native="close">Cancelar</v-btn>
                <v-btn color="blue darken-1" flat @click.native="save">Guardar</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
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
                Firmar
              </v-btn>
              <v-btn class="info" dark
              :to="{name: 'Reunion', params: {proyecto: proyecto, idReunion: props.item.id }}">
                Editar
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
        text: 'Objetivo',
        align: 'center',
        sortable: false,
        value: 'objetivo'
      },
      { text: 'Fecha', align: 'center', value: 'fecha' },
      { text: 'Acciones', align: 'center', value: 'reunion', sortable: false },
      { text: 'Descargar', align: 'center', value: 'reunion', sortable: false }
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
