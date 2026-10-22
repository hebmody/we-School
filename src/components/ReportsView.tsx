import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Users,
  Briefcase,
  Layers,
  GraduationCap,
  AlertTriangle,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { Employee, Department, Specialization, SchoolInfo } from '../types';
import { exportToExcel, exportTableToPdf } from '../utils/exportTools';

interface ReportsViewProps {
  employees: Employee[];
  departments: Department[];
  specializations: Specialization[];
  schoolInfo?: SchoolInfo;
  onOpenPrintModal: (config: {
    title: string;
    subtitle: string;
    headers: string[];
    rows: any[][];
    summaryRow?: Record<string, string>;
  }) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  employees,
  departments,
  specializations,
  schoolInfo,
  onOpenPrintModal,
}) => {
  const [selectedReport, setSelectedReport] = useState<number>(1);

  // Custom Report Form State
  const [customDept, setCustomDept] = useState('all');
  const [customSpec, setCustomSpec] = useState('all');
  const [customStatus, setCustomStatus] = useState('all');
  const [customCols, setCustomCols] = useState<string[]>([
    'الرقم الوظيفي',
    'الاسم الرباعي',
    'القسم',
    'التخصص',
    'المسمى الوظيفي',
    'نوع التعاقد',
    'تاريخ الاستلام',
  ]);

  const activeEmployees = useMemo(() => employees.filter((e) => !e.isArchived), [employees]);

  // Report 1: Complete Register Data
  const report1Data = useMemo(() => {
    return activeEmployees.map((e, idx) => ({
      index: idx + 1,
      id: e.id,
      name: e.fullName,
      title: e.jobTitle,
      dept: e.departmentName || '-',
      spec: e.specializationName || '-',
      contract: e.contractType,
      status: e.employmentStatus,
      startDate: e.schoolStartDate,
      completion: `${e.completionRate}%`,
    }));
  }, [activeEmployees]);

  // Report 2: Total Counts Data
  const report2Stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => !e.isArchived && e.employmentStatus === 'على رأس العمل').length;
    const onLeave = employees.filter((e) => !e.isArchived && e.employmentStatus === 'إجازة').length;
    const transferred = employees.filter((e) => !e.isArchived && e.employmentStatus === 'منقول').length;
    const archived = employees.filter((e) => e.isArchived || e.employmentStatus === 'انتهت خدمته').length;
    const completedFiles = activeEmployees.filter((e) => e.fileStatus === 'مكتمل').length;
    const incompleteFiles = activeEmployees.filter((e) => e.fileStatus !== 'مكتمل').length;

    return {
      total,
      active,
      onLeave,
      transferred,
      archived,
      completedFiles,
      incompleteFiles,
    };
  }, [employees, activeEmployees]);

  // Report 3: Department Summary Data
  const report3Data = useMemo(() => {
    return departments
      .filter((d) => d.status === 'active')
      .map((d) => {
        const deptEmps = activeEmployees.filter((e) => e.departmentId === d.id);
        const count = deptEmps.length;
        const percentage = activeEmployees.length > 0 ? ((count / activeEmployees.length) * 100).toFixed(1) : '0';
        const completed = deptEmps.filter((e) => e.fileStatus === 'مكتمل').length;
        const incomplete = count - completed;

        return {
          deptName: d.name,
          count,
          percentage: `${percentage}%`,
          completed,
          incomplete,
        };
      });
  }, [departments, activeEmployees]);

  // Report 4: Private Sector Teachers Specializations Data
  const report4Data = useMemo(() => {
    const privateDept = departments.find((d) => d.name.includes('قطاع خاص') || d.id === 'dept-2');
    const privateEmps = activeEmployees.filter((e) => e.departmentId === (privateDept?.id || 'dept-2'));
    const privateSpecs = specializations.filter((s) => s.departmentId === (privateDept?.id || 'dept-2'));

    const specBreakdown = privateSpecs.map((s) => {
      const teachers = privateEmps.filter((e) => e.specializationId === s.id);
      return {
        id: s.id,
        name: s.name,
        count: teachers.length,
        teachers: teachers.map((t) => t.fullName),
      };
    });

    return {
      totalPrivateTeachers: privateEmps.length,
      specBreakdown,
      privateEmps,
    };
  }, [departments, activeEmployees, specializations]);

  // Report 5: Missing Documents
  const report5Data = useMemo(() => {
    return activeEmployees
      .filter((e) => e.fileStatus !== 'مكتمل')
      .map((e, idx) => ({
        index: idx + 1,
        id: e.id,
        name: e.fullName,
        dept: e.departmentName,
        missingDocs: e.missingDocs?.join('، ') || 'مسوغات عامة',
        missingCount: e.missingDocsCount || 0,
        status: e.fileStatus,
      }));
  }, [activeEmployees]);

  // Report 6: Qualifications & Training Data
  const report6Data = useMemo(() => {
    return activeEmployees.map((e, idx) => {
      const quals = e.qualifications?.map((q) => `${q.degree} (${q.major})`).join(' · ') || 'مؤهل جامعي معتمد';
      const trainings = e.trainings?.map((t) => t.courseName).join(' · ') || 'لا يوجد دورات';
      return {
        index: idx + 1,
        name: e.fullName,
        dept: e.departmentName,
        title: e.jobTitle,
        quals,
        trainings,
        trainingCount: e.trainings?.length || 0,
      };
    });
  }, [activeEmployees]);

  // Export & Print Actions for Current Report
  const handlePrintCurrent = () => {
    if (selectedReport === 1) {
      onOpenPrintModal({
        title: 'السجل العام والشامل لكافة العاملين بالمدرسة',
        subtitle: 'بيان معتمد بأعضاء هيئة التدريس والإداريين والقيادات',
        headers: ['م', 'الرقم الوظيفي', 'الاسم الرباعي', 'المسمى الوظيفي', 'القسم', 'التخصص', 'نوع التعاقد', 'الحالة', 'استلام العمل'],
        rows: report1Data.map((r) => [r.index, r.id, r.name, r.title, r.dept, r.spec, r.contract, r.status, r.startDate]),
      });
    } else if (selectedReport === 2) {
      onOpenPrintModal({
        title: 'تقرير إجمالي العاملين وتوزيع الحالات الوظيفية بالمدرسة',
        subtitle: 'إحصائية معتمدة بالكوادر البشرية وحالات العمل والأرشيف',
        headers: ['البيان الإحصائي', 'العدد الإجمالي', 'ملاحظات'],
        rows: [
          ['إجمالي عدد العاملين بالمدرسة', report2Stats.total.toString(), 'شاملاً القائمين بالعمل والأرشيف'],
          ['العاملون الفعليون على رأس العمل', report2Stats.active.toString(), 'مباشرون للعمل بانتظام'],
          ['العاملون في إجازات رسمية (رعاية طفل / خاصة)', report2Stats.onLeave.toString(), 'إجازات معتمدة بقرارات رسمية'],
          ['العاملون المنقولون من المدرسة', report2Stats.transferred.toString(), 'منقولون لإدارات ومدارس أخرى'],
          ['منتهية خدمتهم / سجلات الأرشيف', report2Stats.archived.toString(), 'سجلات تاريخية محفوظة بالأرشيف'],
          ['الملفات الإلكترونية المكتملة (100%)', report2Stats.completedFiles.toString(), 'مستوفاة لكافة مسوغات التعيين'],
          ['الملفات الإلكترونية غير المكتملة', report2Stats.incompleteFiles.toString(), 'تحت الاستكمال والمتابعة'],
        ],
      });
    } else if (selectedReport === 3) {
      onOpenPrintModal({
        title: 'بيان إحصائي لتوزيع العاملين حسب الأقسام ونسب اكتمال الملفات',
        subtitle: 'توزيع الكوادر الوظيفية على الهيكل التنظيمي لمدرسة وي بالمنيا',
        headers: ['القسم أو الإدارة', 'عدد العاملين', 'نسبة الكادر', 'الملفات المكتملة', 'الملفات المعلقة'],
        rows: report3Data.map((d) => [d.deptName, d.count, d.percentage, d.completed, d.incomplete]),
      });
    } else if (selectedReport === 4) {
      const rows: any[][] = [];
      report4Data.specBreakdown.forEach((s) => {
        rows.push([s.name, s.count.toString(), s.teachers.join('، ') || 'لا يوجد']);
      });
      onOpenPrintModal({
        title: 'بيان تفصيلي لمعلمي القطاع الخاص حسب التخصصات الخمسة',
        subtitle: `إجمالي معلمي قطاع خاص: ${report4Data.totalPrivateTeachers} معلم في التكنولوجيا التطبيقية`,
        headers: ['التخصص التكنولوجي', 'عدد المعلمين', 'أسماء المعلمين المسجلين بالتخصص'],
        rows,
      });
    } else if (selectedReport === 5) {
      onOpenPrintModal({
        title: 'تقرير المستندات الناقصة والملفات غير المكتملة',
        subtitle: 'كشف رسمي موجه لإدارة المدرسة وشئون العاملين لمطالبة الموظفين بالاستكمال',
        headers: ['م', 'الرقم الوظيفي', 'اسم الموظف', 'القسم', 'المستندات الناقصة المطلوبة', 'العدد', 'الحالة'],
        rows: report5Data.map((r) => [r.index, r.id, r.name, r.dept, r.missingDocs, r.missingCount, r.status]),
      });
    } else if (selectedReport === 6) {
      onOpenPrintModal({
        title: 'تقرير المؤهلات الدراسية والدورات التدريبية والتطوير المهني',
        subtitle: 'حصر المؤهلات العلمية والشهادات التخصصية المعتمدة لكوادر مدرسة وي',
        headers: ['م', 'اسم الموظف', 'القسم', 'المسمى', 'المؤهلات الدراسية', 'الدورات والشهادات'],
        rows: report6Data.map((r) => [r.index, r.name, r.dept, r.title, r.quals, r.trainings]),
      });
    }
  };

  const handleExportExcelCurrent = () => {
    if (selectedReport === 1) {
      exportToExcel(report1Data, 'السجل_الشامل_للعاملين_مدرسة_وي', 'سجل العاملين');
    } else if (selectedReport === 2) {
      exportToExcel(
        [
          { البيان: 'إجمالي العاملين', العدد: report2Stats.total },
          { البيان: 'على رأس العمل', العدد: report2Stats.active },
          { البيان: 'في إجازة', العدد: report2Stats.onLeave },
          { البيان: 'منقول', العدد: report2Stats.transferred },
          { البيان: 'ملفات مكتملة', العدد: report2Stats.completedFiles },
          { البيان: 'ملفات غير مكتملة', العدد: report2Stats.incompleteFiles },
        ],
        'إحصاء_العاملين_والحالات_الوظيفية',
        'الإحصائيات'
      );
    } else if (selectedReport === 3) {
      exportToExcel(report3Data, 'توزيع_العاملين_حسب_الأقسام', 'الأقسام');
    } else if (selectedReport === 4) {
      exportToExcel(
        report4Data.privateEmps.map((e, idx) => ({
          م: idx + 1,
          الرقم: e.id,
          الاسم: e.fullName,
          التخصص: e.specializationName,
          المسمى: e.jobTitle,
          العقد: e.contractType,
        })),
        'معلمو_القطاع_الخاص_حسب_التخصصات',
        'معلمو قطاع خاص'
      );
    } else if (selectedReport === 5) {
      exportToExcel(report5Data, 'تقرير_المستندات_الناقصة', 'النواقص');
    } else if (selectedReport === 6) {
      exportToExcel(report6Data, 'المؤهلات_والتدريب_المهني', 'المؤهلات');
    }
  };

  const reportsList = [
    { id: 1, name: 'السجل الشامل لجميع العاملين', desc: 'سجل عام بأسماء وكافة بيانات الكوادر النشطة بالمدرسة' },
    { id: 2, name: 'إجمالي عدد العاملين وتوزيع الحالات', desc: 'إحصائية كبرى للحالات (على رأس العمل، إجازة، أرشيف، اكتمال الملفات)' },
    { id: 3, name: 'توزيع العاملين حسب الأقسام', desc: 'جدول مقارن لكل الأقسام مع النسب المئوية ومعدلات الاكتمال' },
    { id: 4, name: 'معلمو القطاع الخاص حسب التخصصات الخمسة', desc: 'حصر تفصيلي للبرمجة، الشبكات، الاتصالات، ديجيتال آرت، والذكاء الاصطناعي' },
    { id: 5, name: 'تقرير المستندات والملفات الناقصة', desc: 'بيان بأسماء الموظفين والنواقص المطلوبة للاستكمال الفوري' },
    { id: 6, name: 'المؤهلات والشهادات والتطوير المهني', desc: 'حصر الشهادات الجامعية والدورات المعتمدة ITI و WE' },
  ];

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-700 font-bold text-xs">
            <FileText className="w-4 h-4" />
            <span>مركز التقارير والإحصائيات الإدارية المعتمدة</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 mt-1">
            التقارير والإحصائيات الرسمية لمدرسة وي للتكنولوجيا التطبيقية بالمنيا
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            تقارير فورية دقيقة مطابقة لاشتراطات وزارة التربية والتعليم والتعليم الفني والشركة المصرية للاتصالات WE
          </p>
        </div>

        {/* Global Export & Print Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrintCurrent}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>معاينة وطباعة التقرير (A4)</span>
          </button>

          <button
            onClick={handleExportExcelCurrent}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>تصدير Excel</span>
          </button>
        </div>
      </div>

      {/* Reports Selection Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {reportsList.map((rep) => (
          <button
            key={rep.id}
            onClick={() => setSelectedReport(rep.id)}
            className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
              selectedReport === rep.id
                ? 'bg-purple-700 text-white border-purple-800 shadow-xs'
                : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="text-[10px] font-mono opacity-80 mb-1">تقرير 0{rep.id}</div>
            <div className="text-xs font-bold leading-tight line-clamp-2">{rep.name}</div>
            <div className={`text-[10px] mt-2 line-clamp-1 ${selectedReport === rep.id ? 'text-purple-200' : 'text-slate-400'}`}>
              {rep.desc}
            </div>
          </button>
        ))}
      </div>

      {/* Report View Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        {/* Report 1 View */}
        {selectedReport === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  السجل الشامل لجميع العاملين بالمدرسة
                </h3>
                <p className="text-xs text-slate-500">
                  إجمالي المسجلين النشطين: {report1Data.length} موظف
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-700 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">م</th>
                    <th className="py-2.5 px-3">الرقم الوظيفي</th>
                    <th className="py-2.5 px-3">الاسم الرباعي</th>
                    <th className="py-2.5 px-3">المسمى الوظيفي</th>
                    <th className="py-2.5 px-3">القسم</th>
                    <th className="py-2.5 px-3">التخصص</th>
                    <th className="py-2.5 px-3">نوع التعاقد</th>
                    <th className="py-2.5 px-3">الحالة</th>
                    <th className="py-2.5 px-3">تاريخ الاستلام</th>
                    <th className="py-2.5 px-3 text-center">اكتمال الملف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report1Data.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{row.index}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-purple-700">{row.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{row.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{row.title}</td>
                      <td className="py-2.5 px-3 text-slate-700">{row.dept}</td>
                      <td className="py-2.5 px-3 text-purple-800 font-medium">{row.spec}</td>
                      <td className="py-2.5 px-3 text-slate-600">{row.contract}</td>
                      <td className="py-2.5 px-3">{row.status}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{row.startDate}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">
                        {row.completion}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report 2 View */}
        {selectedReport === 2 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                إجمالي عدد العاملين وتوزيع الحالات الوظيفية
              </h3>
              <p className="text-xs text-slate-500">
                مقارنة دقيقة بين العاملين الفعليين والإجازات والأرشيف
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <span className="text-xs text-purple-800 font-bold block mb-1">إجمالي السجلات بالمدرسة</span>
                <span className="text-2xl font-black font-mono text-purple-950">{report2Stats.total}</span>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-xs text-emerald-800 font-bold block mb-1">على رأس العمل</span>
                <span className="text-2xl font-black font-mono text-emerald-950">{report2Stats.active}</span>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <span className="text-xs text-blue-800 font-bold block mb-1">في إجازة رسمية</span>
                <span className="text-2xl font-black font-mono text-blue-950">{report2Stats.onLeave}</span>
              </div>

              <div className="p-4 bg-slate-100 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-700 font-bold block mb-1">أرشيف / منتهية خدمتهم</span>
                <span className="text-2xl font-black font-mono text-slate-900">{report2Stats.archived}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 block mb-0.5">ملفات مكتملة (100%)</span>
                  <span className="text-xl font-bold font-mono text-emerald-900">{report2Stats.completedFiles} ملف</span>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>

              <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-rose-800 block mb-0.5">ملفات غير مكتملة</span>
                  <span className="text-xl font-bold font-mono text-rose-900">{report2Stats.incompleteFiles} ملف</span>
                </div>
                <AlertTriangle className="w-8 h-8 text-rose-600" />
              </div>
            </div>
          </div>
        )}

        {/* Report 3 View */}
        {selectedReport === 3 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                توزيع العاملين حسب الأقسام ونسب اكتمال الملفات
              </h3>
              <p className="text-xs text-slate-500">
                جدول يشمل كافة الأقسام الحالية والجديدة التي تمت إضافتها
              </p>
            </div>

            <table className="w-full text-xs text-right divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700 font-bold">
                <tr>
                  <th className="py-3 px-3">اسم القسم أو الإدارة</th>
                  <th className="py-3 px-3 text-center">عدد العاملين</th>
                  <th className="py-3 px-3 text-center">النسبة المئوية</th>
                  <th className="py-3 px-3 text-center">الملفات المكتملة</th>
                  <th className="py-3 px-3 text-center">الملفات غير المكتملة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report3Data.map((d, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">{d.deptName}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold">{d.count}</td>
                    <td className="py-3 px-3 text-center font-mono text-purple-700">{d.percentage}</td>
                    <td className="py-3 px-3 text-center font-mono text-emerald-700 font-bold">{d.completed}</td>
                    <td className="py-3 px-3 text-center font-mono text-rose-700 font-bold">{d.incomplete}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Report 4 View */}
        {selectedReport === 4 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  بيان تفصيلي لمعلمي القطاع الخاص حسب التخصصات الخمسة
                </h3>
                <p className="text-xs text-slate-500">
                  برمجة، شبكات، اتصالات، ديجيتال آرت، وتحليل بيانات وذكاء اصطناعي
                </p>
              </div>
              <span className="text-xs bg-purple-100 text-purple-800 font-bold px-3 py-1 rounded-lg">
                الإجمالي: {report4Data.totalPrivateTeachers} معلم
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report4Data.specBreakdown.map((s) => (
                <div key={s.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <h4 className="font-bold text-purple-900 text-sm">{s.name}</h4>
                    <span className="font-mono font-bold text-xs bg-white px-2 py-0.5 rounded border border-slate-200">
                      {s.count} معلم
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 space-y-1">
                    <span className="text-[11px] text-slate-500 block">المعلمون المسجلون بهذا المسار:</span>
                    {s.teachers.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {s.teachers.map((name, i) => (
                          <span key={i} className="bg-white px-2 py-1 rounded border border-slate-200 text-slate-800 font-semibold text-xs">
                            {name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400">لا يوجد معلمون مسجلون حالياً بهذا التخصص</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Report 5 View */}
        {selectedReport === 5 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                تقرير المستندات الناقصة والملفات غير المكتملة
              </h3>
              <p className="text-xs text-slate-500">
                كشف رسمي بنواقص الموظفين لمتابعة استكمال السجلات
              </p>
            </div>

            <table className="w-full text-xs text-right divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700 font-bold">
                <tr>
                  <th className="py-3 px-3">م</th>
                  <th className="py-3 px-3">الرقم الوظيفي</th>
                  <th className="py-3 px-3">اسم الموظف</th>
                  <th className="py-3 px-3">القسم</th>
                  <th className="py-3 px-3">المستندات الناقصة</th>
                  <th className="py-3 px-3 text-center">العدد</th>
                  <th className="py-3 px-3 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report5Data.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono text-slate-400">{row.index}</td>
                    <td className="py-3 px-3 font-mono font-bold text-purple-700">{row.id}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{row.name}</td>
                    <td className="py-3 px-3 text-slate-600">{row.dept}</td>
                    <td className="py-3 px-3 text-rose-700 font-semibold">{row.missingDocs}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-rose-700">{row.missingCount}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-[11px] font-bold">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Report 6 View */}
        {selectedReport === 6 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                تقرير المؤهلات الدراسية والدورات التدريبية والتطوير المهني
              </h3>
              <p className="text-xs text-slate-500">
                سجل الكفاءات والشهادات الأكاديمية والمهنية لكوادر المدرسة
              </p>
            </div>

            <table className="w-full text-xs text-right divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700 font-bold">
                <tr>
                  <th className="py-3 px-3">م</th>
                  <th className="py-3 px-3">اسم الموظف</th>
                  <th className="py-3 px-3">القسم والمسمى</th>
                  <th className="py-3 px-3">المؤهل الدراسي</th>
                  <th className="py-3 px-3">الدورات والشهادات المهنية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report6Data.map((row) => (
                  <tr key={row.index} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono text-slate-400">{row.index}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{row.name}</td>
                    <td className="py-3 px-3 text-slate-600">
                      {row.dept} · {row.title}
                    </td>
                    <td className="py-3 px-3 text-purple-900 font-semibold">{row.quals}</td>
                    <td className="py-3 px-3 text-slate-700">{row.trainings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
