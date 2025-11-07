/// <reference types="cypress" />
/// <reference types="cypress-mailslurp" />

describe('Full Registration + Password Reset Flow', () => {
  it('registers a new user and resets password successfully', () => {
    const initialPassword = '@InitialPass123';
    const newPassword = 'NewStrongPass123';

    // Use MailSlurp inbox from env variables
    const inboxId = Cypress.env('MAILSLURP_INBOX_ID');
    const inboxEmail = Cypress.env('MAILSLURP_EMAIL');

    // Step 1: Register a new account
    cy.visit('/register');

    cy.get('.fr.ml10.brand-bg-2.radius-5.p10', { timeout: 10000 }).should('be.visible').click();
    cy.get('.brand-bg-3.radius-5.revenue-navigation-module-box', { timeout: 10000 })
      .should('be.visible')
      .click();

    // Fill registration form
    cy.get('#transfld_13').type('1234567890').blur(); // TIN
    cy.get('#transfld_15').type('John');
    cy.get('#transfld_14').type('Kampala');
    cy.get('#transfld_10').type('0701234567');

    cy.get('#transfld_11').select('UGANDA');

    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 25);
    const formattedDate = pastDate.toISOString().split('T')[0];
    cy.get('#transfld_16').type(formattedDate);

    cy.get('#transfld_12').type(inboxEmail);

    cy.get('.next').click({ force: true });
    cy.get('#frm_new_password').type(initialPassword);
    cy.get('#frm_confirm_new_password').type(initialPassword);

    cy.get('.finish').click({ force: true });
    cy.get('input[name="confirmation_terms_and_conditions[]"]').check({ force: true });
    cy.get('input[title="Submit Form"]').click();

   // cy.contains('Account created successfully', { timeout: 15000 }).should('be.visible');

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
    });
});