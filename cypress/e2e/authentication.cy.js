
import testData from '../fixtures/testData.json'

describe('Authentication and Account Creation Tests', () => {


//login with correct credentials
 it('logs in successfully with valid credentials', () => {
    cy.visitLoginPage()
    cy.fillLoginForm(testData.individual.username, testData.individual.password)
    cy.url().should('include', '/dashboard')
    cy.contains('Welcome to the e-Services Portal', { timeout: 10000 })
  })

  it('shows error for invalid credentials and clears fields', () => {
    cy.visitLoginPage()
    cy.fillLoginForm('wronguser@example.com', 'wrongpassword')
    cy.contains('Invalid ', { timeout: 10000 })
    cy.get('#email').should('have.value', '')
    cy.get('#password').should('have.value', '')
  })

  it('locks account after maximum failed login attempts', () => {
    cy.visitLoginPage()
    for (let i = 0; i < 3; i++) {
      cy.fillLoginForm('lockeduser@example.com', 'wrongpassword')
      cy.wait(500)
    }
    cy.contains('Your account has been locked. Please contact your MDA help desk for assistance.', { timeout: 10000 })
    cy.url().should('eq', 'https://www.agriculture.go.ug/')

    // Revisit login page to verify lockout persists
    cy.visit('/login')

    // Assert that fields or button are disabled
    cy.get('#frmUsername').should('be.disabled')
    cy.get('#frmPassword').should('be.disabled')
    cy.get('#login-button').should('be.disabled')
  })


})