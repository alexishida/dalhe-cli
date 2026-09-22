export const COMMIT_SHA = 'a'.repeat(40);
export const TREE_SHA = 'b'.repeat(40);

export function createGitHubFetch(files, { calls = [], failPath, treeEntries, truncated = false } = {}) {
  return async (url) => {
    calls.push(url);
    const api = 'https://api.github.com/repos/alexishida/dalhe-cli';
    if (url === `${api}/commits/HEAD`) {
      return Response.json({ sha: COMMIT_SHA, commit: { tree: { sha: TREE_SHA } } });
    }
    if (url === `${api}/git/trees/${TREE_SHA}?recursive=1`) {
      return Response.json({
        truncated,
        tree: treeEntries ?? Object.keys(files).map((path) => ({
          path: `src/template/skills/${path}`,
          type: 'blob',
          mode: path.endsWith('.sh') ? '100755' : '100644',
        })),
      });
    }
    const prefix = `https://raw.githubusercontent.com/alexishida/dalhe-cli/${COMMIT_SHA}/src/template/skills/`;
    if (url.startsWith(prefix)) {
      const path = decodeURIComponent(url.slice(prefix.length));
      if (path === failPath) return new Response('unavailable', { status: 503 });
      if (Object.hasOwn(files, path)) return new Response(files[path]);
    }
    throw new Error(`Unexpected GitHub request: ${url}`);
  };
}
