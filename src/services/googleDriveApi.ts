export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
}

export type DriveFilterType = 'all' | 'folders' | 'documents';

export function buildDriveListQuery(
  searchTerm: string,
  filterType: DriveFilterType = 'all'
): string {
  const parts: string[] = ['trashed = false'];

  const sanitized = searchTerm.trim().replace(/['\\]/g, '');
  if (sanitized.length > 0) {
    parts.push(`name contains '${sanitized}'`);
  }

  if (filterType === 'folders') {
    parts.push("mimeType = 'application/vnd.google-apps.folder'");
  } else if (filterType === 'documents') {
    parts.push("mimeType != 'application/vnd.google-apps.folder'");
  }

  return parts.join(' and ');
}

export function formatFileSize(sizeStr?: string): string {
  if (!sizeStr) return '—';
  const bytes = Number(sizeStr);
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function buildMultipartBody(
  metadata: Record<string, unknown>,
  content: string,
  mimeType: string,
  boundary = 'jizan_drive_boundary_2026'
): { body: string; contentType: string } {
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const body =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}; charset=UTF-8\r\n\r\n` +
    content +
    closeDelimiter;

  return {
    body,
    contentType: `multipart/related; boundary=${boundary}`,
  };
}

async function parseDriveResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson?.error?.message) {
        detail = errJson.error.message;
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(detail);
  }
  if (res.status === 204) {
    return {} as T;
  }
  return (await res.json()) as T;
}

export async function listDriveFiles(
  accessToken: string,
  options?: { search?: string; filter?: DriveFilterType; pageSize?: number }
): Promise<DriveFileItem[]> {
  const q = buildDriveListQuery(options?.search || '', options?.filter || 'all');
  const params = new URLSearchParams({
    q,
    pageSize: String(options?.pageSize ?? 25),
    orderBy: 'modifiedTime desc',
    fields: 'files(id,name,mimeType,modifiedTime,size,webViewLink)',
  });

  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await parseDriveResponse<{ files?: DriveFileItem[] }>(res);
  return data.files || [];
}

export async function findDriveFileByName(
  accessToken: string,
  name: string
): Promise<DriveFileItem | null> {
  const safeName = name.trim().replace(/['\\]/g, '');
  const params = new URLSearchParams({
    q: `trashed = false and name = '${safeName}'`,
    pageSize: '1',
    fields: 'files(id,name,mimeType,modifiedTime,size,webViewLink)',
  });

  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await parseDriveResponse<{ files?: DriveFileItem[] }>(res);
  return data.files?.[0] || null;
}

export async function uploadNewDriveFile(
  accessToken: string,
  params: { name: string; content: string; mimeType: string; description?: string }
): Promise<DriveFileItem> {
  const { body, contentType } = buildMultipartBody(
    {
      name: params.name,
      mimeType: params.mimeType,
      description:
        params.description || 'تم الحفظ من تطبيق مصنع جيزان M&B للصناعات البلاستيكية',
    },
    params.content,
    params.mimeType
  );

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,size,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': contentType,
      },
      body,
    }
  );

  return parseDriveResponse<DriveFileItem>(res);
}

export async function overwriteDriveFile(
  accessToken: string,
  fileId: string,
  content: string,
  mimeType: string
): Promise<DriveFileItem> {
  const res = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(fileId)}?uploadType=media&fields=id,name,mimeType,modifiedTime,size,webViewLink`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `${mimeType}; charset=UTF-8`,
      },
      body: content,
    }
  );

  return parseDriveResponse<DriveFileItem>(res);
}

export async function renameDriveFile(
  accessToken: string,
  fileId: string,
  newName: string
): Promise<DriveFileItem> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?fields=id,name,mimeType,modifiedTime,size,webViewLink`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newName.trim() }),
    }
  );

  return parseDriveResponse<DriveFileItem>(res);
}

export async function deleteDriveFile(accessToken: string, fileId: string): Promise<void> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  await parseDriveResponse<Record<string, never>>(res);
}

export async function downloadDriveFileText(
  accessToken: string,
  fileId: string
): Promise<string> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`تعذر تنزيل الملف (HTTP ${res.status})`);
  }
  return res.text();
}
