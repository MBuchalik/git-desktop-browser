export function buildBlobOrTreeRef(
  commitIsh: string,
  itemPath: string[],
): string {
  if (itemPath.length < 1) {
    return commitIsh;
  }

  const itemPathAsString = itemPath.join('/');

  return `${commitIsh}:${itemPathAsString}`;
}
