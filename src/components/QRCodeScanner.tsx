"use client";
import React, { useState, useEffect } from "react";
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
import {
  BoardingPassResponse,
  getBoardingPassData,
} from "@/lib/boardingPassApi";
import { convertToValidArg } from "@/lib/utils";
import BoardingPassContainer from "./BoardingPassContainer";
import Link from "next/link";

interface QRCodeScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  handleAddTrip: (status: LifecycleStatus) => void;
  proofHash: string;
  signalHash: string;
  handleAddProof: (status: LifecycleStatus) => void;
  isLoading: boolean;
  isUserRegistered: boolean;
  boardingPassData: BoardingPassResponse | undefined;
  handleReset: () => void;
  txnHash: string;
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
  boardingPassData,
  handleReset,
  txnHash,
}) => {
  const { address } = useAccount();
  const [addTripContracts, setAddTripContracts] = useState<any>(null);
  const [error, setError] = useState<null | string>(null);

  const handleScan: OnResultFunction = async (data, error) => {
    if (data) {
      console.log("🚀 ~ data:", data);
      onScan(data.getText());
    }
    if (error) {
      setError(error.message);
    }
  };

  const addProofContracts = getAddProofContract({
    userAddress: address as any,
    proofHash,
    signalHash,
  });

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
    if (!addTripContracts && boardingPassData) {
      setupAddTripContracts();
    }
  }, [boardingPassData, address]);

  return (
    <div className="mx-auto w-full">
      <div className="bg-[url('/images/cloud-bg.jpeg')] relative text-white min-h-screen flex flex-col w-full bg-center bg-cover h-[100dvh]">
        <div className="px-6 pt-6 flex-1">
          <button
            onClick={() => {
              onClose();
              setAddTripContracts(null);
            }}
            className="text-white font-semibold text-xl text-left mb-6"
          >
            ← EXIT
          </button>
          <div className="bg-light-blue w-full p-4">
            <div className="flex items-center w-full justify-between">
              <p className="text-primary-blue text-3xl font-semibold">
                Scan Boarding Pass
              </p>
              <Image src="/svg/stamp.svg" width={60} height={70} alt="Stamp" />
            </div>

            {!boardingPassData && (
              <>
                <QrReader
                  className="w-full rounded-lg aspect-square my-6 [&_video]:object-cover [&_video]:aspect-square"
                  onResult={handleScan}
                  constraints={{ facingMode: "environment" }}
                />
                <p className="text-dark-gray font-semibold text-base">
                  Make sure your pass is aligned in the window above.
                </p>
                {error && (
                  <span className="text-sm text-left self-left text-red-600 font-medium">
                    *{error} <br />
                    please reload once and try again.
                  </span>
                )}
              </>
            )}
            {boardingPassData && !txnHash && (
              <BoardingPassContainer
                arrivalAirport={boardingPassData.data.legs[0].arrivalAirport}
                date={boardingPassData.data.legs[0].flightDate}
                departureAirport={
                  boardingPassData.data.legs[0].departureAirport
                }
                firstName={boardingPassData.data.passengerFirstName}
                flighNum={boardingPassData.data.legs[0].flightNumber}
                handleReset={handleReset}
                lastName={boardingPassData.data.passengerLastName}
              />
            )}

            {txnHash && (
              <div className="bg-white w-full flex flex-col items-center justify-start rounded-[10px] px-6 py-4 mt-4 relative gap-2">
                <Image
                  src={"/svg/successtick.svg"}
                  width={30}
                  height={30}
                  className=""
                  alt="tick"
                />
                <p className="text-black/80 font-medium text-base">
                  Trip added successfully!
                </p>
                <Link
                  target="_blank"
                  href={`https://sepolia.basescan.org/tx/${txnHash}`}
                  className="underline text-sm font-normal text-blue-500"
                >
                  View on basescan
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto bg-dark-gray  disabled:cursor-not-allowed w-full px-10 py-6 sticky bottom-0">
          <div className="text-left text-white text-3xl font-semibold">
            {isLoading ? (
              "Loading..."
            ) : (
              <>
                {addTripContracts && boardingPassData ? (
                  <Transaction
                    onError={handleReset}
                    chainId={baseSepolia.id}
                    contracts={addTripContracts}
                    onStatus={handleAddTrip}
                  >
                    <TransactionButton
                      disabled={isLoading || !addTripContracts}
                      text="Add Trip"
                      className="txn-btn disabled:cursor-not-allowed"
                    />
                  </Transaction>
                ) : (
                  "Scan to continue"
                )}
              </>
            )}
          </div>
          <Image
            src="/svg/airplane.svg"
            width={88}
            height={88}
            alt="airplane icon"
          />
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;
