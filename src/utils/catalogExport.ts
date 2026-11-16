import {
  FACTORY_CONTACT,
  INTRODUCTORY_CATALOG_SECTIONS,
  QUALITY_PIPELINE_STEPS,
  QUALITY_TESTS,
} from '../data/catalogProfile';
import { DIGITAL_CATALOG } from '../data/factoryData';

export interface SpecRowExport {
  field: string;
  description: string;
  statusText: string;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildCatalogDocumentHtml(
  specRows: SpecRowExport[],
  options?: { baseUrl?: string; forWord?: boolean }
): string {
  const baseUrl = (options?.baseUrl || '').replace(/\/+$/, '');
  const logoUrl = baseUrl
    ? `${baseUrl}${FACTORY_CONTACT.logoSrc}`
    : FACTORY_CONTACT.logoSrc;

  const sectionsHtml = INTRODUCTORY_CATALOG_SECTIONS.map((sec) => {
    const cardsHtml = sec.cards?.length
      ? `<div class="cards">${sec.cards
          .map(
            (c) => `
          <div class="card">
            ${c.tag ? `<div class="tag">${escapeHtml(c.tag)}</div>` : ''}
            <h4>${escapeHtml(c.title)}</h4>
            <p>${escapeHtml(c.description)}</p>
          </div>`
          )
          .join('')}</div>`
      : '';

    const bulletsHtml = sec.bullets?.length
      ? `<ul>${sec.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>`
      : '';

    const noteHtml = sec.note
      ? `<div class="note">${escapeHtml(sec.note)}</div>`
      : '';

    return `
      <section class="section">
        <h2><span class="num">${escapeHtml(sec.number)}</span> ${escapeHtml(sec.title)}</h2>
        ${sec.subtitle ? `<p class="subtitle">${escapeHtml(sec.subtitle)}</p>` : ''}
        <p>${escapeHtml(sec.summary)}</p>
        ${cardsHtml}
        ${bulletsHtml}
        ${noteHtml}
      </section>`;
  }).join('\n');

  const catalogTablesHtml = DIGITAL_CATALOG.map(
    (cat) => `
    <div class="cat-block">
      <h3>${escapeHtml(cat.name)} — ${escapeHtml(cat.nameEn)}</h3>
      <p>${escapeHtml(cat.description)}</p>
      <table>
        <thead>
          <tr>
            <th>المنتج</th>
            <th>الوصف</th>
            <th>المقاسات المتوفرة</th>
            <th>اللون والهوية</th>
            <th>التعبئة</th>
          </tr>
        </thead>
        <tbody>
          ${cat.items
            .map(
              (item) => `
            <tr>
              <td><strong>${escapeHtml(item.name)}</strong></td>
              <td>${escapeHtml(item.description)}</td>
              <td dir="ltr">${escapeHtml(item.availableSizes.join(' · '))}</td>
              <td>${escapeHtml(item.color)}</td>
              <td>${escapeHtml(item.packaging)}</td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>`
  ).join('\n');

  const specRowsHtml = specRows
    .map(
      (row) => `
      <tr>
        <td><strong>${escapeHtml(row.field)}</strong></td>
        <td>${escapeHtml(row.description)}</td>
        <td><span class="badge">${escapeHtml(row.statusText)}</span></td>
      </tr>`
    )
    .join('\n');

  const wordNamespace = options?.forWord
    ? ' xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"'
    : '';

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl"${wordNamespace}>
<head>
  <meta charset="UTF-8" />
  <title>كتالوج ${escapeHtml(FACTORY_CONTACT.brandAr)}</title>
  <style>
    body {
      font-family: 'Tajawal', 'Segoe UI', Tahoma, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 28px;
      line-height: 1.7;
      direction: rtl;
    }
    .header {
      border-bottom: 3px solid #C81D25;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      color: #071827;
      margin: 8px 0 4px;
    }
    .brand-en {
      font-size: 13px;
      font-weight: 700;
      color: #0A73C7;
      letter-spacing: 0.5px;
    }
    .slogan {
      font-size: 15px;
      font-weight: 700;
      color: #C81D25;
      margin-top: 6px;
    }
    .section {
      margin-bottom: 22px;
      padding: 16px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      page-break-inside: avoid;
    }
    h2 {
      font-size: 17px;
      color: #071827;
      margin: 0 0 8px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
    }
    h3 {
      font-size: 15px;
      color: #0A73C7;
      margin: 14px 0 6px;
    }
    .num {
      display: inline-block;
      background: #C81D25;
      color: #ffffff;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 13px;
      margin-left: 6px;
    }
    .subtitle {
      font-weight: 700;
      color: #0A73C7;
      font-size: 13px;
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-top: 10px;
    }
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 10px;
      border-radius: 6px;
    }
    .card h4 {
      margin: 0 0 4px;
      font-size: 13px;
      color: #071827;
    }
    .card p {
      margin: 0;
      font-size: 12px;
      color: #334155;
    }
    .tag {
      font-size: 11px;
      font-weight: 700;
      color: #0A73C7;
      margin-bottom: 3px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 12px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px;
      text-align: right;
    }
    th {
      background: #071827;
      color: #ffffff;
    }
    .badge {
      font-weight: 700;
      color: #0A73C7;
    }
    .note {
      margin-top: 10px;
      padding: 8px 12px;
      background: #fef3c7;
      border: 1px solid #f59e0b;
      font-size: 12px;
      font-weight: 700;
    }
    .contact-footer {
      margin-top: 24px;
      padding: 16px;
      background: #071827;
      color: #ffffff;
      border-radius: 8px;
    }
    .contact-footer a {
      color: #7dd3fc;
    }
  </style>
</head>
<body>
  <div class="header">
    ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(FACTORY_CONTACT.brandAr)}" height="54" />` : ''}
    <div class="brand-title">${escapeHtml(FACTORY_CONTACT.brandAr)}</div>
    <div class="brand-en">${escapeHtml(FACTORY_CONTACT.brandEn)}</div>
    <div class="slogan">${escapeHtml(FACTORY_CONTACT.slogan)} — ${escapeHtml(FACTORY_CONTACT.tagline)}</div>
    <p style="font-size:12px;color:#334155;margin:6px 0 0;">
      العنوان: ${escapeHtml(FACTORY_CONTACT.addressAr)} | الهاتف والواتساب: ${escapeHtml(FACTORY_CONTACT.phoneDisplay)}
    </p>
  </div>

  ${sectionsHtml}

  <section class="section">
    <h2>تشكيلة المنتجات المعتمدة (JIZAN &amp; M&amp;B)</h2>
    ${catalogTablesHtml}
  </section>

  <section class="section">
    <h2>هيكل جدول المواصفات الفنية الرسمي</h2>
    <p>تُدرج السماكات والأوزان وفئات الضغط (PN / SDR) حصريًا وفق جداول المصنع الرسمية المعتمدة لكل فئة ومقاس.</p>
    <table>
      <thead>
        <tr>
          <th>البند الفني</th>
          <th>الوصف والمعايير المرتبطة</th>
          <th>مرجع الاعتماد</th>
        </tr>
      </thead>
      <tbody>
        ${specRowsHtml}
      </tbody>
    </table>
  </section>

  <section class="section">
    <h2>مراحل ضبط الجودة والفحوصات المعتمدة</h2>
    <p><strong>مسار الجودة (9 مراحل):</strong> ${escapeHtml(QUALITY_PIPELINE_STEPS.join(' ← '))}</p>
    <p><strong>الفحوصات الفنية:</strong> ${escapeHtml(QUALITY_TESTS.join(' · '))}</p>
  </section>

  <div class="contact-footer">
    <h3 style="color:#ffffff;margin-top:0;">بيانات التواصل الرسمية — ${escapeHtml(FACTORY_CONTACT.brandAr)}</h3>
    <p><strong>العنوان:</strong> ${escapeHtml(FACTORY_CONTACT.addressAr)}</p>
    <p><strong>الهاتف والواتساب:</strong> ${escapeHtml(FACTORY_CONTACT.phoneDisplay)} (${escapeHtml(FACTORY_CONTACT.phoneIntl)})</p>
    <p>
      <strong>ملف المصنع على Google:</strong> <a href="${escapeHtml(FACTORY_CONTACT.googleProfileShareUrl)}">${escapeHtml(FACTORY_CONTACT.googleProfileShareUrl)}</a><br />
      <strong>خرائط Google:</strong> <a href="${escapeHtml(FACTORY_CONTACT.googleMapsUrl)}">${escapeHtml(FACTORY_CONTACT.googleMapsUrl)}</a><br />
      <strong>صفحة Facebook الرسمية:</strong> <a href="${escapeHtml(FACTORY_CONTACT.facebookUrl)}">${escapeHtml(FACTORY_CONTACT.facebookUrl)}</a>
    </p>
  </div>
</body>
</html>`;
}

export function triggerFileDownload(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob(['\uFEFF', content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
