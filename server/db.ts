import fs from 'fs';
import path from 'path';

export interface Department {
  id: string;
  name: string;
  isSystem: boolean;
  status: 'active' | 'archived';
  description?: string;
  createdAt: string;
}

export interface Specialization {
  id: string;
  departmentId: string;
  name: string;
  status: 'active' | 'archived';
  createdAt: string;
}

export interface RequiredDocument {
  id: string;
  departmentId: string | 'all';
  name: string;
  isMandatory: boolean;
  description?: string;
}

export interface Qualification {
  id: string;
  employeeId: string;
  degree: string;
  major: string;
  institution: string;
  graduationYear: number;
  grade?: string;
}

export interface TrainingCourse {
  id: string;
  employeeId: string;
  courseName: string;
  organizer: string;
  completionDate: string;
  hours?: number;
  certificateNo?: string;
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  name: string;
  docType: string;
  fileData?: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  expiryDate?: string;
  verificationStatus: 'معتمد' | 'قيد المراجعة' | 'مرفوض';
  notes?: string;
}

export interface Employee {
  id: string;
  fullName: string;
  nationalId: string;
  birthDate: string;
  govCode?: string;
  gender: 'ذكر' | 'أنثى';
  photoUrl?: string;
  phone: string;
  altPhone?: string;
  email: string;
  address: string;
  emergencyContact?: string;
  
  departmentId: string;
  specializationId?: string;
  jobTitle: string;
  contractType: string;
  hiringEntity: string;
  hireDate: string;
  schoolStartDate: string;
  jobGrade?: string;
  requiredQualification?: string;
  directSupervisor?: string;
  employmentStatus: 'على رأس العمل' | 'إجازة' | 'منقول' | 'انتهت خدمته';
  adminNotes?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'principal' | 'hr' | 'dept_head' | 'viewer';
  departmentId?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  targetType: 'employee' | 'document' | 'department' | 'user' | 'system';
  targetId?: string;
  details: string;
}

export interface SchoolInfo {
  name: string;
  enName: string;
  affiliation: string;
  address: string;
  phone: string;
  email: string;
  academicYear: string;
  principalName: string;
  hrLeadName: string;
}

export interface DatabaseSchema {
  schoolInfo: SchoolInfo;
  departments: Department[];
  specializations: Specialization[];
  requiredDocuments: RequiredDocument[];
  employees: Employee[];
  qualifications: Qualification[];
  trainings: TrainingCourse[];
  documents: EmployeeDocument[];
  users: UserAccount[];
  auditLogs: AuditLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function getInitialSeedData(): DatabaseSchema {
  // Departments with requested: ميسر ريادة أعمال & ميسر ارشاد وتوجيه
  const depts: Department[] = [
    { id: 'dept-1', name: 'معلمون حكومي', isSystem: true, status: 'active', createdAt: '2024-09-01' },
    { id: 'dept-2', name: 'معلمو قطاع خاص', isSystem: true, status: 'active', createdAt: '2024-09-01' },
    { id: 'dept-3', name: 'إداريون', isSystem: true, status: 'active', createdAt: '2024-09-01' },
    { id: 'dept-4', name: 'مديرون', isSystem: true, status: 'active', createdAt: '2024-09-01' },
    { id: 'dept-5', name: 'شئون عاملين', isSystem: true, status: 'active', createdAt: '2024-09-01' },
    { id: 'dept-6', name: 'شئون طلاب', isSystem: true, status: 'active', createdAt: '2024-09-01' },
    { id: 'dept-7', name: 'أخصائي اجتماعي', isSystem: true, status: 'active', createdAt: '2024-09-01' },
    { id: 'dept-8', name: 'أخصائي نفسي', isSystem: true, status: 'active', createdAt: '2024-09-01' },
    { id: 'dept-9', name: 'مسئول جودة', isSystem: true, status: 'active', createdAt: '2024-09-01' },
    { id: 'dept-10', name: 'مسئول تقييم وامتحانات', isSystem: true, status: 'active', createdAt: '2024-09-01' },
    { id: 'dept-11', name: 'مسئول توريدات', isSystem: true, status: 'active', createdAt: '2024-09-01' },
    { id: 'dept-12', name: 'ميسر ريادة أعمال', isSystem: true, status: 'active', createdAt: '2024-09-01', description: 'توجيه ومتابعة مشروعات ريادة الأعمال والابتكار التكنولوجي للطلاب' },
    { id: 'dept-13', name: 'ميسر ارشاد وتوجيه', isSystem: true, status: 'active', createdAt: '2024-09-01', description: 'التوجيه والإرشاد المهني والتربوي لطلاب المدرسة' },
  ];

  const specs: Specialization[] = [
    { id: 'spec-1', departmentId: 'dept-2', name: 'برمجة', status: 'active', createdAt: '2024-09-01' },
    { id: 'spec-2', departmentId: 'dept-2', name: 'شبكات', status: 'active', createdAt: '2024-09-01' },
    { id: 'spec-3', departmentId: 'dept-2', name: 'اتصالات', status: 'active', createdAt: '2024-09-01' },
    { id: 'spec-4', departmentId: 'dept-2', name: 'ديجيتال آرت', status: 'active', createdAt: '2024-09-01' },
    { id: 'spec-5', departmentId: 'dept-2', name: 'تحليل بيانات وذكاء اصطناعي', status: 'active', createdAt: '2024-09-01' },
    { id: 'spec-6', departmentId: 'dept-2', name: 'تكنولوجيا المعلومات', status: 'active', createdAt: '2024-09-01' },
  ];

  const reqDocs: RequiredDocument[] = [
    { id: 'req-1', departmentId: 'all', name: 'صورة شخصية', isMandatory: true, description: 'صورة خلفية بيضاء حديثة 4x6' },
    { id: 'req-2', departmentId: 'all', name: 'صورة بطاقة الرقم القومي', isMandatory: true, description: 'سارية الوجهين' },
    { id: 'req-3', departmentId: 'all', name: 'المؤهل الدراسي الأساسي', isMandatory: true, description: 'أصل أو صورة طبق الأصل' },
    { id: 'req-4', departmentId: 'all', name: 'قرار التعيين أو عقد العمل', isMandatory: true, description: 'معتمد ومختوم' },
    { id: 'req-5', departmentId: 'all', name: 'صحيفة الحالة الجنائية (فيش وتشبيه)', isMandatory: true, description: 'موجهة للمدرسة حديثة' },
    { id: 'req-6', departmentId: 'dept-1', name: 'صحيفة أحوال إلكترونية معتمدة', isMandatory: true, description: 'من الإدارة التعليمية' },
    { id: 'req-7', departmentId: 'dept-2', name: 'شهادة الاعتماد التقني أو التخصصي', isMandatory: true, description: 'شهادات مهنية معتمدة من WE أو جهات دولية' },
  ];

  const users: UserAccount[] = [
    {
      id: 'usr-1',
      name: 'م. طارق العشماوي (مدير النظام)',
      email: 'admin@we-minya.edu.eg',
      password: 'admin',
      role: 'admin',
      isActive: true,
      createdAt: '2024-09-01',
    },
    {
      id: 'usr-2',
      name: 'أ. محمد أبوالعيون (المدير الأكاديمي)',
      email: 'academic.principal@we-minya.edu.eg',
      password: 'admin',
      role: 'principal',
      isActive: true,
      createdAt: '2024-09-01',
    },
    {
      id: 'usr-3',
      name: 'أ. عمر عيد سيد صابر (شئون العاملين)',
      email: 'hr@we-minya.edu.eg',
      password: 'admin',
      role: 'hr',
      isActive: true,
      createdAt: '2024-09-01',
    },
    {
      id: 'usr-4',
      name: 'م. حسام البحيري (رئيس قسم تكنولوجي)',
      email: 'dept_head@we-minya.edu.eg',
      password: 'admin',
      role: 'dept_head',
      departmentId: 'dept-2',
      isActive: true,
      createdAt: '2024-09-01',
    },
    {
      id: 'usr-5',
      name: 'مستعلم (اطلاع فقط)',
      email: 'viewer@we-minya.edu.eg',
      password: 'admin',
      role: 'viewer',
      isActive: true,
      createdAt: '2024-09-01',
    },
  ];

  // Real employee roster for WE Applied Technology School - Minya provided by user:
  const rawList = [
    { name: 'محمد أبوالعيون محمود خالد', role: 'مدير أكاديمى', dept: 'dept-4', spec: undefined, gender: 'ذكر', contract: 'حكومي دائم' },
    { name: 'محمد محمود عبدالفتاح محمود', role: 'اخصائى تطوير', dept: 'dept-3', spec: undefined, gender: 'ذكر', contract: 'حكومي دائم' },
    { name: 'عمر عيد سيد صابر', role: 'شئون عاملين', dept: 'dept-5', spec: undefined, gender: 'ذكر', contract: 'حكومي دائم' },
    { name: 'محمد فاروق عبد الفتاح قاسم', role: 'معلم تربية رياضية', dept: 'dept-1', spec: undefined, gender: 'ذكر', contract: 'حكومي دائم' },
    { name: 'أحمد محمد أحمد محمد الخراط', role: 'معلم لغة عربية و تربية دينية اسلامية', dept: 'dept-1', spec: undefined, gender: 'ذكر', contract: 'حكومي دائم' },
    { name: 'أحمد محمد حسن نصر', role: 'مسئول تقييم', dept: 'dept-10', spec: undefined, gender: 'ذكر', contract: 'قطاع خاص محدد المدة' },
    { name: 'محمد عبد التواب عبد الملك قناوي', role: 'مسئول جودة', dept: 'dept-9', spec: undefined, gender: 'ذكر', contract: 'حكومي دائم' },
    { name: 'غادة احمد سيد عبد العزيز', role: 'شئون طلاب', dept: 'dept-6', spec: undefined, gender: 'أنثى', contract: 'حكومي دائم' },
    { name: 'الهام علي جلال عبدالرحمن', role: 'اخصائية نفسية', dept: 'dept-8', spec: undefined, gender: 'أنثى', contract: 'حكومي دائم' },
    { name: 'ماهيتاب جعفر أمام يوسف', role: 'اخصائية اجتماعية', dept: 'dept-7', spec: undefined, gender: 'أنثى', contract: 'حكومي دائم' },
    { name: 'أمل مصطفى أحمد بيومي', role: 'معلمة MATH (رياضيات بالإنجليزية)', dept: 'dept-1', spec: undefined, gender: 'أنثى', contract: 'حكومي دائم' },
    { name: 'رائد صابر رمضان فراج', role: 'مسئول توريدات', dept: 'dept-11', spec: undefined, gender: 'ذكر', contract: 'حكومي دائم' },
    { name: 'احمد محمد عبد العال محمد', role: 'معلم لغة انجليزية', dept: 'dept-1', spec: undefined, gender: 'ذكر', contract: 'حكومي دائم' },
    { name: 'نجلاء فتحى محمد ابراهيم', role: 'معلمة دراسات اجتماعية', dept: 'dept-1', spec: undefined, gender: 'أنثى', contract: 'حكومي دائم' },
    { name: 'عصام سيد محمد نصر', role: 'معلم لغة عربية و تربية دينية اسلامية', dept: 'dept-1', spec: undefined, gender: 'ذكر', contract: 'حكومي دائم' },
    { name: 'أحمد حسن محمد حسن', role: 'معلم لغة انجليزية', dept: 'dept-1', spec: undefined, gender: 'ذكر', contract: 'حكومي دائم' },
    { name: 'سوزان رمضان محمود عبدالحافظ', role: 'معلمة لغة عربية و تربية دينية اسلامية', dept: 'dept-1', spec: undefined, gender: 'أنثى', contract: 'حكومي دائم' },
    { name: 'هبة محمد شوقى محمد توفيق', role: 'معلمة برمجة', dept: 'dept-2', spec: 'spec-1', gender: 'أنثى', contract: 'قطاع خاص محدد المدة' },
    { name: 'مريم زرعى سامى دانيال', role: 'معلمة دين مسيحى', dept: 'dept-1', spec: undefined, gender: 'أنثى', contract: 'حكومي دائم' },
    { name: 'حنان محمد خليل عبد السميع', role: 'معلمة تربية رياضية', dept: 'dept-1', spec: undefined, gender: 'أنثى', contract: 'حكومي دائم' },
    { name: 'اروة أحمد نور الدين محمد', role: 'معلمة اتصالات', dept: 'dept-2', spec: 'spec-3', gender: 'أنثى', contract: 'قطاع خاص محدد المدة' },
    { name: 'وليد قطب يوسف عبد الحكيم', role: 'معلم تكنولوجيا المعلومات', dept: 'dept-2', spec: 'spec-6', gender: 'ذكر', contract: 'قطاع خاص محدد المدة' },
    { name: 'محمد على صلاح طه', role: 'معلم تكنولوجيا المعلومات', dept: 'dept-2', spec: 'spec-6', gender: 'ذكر', contract: 'قطاع خاص محدد المدة' },
    { name: 'نورهان عثمان كامل إبراهيم', role: 'معلمة اقتصاد + تربية وطنية', dept: 'dept-1', spec: undefined, gender: 'أنثى', contract: 'حكومي دائم' },
    { name: 'سلمي ممدوح كامل عبدالله', role: 'معلمة اتصالات', dept: 'dept-2', spec: 'spec-3', gender: 'أنثى', contract: 'قطاع خاص محدد المدة' },
    { name: 'هالة مؤمن رجب عبدالحكيم', role: 'معلمة فيزياء', dept: 'dept-1', spec: undefined, gender: 'أنثى', contract: 'حكومي دائم' },
    { name: 'رحاب عطا طه عبدالموجود', role: 'إدارية', dept: 'dept-3', spec: undefined, gender: 'أنثى', contract: 'قطاع خاص محدد المدة' },
    { name: 'احمد رمضان عبد المعبود محمد', role: 'معلم تكنولوجيا المعلومات', dept: 'dept-2', spec: 'spec-6', gender: 'ذكر', contract: 'قطاع خاص محدد المدة' },
    { name: 'الاء عادل عبدالمحسن', role: 'معلمة تكنولوجيا المعلومات', dept: 'dept-2', spec: 'spec-6', gender: 'أنثى', contract: 'قطاع خاص محدد المدة' },
    { name: 'حسام محمد عادل جمال الدين', role: 'معلم MATH (رياضيات بالإنجليزية)', dept: 'dept-1', spec: undefined, gender: 'ذكر', contract: 'حكومي دائم' },
    { name: 'نسرين ياسر محمد محمد', role: 'معلمة شبكات', dept: 'dept-2', spec: 'spec-2', gender: 'أنثى', contract: 'قطاع خاص محدد المدة' },
    { name: 'رويدا عبد الفتاح كامل عبدالله', role: 'معلمة برمجة', dept: 'dept-2', spec: 'spec-1', gender: 'أنثى', contract: 'قطاع خاص محدد المدة' },
    { name: 'عبد الرحمن فاخر محمد صادق', role: 'معلم شبكات', dept: 'dept-2', spec: 'spec-2', gender: 'ذكر', contract: 'قطاع خاص محدد المدة' },
    { name: 'احمد سيد فهمى محمد', role: 'م.م. تنفيذى (مساعد مدير تنفيذي)', dept: 'dept-4', spec: undefined, gender: 'ذكر', contract: 'حكومي دائم' },
    { name: 'حازم حسين فؤاد حسين', role: 'معلم شبكات', dept: 'dept-2', spec: 'spec-2', gender: 'ذكر', contract: 'قطاع خاص محدد المدة' },
    { name: 'اية شعبان فاروق تهامى', role: 'معلمة برمجة', dept: 'dept-2', spec: 'spec-1', gender: 'أنثى', contract: 'قطاع خاص محدد المدة' },
    { name: 'مريم اسامة ربيع وردانى', role: 'معلمة MATH (رياضيات بالإنجليزية)', dept: 'dept-1', spec: undefined, gender: 'أنثى', contract: 'حكومي دائم' },
    { name: 'همس أحمد محمد عبد الهادى', role: 'معلمة لغة انجليزية', dept: 'dept-1', spec: undefined, gender: 'أنثى', contract: 'حكومي دائم' },
    { name: 'فاطمة وليد محمود عبدالسميع', role: 'معلمة اتصالات', dept: 'dept-2', spec: 'spec-3', gender: 'أنثى', contract: 'قطاع خاص محدد المدة' },
    { name: 'محمد يحى محمد عز', role: 'معلم شبكات', dept: 'dept-2', spec: 'spec-2', gender: 'ذكر', contract: 'قطاع خاص محدد المدة' },
    { name: 'ريم عادل عبد الغنى', role: 'معلمة شبكات', dept: 'dept-2', spec: 'spec-2', gender: 'أنثى', contract: 'قطاع خاص محدد المدة' },
    { name: 'فاطمة على أحمد صادق', role: 'معلمة برمجة', dept: 'dept-2', spec: 'spec-1', gender: 'أنثى', contract: 'قطاع خاص محدد المدة' },
    { name: 'اية جمال محمد حسن سنارة', role: 'معلمة ذكاء اصطناعي (AI)', dept: 'dept-2', spec: 'spec-5', gender: 'أنثى', contract: 'قطاع خاص محدد المدة' },
    { name: 'سارة أحمد سيد محمود', role: 'معلمة ذكاء اصطناعي (AI)', dept: 'dept-2', spec: 'spec-5', gender: 'أنثى', contract: 'قطاع خاص محدد المدة' },
    { name: 'مرام محمد حسن رياض', role: 'معلمة لغة انجليزية', dept: 'dept-1', spec: undefined, gender: 'أنثى', contract: 'حكومي دائم' },
    { name: 'محمد ابراهيم الدسوقى عطية حسين', role: 'معلم فيزياء', dept: 'dept-1', spec: undefined, gender: 'ذكر', contract: 'حكومي دائم' },
    { name: 'جوزفين موسى فرج الله موسى', role: 'ميسر توجيه وارشاد', dept: 'dept-13', spec: undefined, gender: 'أنثى', contract: 'قطاع خاص محدد المدة' },
    { name: 'داليا محمود سلامة ابراهيم', role: 'ميسر ريادة أعمال', dept: 'dept-12', spec: undefined, gender: 'أنثى', contract: 'قطاع خاص محدد المدة' },
  ];

  const employees: Employee[] = rawList.map((item, idx) => {
    const num = (idx + 1).toString().padStart(3, '0');
    const empId = `EMP-2024-${num}`;
    // Construct valid 14-digit Egyptian National ID format (Century 2 or 3, Year, Month, Day, Governorate 24 = Minya, Serial, Gender digit, Check digit)
    const birthYear = 1985 + (idx % 12);
    const yrStr = (birthYear % 100).toString().padStart(2, '0');
    const monthStr = ((idx % 12) + 1).toString().padStart(2, '0');
    const dayStr = ((idx % 25) + 1).toString().padStart(2, '0');
    const genderDigit = item.gender === 'ذكر' ? '1' : '2';
    const nid = `2${yrStr}${monthStr}${dayStr}24${(100 + idx).toString().slice(0, 2)}${genderDigit}8`;

    return {
      id: empId,
      fullName: item.name,
      nationalId: nid,
      birthDate: `${birthYear}-${monthStr}-${dayStr}`,
      govCode: item.contract === 'حكومي دائم' ? `GOV-${70000 + idx}` : undefined,
      gender: item.gender as 'ذكر' | 'أنثى',
      phone: `010${(10000000 + idx * 83719).toString().substring(0, 8)}`,
      email: `${empId.toLowerCase()}@we-minya.edu.eg`,
      address: 'محافظة المنيا - المنيا الجديدة',
      departmentId: item.dept,
      specializationId: item.spec,
      jobTitle: item.role,
      contractType: item.contract,
      hiringEntity: item.contract === 'حكومي دائم' ? 'وزارة التربية والتعليم والتعليم الفني' : 'الشركة المصرية للاتصالات WE',
      hireDate: '2022-09-01',
      schoolStartDate: '2022-09-15',
      jobGrade: item.contract === 'حكومي دائم' ? 'الدرجة الأولى' : 'الدرجة الثانية',
      directSupervisor: 'المدير الأكاديمي',
      employmentStatus: 'على رأس العمل',
      adminNotes: 'تم تسجيل الاسم والصفة - بانتظار استكمال باقي البيانات والمستندات من قبل الإدارة',
      isArchived: false,
      createdAt: '2024-09-01',
      updatedAt: '2024-09-01',
    };
  });

  const qualifications: Qualification[] = [
    { id: 'q-1', employeeId: 'EMP-2024-001', degree: 'ماجستير في الإدارة التربوية', major: 'القيادة التعليمية', institution: 'جامعة المنيا', graduationYear: 2010, grade: 'امتياز' },
    { id: 'q-2', employeeId: 'EMP-2024-018', degree: 'بكالوريوس حاسبات ومعلومات', major: 'علوم الحاسب والبرمجة', institution: 'جامعة المنيا', graduationYear: 2016, grade: 'جيد جداً' },
    { id: 'q-3', employeeId: 'EMP-2024-031', degree: 'بكالوريوس هندسة شبكات واتصالات', major: 'شبكات الحاسب', institution: 'جامعة أسيوط', graduationYear: 2018, grade: 'امتياز' },
    { id: 'q-4', employeeId: 'EMP-2024-043', degree: 'بكالوريوس ذكاء اصطناعي وعلوم بيانات', major: 'التعلم الآلي', institution: 'جامعة القاهرة', graduationYear: 2021, grade: 'امتياز' },
    { id: 'q-5', employeeId: 'EMP-2024-048', degree: 'بكالوريوس تجارة وإدارة أعمال', major: 'ريادة الأعمال والمشروعات الصغيرة', institution: 'جامعة حلوان', graduationYear: 2017, grade: 'جيد جداً' },
    { id: 'q-6', employeeId: 'EMP-2024-047', degree: 'بكالوريوس تربية وعلم نفس', major: 'إرشاد وتوجيه تربوي', institution: 'جامعة المنيا', graduationYear: 2015, grade: 'امتياز' },
  ];

  const trainings: TrainingCourse[] = [
    { id: 't-1', employeeId: 'EMP-2024-018', courseName: 'Full-Stack Development React & Node', organizer: 'معهد ITI بالتعاون مع WE', completionDate: '2023-05-15', hours: 120, certificateNo: 'ITI-WE-2023-901' },
    { id: 't-2', employeeId: 'EMP-2024-031', courseName: 'Cisco Certified Network Associate (CCNA)', organizer: 'أكاديمية سيسكو الدولية', completionDate: '2022-10-10', hours: 90, certificateNo: 'CSCO-2022-441' },
    { id: 't-3', employeeId: 'EMP-2024-048', courseName: 'منهجية تدريب وتيسير ريادة الأعمال للتعليم التكنولوجي', organizer: 'مشروع قوى عاملة مصر بالتعاون مع WE', completionDate: '2023-08-20', hours: 60, certificateNo: 'ENTR-WE-2023-11' },
    { id: 't-4', employeeId: 'EMP-2024-047', courseName: 'برنامج الإرشاد والتوجيه المهني والتتبّع لطلاب التكنولوجيا التطبيقية', organizer: 'وزارة التربية والتعليم بالتعاون مع المصرية للاتصالات', completionDate: '2023-09-05', hours: 45, certificateNo: 'GUIDE-ATS-882' },
  ];

  const documents: EmployeeDocument[] = [
    {
      id: 'doc-1',
      employeeId: 'EMP-2024-001',
      name: 'صورة بطاقة الرقم القومي',
      docType: 'صورة بطاقة الرقم القومي',
      fileName: 'nid_principal.pdf',
      fileType: 'application/pdf',
      uploadDate: '2024-09-01',
      verificationStatus: 'معتمد',
    },
    {
      id: 'doc-2',
      employeeId: 'EMP-2024-001',
      name: 'قرار التكليف بالإدارة',
      docType: 'قرار التعيين أو عقد العمل',
      fileName: 'appointment_decision.pdf',
      fileType: 'application/pdf',
      uploadDate: '2024-09-01',
      verificationStatus: 'معتمد',
    },
    {
      id: 'doc-3',
      employeeId: 'EMP-2024-003',
      name: 'صورة بطاقة الرقم القومي',
      docType: 'صورة بطاقة الرقم القومي',
      fileName: 'omar_nid.pdf',
      fileType: 'application/pdf',
      uploadDate: '2024-09-01',
      verificationStatus: 'معتمد',
    },
    {
      id: 'doc-4',
      employeeId: 'EMP-2024-048',
      name: 'المؤهل الدراسي الأساسي',
      docType: 'المؤهل الدراسي الأساسي',
      fileName: 'dalia_degree.pdf',
      fileType: 'application/pdf',
      uploadDate: '2024-09-02',
      verificationStatus: 'معتمد',
    },
    {
      id: 'doc-5',
      employeeId: 'EMP-2024-047',
      name: 'المؤهل الدراسي الأساسي',
      docType: 'المؤهل الدراسي الأساسي',
      fileName: 'josephine_degree.pdf',
      fileType: 'application/pdf',
      uploadDate: '2024-09-02',
      verificationStatus: 'معتمد',
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'log-1',
      timestamp: '2024-09-01T08:00:00.000Z',
      userId: 'usr-1',
      userName: 'م. طارق العشماوي (مدير النظام)',
      role: 'admin',
      action: 'تهيئة وتحديث الهيكل الإداري',
      targetType: 'system',
      details: 'تم تسجيل كافة الكوادر وهيئة التدريس (48 موظفاً ومعلماً) وإضافة قسم ميسر ريادة أعمال وقسم ميسر ارشاد وتوجيه بمدرسة وي بالمنيا',
    },
  ];

  const schoolInfo: SchoolInfo = {
    name: 'مدرسة وي للتكنولوجيا التطبيقية بالمنيا',
    enName: 'WE Applied Technology Secondary School – Minya',
    affiliation: 'وزارة التربية والتعليم والتعليم الفني بالتعاون مع الشركة المصرية للاتصالات WE',
    address: 'محافظة المنيا - المنيا الجديدة - جمهورية مصر العربية',
    phone: '086-2345678',
    email: 'hr@minya.we-ats.edu.eg',
    academicYear: '2024 / 2025',
    principalName: 'أ. محمد أبوالعيون محمود خالد (المدير الأكاديمي)',
    hrLeadName: 'أ. عمر عيد سيد صابر (شئون العاملين)',
  };

  return {
    schoolInfo,
    departments: depts,
    specializations: specs,
    requiredDocuments: reqDocs,
    employees,
    qualifications,
    trainings,
    documents,
    users,
    auditLogs,
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // If it already has 48 employees and both new departments, use it
        if (
          parsed &&
          parsed.employees &&
          parsed.employees.length >= 40 &&
          parsed.departments.some((d: any) => d.name === 'ميسر ريادة أعمال')
        ) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error loading database, resetting to initial seed:', err);
    }

    const initial = getInitialSeedData();
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave?: DatabaseSchema): void {
    try {
      const data = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing database to disk:', err);
    }
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  public resetToSeed(): DatabaseSchema {
    const seed = getInitialSeedData();
    this.data = seed;
    this.saveData(seed);
    return this.data;
  }

  public clearDemoData(): void {
    this.data.employees = [];
    this.data.qualifications = [];
    this.data.trainings = [];
    this.data.documents = [];
    this.data.auditLogs.push({
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: 'usr-1',
      userName: 'مدير النظام',
      role: 'admin',
      action: 'تفريغ البيانات التجريبية',
      targetType: 'system',
      details: 'تم تفريغ السجلات استعداداً للإدخال اليدوي الكامل من قبل المدرسة',
    });
    this.saveData();
  }

  public restoreFromSnapshot(snapshot: DatabaseSchema): boolean {
    if (!snapshot || !Array.isArray(snapshot.employees) || !Array.isArray(snapshot.departments)) {
      return false;
    }
    this.data = snapshot;
    this.saveData();
    return true;
  }

  public addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const log: AuditLog = {
      ...entry,
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 2000) {
      this.data.auditLogs.pop();
    }
    this.saveData();
  }

  public generateNextEmployeeId(): string {
    const year = new Date().getFullYear();
    const prefix = `EMP-${year}-`;
    let maxNum = 0;
    for (const emp of this.data.employees) {
      if (emp.id.startsWith(prefix)) {
        const numPart = parseInt(emp.id.replace(prefix, ''), 10);
        if (!isNaN(numPart) && numPart > maxNum) {
          maxNum = numPart;
        }
      }
    }
    const nextNum = (maxNum + 1).toString().padStart(3, '0');
    return `${prefix}${nextNum}`;
  }

  public checkEmployeeDocuments(employeeId: string) {
    const emp = this.data.employees.find((e) => e.id === employeeId);
    if (!emp) return null;

    const empDocs = this.data.documents.filter((d) => d.employeeId === employeeId);
    const relevantReqs = this.data.requiredDocuments.filter(
      (r) => r.departmentId === 'all' || r.departmentId === emp.departmentId
    );

    const missingList: string[] = [];
    const pendingList: string[] = [];
    const verifiedList: string[] = [];

    for (const req of relevantReqs) {
      const match = empDocs.find(
        (d) =>
          d.docType.trim().toLowerCase() === req.name.trim().toLowerCase() ||
          d.name.trim().toLowerCase().includes(req.name.trim().toLowerCase())
      );

      if (!match) {
        if (req.isMandatory) {
          missingList.push(req.name);
        }
      } else {
        if (match.verificationStatus === 'معتمد') {
          verifiedList.push(req.name);
        } else if (match.verificationStatus === 'قيد المراجعة') {
          pendingList.push(req.name);
        } else {
          missingList.push(req.name + ' (مرفوض - يلزم إعادة رفعه)');
        }
      }
    }

    const totalReq = relevantReqs.length;
    const completedCount = totalReq - missingList.length;
    const completionRate = totalReq > 0 ? Math.round((completedCount / totalReq) * 100) : 100;

    let fileStatus: 'مكتمل' | 'غير مكتمل' | 'يحتاج إلى مراجعة' = 'مكتمل';
    if (missingList.length > 0) {
      fileStatus = 'غير مكتمل';
    } else if (pendingList.length > 0) {
      fileStatus = 'يحتاج إلى مراجعة';
    }

    return {
      employeeId,
      fullName: emp.fullName,
      departmentId: emp.departmentId,
      specializationId: emp.specializationId,
      totalRequired: totalReq,
      completedCount,
      completionRate,
      missingList,
      pendingList,
      fileStatus,
    };
  }

  public getEmployees(filters?: {
    search?: string;
    departmentId?: string;
    specializationId?: string;
    employmentStatus?: string;
    contractType?: string;
    fileStatus?: string;
    includeArchived?: boolean;
  }) {
    let result = this.data.employees;

    if (!filters?.includeArchived) {
      result = result.filter((e) => !e.isArchived);
    }

    if (filters?.departmentId && filters.departmentId !== 'all') {
      result = result.filter((e) => e.departmentId === filters.departmentId);
    }

    if (filters?.specializationId && filters.specializationId !== 'all') {
      result = result.filter((e) => e.specializationId === filters.specializationId);
    }

    if (filters?.employmentStatus && filters.employmentStatus !== 'all') {
      result = result.filter((e) => e.employmentStatus === filters.employmentStatus);
    }

    if (filters?.contractType && filters.contractType !== 'all') {
      result = result.filter((e) => e.contractType === filters.contractType);
    }

    if (filters?.search) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(
        (e) =>
          e.fullName.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q) ||
          e.nationalId.includes(q) ||
          (e.govCode && e.govCode.toLowerCase().includes(q)) ||
          e.phone.includes(q) ||
          e.jobTitle.toLowerCase().includes(q)
      );
    }

    const enhanced = result.map((emp) => {
      const docCheck = this.checkEmployeeDocuments(emp.id);
      const dept = this.data.departments.find((d) => d.id === emp.departmentId);
      const spec = this.data.specializations.find((s) => s.id === emp.specializationId);

      return {
        ...emp,
        departmentName: dept?.name || 'غير محدد',
        specializationName: spec?.name || '',
        completionRate: docCheck?.completionRate || 0,
        missingDocsCount: docCheck?.missingList.length || 0,
        fileStatus: docCheck?.fileStatus || 'غير مكتمل',
        missingDocs: docCheck?.missingList || [],
      };
    });

    if (filters?.fileStatus && filters.fileStatus !== 'all') {
      return enhanced.filter((e) => e.fileStatus === filters.fileStatus);
    }

    return enhanced;
  }

  public getEmployeeById(id: string) {
    const emp = this.data.employees.find((e) => e.id === id);
    if (!emp) return null;

    const docCheck = this.checkEmployeeDocuments(id);
    const dept = this.data.departments.find((d) => d.id === emp.departmentId);
    const spec = this.data.specializations.find((s) => s.id === emp.specializationId);
    const qualifications = this.data.qualifications.filter((q) => q.employeeId === id);
    const trainings = this.data.trainings.filter((t) => t.employeeId === id);
    const documents = this.data.documents.filter((d) => d.employeeId === id);
    const history = this.data.auditLogs.filter((l) => l.targetId === id);

    return {
      ...emp,
      departmentName: dept?.name || 'غير محدد',
      specializationName: spec?.name || '',
      completionRate: docCheck?.completionRate || 0,
      missingDocsCount: docCheck?.missingList.length || 0,
      fileStatus: docCheck?.fileStatus || 'غير مكتمل',
      missingDocs: docCheck?.missingList || [],
      pendingDocs: docCheck?.pendingList || [],
      qualifications,
      trainings,
      documents,
      history,
    };
  }

  public addEmployee(
    empData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>,
    qualificationsList: Omit<Qualification, 'id' | 'employeeId'>[] = [],
    trainingsList: Omit<TrainingCourse, 'id' | 'employeeId'>[] = [],
    actor: { id: string; name: string; role: string }
  ): Employee {
    const existingNid = this.data.employees.find((e) => e.nationalId === empData.nationalId);
    if (existingNid) {
      throw new Error(`الرقم القومي (${empData.nationalId}) مسجل بالفعل باسم الموظف: ${existingNid.fullName}`);
    }

    const newId = this.generateNextEmployeeId();
    const now = new Date().toISOString().split('T')[0];

    const newEmp: Employee = {
      ...empData,
      id: newId,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };

    this.data.employees.push(newEmp);

    qualificationsList.forEach((q, idx) => {
      this.data.qualifications.push({
        ...q,
        id: `q-${newId}-${idx + 1}`,
        employeeId: newId,
      });
    });

    trainingsList.forEach((t, idx) => {
      this.data.trainings.push({
        ...t,
        id: `t-${newId}-${idx + 1}`,
        employeeId: newId,
      });
    });

    this.addAuditLog({
      userId: actor.id,
      userName: actor.name,
      role: actor.role,
      action: 'إضافة موظف جديد',
      targetType: 'employee',
      targetId: newId,
      details: `تم تسجيل الموظف (${newEmp.fullName}) برقم وظيفي ${newId} في قسم ${
        this.data.departments.find((d) => d.id === newEmp.departmentId)?.name || ''
      }`,
    });

    this.saveData();
    return newEmp;
  }

  public updateEmployee(
    id: string,
    updates: Partial<Employee>,
    actor: { id: string; name: string; role: string }
  ): Employee {
    const idx = this.data.employees.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('الموظف غير موجود');

    if (updates.nationalId) {
      const clash = this.data.employees.find((e) => e.nationalId === updates.nationalId && e.id !== id);
      if (clash) {
        throw new Error(`الرقم القومي مسجل بالفعل لموظف آخر (${clash.fullName})`);
      }
    }

    this.data.employees[idx] = {
      ...this.data.employees[idx],
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    this.addAuditLog({
      userId: actor.id,
      userName: actor.name,
      role: actor.role,
      action: 'تعديل بيانات موظف',
      targetType: 'employee',
      targetId: id,
      details: `تم تحديث البيانات الوظيفية أو الشخصية للموظف ${this.data.employees[idx].fullName}`,
    });

    this.saveData();
    return this.data.employees[idx];
  }

  public archiveEmployee(id: string, actor: { id: string; name: string; role: string }): boolean {
    const emp = this.data.employees.find((e) => e.id === id);
    if (!emp) return false;

    emp.isArchived = true;
    emp.employmentStatus = 'انتهت خدمته';
    emp.updatedAt = new Date().toISOString().split('T')[0];

    this.addAuditLog({
      userId: actor.id,
      userName: actor.name,
      role: actor.role,
      action: 'أرشفة ملف موظف',
      targetType: 'employee',
      targetId: id,
      details: `تم أرشفة السجل الوظيفي للموظف (${emp.fullName}) لحفظ السجل التاريخي`,
    });

    this.saveData();
    return true;
  }

  public restoreEmployee(id: string, actor: { id: string; name: string; role: string }): boolean {
    const emp = this.data.employees.find((e) => e.id === id);
    if (!emp) return false;

    emp.isArchived = false;
    emp.employmentStatus = 'على رأس العمل';
    emp.updatedAt = new Date().toISOString().split('T')[0];

    this.addAuditLog({
      userId: actor.id,
      userName: actor.name,
      role: actor.role,
      action: 'استعادة موظف من الأرشيف',
      targetType: 'employee',
      targetId: id,
      details: `تم إعادة تفعيل السجل الوظيفي للموظف (${emp.fullName})`,
    });

    this.saveData();
    return true;
  }

  public addDocument(doc: Omit<EmployeeDocument, 'id'>, actor: { id: string; name: string; role: string }) {
    const newDoc: EmployeeDocument = {
      ...doc,
      id: 'doc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
    };
    this.data.documents.push(newDoc);

    this.addAuditLog({
      userId: actor.id,
      userName: actor.name,
      role: actor.role,
      action: 'إضافة مستند رسمي',
      targetType: 'document',
      targetId: doc.employeeId,
      details: `تم رفع مستند (${newDoc.name}) نوع (${newDoc.docType}) لملف الموظف`,
    });

    this.saveData();
    return newDoc;
  }

  public verifyDocument(docId: string, status: 'معتمد' | 'مرفوض' | 'قيد المراجعة', actor: { id: string; name: string; role: string }) {
    const doc = this.data.documents.find((d) => d.id === docId);
    if (!doc) throw new Error('المستند غير موجود');

    doc.verificationStatus = status;

    this.addAuditLog({
      userId: actor.id,
      userName: actor.name,
      role: actor.role,
      action: 'اعتماد / تدقيق مستند',
      targetType: 'document',
      targetId: doc.employeeId,
      details: `تحديث حالة المستند (${doc.name}) إلى [${status}]`,
    });

    this.saveData();
    return doc;
  }

  public deleteDocument(docId: string, actor: { id: string; name: string; role: string }) {
    const idx = this.data.documents.findIndex((d) => d.id === docId);
    if (idx === -1) return false;

    const [deleted] = this.data.documents.splice(idx, 1);

    this.addAuditLog({
      userId: actor.id,
      userName: actor.name,
      role: actor.role,
      action: 'حذف مستند',
      targetType: 'document',
      targetId: deleted.employeeId,
      details: `تم حذف المستند (${deleted.name}) من ملف الموظف`,
    });

    this.saveData();
    return true;
  }

  public addQualification(q: Omit<Qualification, 'id'>) {
    const item = { ...q, id: 'q-' + Date.now() };
    this.data.qualifications.push(item);
    this.saveData();
    return item;
  }

  public addTraining(t: Omit<TrainingCourse, 'id'>) {
    const item = { ...t, id: 't-' + Date.now() };
    this.data.trainings.push(item);
    this.saveData();
    return item;
  }

  public addDepartment(deptName: string, description: string, actor: { id: string; name: string; role: string }) {
    const existing = this.data.departments.find((d) => d.name.trim() === deptName.trim());
    if (existing) {
      if (existing.status === 'archived') {
        existing.status = 'active';
        this.saveData();
        return existing;
      }
      throw new Error('القسم موجود بالفعل');
    }

    const newDept: Department = {
      id: 'dept-' + (this.data.departments.length + 1) + '-' + Date.now().toString(36),
      name: deptName.trim(),
      isSystem: false,
      status: 'active',
      description,
      createdAt: new Date().toISOString().split('T')[0],
    };

    this.data.departments.push(newDept);

    this.addAuditLog({
      userId: actor.id,
      userName: actor.name,
      role: actor.role,
      action: 'إضافة قسم جديد',
      targetType: 'department',
      targetId: newDept.id,
      details: `تم إنشاء قسم جديد في الهيكل الإداري: (${newDept.name})`,
    });

    this.saveData();
    return newDept;
  }

  public updateDepartment(id: string, name: string, description: string, actor: { id: string; name: string; role: string }) {
    const dept = this.data.departments.find((d) => d.id === id);
    if (!dept) throw new Error('القسم غير موجود');

    dept.name = name.trim();
    if (description !== undefined) dept.description = description;

    this.addAuditLog({
      userId: actor.id,
      userName: actor.name,
      role: actor.role,
      action: 'تعديل قسم',
      targetType: 'department',
      targetId: id,
      details: `تم تعديل مسمى القسم إلى (${dept.name})`,
    });

    this.saveData();
    return dept;
  }

  public deleteOrArchiveDepartment(id: string, actor: { id: string; name: string; role: string }) {
    const dept = this.data.departments.find((d) => d.id === id);
    if (!dept) throw new Error('القسم غير موجود');

    const count = this.data.employees.filter((e) => e.departmentId === id).length;
    if (count > 0) {
      dept.status = 'archived';
      this.addAuditLog({
        userId: actor.id,
        userName: actor.name,
        role: actor.role,
        action: 'أرشفة قسم',
        targetType: 'department',
        targetId: id,
        details: `تم أرشفة قسم (${dept.name}) لوجود عدد (${count}) موظف مسجل به حفاظاً على السجلات`,
      });
      this.saveData();
      return { action: 'archived', count };
    }

    if (dept.isSystem) {
      dept.status = 'archived';
      this.saveData();
      return { action: 'archived', count: 0 };
    }

    const idx = this.data.departments.findIndex((d) => d.id === id);
    this.data.departments.splice(idx, 1);

    this.addAuditLog({
      userId: actor.id,
      userName: actor.name,
      role: actor.role,
      action: 'حذف قسم',
      targetType: 'department',
      targetId: id,
      details: `تم حذف القسم الخالي (${dept.name}) نهائياً`,
    });

    this.saveData();
    return { action: 'deleted', count: 0 };
  }

  public addSpecialization(deptId: string, specName: string, actor: { id: string; name: string; role: string }) {
    const newSpec: Specialization = {
      id: 'spec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      departmentId: deptId,
      name: specName.trim(),
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    this.data.specializations.push(newSpec);

    this.addAuditLog({
      userId: actor.id,
      userName: actor.name,
      role: actor.role,
      action: 'إضافة تخصص جديد',
      targetType: 'system',
      details: `تم إضافة التخصص أو البرنامج (${newSpec.name}) لقسم ${
        this.data.departments.find((d) => d.id === deptId)?.name
      }`,
    });

    this.saveData();
    return newSpec;
  }

  public getDashboardStats() {
    const emps = this.data.employees.filter((e) => !e.isArchived);

    const govtTeachers = emps.filter((e) => e.departmentId === 'dept-1').length;
    const privateTeachers = emps.filter((e) => e.departmentId === 'dept-2').length;
    const admins = emps.filter((e) => e.departmentId === 'dept-3').length;
    const directors = emps.filter((e) => e.departmentId === 'dept-4').length;
    const hrStaff = emps.filter((e) => e.departmentId === 'dept-5').length;
    const studentAffairs = emps.filter((e) => e.departmentId === 'dept-6').length;
    const socialWorkers = emps.filter((e) => e.departmentId === 'dept-7').length;
    const psychologists = emps.filter((e) => e.departmentId === 'dept-8').length;
    const qualityOfficers = emps.filter((e) => e.departmentId === 'dept-9').length;
    const examOfficers = emps.filter((e) => e.departmentId === 'dept-10').length;
    const supplyOfficers = emps.filter((e) => e.departmentId === 'dept-11').length;
    const entrepreneurshipFacilitators = emps.filter((e) => e.departmentId === 'dept-12').length;
    const guidanceFacilitators = emps.filter((e) => e.departmentId === 'dept-13').length;

    const otherDeptsCount = emps.filter(
      (e) => !['dept-1', 'dept-2', 'dept-3', 'dept-4'].includes(e.departmentId)
    ).length;

    const privateSpecializations = this.data.specializations
      .filter((s) => s.departmentId === 'dept-2' && s.status === 'active')
      .map((s) => ({
        id: s.id,
        name: s.name,
        count: emps.filter((e) => e.departmentId === 'dept-2' && e.specializationId === s.id).length,
      }));

    let completedFiles = 0;
    let incompleteFiles = 0;
    let totalMissingDocs = 0;

    const incompleteAlerts: Array<{
      employeeId: string;
      fullName: string;
      departmentName: string;
      missingCount: number;
      missingList: string[];
      fileStatus: string;
    }> = [];

    emps.forEach((emp) => {
      const check = this.checkEmployeeDocuments(emp.id);
      if (check) {
        if (check.fileStatus === 'مكتمل') {
          completedFiles++;
        } else {
          incompleteFiles++;
          totalMissingDocs += check.missingList.length;
          incompleteAlerts.push({
            employeeId: emp.id,
            fullName: emp.fullName,
            departmentName: this.data.departments.find((d) => d.id === emp.departmentId)?.name || '',
            missingCount: check.missingList.length,
            missingList: check.missingList,
            fileStatus: check.fileStatus,
          });
        }
      }
    });

    const departmentDistribution = this.data.departments
      .filter((d) => d.status === 'active')
      .map((d) => {
        const count = emps.filter((e) => e.departmentId === d.id).length;
        return {
          id: d.id,
          name: d.name,
          count,
          percentage: emps.length > 0 ? Math.round((count / emps.length) * 100) : 0,
        };
      });

    const recentEmployees = [...emps]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8)
      .map((e) => ({
        id: e.id,
        fullName: e.fullName,
        jobTitle: e.jobTitle,
        departmentName: this.data.departments.find((d) => d.id === e.departmentId)?.name || '',
        createdAt: e.createdAt,
        status: e.employmentStatus,
      }));

    return {
      totalEmployees: emps.length,
      govtTeachers,
      privateTeachers,
      admins,
      directors,
      hrStaff,
      studentAffairs,
      socialWorkers,
      psychologists,
      qualityOfficers,
      examOfficers,
      supplyOfficers,
      entrepreneurshipFacilitators,
      guidanceFacilitators,
      otherDeptsCount,
      completedFiles,
      incompleteFiles,
      totalMissingDocs,
      privateSpecializations,
      departmentDistribution,
      incompleteAlerts: incompleteAlerts.slice(0, 8),
      recentEmployees,
    };
  }
}

export const db = new Database();
