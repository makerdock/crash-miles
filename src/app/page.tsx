'use client'

import BoardingPassScanner from '@/components/BarcodeScanner'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import WalletConnection from '@/components/WalletConnection'
import { useState } from 'react'
import { useAccount } from 'wagmi'

export default function Home() {
  const [isConnected, setIsConnected] = useState(false)
const {address} = useAccount()
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Air Miles Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <WalletConnection onConnected={() => setIsConnected(true)} />
          {address && <BoardingPassScanner />}
        </CardContent>
      </Card>
    </main>
  )
}