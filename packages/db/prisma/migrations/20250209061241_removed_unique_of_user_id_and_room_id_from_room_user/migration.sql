/*
  Warnings:

  - The primary key for the `RoomUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[userId,roomId]` on the table `RoomUser` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "RoomUser_roomId_key";

-- DropIndex
DROP INDEX "RoomUser_userId_key";

-- AlterTable
ALTER TABLE "RoomUser" DROP CONSTRAINT "RoomUser_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "RoomUser_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "RoomUser_userId_roomId_key" ON "RoomUser"("userId", "roomId");
