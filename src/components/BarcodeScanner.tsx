"use client";
import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { generateZKProof, verifyZKProof } from "@/lib/zkProofs";
import {
  CONTRACT_ADDRESS,
  contractInteraction,
} from "@/lib/contractInteraction";
import {
  BoardingPassResponse,
  getBoardingPassData,
} from "@/lib/boardingPassApi";
import QRCodeScanner from "./QRCodeScanner";
import { ToastAction } from "@radix-ui/react-toast";
import Link from "next/link";
import { useAccount, usePublicClient, useReadContract } from "wagmi";
import Image from "next/image";
import { CONTRACT_ABI } from "@/lib/contractABI";
import { LifecycleStatus } from "@coinbase/onchainkit/transaction";
import {
  Abi,
  encodeAbiParameters,
  encodePacked,
  keccak256,
  parseAbiParameters,
} from "viem";
import { writeContract } from "wagmi/actions";
import WalletConnection from "./WalletConnection";
import { Avatar } from "@coinbase/onchainkit/identity";
import { RxAvatar } from "react-icons/rx";
import { useWagmiConfig } from "@/lib/wagmi";

export default function BoardingPassScanner() {
  const config = useWagmiConfig();

  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient();
  const {
    data: isUserRegistered,
    refetch,
    isLoading: isUserVerifying,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "isUserRegistered",
    args: [userAddress as any],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hashes, setHashes] = useState({
    proofHash: "",
    signalHash: "",
  });
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedData, setScannedData] = useState<string>(
    `M1ASKREN/TEST         EA272SL ORDNRTUA 0881 007F002K0303 15C>3180 M6007BUA              2901624760758980 UA UA EY975897            *30600    09  UAG    ^160MEUCIQC1k/QcCEoSFjSivLo3RWiD3268l+OLdrFMTbTyMLRSbAIgb4JVCsWKx/h5HP7+sApYU6nwvM/70IKyUrX28SC+b94=`
  );
  const { toast } = useToast();

  useEffect(() => {
    contractInteraction.connect();
  }, []);

  const generateProofs = async () => {
    if (!scannedData) {
      toast({
        title: "Empty Input",
        description: "Please enter boarding pass data.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
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

      setHashes((prev) => ({ ...prev, proofHash, signalHash }));
      setIsLoading(false);
      return boardingPassData;
    } catch (error) {
      console.error("Error processing boarding pass:", error);
      toast({
        title: "Error",
        description: "Failed to process boarding pass. Please try again.",
        variant: "destructive",
      });
      setHashes({
        proofHash: "",
        signalHash: "",
      });
      setIsLoading(false);
    }
  };

  const handleAddTrip = async (lifeCycleRes: LifecycleStatus) => {
    setIsLoading(true);
    try {
      if (lifeCycleRes.statusName === "success") {
        const txnReceipt = lifeCycleRes.statusData.transactionReceipts[0];
        const txn = txnReceipt.transactionHash;

        toast({
          title: "Success",
          description: "Trip added successfully",
          action: (
            <Link
              target="_blank"
              href={`https://sepolia.basescan.org/tx/${txn}`}
            >
              <ToastAction altText="Check it on etherscan">
                <Button>Check it on Etherscan</Button>
              </ToastAction>
            </Link>
          ),
        });
        setHashes({
          proofHash: "",
          signalHash: "",
        });
        setIsLoading(false);
        setIsScannerOpen(false);
        setScannedData("")
      } else if (lifeCycleRes.statusName === "error") {
        toast({
          title: "Error",
          description: "Failed to Add Trip.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error processing boarding pass:", error);
      toast({
        title: "Error",
        description: "Failed to Add Trip.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const walletFormat = (address: string, chars = 4) => {
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  };

  const handleAddProof = useCallback((status: LifecycleStatus) => {
    console.log("LifecycleStatus", status);
    if (status.statusName === "success") {
      toast({ title: "Proof added successfully ✅" });
      refetch();
    }
  }, []);

  return (
    <main className="mx-auto font-sans">
      {isScannerOpen ? (
        <QRCodeScanner
          getPassData={generateProofs}
          isLoading={isLoading}
          handleAddProof={handleAddProof}
          isUserRegistered={isUserRegistered as boolean}
          handleAddTrip={handleAddTrip}
          onScan={setScannedData}
          onClose={() => setIsScannerOpen(false)}
          proofHash={hashes.proofHash}
          signalHash={hashes.signalHash}
        />
      ) : (
        <div className="bg-light-gray text-white min-h-screen max-w-md w-full overflow-hidden mx-auto">
          <div className="bg-dark-blue">
            <div className="bg-primary-blue rounded-br-[100px] overflow-hidden pt-16 px-7 pb-14">
              <div className="flex items-center mb-7 ">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-3">
                  <Avatar
                    address={userAddress}
                    defaultComponent={
                      <RxAvatar className="text-blue-600 h-10 w-10 mx-auto my-auto" />
                    }
                    className="h-10 w-10 text-blue-600"
                  />
                </div>
                <div>
                  {/* <div className=" text-white text-[22px] font-semibold">
                    passenger.eth
                  </div>
                  <div className="text-white text-[22px] font-semibold">
                    {userAddress && walletFormat(userAddress)}
                  </div> */}
                  <WalletConnection />
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
