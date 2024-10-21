-- CreateTable
CREATE TABLE "trip" (
    "id" SERIAL NOT NULL,
    "useraddress" VARCHAR(42) NOT NULL,
    "arrivalairport" VARCHAR(255) NOT NULL,
    "departureairport" VARCHAR(255) NOT NULL,
    "flightnumber" VARCHAR(20) NOT NULL,
    "pnr" VARCHAR(20) NOT NULL,
    "miles" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "txnhash" TEXT NOT NULL,

    CONSTRAINT "trip_pkey" PRIMARY KEY ("id")
);
