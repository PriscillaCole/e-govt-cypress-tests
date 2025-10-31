/// <reference types="cypress" />
describe('Tracking tests - placeholder selectors', () => {
  it('tracks application by valid reference', () => {
    cy.visit('/track')
    cy.get('#applicationRef').type('SOME-REF-123')
    cy.get('button#trackSearch').click()
    cy.contains('Application under processing').should('exist')
  })

  it('shows message for invalid reference', () => {
    cy.visit('/track')
    cy.get('#applicationRef').type('INVALID-REF-999')
    cy.get('button#trackSearch').click()
    cy.contains('Reference not found').should('exist')
  })
})
