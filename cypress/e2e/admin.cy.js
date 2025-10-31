
import testData from '../fixtures/testData.json'

describe('Admin user management tests - placeholders', () => {
  it('creates internal user', () => {
    cy.visit('/admin/login')
    cy.get('#email').type('admin@example.com')
    cy.get('#password').type('AdminP@ss1')
    cy.get('button[type=submit]').click()
    cy.contains('Users').click()
    cy.contains('Add User').click()
    cy.get('#userType').select('Ordinary')
    cy.get('#email').type('new_user@example.com')
    cy.get('#firstName').type('New')
    cy.get('#lastName').type('User')
    cy.get('#department').select('Aquaculture')
    cy.get('button#saveUser').click()
    cy.contains('User created successfully')
  })

  it('edits internal user details', () => {
    cy.visit('/admin/login')
    cy.get('#email').type('admin@example.com')
    cy.get('#password').type('AdminP@ss1')
    cy.get('button[type=submit]').click()
    cy.contains('Users').click()
    cy.get('#searchUser').type('new_user@example.com')
    cy.contains('Edit').click()
    cy.get('#phoneNumber').clear().type('0772000000')
    cy.get('button#saveUser').click()
    cy.contains('User updated successfully')
  })
})
