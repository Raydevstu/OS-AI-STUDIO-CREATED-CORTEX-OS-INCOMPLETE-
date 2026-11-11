import { NextResponse } from "next/server";
import { CORTEX_STUDIOS } from "@/lib/studios-data";
import { cortexDb } from "@/lib/cortex-db";

// GET /api/studios
export async function GET() {
  try {
    const dbStudios = cortexDb.getStudios();
    const agents = cortexDb.getAgents();

    const merged = dbStudios.map((s) => {
      const detailed = CORTEX_STUDIOS[s.slug];
      const studioAgents = agents.filter((a) => a.studio_id === s.id);
      return {
        ...s,
        detailed,
        agents: studioAgents,
      };
    });

    return NextResponse.json({
      studios: merged,
      firstStudioMvp: CORTEX_STUDIOS.design,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
