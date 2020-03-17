<template>
  <v-app id="inspire">

    <v-navigation-drawer v-model="drawer" app left clipped>
      <SidebarDrawer />
    </v-navigation-drawer>

    <v-app-bar app clipped-left clipped-right>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>Nodriza Helper Builder</v-toolbar-title>
      <v-spacer />
      <v-switch hide-details v-model="isDark" label="Dark Theme" class="mr-3"/>
      <v-btn text @click.stop="right = !right">
        <v-icon left>mdi-code-braces</v-icon> {{ right ? 'Close' : 'View' }} Source
      </v-btn>
    </v-app-bar>

    <v-content>
      <v-container class="fill-height" fluid>
        <TemplateViewer />
      </v-container>
    </v-content>

    <v-navigation-drawer v-model="right" width="500" app right clipped>
      <InformationDrawer @onClose="right = !right" />
    </v-navigation-drawer>

  </v-app>
</template>

<script>
  import { mapState } from 'vuex'
  export default {
    props: {
      source: String,
    },
    watch: {
      isDark (value) {
        window.localStorage.setItem('dark-teme', value)
        this.setTheme(value)
      }
    },
    computed: {
      ...mapState({
        currentHelperName: state => state?.currentHelper.name
      })
    },
    data: () => ({
      drawer: null,
      isDark: Boolean(eval(window.localStorage.getItem('dark-teme'))) ,
      drawerRight: null,
      right: true,
      left: false,
    }),
    methods: {
      setTheme (isDark) {
        this.$vuetify.theme.dark = isDark
        this.$vuetify.theme.ligth = !isDark
      }
    },
    mounted () {
      this.setTheme(this.isDark)
    }
  }
</script>

<style>
  .vjs-tree {
    font-family: Roboto,Monaco,Menlo,Consolas,Bitstream Vera Sans Mono,monospace !important;
  } 
  .vjs-value.vjs-value__string {
    width: 200px;
    white-space: nowrap;
    display: inline-block;
  }
</style>

