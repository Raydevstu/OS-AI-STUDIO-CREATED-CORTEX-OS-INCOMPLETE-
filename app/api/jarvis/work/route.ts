import { NextRequest, NextResponse } from "next/server";
import { cortexDb } from "@/lib/cortex-db";
import { ai } from "@/lib/gemini";

// POST /api/jarvis/work (The canonical Jarvis Contract)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { project_id, studio, studio_id, objective, context_ids, constraints } = body;

    if (!project_id || !objective) {
      return NextResponse.json(
        { error: "project_id and objective are required" },
        { status: 400 }
      );
    }

    // Resolve studio id
    let resolvedStudioId = studio_id;
    if (!resolvedStudioId && studio) {
      resolvedStudioId = studio.startsWith("studio-") ? studio : `studio-${studio}`;
    }
    if (!resolvedStudioId) {
      resolvedStudioId = "studio-design"; // default to first studio MVP
    }

    const targetStudio = cortexDb.getStudio(resolvedStudioId);
    if (!targetStudio) {
      return NextResponse.json({ error: `Studio not found: ${resolvedStudioId}` }, { status: 404 });
    }

    // Attempt AI-assisted generation for rich artifact synthesis
    let customSummary = "";
    if (process.env.GEMINI_API_KEY && objective.length > 5) {
      try {
        const studioPrompt = `You are the ${targetStudio.name} in CortexOS operating under Jarvis Supervisor.
Objective: "${objective}"
Constraints: ${(constraints || ["Zero-pill UI", "High contrast"]).join(", ")}

Generate a crisp 2-paragraph technical deliverable summary and 2 architectural decisions that this studio establishes for this objective.
Be concrete, pragmatic, and professional.`;

        const res = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: studioPrompt,
        });
        customSummary = res.text || "";
      } catch (aiErr) {
        console.warn("Jarvis AI synthesis fallback to deterministic logic:", aiErr);
      }
    }

    // Execute through cortexDb
    const response = await cortexDb.executeWorkRequest({
      project_id,
      studio_id: resolvedStudioId,
      objective,
      context_ids: context_ids || [],
      constraints: constraints || [],
    });

    if (customSummary && response.artifacts[0]) {
      response.artifacts[0].summary = customSummary.slice(0, 300);
    }

    return NextResponse.json(response);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
