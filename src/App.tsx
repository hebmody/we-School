import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import {
  Department,
  Specialization,
  Employee,
  UserAccount,
  DashboardStats,
  SchoolInfo,
  RequiredDocument,
  AuditLog,
  Qualification,
  TrainingCourse,
} from './types';
import { Header } from './components/Header';
import { Sidebar, NavigationTarget } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { EmployeeList } from './components/EmployeeList';
import { EmployeeForm } from './components/EmployeeForm';
import { EmployeeProfile } from './components/EmployeeProfile';
import { MissingDocuments } from './components/MissingDocuments';
import { ReportsView } from './components/ReportsView';
import { DepartmentsManager } from './components/DepartmentsManager';
import { UserManagement } from './components/UserManagement';
import { SettingsDatabase } from './components/SettingsDatabase';
import { PrintReportModal } from './components/PrintReportModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { Menu, Loader2 } from 'lucide-react';

export default function App() {
  // Global State
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserAccount>({
    id: 'usr-1',
    name: 'م. طارق العشماوي (مدير النظام)',
    email: 'admin@we-minya.edu.eg',
    role: 'admin',
    isActive: true,
    createdAt: '2024-09-01',
  });

  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | undefined>();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [requiredDocs, setRequiredDocs] = useState<RequiredDocument[]>([]);
  const [incompleteFiles, setIncompleteFiles] = useState<any[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavigationTarget | 'employee-profile' | 'employee-form'>('dashboard');
  const [selectedDeptId, setSelectedDeptId] = useState<string | undefined>();
  const [selectedSpecId, setSelectedSpecId] = useState<string | undefined>();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Modals State
  const [printModalConfig, setPrintModalConfig] = useState<{
    title: string;
    subtitle: string;
    headers: string[];
    rows: any[][];
    summaryRow?: Record<string, string>;
  } | null>(null);

  const [showImportModal, setShowImportModal] = useState(false);

  // Fetch Master Data
  const loadAllData = useCallback(async () => {
    try {
      const [dashRes, depts, specs, emps, reqs, missing] = await Promise.all([
        api.getDashboardStats(),
        api.getDepartments(),
        api.getSpecializations(),
        api.getEmployees({ includeArchived: true }),
        api.getRequiredDocuments(),
        api.getMissingDocumentsAlerts(),
      ]);

      setDashboardStats(dashRes.stats);
      setSchoolInfo(dashRes.schoolInfo);
      setDepartments(depts);
      setSpecializations(specs);
      setEmployees(emps);
      setRequiredDocs(reqs);
      setIncompleteFiles(missing);

      // If user is admin or principal, load users and logs
      if (['admin', 'principal'].includes(currentUser.role)) {
        try {
          const [uList, logs] = await Promise.all([api.getUsers(), api.getAuditLogs()]);
          setUsers(uList);
          setAuditLogs(logs);
        } catch {
          // Ignore secondary permission errors
        }
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser.role]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handle Role Switch for live demonstration of security access
  const handleSwitchRole = async (role: string) => {
    try {
      setLoading(true);
      const user = await api.switchRole(role);
      setCurrentUser(user);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'خطأ في تبديل الصلاحية');
    } finally {
      setLoading(false);
    }
  };

  // Navigation Handler
  const handleNavigate = (target: NavigationTarget, deptId?: string, specId?: string) => {
    setCurrentTab(target);
    setSelectedDeptId(deptId);
    setSelectedSpecId(specId);
    setSelectedEmployee(null);
    setEditingEmployee(null);
  };

  // Open Add Employee
  const handleOpenAddEmployee = () => {
    setEditingEmployee(null);
    setCurrentTab('employee-form');
  };

  // Select Employee to view Profile
  const handleSelectEmployee = async (empId: string) => {
    try {
      setLoading(true);
      const emp = await api.getEmployeeById(empId);
      setSelectedEmployee(emp);
      setCurrentTab('employee-profile');
    } catch (err: any) {
      alert(err.message || 'خطأ أثناء جلب الملف الإلكتروني');
    } finally {
      setLoading(false);
    }
  };

  // Open Edit Employee
  const handleEditEmployee = async (empId: string) => {
    try {
      setLoading(true);
      const emp = await api.getEmployeeById(empId);
      setEditingEmployee(emp);
      setCurrentTab('employee-form');
    } catch (err: any) {
      alert(err.message || 'تعذر فتح نموذج التعديل');
    } finally {
      setLoading(false);
    }
  };

  // Save Employee (Create or Update)
  const handleSaveEmployee = async (payload: {
    employeeData: Partial<Employee>;
    qualifications: Qualification[];
    trainings: TrainingCourse[];
  }) => {
    if (editingEmployee) {
      await api.updateEmployee(editingEmployee.id, payload.employeeData);
      // Reload profile
      await handleSelectEmployee(editingEmployee.id);
    } else {
      const created = await api.createEmployee(payload);
      await handleSelectEmployee(created.id);
    }
    await loadAllData();
  };

  // Archive Employee
  const handleArchiveEmployee = async (empId: string) => {
    await api.archiveEmployee(empId);
    await loadAllData();
  };

  // Restore Employee
  const handleRestoreEmployee = async (empId: string) => {
    await api.restoreEmployee(empId);
    await loadAllData();
  };

  // Upload Document to Employee Profile
  const handleUploadDocument = async (docData: any) => {
    if (!selectedEmployee) return;
    await api.uploadDocument(selectedEmployee.id, docData);
    await handleSelectEmployee(selectedEmployee.id);
    await loadAllData();
  };

  // Verify Document
  const handleVerifyDocument = async (docId: string, status: 'معتمد' | 'مرفوض' | 'قيد المراجعة') => {
    if (!selectedEmployee) return;
    await api.verifyDocument(docId, status);
    await handleSelectEmployee(selectedEmployee.id);
    await loadAllData();
  };

  // Delete Document
  const handleDeleteDocument = async (docId: string) => {
    if (!selectedEmployee) return;
    await api.deleteDocument(docId);
    await handleSelectEmployee(selectedEmployee.id);
    await loadAllData();
  };

  // Add Training to Employee Profile
  const handleAddTraining = async (training: TrainingCourse) => {
    if (!selectedEmployee) return;
    await api.addTraining(selectedEmployee.id, training);
    await handleSelectEmployee(selectedEmployee.id);
    await loadAllData();
  };

  // Print Individual Employee Profile
  const handlePrintEmployeeProfile = () => {
    if (!selectedEmployee) return;
    const emp = selectedEmployee;
    const rows = [
      ['الرقم الوظيفي', emp.id],
      ['الاسم الرباعي', emp.fullName],
      ['الرقم القومي', currentUser.role === 'viewer' ? 'محجوب' : emp.nationalId],
      ['القسم / الإدارة', emp.departmentName || '-'],
      ['التخصص أو المسار', emp.specializationName || '-'],
      ['المسمى الوظيفي', emp.jobTitle],
      ['نوع التعاقد', emp.contractType],
      ['جهة التعيين / العمل', emp.hiringEntity],
      ['الدرجة الوظيفية', emp.jobGrade || '-'],
      ['تاريخ التعيين', emp.hireDate],
      ['تاريخ استلام العمل بالمدرسة', emp.schoolStartDate],
      ['رقم الهاتف المحمول', emp.phone],
      ['البريد الإلكتروني', emp.email],
      ['العنوان التفصيلي', emp.address],
      ['الحالة الوظيفية', emp.employmentStatus],
      ['نسبة اكتمال الملف', `${emp.completionRate}% (${emp.fileStatus})`],
      ['المستندات الرسمية المرفوعة', (emp.documents?.map((d) => `${d.name} [${d.verificationStatus}]`).join('، ')) || 'لا يوجد'],
    ];

    setPrintModalConfig({
      title: `بيان حالة وظيفية تفصيلي: ${emp.fullName}`,
      subtitle: `الرقم الوظيفي: ${emp.id} · كادر مدرسة وي للتكنولوجيا التطبيقية بالمنيا`,
      headers: ['البيان الوظيفي', 'البيانات المسجلة بالمنظومة'],
      rows,
    });
  };

  // Print Custom Filtered Employee List
  const handlePrintFilteredList = (list: Employee[]) => {
    setPrintModalConfig({
      title: 'سجل حصر العاملين بمدرسة وي للتكنولوجيا التطبيقية بالمنيا',
      subtitle: `كشف معتمد يضم عدد (${list.length}) موظف`,
      headers: ['م', 'الرقم الوظيفي', 'الاسم الرباعي', 'المسمى الوظيفي', 'القسم', 'التخصص', 'نوع التعاقد', 'الحالة', 'اكتمال الملف'],
      rows: list.map((e, idx) => [
        idx + 1,
        e.id,
        e.fullName,
        e.jobTitle,
        e.departmentName || '-',
        e.specializationName || '-',
        e.contractType,
        e.employmentStatus,
        `${e.completionRate}%`,
      ]),
    });
  };

  // Print Missing Documents Report
  const handlePrintMissingReport = (list: any[]) => {
    setPrintModalConfig({
      title: 'تقرير المستندات الناقصة والملفات غير المكتملة',
      subtitle: `بيان رسمي موجه لشئون العاملين لمطالبة عدد (${list.length}) موظف باستكمال مسوغات التعيين`,
      headers: ['م', 'الرقم الوظيفي', 'اسم الموظف', 'القسم والتخصص', 'المستندات المطلوبة للاستكمال', 'عدد النواقص', 'الحالة'],
      rows: list.map((item, idx) => [
        idx + 1,
        item.employeeId,
        item.fullName,
        `${item.departmentName} ${item.specializationName ? `(${item.specializationName})` : ''}`,
        item.missingList.join('، '),
        item.missingList.length,
        item.fileStatus,
      ]),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        schoolInfo={schoolInfo}
        onSwitchRole={handleSwitchRole}
        onAddNewEmployee={handleOpenAddEmployee}
      />

      {/* Mobile Top Navbar Trigger */}
      <div className="lg:hidden bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
        <button
          onClick={() => setIsMobileNavOpen(true)}
          className="flex items-center gap-2 text-xs font-bold bg-slate-800 px-3 py-1.5 rounded-lg text-purple-300"
        >
          <Menu className="w-4 h-4" />
          <span>قائمة الأقسام والتصنيفات</span>
        </button>
        <div className="text-xs font-bold text-slate-300">{schoolInfo?.name || 'مدرسة وي بالمنيا'}</div>
      </div>

      {/* Main Layout (Sidebar + Viewport) */}
      <div className="flex-1 flex w-full">
        {/* RTL Sidebar */}
        <Sidebar
          currentTab={currentTab}
          selectedDeptId={selectedDeptId}
          selectedSpecId={selectedSpecId}
          departments={departments}
          specializations={specializations}
          missingCount={incompleteFiles.length}
          onNavigate={handleNavigate}
          isOpenMobile={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
        />

        {/* Viewport Canvas */}
        <main className="flex-1 min-w-0 p-4 lg:p-8 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <Loader2 className="w-8 h-8 text-purple-700 animate-spin" />
              <div className="text-xs font-bold text-slate-600">جارٍ تحميل بيانات مدرسة وي للتكنولوجيا التطبيقية...</div>
            </div>
          ) : (
            <>
              {/* Dashboard */}
              {currentTab === 'dashboard' && dashboardStats && (
                <Dashboard
                  stats={dashboardStats}
                  schoolInfo={schoolInfo}
                  onNavigate={handleNavigate}
                  onOpenAddEmployee={handleOpenAddEmployee}
                  onOpenAddDept={() => handleNavigate('custom-depts')}
                  onSelectEmployee={handleSelectEmployee}
                />
              )}

              {/* All Employees or Filtered by Dept / Spec */}
              {(currentTab === 'all-employees' || currentTab === 'dept' || currentTab === 'spec') && (
                <EmployeeList
                  employees={employees}
                  departments={departments}
                  specializations={specializations}
                  currentUser={currentUser}
                  initialDeptId={selectedDeptId}
                  initialSpecId={selectedSpecId}
                  onSelectEmployee={handleSelectEmployee}
                  onEditEmployee={handleEditEmployee}
                  onAddNewEmployee={handleOpenAddEmployee}
                  onArchiveEmployee={handleArchiveEmployee}
                  onRestoreEmployee={handleRestoreEmployee}
                  onOpenImportModal={() => setShowImportModal(true)}
                  onPrintPreviewList={handlePrintFilteredList}
                />
              )}

              {/* Add or Edit Employee Form */}
              {currentTab === 'employee-form' && (
                <EmployeeForm
                  initialEmployee={editingEmployee}
                  departments={departments}
                  specializations={specializations}
                  onSave={handleSaveEmployee}
                  onCancel={() => {
                    if (selectedEmployee) {
                      setCurrentTab('employee-profile');
                    } else {
                      setCurrentTab('all-employees');
                    }
                  }}
                />
              )}

              {/* Individual Employee Profile */}
              {currentTab === 'employee-profile' && selectedEmployee && (
                <EmployeeProfile
                  employee={selectedEmployee}
                  currentUser={currentUser}
                  onBack={() => setCurrentTab('all-employees')}
                  onEdit={() => handleEditEmployee(selectedEmployee.id)}
                  onPrint={handlePrintEmployeeProfile}
                  onUploadDocument={handleUploadDocument}
                  onVerifyDocument={handleVerifyDocument}
                  onDeleteDocument={handleDeleteDocument}
                  onAddTraining={handleAddTraining}
                />
              )}

              {/* Missing Documents Alert & Monitor */}
              {currentTab === 'missing-docs' && (
                <MissingDocuments
                  incompleteList={incompleteFiles}
                  requiredDocs={requiredDocs}
                  departments={departments}
                  currentUser={currentUser}
                  onSelectEmployee={handleSelectEmployee}
                  onAddRequiredDoc={async (data) => {
                    await api.createRequiredDocument(data);
                    await loadAllData();
                  }}
                  onPrintMissingReport={handlePrintMissingReport}
                />
              )}

              {/* Comprehensive Reports */}
              {currentTab === 'reports' && (
                <ReportsView
                  employees={employees}
                  departments={departments}
                  specializations={specializations}
                  schoolInfo={schoolInfo}
                  onOpenPrintModal={(cfg) => setPrintModalConfig(cfg)}
                />
              )}

              {/* Departments & Specializations Manager */}
              {currentTab === 'custom-depts' && (
                <DepartmentsManager
                  departments={departments}
                  specializations={specializations}
                  currentUser={currentUser}
                  onCreateDepartment={async (name, desc) => {
                    await api.createDepartment(name, desc);
                    await loadAllData();
                  }}
                  onUpdateDepartment={async (id, name, desc) => {
                    await api.updateDepartment(id, name, desc);
                    await loadAllData();
                  }}
                  onDeleteDepartment={async (id) => {
                    const res = await api.deleteDepartment(id);
                    await loadAllData();
                    return res;
                  }}
                  onCreateSpecialization={async (deptId, name) => {
                    await api.createSpecialization(deptId, name);
                    await loadAllData();
                  }}
                  onRefresh={loadAllData}
                />
              )}

              {/* User Accounts & Audit Log */}
              {currentTab === 'users' && (
                <UserManagement
                  users={users}
                  auditLogs={auditLogs}
                  departments={departments}
                  currentUser={currentUser}
                  onCreateUser={async (data) => {
                    await api.createUser(data);
                    await loadAllData();
                  }}
                  onUpdateUser={async (id, data) => {
                    await api.updateUser(id, data);
                    await loadAllData();
                  }}
                />
              )}

              {/* Settings & Database Backup */}
              {currentTab === 'settings' && (
                <SettingsDatabase
                  schoolInfo={schoolInfo}
                  currentUser={currentUser}
                  onUpdateSchoolInfo={async (info) => {
                    await api.updateSchoolInfo(info);
                    await loadAllData();
                  }}
                  onResetDemo={async () => {
                    const msg = await api.resetDemoDatabase();
                    await loadAllData();
                    return msg;
                  }}
                  onClearDemo={async () => {
                    const msg = await api.clearDemoData();
                    await loadAllData();
                    return msg;
                  }}
                  onRestoreBackup={async (snapshot) => {
                    const msg = await api.restoreDatabase(snapshot);
                    await loadAllData();
                    return msg;
                  }}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Print Preview Modal */}
      {printModalConfig && (
        <PrintReportModal
          config={printModalConfig}
          schoolInfo={schoolInfo}
          onClose={() => setPrintModalConfig(null)}
        />
      )}

      {/* Excel Bulk Import Modal */}
      {showImportModal && (
        <ExcelImportModal
          onClose={() => setShowImportModal(false)}
          onImportSuccess={async () => {
            await loadAllData();
          }}
          onBulkImport={async (rows) => {
            return api.bulkImportEmployees(rows);
          }}
        />
      )}
    </div>
  );
}
