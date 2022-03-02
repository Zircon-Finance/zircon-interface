describe('Send', () => {
    it('Should redirect', () => {
      cy.visit('/send')
      cy.url().should('include', '/swap')
    })
  
    it('Should redirect with url params', () => {
      cy.visit('/send?outputCurrency=ETH&recipient=bob.argent.xyz')
      cy.url().should('contain', '/swap?outputCurrency=ETH&recipient=bob.argent.xyz')
    })
  })