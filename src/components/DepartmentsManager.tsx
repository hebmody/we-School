import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Archive,
  CheckCircle2,
  AlertCircle,
  Users,
  Code,
  Building,
} from 'lucide-react';
import { Department, Specialization, UserAccount } from '../types';

interface DepartmentsManagerProps {
  departments: Department[];
  specializations: Specialization[];
  currentUser: UserAccount;
  onCreateDepartment: (name: string, description: string) => Promise<void>;
  onUpdateDepartment: (id: string, name: string, description: string) => Promise<void>;
  onDeleteDepartment: (id: string) => Promise<{ action: string; message: string }>;
  onCreateSpecialization: (departmentId: string, name: string) => Promise<void>;
  onRefresh: () => void;
}

export const DepartmentsManager: React.FC<DepartmentsManagerProps> = ({
  departments,
  specializations,
  currentUser,
  onCreateDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
  onCreateSpecialization,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'departments' | 'specializations'>('departments');

  // Modal State for Department
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [savingDept, setSavingDept] = useState(false);

  // Modal State for Specialization
  const [showSpecModal, setShowSpecModal] = useState(false);
  const [specDeptId, setSpecDeptId] = useState(departments[0]?.id || '');
  const [specName, setSpecName] = useState('');
  const [savingSpec, setSavingSpec] = useState(false);

  const [notification, setNotification] = useState<string | null>(null);

  const canManage = ['admin', 'hr'].includes(currentUser.role);

  const handleOpenCreateDept = () => {
    setEditingDeptId(null);
    setDeptName('');
    setDeptDesc('');
    setShowDeptModal(true);
  };

  const handleOpenEditDept = (dept: Department) => {
    setEditingDeptId(dept.id);
    setDeptName(dept.name);
    setDeptDesc(dept.description || '');
    setShowDeptModal(true);
  };

  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return;

    setSavingDept(true);
    try {
      if (editingDeptId) {
        await onUpdateDepartment(editingDeptId, deptName.trim(), deptDesc.trim());
        setNotification('تم تعديل بيانات القسم بنجاح');
      } else {
        await onCreateDepartment(deptName.trim(), deptDesc.trim());
        setNotification('تم إضافة القسم الجديد بنجاح وإدراجه في كامل المنظومة');
      }
      setShowDeptModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'خطأ أثناء الحفظ');
    } finally {
      setSavingDept(false);
    }
  };

  const handleDeleteDept = async (dept: Department) => {
    if (
      !confirm(
        `تنبيه نظام الأمان: هل تريد إزالة قسم (${dept.name})؟\nإذا كان بالقسم موظفون، فسيتم أرشفته بأمان حفاظاً على السجلات التاريخية للوزارة.`
      )
    ) {
      return;
    }

    try {
      const res = await onDeleteDepartment(dept.id);
      setNotification(res.message);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'خطأ أثناء العملية');
    }
  };

  const handleSaveSpec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specName.trim() || !specDeptId) return;

    setSavingSpec(true);
    try {
      await onCreateSpecialization(specDeptId, specName.trim());
      setNotification(`تم إضافة التخصص الجديد (${specName}) بنجاح`);
      setShowSpecModal(false);
      setSpecName('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'خطأ أثناء الإضافة');
    } finally {
      setSavingSpec(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-700 font-bold text-xs">
            <Layers className="w-4 h-4" />
            <span>إدارة الهيكل التنظيمي والأقسام والبرامج التكنولوجية</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 mt-1">
            الأقسام والتخصصات الدراسية والإدارية
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            تحديث وإضافة الأقسام والمسارات المعتمدة لمدرسة وي بالمنيا مع حماية السجلات التاريخية من الحذف العرضي
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenCreateDept}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة قسم جديد</span>
            </button>

            <button
              onClick={() => {
                setSpecDeptId(departments[0]?.id || '');
                setSpecName('');
                setShowSpecModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-purple-700" />
              <span>إضافة تخصص جديد</span>
            </button>
          </div>
        )}
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-900">
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('departments')}
          className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'departments'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          الأقسام والإدارات ({departments.length})
        </button>

        <button
          onClick={() => setActiveTab('specializations')}
          className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'specializations'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          التخصصات والبرامج التكنولوجية ({specializations.length})
        </button>
      </div>

      {/* Tab 1: Departments */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white p-4 rounded-xl border border-slate-200 hover:border-purple-300 transition-all shadow-2xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Building className="w-4 h-4 text-purple-700 shrink-0" />
                    <span>{dept.name}</span>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                      dept.status === 'active'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {dept.status === 'active' ? 'نشط' : 'مؤرشف'}
                  </span>
                </div>

                <div className="text-xs text-slate-500 mt-2">
                  {dept.description || 'أحد الأقسام المعتمدة بالهيكل الإداري لمدرسة وي للتكنولوجيا التطبيقية.'}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{dept.employeeCount || 0}</span>
                  <span className="text-[11px] font-normal text-slate-500">موظف مسجل</span>
                </div>

                {canManage && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditDept(dept)}
                      className="p-1.5 text-blue-700 hover:bg-blue-50 rounded cursor-pointer"
                      title="تعديل المسمى"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteDept(dept)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                      title={dept.employeeCount! > 0 ? 'أرشفة القسم' : 'حذف القسم'}
                    >
                      {dept.employeeCount! > 0 ? (
                        <Archive className="w-3.5 h-3.5 text-amber-600" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Specializations */}
      {activeTab === 'specializations' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                التخصصات والمسارات والبرامج التدريسية
              </h3>
              <p className="text-xs text-slate-500">
                تشمل تخصصات قطاع خاص (برمجة، شبكات، اتصالات، ديجيتال آرت، ذكاء اصطناعي) بالإضافة لأي مسار مستحدث
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {specializations.map((spec) => {
              const dept = departments.find((d) => d.id === spec.departmentId);
              return (
                <div key={spec.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-purple-900 text-xs flex items-center gap-1.5">
                      <Code className="w-4 h-4 text-purple-700" />
                      <span>{spec.name}</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                      {spec.employeeCount || 0} معلم
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    تابع لقسم: <strong className="text-slate-700">{dept?.name || 'غير محدد'}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create / Edit Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4 text-xs text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Building className="w-4 h-4 text-purple-700" />
                <span>{editingDeptId ? 'تعديل بيانات القسم' : 'إضافة قسم جديد للهيكل المدرسي'}</span>
              </h4>
              <button
                onClick={() => setShowDeptModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDept} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  اسم القسم أو الإدارة <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: التدريب الميداني والشراكات الصناعية"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded py-2 px-3 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">وصف المهام والمسئوليات</label>
                <textarea
                  rows={3}
                  placeholder="وصف مختصر لدور القسم داخل مدرسة وي للتكنولوجيا التطبيقية بالمنيا..."
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded py-2 px-3 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingDept}
                  className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded font-bold cursor-pointer"
                >
                  {savingDept ? 'جارٍ الحفظ...' : editingDeptId ? 'حفظ التعديل' : 'إنشاء القسم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Specialization Modal */}
      {showSpecModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4 text-xs text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Code className="w-4 h-4 text-purple-700" />
                <span>إضافة تخصص أو مسار تكنولوجي جديد</span>
              </h4>
              <button
                onClick={() => setShowSpecModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSpec} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">القسم التابع له</label>
                <select
                  value={specDeptId}
                  onChange={(e) => setSpecDeptId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded py-2 px-3 text-xs"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  اسم التخصص أو البرنامج <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الأمن السيبراني ومكافحة التهديدات"
                  value={specName}
                  onChange={(e) => setSpecName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded py-2 px-3 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSpecModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingSpec}
                  className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded font-bold cursor-pointer"
                >
                  {savingSpec ? 'جارٍ الحفظ...' : 'إضافة التخصص'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
