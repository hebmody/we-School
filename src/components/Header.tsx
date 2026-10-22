import React from 'react';
import { UserAccount, SchoolInfo } from '../types';
import { Shield, UserCheck, Plus } from 'lucide-react';

interface HeaderProps {
  currentUser: UserAccount;
  schoolInfo?: SchoolInfo;
  onSwitchRole: (role: string) => void;
  onAddNewEmployee: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  schoolInfo,
  onSwitchRole,
  onAddNewEmployee,
}) => {
  const roleNames: Record<string, string> = {
    admin: 'مدير النظام (كامل الصلاحيات)',
    principal: 'المدير الأكاديمي (اعتماد وتقارير)',
    hr: 'مسئول شئون العاملين (تسجيل وملفات)',
    dept_head: 'رئيس قسم (متابعة القسم)',
    viewer: 'مستعلم (اطلاع فقط)',
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800 border-purple-200',
    principal: 'bg-amber-100 text-amber-800 border-amber-200',
    hr: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dept_head: 'bg-blue-100 text-blue-800 border-blue-200',
    viewer: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="px-4 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Zone - Clean Typographic Emblem (No Logo Images) */}
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <div className="w-11 h-11 rounded-xl bg-purple-900 border border-purple-700 text-amber-300 font-extrabold text-sm flex items-center justify-center font-mono tracking-tight shadow-xs shrink-0 select-none">
            WE
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base lg:text-lg font-extrabold text-slate-900 tracking-tight">
                {schoolInfo?.name || 'مدرسة وي للتكنولوجيا التطبيقية بالمنيا'}
              </h1>
              <span className="text-[11px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200/60 font-semibold font-mono hidden sm:inline-block">
                {schoolInfo?.academicYear || '2024 / 2025'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              وزارة التربية والتعليم والتعليم الفني بالتعاون مع الشركة المصرية للاتصالات WE
            </p>
          </div>
        </div>

        {/* Right Zone: Role Switcher & Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          {/* Quick Role Tester */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 px-1.5 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              <span>تبديل الصلاحية للتجربة:</span>
            </span>
            <select
              value={currentUser.role}
              onChange={(e) => onSwitchRole(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-200 rounded-md py-1 px-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="admin">مدير النظام (Admin)</option>
              <option value="principal">المدير الأكاديمي (Principal)</option>
              <option value="hr">مسئول شئون العاملين (HR)</option>
              <option value="dept_head">رئيس قسم (Dept Head)</option>
              <option value="viewer">مستعلم (Read-Only)</option>
            </select>
          </div>

          {/* Current User Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-purple-600" />
            <span className="font-semibold text-slate-800">{currentUser.name}</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded border font-medium ${roleColors[currentUser.role] || 'bg-slate-100 text-slate-700'}`}>
              {roleNames[currentUser.role]?.split(' ')[0]}
            </span>
          </div>

          {/* Quick Action Button */}
          {['admin', 'hr'].includes(currentUser.role) && (
            <button
              onClick={onAddNewEmployee}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل موظف جديد</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
