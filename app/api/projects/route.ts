import { NextRequest, NextResponse } from "next/server";
import { cortexDb } from "@/lib/cortex-db";

// GET /api/projects
export async function GET() {
  try {
    const projects = cortexDb.getProjects();
    return NextResponse.json({ projects, count: projects.length });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/projects
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: "name and slug are required fields" },
        { status: 400 }
      );
    }

    const project = cortexDb.createProject({
      slug: body.slug,
      name: body.name,
      description: body.description,
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/projects
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "project id is required" }, { status: 400 });
    }

    const updated = cortexDb.updateProject(body.id, {
      status: body.status,
      description: body.description,
      name: body.name,
    });

    if (!updated) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project: updated });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
