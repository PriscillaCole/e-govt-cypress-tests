/// <reference types="cypress" />
/// <reference types="cypress-mailslurp" />


// Navigate to login page
Cypress.Commands.add('visitLoginPage', () => {
  cy.visit('/login')
  cy.get('.fr.ml10.brand-bg-1.radius-5.p10', { timeout: 10000 })
    .should('be.visible')
    .click()
})

//Navigate to registration page
Cypress.Commands.add('visitRegistrationPage', () => {
  cy.visit('/register')
  cy.get('.fr.ml10.brand-bg-2.radius-5.p10', { timeout: 10000 })
    .should('be.visible')
    .click()
    
})

// Fill in login credentials
Cypress.Commands.add('fillLoginForm', (username, password) => {
  cy.get('#frmUsername').clear().type(username)
  cy.get('#frmPassword').clear().type(password)
  cy.get('#login-button').click()
  cy.url().should('include', '/dashboard')
})

// Clear all emails from a MailSlurp inbox
Cypress.Commands.add('clearInbox', (inboxId) => {
  if (!inboxId) {
    throw new Error('Inbox ID is required for cy.clearInbox()');
  }

  cy.mailslurp().then(ms => {
    return ms.getEmails(inboxId).then(existingEmails => {
      if (existingEmails.length > 0) {
        cy.log(`Deleting ${existingEmails.length} emails from inbox...`);
        return ms.inboxController.deleteAllInboxEmails({ inboxId });
      } else {
        cy.log('Inbox is already empty, no deletion needed.');
        return Promise.resolve();
      }
    });
  });
});

//Get reset link from email body
Cypress.Commands.add('extractResetLink', (inboxId) => {
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
      });
});

//Set new password after reset
Cypress.Commands.add('setNewPassword', (otp, newPassword) => {
  cy.get('#pwdrecovery_otp', { timeout: 20000 }).should('be.visible').type(otp);
  cy.get('#pwdrecovery_new_password', { timeout: 20000 }).should('be.visible').type(newPassword);
  cy.get('#pwdrecovery_confirm_new_password').type(newPassword);
  cy.get('input[title="Set new password"]').click();
  
});





  