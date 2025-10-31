// Custom Cypress commands for Aquaculture Licensing tests
import 'cypress-file-upload'

Cypress.Commands.add('visitLoginPage', () => {
  cy.visit('/login')
  cy.get('.fr.ml10.brand-bg-1.radius-5.p10', { timeout: 10000 })
    .should('be.visible')
    .click()
})

// Fill in login credentials
Cypress.Commands.add('fillLoginForm', (username, password) => {
  cy.get('#frmUsername').clear().type(username)
  cy.get('#frmPassword').clear().type(password)
  cy.get('#login-button').click()
})


// Mock API for Ugandan users
Cypress.Commands.add('mockNINApi', (nin, response) => {
  cy.intercept(
    {
      method: 'POST',
      url: '**/maaif.aquaculture/portal/customer/register/page1/custtype/1/kfw-edv/form-populator/fld/transfld_2/**'
    },
    {
      statusCode: 200,
      body: {
        valid: true,
        lastname: response.lastname,
        firstname: response.firstname,
        givenname: response.givenname,
        sex: response.sex,
        dob: response.dob
      }
    }
  ).as('verifyNIN')
})

// Mock API for non-Ugandan users
Cypress.Commands.add('mockDCICApi', (passportOrPermit, response) => {
  cy.intercept(
    {
      method: 'POST',
      url: '**/maaif.aquaculture/portal/customer/register/page1/custtype/1/kfw-edv/form-populator/fld/transfld_3/**'
    },
    {
      statusCode: 200,
      body: {
        valid: true,
        lastname: response.lastname,
        firstname: response.firstname,
        givenname: response.givenname,
        sex: response.sex,
        dob: response.dob
      }
    }
  ).as('verifyDCIC')
})

// Unified command to create an individual account
Cypress.Commands.add('createIndividualAccount', (data) => {

  // Mock API based on nationality
  if ((data.nationality || 'Uganda') === 'Uganda') {
    const ninData = {
      lastname: 'Okello',
      firstname: 'Peter',
      givenname: 'James',
      sex: 'Male',
      dob: '1990-01-01'
    }
    cy.mockNINApi(data.nin, ninData)
  } else {
    const dcicData = {
      lastname: 'Smith',
      firstname: 'John',
      givenname: 'Michael',
      sex: 'Male',
      dob: '1992-03-15'
    }
    cy.mockDCICApi(data.passportNumber || data.workPermitNumber, dcicData)
  }

  cy.visit('/register')

  // Navigate to Individual registration
  cy.get('.fr.ml10.brand-bg-2.radius-5.p10', { timeout: 10000 }).should('be.visible').click()
  cy.get('.brand-bg-2.radius-5.revenue-navigation-module-box', { timeout: 10000 }).should('be.visible').click()

  // Select nationality
  cy.get('#transfld_1').select(data.nationalityValue || '1') // default '1' = Ugandan

  if ((data.nationality || 'Uganda') === 'Uganda') {
    // Ugandan: enter NIN
    cy.get('#transfld_2').type(data.nin).blur()

    // Wait for NIN verification
    cy.wait('@verifyNIN', { timeout: 15000 }).then(({ response }) => {
      const body = response.body

      // Auto-populate fields
      cy.get('#transfld_5').should('have.value', body.lastname)
      cy.get('#transfld_6').should('have.value', body.firstname)
      cy.get('#transfld_7').should('have.value', body.givenname)
      cy.get('#transfld_9').should('have.value', body.sex)

      // Enter user-provided DOB
      cy.get('#transfld_8').clear().type(data.dob)

      // Validate DOB
      if (data.dob !== body.dob) {
        cy.log('Date of Birth mismatch — resetting form.')
        cy.get('#registerForm').then($form => $form[0].reset())
        cy.contains('The date of birth you entered does not match our records.').should('be.visible')
      }
    })

  } else {
    // Non-Ugandan: NIN disappears
    cy.get('#transfld_2').should('not.be.visible')

    // Enter Work Permit or Passport
    if (data.workPermitNumber) cy.get('#transfld_3').type(data.workPermitNumber)
    if (data.passportNumber) cy.get('#transfld_4').type(data.passportNumber)

    // Trigger API call
    cy.get(data.workPermitNumber ? '#transfld_3' : '#transfld_4').blur()

    cy.wait('@verifyDCIC', { timeout: 15000 }).then(({ response }) => {
      const body = response.body

      // Auto-populate fields
      cy.get('#transfld_5').should('have.value', body.lastname)
      cy.get('#transfld_6').should('have.value', body.firstname)
      cy.get('#transfld_7').should('have.value', body.givenname)
      cy.get('#transfld_9').should('have.value', body.sex)

      // Enter user-provided DOB
      cy.get('#transfld_8').clear().type(data.dob)

      // Validate DOB
      if (data.dob !== body.dob) {
        cy.log('Date of Birth mismatch — resetting form.')
        cy.get('#registerForm').then($form => $form[0].reset())
        cy.contains('The date of birth you entered does not match our records.').should('be.visible')
       
      }
    })
  }

  // Fill remaining details
  cy.get('#transfld_10').type(data.mobilenumber || '0789000000')
  cy.get('#transfld_12').type(data.email)

  // Proceed to password step
  cy.get('.next').click({ force: true })
  cy.get('#frm_new_password').type(data.password)
  cy.get('#frm_confirm_new_password').type(data.password)

  // Proceed to final step
  cy.get('.next').click({ force: true })
  cy.get('.fl input-label').check({ force: true })
  cy.get('.finish').click()

  cy.contains('Account created successfully', { timeout: 15000 })
})

// Mock URA TIN API
Cypress.Commands.add('mockTINApi', (tin, response) => {
  cy.intercept(
    {
      method: 'POST',
      url: '**/tin-validation-api/**' // Replace with your actual TIN verification endpoint
    },
    {
      statusCode: 200,
      body: response
    }
  ).as('verifyTIN')
})

// Create Non-Individual account
Cypress.Commands.add('createNonIndividualAccount', (data) => {

  const defaultResponse = {
    valid: true,
    companyName: data.companyName || 'Tech Solutions Ltd',
    dateOfRegistration: data.dateOfRegistration || '2020-01-01',
    companyType: data.companyType || 'Local'
  }

  // Mock TIN API before visiting page
  cy.mockTINApi(data.tin, defaultResponse)

  cy.visit('/register')

// Navigate to Individual registration
  cy.get('.fr.ml10.brand-bg-2.radius-5.p10', { timeout: 10000 }).should('be.visible').click()
  cy.get('.brand-bg-3.radius-5.revenue-navigation-module-box', { timeout: 10000 })
  .should('be.visible')
  .click()


  // Enter TIN
  cy.get('#transfld_13').type(data.tin).blur()

  // Wait for TIN verification
  cy.wait('@verifyTIN').then(({ response }) => {
    if (!response.body.valid) {
      cy.contains('Dear client, the TIN you have entered is invalid').should('be.visible')
      throw new Error('Invalid TIN')
    }

    // Auto-populate fields
    cy.get('#transfld_15').should('have.value', response.body.companyName)
    cy.get('#transfld_16').should('have.value', response.body.dateOfRegistration)
   
  })

  // Fill remaining fields
  cy.get('#transfld_11').type(data.countryOfRegistration)
  cy.get('#transfld_14').type(data.companyRegNumber)
  cy.get('#transfld_10').type(data.telephone)
  cy.get('#transfld_12').type(data.email)
  

    // Proceed to password step
  cy.get('.next').click({ force: true })
  cy.get('#frm_new_password').type(data.password)
  cy.get('#frm_confirm_new_password').type(data.password)

  // Proceed to final step
  cy.get('.next').click({ force: true })
  cy.get('.fl input-label').check({ force: true })
  cy.get('.finish').click()

  cy.contains('Account created successfully', { timeout: 15000 }).should('be.visible')
})


Cypress.Commands.add('attachFile', (selector, filename) => {
  cy.get(selector).attachFile(filename)
})
