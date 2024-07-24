'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface Props {
    onConnected: () => void
}

export default function WalletConnection({ onConnected }: Props) {
    const [address, setAddress] = useState<string | null>(null)
    const { toast } = useToast()

    const connectWallet = async () => {
        if (typeof (window as any).ethereum !== 'undefined') {
            try {
                await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
                const provider = new ethers.providers.Web3Provider((window as any).ethereum)
                const signer = provider.getSigner()
                const address = await signer.getAddress()
                setAddress(address)
                onConnected()
                toast({
                    title: "Wallet Connected",
                    description: `Connected to ${address}`,
                })
            } catch (err) {
                console.error('Failed to connect wallet:', err)
                toast({
                    title: "Connection Failed",
                    description: "Failed to connect wallet. Please try again.",
                    variant: "destructive",
                })
            }
        } else {
            toast({
                title: "MetaMask Required",
                description: "Please install MetaMask to use this app.",
                variant: "destructive",
            })
        }
    }

    return (
        <div>
            {address ? (
                <p className="text-sm text-muted-foreground">Connected: {address}</p>
            ) : (
                <Button onClick={connectWallet}>Connect Wallet</Button>
            )}
        </div>
    )
}