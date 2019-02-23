<template>
  <v-app>
  <confirm ref="confirm"></confirm>
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
          :pagination.sync="pagination"
          :total-items="totalReuniones"
          :rows-per-page-items="rowsPerPageItems"
          :loading="loading"
          :search="search"
          class="elevation-1"
        >
          <template slot="items" slot-scope="props">
            <td class="text-xs-center">{{ props.item.objetivo }}</td>
            <td class="text-xs-center">{{ props.item.fecha }}</td>
            <td class="justify-center layout px-0">
              <v-btn class="primary" dark @click="solicitarFirmas(props.item.id)">
                Firmar
              </v-btn>
              <v-btn class="primary" dark @click="reunionSeleccionada(props.item)">
                Editar
              </v-btn>
              <v-icon medium color="error" @click="deleteItem(props.item)">
                delete
              </v-icon>
            </td>
            <td class="text-xs-center">
              <v-btn class="accent" dark @click="descargaDirecta(props.item)">
                Descargar
              </v-btn>
            </td>
          </template>
          <v-alert slot="no-results" :value="true" color="error">
            Su búsqueda para "{{ search }}" no entregó resultados.
          </v-alert>
          <template slot="no-data" :value="true" color="error">
            Lo sentimos, no hay reuniones que mostrar.
          </template>
        </v-data-table>
      </v-container>

    <!-- Dialogo de descarga -->
    <v-dialog v-model="dialog_descarga" max-width="500px" @keydown.esc="dialog_descarga=false">
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
    <!--Div oculto para imprimir -->
    <div class="ocultar-pase page pt-0" id="pase-de-lista">
      <v-container grid-list-md class="pa-0 mt-3">
        <v-layout row wrap>
            <v-flex md12>
              <h3>HOJA DE REGISTRO</h3>
            </v-flex>
        </v-layout>
        <v-form ref="form_reunion">
          <v-layout row wrap class="px-5">
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
      <div class="px-5">
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
      </v-data-table>
      </div>
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
    </div>
  </v-app>
</template>

<script>
// Solo se debe de importar axios donde se necesite.
import axios from 'axios'
import Confirm from '@/components/Confirm'
import html2canvas from 'html2canvas'
import * as JsPDF from 'jspdf'

export default {
  name: 'Reuniones',
  components: {
    Confirm
  },
  data: () => ({
    search: '',
    valid: true,
    proyecto: '',
    loading: true,
    rowsPerPageItems: [5, 10, 20],
    dialog_descarga: false,
    totalReuniones: 0,
    pagination: {
    },
    reunion: {
      id: '',
      objetivo: '',
      fecha: '',
      participantes: []
    },
    headers: [
      { text: 'Objetivo', align: 'center', sortable: false, value: 'objetivo' },
      { text: 'Fecha', align: 'center', sortable: false, value: 'fecha' },
      { text: 'Acciones', align: 'center', value: 'reunion', sortable: false },
      { text: 'Descargar', align: 'center', value: 'reunion', sortable: false }
    ],
    headers_print: [
      {
        text: 'No. Nómina',
        align: 'center',
        sortable: false,
        value: 'nomina',
        class: ['grey lighten-3', 'black--text']
      },
      { text: 'Nombre', align: 'center', value: 'nombre', sortable: false, class: ['grey lighten-3', 'black--text'] },
      { text: 'Rol/Puesto', align: 'center', value: 'fecha', sortable: false, class: ['grey lighten-3', 'black--text'] },
      { text: 'Área', align: 'center', value: 'rol', sortable: false, class: ['grey lighten-3', 'black--text'] },
      { text: 'Firma', align: 'center', value: 'area', sortable: false, class: ['grey lighten-3', 'black--text'] }
    ]
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
    this.loading = false
  },

  methods: {
    initialize () {},

    deleteItem (item) {
      this.$refs.confirm.open(
        'Eliminar', '¿Está seguro?',
        {
          color: 'primary'
        })
        .then((confirm) => {
          const index = this.proyecto.reuniones.indexOf(item)
          if (confirm) {
            this.proyecto.reuniones.splice(index, 1)
            // Se actualiza el state de Vuex
            this.$store.commit('guardarProyecto', this.proyecto)
            // Se actualiza el proyecto principal en la base de datos
            axios
              .put(`${process.env.ROOT_API}proyectos/`, this.proyecto)
          }
        })
    },
    reunionSeleccionada (reunion) {
      this.$store.commit('setIdReunion', reunion.id)
      this.$router.push('reunion')
    },

    nuevaReunion () {
      this.$router.push('reunion')
    },

    descargaDirecta (reunion) {
      this.reunion = reunion
      this.dialog_descarga = true
    },

    solicitarFirmas (idReunion) {
      this.$store.commit('setIdReunion', idReunion)
      this.$router.push('firmar')
    },

    // Para imprimir el pase de lista
    // Código escrito pero no implementado, falta investigación
    resizeCanvas () {
      var ratio = Math.max(window.devicePixelRatio || 1, 1)
      this.canvas.width = this.canvas.offsetWidth * ratio
      this.canvas.height = this.canvas.offsetHeight * ratio
      this.canvas.getContext('2d').scale(ratio, ratio)
      this.signaturePad.clear() // otherwise isEmpty() might return incorrect value
    },
    getImgUrl (pic) {
      return pic
    },
    descargarPase (opcion) {
      if (opcion === 'png') {
        html2canvas(
          document.querySelector('#pase-de-lista'),
          {
            scale: 1.5,
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

.theme--light.application {
    background: #ecebeb !important;
    color: rgba(0,0,0,.87);
}

.ocultar-pase {
  display: none;
}

.page {
    position: relative;
    width: 29.7cm;
    min-height: 21.6cm;
    max-height: 21.6cm;
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
  width: 100%;
}
</style>
