<template>
  <v-app>
  <confirm ref="confirm"></confirm>
  <v-container>
    <!-- <h5>{{ this.$store.getters.proyecto }}</h5> -->
    <v-toolbar flat color="white">
     <v-text-field
        v-model="search"
        append-icon="search"
        label="Buscar"
        single-line
        hide-details
      ></v-text-field>

      <v-spacer></v-spacer>
      <v-dialog v-model="dialog" max-width="500px" @keydown.esc="dialog=false">
        <v-btn slot="activator" color="primary" dark class="mb-2">Nuevo Proyecto</v-btn>
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
      :items="proyectos"
      :search="search"
      hide-actions
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td class="text-xs-center">{{ props.item.nombre }}</td>
        <td class="text-xs-center">{{ props.item.area }}</td>
        <td class="text-xs-center">{{ props.item.fecha }}</td>
        <td class="text-xs-center">
          <v-btn class="info" dark @click="proyectoSeleccionado(props.item)">
            <v-icon dark>visibility</v-icon>
            <!-- {{ props.item.id }} -->
          </v-btn>
        </td>
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
      <template slot="no-data" :value="true" color="error" icon="warning">
        <!-- <v-btn color="primary" @click="initialize">Reiniciar</v-btn> -->
        Lo sentimos, no hay proyectos que mostrar.
      </template>
    </v-data-table>
  </v-container>
  </v-app>
</template>

<script>
// Solo se debe de importar axios donde se necesite.
import axios from 'axios'
import Confirm from '@/components/Confirm'

export default {
  name: 'Proyectos',
  components: {
    Confirm
  },
  data: () => ({
    search: '',
    dialog: false,
    valid: true,
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
        text: 'Proyecto',
        align: 'center',
        sortable: false,
        value: 'nombre'
      },
      { text: 'Área', align: 'center', value: 'area' },
      { text: 'Fecha', align: 'center', value: 'fecha' },
      { text: 'Reuniones', align: 'center', value: 'proyecto', sortable: false },
      { text: 'Acciones', align: 'center', value: 'proyecto', sortable: false }
    ],
    totalProyectos: 0,
    proyectos: [],
    editedIndex: -1,
    editedItem: {
      nombre: '',
      area: '',
      fecha: '',
      reuniones: []
    },
    defaultItem: {
      nombre: '',
      area: '',
      fecha: '',
      reuniones: []
    }
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'Nuevo Proyecto' : 'Editar Proyecto'
    }
  },
  watch: {
    dialog (val) {
      val || this.close()
      this.$refs.form.resetValidation()
    }
  },
  mounted () {},
  created () {
    axios
      .get('http://localhost:8080/proyectos/all')
      .then(datos => {
        // Aquí se recuperan los datos. En el objeto datos y la propiedad data es
        // donde viene el arreglo de objetos.
        this.proyectos = datos.data
      })
      .catch(e => {
        this.errors.push(e)
      })
  },
  methods: {
    initialize () {},

    editItem (item) {
      // Saco el índice del objeto 'item' el cual corresponde a un proyecto
      this.editedIndex = this.proyectos.indexOf(item)
      // Saco una copia de las propiedades del objeto item.
      this.editedItem = Object.assign({}, item)
      // Se activa el dialog, es como el 'show'
      this.dialog = true
    },

    deleteItem (item) {
      this.$refs.confirm.open(
        'Eliminar', '¿Está seguro?',
        {
          color: 'primary'
        })
        .then((confirm) => {
          const index = this.proyectos.indexOf(item)
          if (confirm) {
            this.proyectos.splice(index, 1)
            // Se manda la petición delete con el id del objeto
            axios
              .delete('http://localhost:8080/proyectos/proyecto/' + item.id)
          }
        })
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
          Object.assign(this.proyectos[this.editedIndex], this.editedItem)
          // console.log(this.proyectos[this.editedIndex])
          axios
            .put('http://localhost:8080/proyectos/', this.proyectos[this.editedIndex])
        } else {
          console.log('Es un nuevo proyecto.')
          // console.log(this.editedItem)
          axios
            .post('http://localhost:8080/proyectos/', this.editedItem)
            .then(proyecto => {
              this.proyectos.push(proyecto.data)
            })
            .catch(e => {
              this.errors.push(e)
            })
        }
        this.close()
      }
    },

    proyectoSeleccionado (proyecto) {
      this.$store.commit('guardarProyecto', proyecto)
      // Mando llamar la ruta 'reuniones', misma que cargar el controlador reuniones
      this.$router.push('reuniones')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.bred{
  border: 1px solid red;
}
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

.swal-title{
    font-family: 'Lato', 'Helvetica Neue', Helvetica, sans-serif !important;
}
</style>
