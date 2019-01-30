<template>
  <v-app>
    <!-- Dialogo de descarga -->
    <v-dialog v-model="dialog_descarga" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline"> Descargar</span>
        </v-card-title>
        <v-layout row wrap>
          <v-flex xs12 sm12 md6>
            <p>Seleccione su formato de descarga:</p>
          </v-flex>
        </v-layout>
        <v-spacer></v-spacer>
        <v-layout row wrap pb-3>
            <v-flex xs12 sm12 md6>
              <v-btn large @click="descargarPase('png')" color="primary">
                <v-icon>image</v-icon> .PNG
              </v-btn>
            </v-flex>
            <v-flex xs12 sm12 md6>
              <v-btn large @click="descargarPase('pdf')" color="error">
                <v-icon>picture_as_pdf</v-icon> .PDF
              </v-btn>
            </v-flex>
        </v-layout>
      </v-card>
    </v-dialog>
    <!-- Barra de menú superior -->
    <v-toolbar class="elevation-0">
      <v-btn icon @click="volver()">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <v-toolbar-title> </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="dialog_descarga=true">
        <v-icon>save_alt</v-icon>
      </v-btn>
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
            <v-btn class="secondary" @click="limpiarFirma()">Limpiar</v-btn>
            <v-btn class="primary" @click="guardarFirma()">Guardar</v-btn>
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
            <v-btn @click="activarDialog(props.item.nomina)" class="accent" dark>
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

    <!--Div oculto para imprimir -->
    <v-container class="fluid page pt-0" id="pase-de-lista">
      <v-container grid-list-md class="pa-0 mt-3">
        <v-layout row wrap>
            <v-flex md12>
              <h3>HOJA DE REGISTRO</h3>
            </v-flex>
        </v-layout>
        <v-form ref="form_reunion">
          <v-layout row wrap>
            <v-flex md9>
              <v-text-field
                  :value="'Objetivo: '+reunion.objetivo"
                  readonly
                  >
              </v-text-field>
            </v-flex>
            <v-flex md3>
              <v-text-field
              :value="'Fecha: '+ reunion.fecha"
              readonly
              >
              </v-text-field>
            </v-flex>
          </v-layout>
        </v-form>
      </v-container>
      <!-- Encabezado de la datatable -->
      <v-data-table
        :headers="headers_print"
        :items="reunion.participantes"
        hide-actions
        class="elevation-1">
        <template slot="items" slot-scope="props">
          <td class="text-xs-center">{{ props.item.nomina }}</td>
          <td class="text-xs-center">{{ props.item.nombre }}</td>
          <td class="text-xs-center">{{ props.item.rol }}</td>
          <td class="text-xs-center">{{ props.item.area }}</td>
          <td class="text-xs-center">
            <img :src="props.item.firma" v-bind:alt="props.item.firma" width=100 height="auto">
          </td>
        </template>
        <v-alert slot="no-results" :value="true" color="error" icon="warning">
          Su búsqueda para "{{ search }}" no entregó resultados.
        </v-alert>
        <!-- <template slot="no-data">
          <v-btn color="primary" @click="initialize">Reiniciar</v-btn>
        </template> -->
      </v-data-table>

      <v-container class="pa-0 ma-0 grid-list-md" id="footer-pase-de-lista">
        <v-layout row wrap>
            <v-flex class="pa-0">
              <img src="../assets/150x100.png" alt="1" />
            </v-flex>
            <v-flex class="pa-0">
              <img src="../assets/150x100.png" alt="1" />
            </v-flex>
            <v-flex class="pa-0">
              <img src="../assets/150x100.png" alt="1" />
            </v-flex>
            <v-flex class="pa-0">
              <img src="../assets/150x100.png" alt="1" />
            </v-flex>
            <v-flex class="pa-0">
              <img src="../assets/150x100.png" alt="1" />
            </v-flex>
        </v-layout>
      </v-container>
    </v-container>
  </v-app>
</template>

<script>
// Solo se debe de importar axios donde se necesite.
import axios from 'axios'
import SignaturePad from 'signature_pad'
import html2canvas from 'html2canvas'
import * as JsPDF from 'jspdf'

export default {
  name: 'Reunion',
  data: () => ({
    errors: '',
    search: '',
    signaturePad: '',
    canvas: '',
    dialog: false,
    dialog_descarga: false,
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
      { text: 'Firma', align: 'center', value: 'area', sortable: false },
      { text: '', align: 'center', value: 'area', sortable: false }
    ],
    headers_print: [
      {
        text: 'No. Nómina',
        align: 'center',
        sortable: false,
        value: 'nomina',
        class: ['grey lighten-3', 'black--text']
      },
      {text: 'Nombre', align: 'center', value: 'nombre', sortable: false, class: ['grey lighten-3', 'black--text']},
      { text: 'Rol/Puesto', align: 'center', value: 'fecha', sortable: false, class: ['grey lighten-3', 'black--text'] },
      { text: 'Área', align: 'center', value: 'rol', sortable: false, class: ['grey lighten-3', 'black--text'] },
      { text: 'Firma', align: 'center', value: 'area', sortable: false, class: ['grey lighten-3', 'black--text'] }
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
      maxWidth: 1.5
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
    },
    descargarPase (opcion) {
      this.dialog_descarga = true

      if (opcion === 'png') {
        html2canvas(
          document.querySelector('#pase-de-lista'),
          {
          // El documento se clona debido a que si selecciona un div oculto,
          // este no permite crear la imagen
            onclone: function (clonedDoc) {
              clonedDoc.getElementById('pase-de-lista').style.display = 'block'
            }
          }).then(canvas => {
          var image = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
          var link = document.createElement('a')

          var fechaHoy = new Date()
          fechaHoy.setMinutes(fechaHoy.getMinutes() - fechaHoy.getTimezoneOffset())
          fechaHoy.toISOString().slice(0, 10)

          link.download = fechaHoy.toJSON().slice(0, 10).replace(/-/g, '.') + '.png'
          link.href = image
          link.click()
        })
      } else if (opcion === 'pdf') {
        html2canvas(
          document.querySelector('#pase-de-lista'),
          {
            onclone: function (clonedDoc) {
              clonedDoc.getElementById('pase-de-lista').style.display = 'block'
            }
          }).then(canvas => {
          var image = canvas.toDataURL('image/png')

          var pdf = new JsPDF({
            orientation: 'landscape'
          })

          var fechaHoy = new Date()
          fechaHoy.setMinutes(fechaHoy.getMinutes() - fechaHoy.getTimezoneOffset())
          fechaHoy.toISOString().slice(0, 10)

          let nombrePdf = fechaHoy.toJSON().slice(0, 10).replace(/-/g, '.') + '.pdf'
          pdf.addImage(image, 'PNG', 0, 0)
          pdf.save(nombrePdf)
        })
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.signature-pad {
  border: 1px solid #868686;
}

.theme--light.application {
    background: #ecebeb !important;
    color: rgba(0,0,0,.87);
}

#pase-de-lista {
  display: none;
}

.page {
    position: relative;
    padding-bottom: 100px;
    width: 29.7cm;
    min-height: 21.5cm;
    padding: 2cm;
    margin: 1cm auto;
    border: 1px #D3D3D3 solid;
    border-radius: 5px;
    background: white;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

#footer-pase-de-lista {
  position: absolute;
  bottom: 0;
  height: 100px;
  width: 86.5%;
}
</style>
