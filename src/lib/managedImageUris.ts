import * as FileSystem from 'expo-file-system/legacy';

export const MANAGED_MASK_FILE_PREFIX = 'lasso-mask-';

export function buildManagedMaskUri(cacheDirectory: string, timestamp: number = Date.now()): string {
  return `${cacheDirectory}${MANAGED_MASK_FILE_PREFIX}${timestamp}.png`;
}

export function isManagedImageUri(uri: string | null | undefined): uri is string {
  return typeof uri === 'string' && uri.includes(MANAGED_MASK_FILE_PREFIX);
}

export async function cleanupManagedImageUri(
  uri: string | null | undefined,
  retainedUris: Array<string | null | undefined> = []
): Promise<boolean> {
  if (!isManagedImageUri(uri) || retainedUris.includes(uri)) {
    return false;
  }

  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
    return true;
  } catch {
    return false;
  }
}
