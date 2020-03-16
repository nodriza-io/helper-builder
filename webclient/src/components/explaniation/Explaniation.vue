<template>
  <div class="Explaniation-container">

    <div class="help">
      <h1>Explaniation ({{ currentHelper.name }})</h1>
      <p>{{ currentHelper.description }}</p>
      <hr>
    </div>
    
    <div class="details">  
      <v-row>
        <v-col>
          <strong>Usage</strong> 
          <v-btn icon @click="copyToClipboard(currentHelper.usage)">
            <v-icon rigth>mdi-content-copy</v-icon>
          </v-btn>        
          <pre v-html="currentHelper.usage"></pre>
        </v-col>
      </v-row>
      <v-row v-if="argsDefinition">
        <v-col>
          <strong>Arguments</strong>
          <pre v-html="argsDefinition"></pre>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <strong>Code</strong>
          <div>
            <pre v-html="funcCode"></pre>
          </div>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import hljs from 'highlight.js'
import javascript from 'highlight.js/lib/languages/javascript'
import 'highlight.js/styles/github.css'

hljs.registerLanguage('javascript', javascript)

export default {
  computed: {
    ...mapState({
      argsDefinition (state) {
        const args = state.currentHelper?.argsDefinition
        if (this.isEmpty(args)) return 
        return hljs.highlight('json', JSON.stringify(args, null, 2)).value
      },
      funcCode (state) {
        return hljs.highlight('javascript', state.currentHelper?.func).value
      },
      currentHelper: state => state.currentHelper
    })
  },
  methods: {
    ...mapActions(['copyToClipboard']),
    isEmpty (obj) {
      return Object.keys(obj).length === 0 && obj.constructor === Object
    }
  }
}
</script>

<style scoped lang="scss">
  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  .Explaniation-container {
    overflow: auto;
    width: 100%;
    height: calc(100vh - 24px - 64px);
  }
  .help {
    padding-bottom: 5px;
    position: fixed;
    width: 100%;
    background-color: white;
    z-index: 1;
  }
  .details {
    margin-top: 80px;
  }
</style>
