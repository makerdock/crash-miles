import React from "react";

const BoardingPassContainer = ({
  arrivalAirport,
  date,
  departureAirport,
  flighNum,
  lastName,
  firstName,
  handleReset,
}: {
  firstName: string;
  lastName: string;
  departureAirport: string;
  arrivalAirport: string;
  flighNum: string;
  date: string;
  handleReset: () => void;
}) => {
  return (
    <div className="bg-white rounded-[10px] px-6 py-4 mt-4 relative">
      <p className="text-gray/55 text-lg font-normal">{`${date}`}</p>
      <p className="text-dark-gray text-2xl font-bold">
        {lastName}/{firstName}
      </p>
      <p className="text-dark-gray text-2xl font-normal">
        {arrivalAirport}-{departureAirport}
      </p>
      <p className="text-dark-gray text-lg font-bold">{flighNum}</p>

      <button
        className="absolute top-4 right-4 text-black text-sm font-semibold"
        onClick={handleReset}
      >
        X
      </button>
    </div>
  );
};

export default BoardingPassContainer;
