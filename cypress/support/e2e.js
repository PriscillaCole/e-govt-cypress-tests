import './commands'
import 'cypress-mailslurp';
// global before/after hooks can go here
Cypress.on('uncaught:exception', (err, runnable) => {
  // prevent test failure on uncaught exceptions from app
  return false
})
