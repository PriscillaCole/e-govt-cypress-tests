/// <reference types="cypress" />
import testData from '../fixtures/testData.json'

describe('Application submission tests - placeholders', () => {
  beforeEach(() => {
    // mock TIN validation and PRN generation
    cy.intercept('POST', '/api/ura/validateTIN', (req) => {
      if (req.body && req.body.tin) {
        req.reply({statusCode: 200, body: {valid: true}})
      } else {
        req.reply({statusCode: 400, body: {valid: false}})
      }
    }).as('tinValidate')

    cy.intercept('POST', '/api/payments/generatePRN', (req) => {
      req.reply({statusCode: 200, body: {prn: testData.prn, expiresAt: '2025-12-31T23:59:59Z'}})
    }).as('generatePRN')
  })

  it('submits a new license application (happy path)', () => {
    // login first - adjust selectors/command as necessary
    cy.visit('/login')
    cy.get('#email').type(testData.individual.email)
    cy.get('#password').type(testData.individual.password)
    cy.get('button[type=submit]').click()
    cy.contains('Apply for License').click()

    // fill wizard - placeholders for selectors
    cy.get('#licenseType').select('Aquaculture Establishment Certificate')
    cy.get('#facilityType').select('Pond')
    cy.get('#species').select(['Oreochromis niloticus'])
    cy.get('#productionCapacity').type('1000')
    // attach files - assumes file exists in cypress/fixtures
    cy.get('#uploadEIA').attachFile('EIA_sample.pdf')
    cy.get('#uploadSitePlan').attachFile('SitePlan_sample.pdf')

    cy.get('button#preview').click()
    cy.contains('Preview Application')
    cy.get('button#submitApplication').click()

    cy.wait('@generatePRN')
    cy.contains('Application submitted successfully')
    cy.contains(testData.prn)
  })

  it('prevents duplicate application', () => {
    // Simulate duplicate - attempt to submit twice
    // for demo purposes, check for duplicate message after first submit
    cy.visit('/login')
    cy.get('#email').type(testData.individual.email)
    cy.get('#password').type(testData.individual.password)
    cy.get('button[type=submit]').click()
    cy.contains('Apply for License').click()
    cy.get('#licenseType').select('Aquaculture Establishment Certificate')
    cy.get('#facilityType').select('Pond')
    cy.get('#productionCapacity').type('1000')
    cy.get('button#submitApplication').click()
    cy.contains('Duplicate application exists').should('exist')
  })
})
