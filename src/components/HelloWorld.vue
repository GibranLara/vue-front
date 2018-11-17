<template>
  <v-app>
    <!-- <v-container class="bred">
      <div class="hello">
        <h1>{{ msg }}</h1> -->
        <!-- <v-btn color="success">Success</v-btn> -->
      <!-- </div>
    </v-container> -->
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
        <v-btn slot="activator" color="primary" dark class="mb-2">Nuevo Proyecto</v-btn>
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
          </v-card-title>
          <!-- Este es el dialogo de edición-->
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 sm12 md12>
                  <v-text-field v-model="editedItem.nombre" required label="Nombre"></v-text-field>
                </v-flex>
                <v-flex xs12 sm12 md6>
                  <v-text-field v-model="editedItem.area" required label="Área"></v-text-field>
                </v-flex>
                <v-flex xs12 sm12 md6>
                  <v-text-field v-model="editedItem.fecha" required label="Fecha"></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
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
          <v-btn class="info">
            Ver
          </v-btn>
        </td>
        <td class="justify-center layout px-0">
          <v-icon
            small
            class="mr-2"
            @click="editItem(props.item)"
          >
            edit
          </v-icon>
          <v-icon
            small
            @click="deleteItem(props.item)"
          >
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
  </v-app>
</template>

<script>
// Solo se debe de importar axios donde se necesite.
import axios from 'axios'

export default {
  name: 'HelloWorld',
  data: () => ({
    search: '',
    dialog: false,
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
      area: 0,
      fecha: 0
    },
    defaultItem: {
      nombre: '',
      area: 0,
      fecha: 0
    }
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'Nueva Proyecto' : 'Editar Proyecto'
    }
  },
  watch: {
    dialog (val) {
      val || this.close()
    }
  },
  mounted () {
    axios
      .get('http://localhost:8080/proyectos/all')
      .then(datos => {
        console.log(datos.data)
        this.proyectos = datos.data
      })
      .catch(e => {
        this.errors.push(e)
      })
  },
  created () {},

  methods: {
    initialize () {},

    editItem (item) {
      this.editedIndex = this.proyectos.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem (item) {
      const index = this.proyectos.indexOf(item)
      confirm('¿Está seguro de eliminar esta reunión?') && this.proyectos.splice(index, 1)
    },

    close () {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },

    save () {
      if (this.editedIndex > -1) {
        Object.assign(this.proyectos[this.editedIndex], this.editedItem)
        console.log(Object.assign(this.proyectos[this.editedIndex], this.editedItem))
      } else {
        this.proyectos.push(this.editedItem)
        console.log(this.editedItem)
      }
      this.close()
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
</style>
