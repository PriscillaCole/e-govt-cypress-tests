
import testData from '../fixtures/testData.json'

describe('Authentication and Account Creation Tests', () => {

// ========================== LOGIN TESTS ==========================

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


//========================== INDIVIDUAL ACCOUNT CREATION ==========================


describe('Individual Account Registration', () => {

  it('should create an account successfully for a Ugandan user', () => {
    cy.createIndividualAccount({
      nationality: 'Uganda',
      nationalityValue: '1', // matches the <select> value for Ugandan
      nin: 'CF12345678Z99H',
      dob: '1990-01-01',
      email: 'ugandan.user@example.com',
      password: 'StrongPass123',
      mobilenumber: '0789000001',
      lastname: 'Okello',
      firstname: 'Peter',
      givenname: 'James',
      sex: 'Male'
    })
  })

  it('should create an account successfully for a Non-Ugandan user using Work Permit', () => {
    cy.createIndividualAccount({
      nationality: 'Kenya',
      nationalityValue: '4', // value for Kenyan
      workPermitNumber: 'WP987654321',
      dob: '1991-05-15',
      email: 'nonugandan.wp@example.com',
      password: 'StrongPass123',
      mobilenumber: '0778000001',
      lastname: 'Smith',
      firstname: 'John',
      givenname: 'David',
      sex: 'Male'
    })
  })

  it('should create an account successfully for a Non-Ugandan user using Passport', () => {
    cy.createIndividualAccount({
      nationality: 'Nigerian',
      nationalityValue: '2', // value for Nigerian
      passportNumber: 'P123456789',
      dob: '1988-12-20',
      email: 'nonugandan.passport@example.com',
      password: 'StrongPass123',
      mobilenumber: '0777000001',
      lastname: 'Okafor',
      firstname: 'Chinedu',
      givenname: 'Emeka',
      sex: 'Male'
    })
  })

  it('should show error if DOB does not match for Ugandan user', () => {
    cy.createIndividualAccount({
      nationality: 'Uganda',
      nationalityValue: '1',
      nin: 'CF12345678Z99H',
      dob: '1999-01-01', // intentionally wrong DOB
      email: 'wrongdob.user@example.com',
      password: 'StrongPass123',
      mobilenumber: '0789000002',
      lastname: 'Okello',
      firstname: 'Peter',
      givenname: 'James',
      sex: 'Male'
    })

    cy.contains('The date of birth you entered does not match our records.').should('be.visible')
  })

  it('should show error if DOB does not match for Non-Ugandan user', () => {
    cy.createIndividualAccount({
      nationality: 'Kenya',
      nationalityValue: '4',
      workPermitNumber: 'WP987654321',
      dob: '1999-05-15', // intentionally wrong DOB
      email: 'wrongdob.nonugandan@example.com',
      password: 'StrongPass123',
      mobilenumber: '0778000002',
      lastname: 'Smith',
      firstname: 'John',
      givenname: 'David',
      sex: 'Male'
    })

    cy.contains('The date of birth you entered does not match our records.').should('be.visible')
  })

})


// ========================== NON-INDIVIDUAL ACCOUNT CREATION ==========================

describe('Non-Individual Account Creation', () => {

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

})

})