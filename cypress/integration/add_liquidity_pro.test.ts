describe('Add Liquidity with Pylon mode', () => {
  it('Select tokens', () => {
    cy.select_moons()
  })


  it('Loads the two correct tokens', () => {
    cy.visit('#/add-pro/ETH/0x4545E94974AdACb82FC56BCf136B07943e152055/')
    cy.get('#add-liquidity-input-tokena .token-symbol-container').should('contain.text', 'MOVRFLOAT')
    cy.get('#add-liquidity-input-tokenb_bal .token-symbol-container').should('contain.text', 'ZRGSTABLE')
  })

  it('Does not crash if ETH is duplicated', () => {
    cy.visit('#/add-pro/ETH/ETH/')
    cy.get('#add-liquidity-input-tokena .token-symbol-container').should('contain.text', 'MOVRFLOAT')
    cy.get('#add-liquidity-input-tokenb_bal .token-symbol-container').should('not.contain.text', 'MOVRFLOAT')
  })

  it('Single token can be selected', () => {
    cy.visit('#/add-pro/ETH/0x4545E94974AdACb82FC56BCf136B07943e152055/')
    cy.get('#add-liquidity-input-tokena .token-symbol-container').should('contain.text', 'MOVRFLOAT')
    cy.visit('/add-pro/0x4545E94974AdACb82FC56BCf136B07943e152055')
    cy.get('#add-liquidity-input-tokena .token-symbol-container').should('contain.text', 'ZRGFLOAT')
  })

  it('Pylon status renders correctly', () => {
    cy.visit('#/add-pro/ETH/0x4545E94974AdACb82FC56BCf136B07943e152055/')
    cy.get('#swap-and-add', { timeout: 10000 }).should('be.visible').should('contain.text', 'SWAP AND ADD')
  })

})
