import AsyncStorage from '@react-native-async-storage/async-storage';

type ErrorSource = 'global' | 'unhandledrejection' | 'manual';

export interface RuntimeErrorEntry {
  id: string;
  timestamp: string;
  source: ErrorSource;
  isFatal: boolean;
  message: string;
  stack: string;
}

const STORAGE_KEY = 'pixelpaw.runtime-errors';
const MAX_ENTRIES = 40;
const MAX_MESSAGE_LENGTH = 280;
const MAX_STACK_LENGTH = 1200;
let installed = false;

const DIAGNOSTIC_REDACTIONS: Array<[RegExp, string]> = [
  [/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '<email>'],
  [/\bfile:\/\/[^\s)\]]+/gi, 'file://<redacted>'],
  [/\b(?:\/Users\/[^\s)\]]+|\/private\/var\/[^\s)\]]+|\/var\/[^\s)\]]+|\/data\/[^\s)\]]+|\/storage\/[^\s)\]]+|[A-Za-z]:\\[^\s)\]]+)/g, '<path>'],
  [/([?&](?:token|secret|password|auth|authorization|api[_-]?key|session|cookie)=)[^&\s]+/gi, '$1<redacted>'],
  [/((?:token|secret|password|auth(?:orization)?|api[_-]?key|session|cookie)\s*[:=]\s*)([^\s,;]+)/gi, '$1<redacted>'],
  [/\bBearer\s+[A-Za-z0-9\-._~+/]+=*\b/gi, 'Bearer <redacted>'],
];

const truncateDiagnosticText = (value: string, limit: number): string => {
  if (value.length <= limit) return value;
  return `${value.slice(0, Math.max(0, limit - 13))}… [truncated]`;
};

const sanitizeDiagnosticText = (value: string, limit: number): string => {
  let sanitized = value.replace(/\r\n/g, '\n').trim();
  for (const [pattern, replacement] of DIAGNOSTIC_REDACTIONS) {
    sanitized = sanitized.replace(pattern, replacement);
  }
  return truncateDiagnosticText(sanitized, limit);
};

const stringifyUnknownError = (input: unknown): string => {
  try {
    return JSON.stringify(input ?? 'Unknown runtime error');
  } catch {
    return String(input ?? 'Unknown runtime error');
  }
};

const toErrorParts = (input: unknown): { message: string; stack: string } => {
  if (input instanceof Error) {
    return {
      message: sanitizeDiagnosticText(input.message || 'Unknown runtime error', MAX_MESSAGE_LENGTH),
      stack: sanitizeDiagnosticText(input.stack || '', MAX_STACK_LENGTH),
    };
  }
  if (typeof input === 'string') {
    return {
      message: sanitizeDiagnosticText(input, MAX_MESSAGE_LENGTH),
      stack: '',
    };
  }
  return {
    message: sanitizeDiagnosticText(stringifyUnknownError(input), MAX_MESSAGE_LENGTH),
    stack: '',
  };
};

const readLogs = async (): Promise<RuntimeErrorEntry[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RuntimeErrorEntry[]) : [];
  } catch {
    return [];
  }
};

const writeLogs = async (logs: RuntimeErrorEntry[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(0, MAX_ENTRIES)));
  } catch {
    // ignore persistence failure to avoid crashing user flow
  }
};

export async function recordRuntimeError(
  input: unknown,
  options?: { source?: ErrorSource; isFatal?: boolean }
): Promise<void> {
  const { message, stack } = toErrorParts(input);
  const nextEntry: RuntimeErrorEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    source: options?.source ?? 'manual',
    isFatal: options?.isFatal ?? false,
    message,
    stack,
  };

  const current = await readLogs();
  await writeLogs([nextEntry, ...current]);
}

export async function getRuntimeErrorLogs(limit = 10): Promise<RuntimeErrorEntry[]> {
  const logs = await readLogs();
  return logs.slice(0, Math.max(1, limit));
}

export async function clearRuntimeErrorLogs(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export async function buildRuntimeErrorReport(limit = 6): Promise<string> {
  const logs = await getRuntimeErrorLogs(limit);
  if (logs.length === 0) {
    return 'No recent runtime errors logged.';
  }

  return logs
    .map((entry, index) => {
      const fatalTag = entry.isFatal ? 'fatal' : 'non-fatal';
      const head = `${index + 1}. [${entry.timestamp}] [${entry.source}] [${fatalTag}] ${entry.message}`;
      if (!entry.stack) return head;
      const firstStackLine = entry.stack.split('\n')[0];
      return `${head}\n   ${firstStackLine}`;
    })
    .join('\n');
}

export function installRuntimeErrorLogger() {
  if (installed) return;
  installed = true;

  const globalAny = globalThis as typeof globalThis & {
    ErrorUtils?: {
      getGlobalHandler?: () => ((error: unknown, isFatal?: boolean) => void) | undefined;
      setGlobalHandler?: (handler: (error: unknown, isFatal?: boolean) => void) => void;
    };
    onUnhandled?: unknown;
    onunhandledrejection?: ((event: { reason?: unknown }) => unknown) | null;
    addEventListener?: (type: string, listener: (event: { reason?: unknown }) => void) => void;
  };

  const currentGlobalHandler = globalAny.ErrorUtils?.getGlobalHandler?.();
  globalAny.ErrorUtils?.setGlobalHandler?.((error, isFatal) => {
    void recordRuntimeError(error, { source: 'global', isFatal: Boolean(isFatal) });
    if (currentGlobalHandler) {
      currentGlobalHandler(error, isFatal);
    }
  });

  const rejectionListener = (event: { reason?: unknown }) => {
    void recordRuntimeError(event?.reason ?? event, { source: 'unhandledrejection', isFatal: false });
  };

  if (typeof globalAny.addEventListener === 'function') {
    globalAny.addEventListener('unhandledrejection', rejectionListener);
  } else {
    const previous = globalAny.onunhandledrejection;
    globalAny.onunhandledrejection = (event) => {
      rejectionListener(event ?? {});
      if (typeof previous === 'function') {
        return previous(event ?? {});
      }
      return false;
    };
  }
}
