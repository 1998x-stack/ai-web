import { buildWebsite } from '@/lib/build/packager';
import { getWorkspace } from '@/lib/workspace/manager';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return Response.json(
        { error: 'Missing required field: sessionId' },
        { status: 400 },
      );
    }

    const workspace = getWorkspace(sessionId);
    if (!workspace) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const result = buildWebsite(workspace.workspacePath, sessionId);

    return Response.json({
      success: result.success,
      previewUrl: `/api/preview/${sessionId}`,
      errors: result.errors || [],
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    );
  }
}
