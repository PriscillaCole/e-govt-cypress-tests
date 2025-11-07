/// <reference types="cypress" />
/// <reference types="cypress-mailslurp" />


describe('Password Reset Flow (Inbox Cleanup Before OTP)', () => {
  const username = 'Robles';
  const newPassword = 'NewStrongPass124!';
  const inboxId = Cypress.env('MAILSLURP_INBOX_ID');

  //1.Happy Path: Successful Password Reset
  it('resets password successfully', () => {
    Cypress.config('defaultCommandTimeout', 60000); // allow more time

    if (!inboxId) {
      throw new Error('MAILSLURP_INBOX_ID is not set!');
    }

    //clear inbox before starting the flow
    cy.clearInbox(inboxId);

    // --- Step 1: Trigger Forgot Password ---
    cy.visit('/login');
    cy.get('.fr.ml10.brand-bg-1.radius-5.p10').click();
    cy.get('#login-forgot-password').click();
    cy.get('#frmUsername').type(username);
    cy.get('input.forgot-password-btn').click();
    cy.contains('An email will be sent', { timeout: 10000 }).should('be.visible');

    // --- Step 2: Wait for the password reset email ---
    cy.extractResetLink(inboxId);

        // --- Step 3: Clear inbox before waiting for OTP ---
        cy.clearInbox(inboxId).then(() => {

          // --- Step 4: Wait for OTP email ---
          cy.mailslurp().then(ms => ms.waitForLatestEmail(inboxId, 120000))
            .then(otpEmail => {
              const otpBody = otpEmail.textBody || otpEmail.body || otpEmail.html;

            const otpMatch = otpBody.match(/OTP\(One Time Pin\):\s*(\d{4,6})/i);
            expect(otpMatch, 'OTP extracted from email').to.not.be.null;

            const otp = otpMatch[1];
            cy.log(`OTP detected: ${otp}`);

            //enter otp and new password
            cy.get('#pwdrecovery_otp', { timeout: 20000 }).should('be.visible').type(otp);
            cy.get('#pwdrecovery_new_password', { timeout: 20000 }).should('be.visible').type(newPassword);

              cy.get('#pwdrecovery_confirm_new_password').type(newPassword);
              cy.get('input[title="Set new password"]').click();

              cy.contains('Password has been changed successfully.', { timeout: 15000 }).should('be.visible');

              // --- Step 6: Login with new password ---
              cy.visitLoginPage()
              cy.fillLoginForm(username, newPassword)
              
            });
        });
     
  });

  //2. Negative Test Cases
  it('shows error when username does not exist', () => {
    cy.visit('/login');
    cy.get('.fr.ml10.brand-bg-1.radius-5.p10').click();
    cy.get('#login-forgot-password').click();
    cy.get('#frmUsername').type('NonExistentUser');
    cy.get('input.forgot-password-btn').click();

    cy.contains('Invalid', { timeout: 10000 }).should('be.visible');
  });

  it('fails with expired reset link', () => {
    const expiredLink = 'https://coding.dev.go.ug/maaif.aquaculture/portal/user/forgot-password/verify/k/33-8d4fa28cc21c5aa9be8afdd3acb06429/t/e5b39143ad5d0f60514888a4cf0465fd/?sd=47dca3740cf68e8111d5262ab37cbcd5&';
    cy.visit(expiredLink, { failOnStatusCode: false });

    cy.contains('invalid', { timeout: 10000 }).should('be.visible');
  });


  it('shows error for wrong OTP', () => {
    // Trigger password reset as before
    const username = 'Robles';
    const wrongOtp = '123456'; // definitely incorrect

    cy.visit('/login');
    cy.get('.fr.ml10.brand-bg-1.radius-5.p10').click();
    cy.get('#login-forgot-password').click();
    cy.get('#frmUsername').type(username);
    cy.get('input.forgot-password-btn').click();

    cy.clearInbox(inboxId);
    // Wait for reset page (use your working method)
    cy.extractResetLink(Cypress.env('MAILSLURP_INBOX_ID'))
      .then(() => {

        cy.get('#pwdrecovery_otp').type(wrongOtp);
        cy.get('#pwdrecovery_new_password').type('NewPassword124!');
        cy.get('#pwdrecovery_confirm_new_password').type('NewPassword124!');
        cy.get('input[title="Set new password"]').click();

        cy.contains('not valid', { timeout: 10000 }).should('be.visible');
      });
  });


});




