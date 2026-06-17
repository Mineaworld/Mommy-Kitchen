"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Utensils } from "lucide-react";

export const BottomNav = () => {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  const isHome = pathname === "/";
  const isMenu = pathname === "/menu";
  const isCategory = pathname?.startsWith("/category");

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-surfaceContainerHighest border-t border-outlineVariant flex items-center justify-around z-50 rounded-t-xl">
      <Link
        href="/"
        className="flex flex-col items-center justify-center min-w-20 h-full"
      >
        <div className={`w-16 h-8 rounded-full flex items-center justify-center transition-colors ${isHome ? "bg-primaryContainer text-onPrimaryContainer" : "text-onSurfaceVariant"}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        </div>
        <span className={`mt-1 text-xs font-semibold ${isHome ? "text-primary" : "text-onSurfaceVariant"}`}>ដើម</span>
      </Link>

      <Link
        href="/menu"
        className="flex flex-col items-center justify-center min-w-20 h-full"
      >
        <div className={`w-16 h-8 rounded-full flex items-center justify-center transition-colors ${isMenu ? "bg-primaryContainer text-onPrimaryContainer" : "text-onSurfaceVariant"}`}>
          <Utensils className="w-6 h-6" />
        </div>
        <span className={`mt-1 text-xs font-semibold ${isMenu ? "text-primary" : "text-onSurfaceVariant"}`}>មីនុយ</span>
      </Link>

      <Link
        href="/#categories"
        className="flex flex-col items-center justify-center min-w-20 h-full"
      >
        <div className={`w-16 h-8 rounded-full flex items-center justify-center transition-colors ${isCategory ? "bg-primaryContainer text-onPrimaryContainer" : "text-onSurfaceVariant"}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z" />
          </svg>
        </div>
        <span className={`mt-1 text-xs font-semibold ${isCategory ? "text-primary" : "text-onSurfaceVariant"}`}>ប្រភេទ</span>
      </Link>
    </nav>
  );
};
