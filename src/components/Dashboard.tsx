import React from 'react';
import {
  Users,
  GraduationCap,
  Briefcase,
  ClipboardList,
  Award,
  CheckCircle2,
  AlertCircle,
  FileWarning,
  Plus,
  Layers,
  FileText,
  ShieldCheck,
  ArrowUpRight,
  Code,
  Network,
  Radio,
  Palette,
  Cpu,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { DashboardStats, SchoolInfo } from '../types';

interface DashboardProps {
  stats: DashboardStats;
  schoolInfo?: SchoolInfo;
  onNavigate: (tab: any, deptId?: string, specId?: string) => void;
  onOpenAddEmployee: () => void;
  onOpenAddDept: () => void;
  onSelectEmployee: (empId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  schoolInfo,
  onNavigate,
  onOpenAddEmployee,
  onOpenAddDept,
  onSelectEmployee,
}) => {
  const getSpecIcon = (name: string) => {
    if (name.includes('برمجة')) return <Code className="w-4 h-4 text-purple-600" />;
    if (name.includes('شبكات')) return <Network className="w-4 h-4 text-blue-600" />;
    if (name.includes('اتصالات')) return <Radio className="w-4 h-4 text-emerald-600" />;
    if (name.includes('ديجيتال')) return <Palette className="w-4 h-4 text-pink-600" />;
    if (name.includes('بيانات') || name.includes('ذكاء')) return <Cpu className="w-4 h-4 text-amber-600" />;
    return <Briefcase className="w-4 h-4 text-slate-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-l from-purple-900 via-indigo-900 to-slate-900 text-white p-6 lg:p-8 shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-200">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>منظومة الموارد البشرية وشئون العاملين الإلكترونية المعتمدة</span>
          </div>
          <h2 className="text-xl lg:text-3xl font-extrabold tracking-tight">
            مرحباً بكم في {schoolInfo?.name || 'مدرسة وي للتكنولوجيا التطبيقية بالمنيا'}
          </h2>
          <p className="text-sm text-purple-100 leading-relaxed max-w-2xl">
            منصة مركزية ذكية لإدارة السجلات الوظيفية، مسوغات التعيين، مراقبة اكتمال ملفات العاملين، وإصدار التقارير الإحصائية الرسمية بدقة متناهية.
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="relative z-10 pt-5 mt-5 border-t border-purple-700/50 flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenAddEmployee}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة موظف جديد</span>
          </button>

          <button
            onClick={() => onNavigate('all-employees')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg border border-white/20 transition-colors cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>عرض جميع العاملين</span>
          </button>

          <button
            onClick={() => onNavigate('missing-docs')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-500/80 hover:bg-rose-600 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            <FileWarning className="w-4 h-4" />
            <span>متابعة الملفات غير المكتملة</span>
            {stats.incompleteFiles > 0 && (
              <span className="bg-white text-rose-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                {stats.incompleteFiles}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg border border-white/20 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>طباعة التقارير الإحصائية</span>
          </button>

          <button
            onClick={() => onNavigate('custom-depts')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg border border-white/20 transition-colors cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>عرض الأقسام والتخصصات</span>
          </button>

          <button
            onClick={onOpenAddDept}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg border border-white/20 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة قسم جديد</span>
          </button>

          <button
            onClick={() => onNavigate('users')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg border border-white/20 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>المستخدمين والصلاحيات</span>
          </button>
        </div>
      </div>

      {/* 1. Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Employees */}
        <div
          onClick={() => onNavigate('all-employees')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">إجمالي العاملين</span>
            <Users className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
            {stats.totalEmployees}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">كافة الكوادر بالمدرسة</div>
        </div>

        {/* Govt Teachers */}
        <div
          onClick={() => onNavigate('all-employees', 'dept-1')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">معلمون حكومي</span>
            <GraduationCap className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
            {stats.govtTeachers}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">معينون / منتدبون بالوزارة</div>
        </div>

        {/* Private Sector Teachers */}
        <div
          onClick={() => onNavigate('all-employees', 'dept-2')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">معلمو قطاع خاص</span>
            <Briefcase className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
            {stats.privateTeachers}
          </div>
          <div className="text-[11px] text-purple-600 mt-1">كادر التخصصات التكنولوجية</div>
        </div>

        {/* Administrators */}
        <div
          onClick={() => onNavigate('all-employees', 'dept-3')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">الإداريون</span>
            <ClipboardList className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
            {stats.admins}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">الهيئة الإدارية المعاونة</div>
        </div>

        {/* Directors */}
        <div
          onClick={() => onNavigate('all-employees', 'dept-4')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">المديرون والقيادات</span>
            <Award className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
            {stats.directors}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">إدارة المدرسة والوكلاء</div>
        </div>

        {/* Other Categories */}
        <div
          onClick={() => onNavigate('all-employees')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">باقي الأقسام والمسئولين</span>
            <Layers className="w-4 h-4 text-cyan-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
            {stats.otherDeptsCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">شئون طلاب، جودة، توريدات...</div>
        </div>
      </div>

      {/* 2. File Completion Status Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Completed Files */}
        <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>ملفات العاملين المكتملة</span>
            </div>
            <div className="text-2xl font-extrabold text-emerald-900 font-mono tabular-nums">
              {stats.completedFiles}
            </div>
            <div className="text-[11px] text-emerald-700">
              مستوفاة لكافة المستندات ومصادق عليها
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold font-mono text-sm">
            {stats.totalEmployees > 0
              ? `${Math.round((stats.completedFiles / stats.totalEmployees) * 100)}%`
              : '0%'}
          </div>
        </div>

        {/* Incomplete Files */}
        <div
          onClick={() => onNavigate('missing-docs')}
          className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-amber-100/60 transition-colors"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>ملفات غير مكتملة</span>
            </div>
            <div className="text-2xl font-extrabold text-amber-900 font-mono tabular-nums">
              {stats.incompleteFiles}
            </div>
            <div className="text-[11px] text-amber-700">
              تحتاج إلى استكمال مسوغات التعيين
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold font-mono text-sm">
            {stats.totalEmployees > 0
              ? `${Math.round((stats.incompleteFiles / stats.totalEmployees) * 100)}%`
              : '0%'}
          </div>
        </div>

        {/* Total Missing Documents */}
        <div
          onClick={() => onNavigate('missing-docs')}
          className="bg-rose-50/70 border border-rose-200 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-rose-100/60 transition-colors"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
              <FileWarning className="w-4 h-4 text-rose-600" />
              <span>إجمالي المستندات الناقصة</span>
            </div>
            <div className="text-2xl font-extrabold text-rose-900 font-mono tabular-nums">
              {stats.totalMissingDocs}
            </div>
            <div className="text-[11px] text-rose-700">
              وثيقة إجبارية متأخرة يلزم استلامها
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 font-bold font-mono text-base">
            {stats.totalMissingDocs}
          </div>
        </div>
      </div>

      {/* 3. Specialization Tracks (Private Sector Teachers - 5 Specializations) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-700" />
              <span>توزيع معلمي القطاع الخاص حسب التخصصات الخمسة المعتمدة</span>
            </h3>
            <p className="text-xs text-slate-500">
              تخصصات التكنولوجيا التطبيقية والذكاء الاصطناعي بمدرسة وي بالمنيا
            </p>
          </div>
          <span className="text-xs text-purple-700 font-bold bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
            إجمالي معلمي القطاع الخاص: {stats.privateTeachers} معلم
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {stats.privateSpecializations.map((spec) => (
            <div
              key={spec.id}
              onClick={() => onNavigate('spec', 'dept-2', spec.id)}
              className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-purple-50/40 hover:border-purple-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-1.5 rounded-md bg-white border border-slate-200 shadow-2xs group-hover:border-purple-200">
                  {getSpecIcon(spec.name)}
                </span>
                <span className="text-xs font-bold text-slate-700 font-mono tabular-nums bg-white px-2 py-0.5 rounded border border-slate-200">
                  {spec.count} معلم
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-purple-900 transition-colors">
                {spec.name}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200/60">
                <span>عرض الكادر</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Two-Column Split: Missing Files Alerts & Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Alerts for Incomplete Files */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>تنبيهات الملفات التي تحتاج إلى استكمال</span>
                </h3>
                <p className="text-xs text-slate-500">
                  موظفون لديهم نواقص في مسوغات التعيين الرسمية
                </p>
              </div>
              <button
                onClick={() => onNavigate('missing-docs')}
                className="text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>عرض الكل</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {stats.incompleteAlerts.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  جميع ملفات العاملين مستوفاة ومكتملة تماماً!
                </div>
              ) : (
                stats.incompleteAlerts.map((alert) => (
                  <div
                    key={alert.employeeId}
                    onClick={() => onSelectEmployee(alert.employeeId)}
                    className="py-3 flex items-start justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 hover:text-purple-700">
                        {alert.fullName}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>{alert.departmentName}</span>
                        <span>·</span>
                        <span className="font-mono">{alert.employeeId}</span>
                      </div>
                      <div className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                        <span>النواقص ({alert.missingCount}):</span>
                        <span className="font-medium text-slate-700 truncate max-w-xs">
                          {alert.missingList.slice(0, 2).join('، ')}
                          {alert.missingList.length > 2 && ' ...'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEmployee(alert.employeeId);
                      }}
                      className="text-xs px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded border border-purple-200 font-semibold shrink-0 cursor-pointer"
                    >
                      استكمال
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>متابعة دورية من قسم شئون العاملين</span>
            <span className="font-mono text-slate-700 font-bold">
              {stats.incompleteFiles} ملف معلق
            </span>
          </div>
        </div>

        {/* Right Col: Department Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-700" />
                <span>توزيع العاملين حسب الأقسام والإدارات</span>
              </h3>
              <p className="text-xs text-slate-500">
                نسبة الكادر في كل إدارة من إجمالي العاملين بالمدرسة
              </p>
            </div>
            <button
              onClick={() => onNavigate('custom-depts')}
              className="text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>إدارة الأقسام</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 mt-2 max-h-[320px] overflow-y-auto pr-1">
            {stats.departmentDistribution.map((dept) => (
              <div
                key={dept.id}
                onClick={() => onNavigate('all-employees', dept.id)}
                className="space-y-1.5 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{dept.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700 tabular-nums">
                      {dept.count} موظف
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ({dept.percentage}%)
                    </span>
                  </div>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(dept.percentage, 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Recently Added Employees */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>أحدث الموظفين الذين تم تسجيلهم بالمدرسة</span>
            </h3>
            <p className="text-xs text-slate-500">
              آخر السجلات المضافة في قاعدة بيانات مدرسة وي بالمنيا
            </p>
          </div>
          <button
            onClick={() => onNavigate('all-employees')}
            className="text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>عرض سجل كافة العاملين</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">الرقم الوظيفي</th>
                <th className="py-2.5 px-3">الاسم الرباعي</th>
                <th className="py-2.5 px-3">المسمى الوظيفي</th>
                <th className="py-2.5 px-3">القسم</th>
                <th className="py-2.5 px-3">الحالة</th>
                <th className="py-2.5 px-3">تاريخ التسجيل</th>
                <th className="py-2.5 px-3 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {stats.recentEmployees.map((emp) => (
                <tr
                  key={emp.id}
                  onClick={() => onSelectEmployee(emp.id)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-3 font-mono font-bold text-purple-700">{emp.id}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{emp.fullName}</td>
                  <td className="py-3 px-3 text-slate-600">{emp.jobTitle}</td>
                  <td className="py-3 px-3 text-slate-600">{emp.departmentName}</td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500">{emp.createdAt}</td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEmployee(emp.id);
                      }}
                      className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-800 font-semibold transition-colors cursor-pointer"
                    >
                      الملف الإلكتروني
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
