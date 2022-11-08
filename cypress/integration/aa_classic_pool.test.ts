describe('Pool', () => {
    it('Add liquidity links to classic liquidity /add/ETH', () => {
      cy.visit('/pool')
      cy.get('.tri-menu').click()
      cy.contains('Classic Liquidity').click()
      cy.url().should('contain', '/add/ETH')
    })
  })
  