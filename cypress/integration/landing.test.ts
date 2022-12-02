// import { TEST_ADDRESS_NEVER_USE_SHORTENED } from '../support/commands'

describe('Landing Page', () => {
    beforeEach(() => cy.visit('/'))

    it('Allows navigation to pool', () => {
      cy.get('#pool-nav-link', { timeout: 10000 }).should('be.visible').click()
      cy.url().should('include', '/pool')
    })
  
    it('Redirects to url /swap', () => {
      cy.url().should('include', '/swap')
    })
  
    
  })
  