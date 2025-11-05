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
        const usernameMatch = body.match(/Username:<\/?strong>\s*(\w+)/i);

        expect(usernameMatch, 'Username extracted from email').to.not.be.null;

        const username = usernameMatch[1];
        cy.log('Extracted username:', username);


        // Step 3: Start password reset
        cy.visit('/login');
        cy.get('.fr.ml10.brand-bg-1.radius-5.p10').click();
        cy.get('#login-forgot-password').click();
        cy.get('#frmUsername').type(username);
        cy.get('input.forgot-password-btn').click();
        cy.contains('An email will be sent', { timeout: 10000 }).should('be.visible');

        // Step 4: Wait for password reset email
        cy.mailslurp()
          .then(ms => ms.waitForLatestEmail(inboxId, 120000))
          .then(resetEmail => {
            const resetBody = resetEmail.body || resetEmail.html;
            const resetLinkMatch = resetBody.match(/https?:\/\/[^\s"]+/);
            expect(resetLinkMatch, 'Reset link extracted').to.not.be.null;
            const resetLink = resetLinkMatch[0];

            cy.visit(resetLink);

            // Step 5: Wait for OTP email (if applicable)
            cy.mailslurp()
              .then(ms => ms.waitForLatestEmail(inboxId, 120000))
              .then(otpMail => {
                const otpMatch = otpMail.body.match(/\b\d{4,6}\b/);
                expect(otpMatch, 'OTP extracted').to.not.be.null;
                const otp = otpMatch[0];

                // Step 6: Enter OTP and new password
                cy.get('#pwdrecovery_otp').type(otp);
                cy.get('#pwdrecovery_new_password').type(newPassword);
                cy.get('#pwdrecovery_confirm_new_password').type(newPassword);
                cy.get('input[title="Set new password"]').click();

                cy.contains('Password reset successful', { timeout: 10000 }).should('be.visible');

                // Step 7: Login with new password
                cy.visit('/login');
                cy.get('#username').type(username);
                cy.get('#password').type(newPassword);
                cy.get('button[type="submit"]').click();

                cy.url().should('include', '/dashboard');
                cy.contains('Welcome').should('be.visible');
              });
          });
      });
  });
});
