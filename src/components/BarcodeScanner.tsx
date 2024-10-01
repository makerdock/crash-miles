'use client'

import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { generateZKProof, verifyZKProof } from '@/lib/zkProofs'
import { contractInteraction } from '@/lib/contractInteraction'
import { getBoardingPassData } from '@/lib/boardingPassApi'
import QRCodeScanner from './QRCodeScanner'
import { ToastAction } from '@radix-ui/react-toast'
import Link from 'next/link'
// import { addProof, addTrip } from '../lib/contractInteraction'
// import { generateZKProof, verifyZKProof } from '../lib/zkProofs'

export default function BoardingPassScanner() {
    const [scannedData, setScannedData] = useState<string>(`M1ASKREN/TEST         EA272SL ORDNRTUA 0881 007F002K0303 15C>3180 M6007BUA              2901624760758980 UA UA EY975897            *30600    09  UAG    ^160MEUCIQC1k/QcCEoSFjSivLo3RWiD3268l+OLdrFMTbTyMLRSbAIgb4JVCsWKx/h5HP7+sApYU6nwvM/70IKyUrX28SC+b94=`)
    const { toast } = useToast()

    useEffect(() => {
        contractInteraction.connect()
    }, [])

    const handleScan = async () => {
        if (!scannedData) {
            toast({
                title: "Empty Input",
                description: "Please enter boarding pass data.",
                variant: "destructive",
            })
            return
        }

        try {
            const boardingPassData = await getBoardingPassData(scannedData)
            const { proof, publicSignals } = await generateZKProof(boardingPassData.data.passengerName)
            const isVerified = await verifyZKProof(proof, publicSignals)

            if (!isVerified) {
                toast({
                    title: "Verification Failed",
                    description: "Unable to verify the boarding pass data.",
                    variant: "destructive",
                })
                return;
            }
            const proofHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify(proof)))
            const signalHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify(publicSignals)))

            const provider = new ethers.providers.Web3Provider((window as any).ethereum)
            const signer = provider.getSigner()
            const userAddress = await signer.getAddress()

            const isUserRegistered = await contractInteraction.isUserRegistered(userAddress)

            if (!isUserRegistered) {
                await contractInteraction.addProof(
                    // signer,
                    userAddress, proofHash, signalHash
                )
            }

            const hash = await contractInteraction.addTrip(
                userAddress,
                Date.now(),
                Date.now() + 3600000,
                100,
                boardingPassData.data.legs[0].departureAirport,
                boardingPassData.data.legs[0].arrivalAirport,
                "ABC123"
            )

            toast({
                title: "Success",
                description: "Trip added successfully",
                action: (
                    <Link target='_blank' href={`https://sepolia.basescan.org/tx/${hash}`}>
                        <ToastAction altText='Check it on etherscan'>
                            <Button>Check it on Etherscan</Button>
                        </ToastAction>
                    </Link>
                ),
            })
        } catch (error) {
            console.error('Error processing boarding pass:', error)
            toast({
                title: "Error",
                description: "Failed to process boarding pass. Please try again.",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="space-y-4 mt-4">
            <div className="space-y-2">
                <Label htmlFor="boardingPass">Boarding Pass Data</Label>
                <QRCodeScanner onScan={setScannedData} />
                <Input
                    id="boardingPass"
                    placeholder="Enter boarding pass data"
                    value={scannedData}
                    onChange={(e) => setScannedData(e.target.value)}
                />
            </div>
            <Button onClick={handleScan}>Process Boarding Pass</Button>
        </div>
    )
}