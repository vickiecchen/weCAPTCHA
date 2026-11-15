const EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif']

/** Match a file dropped in a challenge `assets/` folder by name, ignoring extension. */
export function findAsset(files: Record<string, string>, stem: string): string | undefined {
  const suffixes = EXTENSIONS.map((ext) => `/${stem.toLowerCase()}.${ext}`)
  for (const [path, url] of Object.entries(files)) {
    const lower = path.toLowerCase()
    if (suffixes.some((suffix) => lower.endsWith(suffix))) return url
  }
  return undefined
}
