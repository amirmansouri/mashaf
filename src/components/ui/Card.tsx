import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  gradient?: "primary" | "gold" | "none";
}

export function Card({ children, className = "", onClick, gradient = "none" }: CardProps) {
  const gradientClass = gradient === "primary"
    ? "gradient-primary text-white border-0"
    : gradient === "gold"
    ? "gradient-gold text-white border-0"
    : "";

  return (
    <div
      onClick={onClick}
      className={`card ${gradientClass} ${onClick ? "cursor-pointer active:scale-[0.98] transition-transform" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
