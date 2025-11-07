/// <reference types="cypress" />
/// <reference types="cypress-mailslurp" />

describe('Password Reset Flow (Inbox Cleanup Before OTP)', () => {
  const username = 'Robles';
  const newPassword = 'NewStrongPass123456!';
  const inboxId = Cypress.env('MAILSLURP_INBOX_ID');

  it('resets password successfully', () => {
    Cypress.config('defaultCommandTimeout', 60000); // allow more time

    if (!inboxId) {
      throw new Error('MAILSLURP_INBOX_ID is not set!');
    }

    cy.mailslurp().then(ms => {
      // --- Step 0: Clear inbox before triggering password reset ---
      return ms.getEmails(inboxId).then(existingEmails => {
        if (existingEmails.length > 0) {
          cy.log(`Inbox has ${existingEmails.length} emails, deleting...`);
          return ms.inboxController.deleteAllInboxEmails({ inboxId });
        } else {
          cy.log('Inbox is already empty.');
          return Promise.resolve();
        }
      });
    });

    // --- Step 1: Trigger Forgot Password ---
    cy.visit('/login');
    cy.get('.fr.ml10.brand-bg-1.radius-5.p10').click();
    cy.get('#login-forgot-password').click();
    cy.get('#frmUsername').type(username);
    cy.get('input.forgot-password-btn').click();
    cy.contains('An email will be sent', { timeout: 10000 }).should('be.visible');

    // --- Step 2: Wait for the password reset email ---
    cy.mailslurp().then(ms => ms.waitForLatestEmail(inboxId, 120000))
      .then(resetEmail => {
        const resetBody = resetEmail.textBody || resetEmail.body || resetEmail.html;
        const resetLinkMatch = resetBody.match(
          /https:\/\/coding\.dev\.go\.ug\/maaif\.aquaculture\/portal\/user\/forgot-password\/verify\/[^\s"]+/
        );
        expect(resetLinkMatch, 'Reset link extracted').to.not.be.null;

        const resetLink = resetLinkMatch[0].trim();
        cy.log(`Visiting reset link: ${resetLink}`);
        cy.visit(resetLink);

        // --- Step 3: Clear inbox before waiting for OTP ---
        cy.mailslurp().then(ms => {
          return ms.getEmails(inboxId).then(existingEmails => {
            if (existingEmails.length > 0) {
              cy.log(`Deleting ${existingEmails.length} emails before OTP...`);
              return ms.inboxController.deleteAllInboxEmails({ inboxId });
            } else {
              cy.log('Inbox is already empty before OTP.');
              return Promise.resolve();
            }
          });
        }).then(() => {
          // --- Step 4: Wait for OTP email ---
          cy.mailslurp().then(ms => ms.waitForLatestEmail(inboxId, 120000))
            .then(otpEmail => {
              const otpBody = otpEmail.textBody || otpEmail.body || otpEmail.html;

            const otpMatch = otpBody.match(/OTP\(One Time Pin\):\s*(\d{4,6})/i);
            expect(otpMatch, 'OTP extracted from email').to.not.be.null;

            const otp = otpMatch[1];
            cy.log(`OTP detected: ${otp}`);

            cy.get('#pwdrecovery_otp', { timeout: 20000 }).should('be.visible').type(otp);
            cy.get('#pwdrecovery_new_password', { timeout: 20000 }).should('be.visible').type(newPassword);

              cy.get('#pwdrecovery_confirm_new_password').type(newPassword);
              cy.get('input[title="Set new password"]').click();

              cy.contains('Password has been changed successfully.', { timeout: 15000 }).should('be.visible');

              // --- Step 6: Login with new password ---
              cy.visitLoginPage()
              cy.fillLoginForm(username, newPassword)
              cy.url().should('include', '/dashboard')
            });
        });
      });
  });
});
