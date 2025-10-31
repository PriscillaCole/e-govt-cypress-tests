/// <reference types="cypress" />
import testData from '../fixtures/testData.json'

describe('Payments and PRN tests - placeholders', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/payments/generatePRN', {prn: testData.prn, expiresAt: '2025-12-31T23:59:59Z'}).as('generatePRN')
    cy.intercept('GET', '/api/payments/status/*', {status: 'paid'}).as('paymentStatus')
  })

  it('generates PRN and shows payment details', () => {
    cy.visit('/login')
    cy.get('#email').type(testData.individual.email)
    cy.get('#password').type(testData.individual.password)
    cy.get('button[type=submit]').click()
    cy.contains('My Applications').click()
    // assume PRN generation action
    cy.contains('Generate PRN').click()
    cy.wait('@generatePRN')
    cy.contains(testData.prn)
  })

  it('reflects payment status after URA confirmation', () => {
    // After payment, the system should reflect status change
    cy.visit('/applications')
    cy.get('#searchRef').type('SOME-REF-123')
    cy.get('button#search').click()
    cy.wait('@paymentStatus')
    cy.contains('Paid').should('exist')
  })
})
