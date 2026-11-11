import { NextResponse } from "next/server";
import { cortexDb } from "@/lib/cortex-db";

// GET /api/librarian/audit
export async function GET() {
  try {
    const findings = cortexDb.getAuditFindings();
    const log = cortexDb.getAuditLog(15);
    return NextResponse.json({
      findings,
      findingsCount: findings.length,
      auditLog: log,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/librarian/audit (Trigger health check)
export async function POST() {
  try {
    const findings = cortexDb.runAuditCheck();
    return NextResponse.json({
      status: "completed",
      findings,
      count: findings.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
