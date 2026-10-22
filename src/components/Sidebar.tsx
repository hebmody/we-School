import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Briefcase,
  UserCog,
  FileCheck2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Settings,
  ChevronDown,
  ChevronLeft,
  Layers,
  Code,
  Network,
  Radio,
  Palette,
  Cpu,
  Package,
  Award,
  BookOpen,
  ClipboardList,
  Lightbulb,
  Compass,
} from 'lucide-react';
import { Department, Specialization } from '../types';

export type NavigationTarget =
  | 'dashboard'
  | 'all-employees'
  | 'dept'
  | 'spec'
  | 'custom-depts'
  | 'missing-docs'
  | 'reports'
  | 'users'
  | 'settings';

interface SidebarProps {
  currentTab: string;
  selectedDeptId?: string;
  selectedSpecId?: string;
  departments: Department[];
  specializations: Specialization[];
  missingCount: number;
  onNavigate: (target: NavigationTarget, deptId?: string, specId?: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  selectedDeptId,
  selectedSpecId,
  departments,
  specializations,
  missingCount,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [privateTeachersExpanded, setPrivateTeachersExpanded] = useState(true);

  // Icons mapping for standard departments
  const getDeptIcon = (deptName: string) => {
    if (deptName.includes('معلمون حكومي')) return <GraduationCap className="w-4 h-4 shrink-0" />;
    if (deptName.includes('معلمو قطاع خاص')) return <Briefcase className="w-4 h-4 shrink-0" />;
    if (deptName.includes('إداريون')) return <ClipboardList className="w-4 h-4 shrink-0" />;
    if (deptName.includes('مديرون')) return <Award className="w-4 h-4 shrink-0" />;
    if (deptName.includes('شئون عاملين')) return <UserCog className="w-4 h-4 shrink-0" />;
    if (deptName.includes('شئون طلاب')) return <BookOpen className="w-4 h-4 shrink-0" />;
    if (deptName.includes('أخصائي اجتماعي')) return <Users className="w-4 h-4 shrink-0" />;
    if (deptName.includes('أخصائي نفسي')) return <FileCheck2 className="w-4 h-4 shrink-0" />;
    if (deptName.includes('جودة')) return <ShieldCheck className="w-4 h-4 shrink-0" />;
    if (deptName.includes('تقييم')) return <FileText className="w-4 h-4 shrink-0" />;
    if (deptName.includes('توريدات')) return <Package className="w-4 h-4 shrink-0" />;
    if (deptName.includes('ريادة أعمال')) return <Lightbulb className="w-4 h-4 shrink-0 text-amber-400" />;
    if (deptName.includes('ارشاد') || deptName.includes('توجيه')) return <Compass className="w-4 h-4 shrink-0 text-teal-400" />;
    return <Layers className="w-4 h-4 shrink-0" />;
  };

  const getSpecIcon = (specName: string) => {
    if (specName.includes('برمجة')) return <Code className="w-3.5 h-3.5 text-purple-600" />;
    if (specName.includes('شبكات')) return <Network className="w-3.5 h-3.5 text-blue-600" />;
    if (specName.includes('اتصالات')) return <Radio className="w-3.5 h-3.5 text-emerald-600" />;
    if (specName.includes('ديجيتال')) return <Palette className="w-3.5 h-3.5 text-pink-600" />;
    if (specName.includes('بيانات') || specName.includes('ذكاء')) return <Cpu className="w-3.5 h-3.5 text-amber-600" />;
    return <Layers className="w-3.5 h-3.5 text-slate-500" />;
  };

  const privateDept = departments.find((d) => d.name.includes('قطاع خاص') || d.id === 'dept-2');
  const privateSpecs = specializations.filter((s) => s.departmentId === (privateDept?.id || 'dept-2'));

  // Standard departments including new facilitators
  const standardDeptNames = [
    'معلمون حكومي',
    'إداريون',
    'مديرون',
    'شئون عاملين',
    'شئون طلاب',
    'أخصائي اجتماعي',
    'أخصائي نفسي',
    'مسئول جودة',
    'مسئول تقييم وامتحانات',
    'مسئول توريدات',
    'ميسر ريادة أعمال',
    'ميسر ارشاد وتوجيه',
  ];

  const standardDepts = departments.filter((d) =>
    standardDeptNames.some((name) => d.name.trim() === name.trim())
  );

  const customDepts = departments.filter(
    (d) =>
      !standardDeptNames.some((name) => d.name.trim() === name.trim()) &&
      d.id !== privateDept?.id &&
      !d.name.includes('قطاع خاص')
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 right-0 h-screen w-64 bg-slate-900 text-slate-200 border-l border-slate-800 flex flex-col z-50 transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              WE
            </div>
            <div>
              <div className="font-bold text-sm text-white tracking-tight">شئون العاملين</div>
              <div className="text-[11px] text-slate-400">مدرسة وي بالمنيا</div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Navigation Links Scrollable */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 text-xs font-medium custom-scrollbar">
          {/* Dashboard */}
          <button
            onClick={() => {
              onNavigate('dashboard');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer text-right ${
              currentTab === 'dashboard'
                ? 'bg-purple-600 text-white font-semibold shadow-xs'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span className="truncate">الرئيسية (لوحة التحكم)</span>
          </button>

          {/* All Employees */}
          <button
            onClick={() => {
              onNavigate('all-employees');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer text-right ${
              currentTab === 'all-employees' && !selectedDeptId && !selectedSpecId
                ? 'bg-purple-600 text-white font-semibold shadow-xs'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 shrink-0" />
              <span>جميع العاملين</span>
            </div>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full font-mono">
              {departments.reduce((acc, d) => acc + (d.employeeCount || 0), 0)}
            </span>
          </button>

          <div className="pt-3 pb-1 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            تصنيفات العاملين والأقسام
          </div>

          {/* 1. معلمون حكومي */}
          {departments
            .filter((d) => d.name.includes('معلمون حكومي'))
            .map((dept) => (
              <button
                key={dept.id}
                onClick={() => {
                  onNavigate('dept', dept.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer text-right ${
                  selectedDeptId === dept.id
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span className="truncate">{dept.name}</span>
                </div>
                {dept.employeeCount !== undefined && (
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full font-mono">
                    {dept.employeeCount}
                  </span>
                )}
              </button>
            ))}

          {/* 2. معلمو قطاع خاص (With 5 Sub-Specializations) */}
          {privateDept && (
            <div className="space-y-1">
              <div
                className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer text-right ${
                  selectedDeptId === privateDept.id && !selectedSpecId
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <button
                  onClick={() => {
                    onNavigate('dept', privateDept.id);
                    onCloseMobile();
                  }}
                  className="flex-1 flex items-center gap-2.5 text-right cursor-pointer"
                >
                  <Briefcase className="w-4 h-4 shrink-0 text-purple-400" />
                  <span className="truncate">معلمو قطاع خاص</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {privateDept.employeeCount !== undefined && (
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full font-mono">
                      {privateDept.employeeCount}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPrivateTeachersExpanded(!privateTeachersExpanded);
                    }}
                    className="p-1 hover:text-white text-slate-400 rounded cursor-pointer"
                    title="فتح التخصصات"
                  >
                    {privateTeachersExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronLeft className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* 5 Specializations Nested Menu */}
              {privateTeachersExpanded && (
                <div className="mr-4 pr-2 border-r border-slate-700/80 space-y-0.5 py-1">
                  {privateSpecs.map((spec) => (
                    <button
                      key={spec.id}
                      onClick={() => {
                        onNavigate('spec', privateDept.id, spec.id);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors text-right cursor-pointer ${
                        selectedSpecId === spec.id
                          ? 'bg-purple-900/60 text-purple-200 font-semibold border border-purple-500/40'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {getSpecIcon(spec.name)}
                        <span className="truncate">{spec.name}</span>
                      </div>
                      {spec.employeeCount !== undefined && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {spec.employeeCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Remaining Standard Departments */}
          {standardDepts.map((dept) => (
            <button
              key={dept.id}
              onClick={() => {
                onNavigate('dept', dept.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer text-right ${
                selectedDeptId === dept.id
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {getDeptIcon(dept.name)}
                <span className="truncate">{dept.name}</span>
              </div>
              {dept.employeeCount !== undefined && (
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full font-mono">
                  {dept.employeeCount}
                </span>
              )}
            </button>
          ))}

          {/* Custom & Dynamic Departments */}
          {customDepts.length > 0 && (
            <>
              <div className="pt-2 pb-1 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                أقسام إضافية مخصصة
              </div>
              {customDepts.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => {
                    onNavigate('dept', dept.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer text-right ${
                    selectedDeptId === dept.id
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 shrink-0 text-cyan-400" />
                    <span className="truncate">{dept.name}</span>
                  </div>
                  {dept.employeeCount !== undefined && (
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full font-mono">
                      {dept.employeeCount}
                    </span>
                  )}
                </button>
              ))}
            </>
          )}

          <div className="pt-3 pb-1 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            المتابعة والتقارير والإدارة
          </div>

          {/* Manage Departments & Specializations */}
          <button
            onClick={() => {
              onNavigate('custom-depts');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer text-right ${
              currentTab === 'custom-depts'
                ? 'bg-purple-600 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="truncate">الأقسام والتخصصات الإضافية</span>
          </button>

          {/* Missing Documents Monitor */}
          <button
            onClick={() => {
              onNavigate('missing-docs');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer text-right ${
              currentTab === 'missing-docs'
                ? 'bg-amber-600 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span className="truncate">الملفات غير المكتملة</span>
            </div>
            {missingCount > 0 && (
              <span className="text-[10px] bg-rose-500/90 text-white px-2 py-0.5 rounded-full font-bold font-mono">
                {missingCount}
              </span>
            )}
          </button>

          {/* Comprehensive Reports */}
          <button
            onClick={() => {
              onNavigate('reports');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer text-right ${
              currentTab === 'reports'
                ? 'bg-purple-600 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0 text-indigo-400" />
            <span className="truncate">التقارير والإحصائيات</span>
          </button>

          {/* User Management & Permissions */}
          <button
            onClick={() => {
              onNavigate('users');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer text-right ${
              currentTab === 'users'
                ? 'bg-purple-600 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0 text-teal-400" />
            <span className="truncate">إدارة المستخدمين والصلاحيات</span>
          </button>

          {/* Settings & Database Backup */}
          <button
            onClick={() => {
              onNavigate('settings');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer text-right ${
              currentTab === 'settings'
                ? 'bg-purple-600 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0 text-slate-400" />
            <span className="truncate">الإعدادات والنسخ الاحتياطي</span>
          </button>
        </div>

        {/* Sidebar Footer info */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-400 text-center">
          <div>مدرسة وي للتكنولوجيا التطبيقية</div>
          <div className="text-[10px] text-slate-500">محافظة المنيا · 2024 / 2025</div>
        </div>
      </aside>
    </>
  );
};
