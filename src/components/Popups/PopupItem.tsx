import React, { useCallback, useEffect, useState } from 'react'
import { X } from 'react-feather'
import { useSpring } from 'react-spring/web'
import styled, { useTheme } from 'styled-components'
import { animated } from 'react-spring'
import { PopupContent } from '../../state/application/actions'
import { useRemovePopup } from '../../state/application/hooks'
import ListUpdatePopup from './ListUpdatePopup'
import TransactionPopup from './TransactionPopup'

export const StyledClose = styled(X)`
  position: absolute;
  right: 10px;
  top: 10px;

  :hover {
    cursor: pointer;
  }
`
export const Popup = styled.div`
  display: inline-block;
  width: 100%;
  padding: 1em;
  background-color: ${({ theme }) => theme.bg1};
  position: relative;
  border-radius: 10px;
  padding: 20px;
  padding-right: 35px;
  overflow: hidden;
  border: 1px solid #000000;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    min-width: 290px;
  `}
`
const Fader = styled.div`
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 100%;
  height: 2px;
`

const AnimatedFader = animated(Fader)

export default function PopupItem({
  removeAfterMs,
  content,
  popKey
}: {
  removeAfterMs: number | null
  content: PopupContent
  popKey: string
}) {
  const removePopup = useRemovePopup()
  const removeThisPopup = useCallback(() => removePopup(popKey), [popKey, removePopup])
  useEffect(() => {
    if (removeAfterMs === null) return undefined

    const timeout = setTimeout(() => {
      removeThisPopup()
    }, removeAfterMs)

    return () => {
      clearTimeout(timeout)
    }
  }, [removeAfterMs, removeThisPopup])

  const theme = useTheme()

  let popupContent
  if ('txn' in content) {
    const {
      txn: { hash, success, summary }
    } = content
    popupContent = <TransactionPopup hash={hash} success={success} summary={summary} />
  } else if ('listUpdate' in content) {
    const {
      listUpdate: { listUrl, oldList, newList, auto }
    } = content
    popupContent = <ListUpdatePopup popKey={popKey} listUrl={listUrl} oldList={oldList} newList={newList} auto={auto} />
  }

  const faderStyle = useSpring({
    from: { width: '100%' },
    to: { width: '0%' },
    config: { duration: removeAfterMs ?? undefined }
  })
  const [successfulTx, setSuccessfulTx] = useState(false)
  useEffect(() => {
    if('txn' in content) {
      const {
        txn: { success }
      } = content
      setSuccessfulTx(success)
    }
  }, [content])

  return (
    <Popup style={{background: theme.darkMode ? successfulTx ? 'rgba(92, 179, 118, 0.05)' : 'rgba(230, 112, 102, 0.05)' :
    successfulTx ? 'rgba(40, 116, 56, 0.05)' : 'rgba(211, 53, 53, 0.05)',
    border: `1px solid ${theme.darkMode ? successfulTx ? 'rgba(92, 179, 118, 0.1)' : 'rgba(230, 112, 102, 0.1)' : 
    successfulTx ? 'rgba(40, 116, 56, 0.1)' : 'rgba(211, 53, 53, 0.1)' }`}}>
      <StyledClose color={theme.text2} onClick={removeThisPopup} />
      {popupContent}
      {removeAfterMs !== null ? <AnimatedFader style={{...faderStyle, backgroundColor: theme.darkMode ? successfulTx ? '#5CB376' : '#E67066' : 
      successfulTx ? '#287438' : '#D33535'}} /> : null}
    </Popup>
  )
}
