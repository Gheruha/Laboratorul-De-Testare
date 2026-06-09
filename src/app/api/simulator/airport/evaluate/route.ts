import { NextRequest, NextResponse } from 'next/server';
import {
  assertSimulatorRateLimit,
  evaluateSimulatorReport,
  validateSimulatorReport,
} from '@/lib/utils/simulator/simulator.utils';
import { createSupabaseClientApi } from '@/lib/supabase/client';

const SCENARIO_ID = 'airport-basic';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseClientApi();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { message: 'You must be signed in to use the evaluator.' },
        { status: 401 },
      );
    }

    const body = (await req.json()) as {
      report?: unknown;
      sessionId?: unknown;
    };

    if (
      typeof body.sessionId !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        body.sessionId,
      )
    ) {
      return NextResponse.json(
        { message: 'Invalid simulator session.' },
        { status: 400 },
      );
    }

    const validation = validateSimulatorReport(body.report);

    if (!validation.valid) {
      return NextResponse.json(
        {
          verdict: 'out_of_scope',
          feedback: validation.message,
          matchedDefectId: null,
        },
        { status: 400 },
      );
    }

    await assertSimulatorRateLimit(user.id);

    const evaluation = await evaluateSimulatorReport({
      scenarioId: SCENARIO_ID,
      sessionId: body.sessionId,
      userId: user.id,
      report: validation.report,
    });

    return NextResponse.json(evaluation);
  } catch (error: unknown) {
    console.error('Airport simulator evaluator error:', error);
    const message =
      error instanceof Error ? error.message : 'Evaluation failed';
    return NextResponse.json({ message }, { status: 500 });
  }
}
