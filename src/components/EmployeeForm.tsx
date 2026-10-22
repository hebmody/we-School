import React, { useState, useEffect } from 'react';
import {
  User,
  Briefcase,
  GraduationCap,
  Plus,
  Trash2,
  Save,
  X,
  Upload,
  AlertCircle,
  Building,
} from 'lucide-react';
import { Employee, Department, Specialization, Qualification, TrainingCourse } from '../types';
import { parseEgyptianNationalId } from '../utils/egyptianId';

interface EmployeeFormProps {
  initialEmployee?: Employee | null;
  departments: Department[];
  specializations: Specialization[];
  onSave: (payload: {
    employeeData: Partial<Employee>;
    qualifications: Qualification[];
    trainings: TrainingCourse[];
  }) => Promise<void>;
  onCancel: () => void;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  initialEmployee,
  departments,
  specializations,
  onSave,
  onCancel,
}) => {
  const isEditing = Boolean(initialEmployee);

  // Section A: Personal Information
  const [fullName, setFullName] = useState(initialEmployee?.fullName || '');
  const [nationalId, setNationalId] = useState(initialEmployee?.nationalId || '');
  const [birthDate, setBirthDate] = useState(initialEmployee?.birthDate || '');
  const [govCode, setGovCode] = useState(initialEmployee?.govCode || '');
  const [gender, setGender] = useState<'ذكر' | 'أنثى'>(initialEmployee?.gender || 'ذكر');
  const [photoUrl, setPhotoUrl] = useState(initialEmployee?.photoUrl || '');
  const [phone, setPhone] = useState(initialEmployee?.phone || '');
  const [altPhone, setAltPhone] = useState(initialEmployee?.altPhone || '');
  const [email, setEmail] = useState(initialEmployee?.email || '');
  const [address, setAddress] = useState(initialEmployee?.address || '');
  const [emergencyContact, setEmergencyContact] = useState(initialEmployee?.emergencyContact || '');

  // Section B: Employment Information
  const [departmentId, setDepartmentId] = useState(initialEmployee?.departmentId || departments[0]?.id || '');
  const [specializationId, setSpecializationId] = useState(initialEmployee?.specializationId || '');
  const [jobTitle, setJobTitle] = useState(initialEmployee?.jobTitle || '');
  const [contractType, setContractType] = useState(initialEmployee?.contractType || 'قطاع خاص محدد المدة');
  const [hiringEntity, setHiringEntity] = useState(initialEmployee?.hiringEntity || 'الشركة المصرية للاتصالات WE');
  const [hireDate, setHireDate] = useState(initialEmployee?.hireDate || new Date().toISOString().split('T')[0]);
  const [schoolStartDate, setSchoolStartDate] = useState(
    initialEmployee?.schoolStartDate || new Date().toISOString().split('T')[0]
  );
  const [jobGrade, setJobGrade] = useState(initialEmployee?.jobGrade || 'الدرجة الثانية');
  const [requiredQualification, setRequiredQualification] = useState(initialEmployee?.requiredQualification || '');
  const [directSupervisor, setDirectSupervisor] = useState(initialEmployee?.directSupervisor || 'مدير المدرسة');
  const [employmentStatus, setEmploymentStatus] = useState<'على رأس العمل' | 'إجازة' | 'منقول' | 'انتهت خدمته'>(
    initialEmployee?.employmentStatus || 'على رأس العمل'
  );
  const [adminNotes, setAdminNotes] = useState(initialEmployee?.adminNotes || '');

  // Section C: Dynamic Repeaters for Qualifications and Training
  const [qualifications, setQualifications] = useState<Qualification[]>(
    initialEmployee?.qualifications && initialEmployee.qualifications.length > 0
      ? initialEmployee.qualifications
      : [
          {
            degree: 'بكالوريوس هندسة / حاسبات',
            major: '',
            institution: 'جامعة المنيا',
            graduationYear: 2018,
            grade: 'جيد جداً',
          },
        ]
  );

  const [trainings, setTrainings] = useState<TrainingCourse[]>(
    initialEmployee?.trainings && initialEmployee.trainings.length > 0
      ? initialEmployee.trainings
      : []
  );

  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [nidInfo, setNidInfo] = useState<string | null>(null);

  // Auto-fill from Egyptian National ID on change
  const handleNationalIdChange = (val: string) => {
    setNationalId(val);
    const parsed = parseEgyptianNationalId(val);
    if (parsed.isValid && parsed.birthDate && parsed.gender) {
      setBirthDate(parsed.birthDate);
      setGender(parsed.gender);
      setNidInfo(`محافظة الميلاد: ${parsed.governorate} · تاريخ الميلاد المستخرج: ${parsed.formattedBirthDate} · النوع: ${parsed.gender}`);
      setErrorMessage('');
    } else {
      setNidInfo(null);
    }
  };

  // Specializations for currently selected department
  const currentDept = departments.find((d) => d.id === departmentId);
  const isPrivateSectorDept =
    currentDept?.name.includes('قطاع خاص') || departmentId === 'dept-2';

  const relevantSpecializations = specializations.filter((s) => s.departmentId === departmentId);

  // Handle Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Qualification Repeater Handlers
  const addQualificationRow = () => {
    setQualifications([
      ...qualifications,
      {
        degree: '',
        major: '',
        institution: '',
        graduationYear: new Date().getFullYear(),
        grade: 'جيد',
      },
    ]);
  };

  const removeQualificationRow = (index: number) => {
    setQualifications(qualifications.filter((_, idx) => idx !== index));
  };

  const updateQualificationRow = (index: number, field: keyof Qualification, val: any) => {
    const updated = [...qualifications];
    updated[index] = { ...updated[index], [field]: val };
    setQualifications(updated);
  };

  // Training Course Repeater Handlers
  const addTrainingRow = () => {
    setTrainings([
      ...trainings,
      {
        courseName: '',
        organizer: '',
        completionDate: new Date().toISOString().split('T')[0],
        hours: 40,
        certificateNo: '',
      },
    ]);
  };

  const removeTrainingRow = (index: number) => {
    setTrainings(trainings.filter((_, idx) => idx !== index));
  };

  const updateTrainingRow = (index: number, field: keyof TrainingCourse, val: any) => {
    const updated = [...trainings];
    updated[index] = { ...updated[index], [field]: val };
    setTrainings(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!fullName.trim() || fullName.trim().split(/\s+/).length < 3) {
      setErrorMessage('يرجى إدخال الاسم الرباعي للموظف بدقة');
      return;
    }

    if (!/^\d{14}$/.test(nationalId.trim())) {
      setErrorMessage('الرقم القومي يجب أن يتكون من 14 رقماً دقيقاً');
      return;
    }

    if (!departmentId) {
      setErrorMessage('يرجى اختيار القسم أو الإدارة');
      return;
    }

    if (isPrivateSectorDept && !specializationId) {
      setErrorMessage('يرجى تحديد التخصص لمعلم القطاع الخاص (برمجة، شبكات، اتصالات، ديجيتال آرت، أو ذكاء اصطناعي)');
      return;
    }

    if (!jobTitle.trim()) {
      setErrorMessage('يرجى إدخال المسمى الوظيفي');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        employeeData: {
          fullName: fullName.trim(),
          nationalId: nationalId.trim(),
          birthDate,
          govCode: govCode.trim() || undefined,
          gender,
          photoUrl: photoUrl || undefined,
          phone: phone.trim(),
          altPhone: altPhone.trim() || undefined,
          email: email.trim(),
          address: address.trim(),
          emergencyContact: emergencyContact.trim() || undefined,
          departmentId,
          specializationId: specializationId || undefined,
          jobTitle: jobTitle.trim(),
          contractType,
          hiringEntity,
          hireDate,
          schoolStartDate,
          jobGrade,
          requiredQualification,
          directSupervisor,
          employmentStatus,
          adminNotes,
        },
        qualifications,
        trainings,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء حفظ البيانات');
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden max-w-5xl mx-auto">
      {/* Form Header */}
      <div className="bg-gradient-to-l from-purple-900 to-slate-900 text-white p-5 flex items-center justify-between">
        <div>
          <h2 className="text-base lg:text-lg font-bold flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-300" />
            <span>{isEditing ? `تعديل بيانات الموظف: ${initialEmployee?.fullName}` : 'تسجيل موظف جديد بالمنظومة'}</span>
          </h2>
          <p className="text-xs text-purple-200 mt-1">
            مدرسة وي للتكنولوجيا التطبيقية بالمنيا · نموذج السجل الوظيفي الرسمي المعتمد
          </p>
        </div>

        <button
          onClick={onCancel}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {errorMessage && (
        <div className="m-5 p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-800 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-8 text-xs text-slate-800">
        {/* ================= SECTION A: PERSONAL INFO ================= */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-900 font-bold text-sm">
            <User className="w-4 h-4 text-purple-700" />
            <span>أولاً: البيانات الشخصية (Personal Information)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Photo Upload Card */}
            <div className="md:col-span-1 flex flex-col items-center justify-center p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50/50 text-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-200 bg-white mb-2 relative flex items-center justify-center shadow-xs">
                {photoUrl ? (
                  <img src={photoUrl} alt="صورة الموظف" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-slate-300" />
                )}
              </div>
              <label className="cursor-pointer text-[11px] font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 bg-white px-2.5 py-1 rounded border border-slate-200 shadow-2xs">
                <Upload className="w-3 h-3" />
                <span>رفع صورة شخصية</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              <span className="text-[10px] text-slate-400 mt-1">خلفية بيضاء 4×6</span>
            </div>

            {/* Inputs 3 Cols */}
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  الاسم الرباعي للموظف <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد محمود إبراهيم عبد الرحمن"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
              </div>

              {/* National ID */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  الرقم القومي (14 رقماً) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={14}
                  required
                  placeholder="14 رقماً مصرياً"
                  value={nationalId}
                  onChange={(e) => handleNationalIdChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
              </div>

              {/* National ID Info feedback if valid */}
              {nidInfo && (
                <div className="sm:col-span-3 p-2 bg-purple-50/70 border border-purple-200 rounded text-[11px] text-purple-800">
                  {nidInfo}
                </div>
              )}

              {/* Birth Date */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  تاريخ الميلاد <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">النوع</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs focus:ring-2 focus:ring-purple-500"
                >
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
                </select>
              </div>

              {/* Gov Code */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  كود الموظف (للحكوميين)
                </label>
                <input
                  type="text"
                  placeholder="مثال: GOV-84125"
                  value={govCode}
                  onChange={(e) => setGovCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  رقم الهاتف المحمول <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="01xxxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
              </div>

              {/* Alt Phone */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">رقم هاتف بديل</label>
                <input
                  type="tel"
                  placeholder="هاتف المنزل أو الطوارئ"
                  value={altPhone}
                  onChange={(e) => setAltPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  placeholder="name@we-minya.edu.eg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">العنوان بالتفصيل</label>
                <input
                  type="text"
                  placeholder="المحافظة - المركز / المدينة - اسم الشارع والعمارة"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">جهة الاتصال في الطوارئ</label>
                <input
                  type="text"
                  placeholder="صلة القرابة ورقم الهاتف"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION B: EMPLOYMENT INFO ================= */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-900 font-bold text-sm">
            <Briefcase className="w-4 h-4 text-purple-700" />
            <span>ثانياً: البيانات الوظيفية والتعاقد (Employment Information)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Department (Dynamic Dropdown) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                القسم أو الإدارة الرئيسية <span className="text-rose-500">*</span>
              </label>
              <select
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value);
                  setSpecializationId('');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs focus:ring-2 focus:ring-purple-500"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Specialization (Dynamic Dropdown Rules!) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                التخصص أو البرنامج
                {isPrivateSectorDept && <span className="text-rose-500"> * (إجباري لمعلمي القطاع الخاص)</span>}
              </label>
              <select
                value={specializationId}
                onChange={(e) => setSpecializationId(e.target.value)}
                disabled={relevantSpecializations.length === 0}
                className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              >
                <option value="">
                  {relevantSpecializations.length > 0 ? '-- اختر التخصص المطلوب --' : 'لا توجد تخصصات فرعية لهذا القسم'}
                </option>
                {relevantSpecializations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                المسمى الوظيفي <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="مثال: معلم أول شبكات، مسئول شئون عاملين..."
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs focus:ring-2 focus:ring-purple-500 focus:bg-white"
              />
            </div>

            {/* Contract Type */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">نوع التعاقد</label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs focus:ring-2 focus:ring-purple-500"
              >
                <option value="حكومي دائم">حكومي دائم</option>
                <option value="قطاع خاص محدد المدة">قطاع خاص محدد المدة</option>
                <option value="عقد سنوي">عقد سنوي</option>
                <option value="انتداب">انتداب</option>
                <option value="حصة">حصة</option>
              </select>
            </div>

            {/* Hiring Entity */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">جهة التعيين أو العمل</label>
              <select
                value={hiringEntity}
                onChange={(e) => setHiringEntity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs focus:ring-2 focus:ring-purple-500"
              >
                <option value="وزارة التربية والتعليم والتعليم الفني">وزارة التربية والتعليم والتعليم الفني</option>
                <option value="الشركة المصرية للاتصالات WE">الشركة المصرية للاتصالات WE</option>
                <option value="إدارة التطوير التكنولوجي">إدارة التطوير التكنولوجي</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>

            {/* Job Grade */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">الدرجة الوظيفية</label>
              <select
                value={jobGrade}
                onChange={(e) => setJobGrade(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs focus:ring-2 focus:ring-purple-500"
              >
                <option value="الدرجة الممتازة">الدرجة الممتازة</option>
                <option value="الدرجة العالية">الدرجة العالية</option>
                <option value="مدير عام">مدير عام</option>
                <option value="الدرجة الأولى">الدرجة الأولى</option>
                <option value="الدرجة الثانية">الدرجة الثانية</option>
                <option value="الدرجة الثالثة">الدرجة الثالثة</option>
                <option value="غير محدد">غير محدد</option>
              </select>
            </div>

            {/* Hire Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">تاريخ التعيين الأساسي</label>
              <input
                type="date"
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs focus:ring-2 focus:ring-purple-500 focus:bg-white"
              />
            </div>

            {/* School Start Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">تاريخ استلام العمل بالمدرسة</label>
              <input
                type="date"
                value={schoolStartDate}
                onChange={(e) => setSchoolStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs focus:ring-2 focus:ring-purple-500 focus:bg-white"
              />
            </div>

            {/* Employment Status */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">الحالة الوظيفية</label>
              <select
                value={employmentStatus}
                onChange={(e) => setEmploymentStatus(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs focus:ring-2 focus:ring-purple-500"
              >
                <option value="على رأس العمل">على رأس العمل</option>
                <option value="إجازة">إجازة</option>
                <option value="منقول">منقول</option>
                <option value="انتهت خدمته">انتهت خدمته</option>
              </select>
            </div>

            {/* Direct Supervisor */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">اسم المدير المباشر</label>
              <input
                type="text"
                placeholder="مدير المدرسة / رئيس القسم"
                value={directSupervisor}
                onChange={(e) => setDirectSupervisor(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs focus:ring-2 focus:ring-purple-500 focus:bg-white"
              />
            </div>

            {/* Required Qualification for Role */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">المؤهل المطلوب لشغل الوظيفة</label>
              <input
                type="text"
                placeholder="مثال: بكالوريوس حاسبات ومعلومات أو هندسة اتصالات بتقدير جيد على الأقل"
                value={requiredQualification}
                onChange={(e) => setRequiredQualification(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs focus:ring-2 focus:ring-purple-500 focus:bg-white"
              />
            </div>

            {/* Admin Notes */}
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">ملاحظات إدارية وقرارات خاصة</label>
              <textarea
                rows={2}
                placeholder="أي ملاحظات تخص الانتداب أو التكليفات الخاصة بالمدرسة..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-xs focus:ring-2 focus:ring-purple-500 focus:bg-white"
              />
            </div>
          </div>
        </section>

        {/* ================= SECTION C: QUALIFICATIONS & TRAINING ================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-slate-900 font-bold text-sm">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-purple-700" />
              <span>ثالثاً: المؤهلات الدراسية والتدريب والتطوير المهني</span>
            </div>
          </div>

          {/* Qualifications Repeater */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">المؤهلات الدراسية والشهادات الجامعية</span>
              <button
                type="button"
                onClick={addQualificationRow}
                className="flex items-center gap-1 text-[11px] text-purple-700 hover:text-purple-900 font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة مؤهل دراسي آخر</span>
              </button>
            </div>

            {qualifications.map((q, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-5 gap-2 p-3 bg-slate-50/70 border border-slate-200 rounded-lg relative"
              >
                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-slate-500 mb-0.5">المؤهل والدرجة</label>
                  <input
                    type="text"
                    placeholder="بكالوريوس هندسة / ماجستير..."
                    value={q.degree}
                    onChange={(e) => updateQualificationRow(idx, 'degree', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded py-1 px-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">التخصص</label>
                  <input
                    type="text"
                    placeholder="علوم حاسب / اتصالات"
                    value={q.major}
                    onChange={(e) => updateQualificationRow(idx, 'major', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded py-1 px-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">الجامعة / الكلية</label>
                  <input
                    type="text"
                    placeholder="جامعة المنيا"
                    value={q.institution}
                    onChange={(e) => updateQualificationRow(idx, 'institution', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded py-1 px-2 text-xs"
                  />
                </div>
                <div className="flex items-end gap-1">
                  <div className="flex-1">
                    <label className="block text-[10px] text-slate-500 mb-0.5">سنة التخرج</label>
                    <input
                      type="number"
                      value={q.graduationYear}
                      onChange={(e) => updateQualificationRow(idx, 'graduationYear', Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded py-1 px-2 text-xs font-mono"
                    />
                  </div>
                  {qualifications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQualificationRow(idx)}
                      className="p-1.5 text-rose-600 hover:bg-rose-100 rounded cursor-pointer"
                      title="حذف هذا المؤهل"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Trainings Repeater */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">الدورات التدريبية والشهادات المهنية المعتمدة</span>
              <button
                type="button"
                onClick={addTrainingRow}
                className="flex items-center gap-1 text-[11px] text-purple-700 hover:text-purple-900 font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة دورة تدريبية</span>
              </button>
            </div>

            {trainings.length === 0 ? (
              <div className="p-3 text-center text-slate-400 bg-slate-50/50 rounded border border-dashed border-slate-200">
                لا توجد دورات تدريبية مسجلة حتى الآن. انقر على "إضافة دورة تدريبية" لإدراج شهادات المعلم.
              </div>
            ) : (
              trainings.map((t, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-5 gap-2 p-3 bg-slate-50/70 border border-slate-200 rounded-lg"
                >
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-500 mb-0.5">اسم الدورة أو البرنامج</label>
                    <input
                      type="text"
                      placeholder="Cisco CCNA, ITI Web Track..."
                      value={t.courseName}
                      onChange={(e) => updateTrainingRow(idx, 'courseName', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded py-1 px-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">الجهة المنظمة</label>
                    <input
                      type="text"
                      placeholder="ITI / المصرية للاتصالات WE"
                      value={t.organizer}
                      onChange={(e) => updateTrainingRow(idx, 'organizer', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded py-1 px-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">تاريخ الإتمام</label>
                    <input
                      type="date"
                      value={t.completionDate}
                      onChange={(e) => updateTrainingRow(idx, 'completionDate', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded py-1 px-2 text-xs"
                    />
                  </div>
                  <div className="flex items-end gap-1">
                    <div className="flex-1">
                      <label className="block text-[10px] text-slate-500 mb-0.5">رقم الشهادة</label>
                      <input
                        type="text"
                        placeholder="CERT-1234"
                        value={t.certificateNo || ''}
                        onChange={(e) => updateTrainingRow(idx, 'certificateNo', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded py-1 px-2 text-xs font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTrainingRow(idx)}
                      className="p-1.5 text-rose-600 hover:bg-rose-100 rounded cursor-pointer"
                      title="حذف الدورة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Form Actions */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            إلغاء التغييرات
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-6 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'جارٍ الحفظ...' : isEditing ? 'حفظ التعديلات' : 'تسجيل الموظف وإنشاء السجل'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
