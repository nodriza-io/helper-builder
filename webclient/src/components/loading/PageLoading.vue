<template>
  <div class="loging" v-if="isLoading">
    <v-progress-circular :size="250" :width="10" color="white" indeterminate>
      Runnig...
    </v-progress-circular>
  </div>
</template>

<script>
export default {
  data () {
    return {
      isLoading: false
    }
  },
  mounted () {
    this.$store.subscribe((mutation) => {
      if (mutation.type === 'setLoading') {
        this.isLoading = mutation.payload
      } 
    })
  }
}
</script>

<style>
  .loging {
    position: fixed;
    z-index: 999999999999;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.47);
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
