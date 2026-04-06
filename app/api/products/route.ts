import { NextRequest, NextResponse } from "next/server";
import { getSprayProducts } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productGroup = searchParams.get("product_group") ?? undefined;
    const target = searchParams.get("target") ?? undefined;

    const filters =
      productGroup || target
        ? { product_group: productGroup, target_pest: target }
        : undefined;

    const products = getSprayProducts(filters);

    return NextResponse.json({ products });
  } catch (err) {
    console.error("[products] GET Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch spray products" },
      { status: 500 }
    );
  }
}
