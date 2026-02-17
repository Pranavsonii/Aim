"use client";
import ReactConfetti from "react-confetti";
import { useState, useEffect } from "react";

function getDimensions() {
  if (typeof window === "undefined") return { width: 0, height: 0 };
  return { width: window.innerWidth, height: window.innerHeight };
}

export default function Confetti() {
  const [windowDimensions, setWindowDimensions] = useState(getDimensions);

  useEffect(() => {
    const handleResize = () => setWindowDimensions(getDimensions());
    window.addEventListener("resize", handleResize);
    setWindowDimensions(getDimensions());
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowDimensions.width > 0 && windowDimensions.width < 768;
  const numberOfPieces = isMobile ? 200 : 500;

  return (
    <div className="w-full fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <ReactConfetti
        width={windowDimensions.width}
        height={windowDimensions.height}
        recycle={false}
        numberOfPieces={numberOfPieces}
        gravity={0.3}
      />
    </div>
  );
}
