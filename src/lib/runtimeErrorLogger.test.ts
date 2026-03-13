import AsyncStorage from '@react-native-async-storage/async-storage';

import { buildRuntimeErrorReport, clearRuntimeErrorLogs, recordRuntimeError } from './runtimeErrorLogger';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('runtimeErrorLogger', () => {
  const asyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

  beforeEach(() => {
    jest.clearAllMocks();
    asyncStorage.getItem.mockResolvedValue(null);
    asyncStorage.setItem.mockResolvedValue();
    asyncStorage.removeItem.mockResolvedValue();
  });

  it('redacts sensitive diagnostics before persisting', async () => {
    const error = new Error(
      'Request failed token=abc123 email=test@example.com file:///Users/heo1408/private.png'
    );
    error.stack = 'Error: boom\n    at file:///Users/heo1408/private.png:1:1';

    await recordRuntimeError(error, { source: 'manual', isFatal: false });

    expect(asyncStorage.setItem).toHaveBeenCalledTimes(1);
    const [, serialized] = asyncStorage.setItem.mock.calls[0];
    const [entry] = JSON.parse(serialized);

    expect(entry.message).toContain('token=<redacted>');
    expect(entry.message).toContain('<email>');
    expect(entry.message).not.toContain('abc123');
    expect(entry.message).not.toContain('test@example.com');
    expect(entry.message).not.toContain('/Users/heo1408');
    expect(entry.stack).toContain('file://<redacted>');
  });

  it('builds a redacted report from stored entries', async () => {
    asyncStorage.getItem.mockResolvedValue(JSON.stringify([
      {
        id: '1',
        timestamp: '2026-03-10T00:00:00.000Z',
        source: 'global',
        isFatal: true,
        message: 'Authorization: <redacted>',
        stack: 'at file://<redacted>:1:1\nsecond line',
      },
    ]));

    const report = await buildRuntimeErrorReport(5);

    expect(report).toContain('[global] [fatal] Authorization: <redacted>');
    expect(report).toContain('file://<redacted>');
    expect(report).not.toContain('second line');
  });

  it('clears persisted logs', async () => {
    await clearRuntimeErrorLogs();

    expect(asyncStorage.removeItem).toHaveBeenCalledWith('pixelpaw.runtime-errors');
  });
});
