describe('Individual Registration', () => {
  const initialPassword = '@InitialPass123';
  const inboxId = Cypress.env('MAILSLURP_INBOX_ID');
  const inboxEmail = Cypress.env('MAILSLURP_EMAIL');

  beforeEach(() => {
    cy.clearInbox(inboxId);
    cy.visitRegistrationPage();
  });

  // ======================================================
  // TEST 1: UGANDAN CITIZEN (VALID NIN)
  // ======================================================
  it('registers a Ugandan applicant successfully with a valid NIN', () => {
    cy.intercept('GET', '**/validateNIN*', {
      statusCode: 200,
      body: {
        lastname: 'Mugisha',
        firstname: 'John',
        givenname: 'Paul',
        sex: 'M',
        dob: '1990-04-12',
      },
    }).as('validateNIN');

    // Step 1: Select Individual applicant type
    cy.get('.brand-bg-3.radius-5.revenue-navigation-module-box').click();

    // Step 2: Select Uganda nationality
    cy.get('#transfld_1').select('Uganda');

    // Step 3: Enter valid NIN and trigger API
    cy.get('#transfld_2').type('CF900123456789').blur();
    cy.wait('@validateNIN');

    // Step 4: Verify auto-populated fields
    cy.get('#transfld_5').should('have.value', 'Mugisha'); // Surname
    cy.get('#transfld_6').should('have.value', 'John');    // Middle name
    cy.get('#transfld_7').should('have.value', 'Paul');    // Given name
    cy.get('#transfld_9').should('have.value', 'M');       // Sex

    // Step 5: Enter date of birth to confirm identity
    cy.get('#transfld_8').clear().type('1990-04-12');

    // Step 6: Proceed with account creation
    cy.get('#transfld_10').type('0701234567'); // phone
    cy.get('#transfld_12').type(inboxEmail);   // email
    cy.get('.next').click({ force: true });
    cy.get('#frm_new_password').type(initialPassword);
    cy.get('#frm_confirm_new_password').type(initialPassword);
    cy.get('.finish').click({ force: true });

    cy.get('input[name="confirmation_terms_and_conditions[]"]').check({ force: true });
    cy.get('input[title="Submit Form"]').click();

    cy.contains('Account created successfully', { timeout: 15000 }).should('be.visible');
  });

  // ======================================================
  // TEST 2: NON-UGANDAN (VALID WORK PERMIT/PASSPORT)
  // ======================================================
  it('registers a non-Ugandan successfully with a valid Work Permit', () => {
    cy.intercept('GET', '**/verifyDCIC*', {
      statusCode: 200,
      body: {
        lastname: 'Smith',
        firstname: 'Anna',
        givenname: '',
        sex: 'F',
        dob: '1988-07-19',
      },
    }).as('verifyDCIC');

    cy.get('.brand-bg-3.radius-5.revenue-navigation-module-box').click();

    // Step 1: Select foreign nationality
    cy.get('#transfld_1').select('Kenya');

    // Step 2: Confirm NIN field hidden, and enter Work Permit number
    cy.get('#transfld_2').should('not.be.visible');
    cy.get('#transfld_3').type('WP987654321').blur();
    cy.wait('@verifyDCIC');

    // Step 3: Verify auto-populated fields
    cy.get('#transfld_5').should('have.value', 'Smith');
    cy.get('#transfld_6').should('have.value', 'Anna');
    cy.get('#transfld_9').should('have.value', 'F');

    // Step 4: Confirm identity using DOB
    cy.get('#transfld_8').clear().type('1988-07-19');

    // Step 5: Proceed to password creation
    cy.get('#transfld_10').type('0712345678');
    cy.get('#transfld_12').type(inboxEmail);
    cy.get('.next').click({ force: true });
    cy.get('#frm_new_password').type(initialPassword);
    cy.get('#frm_confirm_new_password').type(initialPassword);
    cy.get('.finish').click({ force: true });
    cy.get('input[name="confirmation_terms_and_conditions[]"]').check({ force: true });
    cy.get('input[title="Submit Form"]').click();

    cy.contains('Account created successfully', { timeout: 15000 }).should('be.visible');
  });

  // ======================================================
  // TEST 3: INVALID NIN / WORK PERMIT / PASSPORT
  // ======================================================
  it('shows error when invalid NIN or Work Permit/Passport is entered', () => {
    cy.intercept('GET', '**/validateNIN*', { statusCode: 400 }).as('validateInvalidNIN');

    cy.get('.brand-bg-3.radius-5.revenue-navigation-module-box').click();
    cy.get('#transfld_1').select('Uganda');

    // Enter invalid NIN
    cy.get('#transfld_2').type('INVALIDNIN123').blur();
    cy.wait('@validateInvalidNIN');

    cy.contains(
      'Dear client, the NIN/work permit/Passport you have entered is invalid. Please check the NIN/work permit/Passport and try again or contact NIRA/DCIC for assistance',
      { timeout: 10000 }
    ).should('be.visible');
  });

  // ======================================================
  // TEST 4: DUPLICATE NIN (Detected by System DB)
  // ======================================================
  it('shows error when NIN or Work Permit/Passport already exists in the system', () => {
    cy.intercept('GET', '**/validateNIN*', {
      statusCode: 200,
      body: {
        lastname: 'Kato',
        firstname: 'Joseph',
        givenname: 'Ali',
        sex: 'M',
        dob: '1992-09-23',
      },
    }).as('validateNIN');

    cy.get('.brand-bg-3.radius-5.revenue-navigation-module-box').click();
    cy.get('#transfld_1').select('Uganda');
    cy.get('#transfld_2').type('CF900123456789').blur();
    cy.wait('@validateNIN');

    // Fields should populate
    cy.get('#transfld_5').should('have.value', 'Kato');

    // Continue to registration (system checks DB duplication)
    cy.get('#transfld_10').type('0700000000');
    cy.get('#transfld_12').type('duplicate@example.com');
    cy.get('.next').click({ force: true });
    cy.get('#frm_new_password').type(initialPassword);
    cy.get('#frm_confirm_new_password').type(initialPassword);
    cy.get('.finish').click({ force: true });
    cy.get('input[name="confirmation_terms_and_conditions[]"]').check({ force: true });
    cy.get('input[title="Submit Form"]').click();

    // Simulate DB rejecting duplicate
    cy.contains(
      'Dear client, the NIN/work permit you have entered has already been used. Please login',
      { timeout: 10000 }
    ).should('be.visible');
  });
});
