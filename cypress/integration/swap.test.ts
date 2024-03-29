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
  
    it('Can enter an amount into input', () => {
      cy.get('#swap-currency-input .token-amount-input', { timeout: 10000 }).should('be.visible')
        .clear( { force: true } )
        .type('0.001', { delay: 300, force: true })
        .should('have.value', '0.001')
    })

    it('Can enter an amount into output', () => {
      cy.get('#swap-currency-output .token-amount-input', { timeout: 10000 }).should('be.visible')
        .clear( { force: true } )
        .type('0.001', { delay: 300, force: true })
        .should('have.value', '0.001')
    })
  
    it('Zero swap amount', () => {
      cy.get('#swap-currency-input .token-amount-input', { timeout: 10000 }).clear( { force: true } ).type('0.0', { force: true,delay: 200 }).should('have.value', '0.0')
    })

    it('Zero output amount', () => {
      cy.get('#swap-currency-output .token-amount-input', { timeout: 10000 }).clear( { force: true } ).type('0.0', { force: true,delay: 200 }).should('have.value', '0.0')
    })
  
    it('Invalid swap amount', () => {
      cy.get('#swap-currency-input .token-amount-input', { timeout: 10000 }).clear( { force: true } ).type('\\', { force: true,delay: 200 }).should('have.value', '')
    })
  
    it('Add a recipient does not exist unless in expert mode', () => {
      cy.get('#add-recipient-button').should('not.exist')
    })
    
    describe('Chosen tokens works correctly', () => {
      it('Can add chosen token correctly', () => {
        cy.get('#favorite-token-0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d', { timeout: 10000 }).should('be.visible').click()
        cy.get('#user-chosen-tokens', { timeout: 10000 }).should('be.visible').should('contain.text', 'USDC')
      })
      it('Can remove chosen token correctly', () => {
        cy.get('#favorite-token-0x4545e94974adacb82fc56bcf136b07943e152055', { timeout: 10000 }).should('be.visible').click()
        cy.get('#user-chosen-tokens', { timeout: 10000 }).should('not.exist')
      })
      it('Multiple tokens displayed correctly', () => {
        cy.get('#favorite-token-0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d', { timeout: 10000 }).should('be.visible').click()
        cy.get('#favorite-token-0x98878b06940ae243284ca214f92bb71a2b032b8a', { timeout: 10000 }).should('be.visible').click()
        cy.get('#user-chosen-tokens', { timeout: 10000 }).should('be.visible').should('contain.text', 'WMOVR')
        cy.get('#user-chosen-tokens', { timeout: 10000 }).should('be.visible').should('contain.text', 'USDC')
      })
    })

  
    // describe('Expert mode', () => {
  
    //   it('Add a recipient is visible', () => {
    //     cy.visit('/swap')
    //     cy.window().then((win) => {
    //         cy.stub(win, 'prompt').returns('confirm')
    //       })
    //     cy.get('#open-settings-dialog-button', { timeout: 10000 }).should('be.visible').click()
    //     cy.get('#toggle-expert-mode-button', { timeout: 10000 }).should('be.visible').click()
    //     cy.get('#confirm-expert-mode', { timeout: 10000 }).should('be.visible').click()
    //     cy.get('#add-recipient-button', { timeout: 10000 }).should('be.visible')
    //   })
  
    //   it('Add a recipient', () => {
    //     cy.get('#add-recipient-button', { timeout: 10000 }).click()
    //     cy.get('#recipient').should('exist')
    //   })
  
    //   it('Remove recipient', () => {
    //     cy.get('#add-recipient-button', { timeout: 10000 }).should('be.visible').click()
    //     cy.get('#remove-recipient-button').click()
    //     cy.get('#recipient').should('not.exist')
    //   })
    // })
  })
  