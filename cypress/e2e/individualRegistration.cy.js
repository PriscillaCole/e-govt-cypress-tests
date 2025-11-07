/// <reference types="cypress" />
/// <reference types="cypress-mailslurp" />
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
