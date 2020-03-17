<!-- /doc/json -->
<template>
  <div class="VueJsonPretty-container">
    <!-- <div class="help">
      <h1>Source</h1>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem explicabo beatae dolor officia dolore minima tempora rerum voluptatibus incidunt perferendis maxime, ut ea dicta odio libero deleniti a maiores assumenda!
      </p>
      <hr>
    </div> -->
    <vue-json-pretty 
      :deep="1" 
      :showLength="true" 
      :data="jsonData" 
      @click="handleClick" />
  </div>  
</template>
<script>
import VueJsonPretty from 'vue-json-pretty'
import { mapActions } from 'vuex'

export default {
  components: {
    VueJsonPretty
  },
  data () {
    return {
      jsonData: {}
    }
  },
  methods: {
    ...mapActions(['copyToClipboard', 'getJson', 'showError']),
    handleClick () {
      // this.copyToClipboard(data)
    },
    async load () {
      try {
        const json = await this.getJson('/doc/json')
        this.jsonData = json
      } catch (err) {
        this.showError(err)
      }
    }
  },
  mounted () {
    this.load()
  }
}
</script>
<style scoped lang="scss">
  .VueJsonPretty-container {
    overflow: auto;
    height: calc(100vh - 24px);
    .help {
      padding-bottom: 5px;
      position: fixed;
      background-color: white;
      z-index: 1;
    }
    .json-pretty {

    }
  }
</style>
