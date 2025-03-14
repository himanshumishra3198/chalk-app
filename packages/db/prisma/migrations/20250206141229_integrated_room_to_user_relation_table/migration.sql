-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "RoomUser" (
    "userId" TEXT NOT NULL,
    "roomId" INTEGER NOT NULL,

    CONSTRAINT "RoomUser_pkey" PRIMARY KEY ("userId","roomId")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoomUser_userId_key" ON "RoomUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomUser_roomId_key" ON "RoomUser"("roomId");

-- AddForeignKey
ALTER TABLE "RoomUser" ADD CONSTRAINT "RoomUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomUser" ADD CONSTRAINT "RoomUser_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
