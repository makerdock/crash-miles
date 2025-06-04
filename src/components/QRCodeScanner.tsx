"use client";
import {
  BoardingPassResponse
} from "@/lib/boardingPassApi";
import { getAddProofContract, getAddTripContract } from "@/lib/contracts";
import { cn, convertToValidArg } from "@/lib/utils";
import {
  LifecycleStatus,
  Transaction,
  TransactionButton,
} from "@coinbase/onchainkit/transaction";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { useState } from "react";
import { FaAnglesRight } from "react-icons/fa6";
import { OnResultFunction, QrReader } from "react-qr-reader";
import { baseSepolia } from "viem/chains";
import { useAccount } from "wagmi";
import BoardingPassContainer from "./BoardingPassContainer";

const MotionImage = motion(Image);

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
  proofHash,
  signalHash,
  handleAddTrip,
  isLoading,
  boardingPassData,
  handleReset,
  isUserRegistered,
  handleAddProof,
  txnHash,
}) => {
  const { address } = useAccount();
  const [error, setError] = useState<null | string>(null);

  const handleScan: OnResultFunction = async (data, error) => {
    if (data) {
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

  const setupAddTripContracts = () => {
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
      return contracts;
    }

    return getAddTripContract({} as any);
  };

  const addTripContracts = setupAddTripContracts();

  return (
    <div className="mx-auto w-full">
      <div className="bg-[url('/images/cloud-bg.jpeg')] relative text-white min-h-screen flex flex-col w-full bg-center bg-cover h-[100dvh]">
        <div className="px-6 pt-6 flex-1">
          <button
            onClick={() => {
              onClose();
              // setAddTripContracts(null);
            }}
            className="text-white font-semibold text-xl text-left mb-6"
          >
            ← EXIT
          </button>
          <div className="bg-light-blue w-full p-4">
            {!txnHash &&
              <>
                <div className="flex items-center w-full justify-between">
                  <p className="text-primary-blue text-3xl font-semibold">
                    Scan Boarding Pass
                  </p>
                  <img src="/svg/stamp.svg" width={60} height={70} alt="Stamp" />
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
                    flighNum={boardingPassData.data.legs[0].operatingCarrierDesignator + boardingPassData.data.legs[0].flightNumber}
                    handleReset={handleReset}
                    lastName={boardingPassData.data.passengerLastName}
                  />
                )}
              </>
            }

            {txnHash && <p className="text-black/80 font-medium text-base flex flex-col justify-center">
              <h2 className="text-4xl font-gravity uppercase italic flex-1">Trip added successfully!</h2>
              <div className="flex items-center space-x-2 text-xl py-2 mt-2 border-t-2 border-black">
                <span>{boardingPassData?.data.legs[0].departureAirport}</span>
                <FaAnglesRight />
                <span>{boardingPassData?.data.legs[0].arrivalAirport}</span>
              </div>
            </p>}
          </div>
        </div>

        {/* <div className="flex items-center justify-between mt-auto bg-dark-gray  disabled:cursor-not-allowed w-full p-6 sticky bottom-0 text-left text-white text-3xl font-semibold"> */}
        <div className="relative">
          <Transaction
            onError={handleReset}
            chainId={baseSepolia.id}
            contracts={addTripContracts}
            onStatus={handleAddTrip}
          >
            {!!isUserRegistered && <>
              <>
                {boardingPassData ? (
                  <TransactionButton
                    disabled={isLoading || !addTripContracts}
                    text={
                      <div className="flex items-center justify-between w-full flex-1">
                        <label className="flex-1">Add Trip</label>
                        <MotionImage
                          className="aspect-square h-14 w-14 float-right"
                          src="/svg/airplane.svg"
                          width={88}
                          height={88}
                          initial={{ x: 0 }}
                          animate={{ x: isLoading ? 100 : 0 }}
                          alt="airplane icon"
                        />
                      </div> as any
                    }
                    className={cn("txn-btn disabled:cursor-not-allowed p-0")}
                  />
                ) : (
                  <div
                    className="flex items-center justify-between mt-auto bg-dark-gray  disabled:cursor-not-allowed w-full p-6 sticky bottom-0 text-left text-white text-3xl font-semibold"
                  >
                    Scan to continue
                  </div>
                )}
              </>
            </>}
          </Transaction>

          <Transaction
            onError={handleReset}
            chainId={baseSepolia.id}
            contracts={addProofContracts}
            onStatus={handleAddProof}
          >

            {!isUserRegistered && <TransactionButton
              disabled={isLoading || !addTripContracts}
              text={
                <div className="flex items-center justify-between w-full flex-1">
                  <label className="flex-1">Register</label>
                  <MotionImage
                    className="aspect-square h-14 w-14"
                    src="/svg/airplane.svg"
                    width={88}
                    height={88}
                    initial={{ x: 0 }}
                    animate={{ x: isLoading ? 100 : 0 }}
                    alt="airplane icon"
                  />
                </div> as any
              }
              className={cn("txn-btn disabled:cursor-not-allowed p-0")}
            />}
          </Transaction>

        </div>


        {/* </div> */}

      </div>

    </div>
  );
};

export default QRCodeScanner;
