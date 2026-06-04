import { NextResponse } from "next/server";
import { CategoryRepository } from "@/lib/repositories/CategoryRepository";

export const GET = async () => {
  const categories = await CategoryRepository.getAll();
  return NextResponse.json({ data: categories });
};
