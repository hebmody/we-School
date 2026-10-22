import React, { useState } from 'react';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Building,
  Save,
  Server,
  ShieldAlert,
} from 'lucide-react';
import { SchoolInfo, UserAccount } from '../types';

interface SettingsDatabaseProps {
  schoolInfo?: SchoolInfo;
  currentUser: UserAccount;
  onUpdateSchoolInfo: (info: Partial<SchoolInfo>) => Promise<void>;
  onResetDemo: () => Promise<string>;
  onClearDemo: () => Promise<string>;
  onRestoreBackup: (snapshot: any) => Promise<string>;
}

export const SettingsDatabase: React.FC<SettingsDatabaseProps> = ({
  schoolInfo,
  currentUser,
  onUpdateSchoolInfo,
  onResetDemo,
  onClearDemo,
  onRestoreBackup,
}) => {
  const [name, setName] = useState(schoolInfo?.name || 'مدرسة وي للتكنولوجيا التطبيقية بالمنيا');
  const [enName, setEnName] = useState(schoolInfo?.enName || 'WE Applied Technology Secondary School – Minya');
  const [affiliation, setAffiliation] = useState(
    schoolInfo?.affiliation || 'وزارة التربية والتعليم والتعليم الفني بالتعاون مع المصرية للاتصالات WE'
  );
  const [address, setAddress] = useState(schoolInfo?.address || 'محافظة المنيا - المنيا الجديدة - الحي الثالث');
  const [phone, setPhone] = useState(schoolInfo?.phone || '086-2345678');
  const [email, setEmail] = useState(schoolInfo?.email || 'hr@minya.we-ats.edu.eg');
  const [academicYear, setAcademicYear] = useState(schoolInfo?.academicYear || '2024 / 2025');
  const [principalName, setPrincipalName] = useState(schoolInfo?.principalName || 'د. أشرف كامل الصاوي');
  const [hrLeadName, setHrLeadName] = useState(schoolInfo?.hrLeadName || 'أ. مروة حسني الشريف');

  const [savingInfo, setSavingInfo] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const canManage = currentUser.role === 'admin';

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInfo(true);
    try {
      await onUpdateSchoolInfo({
        name,
        enName,
        affiliation,
        address,
        phone,
        email,
        academicYear,
        principalName,
        hrLeadName,
      });
      setStatusMessage('تم تحديث بيانات المدرسة المعتمدة بنجاح');
    } catch (err: any) {
      alert(err.message || 'خطأ أثناء الحفظ');
    } finally {
      setSavingInfo(false);
    }
  };

  const handleDownloadBackup = () => {
    window.open('/api/database/export', '_blank');
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const msg = await onRestoreBackup(json);
        setStatusMessage(msg);
      } catch (err: any) {
        alert('ملف النسخة الاحتياطية غير صالح أو تالف');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSeed = async () => {
    if (confirm('هل تريد إعادة تعيين البيانات التجريبية لمدرسة وي بالمنيا إلى حالتها الافتراضية؟')) {
      const msg = await onResetDemo();
      setStatusMessage(msg);
    }
  };

  const handleClearDemoData = async () => {
    if (
      confirm(
        'تحذير هام للإنتاج الفعلي:\nهل أنت متأكد من تفريغ كافة سجلات الموظفين والمستندات التجريبية استعداداً لبدء الإدخال الحقيقي لبيانات العاملين بالمدرسة؟\n(سيتم الإبقاء على الأقسام والتخصصات وحسابات الإدارة)'
      )
    ) {
      const msg = await onClearDemo();
      setStatusMessage(msg);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 text-purple-700 font-bold text-xs">
          <Database className="w-4 h-4" />
          <span>إعدادات النظام وإدارة قاعدة البيانات الآمنة</span>
        </div>
        <h2 className="text-lg font-black text-slate-900 mt-1">
          بيانات المدرسة والنسخ الاحتياطي وإعدادات الإنتاج
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          إدارة النسخ الاحتياطية، واستعادة البيانات، وتهيئة النظام لبدء الاستخدام الفعلي الرسمي
        </p>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-600 hover:text-emerald-900">
            ✕
          </button>
        </div>
      )}

      {/* School Information Editor */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-bold text-slate-900">
          <Building className="w-4 h-4 text-purple-700" />
          <span>بيانات الترويسة الرسمية للمدرسة (School Information)</span>
        </div>

        <form onSubmit={handleSaveInfo} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">اسم الصرح التعليمي الرسمي</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canManage}
              className="w-full bg-slate-50 border border-slate-200 rounded py-2 px-3 disabled:opacity-60 font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">الاسم باللغة الإنجليزية</label>
            <input
              type="text"
              value={enName}
              onChange={(e) => setEnName(e.target.value)}
              disabled={!canManage}
              className="w-full bg-slate-50 border border-slate-200 rounded py-2 px-3 font-mono disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">العام الدراسي الحالي</label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              disabled={!canManage}
              className="w-full bg-slate-50 border border-slate-200 rounded py-2 px-3 font-mono disabled:opacity-60"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">التبعية والاعتماد الحكومي</label>
            <input
              type="text"
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              disabled={!canManage}
              className="w-full bg-slate-50 border border-slate-200 rounded py-2 px-3 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">اسم السيد مدير المدرسة</label>
            <input
              type="text"
              value={principalName}
              onChange={(e) => setPrincipalName(e.target.value)}
              disabled={!canManage}
              className="w-full bg-slate-50 border border-slate-200 rounded py-2 px-3 disabled:opacity-60 font-semibold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">مسئول شئون العاملين بالمدرسة</label>
            <input
              type="text"
              value={hrLeadName}
              onChange={(e) => setHrLeadName(e.target.value)}
              disabled={!canManage}
              className="w-full bg-slate-50 border border-slate-200 rounded py-2 px-3 disabled:opacity-60 font-semibold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">العنوان والموقع الجغرافي</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={!canManage}
              className="w-full bg-slate-50 border border-slate-200 rounded py-2 px-3 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">هاتف المدرسة للتواصل</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!canManage}
              className="w-full bg-slate-50 border border-slate-200 rounded py-2 px-3 font-mono disabled:opacity-60"
            />
          </div>

          {canManage && (
            <div className="sm:col-span-2 pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingInfo}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{savingInfo ? 'جارٍ الحفظ...' : 'حفظ بيانات الترويسة المعتمدة'}</span>
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Database Operations & Backup */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-sm font-bold text-slate-900">
          <Server className="w-4 h-4 text-purple-700" />
          <span>النسخ الاحتياطي واستعادة قاعدة البيانات (Database Operations)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Download Backup */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-900 block mb-1">تنزيل نسخة احتياطية كاملة (JSON)</span>
              <p className="text-slate-500 leading-relaxed">
                تنزيل ملف يحتوي على كافة الموظفين، المستندات، الأقسام، وحسابات المستخدمين لحفظها في خادم الوزارة أو وحدة تخزين خارجية.
              </p>
            </div>
            <button
              onClick={handleDownloadBackup}
              className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white rounded font-bold flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل النسخة الاحتياطية الآن</span>
            </button>
          </div>

          {/* Restore Backup */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-900 block mb-1">استعادة قاعدة البيانات من ملف</span>
              <p className="text-slate-500 leading-relaxed">
                استرجاع بيانات المنظومة بالكامل من ملف نسخة احتياطية معتمد مسبقاً بصيغة JSON.
              </p>
            </div>
            <label className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold flex items-center justify-center gap-1.5 cursor-pointer mt-2 text-center">
              <Upload className="w-4 h-4" />
              <span>اختيار ملف النسخة الاحتياطية</span>
              <input type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
            </label>
          </div>
        </div>

        {/* Development vs Production Reset Tools */}
        {canManage && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <span className="text-xs font-bold text-slate-800 block">إجراءات الصيانة وبدء التشغيل الفعلي:</span>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleResetSeed}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-purple-700" />
                <span>إعادة ضبط البيانات التجريبية الافتراضية</span>
              </button>

              <button
                onClick={handleClearDemoData}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>تفريغ السجلات التجريبية لبدء التشغيل الفعلي للمدرسة</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
