export interface Department {
  id: string;
  name: string;
  isSystem: boolean;
  status: 'active' | 'archived';
  description?: string;
  employeeCount?: number;
  createdAt: string;
}

export interface Specialization {
  id: string;
  departmentId: string;
  name: string;
  status: 'active' | 'archived';
  employeeCount?: number;
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
  id?: string;
  employeeId?: string;
  degree: string;
  major: string;
  institution: string;
  graduationYear: number;
  grade?: string;
}

export interface TrainingCourse {
  id?: string;
  employeeId?: string;
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
  departmentName?: string;
  specializationId?: string;
  specializationName?: string;
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

  // Completion metrics
  completionRate?: number;
  missingDocsCount?: number;
  fileStatus?: 'مكتمل' | 'غير مكتمل' | 'يحتاج إلى مراجعة';
  missingDocs?: string[];
  pendingDocs?: string[];

  // Populated fields
  qualifications?: Qualification[];
  trainings?: TrainingCourse[];
  documents?: EmployeeDocument[];
  history?: AuditLog[];
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
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

export interface DashboardStats {
  totalEmployees: number;
  govtTeachers: number;
  privateTeachers: number;
  admins: number;
  directors: number;
  hrStaff: number;
  studentAffairs: number;
  socialWorkers: number;
  psychologists: number;
  qualityOfficers: number;
  examOfficers: number;
  supplyOfficers: number;
  entrepreneurshipFacilitators?: number;
  guidanceFacilitators?: number;
  otherDeptsCount: number;
  completedFiles: number;
  incompleteFiles: number;
  totalMissingDocs: number;
  privateSpecializations: Array<{ id: string; name: string; count: number }>;
  departmentDistribution: Array<{ id: string; name: string; count: number; percentage: number }>;
  incompleteAlerts: Array<{
    employeeId: string;
    fullName: string;
    departmentName: string;
    missingCount: number;
    missingList: string[];
    fileStatus: string;
  }>;
  recentEmployees: Array<{
    id: string;
    fullName: string;
    jobTitle: string;
    departmentName: string;
    createdAt: string;
    status: string;
  }>;
}
