import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface LiveUserCounterProps {
  value: number;
}

const LiveUserCounter = ({ value }: LiveUserCounterProps) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [animationDirection, setAnimationDirection] = useState<"up" | "down" | null>(null);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value !== prevValueRef.current) {
      if (value > prevValueRef.current) {
        setAnimationDirection("up");
      } else if (value < prevValueRef.current) {
        setAnimationDirection("down");
      }

      const timer = setTimeout(() => {
        setDisplayValue(value);
        setAnimationDirection(null);
        prevValueRef.current = value;
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <div className="relative h-9 overflow-hidden">
      <div
        className={cn(
          "transition-transform duration-300 ease-out",
          animationDirection === "up" && "animate-count-down",
          animationDirection === "down" && "animate-count-up"
        )}
      >
        <span className="text-2xl font-bold">{displayValue}</span>
      </div>
      {animationDirection && (
        <span
          className={cn(
            "absolute inset-0 text-2xl font-bold text-primary opacity-0 transition-opacity duration-300",
            animationDirection === "up" && "animate-pulse-opacity",
            animationDirection === "down" && "animate-pulse-opacity"
          )}
        >
          {value}
        </span>
      )}
    </div>
  );
};

export default LiveUserCounter;
