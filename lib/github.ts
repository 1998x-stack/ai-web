export async function githubPush(
  _workspaceRoot: string,
  _token: string,
  _repoName?: string,
  _isPrivate?: boolean,
): Promise<{ success: boolean; repoUrl?: string; pagesUrl?: string; error?: string }> {
  throw new Error('GitHub push is not implemented');
}
