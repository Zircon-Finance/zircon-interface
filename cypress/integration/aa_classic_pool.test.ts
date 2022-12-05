describe('Pool', () => {
    it('Add liquidity links to classic liquidity /add/ETH', () => {
      cy.visit('/pool', { headers: { "Accept-Encoding": "gzip, deflate" } })
      cy.get('.tri-menu').click()
      cy.contains('Classic Liquidity').click()
      cy.url().should('contain', '/add/ETH')
    })
  })
  