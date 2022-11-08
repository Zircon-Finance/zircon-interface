describe('Swap', () => {
    beforeEach(() => {
      cy.visit('#/swap')
    })
  
    it('Starts with an ETH/Empty swap and quotes it', () => {
      cy.get('#swap-currency-input .token-amount-input').should('have.value', '')
      cy.get('#swap-currency-input .token-symbol-container').should('contain.text', 'MOVR')
      cy.get('#swap-currency-output .token-symbol-container').should('contain.text', 'token')
    })

    it('Can swap MOVR for token', () => {
      cy.select_moons()
      cy.visit('#/swap')
      cy.get('#swap-currency-output .token-symbol-container').should('contain.text', 'token').click()
      cy.get('.token-item-0x3D2D044E8C6dAd46b4F7896418d3d4DFaAD902bE').click({ force: true })
      cy.get('#swap-currency-input .token-amount-input').should('be.visible')
      cy.get('#swap-currency-input .token-amount-input').type('0.001', { force: true, delay: 200 })
      cy.get('#swap-currency-output .token-amount-input').should('not.equal', '')
    })
  
    it('can enter an amount into input', () => {
      cy.get('#swap-currency-input .token-amount-input', { timeout: 10000 }).should('be.visible')
        .clear()
        .type('0.001', { delay: 200 })
        .should('have.value', '0.001')
    })
  
    it('Zero swap amount', () => {
      cy.get('#swap-currency-input .token-amount-input', { timeout: 10000 }).clear().type('0.0', { force: true,delay: 200 }).should('have.value', '0.0')
    })
  
    it('Invalid swap amount', () => {
      cy.get('#swap-currency-input .token-amount-input', { timeout: 10000 }).clear().type('\\', { force: true,delay: 200 }).should('have.value', '')
    })
  
    it('Can enter an amount into output', () => {
      cy.get('#swap-currency-output .token-amount-input', { timeout: 10000 }).type('0.001', { force: true,delay: 200 }).should('have.value', '0.001')
    })
  
    it('Zero output amount', () => {
      cy.get('#swap-currency-output .token-amount-input', { timeout: 10000 }).type('0.0', { force: true,delay: 200 }).should('have.value', '0.0')
    })
  
    it('Add a recipient does not exist unless in expert mode', () => {
      cy.get('#add-recipient-button').should('not.exist')
    })
  
    describe('Expert mode', () => {
      beforeEach(() => {
        cy.visit('/swap')
        cy.window().then((win) => {
            cy.stub(win, 'prompt').returns('confirm')
          })
        cy.get('#open-settings-dialog-button').click()
        cy.get('#toggle-expert-mode-button').click()
        cy.get('#confirm-expert-mode').click()
        
      })
  
      it('Add a recipient is visible', () => {
        cy.get('#add-recipient-button', { timeout: 10000 }).should('be.visible')
      })
  
      it('Add a recipient', () => {
        cy.get('#add-recipient-button', { timeout: 10000 }).click()
        cy.get('#recipient').should('exist')
      })
  
      it('Remove recipient', () => {
        cy.get('#add-recipient-button', { timeout: 10000 }).click()
        cy.get('#remove-recipient-button').click()
        cy.get('#recipient').should('not.exist')
      })
    })
  })
  