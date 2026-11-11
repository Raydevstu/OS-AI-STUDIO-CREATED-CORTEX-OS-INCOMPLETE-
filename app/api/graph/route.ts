import { NextRequest, NextResponse } from "next/server";
import { cortexDb } from "@/lib/cortex-db";

// GET /api/graph?nodeId=...&depth=2&projectId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const nodeId = searchParams.get("nodeId");
    const projectId = searchParams.get("projectId");
    const depthStr = searchParams.get("depth");
    const depth = depthStr ? parseInt(depthStr, 10) : 2;

    const allRelationships = cortexDb.getRelationships();
    const allEntities = cortexDb.getEntities();
    const allConcepts = cortexDb.getConcepts();
    const allArtifacts = cortexDb.getArtifacts();
    const allProjects = cortexDb.getProjects();
    const allStudios = cortexDb.getStudios();

    if (nodeId) {
      const neighbors = cortexDb.graphNeighbors(nodeId, depth);
      const relevantIds = new Set<string>([nodeId, ...neighbors.map((n) => n.object_id)]);

      const filteredRelationships = allRelationships.filter(
        (r) => relevantIds.has(r.from_id) && relevantIds.has(r.to_id)
      );

      return NextResponse.json({
        centerNodeId: nodeId,
        neighbors,
        relationships: filteredRelationships,
      });
    }

    if (projectId) {
      const projectArtifacts = allArtifacts.filter((a) => a.project_id === projectId);
      const projectRel = allRelationships.filter(
        (r) =>
          r.from_id === projectId ||
          r.to_id === projectId ||
          projectArtifacts.some((a) => a.id === r.from_id || a.id === r.to_id)
      );

      return NextResponse.json({
        projectId,
        relationships: projectRel,
        artifacts: projectArtifacts,
      });
    }

    // Default: return entire knowledge graph
    const nodes = [
      ...allProjects.map((p) => ({ id: p.id, type: "project", name: p.name })),
      ...allStudios.map((s) => ({ id: s.id, type: "studio", name: s.name })),
      ...allArtifacts.map((a) => ({ id: a.id, type: "artifact", name: a.title, kind: a.artifact_type })),
      ...allEntities.map((e) => ({ id: e.id, type: "entity", name: e.canonical_name, kind: e.entity_type })),
      ...allConcepts.map((c) => ({ id: c.id, type: "concept", name: c.name, domain: c.domain })),
    ];

    return NextResponse.json({
      nodes,
      relationships: allRelationships,
      counts: {
        nodes: nodes.length,
        relationships: allRelationships.length,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
