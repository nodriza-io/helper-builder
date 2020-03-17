<template>
	<div class="iframe-container">
    <div class="loading">
      <v-progress-linear v-if="isLoading" height="10" indeterminate></v-progress-linear>
    </div>
    <iframe ref="iframe" src="" class="iframe-el" frameborder="0"></iframe> 
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  computed: {
    ...mapState({
      helperUsage: state => state?.currentHelper?.usage,
      helperName: state => state?.currentHelper?.name
    })
  },
  data () {
    return {
      isLoading: false
    }
  },
  methods: {
    ...mapActions(['getTemplate', 'copyToClipboard']),
    async load (showLoading = true) {
      if (showLoading) this.isLoading = true
      try {
        const url = `/helper/${this.helperName}`
        const template = await this.getTemplate(url)
        if (this.$refs?.iframe?.src) {
          this.$refs.iframe.src = template
          this.$refs.iframe.onload = () => {
            if (showLoading) this.isLoading = false
          }
        } 
      } catch (err) {
        if (showLoading) this.isLoading = false
        console.log(err)
      }
    }
  },
  mounted () {
    this.load()
    this.$store.subscribe(mutation => {
      if (mutation.type === 'setCurrentHelper') this.load()
    })
    this.$emitter.on('reload', () => {
      this.load(false)
    })
  }
}
</script>

<style scoped lang="scss">
  .iframe-container {
    width: 1168px;
    overflow: auto;
    .loading {
      height: 10px;
    }
    .iframe-el {
      width: 100%;
      background-color: #fafafa;
      min-width: 1168px;
      height: calc(100vh - 100px);
    }
  }
</style>
