const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://coding.dev.go.ug/maaif.aquaculture/portal',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.js',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here if needed
      
      return config;
    }
  },
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/reports',
    overwrite: false,
    html: false,
    json: true
  },
   env: {
    MAILSLURP_API_KEY: '50a2f0376386e7efce5e74a2fd4aed81b66c431ace7b4b1efdda111c6b5a8753',
     MAILSLURP_INBOX_ID: 'd17fc06d-7bea-4b30-aa4a-c0410d470191',
      MAILSLURP_EMAIL: 'd17fc06d-7bea-4b30-aa4a-c0410d470191@mailslurp.biz'
  }
})
