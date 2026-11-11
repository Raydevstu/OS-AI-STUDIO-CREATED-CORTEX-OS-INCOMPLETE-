import { NextRequest, NextResponse } from "next/server";
import { cortexDb } from "@/lib/cortex-db";

// GET /api/artifacts?projectId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || undefined;
    const artifacts = cortexDb.getArtifacts(projectId);
    return NextResponse.json({ artifacts, count: artifacts.length });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/artifacts
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.project_id || !body.artifact_type || !body.title) {
      return NextResponse.json(
        { error: "project_id, artifact_type, and title are required fields" },
        { status: 400 }
      );
    }

    const artifact = cortexDb.createArtifact({
      project_id: body.project_id,
      studio_id: body.studio_id,
      artifact_type: body.artifact_type,
      title: body.title,
      summary: body.summary || "",
      body: body.body || {},
      created_by_agent_id: body.created_by_agent_id,
    });

    return NextResponse.json({ artifact }, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/artifacts (Approve or update)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "artifact id is required" }, { status: 400 });
    }

    if (body.action === "approve") {
      const approved = cortexDb.approveArtifact(body.id, body.approved_by || "Human Architect");
      return NextResponse.json({ artifact: approved });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
