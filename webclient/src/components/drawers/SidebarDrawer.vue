<template>
  <v-list class="list">
    <v-subheader>
      CUSTOM HELPERS
      <v-spacer/>
      <v-btn icon>
        <v-icon v-text="'mdi-magnify'"></v-icon>
      </v-btn>
    </v-subheader>
    <v-list-item-group v-model="helper">
      <v-list-item 
        v-for="helper in helpers" 
        :key="helper.name"
        :class="{'v-list-item--active': helper.name === $route.params.helper}"
        @click="showHelper(helper)">
        <!-- <v-list-item-icon>
          <v-icon v-text="'mdi-code-tags'"></v-icon>
        </v-list-item-icon> -->
        <v-list-item-content>
          <v-list-item-title v-text="helper.name"/>
        </v-list-item-content>
        <v-list-item-icon>
          <v-btn icon @click.stop="copyToClipboard(helper.usage)">
            <v-icon>mdi-content-copy</v-icon>
          </v-btn>
        </v-list-item-icon>
      </v-list-item>
    </v-list-item-group>
    <template >
    </template>
  </v-list>
</template>

<script>
import { mapActions, mapMutations } from 'vuex'

export default {
  data () {
    return {
      helper: {},
      helpers: []
    }
  },
  methods: {
    ...mapMutations(['setCurrentHelper']),
    ...mapActions(['getHelpers', 'showError', 'copyToClipboard']),
    showHelper (helper) {
      this.helper = helper
      this.setCurrentHelper(JSON.parse(JSON.stringify(helper)))
      if (helper.name === this.$route?.params?.helper) return
      this.$router.push({ name: 'Home', params: { helper: helper.name } })
    },
    async load () {
      try {
        this.helpers = []
        const res = await this.getHelpers()
        res.map(helper => this.helpers.push(helper))
        const routeHelper = this.$route?.params?.helper
        if (routeHelper) this.showHelper(this.helpers.filter(h => h.name === routeHelper).pop())
        else if (this?.helpers[0]) this.showHelper(this.helpers[0])
      } catch (err) {
        this.showError(err)
      }
    }
  },
  mounted () {
    this.load()
    this.$emitter.on('reload', () => {
      this.load()
    })
  }
}
</script>

<style scoped>
  .list {
    background: inherit !important;
  }   
</style>

