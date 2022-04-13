describe('Pool', () => {
    beforeEach(() => cy.visit('/pool'))
    it('Add liquidity links to pylon interface /add/ETH', () => {
      cy.get('#add-liquidity-button').click()
      cy.url().should('contain', '/add-pro/ETH' )
    })
  })
  