// app/components/QRCodeScanner.tsx

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

// Dynamically import QrReader to avoid SSR issues
// const QrReader = dynamic(() => import(''), { ssr: false });
import { QrReader, OnResultFunction } from "react-qr-reader";
import Image from "next/image";

interface QRCodeScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onClose }) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleScan: OnResultFunction = (data) => {
    if (data) {
      console.log("🚀 ~ data:", data);
      onScan(data.getText());
      onClose();
    }
  };

  const handleError = (err: any) => {
    console.error(err);
  };

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

            <QrReader
              // delay={300}
              // onError={handleError}
              className="h-72 w-full rounded-lg"
              onResult={handleScan}
              constraints={{ facingMode: "user" }}
            />
            <p className="text-dark-gray font-semibold text-2xl mt-10">
              Make sure your pass is aligned in the window above.
            </p>
            <div className="bg-white rounded-[10px] px-6 py-4 mt-4">
              <p className="text-gray/55 text-lg font-normal">Oct 2, 2024</p>
              <p className="text-dark-gray text-2xl font-bold">
                PASSENGER/TEST
              </p>
              <p className="text-dark-gray text-2xl font-normal">JFK - BER</p>
              <p className="text-dark-gray text-lg font-bold">DL0932</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-gray w-full p-4 text-center mt-auto ">
          <button className="flex items-center justify-between w-full px-10 py-6">
            <p className="text-left text-white text-3xl font-semibold">
              Process
              <br /> Boarding Pass
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
