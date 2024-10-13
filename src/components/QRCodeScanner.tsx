import React, { useCallback, useState, useEffect } from "react";
import { QrReader, OnResultFunction } from "react-qr-reader";
import Image from "next/image";
import {
  LifecycleStatus,
  Transaction,
  TransactionButton,
} from "@coinbase/onchainkit/transaction";
import { baseSepolia } from "viem/chains";
import { getAddProofContract, getAddTripContract } from "@/lib/contracts";
import { useAccount } from "wagmi";
import { BoardingPassResponse } from "@/lib/boardingPassApi";
import { convertToValidArg } from "@/lib/utils";

interface QRCodeScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  handleAddTrip: (status: LifecycleStatus) => void;
  proofHash: string;
  signalHash: string;
  handleAddProof: (status: LifecycleStatus) => void;
  isLoading: boolean;
  isUserRegistered: boolean;
  getPassData: () => Promise<BoardingPassResponse | undefined>;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  onScan,
  onClose,
  handleAddProof,
  isUserRegistered,
  proofHash,
  signalHash,
  handleAddTrip,
  isLoading,
  getPassData,
}) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { address } = useAccount();
  const [boardingPassData, setBoardingPassData] = useState<
    BoardingPassResponse | undefined
  >();
  const [addTripContracts, setAddTripContracts] = useState<any>(null);

  const handleScan: OnResultFunction = (data) => {
    if (data) {
      console.log("🚀 ~ data:", data);
      onScan(data.getText());
      onClose();
    }
  };

  const isVerified = proofHash && signalHash;

  const addProofContracts = getAddProofContract({
    userAddress: address as any,
    proofHash,
    signalHash,
  });

  useEffect(() => {
    const fetchBoardingPassData = async () => {
      const data = await getPassData();
      setBoardingPassData(data);
    };

    fetchBoardingPassData();
  }, []);

  console.log(isUserRegistered);
  console.log(boardingPassData);
  console.log(addTripContracts);

  useEffect(() => {
    const setupAddTripContracts = async () => {
      if (boardingPassData) {
        const contracts = getAddTripContract({
          arrivalAirport: convertToValidArg(
            boardingPassData.data.legs[0].arrivalAirport
          ),
          departureAirport: convertToValidArg(
            boardingPassData.data.legs[0].departureAirport
          ),
          endTime: new Date().getTime() + 360000,
          startTime: new Date().getTime(),
          flightNumber: convertToValidArg(
            boardingPassData.data.legs[0].flightNumber
          ),
          miles: 100,
          userAddress: address as `0x${string}`,
        });
        setAddTripContracts(contracts);
      }
    };

    setupAddTripContracts();
  }, [boardingPassData, address]);

  return (
    <div className="mx-auto  min-h-screen max-w-md w-full overflow-hidden">
      <div className="bg-[url('/images/cloud-bg.jpeg')] relative text-white min-h-screen flex flex-col max-w-md w-full overflow-hidden bg-center bg-cover">
        <div className="p-6 mt-8">
          <button
            onClick={onClose}
            className="text-white font-semibold text-3xl text-left mb-6"
          >
            ← EXIT
          </button>
          <div className="bg-light-blue w-full px-5 py-8">
            <div className="flex items-center w-full justify-between">
              <p className="text-primary-blue text-3xl font-semibold">
                Scan Boarding Pass
              </p>
              <Image src="/svg/stamp.svg" width={60} height={70} alt="Stamp" />
            </div>

            {!isVerified && (
              <>
                <QrReader
                  className="h-72 w-full rounded-lg"
                  onResult={handleScan}
                  constraints={{ facingMode: "user" }}
                />
                <p className="text-dark-gray font-semibold text-2xl mt-10">
                  Make sure your pass is aligned in the window above.
                </p>
              </>
            )}
            {boardingPassData && (
              <div className="bg-white rounded-[10px] px-6 py-4 mt-4">
                <p className="text-gray/55 text-lg font-normal">{`${new Date(
                  boardingPassData.data.legs[0].flightDate
                )}`}</p>
                <p className="text-dark-gray text-2xl font-bold">
                  {boardingPassData.data.passengerFirstName}/
                  {boardingPassData.data.passengerFirstName}
                </p>
                <p className="text-dark-gray text-2xl font-normal">
                  {boardingPassData.data.legs[0].arrivalAirport}-
                  {boardingPassData.data.legs[0].departureAirport}
                </p>
                <p className="text-dark-gray text-lg font-bold">
                  {boardingPassData.data.legs[0].flightNumber}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-dark-gray w-full p-4 text-center mt-auto ">
          <button className="flex items-center justify-between w-full px-10 py-6">
            <p className="text-left text-white text-3xl font-semibold">
              {isLoading ? (
                "Loading..."
              ) : (
                <>
                  {!isUserRegistered ? (
                    <Transaction
                      chainId={baseSepolia.id}
                      contracts={addProofContracts}
                      onStatus={handleAddProof}
                    >
                      <TransactionButton text="Add Proof" className="txn-btn" />
                    </Transaction>
                  ) : addTripContracts ? (
                    <Transaction
                      chainId={baseSepolia.id}
                      contracts={addTripContracts}
                      onStatus={handleAddProof}
                    >
                      <TransactionButton text="Add Trip" className="txn-btn" />
                    </Transaction>
                  ) : (
                    "Error happened :( ). Try again later!"
                  )}
                </>
              )}
            </p>
            <Image
              src="/svg/airplane.svg"
              width={88}
              height={88}
              alt="airplane icon"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;
