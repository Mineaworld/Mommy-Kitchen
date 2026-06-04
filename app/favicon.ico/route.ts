import { NextResponse } from "next/server";

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#f7f9ff"/>
  <circle cx="32" cy="32" r="22" fill="#ffdbcd"/>
  <path d="M18 30c0-8 6-14 14-14s14 6 14 14v3H18v-3z" fill="#9e3d00"/>
  <path d="M16 34h32v3c0 9-7 16-16 16S16 46 16 37v-3z" fill="#006d37"/>
</svg>`;

export const GET = () => {
  return new NextResponse(icon, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
};
