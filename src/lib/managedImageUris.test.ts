import * as FileSystem from 'expo-file-system/legacy';

import {
  MANAGED_MASK_FILE_PREFIX,
  buildManagedMaskUri,
  cleanupManagedImageUri,
  isManagedImageUri,
} from './managedImageUris';

jest.mock('expo-file-system/legacy', () => ({
  deleteAsync: jest.fn(),
}));

describe('managedImageUris', () => {
  const deleteAsyncMock = FileSystem.deleteAsync as jest.MockedFunction<typeof FileSystem.deleteAsync>;

  beforeEach(() => {
    jest.clearAllMocks();
    deleteAsyncMock.mockResolvedValue();
  });

  it('builds and detects managed mask uris', () => {
    const uri = buildManagedMaskUri('/cache/', 123);

    expect(uri).toBe(`/cache/${MANAGED_MASK_FILE_PREFIX}123.png`);
    expect(isManagedImageUri(uri)).toBe(true);
    expect(isManagedImageUri('/cache/other-file.png')).toBe(false);
  });

  it('deletes unretained managed images only', async () => {
    const uri = '/cache/lasso-mask-123.png';

    await expect(cleanupManagedImageUri(uri, ['/cache/lasso-mask-999.png'])).resolves.toBe(true);
    expect(deleteAsyncMock).toHaveBeenCalledWith(uri, { idempotent: true });
  });

  it('skips non-managed or retained image uris', async () => {
    await expect(cleanupManagedImageUri('/cache/photo.png')).resolves.toBe(false);
    await expect(cleanupManagedImageUri('/cache/lasso-mask-123.png', ['/cache/lasso-mask-123.png'])).resolves.toBe(false);
    expect(deleteAsyncMock).not.toHaveBeenCalled();
  });
});
