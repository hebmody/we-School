import React, { useState } from 'react';
import {
  User,
  Briefcase,
  GraduationCap,
  FileText,
  FileCheck2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  Printer,
  Download,
  Edit,
  ArrowRight,
  Plus,
  Trash2,
  ShieldAlert,
  Building,
  Upload,
  ExternalLink,
  Award,
} from 'lucide-react';
import { Employee, UserAccount, EmployeeDocument, Qualification, TrainingCourse } from '../types';

interface EmployeeProfileProps {
  employee: Employee;
  currentUser: UserAccount;
  onBack: () => void;
  onEdit: () => void;
  onPrint: () => void;
  onUploadDocument: (docData: {
    name: string;
    docType: string;
    fileName: string;
    fileType: string;
    fileData?: string;
    expiryDate?: string;
    verificationStatus?: 'معتمد' | 'قيد المراجعة';
    notes?: string;
  }) => Promise<void>;
  onVerifyDocument: (docId: string, status: 'معتمد' | 'مرفوض' | 'قيد المراجعة') => Promise<void>;
  onDeleteDocument: (docId: string) => Promise<void>;
  onAddTraining: (training: TrainingCourse) => Promise<void>;
}

export const EmployeeProfile: React.FC<EmployeeProfileProps> = ({
  employee,
  currentUser,
  onBack,
  onEdit,
  onPrint,
  onUploadDocument,
  onVerifyDocument,
  onDeleteDocument,
  onAddTraining,
}) => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddTrainingModal, setShowAddTrainingModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<EmployeeDocument | null>(null);

  // New Document form state
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('المؤهل الدراسي الأساسي');
  const [docExpiry, setDocExpiry] = useState('');
  const [docNotes, setDocNotes] = useState('');
  const [docFileBase64, setDocFileBase64] = useState<string | undefined>();
  const [docFileName, setDocFileName] = useState('');
  const [uploading, setUploading] = useState(false);

  // New Training form state
  const [newCourseName, setNewCourseName] = useState('');
  const [newOrganizer, setNewOrganizer] = useState('');
  const [newCompDate, setNewCompDate] = useState(new Date().toISOString().split('T')[0]);
  const [newHours, setNewHours] = useState<number>(40);
  const [newCertNo, setNewCertNo] = useState('');
  const [savingTraining, setSavingTraining] = useState(false);

  const canManage = ['admin', 'hr'].includes(currentUser.role);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocFileBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitDocUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    setUploading(true);
    try {
      await onUploadDocument({
        name: docName.trim(),
        docType: docType.trim(),
        fileName: docFileName || `${docName}.pdf`,
        fileType: docFileBase64?.startsWith('data:image') ? 'image/jpeg' : 'application/pdf',
        fileData: docFileBase64,
        expiryDate: docExpiry || undefined,
        verificationStatus: 'معتمد',
        notes: docNotes || undefined,
      });
      setShowUploadModal(false);
      setDocName('');
      setDocNotes('');
      setDocFileName('');
      setDocFileBase64(undefined);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء رفع المستند');
    } finally {
      setUploading(false);
    }
  };

  const submitTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    setSavingTraining(true);
    try {
      await onAddTraining({
        courseName: newCourseName.trim(),
        organizer: newOrganizer.trim() || 'المصرية للاتصالات WE',
        completionDate: newCompDate,
        hours: newHours,
        certificateNo: newCertNo.trim() || undefined,
      });
      setShowAddTrainingModal(false);
      setNewCourseName('');
      setNewCertNo('');
    } catch (err: any) {
      alert(err.message || 'خطأ أثناء إضافة الدورة');
    } finally {
      setSavingTraining(false);
    }
  };

  const tabs = [
    { id: 1, label: 'البيانات الشخصية', icon: <User className="w-3.5 h-3.5" /> },
    { id: 2, label: 'البيانات الوظيفية', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { id: 3, label: 'المؤهلات الدراسية', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { id: 4, label: 'التخصص والبرنامج', icon: <Building className="w-3.5 h-3.5" /> },
    { id: 5, label: 'قرارات التعيين والتعاقد', icon: <FileCheck2 className="w-3.5 h-3.5" /> },
    { id: 6, label: 'الدورات والشهادات', icon: <Award className="w-3.5 h-3.5" /> },
    { id: 7, label: `المستندات الرسمية (${employee.documents?.length || 0})`, icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 8, label: 'سجل التعديلات والملاحظات', icon: <Clock className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-purple-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى قائمة العاملين</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {canManage && (
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>تعديل بيانات الموظف</span>
            </button>
          )}

          {canManage && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>إضافة مستند للملف</span>
            </button>
          )}

          {canManage && (
            <button
              onClick={() => setShowAddTrainingModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة دورة تدريبية</span>
            </button>
          )}

          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-700" />
            <span>طباعة ملف الموظف</span>
          </button>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar / Photo */}
          <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-purple-200 bg-purple-50 flex items-center justify-center shadow-xs shrink-0">
            {employee.photoUrl ? (
              <img
                src={employee.photoUrl}
                alt={employee.fullName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <User className="w-16 h-16 text-purple-300" />
            )}
            <span className="absolute bottom-1 right-1 text-[10px] bg-purple-900/80 text-white px-1.5 py-0.2 rounded font-mono">
              WE
            </span>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-2 text-center md:text-right">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-black text-slate-900">{employee.fullName}</h2>
                <p className="text-xs text-purple-700 font-bold mt-0.5">{employee.jobTitle}</p>
              </div>

              {/* Completion Indicator */}
              <div className="flex items-center justify-center md:justify-end gap-2">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-bold font-mono inline-flex items-center gap-1.5 ${
                    employee.fileStatus === 'مكتمل'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>اكتمال الملف: {employee.completionRate}% ({employee.fileStatus})</span>
                </span>
              </div>
            </div>

            {/* Badges / Key Metadata */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1 text-xs text-slate-600">
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                الرقم: {employee.id}
              </span>
              <span>·</span>
              <span className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded font-semibold">
                القسم: {employee.departmentName}
              </span>
              {employee.specializationName && (
                <>
                  <span>·</span>
                  <span className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded font-semibold">
                    التخصص: {employee.specializationName}
                  </span>
                </>
              )}
              <span>·</span>
              <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-medium">
                {employee.employmentStatus}
              </span>
              <span>·</span>
              <span className="text-slate-500 font-mono">
                تاريخ الاستلام بالمدرسة: {employee.schoolStartDate}
              </span>
            </div>
          </div>
        </div>

        {/* Missing Documents Alert inside Profile */}
        {employee.missingDocs && employee.missingDocs.length > 0 && (
          <div className="mt-5 p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-800 font-medium">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                تنبيه: ملف هذا الموظف ينقصه مسوغات تعيين هامة: ({employee.missingDocs.join('، ')})
              </span>
            </div>
            {canManage && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-xs shrink-0 cursor-pointer"
              >
                استكمال الآن
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs Navigation Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-2xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs text-xs text-slate-800">
        {/* Tab 1: Personal Info */}
        {activeTab === 1 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              البيانات الشخصية والرقم القومي
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block mb-0.5">الاسم الرباعي</span>
                <span className="font-bold text-slate-900 text-sm">{employee.fullName}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block mb-0.5">الرقم القومي</span>
                <span className="font-bold font-mono text-purple-900 text-sm">
                  {currentUser.role === 'viewer'
                    ? employee.nationalId.substring(0, 4) + '******' + employee.nationalId.substring(10)
                    : employee.nationalId}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block mb-0.5">تاريخ الميلاد والنوع</span>
                <span className="font-semibold text-slate-800">
                  {employee.birthDate} ({employee.gender})
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block mb-0.5">كود الموظف للحكوميين</span>
                <span className="font-semibold font-mono text-slate-800">
                  {employee.govCode || 'غير محدد (قطاع خاص)'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block mb-0.5">رقم الهاتف الأساسي</span>
                <span className="font-semibold font-mono text-slate-800">{employee.phone}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block mb-0.5">رقم هاتف بديل</span>
                <span className="font-semibold font-mono text-slate-800">{employee.altPhone || 'لا يوجد'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block mb-0.5">البريد الإلكتروني</span>
                <span className="font-semibold font-mono text-slate-800">{employee.email}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg sm:col-span-2">
                <span className="text-[11px] text-slate-500 block mb-0.5">العنوان بالتفصيل</span>
                <span className="font-semibold text-slate-800">{employee.address}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block mb-0.5">جهة الاتصال في الطوارئ</span>
                <span className="font-semibold text-slate-800">{employee.emergencyContact || 'غير مسجل'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Employment Info */}
        {activeTab === 2 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              البيانات الوظيفية والتعاقدية
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block mb-0.5">القسم / الإدارة التابع لها</span>
                <span className="font-bold text-slate-900">{employee.departmentName}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block mb-0.5">التخصص / المسار التكنولوجي</span>
                <span className="font-bold text-purple-800">{employee.specializationName || 'عام'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block mb-0.5">المسمى الوظيفي المعتمد</span>
                <span className="font-bold text-slate-900">{employee.jobTitle}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block mb-0.5">نوع التعاقد</span>
                <span className="font-semibold text-slate-800">{employee.contractType}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block mb-0.5">جهة التعيين أو العمل</span>
                <span className="font-semibold text-slate-800">{employee.hiringEntity}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block mb-0.5">الدرجة الوظيفية</span>
                <span className="font-semibold text-slate-800">{employee.jobGrade || 'غير محدد'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block mb-0.5">تاريخ التعيين الأساسي</span>
                <span className="font-mono text-slate-800">{employee.hireDate}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block mb-0.5">تاريخ استلام العمل بالمدرسة</span>
                <span className="font-mono text-slate-800">{employee.schoolStartDate}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-[11px] text-slate-500 block mb-0.5">المدير المباشر</span>
                <span className="font-semibold text-slate-800">{employee.directSupervisor || 'مدير المدرسة'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg sm:col-span-3">
                <span className="text-[11px] text-slate-500 block mb-0.5">المؤهل المطلوب لشغل الوظيفة</span>
                <span className="text-slate-800">{employee.requiredQualification || 'حسب اشتراطات كادر المعلمين والتعليم التكنولوجي'}</span>
              </div>

              {employee.adminNotes && (
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg sm:col-span-3">
                  <span className="text-[11px] text-amber-800 font-bold block mb-0.5">ملاحظات وقرارات إدارية</span>
                  <span className="text-amber-900">{employee.adminNotes}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Qualifications */}
        {activeTab === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              المؤهلات الدراسية والشهادات العليا
            </h3>
            {employee.qualifications && employee.qualifications.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {employee.qualifications.map((q, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{q.degree}</div>
                      <div className="text-slate-500 mt-1 flex items-center gap-2">
                        <span>التخصص: {q.major}</span>
                        <span>·</span>
                        <span>المؤسسة: {q.institution}</span>
                      </div>
                    </div>
                    <div className="text-left font-mono">
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded">
                        دفعة {q.graduationYear}
                      </span>
                      {q.grade && (
                        <span className="block text-[11px] text-slate-500 mt-1">التقدير: {q.grade}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">لا توجد مؤهلات إضافية مسجلة.</p>
            )}
          </div>
        )}

        {/* Tab 4: Specialization & Program */}
        {activeTab === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              المسار التكنولوجي والبرنامج التدريسي
            </h3>
            <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-xl space-y-2">
              <div className="text-sm font-bold text-purple-900">
                {employee.specializationName || 'كادر عام بمدرسة وي'}
              </div>
              <p className="text-xs text-purple-800 leading-relaxed">
                معلم أو عضو بهيئة التدريس في مدرسة وي للتكنولوجيا التطبيقية بالمنيا، يخضع لمعايير الجودة والتقييم الفني المعتمدة من قطاع التعليم الفني بوزارة التربية والتعليم والشركة المصرية للاتصالات WE.
              </p>
            </div>
          </div>
        )}

        {/* Tab 5: Decisions & Contracts */}
        {activeTab === 5 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              قرارات التعيين والتعاقد والانتداب
            </h3>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">حالة التعاقد الحالية</span>
                <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded font-bold font-mono">
                  {employee.contractType}
                </span>
              </div>
              <div className="text-xs text-slate-600">
                جهة التعاقد أو التكليف: {employee.hiringEntity} · استلام العمل: {employee.schoolStartDate}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Training & Certificates */}
        {activeTab === 6 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                الدورات التدريبية والتطوير المهني والشهادات المعتمدة
              </h3>
              {canManage && (
                <button
                  onClick={() => setShowAddTrainingModal(true)}
                  className="flex items-center gap-1 text-xs text-purple-700 font-bold hover:text-purple-900 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة دورة تدريبية</span>
                </button>
              )}
            </div>

            {employee.trainings && employee.trainings.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {employee.trainings.map((t, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="font-bold text-slate-900">{t.courseName}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        الجهة المنظمة: {t.organizer}
                        {t.hours && ` · ${t.hours} ساعة تدريبية`}
                      </div>
                    </div>
                    <div className="text-left font-mono">
                      <span className="text-xs text-slate-600 block">{t.completionDate}</span>
                      {t.certificateNo && (
                        <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                          {t.certificateNo}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">لا توجد دورات مسجلة.</p>
            )}
          </div>
        )}

        {/* Tab 7: Official Documents */}
        {activeTab === 7 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  المستندات الرسمية المرفوعة في الملف الإلكتروني
                </h3>
                <p className="text-[11px] text-slate-500">
                  شهادات التخرج، بطاقة الرقم القومي، قرارات التعيين، وصحيفة الحالة الجنائية
                </p>
              </div>

              {canManage && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع مستند جديد</span>
                </button>
              )}
            </div>

            {employee.documents && employee.documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {employee.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 border border-slate-200 rounded-xl hover:border-purple-300 transition-all flex flex-col justify-between space-y-2 bg-slate-50/50"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-purple-700 shrink-0" />
                          <span>{doc.name}</span>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            doc.verificationStatus === 'معتمد'
                              ? 'bg-emerald-100 text-emerald-800'
                              : doc.verificationStatus === 'قيد المراجعة'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {doc.verificationStatus}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 mt-1">
                        نوع المستند: <span className="font-semibold text-slate-700">{doc.docType}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        تاريخ الرفع: {doc.uploadDate} · الملف: {doc.fileName}
                      </div>
                      {doc.notes && (
                        <div className="text-[11px] text-slate-600 bg-white p-1.5 rounded mt-1.5 border border-slate-200/80">
                          {doc.notes}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {doc.fileData && (
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="text-xs text-purple-700 hover:text-purple-900 font-semibold px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 flex items-center gap-1 cursor-pointer"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>معاينة</span>
                          </button>
                        )}
                      </div>

                      {canManage && (
                        <div className="flex items-center gap-1">
                          {doc.verificationStatus !== 'معتمد' && (
                            <button
                              onClick={() => onVerifyDocument(doc.id, 'معتمد')}
                              className="text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200 font-medium cursor-pointer"
                            >
                              اعتماد
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف المستند (${doc.name})؟`)) {
                                onDeleteDocument(doc.id);
                              }
                            }}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                            title="حذف المستند"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                لا توجد مستندات مرفوعة حتى الآن. انقر على "رفع مستند جديد" لإرفاق مسوغات التعيين.
              </div>
            )}
          </div>
        )}

        {/* Tab 8: Audit Log */}
        {activeTab === 8 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              سجل التعديلات والعمليات الإدارية على الملف
            </h3>
            {employee.history && employee.history.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {employee.history.map((log) => (
                  <div key={log.id} className="p-3.5 hover:bg-slate-50 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{log.action}</div>
                      <div className="text-slate-600 text-[11px] mt-0.5">{log.details}</div>
                      <div className="text-[10px] text-slate-400 mt-1">بواسطة: {log.userName} ({log.role})</div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      {new Date(log.timestamp).toLocaleString('ar-EG')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">لا توجد عمليات مسجلة حديثاً على هذا الملف.</p>
            )}
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4 text-xs text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-purple-700" />
                <span>رفع مستند جديد لملف الموظف</span>
              </h4>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitDocUpload} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  اسم المستند <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: صورة بطاقة الرقم القومي سارية"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded py-1.5 px-2.5 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">نوع المستند</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded py-1.5 px-2.5 text-xs focus:ring-2 focus:ring-purple-500"
                >
                  <option value="صورة شخصية">صورة شخصية</option>
                  <option value="صورة بطاقة الرقم القومي">صورة بطاقة الرقم القومي</option>
                  <option value="المؤهل الدراسي الأساسي">المؤهل الدراسي الأساسي</option>
                  <option value="قرار التعيين أو عقد العمل">قرار التعيين أو عقد العمل</option>
                  <option value="صحيفة الحالة الجنائية (فيش وتشبيه)">صحيفة الحالة الجنائية (فيش وتشبيه)</option>
                  <option value="شهادة الاعتماد التقني أو التخصصي">شهادة الاعتماد التقني أو التخصصي</option>
                  <option value="شهادة ميلاد كمبيوتر">شهادة ميلاد كمبيوتر</option>
                  <option value="الموقف من التجنيد / الخدمة العامة">الموقف من التجنيد / الخدمة العامة</option>
                  <option value="شهادة خبرة سابقة">شهادة خبرة سابقة</option>
                  <option value="أخرى">مستند إداري آخر</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">اختيار الملف (PDF أو صورة)</label>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleFileChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded py-1.5 px-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">تاريخ انتهاء السريان (إن وجد)</label>
                <input
                  type="date"
                  value={docExpiry}
                  onChange={(e) => setDocExpiry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded py-1.5 px-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">ملاحظات التحقق</label>
                <input
                  type="text"
                  placeholder="أصل / صورة طبق الأصل / ساري..."
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded py-1.5 px-2.5 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded text-xs font-bold cursor-pointer"
                >
                  {uploading ? 'جارٍ الحفظ...' : 'حفظ المستند في الملف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Training Modal */}
      {showAddTrainingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4 text-xs text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-700" />
                <span>إضافة دورة تدريبية أو شهادة مهنية</span>
              </h4>
              <button
                onClick={() => setShowAddTrainingModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitTraining} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  اسم الدورة أو الشهادة <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: Cisco CCNA, AWS Cloud, ITI..."
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded py-1.5 px-2.5 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">الجهة المنظمة</label>
                <input
                  type="text"
                  placeholder="المصرية للاتصالات WE / معهد ITI"
                  value={newOrganizer}
                  onChange={(e) => setNewOrganizer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded py-1.5 px-2.5 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">تاريخ الحصول</label>
                  <input
                    type="date"
                    value={newCompDate}
                    onChange={(e) => setNewCompDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded py-1.5 px-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">عدد الساعات</label>
                  <input
                    type="number"
                    value={newHours}
                    onChange={(e) => setNewHours(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded py-1.5 px-2.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">رقم الشهادة أو الاعتماد</label>
                <input
                  type="text"
                  placeholder="CERT-XXXX"
                  value={newCertNo}
                  onChange={(e) => setNewCertNo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded py-1.5 px-2.5 text-xs font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTrainingModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingTraining}
                  className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded text-xs font-bold cursor-pointer"
                >
                  {savingTraining ? 'جارٍ الحفظ...' : 'إضافة الدورة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{previewDoc.name}</h4>
                <p className="text-[11px] text-slate-500">
                  {previewDoc.docType} · تاريخ الرفع: {previewDoc.uploadDate}
                </p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-slate-100 rounded-lg p-4">
              {previewDoc.fileData?.startsWith('data:image') ? (
                <img
                  src={previewDoc.fileData}
                  alt={previewDoc.name}
                  className="max-h-[60vh] object-contain rounded border border-slate-200 shadow-xs"
                />
              ) : previewDoc.fileData?.startsWith('data:application/pdf') ? (
                <iframe
                  src={previewDoc.fileData}
                  title={previewDoc.name}
                  className="w-full h-[60vh] rounded border border-slate-200"
                />
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold text-slate-800">{previewDoc.fileName}</p>
                  <p className="text-xs text-slate-500 mt-1">مستند رسمي مؤرشف في قاعدة البيانات الآمنة</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-xs text-slate-500">
                حالة التحقق: <strong className="text-purple-700">{previewDoc.verificationStatus}</strong>
              </span>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer"
              >
                إغلاق المعاينة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
