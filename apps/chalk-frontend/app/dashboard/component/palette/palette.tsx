"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaletteOptionProps {
  strokeColor: string;
  backgroundColor: string;
  fillStyle: string;
  strokeWidth: string;
  strokeStyle: string;
  sloppiness: string;
}

export function Palette({
  paletteOpen,
  setPaletteOption,
  paletteOption,
}: {
  paletteOpen: boolean;
  setPaletteOption: React.Dispatch<React.SetStateAction<PaletteOptionProps>>;
  paletteOption: PaletteOptionProps;
}) {
  const [isOpen, setIsOpen] = useState(paletteOpen);

  const strokeColors = [
    "#EEEEEE",
    "#FF9A9A",
    "#4CAF50",
    "#2196F3",
    "#FF9800",
    "#E65100",
  ];
  const backgroundColors = [
    "transparent",
    "#5D4037",
    "#1B5E20",
    "#0D47A1",
    "#E65100",
    "#6A1B9A",
  ];
  const fillStyles = ["hatch", "cross-hatch", "solid"];
  const strokeWidths = ["thin", "medium", "thick"];
  const strokeStyles = ["solid", "dotted", "dashed"];
  const sloppinessLevels = ["low", "medium", "high"];

  return (
    <div className="fixed left-0 top-0 z-50">
      <Button
        variant="ghost"
        size="icon"
        className="m-2 bg-zinc-900 text-white hover:bg-zinc-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {paletteOpen && (
        <div className="mt-2 w-64 rounded-r-lg bg-zinc-900 p-4 text-white shadow-lg">
          <div className="space-y-6">
            {/* Stroke Color */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400">Stroke</h3>
              <div className="grid grid-cols-6 gap-2">
                {strokeColors.map((color, index) => (
                  <button
                    key={index}
                    className={cn(
                      "h-8 w-8 rounded-md border border-zinc-700 transition-all hover:scale-110",
                      paletteOption.strokeColor === color && "ring-2 ring-white"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setPaletteOption((prev: PaletteOptionProps) => ({
                        ...prev,
                        strokeColor: color,
                      }));
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400">Background</h3>
              <div className="grid grid-cols-6 gap-2">
                {backgroundColors.map((color, index) => (
                  <button
                    key={index}
                    className={cn(
                      "h-8 w-8 rounded-md border border-zinc-700 transition-all hover:scale-110",
                      color === "transparent" && "bg-opacity-0",
                      paletteOption.backgroundColor === color &&
                        "ring-2 ring-white"
                    )}
                    style={{
                      backgroundColor: color,
                      backgroundImage:
                        color === "transparent"
                          ? "linear-gradient(45deg, #333 25%, transparent 25%, transparent 75%, #333 75%, #333), linear-gradient(45deg, #333 25%, transparent 25%, transparent 75%, #333 75%, #333)"
                          : "none",
                      backgroundSize:
                        color === "transparent" ? "8px 8px" : "auto",
                      backgroundPosition:
                        color === "transparent" ? "0 0, 4px 4px" : "auto",
                    }}
                    onClick={() => {
                      setPaletteOption((prev: PaletteOptionProps) => ({
                        ...prev,
                        backgroundColor: color,
                      }));
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Fill Style */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400">Fill</h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-md bg-indigo-900/50 transition-all hover:bg-indigo-800/60",
                    paletteOption.fillStyle === "hatch" && "ring-2 ring-white"
                  )}
                  onClick={() => {
                    setPaletteOption((prev: PaletteOptionProps) => ({
                      ...prev,
                      fillStyle: "hatch",
                    }));
                  }}
                >
                  <div
                    className="h-6 w-6"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(45deg, #fff, #fff 1px, transparent 1px, transparent 4px)",
                    }}
                  ></div>
                </button>
                <button
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-md bg-indigo-900/50 transition-all hover:bg-indigo-800/60",
                    paletteOption.fillStyle === "cross-hatch" &&
                      "ring-2 ring-white"
                  )}
                  onClick={() => {
                    setPaletteOption((prev: PaletteOptionProps) => ({
                      ...prev,
                      fillStyle: "cross-hatch",
                    }));
                  }}
                >
                  <div
                    className="h-6 w-6"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(45deg, #fff, #fff 1px, transparent 1px, transparent 4px), repeating-linear-gradient(135deg, #fff, #fff 1px, transparent 1px, transparent 4px)",
                    }}
                  ></div>
                </button>
                <button
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-md bg-indigo-900/50 transition-all hover:bg-indigo-800/60",
                    paletteOption.fillStyle === "solid" && "ring-2 ring-white"
                  )}
                  onClick={() => {
                    setPaletteOption((prev: PaletteOptionProps) => ({
                      ...prev,
                      fillStyle: "solid",
                    }));
                  }}
                >
                  <div className="h-6 w-6 rounded bg-white"></div>
                </button>
              </div>
            </div>

            {/* Stroke Width */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400">
                Stroke width
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {strokeWidths.map((width, index) => (
                  <button
                    key={index}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-md bg-indigo-900/50 transition-all hover:bg-indigo-800/60",
                      paletteOption.strokeWidth === width && "ring-2 ring-white"
                    )}
                    onClick={() => {
                      setPaletteOption((prev: PaletteOptionProps) => ({
                        ...prev,
                        strokeWidth: width,
                      }));
                    }}
                  >
                    <div
                      className="bg-white"
                      style={{
                        width: "60%",
                        height:
                          index === 0 ? "1px" : index === 1 ? "2px" : "4px",
                      }}
                    ></div>
                  </button>
                ))}
              </div>
            </div>

            {/* Stroke Style */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400">
                Stroke style
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-md bg-indigo-900/50 transition-all hover:bg-indigo-800/60",
                    paletteOption.strokeStyle === "solid" && "ring-2 ring-white"
                  )}
                  onClick={() => {
                    setPaletteOption((prev: PaletteOptionProps) => ({
                      ...prev,
                      strokeStyle: "solid",
                    }));
                  }}
                >
                  <div className="h-[2px] w-6 bg-white"></div>
                </button>
                <button
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-md bg-indigo-900/50 transition-all hover:bg-indigo-800/60",
                    paletteOption.strokeStyle === "dotted" &&
                      "ring-2 ring-white"
                  )}
                  onClick={() => {
                    setPaletteOption((prev: PaletteOptionProps) => ({
                      ...prev,
                      strokeStyle: "dotted",
                    }));
                  }}
                >
                  <div className="flex w-6 justify-between">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="h-[2px] w-[2px] rounded-full bg-white"
                      ></div>
                    ))}
                  </div>
                </button>
                <button
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-md bg-indigo-900/50 transition-all hover:bg-indigo-800/60",
                    paletteOption.strokeStyle === "dashed" &&
                      "ring-2 ring-white"
                  )}
                  onClick={() => {
                    setPaletteOption((prev: PaletteOptionProps) => ({
                      ...prev,
                      strokeStyle: "dashed",
                    }));
                  }}
                >
                  <div className="flex w-6 justify-between">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-[2px] w-[3px] bg-white"></div>
                    ))}
                  </div>
                </button>
              </div>
            </div>

            {/* Sloppiness */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400">Sloppiness</h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-md bg-indigo-900/50 transition-all hover:bg-indigo-800/60",
                    paletteOption.sloppiness === "low" && "ring-2 ring-white"
                  )}
                  onClick={() => {
                    setPaletteOption((prev: PaletteOptionProps) => ({
                      ...prev,
                      sloppiness: "low",
                    }));
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 12H20"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                <button
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-md bg-indigo-900/50 transition-all hover:bg-indigo-800/60",
                    paletteOption.sloppiness === "medium" && "ring-2 ring-white"
                  )}
                  onClick={() => {
                    setPaletteOption((prev: PaletteOptionProps) => ({
                      ...prev,
                      sloppiness: "medium",
                    }));
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 12C6 11 8 13 10 12C12 11 14 13 16 12C18 11 20 13 20 12"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                <button
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-md bg-indigo-900/50 transition-all hover:bg-indigo-800/60",
                    paletteOption.sloppiness === "high" && "ring-2 ring-white"
                  )}
                  onClick={() => {
                    setPaletteOption((prev: PaletteOptionProps) => ({
                      ...prev,
                      sloppiness: "high",
                    }));
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 12C5 10 7 14 9 10C11 6 13 18 15 10C17 2 19 12 20 12"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
