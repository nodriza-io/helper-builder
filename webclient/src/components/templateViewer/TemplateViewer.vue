<template>
	<div class="iframe-container">
    <div v-if="isLoading" class="loading">
      <v-progress-linear height="10" indeterminate></v-progress-linear>
    </div>
    <iframe ref="iframe" src="" class="iframe-el" frameborder="0"></iframe> 
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  computed: {
    ...mapState({
      helperName: state => state?.currentHelper?.name
    })
  },
  data () {
    return {
      isLoading: false
    }
  },
  methods: {
    ...mapActions(['getTemplate']),
    async load (showLoading = true) {
      if (showLoading) this.isLoading = true
      try {
        const url = `/helper/${this.helperName}`
        const template = await this.getTemplate(url)
        this.$refs.iframe.src = template
        this.$refs.iframe.onload = () => {
          if (showLoading) this.isLoading = false
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
    .loading {
      position: fixed;
      background: rgba(225, 225, 225, 0.9);
      width: inherit;
      height: calc(100vh - 64px - 24px);
      z-index: 111;
    }
    .iframe-el {
      width: 100%;
      height: calc(100vh - 64px - 24px);
    }
  }
</style>
