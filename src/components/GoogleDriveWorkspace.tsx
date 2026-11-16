import React, { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import {
  CloudUpload,
  FolderOpen,
  Search,
  RefreshCw,
  Trash2,
  Pencil,
  Download,
  ExternalLink,
  LogOut,
  FileText,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  X,
  HardDrive,
} from 'lucide-react';
import {
  initAuth,
  googleSignIn,
  getAccessToken,
  logoutGoogleAuth,
} from '../services/googleAuth';
import {
  DriveFileItem,
  DriveFilterType,
  listDriveFiles,
  findDriveFileByName,
  uploadNewDriveFile,
  overwriteDriveFile,
  renameDriveFile,
  deleteDriveFile,
  downloadDriveFileText,
  formatFileSize,
} from '../services/googleDriveApi';
import { buildCatalogDocumentHtml, SpecRowExport, triggerFileDownload } from '../utils/catalogExport';
import { GoogleSignInButton } from './GoogleSignInButton';
import { useToast } from '../context/ToastContext';
import { soundEffects } from '../utils/soundEffects';

interface GoogleDriveWorkspaceProps {
  specRows: SpecRowExport[];
  onImportSpecRows: (rows: SpecRowExport[]) => void;
}

type PendingMutation =
  | {
      kind: 'delete';
      file: DriveFileItem;
    }
  | {
      kind: 'overwrite';
      existingFile: DriveFileItem;
      name: string;
      content: string;
      mimeType: string;
    }
  | {
      kind: 'rename';
      file: DriveFileItem;
      nextName: string;
    };

export const GoogleDriveWorkspace: React.FC<GoogleDriveWorkspaceProps> = ({
  specRows,
  onImportSpecRows,
}) => {
  const { showToast } = useToast();
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<DriveFilterType>('all');
  const [pendingMutation, setPendingMutation] = useState<PendingMutation | null>(null);

  const fetchFiles = useCallback(
    async (explicitToken?: string) => {
      const token = explicitToken || (await getAccessToken());
      if (!token) {
        setNeedsAuth(true);
        return;
      }

      setIsLoadingFiles(true);
      setErrorMessage('');
      try {
        const result = await listDriveFiles(token, {
          search: searchTerm,
          filter: filterType,
          pageSize: 25,
        });
        setFiles(result);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'تعذر قراءة الملفات من Google Drive.';
        setErrorMessage(msg);
        if (msg.includes('401') || msg.toLowerCase().includes('invalid credentials')) {
          setNeedsAuth(true);
        }
      } finally {
        setIsLoadingFiles(false);
      }
    },
    [searchTerm, filterType]
  );

  useEffect(() => {
    const unsubscribe = initAuth(
      (signedUser, token) => {
        setUser(signedUser);
        setNeedsAuth(false);
        fetchFiles(token);
      },
      () => {
        setUser(null);
        setFiles([]);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, [fetchFiles]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMessage('');
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
        soundEffects.playSuccessChime();
        showToast({
          title: 'تم ربط حساب Google Drive بنجاح',
          message: `مرحباً ${result.user.displayName || result.user.email || ''} — يمكنك الآن حفظ واستعراض ملفات مصنع جيزان M&B.`,
          variant: 'success',
        });
        await fetchFiles(result.accessToken);
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'تعذر إكمال تسجيل الدخول بحساب Google. تأكد من السماح بالنوافذ المنبثقة.';
      setErrorMessage(msg);
      showToast({
        title: 'تعذر تسجيل الدخول',
        message: msg,
        variant: 'warning',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogleAuth();
    setUser(null);
    setFiles([]);
    setNeedsAuth(true);
    soundEffects.playClick();
    showToast({
      title: 'تم تسجيل الخروج من Google Drive',
      message: 'تم إنهاء الجلسة ومسح رمز الوصول من الذاكرة.',
      variant: 'info',
    });
  };

  const handleSaveAssetToDrive = async (
    kind: 'catalog-html' | 'catalog-word' | 'specs-json'
  ) => {
    const token = await getAccessToken();
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    setIsUploading(true);
    setErrorMessage('');
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      let name = '';
      let content = '';
      let mimeType = 'text/plain';

      if (kind === 'catalog-html') {
        name = 'jizan-mb-catalog.html';
        content = buildCatalogDocumentHtml(specRows, { baseUrl, forWord: false });
        mimeType = 'text/html';
      } else if (kind === 'catalog-word') {
        name = 'jizan-mb-catalog.doc';
        content = buildCatalogDocumentHtml(specRows, { baseUrl, forWord: true });
        mimeType = 'application/msword';
      } else {
        name = 'jizan-mb-technical-specs.json';
        content = JSON.stringify(
          {
            factory: 'مصنع جيزان M&B للصناعات البلاستيكية',
            address: 'الجندية، تعز، الجمهورية اليمنية',
            phone: '776046048',
            updatedAt: new Date().toISOString(),
            specRows,
          },
          null,
          2
        );
        mimeType = 'application/json';
      }

      const existing = await findDriveFileByName(token, name);
      if (existing) {
        // Mandatory explicit confirmation dialog before overwriting an existing Drive file.
        setPendingMutation({
          kind: 'overwrite',
          existingFile: existing,
          name,
          content,
          mimeType,
        });
        setIsUploading(false);
        return;
      }

      const created = await uploadNewDriveFile(token, { name, content, mimeType });
      soundEffects.playSuccessChime();
      showToast({
        title: 'تم الحفظ في Google Drive',
        message: `تم رفع الملف «${created.name}» إلى حسابك في Google Drive بنجاح.`,
        variant: 'success',
      });
      await fetchFiles(token);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء الحفظ في Google Drive.';
      setErrorMessage(msg);
      showToast({
        title: 'تعذر الرفع إلى Google Drive',
        message: msg,
        variant: 'warning',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadFromDrive = async (file: DriveFileItem) => {
    const token = await getAccessToken();
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    try {
      const text = await downloadDriveFileText(token, file.id);
      triggerFileDownload(text, file.name, file.mimeType || 'text/plain');
      soundEffects.playSuccessChime();
      showToast({
        title: 'تم تنزيل الملف من Google Drive',
        message: `تم تنزيل «${file.name}» على جهازك.`,
        variant: 'success',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'تعذر تنزيل الملف من Drive.';
      showToast({
        title: 'تعذر التنزيل',
        message: msg,
        variant: 'warning',
      });
    }
  };

  const handleImportSpecsFromDrive = async (file: DriveFileItem) => {
    const token = await getAccessToken();
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    try {
      const text = await downloadDriveFileText(token, file.id);
      const parsed = JSON.parse(text);
      const rows = Array.isArray(parsed) ? parsed : parsed?.specRows;
      if (
        !Array.isArray(rows) ||
        rows.length === 0 ||
        !rows.every(
          (r: any) =>
            typeof r?.field === 'string' &&
            typeof r?.description === 'string' &&
            typeof r?.statusText === 'string'
        )
      ) {
        throw new Error('تنسيق ملف JSON لا يطابق هيكل جدول المواصفات الفنية.');
      }

      onImportSpecRows(rows);
      soundEffects.playSuccessChime();
      showToast({
        title: 'تم استيراد جدول المواصفات من Google Drive',
        message: `تمت مزامنة ${rows.length} بنود فنية من الملف «${file.name}».`,
        variant: 'success',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'تعذر قراءة ملف المواصفات.';
      showToast({
        title: 'تعذر الاستيراد',
        message: msg,
        variant: 'warning',
      });
    }
  };

  const handleConfirmMutation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pendingMutation) return;

    const token = await getAccessToken();
    if (!token) {
      setPendingMutation(null);
      setNeedsAuth(true);
      return;
    }

    setIsMutating(true);
    try {
      if (pendingMutation.kind === 'delete') {
        await deleteDriveFile(token, pendingMutation.file.id);
        soundEffects.playSuccessChime();
        showToast({
          title: 'تم حذف الملف من Google Drive',
          message: `تم حذف «${pendingMutation.file.name}» بناءً على تأكيدك.`,
          variant: 'info',
        });
      } else if (pendingMutation.kind === 'overwrite') {
        await overwriteDriveFile(
          token,
          pendingMutation.existingFile.id,
          pendingMutation.content,
          pendingMutation.mimeType
        );
        soundEffects.playSuccessChime();
        showToast({
          title: 'تم تحديث الملف في Google Drive',
          message: `تم استبدال محتوى «${pendingMutation.name}» بالنسخة الأحدث بنجاح.`,
          variant: 'success',
        });
      } else if (pendingMutation.kind === 'rename') {
        const cleanName = pendingMutation.nextName.trim();
        if (!cleanName) {
          setIsMutating(false);
          return;
        }
        await renameDriveFile(token, pendingMutation.file.id, cleanName);
        soundEffects.playSuccessChime();
        showToast({
          title: 'تمت إعادة تسمية الملف',
          message: `تم تغيير اسم الملف إلى «${cleanName}».`,
          variant: 'success',
        });
      }

      setPendingMutation(null);
      await fetchFiles(token);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'تعذر تنفيذ العملية في Google Drive.';
      setErrorMessage(msg);
      showToast({
        title: 'فشل تحديث Google Drive',
        message: msg,
        variant: 'warning',
      });
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <section
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6"
      data-testid="google-drive-workspace"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
            <HardDrive className="w-4 h-4" />
            <span>التخزين السحابي والمزامنة · Google Drive</span>
          </div>
          <h3 className="text-xl font-black text-white">
            حفظ ومزامنة كتالوج جيزان M&amp;B وجداول المواصفات في Google Drive
          </h3>
          <p className="text-xs text-slate-400 max-w-2xl">
            اربط حسابك في Google لحفظ نسخ الكتالوج الرسمي (.doc / .html) وجداول المواصفات الفنية
            (.json) واستعراض ملفاتك ومزامنتها بأمان.
          </p>
        </div>

        {!needsAuth && user && (
          <div className="flex flex-wrap items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 shrink-0">
            <div className="text-right">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{user.displayName || 'مستخدم Google متصل'}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono" dir="ltr">
                {user.email}
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        )}
      </div>

      {/* Auth Gate State */}
      {needsAuth ? (
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center space-y-5 max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#0A73C7]/15 border border-[#0A73C7]/30 text-sky-400 flex items-center justify-center mx-auto">
            <CloudUpload className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-black text-white">ربط حساب Google Drive</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              سجّل الدخول بحسابك في Google لمنح التطبيق إذن حفظ ملفات الكتالوج وجداول المواصفات
              المعتمدة وتصفح ملفاتك وإدارتها مباشرةً من Google Drive. لا يُسمح بتعديل أو حذف أي ملف
              إلا بعد تأكيدك الصريح.
            </p>
          </div>

          <div className="flex justify-center pt-1">
            <GoogleSignInButton
              onClick={handleLogin}
              disabled={isLoggingIn}
              label={isLoggingIn ? 'جاري تسجيل الدخول...' : 'Sign in with Google'}
            />
          </div>

          {errorMessage && (
            <p className="text-xs text-red-400 font-semibold">{errorMessage}</p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Save JIZAN M&B Assets */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-white">
                حفظ فوري لملفات مصنع جيزان M&amp;B في Google Drive
              </span>
              <span className="text-[11px] text-slate-400">
                يُنشئ ملفاً جديداً أو يطلب تأكيدك قبل استبدال أي ملف موجود بنفس الاسم
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => handleSaveAssetToDrive('catalog-word')}
                className="bg-[#0A73C7] hover:bg-[#0862a9] disabled:opacity-60 text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition whitespace-nowrap"
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>حفظ كتالوج Word (.doc)</span>
              </button>

              <button
                type="button"
                disabled={isUploading}
                onClick={() => handleSaveAssetToDrive('catalog-html')}
                className="bg-[#C81D25] hover:bg-[#a6171e] disabled:opacity-60 text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition whitespace-nowrap"
              >
                <CloudUpload className="w-4 h-4 shrink-0" />
                <span>حفظ الكتالوج التفاعلي (.html)</span>
              </button>

              <button
                type="button"
                disabled={isUploading}
                onClick={() => handleSaveAssetToDrive('specs-json')}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition whitespace-nowrap"
              >
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                <span>حفظ جدول المواصفات (.json)</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    fetchFiles();
                  }
                }}
                placeholder="ابحث باسم الملف في Google Drive..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-10 pl-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0A73C7]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { id: 'all', label: 'الكل' },
                  { id: 'documents', label: 'المستندات والملفات' },
                  { id: 'folders', label: 'المجلدات' },
                ] as { id: DriveFilterType; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterType(tab.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                    filterType === tab.id
                      ? 'bg-[#0A73C7] text-white'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => fetchFiles()}
                disabled={isLoadingFiles}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition border border-slate-700"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                <span>تحديث</span>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-950/40 border border-red-700/50 text-red-200 px-4 py-3 rounded-xl text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Drive Files Table */}
          <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/80">
            {isLoadingFiles ? (
              <div className="p-8 text-center text-xs text-slate-400">
                جاري تحميل قائمة الملفات من Google Drive...
              </div>
            ) : files.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <FolderOpen className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-bold text-slate-300">
                  لا توجد ملفات مطابقة في Google Drive حالياً.
                </p>
                <p className="text-[11px] text-slate-500">
                  استخدم أزرار الحفظ الفوري أعلاه لرفع كتالوج مصنع جيزان M&amp;B أو جدول المواصفات.
                </p>
              </div>
            ) : (
              <table className="w-full text-right text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 text-[11px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">اسم الملف</th>
                    <th className="py-3 px-4">الحجم</th>
                    <th className="py-3 px-4">آخر تعديل</th>
                    <th className="py-3 px-4">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {files.map((file) => {
                    const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                    const isJsonSpecs =
                      file.name.toLowerCase().endsWith('.json') ||
                      file.mimeType === 'application/json';

                    return (
                      <tr key={file.id} className="hover:bg-slate-900/60">
                        <td className="py-3 px-4 font-bold text-white">
                          <div className="flex items-center gap-2">
                            {isFolder ? (
                              <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                            )}
                            <span className="truncate max-w-xs">{file.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums text-slate-400" dir="ltr">
                          {formatFileSize(file.size)}
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums text-slate-400" dir="ltr">
                          {file.modifiedTime
                            ? new Date(file.modifiedTime).toLocaleDateString('en-CA')
                            : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-[11px] font-bold inline-flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>فتح</span>
                              </a>
                            )}

                            {!isFolder && (
                              <button
                                type="button"
                                onClick={() => handleDownloadFromDrive(file)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Download className="w-3 h-3" />
                                <span>تنزيل</span>
                              </button>
                            )}

                            {isJsonSpecs && (
                              <button
                                type="button"
                                onClick={() => handleImportSpecsFromDrive(file)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-700/40 text-emerald-300 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <span>استيراد للجدول</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                setPendingMutation({
                                  kind: 'rename',
                                  file,
                                  nextName: file.name,
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>إعادة تسمية</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setPendingMutation({
                                  kind: 'delete',
                                  file,
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/70 border border-red-800/40 text-red-300 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>حذف</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Mandatory Explicit Confirmation Dialog for Mutating / Destructive Operations */}
      {pendingMutation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="drive-confirm-dialog-title"
        >
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-right space-y-4">
            <button
              type="button"
              onClick={() => setPendingMutation(null)}
              aria-label="إغلاق نافذة التأكيد"
              className="absolute top-4 left-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 text-amber-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 id="drive-confirm-dialog-title" className="text-base font-black text-white">
                {pendingMutation.kind === 'delete'
                  ? 'تأكيد حذف ملف من Google Drive'
                  : pendingMutation.kind === 'overwrite'
                  ? 'تأكيد استبدال ملف موجود في Google Drive'
                  : 'تأكيد إعادة تسمية ملف في Google Drive'}
              </h4>
            </div>

            {pendingMutation.kind === 'delete' && (
              <p className="text-xs text-slate-300 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف الملف{' '}
                <strong className="text-white">«{pendingMutation.file.name}»</strong> نهائياً من
                Google Drive؟ لا يمكن التراجع عن هذه العملية.
              </p>
            )}

            {pendingMutation.kind === 'overwrite' && (
              <p className="text-xs text-slate-300 leading-relaxed">
                يوجد ملف بنفس الاسم{' '}
                <strong className="text-white">«{pendingMutation.name}»</strong> في Google Drive
                بالفعل. هل تؤكد استبدال محتواه بالنسخة الحالية من الكتالوج؟
              </p>
            )}

            {pendingMutation.kind === 'rename' && (
              <form onSubmit={handleConfirmMutation} className="space-y-3">
                <p className="text-xs text-slate-300">
                  تعديل اسم الملف الحالي: <strong className="text-white">{pendingMutation.file.name}</strong>
                </p>
                <input
                  type="text"
                  value={pendingMutation.nextName}
                  onChange={(e) =>
                    setPendingMutation({ ...pendingMutation, nextName: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0A73C7]"
                  aria-label="الاسم الجديد للملف"
                />
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isMutating || !pendingMutation.nextName.trim()}
                    className="flex-1 bg-[#0A73C7] hover:bg-[#0862a9] disabled:opacity-60 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer transition"
                  >
                    {isMutating ? 'جاري التنفيذ...' : 'تأكيد إعادة التسمية'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingMutation(null)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}

            {pendingMutation.kind !== 'rename' && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={isMutating}
                  onClick={() => handleConfirmMutation()}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer transition disabled:opacity-60 ${
                    pendingMutation.kind === 'delete'
                      ? 'bg-[#C81D25] hover:bg-[#a6171e]'
                      : 'bg-[#0A73C7] hover:bg-[#0862a9]'
                  }`}
                >
                  {isMutating
                    ? 'جاري التنفيذ...'
                    : pendingMutation.kind === 'delete'
                    ? 'تأكيد الحذف'
                    : 'تأكيد الاستبدال'}
                </button>
                <button
                  type="button"
                  onClick={() => setPendingMutation(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
