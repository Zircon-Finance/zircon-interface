import { gql } from 'graphql-request'

export const getDerivedPrices = (tokenAddress: string, blocks: any) =>
  blocks.map(
    (block: any) => `
    t${block.timestamp}:token(id:"${tokenAddress}", block: { number: ${block.number} }) { 
        derivedBNB
      }
    `,
  )

export const getDerivedPricesQueryConstructor = (subqueries: string[]) => {
  return gql`
      query derivedTokenPriceData {
        ${subqueries}
      }
    `
}
