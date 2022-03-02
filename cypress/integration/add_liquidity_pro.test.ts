

describe('Add Liquidity with Pylon mode', () => {
  beforeEach(() => {
    cy.select_moons()
  })


  it('Loads the two correct tokens', () => {
    cy.visit('#/add-pro/ETH/0x37822de108AFFdd5cDCFDaAa2E32756Da284DB85/')
    cy.get('#add-liquidity-input-tokena .token-symbol-container').should('contain.text', 'DEV')
    cy.get('#add-liquidity-input-tokenb_bal .token-symbol-container').should('contain.text', 'MERC')
  })

  it('Does not crash if ETH is duplicated', () => {
    cy.visit('#/add-pro/ETH/ETH/')
    cy.get('#add-liquidity-input-tokena .token-symbol-container').should('contain.text', 'DEV')
    cy.get('#add-liquidity-input-tokenb_bal .token-symbol-container').should('not.contain.text', 'DEV')
  })

  it('Single token can be selected', () => {
    cy.visit('#/add-pro/ETH/0x37822de108AFFdd5cDCFDaAa2E32756Da284DB85/')
    cy.get('#add-liquidity-input-tokena .token-symbol-container').should('contain.text', 'DEV')
    cy.visit('/add-pro/0x37822de108AFFdd5cDCFDaAa2E32756Da284DB85')
    cy.get('#add-liquidity-input-tokena .token-symbol-container').should('contain.text', 'MERC')
  })

  it('Pylon status renders correctly', () => {
    cy.visit('#/add-pro/ETH/0x37822de108AFFdd5cDCFDaAa2E32756Da284DB85/')
    cy.get('#pylon-check').should('contain.text', 'Pylon')
  })

})
