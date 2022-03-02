describe('Swap', () => {
    beforeEach(() => {
      cy.visit('/swap')
      cy.select_moons()
    })
  
    it('Starts with an ETH/Empty swap and quotes it', () => {
      cy.get('#swap-currency-input .token-amount-input').should('have.value', '')
      cy.get('#swap-currency-input .token-symbol-container').should('contain.text', 'DEV')
      cy.get('#swap-currency-output .token-symbol-container').should('contain.text', 'token')
    })
  
    it('can enter an amount into input', () => {
      cy.get('#swap-currency-input .token-amount-input')
        .clear()
        .type('0.001', { delay: 200 })
        .should('have.value', '0.001')
    })
  
    it('Zero swap amount', () => {
      cy.get('#swap-currency-input .token-amount-input').clear().type('0.0', { delay: 200 }).should('have.value', '0.00')
    })
  
    it('Invalid swap amount', () => {
      cy.get('#swap-currency-input .token-amount-input').clear().type('\\', { delay: 200 }).should('have.value', '')
    })
  
    it('Can enter an amount into output', () => {
      cy.get('#swap-currency-output .token-amount-input').type('0.001', { delay: 200 }).should('have.value', '0.001')
    })
  
    it('Zero output amount', () => {
      cy.get('#swap-currency-output .token-amount-input').type('0.0', { delay: 200 }).should('have.value', '0.00')
    })
  
    it.skip('Can swap DEV for MERC', () => {
      cy.get('#swap-currency-output .open-currency-select-button').click()
      cy.get('.token-item-0x37822de108AFFdd5cDCFDaAa2E32756Da284DB85').should('be.visible')
      cy.get('.token-item-0x37822de108AFFdd5cDCFDaAa2E32756Da284DB85').click({ force: true })
      cy.get('#swap-currency-input .token-amount-input').should('be.visible')
      cy.get('#swap-currency-input .token-amount-input').type('0.001', { force: true, delay: 200 })
      cy.get('#swap-currency-output .token-amount-input').should('not.equal', '')
    })
  
    it.skip('Add a recipient does not exist unless in expert mode', () => {
      cy.get('#add-recipient-button').should('not.exist')
    })
  
    describe('Expert mode', () => {
      beforeEach(() => {
        cy.window().then((win) => {
          cy.stub(win, 'prompt').returns('confirm')
        })
        cy.get('#open-settings-dialog-button').click()
        cy.get('#toggle-expert-mode-button').click()
        cy.get('#confirm-expert-mode').click()
      })
  
      it.skip('Add a recipient is visible', () => {
        cy.get('#add-recipient-button').should('be.visible')
      })
  
      it.skip('Add a recipient', () => {
        cy.get('#add-recipient-button').click()
        cy.get('#recipient').should('exist')
      })
  
      it.skip('Remove recipient', () => {
        cy.get('#add-recipient-button').click()
        cy.get('#remove-recipient-button').click()
        cy.get('#recipient').should('not.exist')
      })
    })
  })
  