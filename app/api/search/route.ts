import { NextRequest, NextResponse } from "next/server";
import { cortexDb } from "@/lib/cortex-db";

// GET /api/search?q=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const results = cortexDb.hybridSearch(query);

    const totalMatches =
      results.entities.length +
      results.concepts.length +
      results.artifacts.length +
      results.sources.length +
      results.wikiPages.length +
      results.claims.length;

    return NextResponse.json({
      query,
      totalMatches,
      results,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
