<template>
  <v-app>
    <v-container>
      <!-- Formulario para editar el encabezado de la reunión -->
<h2 class="text-sm-left mb-1">Detalle Reunión</h2>
  <v-container grid-list-md>
    <v-form ref="form_reunion">
      <v-layout row wrap>
        <v-flex md6>
         <v-text-field
            v-model="reunion.objetivo"
            :rules="objetivoRules"
            label="Objetivo"
            required
            ></v-text-field>
        </v-flex>
        <v-flex md6>
         <v-text-field
            v-model="reunion.fecha"
            :rules="fechaReunionRules"
            label="Fecha"
            required
            ></v-text-field>
        </v-flex>
        <v-btn color="primary" @click.native="save">Guardar</v-btn>
      </v-layout>
      </v-form>
    </v-container>
        <!-- Encabezado de la datatable -->
        <v-toolbar flat color="white">
          <h2 class="text-sm-left mb-1">Participantes</h2>
                <v-spacer></v-spacer>
              <v-dialog v-model="dialog" max-width="500px">
                <v-btn slot="activator" color="primary" dark class="mb-2">Nuevo participante</v-btn>
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
                          <v-flex xs12 sm12 md6>
                            <v-text-field
                              v-model="editedItem.nomina"
                              :rules="reglasNomina"
                              name="nombre"
                              label="No. Nómina"
                              required>
                            </v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md6>
                            <v-text-field
                            v-model="editedItem.nombre"
                            :rules="reglasNombre"
                            label="Nombre"
                            required>
                            </v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md6>
                            <v-text-field
                            v-model="editedItem.rol"
                            :rules="reglasRol"
                            label="Rol"
                            required>
                            </v-text-field>
                          </v-flex>
                          <v-flex xs12 sm12 md6>
                            <v-text-field
                            v-model="editedItem.area"
                            :rules="reglasArea"
                            label="Área/Departamento"
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
                    <v-btn color="blue darken-1" flat @click.native="guardarParticipante">Guardar</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-toolbar>
        <v-data-table
          :headers="headers"
          :items="participantes"
          :search="search"
          hide-actions
          class="elevation-1"
        >
          <template slot="items" slot-scope="props">
            <td class="text-xs-center">{{ props.item.nomina }}</td>
            <td class="text-xs-center">{{ props.item.nombre }}</td>
            <td class="text-xs-center">{{ props.item.rol }}</td>
            <td class="text-xs-center">{{ props.item.area }}</td>
            <td class="text-xs-center">{{ props.item.firma }}</td>
            <td class="justify-center layout px-0">
              <v-icon medium class="mr-2" @click="editItem(props.item)">
                edit
              </v-icon>
              <v-icon medium @click="deleteItem(props.item)">
                delete
              </v-icon>
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
  name: 'Reunion',
  data: () => ({
    search: '',
    dialog: false,
    valid: true,
    proyecto: '',
    reunion: '',
    objetivoRules: [
      v => !!v || 'El objetivo es requerido.'
    ],
    fechaReunionRules: [
      v => !!v || 'La fecha es requerida.'
    ],
    loading: true,
    headers: [
      {
        text: 'No. Nómina',
        align: 'center',
        sortable: false,
        value: 'nomina'
      },
      { text: 'Nombre', align: 'center', value: 'nombre' },
      { text: 'Rol/Puesto', align: 'center', value: 'fecha' },
      { text: 'Área', align: 'center', value: 'rol', sortable: false },
      { text: 'Firma', align: 'center', value: 'area', sortable: false },
      { text: 'Acciones', align: 'center', value: 'firma', sortable: false }
    ],
    totalParticipantes: 0,
    participantes: [],
    editedIndex: -1,
    editedItem: {
      nomina: '',
      nombre: '',
      rol: '',
      area: ''
    },
    defaultItem: {
      nomina: '',
      nombre: '',
      rol: '',
      area: ''
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
    // Guardo el objectid de la reunión que fue enviado desde el componente Reuniones
    let reunionIndex = this.$route.params.idReunion
    // En la propiedad reunión guardo una copia del objeto de la reunión correspondiente
    this.reunion = Object.assign({}, this.proyecto.reuniones.find(x => x.id === reunionIndex))
    // En la propiedad participantes hago una copia del arreglo de participantes
    // del objeto original a uno del componente.
    this.participantes = this.reunion.participantes
  },
  created () {
    // Recibo el proyecto que es enviado desde componente Reuniones
    this.proyecto = this.$route.params.proyecto
  },

  methods: {
    initialize () {},

    editItem (item) {
      this.editedIndex = this.participantes.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem (item) {
      const index = this.participantes.indexOf(item)
      var respuesta = confirm('¿Está seguro de eliminar esta reunión?')
      if (respuesta) {
        this.participantes.splice(index, 1)
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
      // Si el formulario del encabezado de la reunión es válido
      if (this.$refs.form_reunion.validate()) {
        // Entonces se guarda el proyecto completo con todos los cambios
        axios
          .put('http://localhost:8080/proyectos/', this.participantes[this.editedIndex])
      }
      this.close()
    },
    guardarParticipante () {
      if (this.$refs.form.validate()) {
        if (this.editedIndex > -1) {
          console.log('Es una edición')
          Object.assign(this.participantes[this.editedIndex], this.editedItem)
          // console.log(this.proyectos[this.editedIndex])
        } else {
          console.log('Es un nueva reunión.')
          this.participantes.push(this.editedItem)
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
