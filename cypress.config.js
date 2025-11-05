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
     MAILSLURP_INBOX_ID: '53491e36-26d3-44ca-92df-2f05dbd7eb5a',
      MAILSLURP_EMAIL: '53491e36-26d3-44ca-92df-2f05dbd7eb5a@mailslurp.biz'
  }
})
