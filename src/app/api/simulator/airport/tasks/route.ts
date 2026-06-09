import { NextResponse } from 'next/server';
import { getSimulatorTasks } from '@/lib/utils/simulator/simulator.utils';

const SCENARIO_ID = 'airport-basic';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tasks = await getSimulatorTasks(SCENARIO_ID);
    return NextResponse.json(
      { tasks },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to load simulator tasks';
    return NextResponse.json({ message }, { status: 500 });
  }
}
