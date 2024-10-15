"use client";
import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { generateZKProof, verifyZKProof } from "@/lib/zkProofs";
import { CONTRACT_ADDRESS } from "@/lib/contractInteraction";
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
import WalletConnection from "./WalletConnection";
import { Avatar } from "@coinbase/onchainkit/identity";
import { RxAvatar } from "react-icons/rx";
import { useWagmiConfig } from "@/lib/wagmi";
import { addTrip, TripResponse } from "@/lib/db";
import useGetTrips from "@/hooks/useGetTrips";

export default function BoardingPassScanner() {
  const { address: userAddress } = useAccount();
  const { data: isUserRegistered, refetch } = useReadContract({
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
  const [boardingPassData, setBoardingPassData] = useState<
    BoardingPassResponse | undefined
  >({
    data: {
      passengerName: "BHIMTE/UTKARSH",
      passengerFirstName: "UTKARSH",
      passengerLastName: "BHIMTE",
      legs: [
        {
          operatingCarrierPNR: "EDUTVE",
          departureAirport: "BOM",
          arrivalAirport: "BLR",
          operatingCarrierDesignator: "QP",
          flightNumber: "1367",
          flightDate: "2066-09-10",
          compartmentCode: "Y",
          seatNumber: "005D",
          checkInSequenceNumber: "0100",
          passengerStatus: "1",
          airlineNumericCode: "516",
          serialNumber: "0000000000",
          selecteeIndicator: "null",
          internationalDocumentationVerification: "0",
          marketingCarrierDesignator: "null",
          frequentFlyerAirlineDesignator: "null",
          frequentFlyerNumber: "null",
          idIndicator: null,
          freeBaggageAllowance: null,
          fastTrack: null,
          airlineInfo: "null",
        },
      ],
    },
    meta: {
      formatCode: "M",
      numberOfLegs: 1,
      electronicTicketIndicator: "null",
      versionNumberIndicator: ">",
      versionNumber: 1,
      securityDataIndicator: "null",
    },
  });
  const [scannedData, setScannedData] = useState<string>(
    `M1ASKREN/TEST         EA272SL ORDNRTUA 0881 007F002K0303 15C>3180 M6007BUA              2901624760758980 UA UA EY975897            *30600    09  UAG    ^160MEUCIQC1k/QcCEoSFjSivLo3RWiD3268l+OLdrFMTbTyMLRSbAIgb4JVCsWKx/h5HP7+sApYU6nwvM/70IKyUrX28SC+b94=`
  );
  const [txnHash, setTxnHash] = useState<string>("");

  const { toast } = useToast();

  const userTrips = useGetTrips();
  console.log(userTrips?.data);

  // gets the boarding pass data and verify it and returns proof hashes
  const handleVerification = async () => {
    console.log("calling generate proofs");

    if (!scannedData) {
      toast({
        title: "Boarding pass not scanned",
        description: "Please scan the boarding pass correctly.",
        variant: "destructive",
      });
      return;
    }
    if (boardingPassData || (hashes.proofHash && hashes.signalHash)) return;
    setIsLoading(true);
    try {
      const boardingPassData = await getBoardingPassData(scannedData);
      setBoardingPassData(boardingPassData);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTrip = async (lifeCycleRes: LifecycleStatus) => {
    if (txnHash || !boardingPassData) return;
    setIsLoading(true);
    try {
      if (lifeCycleRes.statusName === "success") {
        const txnReceipt = lifeCycleRes.statusData.transactionReceipts[0];
        const txn = txnReceipt.transactionHash;
        setTxnHash(txn);
        const trip = {
          arrivalAirport: boardingPassData?.data.legs[0].arrivalAirport,
          departureAirport: boardingPassData?.data.legs[0].departureAirport,
          flightNumber: boardingPassData?.data.legs[0].flightNumber,
          miles: 100,
          userAddress: userAddress as `0x${string}`,
          date: boardingPassData?.data.legs[0].flightDate,
        };
        const newTripId = await addTrip(trip);
        console.log("trip added successfully with id : ", newTripId);

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
        setIsLoading(false);
      } else if (lifeCycleRes.statusName === "error") {
        toast({
          title: "Error",
          description: lifeCycleRes.statusData.message,
          variant: "destructive",
        });
        // handleReset();
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error processing boarding pass:", error);
      toast({
        title: "Error",
        description: "Failed to Add Trip.",
        variant: "destructive",
      });
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProof = useCallback((status: LifecycleStatus) => {
    if (isUserRegistered) return;
    if (status.statusName === "success") {
      toast({ title: "Proof added successfully ✅" });
      refetch();
    } else if (status.statusName === "error") {
      toast({
        title: "Error",
        description: "Failed to Add Proof." + status.statusData.message,
        variant: "destructive",
      });
    }
  }, []);

  const handleClose = () => {
    setIsScannerOpen(false);
    setScannedData("");
    setHashes({
      proofHash: "",
      signalHash: "",
    });
    setBoardingPassData(undefined);
    setTxnHash("");
    setIsLoading(false);
  };

  // generating proof hashes everytime a boarding pass is scanned
  useEffect(() => {
    if (
      scannedData &&
      !boardingPassData &&
      !hashes.proofHash &&
      !hashes.signalHash &&
      !isLoading
    ) {
      handleVerification();
    }
  }, [scannedData]);

  // resetting the scanned pass to default
  const handleReset = () => {
    setBoardingPassData(undefined);
    setScannedData("");
    setIsLoading(false);
  };

  return (
    <main className="mx-auto w-full font-sans">
      {isScannerOpen ? (
        <QRCodeScanner
          txnHash={txnHash}
          handleReset={handleReset}
          boardingPassData={boardingPassData}
          isLoading={isLoading}
          handleAddProof={handleAddProof}
          isUserRegistered={isUserRegistered as boolean}
          handleAddTrip={handleAddTrip}
          onScan={setScannedData}
          onClose={handleClose}
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
              <div className="flex justify-between items-start flex-col gap- ">
                <div className=" text-white text-xl md:text-[40px] italic font-[900]">
                  HIGHMILES <br />
                  EARNED
                </div>
                <div className="text-white text-[60px] md:text-[95px] italic font-[900]">
                  31,683
                </div>
              </div>
            </div>
          </div>
          <div className="bg-dark-blue flex justify-between items-start rounded-br-[100px] overflow-hidden relative p-7">
            <div className="flex flex-col">
              <p className="text-white text-sm md:text-lg font-bold">
                MILLION MILER STATUS
              </p>
              <p className="text-white text-2xl md:text-[55px] italic font-[900]">
                184,216
              </p>
              <p className="text-white text-sm font-medium">All Miles Flown</p>
            </div>
            <Image
              src="/svg/waiting.svg"
              width={180}
              height={180}
              alt="waiting"
              className="absolute right-4 md:w-[180px] md:h-[180px] w-32 h-32"
            />
          </div>
          <div className="bg-light-gray pt-6 px-7 overflow-hidden">
            <button
              className="bg-light-blue p-4 flex items-center w-full justify-between"
              onClick={() => setIsScannerOpen(true)}
            >
              <p className="text-primary-blue text-xl md:text-3xl font-semibold">
                Scan Boarding Pass
              </p>
              <Image src="/svg/stamp.svg" width={60} height={70} alt="Stamp" />
            </button>
            <p className="text-black text-lg font-bold mb-4 mt-9 uppercase">
              Logged Flights
            </p>
            <div className="flex flex-col gap-3 overflow-auto text-black">
              {userTrips?.isLoading ? (
                "Trips Loading..."
              ) : (
                <>
                  {!userTrips ||
                  !userTrips.data ||
                  userTrips.data.length === 0 ? (
                    <>
                      <span className="text-black self-center text-lg font-medium">
                        No Flights Logged Yet!
                      </span>
                      <button
                        className="text-blue-800 font-semibold text-sm underline bg-transparent border-0 focus:border-0 focus:outline-none focus:ring-0"
                        onClick={() => setIsScannerOpen(true)}
                      >
                        Start Scanning
                      </button>
                    </>
                  ) : (
                    userTrips.data.map((trip: TripResponse) => (
                      <FlightCard
                        key={trip.id}
                        from={trip.departureAirport}
                        to={trip.arrivalAirport}
                        flightNumber={trip.flightNumber}
                        date={trip.date}
                        miles={trip.miles.toString()}
                        highMiles={(trip.miles * 0.1).toString()} // Example calculation for highMiles
                      />
                    ))
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
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
      <p className=" text-dark-gray text-lg md:text-2xl font-normal">
        {from} - {to}
      </p>
      <p className=" text-sm md:text-lg  text-dark-gray font-bold">
        {flightNumber}
      </p>
      <p className="text-xs md:text-base text-gray/45 font-normal">{date}</p>
    </div>
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-dark-gray text-sm md:text-lg font-normal">
          {miles} Miles Flown
        </p>
        <p className="text-primary-blue md:text-lg text-sm font-normal">
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
