describe('Add Liquidity', () => {

  it('Loads the two correct tokens', () => {
    cy.visit('#/add/ETH/0x4545E94974AdACb82FC56BCf136B07943e152055/')
    cy.get('#add-liquidity-input-tokena .token-symbol-container').should('contain.text', 'MOVR')
    cy.get('#add-liquidity-input-tokenb .token-symbol-container').should('contain.text', 'ZRG')
  })

  it('Does not crash if ETH is duplicated', () => {
    cy.visit('#/add/ETH/ETH/')
    cy.get('#add-liquidity-input-tokena .token-symbol-container').should('contain.text', 'MOVR')
    cy.get('#add-liquidity-input-tokenb .token-symbol-container').should('not.contain.text', 'MOVR')
  })

  it('Single token can be selected', () => {
    cy.visit('#/add/ETH/0x4545E94974AdACb82FC56BCf136B07943e152055/')
    cy.get('#add-liquidity-input-tokena .token-symbol-container').should('contain.text', 'MOVR')
    cy.visit('/add/0x4545E94974AdACb82FC56BCf136B07943e152055')
    cy.get('#add-liquidity-input-tokena .token-symbol-container').should('contain.text', 'ZRG')
  })

})
