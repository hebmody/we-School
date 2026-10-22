import React, { useState } from 'react';
import {
  AlertTriangle,
  FileWarning,
  CheckCircle2,
  Printer,
  Plus,
  Trash2,
  Upload,
  User,
  ShieldCheck,
  Search,
  ExternalLink,
} from 'lucide-react';
import { RequiredDocument, Department, UserAccount } from '../types';

interface IncompleteEmployeeItem {
  employeeId: string;
  fullName: string;
  nationalId: string;
  phone: string;
  departmentName: string;
  specializationName?: string;
  jobTitle: string;
  totalRequired: number;
  completedCount: number;
  completionRate: number;
  missingList: string[];
  pendingList: string[];
  fileStatus: string;
}

interface MissingDocumentsProps {
  incompleteList: IncompleteEmployeeItem[];
  requiredDocs: RequiredDocument[];
  departments: Department[];
  currentUser: UserAccount;
  onSelectEmployee: (empId: string) => void;
  onAddRequiredDoc: (data: {
    departmentId: string;
    name: string;
    isMandatory: boolean;
    description?: string;
  }) => Promise<void>;
  onPrintMissingReport: (items: IncompleteEmployeeItem[]) => void;
}

export const MissingDocuments: React.FC<MissingDocumentsProps> = ({
  incompleteList,
  requiredDocs,
  departments,
  currentUser,
  onSelectEmployee,
  onAddRequiredDoc,
  onPrintMissingReport,
}) => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'config'>('alerts');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  // Form for new required document
  const [newDocDeptId, setNewDocDeptId] = useState('all');
  const [newDocName, setNewDocName] = useState('');
  const [newDocDesc, setNewDocDesc] = useState('');
  const [savingReq, setSavingReq] = useState(false);

  const filteredIncomplete = incompleteList.filter((item) => {
    if (deptFilter !== 'all' && item.departmentName !== deptFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      return (
        item.fullName.toLowerCase().includes(q) ||
        item.employeeId.toLowerCase().includes(q) ||
        item.phone.includes(q) ||
        item.missingList.some((m) => m.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalMissingCount = incompleteList.reduce((acc, curr) => acc + curr.missingList.length, 0);

  const handleAddReqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;

    setSavingReq(true);
    try {
      await onAddRequiredDoc({
        departmentId: newDocDeptId,
        name: newDocName.trim(),
        isMandatory: true,
        description: newDocDesc.trim(),
      });
      setNewDocName('');
      setNewDocDesc('');
    } catch (err: any) {
      alert(err.message || 'خطأ أثناء الإضافة');
    } finally {
      setSavingReq(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>نظام المتابعة الآلية لاكتمال ملفات العاملين ومسوغات التعيين</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 mt-1">
            تنبيهات ومتابعة الملفات غير المكتملة
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            يقوم النظام بمقارنة المستندات المطلوبة لكل كادر وظيفي مع المرفوعات الفعلية لتحديد النواقص فوراً.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onPrintMissingReport(filteredIncomplete)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة بيان النواقص الرسمي للجهات المعنية</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-rose-800 font-bold block mb-1">الملفات غير المكتملة</span>
            <span className="text-2xl font-black text-rose-950 font-mono tabular-nums">
              {incompleteList.length} ملف
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-200/60 flex items-center justify-center text-rose-800 font-mono font-bold">
            !
          </div>
        </div>

        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-800 font-bold block mb-1">إجمالي المستندات الناقصة</span>
            <span className="text-2xl font-black text-amber-950 font-mono tabular-nums">
              {totalMissingCount} مستند
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-200/60 flex items-center justify-center text-amber-800 font-mono font-bold">
            #
          </div>
        </div>

        <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-purple-800 font-bold block mb-1">مسوغات التعيين الإجبارية</span>
            <span className="text-2xl font-black text-purple-950 font-mono tabular-nums">
              {requiredDocs.length} وثيقة معتمدة
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-200/60 flex items-center justify-center text-purple-800">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'alerts'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          كشف الموظفين أصحاب الملفات غير المكتملة ({incompleteList.length})
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'config'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          إعداد مسوغات التعيين الإلزامية لكل قسم ({requiredDocs.length})
        </button>
      </div>

      {/* Tab 1: Incomplete Files Alerts Table */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="text"
                placeholder="البحث باسم الموظف أو المستند الناقص..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-3 pr-9 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500 bg-slate-50/50"
              />
            </div>

            <div className="sm:w-64">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">كافة الأقسام</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-700 font-bold">
                  <tr>
                    <th className="py-3 px-3">الرقم الوظيفي</th>
                    <th className="py-3 px-3">اسم الموظف</th>
                    <th className="py-3 px-3">القسم / التخصص</th>
                    <th className="py-3 px-3">المستندات الناقصة المطلوبة</th>
                    <th className="py-3 px-3 text-center">عدد النواقص</th>
                    <th className="py-3 px-3 text-center">حالة الملف</th>
                    <th className="py-3 px-3 text-center">إجراء مباشر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredIncomplete.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                        رائع! لا توجد أي ملفات غير مكتملة في القسم المحدد.
                      </td>
                    </tr>
                  ) : (
                    filteredIncomplete.map((emp) => (
                      <tr key={emp.employeeId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-purple-700">
                          {emp.employeeId}
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-900">{emp.fullName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{emp.phone}</div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="font-semibold text-slate-700">{emp.departmentName}</span>
                          {emp.specializationName && (
                            <span className="block text-[11px] text-purple-700 font-medium">
                              ({emp.specializationName})
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="flex flex-wrap gap-1 max-w-md">
                            {emp.missingList.map((doc, idx) => (
                              <span
                                key={idx}
                                className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[11px] font-semibold"
                              >
                                {doc}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-center font-mono font-bold text-rose-700">
                          {emp.missingList.length}
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            {emp.fileStatus} ({emp.completionRate}%)
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <button
                            onClick={() => onSelectEmployee(emp.employeeId)}
                            className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                          >
                            فتح واستكمال
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Required Documents Configuration */}
      {activeTab === 'config' && (
        <div className="space-y-4">
          {/* Add New Requirement Card */}
          {['admin'].includes(currentUser.role) && (
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-purple-700" />
                <span>إضافة مسوغ تعيين إجباري جديد لملفات العاملين</span>
              </h3>

              <form onSubmit={handleAddReqSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">القسم المستهدف</label>
                  <select
                    value={newDocDeptId}
                    onChange={(e) => setNewDocDeptId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded py-2 px-2.5"
                  >
                    <option value="all">كافة العاملين بالمدرسة (إلزامي عام)</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    اسم المستند المطلوب <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: شهادة الاعتماد من الأكاديمية المهنية للمعلمين"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded py-2 px-2.5"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={savingReq}
                    className="w-full py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded font-bold cursor-pointer transition-colors"
                  >
                    {savingReq ? 'جارٍ الإضافة...' : 'إضافة المسوغ المطلوب'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of currently required documents */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              قائمة مسوغات التعيين المعتمدة لمدرسة وي بالمنيا
            </h3>

            <div className="divide-y divide-slate-100">
              {requiredDocs.map((doc) => {
                const targetDept = departments.find((d) => d.id === doc.departmentId);
                return (
                  <div key={doc.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{doc.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        ينطبق على:{' '}
                        <strong className="text-purple-800">
                          {doc.departmentId === 'all' ? 'جميع العاملين بالمدرسة' : targetDept?.name || doc.departmentId}
                        </strong>
                        {doc.description && ` · ${doc.description}`}
                      </div>
                    </div>

                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                      إجباري للاكتمال
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
