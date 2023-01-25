import { createReducer, nanoid } from '@reduxjs/toolkit'
import {
    addPopup,
    PopupContent,
    removePopup,
    toggleWalletModal,
    toggleSettingsMenu,
    toggleTransactionsMenu,
    updateBlockNumber
} from './actions'

type PopupList = Array<{ key: string; show: boolean; content: PopupContent; removeAfterMs: number | null }>

export interface ApplicationState {
  blockNumber: { [chainId: number]: number }
    timestamp: { [chainId: number]: number }
  popupList: PopupList
  walletModalOpen: boolean
  settingsMenuOpen: boolean
  transactionsMenuOpen: boolean
}

const initialState: ApplicationState = {
  blockNumber: {},
  timestamp: {},
  popupList: [],
  walletModalOpen: false,
  settingsMenuOpen: false,
  transactionsMenuOpen: false
}

export default createReducer(initialState, builder =>
  builder
      .addCase(updateBlockNumber, (state, action) => {
      const { chainId, blockNumber, timestamp } = action.payload
      if (typeof state.blockNumber[chainId] !== 'number') {
        state.blockNumber[chainId] = blockNumber
      } else {
        state.blockNumber[chainId] = Math.max(blockNumber, state.blockNumber[chainId])
      }
      if (typeof state.timestamp[chainId] !== 'number') {
          state.timestamp[chainId] = timestamp
      } else {
          state.timestamp[chainId] = Math.max(timestamp, state.timestamp[chainId])
      }
    })
    .addCase(toggleWalletModal, state => {
      state.walletModalOpen = !state.walletModalOpen
    })
    .addCase(toggleSettingsMenu, state => {
      state.settingsMenuOpen = !state.settingsMenuOpen
    })
    .addCase(toggleTransactionsMenu, state => {
      state.transactionsMenuOpen = !state.transactionsMenuOpen
    })
    .addCase(addPopup, (state, { payload: { content, key, removeAfterMs = 15000 } }) => {
      state.popupList = (key ? state.popupList.filter(popup => popup.key !== key) : state.popupList).concat([
        {
          key: key || nanoid(),
          show: true,
          content,
          removeAfterMs
        }
      ])
    })
    .addCase(removePopup, (state, { payload: { key } }) => {
      state.popupList.forEach(p => {
        if (p.key === key) {
          p.show = false
        }
      })
    })
)
