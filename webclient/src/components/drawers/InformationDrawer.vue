<template>
  <v-card>
    <v-toolbar color ="primary" dark>
      <v-toolbar-title>
        <v-icon left>mdi-account-question-outline</v-icon>
        User Information
      </v-toolbar-title>
      <v-spacer/>
      <v-btn icon @click.stop="$emit('onClose')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-tabs vertical>
      <v-tab class="justify-start">
        <v-icon left>mdi-code-json</v-icon>
        Source
      </v-tab>
      <v-tab class="justify-start">
        <v-icon left>mdi-comment-text-outline</v-icon>
        Explaniation
      </v-tab>
      <v-tab-item>
        <v-card>
          <v-container fluid>
            <v-row>
              <v-col style="padding-top: 0; padding-bottom: 0;">
                <JsonViewer />
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-card>
          <v-container fluid>
            <v-row>
              <v-col style="padding-top: 0; padding-bottom: 0;">
                <Explaniation />
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-tab-item>
    </v-tabs>
  </v-card>
</template>
