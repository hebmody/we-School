import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Key,
  Clock,
  Shield,
  CheckCircle2,
  Lock,
  Search,
} from 'lucide-react';
import { UserAccount, AuditLog, Department } from '../types';

interface UserManagementProps {
  users: UserAccount[];
  auditLogs: AuditLog[];
  departments: Department[];
  currentUser: UserAccount;
  onCreateUser: (data: Partial<UserAccount> & { password?: string }) => Promise<void>;
  onUpdateUser: (id: string, data: Partial<UserAccount>) => Promise<void>;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  auditLogs,
  departments,
  currentUser,
  onCreateUser,
  onUpdateUser,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'roles-matrix'>('users');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New user form state
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState<'admin' | 'principal' | 'hr' | 'dept_head' | 'viewer'>('hr');
  const [userDeptId, setUserDeptId] = useState('');
  const [savingUser, setSavingUser] = useState(false);

  // Audit filter state
  const [auditSearch, setAuditSearch] = useState('');

  const filteredLogs = auditLogs.filter((log) => {
    if (!auditSearch.trim()) return true;
    const q = auditSearch.trim().toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q)
    );
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;

    setSavingUser(true);
    try {
      await onCreateUser({
        name: userName.trim(),
        email: userEmail.trim(),
        password: userPassword.trim() || 'admin',
        role: userRole,
        departmentId: userRole === 'dept_head' ? userDeptId : undefined,
      });
      setShowCreateModal(false);
      setUserName('');
      setUserEmail('');
      setUserPassword('');
    } catch (err: any) {
      alert(err.message || 'خطأ أثناء إنشاء الحساب');
    } finally {
      setSavingUser(false);
    }
  };

  const roleDefinitions = [
    {
      role: 'admin',
      name: 'مدير النظام (System Administrator)',
      desc: 'كامل الصلاحيات الفنية والإدارية، إدارة المستخدمين، إعداد مسوغات التعيين، وإدارة قاعدة البيانات.',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      caps: ['إضافة/تعديل/أرشفة موظفين', 'إدارة المستخدمين والصلاحيات', 'إعداد الأقسام والتخصصات', 'النسخ الاحتياطي', 'تصدير وطباعة كافة التقارير'],
    },
    {
      role: 'principal',
      name: 'مدير المدرسة (School Principal)',
      desc: 'المسئول التنفيذي الأول، اعتماد السجلات، استعراض الإحصائيات، طباعة التقارير الإدارية، بدون كشف البيانات الحساسة إلا بتصريح.',
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      caps: ['معاينة لوحة التحكم والإحصائيات', 'اعتماد التقارير الرسمية وطباعتها', 'متابعة نسب اكتمال الملفات', 'سجل العمليات'],
    },
    {
      role: 'hr',
      name: 'مسئول شئون العاملين (Employee Affairs Officer)',
      desc: 'إدخال السجلات، رفع المستندات الرسمية، مراجعة النواقص، واعتماد ملفات أعضاء هيئة التدريس والإداريين.',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      caps: ['تسجيل موظفين جدد', 'تعديل السجلات والملفات', 'رفع واعتماد المستندات', 'متابعة النواقص', 'تصدير الكشوفات'],
    },
    {
      role: 'dept_head',
      name: 'رئيس قسم (Department Manager)',
      desc: 'متابعة الكوادر والمعلمين التابعين لقسمه فقط، الاطلاع على التخصصات وتحديث السجلات المرتبطة بالقسم.',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      caps: ['عرض العاملين بالقسم الخاص به', 'تحديث بيانات الكادر المصرح بها', 'تقارير القسم'],
    },
    {
      role: 'viewer',
      name: 'مستعلم / اطلاع فقط (Read-Only User)',
      desc: 'صلاحيات قراءة فقط، حجب الأرقام القومية الحساسة والوثائق الخاصة، دون حق التعديل أو الحذف.',
      color: 'bg-slate-100 text-slate-800 border-slate-200',
      caps: ['عرض السجلات العامة فقط', 'حجب الرقم القومي جزئياً', 'منع التعديل والحذف والرفع'],
    },
  ];

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-700 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>نظام الأمان والتحكم في الوصول والأدوار (RBAC)</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 mt-1">
            إدارة حسابات المستخدمين وصلاحيات الوصول
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            تأمين سجلات العاملين بمدرسة وي للتكنولوجيا التطبيقية بالمنيا وتسجيل كافة العمليات في سجل التدقيق الآلي
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>إنشاء حساب مستخدم جديد</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'users'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          حسابات المستخدمين ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('roles-matrix')}
          className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'roles-matrix'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          مصفوفة الأدوار والصلاحيات (5 أدوار)
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          سجل الرقابة والتدقيق الأمني ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Users List */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700 font-bold">
                <tr>
                  <th className="py-3 px-3">الاسم والصفة</th>
                  <th className="py-3 px-3">البريد الإلكتروني للدخول</th>
                  <th className="py-3 px-3">الدور والصلاحية</th>
                  <th className="py-3 px-3">القسم المخصص</th>
                  <th className="py-3 px-3 text-center">حالة الحساب</th>
                  <th className="py-3 px-3">تاريخ الإنشاء</th>
                  {currentUser.role === 'admin' && <th className="py-3 px-3 text-center">الإجراءات</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {users.map((u) => {
                  const dept = departments.find((d) => d.id === u.departmentId);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold text-slate-900">{u.name}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{u.email}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200 font-mono">
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{dept?.name || 'كافة الأقسام'}</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.isActive
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {u.isActive ? 'مفعل' : 'معطل'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-400">{u.createdAt}</td>
                      {currentUser.role === 'admin' && (
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => onUpdateUser(u.id, { isActive: !u.isActive })}
                            className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                              u.isActive
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {u.isActive ? 'تعطيل الحساب' : 'تفعيل'}
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Roles Matrix */}
      {activeTab === 'roles-matrix' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roleDefinitions.map((role) => (
            <div key={role.role} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${role.color}`}>
                  {role.name.split('(')[0]}
                </span>
                <Shield className="w-4 h-4 text-purple-700" />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{role.desc}</p>
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-800 block">الصلاحيات المصرح بها:</span>
                {role.caps.map((cap, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Audit Log */}
      {activeTab === 'audit' && (
        <div className="space-y-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="text"
                placeholder="البحث في سجل العمليات باسم الموظف أو المستخدم أو نوع الإجراء..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-3 pr-9 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50/50"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-700 font-bold">
                  <tr>
                    <th className="py-3 px-3">التوقيت والتاريخ</th>
                    <th className="py-3 px-3">المستخدم والصفة</th>
                    <th className="py-3 px-3">الإجراء المنفذ</th>
                    <th className="py-3 px-3">التفاصيل وبيان العملية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('ar-EG')}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {log.userName}
                        <span className="block text-[10px] text-purple-700 font-mono">[{log.role}]</span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800">{log.action}</td>
                      <td className="py-3 px-3 text-slate-600 leading-relaxed">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4 text-xs text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-purple-700" />
                <span>إنشاء حساب مستخدم جديد للمنظومة</span>
              </h4>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  الاسم الرباعي والصفة <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أ. سامح عبد الهادي (وكيل المدرسة)"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded py-2 px-3 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  البريد الإلكتروني <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@we-minya.edu.eg"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded py-2 px-3 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  كلمة المرور الابتدائية
                </label>
                <input
                  type="password"
                  placeholder="admin أو كلمة مرور مخصصة"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded py-2 px-3 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">الدور والصلاحية</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded py-2 px-3 text-xs focus:ring-2 focus:ring-purple-500"
                >
                  <option value="hr">مسئول شئون العاملين (تسجيل وملفات)</option>
                  <option value="principal">مدير المدرسة (اعتماد وتقارير)</option>
                  <option value="dept_head">رئيس قسم (متابعة القسم)</option>
                  <option value="viewer">مستعلم (اطلاع فقط)</option>
                  <option value="admin">مدير النظام (كامل الصلاحيات)</option>
                </select>
              </div>

              {userRole === 'dept_head' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">القسم المسند إليه</label>
                  <select
                    value={userDeptId}
                    onChange={(e) => setUserDeptId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded py-2 px-3 text-xs focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">-- اختر القسم --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded font-bold cursor-pointer"
                >
                  {savingUser ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
