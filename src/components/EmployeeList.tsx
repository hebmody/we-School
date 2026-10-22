import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Upload,
  Printer,
  Plus,
  Archive,
  RotateCcw,
  Eye,
  Edit,
  CheckCircle2,
  AlertCircle,
  FileWarning,
  FileSpreadsheet,
  X,
  ArrowUpDown,
  Building2,
} from 'lucide-react';
import { Employee, Department, Specialization, UserAccount } from '../types';
import { exportToExcel, exportTableToPdf } from '../utils/exportTools';

interface EmployeeListProps {
  employees: Employee[];
  departments: Department[];
  specializations: Specialization[];
  currentUser: UserAccount;
  initialDeptId?: string;
  initialSpecId?: string;
  onSelectEmployee: (empId: string) => void;
  onEditEmployee: (empId: string) => void;
  onAddNewEmployee: () => void;
  onArchiveEmployee: (empId: string) => void;
  onRestoreEmployee: (empId: string) => void;
  onOpenImportModal: () => void;
  onPrintPreviewList: (filteredList: Employee[]) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  departments,
  specializations,
  currentUser,
  initialDeptId,
  initialSpecId,
  onSelectEmployee,
  onEditEmployee,
  onAddNewEmployee,
  onArchiveEmployee,
  onRestoreEmployee,
  onOpenImportModal,
  onPrintPreviewList,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState(initialDeptId || 'all');
  const [specFilter, setSpecFilter] = useState(initialSpecId || 'all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [contractFilter, setContractFilter] = useState('all');
  const [fileStatusFilter, setFileStatusFilter] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [sortField, setSortField] = useState<'id' | 'fullName' | 'hireDate' | 'completionRate'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filtered specializations based on selected department
  const availableSpecs = useMemo(() => {
    if (deptFilter === 'all') return specializations;
    return specializations.filter((s) => s.departmentId === deptFilter);
  }, [deptFilter, specializations]);

  // Filter & Search Logic
  const filteredEmployees = useMemo(() => {
    return employees
      .filter((emp) => {
        if (!showArchived && emp.isArchived) return false;
        if (showArchived && !emp.isArchived) return false;

        if (deptFilter !== 'all' && emp.departmentId !== deptFilter) return false;
        if (specFilter !== 'all' && emp.specializationId !== specFilter) return false;
        if (statusFilter !== 'all' && emp.employmentStatus !== statusFilter) return false;
        if (contractFilter !== 'all' && emp.contractType !== contractFilter) return false;
        if (fileStatusFilter !== 'all' && emp.fileStatus !== fileStatusFilter) return false;

        if (searchTerm.trim()) {
          const q = searchTerm.trim().toLowerCase();
          const matchName = emp.fullName.toLowerCase().includes(q);
          const matchId = emp.id.toLowerCase().includes(q);
          const matchNid = emp.nationalId.includes(q);
          const matchPhone = emp.phone.includes(q);
          const matchTitle = emp.jobTitle.toLowerCase().includes(q);
          const matchGov = emp.govCode && emp.govCode.toLowerCase().includes(q);
          return matchName || matchId || matchNid || matchPhone || matchTitle || matchGov;
        }

        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortField] || '';
        let valB: any = b[sortField] || '';
        if (sortOrder === 'asc') {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
  }, [
    employees,
    showArchived,
    deptFilter,
    specFilter,
    statusFilter,
    contractFilter,
    fileStatusFilter,
    searchTerm,
    sortField,
    sortOrder,
  ]);

  const handleExportExcel = () => {
    const dataToExport = filteredEmployees.map((e, idx) => ({
      'م': idx + 1,
      'الرقم الوظيفي': e.id,
      'الاسم الرباعي': e.fullName,
      'الرقم القومي': currentUser.role === 'viewer' ? 'محجوب' : e.nationalId,
      'كود الموظف الحكومي': e.govCode || '-',
      'القسم / الإدارة': e.departmentName,
      'التخصص / البرنامج': e.specializationName || '-',
      'المسمى الوظيفي': e.jobTitle,
      'نوع التعاقد': e.contractType,
      'جهة التعيين': e.hiringEntity,
      'الحالة الوظيفية': e.employmentStatus,
      'تاريخ استلام العمل': e.schoolStartDate,
      'رقم الهاتف': e.phone,
      'اكتمال الملف': `${e.completionRate}% (${e.fileStatus})`,
    }));

    exportToExcel(
      dataToExport,
      `سجل_العاملين_مدرسة_وي_المنيا_${new Date().toISOString().split('T')[0]}`,
      'سجل العاملين'
    );
  };

  const handleExportPdf = () => {
    const headers = [
      'م',
      'الرقم الوظيفي',
      'الاسم الرباعي',
      'القسم',
      'التخصص',
      'المسمى الوظيفي',
      'نوع التعاقد',
      'الحالة',
      'اكتمال الملف',
    ];
    const rows = filteredEmployees.map((e, idx) => [
      (idx + 1).toString(),
      e.id,
      e.fullName,
      e.departmentName || '-',
      e.specializationName || '-',
      e.jobTitle,
      e.contractType,
      e.employmentStatus,
      `${e.completionRate}%`,
    ]);

    exportTableToPdf(
      'مدرسة وي للتكنولوجيا التطبيقية بالمنيا - سجل العاملين',
      headers,
      rows,
      `سجل_العاملين_${Date.now()}`
    );
  };

  const resetFilters = () => {
    setSearchTerm('');
    setDeptFilter('all');
    setSpecFilter('all');
    setStatusFilter('all');
    setContractFilter('all');
    setFileStatusFilter('all');
    setShowArchived(false);
  };

  const hasActiveFilters =
    searchTerm ||
    deptFilter !== 'all' ||
    specFilter !== 'all' ||
    statusFilter !== 'all' ||
    contractFilter !== 'all' ||
    fileStatusFilter !== 'all' ||
    showArchived;

  const canEdit = ['admin', 'hr'].includes(currentUser.role);

  return (
    <div className="space-y-4">
      {/* Top Banner & Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base lg:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-700" />
            <span>قاعدة بيانات وسجلات العاملين بالمدرسة</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            عرض وتصفية السجلات الوظيفية، طباعة الكشوفات الرسمية، وتصدير البيانات
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {canEdit && (
            <button
              onClick={onAddNewEmployee}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة موظف</span>
            </button>
          )}

          {canEdit && (
            <button
              onClick={onOpenImportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title="استيراد دفعة موظفين من ملف Excel"
            >
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>استيراد Excel</span>
            </button>
          )}

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            title="تصدير القائمة الحالية إلى Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            title="تنزيل ملف PDF"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>PDF</span>
          </button>

          <button
            onClick={() => onPrintPreviewList(filteredEmployees)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            title="معاينة وطباعة السجل الرسمي"
          >
            <Printer className="w-3.5 h-3.5 text-purple-700" />
            <span>طباعة السجل</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        {/* Search Input & Quick archive toggle */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث بالاسم الرباعي، الرقم الوظيفي، الرقم القومي، الهاتف، أو المسمى..."
              className="w-full pl-3 pr-9 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500 bg-slate-50/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                showArchived
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Archive className="w-3.5 h-3.5 text-amber-600" />
              <span>{showArchived ? 'سجلات الأرشيف فقط' : 'عرض الأرشيف'}</span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>إعادة ضبط الفلاتر</span>
              </button>
            )}
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">القسم / الإدارة</label>
            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setSpecFilter('all');
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">جميع الأقسام</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.employeeCount || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Specialization Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">التخصص / البرنامج</label>
            <select
              value={specFilter}
              onChange={(e) => setSpecFilter(e.target.value)}
              disabled={availableSpecs.length === 0}
              className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            >
              <option value="all">جميع التخصصات</option>
              {availableSpecs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.employeeCount || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Employment Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">الحالة الوظيفية</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="على رأس العمل">على رأس العمل</option>
              <option value="إجازة">إجازة</option>
              <option value="منقول">منقول</option>
              <option value="انتهت خدمته">انتهت خدمته</option>
            </select>
          </div>

          {/* Contract Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">نوع التعاقد</label>
            <select
              value={contractFilter}
              onChange={(e) => setContractFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">جميع العقود</option>
              <option value="حكومي دائم">حكومي دائم</option>
              <option value="قطاع خاص محدد المدة">قطاع خاص محدد المدة</option>
              <option value="عقد سنوي">عقد سنوي</option>
              <option value="انتداب">انتداب</option>
              <option value="حصة">حصة</option>
            </select>
          </div>

          {/* File Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">اكتمال الملف</label>
            <select
              value={fileStatusFilter}
              onChange={(e) => setFileStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">كافة الحالات</option>
              <option value="مكتمل">ملف مكتمل (100%)</option>
              <option value="غير مكتمل">ملف غير مكتمل (نواقص)</option>
              <option value="يحتاج إلى مراجعة">يحتاج إلى مراجعة</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div>
          تم العثور على{' '}
          <span className="font-bold text-slate-900 font-mono tabular-nums">
            {filteredEmployees.length}
          </span>{' '}
          موظف
          {showArchived && <span className="text-amber-700 font-medium"> (في الأرشيف)</span>}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <span className="text-[11px]">ترتيب حسب:</span>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as any)}
            className="bg-white border border-slate-200 rounded py-1 px-2 text-[11px] text-slate-700"
          >
            <option value="id">الرقم الوظيفي</option>
            <option value="fullName">الاسم</option>
            <option value="hireDate">تاريخ التعيين</option>
            <option value="completionRate">نسبة اكتمال الملف</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1 border border-slate-200 rounded bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
            title="عكس الترتيب"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-700 font-bold">
              <tr>
                <th className="py-3 px-3">الرقم الوظيفي</th>
                <th className="py-3 px-3">الاسم الرباعي</th>
                <th className="py-3 px-3">الرقم القومي</th>
                <th className="py-3 px-3">القسم / الإدارة</th>
                <th className="py-3 px-3">التخصص</th>
                <th className="py-3 px-3">المسمى الوظيفي</th>
                <th className="py-3 px-3">نوع التعاقد</th>
                <th className="py-3 px-3">الحالة</th>
                <th className="py-3 px-3 text-center">اكتمال الملف</th>
                <th className="py-3 px-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    لا توجد سجلات تطابق شروط البحث المحددة
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    onClick={() => onSelectEmployee(emp.id)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-purple-800">
                      {emp.id}
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-900 group-hover:text-purple-900">
                      {emp.fullName}
                      {emp.govCode && (
                        <span className="block text-[10px] text-slate-400 font-mono">
                          كود حكومي: {emp.govCode}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-600">
                      {currentUser.role === 'viewer'
                        ? emp.nationalId.substring(0, 4) + '******' + emp.nationalId.substring(10)
                        : emp.nationalId}
                    </td>

                    <td className="py-3 px-3 text-slate-700">{emp.departmentName}</td>

                    <td className="py-3 px-3">
                      {emp.specializationName ? (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-medium">
                          {emp.specializationName}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-600 font-medium">{emp.jobTitle}</td>

                    <td className="py-3 px-3 text-slate-600">{emp.contractType}</td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          emp.employmentStatus === 'على رأس العمل'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : emp.employmentStatus === 'إجازة'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {emp.employmentStatus}
                      </span>
                    </td>

                    {/* Completion Column */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-bold font-mono inline-flex items-center gap-1 ${
                            emp.fileStatus === 'مكتمل'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : emp.fileStatus === 'يحتاج إلى مراجعة'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {emp.fileStatus === 'مكتمل' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : emp.fileStatus === 'يحتاج إلى مراجعة' ? (
                            <AlertCircle className="w-3 h-3" />
                          ) : (
                            <FileWarning className="w-3 h-3" />
                          )}
                          <span>{emp.completionRate}%</span>
                        </span>
                        {emp.missingDocsCount! > 0 && (
                          <span className="text-[10px] text-rose-600">
                            {emp.missingDocsCount} مستند ناقص
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectEmployee(emp.id)}
                          className="p-1 rounded text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer"
                          title="عرض الملف الإلكتروني"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {canEdit && (
                          <button
                            onClick={() => onEditEmployee(emp.id)}
                            className="p-1 rounded text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                            title="تعديل البيانات"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        {canEdit && !emp.isArchived && (
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من أرشفة سجل الموظف (${emp.fullName})؟`)) {
                                onArchiveEmployee(emp.id);
                              }
                            }}
                            className="p-1 rounded text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                            title="أرشفة السجل"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}

                        {canEdit && emp.isArchived && (
                          <button
                            onClick={() => {
                              if (confirm(`هل تريد استعادة سجل الموظف (${emp.fullName}) للخدمة النشطة؟`)) {
                                onRestoreEmployee(emp.id);
                              }
                            }}
                            className="p-1 rounded text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                            title="استعادة من الأرشيف"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
