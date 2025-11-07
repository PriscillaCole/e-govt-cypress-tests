/// <reference types="cypress" />
/// <reference types="cypress-mailslurp" />

describe('Non Individual Registration', () => {
  it('registers a new business successfully and sends an email', () => {
    const initialPassword = '@InitialPass123';

    // Use MailSlurp inbox from env variables
    const inboxId = Cypress.env('MAILSLURP_INBOX_ID');
    const inboxEmail = Cypress.env('MAILSLURP_EMAIL');

    //clear inbox before starting the registration
    cy.clearInbox(inboxId);

    // Step 1: Register a new account
    cy.visitRegistrationPage();
    cy.get('.brand-bg-3.radius-5.revenue-navigation-module-box', { timeout: 10000 })
      .should('be.visible')
      .click();

    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 25);
    const formattedDate = pastDate.toISOString().split('T')[0];

    // Fill registration form
    cy.get('#transfld_13').type('1234567890').blur(); // TIN number
    cy.get('#transfld_15').type('John'); // Company Name
    cy.get('#transfld_14').type('Kampala'); // Company Registration Number
    cy.get('#transfld_10').type('0701234567'); // Telephone
    cy.get('#transfld_11').select('UGANDA'); // Country of Registration
    cy.get('#transfld_16').type(formattedDate); // Date of Registration
    cy.get('#transfld_12').type(inboxEmail); // Email
    cy.get('.next').click({ force: true });
    cy.get('#frm_new_password').type(initialPassword);
    cy.get('#frm_confirm_new_password').type(initialPassword);

    cy.get('.finish').click({ force: true });
    cy.get('input[name="confirmation_terms_and_conditions[]"]').check({ force: true });
    cy.get('input[title="Submit Form"]').click();

    cy.contains('Account created successfully', { timeout: 15000 }).should('be.visible');

    // Step 2: Wait for registration email
    cy.mailslurp()
      .then(ms => ms.waitForLatestEmail(inboxId, 120000))
      .then(email => {
        const body = email.body || email.html;

        // Robust username extraction
        const usernameMatch = body.match(/<strong[^>]*>Username:<\/strong>\s*([A-Za-z0-9_\-]+)/i);
         console.log(usernameMatch);

        expect(usernameMatch, 'Username extracted from email').to.not.be.null;

        const username = usernameMatch[1];
        cy.log('Extracted username:', username);
      });

      //Step 3: Login with the new account
        cy.visitLoginPage()
        cy.fillLoginForm(username, initialPassword)
    });

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