/// <reference types="cypress" />
/// <reference types="cypress-mailslurp" />

describe('Non-Individual Registration', () => {
  const initialPassword = '@InitialPass123';
  const inboxId = Cypress.env('MAILSLURP_INBOX_ID');
  const inboxEmail = Cypress.env('MAILSLURP_EMAIL');

  beforeEach(() => {
    cy.clearInbox(inboxId);
    cy.visitRegistrationPage();
  });

  // ======================================================
  // TEST 1: SUCCESSFUL REGISTRATION (VALID TIN)
  // ======================================================
  it('registers a new business successfully with a valid TIN', () => {
    cy.intercept('GET', '**/validateTIN*', {
      statusCode: 200,
      body: {
        companyName: 'Mock Traders Ltd',
        dateOfRegistration: '2005-08-14',
        companyType: 'Local',
      },
    }).as('validateTIN');

    cy.get('.brand-bg-3.radius-5.revenue-navigation-module-box', { timeout: 10000 })
      .should('be.visible')
      .click();

    // Step 1: Enter valid TIN → trigger endpoint
    cy.get('#transfld_13').type('1234567890').blur();
    cy.wait('@validateTIN').its('response.statusCode').should('eq', 200);

    // Step 2: Confirm auto-populated fields
    cy.get('#transfld_15', { timeout: 10000 }).should('have.value', 'Mock Traders Ltd');
    cy.get('#transfld_16').should('have.value', '2005-08-14');
    cy.get('#transfld_11').should('contain', 'Local');

    // Step 3: Fill remaining fields
    cy.get('#transfld_14').type('CRN123456');
    cy.get('#transfld_10').type('0701234567');
    cy.get('#transfld_12').type(inboxEmail);

    // Step 4: Proceed to password creation
    cy.get('.next').click({ force: true });
    cy.get('#frm_new_password').type(initialPassword);
    cy.get('#frm_confirm_new_password').type(initialPassword);
    cy.get('.finish').click({ force: true });

    // Step 5: Accept terms and submit
    cy.get('input[name="confirmation_terms_and_conditions[]"]').check({ force: true });
    cy.get('input[title="Submit Form"]').click();

    // Step 6: Verify account creation success
    cy.contains('Account created successfully', { timeout: 15000 }).should('be.visible');

    // Step 7: Verify email + login
    cy.mailslurp()
      .then(ms => ms.waitForLatestEmail(inboxId, 120000))
      .then(email => {
        const body = email.body || email.html;
        const usernameMatch = body.match(/Username:\s*([A-Za-z0-9_\-]+)/i);
        expect(usernameMatch, 'Username extracted from email').to.not.be.null;
        const username = usernameMatch[1];

        cy.log('Extracted username:', username);
        cy.visitLoginPage();
        cy.fillLoginForm(username, initialPassword);
        
      });
  });

  // ======================================================
  // TEST 2: INVALID TIN (URA VALIDATION FAIL)
  // ======================================================
  it('shows error when TIN is invalid', () => {
    cy.intercept('GET', '**/validateTIN*', {
      statusCode: 400,
      body: {
        message: 'Invalid TIN',
      },
    }).as('validateInvalidTIN');

    cy.get('.brand-bg-3.radius-5.revenue-navigation-module-box').click();

    // Enter invalid TIN → backend rejects it
    cy.get('#transfld_13').type('9999999999').blur();
    cy.wait('@validateInvalidTIN');

    cy.contains(
      'Dear client, the TIN you have entered is invalid. Please check the TIN and try again or contact URA for assistance',
      { timeout: 10000 }
    ).should('be.visible');
  });

  // ======================================================
  // TEST 3: DUPLICATE TIN (DB CHECK AFTER VALIDATION)
  // ======================================================
  it('shows error when TIN is already used', () => {
    // Step 1: Let validation succeed (endpoint OK)
    cy.intercept('GET', '**/validateTIN*', {
      statusCode: 200,
      body: {
        companyName: 'Duplicate Co. Ltd',
        dateOfRegistration: '2010-05-05',
        companyType: 'Local',
      },
    }).as('validateTIN');

    cy.get('.brand-bg-3.radius-5.revenue-navigation-module-box').click();

    // Step 2: Enter valid but already-registered TIN
    cy.get('#transfld_13').type('1111111111').blur();
    cy.wait('@validateTIN');

    // Step 3: Confirm fields auto-populated
    cy.get('#transfld_15').should('have.value', 'Duplicate Co. Ltd');

    // Step 4: Proceed to registration (DB will check duplication)
    cy.get('#transfld_14').type('CRN999999');
    cy.get('#transfld_10').type('0709876543');
    cy.get('#transfld_12').type('duplicate@example.com');

    cy.get('.next').click({ force: true });
    cy.get('#frm_new_password').type(initialPassword);
    cy.get('#frm_confirm_new_password').type(initialPassword);
    cy.get('.finish').click({ force: true });

    cy.get('input[name="confirmation_terms_and_conditions[]"]').check({ force: true });
    cy.get('input[title="Submit Form"]').click();

    // Step 5: Expect duplicate TIN error (from DB check)
    cy.contains(
      'Dear client, the TIN you have entered has already been used. Please login',
      { timeout: 10000 }
    ).should('be.visible');
  });
});

