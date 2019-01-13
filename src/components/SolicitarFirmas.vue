<template>
  <v-app>
    <v-toolbar class="elevation-0">
      <v-btn icon @click="volver()">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <v-toolbar-title> </v-toolbar-title>
    </v-toolbar>
    <v-container>
      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
        <v-card-title>
          <span class="headline">{{ formTitle }}</span>
        </v-card-title>
          <v-container>
            <canvas id="signature-pad" class="signature-pad">
            </canvas>
          </v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="guardarFirma()">Guardar</v-btn>
          <v-btn @click="limpiarFirma()">Limpiar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Formulario para editar el encabezado de la reunión -->
    <v-container grid-list-md class="pa-0">
      <v-form ref="form_reunion">
        <v-layout row wrap>
          <v-flex md6>
            <v-text-field
                :value="reunion.objetivo"
                label="Objetivo"
                readonly
                >
            </v-text-field>
          </v-flex>
          <v-flex md6>
            <v-text-field
            :value="reunion.fecha"
            label="Fecha"
            readonly
            >
            </v-text-field>
          </v-flex>
        </v-layout>
      </v-form>
    </v-container>
        <!-- Encabezado de la datatable -->
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
            <td class="text-xs-center">
              <img :src="props.item.firma" v-bind:alt="props.item.firma" width=100 height="auto">
            </td>
            <td class="text-xs-center">
              <v-btn @click="activarDialog(props.item.nomina)" class="info" dark>
                Firmar
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
    </v-app>
</template>

<script>
// Solo se debe de importar axios donde se necesite.
import axios from 'axios'
import SignaturePad from 'signature_pad'

export default {
  name: 'Reunion',
  data: () => ({
    errors: '',
    search: '',
    signaturePad: '',
    canvas: '',
    dialog: false,
    valid: true,
    noNomina: '',
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
      { text: 'Preview', align: 'center', value: 'area', sortable: false },
      { text: '', align: 'center', value: 'area', sortable: false }
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
      return 'Ingrese su firma'
    }
  },
  watch: {
    dialog (val) {
      val || this.close()
    }
  },
  mounted () {
    this.canvas = document.querySelector('canvas')
    this.signaturePad = new SignaturePad(document.getElementById('signature-pad'), {
      backgroundColor: 'rgba(0, 0, 0, 0)',
      penColor: 'rgb(0, 0, 0)',
      minWidth: 0.5,
      maxWidth: 0.5
    })
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

    close () {
      // Se oculta el dialog mostrado para editar como para crear
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },

    activarDialog (noNomina) {
      this.dialog = true
      this.noNomina = noNomina
    },
    // Código escrito pero no implementado, falta investigación
    resizeCanvas () {
      var ratio = Math.max(window.devicePixelRatio || 1, 1)
      this.canvas.width = this.canvas.offsetWidth * ratio
      this.canvas.height = this.canvas.offsetHeight * ratio
      this.canvas.getContext('2d').scale(ratio, ratio)
      this.signaturePad.clear() // otherwise isEmpty() might return incorrect value
    },
    guardarFirma () {
      let IdProyecto = this.proyecto.id
      let IdReunion = this.reunion.id
      let NoNomina = this.noNomina
      let DataUri = this.signaturePad.toDataURL('image/png')

      // Se manda un objecto con los datos necesarios para hacer el guardado de
      // la firma.
      let firmaRequest = {
        IdProyecto: IdProyecto,
        IdReunion: IdReunion,
        NoNomina: NoNomina,
        DataUri: DataUri
      }

      // Mando el request para guardar la firma
      axios.put('http://localhost:8080/proyectos/participante/firma', firmaRequest)
        .then(proyecto => {
          this.proyecto = proyecto.data
          this.$store.commit('guardarProyecto', this.proyecto)
          this.dialog = false
          this.reunion = proyecto.data.reuniones.find(x => x.id === firmaRequest.IdReunion)
          this.limpiarFirma()
        })
        .catch(e => {
          this.errors.push(e)
        })
      console.log(this.proyecto)
    },
    limpiarFirma () {
      // Clears the canvas
      this.signaturePad.clear()
    },
    getImgUrl (pic) {
      return pic
    },
    volver () {
      this.$store.commit('setIdReunion', '')
      this.$router.push('reuniones')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.signature-pad {
  border: 1px solid red;
}
</style>
