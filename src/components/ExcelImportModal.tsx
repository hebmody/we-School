import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { downloadEmployeeTemplate } from '../utils/exportTools';

interface ExcelImportModalProps {
  onClose: () => void;
  onImportSuccess: (importedCount: number) => void;
  onBulkImport: (rows: any[]) => Promise<{ importedCount: number; errors: string[]; message: string }>;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  onClose,
  onImportSuccess,
  onBulkImport,
}) => {
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [statusResult, setStatusResult] = useState<{
    success: boolean;
    importedCount: number;
    errors: string[];
    message: string;
  } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setStatusResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        // Normalize keys into standard employee row objects
        const normalized = json.map((row: any) => ({
          fullName: row['الاسم الرباعي'] || row['الاسم'] || row['اسم الموظف'] || row['fullName'],
          nationalId: row['الرقم القومي'] || row['nationalId'],
          birthDate: row['تاريخ الميلاد'] || row['birthDate'],
          gender: row['النوع'] || row['gender'],
          phone: row['رقم الهاتف'] || row['الهاتف'] || row['phone'],
          email: row['البريد الإلكتروني'] || row['email'],
          address: row['العنوان'] || row['address'],
          department: row['القسم'] || row['department'],
          specialization: row['التخصص'] || row['specialization'],
          jobTitle: row['المسمى الوظيفي'] || row['jobTitle'],
          contractType: row['نوع التعاقد'] || row['contractType'],
          hiringEntity: row['جهة التعيين'] || row['hiringEntity'],
          hireDate: row['تاريخ التعيين'] || row['hireDate'],
          schoolStartDate: row['تاريخ استلام العمل'] || row['schoolStartDate'],
        }));

        setParsedRows(normalized);
      } catch (err) {
        alert('حدث خطأ أثناء قراءة ملف الإكسيل. يرجى التأكد من التنسيق.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const executeImport = async () => {
    if (parsedRows.length === 0) return;

    setImporting(true);
    try {
      const res = await onBulkImport(parsedRows);
      setStatusResult({
        success: true,
        importedCount: res.importedCount,
        errors: res.errors,
        message: res.message,
      });
      onImportSuccess(res.importedCount);
    } catch (err: any) {
      alert(err.message || 'خطأ أثناء الاستيراد');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-4 text-xs text-slate-800 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                استيراد سجلات العاملين من ملف Excel (.xlsx)
              </h3>
              <p className="text-[11px] text-slate-500">
                إضافة جماعية سريعة لقاعدة بيانات مدرسة وي بالمنيا مع التدقيق الآلي
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Download Prompt */}
        <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-lg flex items-center justify-between gap-3">
          <div className="text-[11px] text-purple-900">
            للحصول على أفضل نتيجة، يمكنك تنزيل النموذج المعتمد لإدخال العاملين:
          </div>
          <button
            onClick={downloadEmployeeTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-purple-300 text-purple-800 rounded font-bold hover:bg-purple-100 transition-colors shrink-0 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تنزيل النموذج الفارغ (.xlsx)</span>
          </button>
        </div>

        {/* File Picker Zone */}
        {!statusResult && (
          <div className="p-6 border-2 border-dashed border-slate-300 hover:border-purple-400 rounded-xl bg-slate-50 text-center space-y-2 transition-colors">
            <Upload className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="font-bold text-slate-700">اسحب وأفلت ملف Excel هنا أو اضغط للاختيار</div>
            <p className="text-[11px] text-slate-500">يدعم امتدادات .xlsx و .xls و .csv</p>
            <label className="inline-block mt-2 px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded font-bold cursor-pointer transition-colors">
              <span>تحديد الملف من جهازك</span>
              <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="hidden" />
            </label>
            {fileName && <div className="text-[11px] font-mono text-purple-900 font-bold mt-2">تم اختيار: {fileName}</div>}
          </div>
        )}

        {/* Preview Table */}
        {parsedRows.length > 0 && !statusResult && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>معاينة السجلات الجاهزة للاستيراد ({parsedRows.length} سجل):</span>
            </div>

            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
              <table className="w-full text-[11px] text-right divide-y divide-slate-200">
                <thead className="bg-slate-50 font-bold sticky top-0">
                  <tr>
                    <th className="p-2">الاسم الرباعي</th>
                    <th className="p-2">الرقم القومي</th>
                    <th className="p-2">القسم</th>
                    <th className="p-2">المسمى الوظيفي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.slice(0, 10).map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2 font-semibold text-slate-900">{r.fullName || 'غير محدد'}</td>
                      <td className="p-2 font-mono text-slate-600">{r.nationalId || '-'}</td>
                      <td className="p-2 text-slate-600">{r.department || 'عام'}</td>
                      <td className="p-2 text-slate-600">{r.jobTitle || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsedRows.length > 10 && (
              <div className="text-[10px] text-slate-400 text-center">
                يتم عرض أول 10 سجلات من إجمالي {parsedRows.length} سجل
              </div>
            )}
          </div>
        )}

        {/* Result Message after import */}
        {statusResult && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{statusResult.message}</span>
            </div>

            {statusResult.errors.length > 0 && (
              <div className="text-[11px] text-rose-700 bg-white p-2 rounded border border-rose-200 space-y-1">
                <span className="font-bold block">ملاحظات التحقق:</span>
                {statusResult.errors.map((err, i) => (
                  <div key={i}>• {err}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-semibold cursor-pointer"
          >
            {statusResult ? 'إغلاق' : 'إلغاء'}
          </button>

          {!statusResult && parsedRows.length > 0 && (
            <button
              onClick={executeImport}
              disabled={importing}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded font-bold shadow-xs cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>{importing ? 'جارٍ الاستيراد والحفظ...' : `استيراد ${parsedRows.length} موظف`}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
