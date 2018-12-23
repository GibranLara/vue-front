<template>
  <v-app>
    <v-container>
      <!-- Formulario para editar el encabezado de la reunión -->
<h2 class="text-sm-left mb-1">Reunión</h2>
  <v-container grid-list-md>
    <v-form ref="form_reunion">
      <v-layout row wrap>
        <v-flex md6>
         <v-text-field
            :value="reunion.objetivo"
            label="Objetivo"
            readonly
            ></v-text-field>
        </v-flex>
        <v-flex md6>
         <v-text-field
            :value="reunion.fecha"
            label="Fecha"
            readonly
            ></v-text-field>
        </v-flex>
      </v-layout>
      </v-form>
    </v-container>
        <!-- Encabezado de la datatable -->
        <v-toolbar flat color="white">
          <h2 class="text-sm-left mb-1">Participantes</h2>
              <v-dialog v-model="dialog" max-width="500px">
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
          :items="reunion.participantes"
          hide-actions
          class="elevation-1"
        >
          <template slot="items" slot-scope="props">
            <td class="text-xs-center">{{ props.item.nomina }}</td>
            <td class="text-xs-center">{{ props.item.nombre }}</td>
            <td class="text-xs-center">{{ props.item.rol }}</td>
            <td class="text-xs-center">{{ props.item.area }}</td>
            <td class="text-xs-center">{{ props.item.firma }}</td>
            <!-- <td class="justify-center layout px-0">
              <v-icon medium class="mr-2" @click="editItem(props.item)">
                edit
              </v-icon>
              <v-icon medium @click="deleteItem(props.item)">
                delete
              </v-icon>
            </td> -->
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
import ObjectID from 'bson-objectid'

export default {
  name: 'Reunion',
  data: () => ({
    search: '',
    dialog: false,
    valid: true,
    proyecto: '',
    reunion: {
      id: '',
      objetivo: '',
      fecha: '',
      participantes: []
    },
    objetivoRules: [
      v => !!v || 'El objetivo es requerido.'
    ],
    fechaReunionRules: [
      v => !!v || 'La fecha es requerida.'
    ],
    reglasNomina: [
      v => !!v || 'El número de nómina es requerido',
      v => /^-?\d*$/.test(v) || 'Solo ingrese números.'
    ],
    reglasNombre: [],
    reglasRol: [],
    reglasArea: [],
    loading: true,
    headers: [
      {
        text: 'No. Nómina',
        align: 'center',
        sortable: false,
        value: 'nomina'
      },
      {text: 'Nombre', align: 'center', value: 'nombre', sortable: false},
      { text: 'Rol/Puesto', align: 'center', value: 'fecha', sortable: false },
      { text: 'Área', align: 'center', value: 'rol', sortable: false },
      { text: 'Firma', align: 'center', value: 'area', sortable: false }
    ],
    totalParticipantes: 0,
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
      return this.editedIndex === -1 ? 'Nuevo Participante' : 'Editar Participante'
    }
  },
  watch: {
    dialog (val) {
      val || this.close()
    }
  },
  mounted () {
  },
  created () {
    // Recupero el objeto proyecto
    this.proyecto = this.$store.getters.proyecto
    // Guardo el objectid de la reunión que fue enviado desde el componente Reuniones
    let reunionIndex = this.$store.getters.idReunion
    // Si ya existe el objeto reunión, es decir, recibo un Id
    // Voy a igualar la variable local del componente con la de Vuex
    if (!(reunionIndex === '' || undefined)) {
      // En la propiedad reunión guardo una copia POR REFERENCIA
      // del objeto de la reunión trae la copia local del
      this.reunion = this.proyecto.reuniones.find(x => x.id === reunionIndex)
    }
  },

  methods: {
    initialize () {},

    editItem (item) {
      // Recupero el indice del participante a partir de un objeto participante
      this.editedIndex = this.reunion.participantes.indexOf(item)
      // Saco una copia de las propiedades del objeto item.
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem (item) {
      // Recupero el indice del participante que se está editando
      const index = this.reunion.participantes.indexOf(item)
      // Pregunto si se desea eliminar
      var respuesta = confirm('¿Está seguro de eliminar esta reunión?')
      // Si la respuesta es correcta, se elimina el elemento del array de participantes
      // Splice (indice, cantidad de elementos a borrar)
      if (respuesta) {
        this.reunion.participantes.splice(index, 1)
      }
    },

    close () {
      // Se oculta el dialog mostrado para editar como para crear
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },

    save () {
      // Si el formulario del encabezado de la reunión es válido
      if (this.$refs.form_reunion.validate()) {
        console.log(this.proyecto)
        // Determinar si es una nueva reunión
        if (this.reunion.id === '') {
          // Genero un ObjectId para la reunión
          this.reunion.id = ObjectID().toHexString()
          // Inserto la reunion en el arreglo de reuniones del proyecto
          this.proyecto.reuniones.push(this.reunion)
        }
        // Guardo nuevamente el proyecto en el ESTADO de Vuex
        this.$store.commit('guardarProyecto', this.proyecto)
        this.$store.commit('setIdReunion', '')
        // Entonces se guarda en server el 'proyecto' completo con todos los cambios,
        // es decir, proyecto, reuniones y participantes
        axios
          .put('http://localhost:8080/proyectos/', this.proyecto)
        this.$router.push('reuniones')
      }
    },
    guardarParticipante () {
      if (this.$refs.form.validate()) {
        if (this.editedIndex > -1) {
          // Se edita y remplaza el participante existente. (Original, Remplazo)
          Object.assign(this.reunion.participantes[this.editedIndex], this.editedItem)
        } else {
          // Se inserta el nuevo participante
          this.reunion.participantes.push(this.editedItem)
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
