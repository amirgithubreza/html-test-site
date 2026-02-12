// ====================================================================
// File System Access API wrapper for live auto-saving user data
// Supports Chrome, Edge, Opera (Chromium-based browsers).
// Falls back to manual download/upload for Firefox & Safari.
// Full Unicode/Persian support via UTF-8 encoding.
// ====================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let fileHandle: any = null;
let connected = false;
let lastSync: string | null = null;
let syncing = false;
let statusCb: ((c: boolean, t: string | null) => void) | null = null;

// ===== Status =====
export function supportsFileSystemAccess(): boolean {
  return typeof window !== 'undefined' && 'showSaveFilePicker' in window;
}

export function isFileConnected(): boolean { return connected; }
export function getLastSyncTime(): string | null { return lastSync; }
export function getFileName(): string | null { return fileHandle?.name ?? null; }

export function setStatusCallback(cb: (c: boolean, t: string | null) => void): void {
  statusCb = cb;
}

function updateStatus(c: boolean, t: string | null): void {
  connected = c;
  lastSync = t;
  statusCb?.(c, t);
}

// ===== Build data snapshot =====
function buildData(): string {
  return JSON.stringify({
    appName: 'CodeQuiz',
    lastUpdated: new Date().toISOString(),
    users: JSON.parse(localStorage.getItem('cq_users') || '[]'),
    results: JSON.parse(localStorage.getItem('cq_results') || '[]'),
    settings: JSON.parse(localStorage.getItem('cq_settings') || '{}'),
  }, null, 2);
}

// ===== Connect a file for auto-saving =====
export async function connectFile(): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fileHandle = await (window as any).showSaveFilePicker({
      suggestedName: 'codequiz-data.json',
      types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }],
    });
    updateStatus(true, null);
    await syncNow();
    return true;
  } catch {
    return false;
  }
}

// ===== Load data from existing file & connect for future saves =====
export async function loadFromFile(): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [handle] = await (window as any).showOpenFilePicker({
      types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }],
    });
    const file = await handle.getFile();
    const text = await file.text();
    const data = JSON.parse(text);

    if (data.users) localStorage.setItem('cq_users', JSON.stringify(data.users));
    if (data.results) localStorage.setItem('cq_results', JSON.stringify(data.results));
    if (data.settings) localStorage.setItem('cq_settings', JSON.stringify(data.settings));

    fileHandle = handle;
    updateStatus(true, new Date().toLocaleTimeString());
    return true;
  } catch {
    return false;
  }
}

// ===== Write current data to connected file =====
export async function syncNow(): Promise<boolean> {
  if (!fileHandle || syncing) return false;
  syncing = true;
  try {
    const writable = await fileHandle.createWritable();
    await writable.write(buildData());
    await writable.close();
    updateStatus(true, new Date().toLocaleTimeString());
    syncing = false;
    return true;
  } catch (err) {
    console.error('File sync error:', err);
    syncing = false;
    return false;
  }
}

// ===== Disconnect file =====
export function disconnectFile(): void {
  fileHandle = null;
  updateStatus(false, null);
}

// ===== Fallback: download data file (all browsers) =====
export function downloadDataFile(): void {
  const blob = new Blob([buildData()], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'codequiz-data.json';
  a.click();
  URL.revokeObjectURL(url);
}

// ===== Fallback: load from uploaded file (all browsers) =====
export function loadFromUploadedFile(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.users) localStorage.setItem('cq_users', JSON.stringify(data.users));
        if (data.results) localStorage.setItem('cq_results', JSON.stringify(data.results));
        if (data.settings) localStorage.setItem('cq_settings', JSON.stringify(data.settings));
        updateStatus(false, new Date().toLocaleTimeString());
        resolve(true);
      } catch {
        resolve(false);
      }
    };
    reader.onerror = () => resolve(false);
    reader.readAsText(file, 'utf-8');
  });
}

// ===== Debounced sync (called automatically on data changes) =====
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function debouncedSync(): void {
  if (!connected || !fileHandle) return;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    syncNow();
  }, 500);
}
