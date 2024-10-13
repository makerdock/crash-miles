import { create } from 'zustand'

interface WalletPopupState {
    isOpen: boolean
    setOpen: (isOpen: boolean) => void
}

const useWalletPopupStore = create<WalletPopupState>((set) => ({
    isOpen: false,
    setOpen: (isOpen) => set({ isOpen }),
}))

export default useWalletPopupStore