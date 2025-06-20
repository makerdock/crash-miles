"use client";
import getUserRank, { UserRankResponse } from "@/actions/getUserRank";
import { insertTrip, TripInput } from "@/actions/insertTrip";
import { useToast } from "@/components/ui/use-toast";
import useGetTrips from "@/hooks/useGetTrips";
import { adjustFlightDate } from "@/lib/adjustFlightDate";
import {
  BoardingPassResponse,
  getBoardingPassData,
} from "@/lib/boardingPassApi";
import { CONTRACT_ABI } from "@/lib/contractABI";
import { CONTRACT_ADDRESS } from "@/lib/contractInteraction";
import { formatDate } from "@/lib/formatDate";
import { generateZKProof, verifyZKProof } from "@/lib/zkProofs";
import { LifecycleStatus } from "@coinbase/onchainkit/transaction";
import { Trip } from "@prisma/client";
import { ethers } from "ethers";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { RxAvatar } from "react-icons/rx";
import { useAccount, useReadContract } from "wagmi";
import QRCodeScanner from "./QRCodeScanner";
import WalletConnection from "./WalletConnection";
// @ts-ignore
import { sdk } from "@farcaster/frame-sdk";

// UserProfile component for better organization
interface UserProfileProps {
  farcasterUser: {
    fid?: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  } | null;
}

const UserProfile: React.FC<UserProfileProps> = ({ farcasterUser }) => (
  <div className="flex items-center mb-7">
    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-3 overflow-hidden">
      {farcasterUser?.pfpUrl ? (
        <img
          src={farcasterUser.pfpUrl}
          alt="Profile"
          width={48}
          height={48}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <RxAvatar className="text-blue-600 h-10 w-10 mx-auto my-auto" />
      )}
    </div>
    <div className="flex flex-col">
      <div className="text-white font-semibold text-lg">
        {farcasterUser?.displayName || "User"}
      </div>
      {farcasterUser?.username && (
        <div className="text-blue-100 text-sm">
          @{farcasterUser.username}
        </div>
      )}
    </div>
  </div>
);

export default function BoardingPassScanner() {
  const { address: userAddress } = useAccount();

  const { data: isUserRegistered, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "isUserRegistered",
    args: [userAddress as any],
  });
  const [userRank, setUserRank] = useState<UserRankResponse>();
  const [farcasterUser, setFarcasterUser] = useState<{
    fid?: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [hashes, setHashes] = useState({
    proofHash: "",
    signalHash: "",
  });
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [boardingPassData, setBoardingPassData] = useState<
    BoardingPassResponse | undefined
  >();
  const [scannedData, setScannedData] = useState<string>("");
  const [txnHash, setTxnHash] = useState<string>("");

  // `M1ASKREN/TEST         EA272SL ORDNRTUA 0881 007F002K0303 15C>3180 M6007BUA              2901624760758980 UA UA EY975897            *30600    09  UAG    ^160MEUCIQC1k/QcCEoSFjSivLo3RWiD3268l+OLdrFMTbTyMLRSbAIgb4JVCsWKx/h5HP7+sApYU6nwvM/70IKyUrX28SC+b94=`
  const { toast } = useToast();

  const userTrips = useGetTrips();

  // gets the boarding pass data and verify it and returns proof hashes
  const handleVerification = async () => {

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

        const sanitisedFlightDate = boardingPassData?.data.legs[0].flightDate && adjustFlightDate(boardingPassData?.data.legs[0].flightDate).toISOString();

        const flightNumber = boardingPassData.data.legs[0].operatingCarrierDesignator + boardingPassData.data.legs[0].flightNumber;

        const trip: TripInput = {
          arrivalAirport: boardingPassData?.data.legs[0].arrivalAirport,
          departureAirport: boardingPassData?.data.legs[0].departureAirport,
          flightNumber,
          miles: 100,
          userAddress: userAddress as `0x${string}`,
          date: sanitisedFlightDate,
          pnr: boardingPassData?.data.legs[0].operatingCarrierPNR,
          txnHash: txn,
        };
        const newTripId = await insertTrip(trip);

        // Show success toast with option to share
        toast({
          title: "✅ Trip Added Successfully!",
          description: `Flight ${flightNumber} logged. Want to share your achievement?`,
          action: farcasterUser?.fid ? (
            <button
              onClick={() => shareTripToFarcaster(trip)}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              Share on Farcaster
            </button>
          ) : undefined,
        });

        setIsLoading(false);
      } else if (lifeCycleRes.statusName === "error") {
        toast({
          title: "Error",
          description: lifeCycleRes.statusData.message,
          variant: "destructive",
        });
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

  const fetchRank = async () => {
    try {
      const data = await getUserRank(userAddress as string);
      if (!data) return;
      setUserRank(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch Farcaster user context
  const fetchFarcasterContext = async () => {
    try {
      const context = await sdk.context;
      if (context?.user) {
        setFarcasterUser({
          fid: context.user.fid,
          username: context.user.username,
          displayName: context.user.displayName,
          pfpUrl: context.user.pfpUrl,
        });
      }
    } catch (error) {
      console.log("Not running in Farcaster context:", error);
      // Set default fallback data when not in Farcaster
      setFarcasterUser({
        displayName: "Anonymous User",
        username: "user",
      });
    }
  };

  // Share trip to Farcaster
  const shareTripToFarcaster = async (trip: TripInput) => {
    try {
      const shareText = `🛫 Just logged my flight from ${trip.departureAirport} to ${trip.arrivalAirport} on HighMiles! 
      
Flight: ${trip.flightNumber}
Miles Earned: ${trip.miles} HighMiles ✈️

Building my million-miler status on the blockchain! #HighMiles #Aviation`;

      await sdk.actions.composeCast({
        text: shareText,
      });
    } catch (error) {
      console.log("Could not share to Farcaster:", error);
    }
  };

  useEffect(() => {
    userTrips.refetch();
    fetchRank();
  }, [txnHash, userAddress]);

  useEffect(() => {
    fetchFarcasterContext();
    // Call ready when component mounts to hide splash screen if in Farcaster
    if (typeof window !== 'undefined') {
      try {
        sdk.actions.ready();
      } catch (error) {
        console.log("Not in Farcaster mini app context");
      }
    }
  }, []);

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
        <div className="bg-light-gray text-white min-h-screen max-w-md w-full overflow-hidden mx-auto flex flex-col">
          <div className="bg-dark-blue flex-1 flex flex-col">
            <div className="bg-primary-blue rounded-br-[100px] overflow-hidden p-6 pb-14 min-h-full flex-1 flex flex-col">
              <UserProfile farcasterUser={farcasterUser} />
              <div className="flex flex-col justify-center items-start gap-1 flex-1">
                <div className=" text-white text-xl md:text-[40px] italic font-[900]">
                  HIGHMILES
                  EARNED
                </div>
                <div className="text-white text-[72px] md:text-[95px] italic font-[900] font-gravity">
                  {userRank?.totalMiles?.toString() || "0"}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-dark-blue flex justify-between items-start rounded-br-[100px] overflow-hidden relative p-7">
            <div className="flex flex-col">
              <p className="text-white text-sm md:text-lg font-bold">
                MILLION MILER RANK
              </p>
              <p className="text-white text-2xl md:text-[55px] italic font-[900] font-gravity">
                {userRank?.rank?.toString() || "0"}/{userRank?.totalPlayers?.toString() || "0"}
              </p>
            </div>
            <img
              src="/svg/waiting.svg"
              width={180}
              height={180}
              alt="waiting"
              className="absolute right-4 md:w-[180px] md:h-[180px] w-32 h-32"
            />
          </div>
          <div className="bg-light-gray p-6 overflow-hidden">
            <button
              className="bg-light-blue p-4 flex items-center w-full justify-between"
              onClick={() => setIsScannerOpen(true)}
            >
              <p className="text-primary-blue text-xl md:text-3xl font-semibold">
                Scan Boarding Pass
              </p>
              <img src="/svg/stamp.svg" width={60} height={70} alt="Stamp" />
            </button>

            {!userTrips?.isLoading && !!userTrips.data?.trips?.length && <div>
              <p className="text-black text-lg font-bold mb-4 mt-9 uppercase">
                Logged Flights
              </p>
              <div className="flex flex-col gap-3 overflow-auto text-black">
                {userTrips?.isLoading ? (
                  "Trips Loading..."
                ) : (
                  <>
                    {
                      !userTrips.data?.trips.length ? (
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
                        userTrips.data?.trips?.map((trip: Trip) => (
                          <FlightCard
                            key={trip.id}
                            from={trip.departureairport}
                            to={trip.arrivalairport}
                            flightNumber={trip.flightnumber}
                            date={formatDate(new Date(trip.createdAt))}
                            miles={trip.miles}
                            highMiles={(trip.miles * 0.1).toString()} // Example calculation for highMiles
                          />
                        ))
                      )}
                  </>
                )}
              </div>
            </div>}
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
  miles: number;
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
  <div className="bg-white rounded-[10px] p-6 border border-light-blue flex justify-between items-center">
    <div>
      <p className=" text-dark-gray text-lg md:text-2xl font-normal">
        {from} - {to}
      </p>
      <p className=" text-sm md:text-base text-gray/45 font-normal">
        <span>{flightNumber}</span> | <span className="capitalize">{date}</span>
      </p>
    </div>
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-dark-gray text-sm md:text-lg font-normal">
          {miles} Miles Flown
        </p>
        <p className="text-primary-blue md:text-lg text-sm font-normal">
          +{Number(highMiles).toFixed(2)} HighMiles
        </p>
      </div>
    </div>
  </div>
);
