// app/components/QRCodeScanner.tsx

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";

// Dynamically import QrReader to avoid SSR issues
// const QrReader = dynamic(() => import(''), { ssr: false });
import { QrReader, OnResultFunction } from 'react-qr-reader';

interface QRCodeScannerProps {
    onScan: (data: string) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan }) => {
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const handleScan: OnResultFunction = (data) => {
        if (data) {
            onScan(data.getText());
            setIsScannerOpen(false);
        }
    };

    const handleError = (err: any) => {
        console.error(err);
    };

    return (
        <div>
            {isScannerOpen ? (
                <div className="w-full max-w-sm mx-auto">
                    <QrReader
                        // delay={300}
                        // onError={handleError}
                        className='h-72 w-72 rounded-lg'
                        onResult={handleScan}
                        constraints={{ facingMode: 'user' }}
                    />
                    <Button onClick={() => setIsScannerOpen(false)} className="mt-4 w-full">
                        Cancel Scan
                    </Button>
                </div>
            ) : (
                <Button onClick={() => setIsScannerOpen(true)}>
                    Scan Boarding Pass
                </Button>
            )}
        </div>
    );
};

export default QRCodeScanner;