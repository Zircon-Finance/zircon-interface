describe('Lists', () => {
    beforeEach(() => {
      cy.visit('/swap')
    })
  
    // @TODO check if default lists are active when we have them
    it('Change list', () => {
        cy.get('#swap-currency-output').contains('token').click()
        cy.get('#list-introduction-choose-a-list').contains('list').click()
        cy.get('.select-button').contains('Select').click()
    })
  })