import Image from "next/image";
import React from "react";

export default function AwaitingConnection() {
  return (
    <div className="bg-dark-gray relative text-white min-h-screen flex flex-col items-center max-w-md w-full overflow-hidden">
      <div className="relative h-48 w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/bg.png"
            alt="Retro airline advertisement"
            fill
            style={{ objectFit: "cover", objectPosition: "top" }}
          />
        </div>
        <svg
          className="absolute bottom-0 left-0 w-full"
          height="240"
          viewBox="0 0 400 240"
          preserveAspectRatio="none"
        >
          <path
            d="M0,70 C90,200 300,130 400,40 L400,240 L0,240 Z"
            fill="#1A30FF"
          />
        </svg>
      </div>

      <div className="bg-primary-blue w-full p-8 text-center flex-1 flex items-center justify-center flex-col">
        <h2 className="text-5xl font-bold mb-4 italic tracking-tighter">
          MILES ON
          <br />
          MILES
        </h2>
        <Image src="/svg/waiting.svg" width={180} height={180} alt="waiting" />
        <p className="text-xl font-semibold mb-8">
          Awaiting wallet
          <br />
          connection...
        </p>
      </div>
    </div>
  );
}
