describe('Pool', () => {
    beforeEach(() => cy.visit('/pool'))
    it('Add liquidity links to classic liquidity /add/ETH', () => {
      cy.get('.tri-menu').click()
      cy.contains('Classic Liquidity').click()
      cy.url().should('contain', '/add/ETH')
    })
  })
  