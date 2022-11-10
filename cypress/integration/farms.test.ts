describe('Farms', () => {
    beforeEach(() => {
        cy.visit('/farm')
    })
    it('Should display farms', () => {
      cy.get('#farms-table', { timeout: 20000 }).contains('td', 'Float').should('be.visible');
      cy.get('#farms-table', { timeout: 20000 }).contains('td', 'Stable').should('be.visible');
    })
  
    it('Should open farms when clicked', () => {
        cy.get('#farms-table', { timeout: 20000 }).contains('td', 'Float').should('be.visible').click({ force: true });
        cy.get('#farms-table', { timeout: 20000 }).contains('a', 'View contract').should('be.visible');
    })

    it('Filters should work correctly', () => {
        cy.get('#all-select-tab').should('have.class', 'ACTIVE')
        cy.get('#anchor-select-tab', { timeout: 20000 }).should('be.visible').click().should('have.class', 'ACTIVE')
        cy.get('#all-select-tab', { timeout: 20000 }).should('not.have.class', 'ACTIVE')
        cy.get('#float-select-tab', { timeout: 20000 }).should('be.visible').click().should('have.class', 'ACTIVE')
        cy.get('#anchor-select-tab', { timeout: 20000 }).should('not.have.class', 'ACTIVE')
    })

    it('Staked only filter works', () => {
        cy.get('#staked-only-farms', { timeout: 20000 }).click();
        cy.get('#staked-only-farms', { timeout: 20000 }).should('be.checked');
    })

    it('Must display finished farms ', () => {
        cy.get('#live-farms-select').should('have.class', 'ACTIVE')
        cy.get('#finished-farms-select').should('be.visible').click().should('have.class', 'ACTIVE')
        cy.get('#farms-table').contains('td', 'Float').should('be.visible');
    })
  })