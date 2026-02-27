"use client";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  leftAction?: React.ReactNode;
}

export function Header({ title, showBack = false, leftAction }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-lg border-b border-[var(--card-border)] safe-top">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-[var(--card)] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}
          <h1 className="text-lg font-bold">{title}</h1>
        </div>
        {leftAction && <div>{leftAction}</div>}
      </div>
    </header>
  );
}
