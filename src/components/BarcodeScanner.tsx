"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { generateZKProof, verifyZKProof } from "@/lib/zkProofs";
import { contractInteraction } from "@/lib/contractInteraction";
import { getBoardingPassData } from "@/lib/boardingPassApi";
import QRCodeScanner from "./QRCodeScanner";
import { ToastAction } from "@radix-ui/react-toast";
import Link from "next/link";
import { coinbasesdk } from "@/config/configs";
import { useAccount } from "wagmi";
import Image from "next/image";
// import { addProof, addTrip } from '../lib/contractInteraction'
// import { generateZKProof, verifyZKProof } from '../lib/zkProofs'

export default function BoardingPassScanner() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedData, setScannedData] = useState<string>(
    `M1ASKREN/TEST         EA272SL ORDNRTUA 0881 007F002K0303 15C>3180 M6007BUA              2901624760758980 UA UA EY975897            *30600    09  UAG    ^160MEUCIQC1k/QcCEoSFjSivLo3RWiD3268l+OLdrFMTbTyMLRSbAIgb4JVCsWKx/h5HP7+sApYU6nwvM/70IKyUrX28SC+b94=`
  );
  const { toast } = useToast();
  const { address: userAddress } = useAccount();
  useEffect(() => {
    contractInteraction.connect();
  }, []);

  const handleScan = async () => {
    if (!scannedData) {
      toast({
        title: "Empty Input",
        description: "Please enter boarding pass data.",
        variant: "destructive",
      });
      return;
    }

    try {
      const boardingPassData = await getBoardingPassData(scannedData);
      const { proof, publicSignals } = await generateZKProof(
        boardingPassData.data.passengerName
      );
      const isVerified = await verifyZKProof(proof, publicSignals);

      if (!isVerified) {
        toast({
          title: "Verification Failed",
          description: "Unable to verify the boarding pass data.",
          variant: "destructive",
        });
        return;
      }
      const proofHash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(JSON.stringify(proof))
      );
      const signalHash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(JSON.stringify(publicSignals))
      );

      // const provider = new ethers.providers.Web3Provider((window as any).ethereum)
      //   const provider = coinbasesdk.makeWeb3Provider();
      //   const signer = provider.request({ method: "getSigner" });
      //   const userAddress = await signer.getAddress();

      const isUserRegistered = await contractInteraction.isUserRegistered(
        userAddress as any
      );

      if (!isUserRegistered) {
        await contractInteraction.addProof(
          // signer,
          userAddress as any,
          proofHash,
          signalHash
        );
      }

      const hash = await contractInteraction.addTrip(
        userAddress as any,
        Date.now(),
        Date.now() + 3600000,
        100,
        boardingPassData.data.legs[0].departureAirport,
        boardingPassData.data.legs[0].arrivalAirport,
        "ABC123"
      );

      toast({
        title: "Success",
        description: "Trip added successfully",
        action: (
          <Link
            target="_blank"
            href={`https://sepolia.basescan.org/tx/${hash}`}
          >
            <ToastAction altText="Check it on etherscan">
              <Button>Check it on Etherscan</Button>
            </ToastAction>
          </Link>
        ),
      });
    } catch (error) {
      console.error("Error processing boarding pass:", error);
      toast({
        title: "Error",
        description: "Failed to process boarding pass. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <main className="mx-auto font-sans">
      {isScannerOpen ? (
        <QRCodeScanner
          onScan={setScannedData}
          onClose={() => setIsScannerOpen(false)}
        />
      ) : (
        <div className="bg-light-gray text-white min-h-screen max-w-md w-full overflow-hidden mx-auto">
          <div className="bg-dark-blue">
            <div className="bg-primary-blue rounded-br-[100px] overflow-hidden pt-16 px-7 pb-14">
              <div className="flex items-center mb-7 ">
                <div className="w-12 h-12 bg-white rounded-full mr-3"></div>
                <div>
                  <div className=" text-white text-[22px] font-semibold">
                    passenger.eth
                  </div>
                  <div className="text-white text-[22px] font-semibold">
                    0x325f...5f88
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center ">
                <div className=" text-white text-[40px] italic font-[900]">
                  HIGHMILES <br />
                  EARNED
                </div>
                <div className="text-white text-[95px] italic font-[900]">
                  31,683
                </div>
              </div>
            </div>
          </div>
          <div className="bg-dark-blue flex justify-between items-start rounded-br-[100px] overflow-hidden relative p-7">
            <div className="flex flex-col">
              <p className="text-white text-lg font-bold">
                MILLION MILER STATUS
              </p>
              <p className="text-white text-[55px] italic font-[900]">
                184,216
              </p>
              <p className="text-white text-lg font-medium">All Miles Flown</p>
            </div>
            <Image
              src="/svg/waiting.svg"
              width={180}
              height={180}
              alt="waiting"
              className="absolute right-4"
            />
          </div>
          <div className="bg-light-gray pt-6 px-7 overflow-hidden">
            <button
              className="bg-light-blue p-4 flex items-center w-full justify-between"
              onClick={() => setIsScannerOpen(true)}
            >
              <p className="text-primary-blue text-3xl font-semibold">
                Scan Boarding Pass
              </p>
              <Image src="/svg/stamp.svg" width={60} height={70} alt="Stamp" />
            </button>
            <p className="text-black text-lg font-bold mb-4 mt-9 uppercase">
              Logged Flights
            </p>
            <div className="flex flex-col gap-3 overflow-auto">
              <FlightCard
                from="DTW"
                to="PHL"
                flightNumber="DL1373"
                date="Sep 29, 2024"
                miles="2,219"
                highMiles="400"
              />
              <FlightCard
                from="DTW"
                to="PHL"
                flightNumber="DL1373"
                date="Sep 29, 2024"
                miles="2,219"
                highMiles="400"
              />
              <FlightCard
                from="DTW"
                to="PHL"
                flightNumber="DL1373"
                date="Sep 29, 2024"
                miles="2,219"
                highMiles="400"
              />
            </div>
          </div>
        </div>
      )}
    </main>
    // <div className="space-y-4 mt-4">
    //   <div className="space-y-2">
    //     <Label htmlFor="boardingPass">Boarding Pass Data</Label>
    //     <QRCodeScanner onScan={setScannedData} />
    //     <Input
    //       id="boardingPass"
    //       placeholder="Enter boarding pass data"
    //       value={scannedData}
    //       onChange={(e) => setScannedData(e.target.value)}
    //     />
    //   </div>
    //   <Button onClick={handleScan}>Process Boarding Pass</Button>
    // </div>
  );
}

interface FlightCardProps {
  from: string;
  to: string;
  flightNumber: string;
  date: string;
  miles: string;
  highMiles: string;
}

const FlightCard: React.FC<FlightCardProps> = ({
  from,
  to,
  flightNumber,
  date,
  miles,
  highMiles,
}) => (
  <div className="bg-white rounded-[10px] pt-6 pb-5 pr-4 pl-7 border border-light-blue flex justify-between items-center">
    <div>
      <p className=" text-dark-gray text-2xl font-normal">
        {from} - {to}
      </p>
      <p className="text-lg  text-dark-gray font-bold">{flightNumber}</p>
      <p className="text-base text-gray/45 font-normal">{date}</p>
    </div>
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-dark-gray text-lg font-normal">
          {miles} Miles Flown
        </p>
        <p className="text-primary-blue text-lg font-normal">
          +{highMiles} HighMiles
        </p>
      </div>
      <Image
        src="/svg/arrow-right.svg"
        width={20}
        height={18}
        alt="arrow-right icon"
      />
    </div>
  </div>
);
