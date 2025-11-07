/// <reference types="cypress" />
/// <reference types="cypress-mailslurp" />



  it('should fail if TIN is invalid', () => {
    cy.mockTINApi('INVALIDTIN', { valid: false })
    cy.visit('/register')
    // Navigate to Individual registration
    cy.get('.fr.ml10.brand-bg-2.radius-5.p10', { timeout: 10000 }).should('be.visible').click()
    cy.get('.brand-bg-3.radius-5.revenue-navigation-module-box', { timeout: 10000 })
      .should('be.visible')
      .click()

    // Enter TIN
    cy.get('#transfld_13').type('INVALIDTIN').blur()
   
    cy.wait('@verifyTIN')
    cy.contains('Dear client, the TIN you have entered is invalid').should('be.visible')
  })

    it('should create account successfully with valid TIN', () => {
    cy.createNonIndividualAccount({
      tin: '123456789',
      companyRegNumber: 'CRN00123',
      companyName: 'Tech Solutions Ltd',
      dateOfRegistration: '2020-01-15',
      companyType: 'Local',
      telephone: '0789000001',
      email: 'company@example.com',
      password: 'StrongPass123'
    })
  })

});