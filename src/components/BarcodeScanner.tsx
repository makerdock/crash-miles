'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { generateZKProof, verifyZKProof } from '@/lib/zkProofs'
import { contractInteraction } from '@/lib/contractInteraction'
import { getBoardingPassData } from '@/lib/boardingPassApi'
import QRCodeScanner from './QRCodeScanner'
// import { addProof, addTrip } from '../lib/contractInteraction'
// import { generateZKProof, verifyZKProof } from '../lib/zkProofs'

export default function BoardingPassScanner() {
    const [scannedData, setScannedData] = useState<string>('')
    const { toast } = useToast()

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

            if (isVerified) {
                const proofHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify(proof)))
                const signalHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify(publicSignals)))

                const provider = new ethers.providers.Web3Provider((window as any).ethereum)
                const signer = provider.getSigner()
                const userAddress = await signer.getAddress()

                await contractInteraction.addProof(
                    // signer,
                    userAddress, proofHash, signalHash
                )

                await contractInteraction.addTrip(
                    // signer,
                    userAddress,
                    Date.now(),
                    Date.now() + 3600000,
                    100,
                    boardingPassData.data.legs[0].departureAirport,
                    boardingPassData.data.legs[0].arrivalAirport,
                )

                toast({
                    title: "Success",
                    description: "Trip added successfully",
                })
            } else {
                toast({
                    title: "Verification Failed",
                    description: "Unable to verify the boarding pass data.",
                    variant: "destructive",
                })
            }
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
                {/* <Input
                    id="boardingPass"
                    placeholder="Enter boarding pass data"
                    value={scannedData}
                    onChange={(e) => setScannedData(e.target.value)}
                /> */}
            </div>
            <Button onClick={handleScan}>Process Boarding Pass</Button>
        </div>
    )
}