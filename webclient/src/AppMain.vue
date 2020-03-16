<template>
  <v-app id="inspire">

    <v-app-bar app clipped-right color="primary" dark>
      <v-toolbar-title>{{ currentHelperName }}</v-toolbar-title>
      <v-spacer />
      <v-btn icon @click.stop="right = !right">
        <v-icon>mdi-account-question-outline</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer permanent v-model="drawer" app>
      <SidebarDrawer />
    </v-navigation-drawer>

    <v-content>
      <v-container class="fill-height" fluid>
        <TemplateViewer />
      </v-container>
    </v-content>

    <v-navigation-drawer v-model="right" :width="1024" color="primary" fixed right temporary>
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
    computed: {
      ...mapState({
        currentHelperName: state => state?.currentHelper.name
      })
    },
    data: () => ({
      drawer: null,
      drawerRight: null,
      right: false,
      left: false,
    }),
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

