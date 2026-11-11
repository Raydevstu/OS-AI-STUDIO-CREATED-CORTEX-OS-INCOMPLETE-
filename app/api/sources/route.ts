import { NextRequest, NextResponse } from "next/server";
import { cortexDb } from "@/lib/cortex-db";

// GET /api/sources?projectId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || undefined;
    const sources = cortexDb.getSources(projectId);
    return NextResponse.json({ sources, count: sources.length });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/sources
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !body.kind || !body.content) {
      return NextResponse.json(
        { error: "title, kind, and content are required fields" },
        { status: 400 }
      );
    }

    const source = cortexDb.createSource({
      project_id: body.project_id,
      kind: body.kind,
      title: body.title,
      uri: body.uri,
      content: body.content,
      metadata: body.metadata,
    });

    return NextResponse.json({ source }, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
