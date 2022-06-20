import React from 'react'
import { Flex, Modal } from '@pancakeswap/uikit'
import { useTranslation } from 'react-i18next'

import { ButtonOutlined, } from '../../components/Button'
import { Link, Text } from 'rebass'
import { Token } from 'zircon-sdk'
import { useTheme } from 'styled-components'
import Balance from '../Balance'



interface ClaimModalProps {
  onConfirm?: (amount: string, token: Token) => void
  onDismiss?: () => void
  addLiquidityUrl?: string
  token?: Token
}

const ClaimModal: React.FC<ClaimModalProps> = ({
  onConfirm,
  onDismiss,
  addLiquidityUrl,
  token,
}) => {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <Modal style={{position: 'absolute', width: 'auto', maxWidth: '360px'}} title={t('Claim tokens')} onDismiss={onDismiss}>
      <Balance
              fontSize="45px"
              color={theme.text1}
              decimals={2}
              value={100}
              unit={` `}
              prefix=" "
              textAlign={'center'}
      />
      <Text fontSize={'16px'} color={theme.text1} textAlign={'center'}
      style={{paddingBottom: '20px', borderBottom:`1px solid ${theme.whiteHalf}`}}>
        {t('TotalClaimable ZPT')}</Text>
        <Text my={'20px'} fontSize={'13px'} color={theme.text1} textAlign={'center'}>{'ZPT token is launched by Zircon Finance.'}</Text>
        <Text mb={'20px'} fontSize={'13px'} color={theme.text1} textAlign={'center'}>{'Read more about token distribution here.'}</Text>
      <ButtonOutlined style={{ alignSelf: 'center', background: theme.poolPinkButton, width: '100%', marginTop: '20px' }}>
        <Link style={{textDecoration: 'none', color: '#fff'}} 
        href={addLiquidityUrl}>{'Claim for all pools'}</Link>
      </ButtonOutlined>
      <Flex mb="15px" alignItems="center" justifyContent="space-around">
      </Flex>
    </Modal>
  )
}

export default ClaimModal
