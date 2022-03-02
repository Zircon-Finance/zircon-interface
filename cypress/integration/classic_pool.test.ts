describe('Pool', () => {
    beforeEach(() => cy.visit('/pool'))
    it('Add liquidity links to classic liquidity /add/ETH', () => {
      cy.get('#open-settings-dialog-button').click()
      cy.contains('Classic').click()
      cy.url().should('contain', '/add/ETH')
    })
  })
  