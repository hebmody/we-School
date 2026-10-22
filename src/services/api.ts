import {
  DashboardStats,
  Department,
  Employee,
  EmployeeDocument,
  Qualification,
  RequiredDocument,
  SchoolInfo,
  Specialization,
  TrainingCourse,
  UserAccount,
  AuditLog,
} from '../types';

let authToken = localStorage.getItem('we_minya_auth_token') || '';

export function setToken(token: string) {
  authToken = token;
  localStorage.setItem('we_minya_auth_token', token);
}

export function clearToken() {
  authToken = '';
  localStorage.removeItem('we_minya_auth_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'حدث خطأ في الاتصال بالخادم');
  }

  return data;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: UserAccount; token: string }> {
    const res = await request<{ success: boolean; token: string; user: UserAccount }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(res.token);
    return { user: res.user, token: res.token };
  },

  async getCurrentUser(): Promise<UserAccount> {
    const res = await request<{ success: boolean; user: UserAccount }>('/api/auth/me');
    return res.user;
  },

  async switchRole(role: string): Promise<UserAccount> {
    const res = await request<{ success: boolean; token: string; user: UserAccount }>('/api/auth/switch-demo-role', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    setToken(res.token);
    return res.user;
  },

  // Dashboard
  async getDashboardStats(): Promise<{ stats: DashboardStats; schoolInfo: SchoolInfo }> {
    return request<{ success: boolean; stats: DashboardStats; schoolInfo: SchoolInfo }>('/api/dashboard/stats');
  },

  // Employees
  async getEmployees(params: {
    search?: string;
    departmentId?: string;
    specializationId?: string;
    employmentStatus?: string;
    contractType?: string;
    fileStatus?: string;
    includeArchived?: boolean;
  } = {}): Promise<Employee[]> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.departmentId) query.set('departmentId', params.departmentId);
    if (params.specializationId) query.set('specializationId', params.specializationId);
    if (params.employmentStatus) query.set('employmentStatus', params.employmentStatus);
    if (params.contractType) query.set('contractType', params.contractType);
    if (params.fileStatus) query.set('fileStatus', params.fileStatus);
    if (params.includeArchived) query.set('includeArchived', 'true');

    const res = await request<{ success: boolean; employees: Employee[] }>(`/api/employees?${query.toString()}`);
    return res.employees;
  },

  async getEmployeeById(id: string): Promise<Employee> {
    const res = await request<{ success: boolean; employee: Employee }>(`/api/employees/${id}`);
    return res.employee;
  },

  async createEmployee(payload: {
    employeeData: Partial<Employee>;
    qualifications?: Qualification[];
    trainings?: TrainingCourse[];
  }): Promise<Employee> {
    const res = await request<{ success: boolean; employee: Employee }>('/api/employees', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.employee;
  },

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    const res = await request<{ success: boolean; employee: Employee }>(`/api/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return res.employee;
  },

  async archiveEmployee(id: string): Promise<void> {
    await request(`/api/employees/${id}/archive`, { method: 'POST' });
  },

  async restoreEmployee(id: string): Promise<void> {
    await request(`/api/employees/${id}/restore`, { method: 'POST' });
  },

  // Documents
  async uploadDocument(
    employeeId: string,
    docData: {
      name: string;
      docType: string;
      fileName: string;
      fileType: string;
      fileData?: string;
      expiryDate?: string;
      verificationStatus?: 'معتمد' | 'قيد المراجعة';
      notes?: string;
    }
  ): Promise<EmployeeDocument> {
    const res = await request<{ success: boolean; document: EmployeeDocument }>(
      `/api/employees/${employeeId}/documents`,
      {
        method: 'POST',
        body: JSON.stringify(docData),
      }
    );
    return res.document;
  },

  async verifyDocument(docId: string, status: 'معتمد' | 'مرفوض' | 'قيد المراجعة'): Promise<EmployeeDocument> {
    const res = await request<{ success: boolean; document: EmployeeDocument }>(`/api/documents/${docId}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return res.document;
  },

  async deleteDocument(docId: string): Promise<void> {
    await request(`/api/documents/${docId}`, { method: 'DELETE' });
  },

  // Qualifications and Trainings
  async addQualification(employeeId: string, qual: Qualification): Promise<Qualification> {
    const res = await request<{ success: boolean; qualification: Qualification }>(
      `/api/employees/${employeeId}/qualifications`,
      {
        method: 'POST',
        body: JSON.stringify(qual),
      }
    );
    return res.qualification;
  },

  async addTraining(employeeId: string, training: TrainingCourse): Promise<TrainingCourse> {
    const res = await request<{ success: boolean; training: TrainingCourse }>(
      `/api/employees/${employeeId}/trainings`,
      {
        method: 'POST',
        body: JSON.stringify(training),
      }
    );
    return res.training;
  },

  // Departments & Specializations
  async getDepartments(): Promise<Department[]> {
    const res = await request<{ success: boolean; departments: Department[] }>('/api/departments');
    return res.departments;
  },

  async createDepartment(name: string, description: string = ''): Promise<Department> {
    const res = await request<{ success: boolean; department: Department }>('/api/departments', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
    return res.department;
  },

  async updateDepartment(id: string, name: string, description: string = ''): Promise<Department> {
    const res = await request<{ success: boolean; department: Department }>(`/api/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description }),
    });
    return res.department;
  },

  async deleteDepartment(id: string): Promise<{ action: string; message: string }> {
    return request<{ success: boolean; action: string; message: string }>(`/api/departments/${id}`, {
      method: 'DELETE',
    });
  },

  async getSpecializations(departmentId?: string): Promise<Specialization[]> {
    const query = departmentId ? `?departmentId=${departmentId}` : '';
    const res = await request<{ success: boolean; specializations: Specialization[] }>(`/api/specializations${query}`);
    return res.specializations;
  },

  async createSpecialization(departmentId: string, name: string): Promise<Specialization> {
    const res = await request<{ success: boolean; specialization: Specialization }>('/api/specializations', {
      method: 'POST',
      body: JSON.stringify({ departmentId, name }),
    });
    return res.specialization;
  },

  // Required Documents
  async getRequiredDocuments(): Promise<RequiredDocument[]> {
    const res = await request<{ success: boolean; requiredDocuments: RequiredDocument[] }>(
      '/api/required-documents'
    );
    return res.requiredDocuments;
  },

  async createRequiredDocument(data: {
    departmentId: string;
    name: string;
    isMandatory: boolean;
    description?: string;
  }): Promise<RequiredDocument> {
    const res = await request<{ success: boolean; requiredDocument: RequiredDocument }>(
      '/api/required-documents',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return res.requiredDocument;
  },

  // Missing Documents Alert
  async getMissingDocumentsAlerts(): Promise<any[]> {
    const res = await request<{ success: boolean; incompleteFiles: any[] }>(
      '/api/monitoring/missing-documents'
    );
    return res.incompleteFiles;
  },

  // Users & Permissions
  async getUsers(): Promise<UserAccount[]> {
    const res = await request<{ success: boolean; users: UserAccount[] }>('/api/users');
    return res.users;
  },

  async createUser(data: Partial<UserAccount> & { password?: string }): Promise<UserAccount> {
    const res = await request<{ success: boolean; user: UserAccount }>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.user;
  },

  async updateUser(id: string, data: Partial<UserAccount> & { password?: string }): Promise<UserAccount> {
    const res = await request<{ success: boolean; user: UserAccount }>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.user;
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await request<{ success: boolean; auditLogs: AuditLog[] }>('/api/audit-logs');
    return res.auditLogs;
  },

  // Database Tools
  async resetDemoDatabase(): Promise<string> {
    const res = await request<{ success: boolean; message: string }>('/api/database/reset-demo', {
      method: 'POST',
    });
    return res.message;
  },

  async clearDemoData(): Promise<string> {
    const res = await request<{ success: boolean; message: string }>('/api/database/clear-demo', {
      method: 'POST',
    });
    return res.message;
  },

  async restoreDatabase(snapshot: any): Promise<string> {
    const res = await request<{ success: boolean; message: string }>('/api/database/restore', {
      method: 'POST',
      body: JSON.stringify(snapshot),
    });
    return res.message;
  },

  async bulkImportEmployees(rows: any[]): Promise<{ importedCount: number; errors: string[]; message: string }> {
    return request<{ success: boolean; importedCount: number; errors: string[]; message: string }>(
      '/api/employees/bulk-import',
      {
        method: 'POST',
        body: JSON.stringify({ rows }),
      }
    );
  },

  async updateSchoolInfo(info: Partial<SchoolInfo>): Promise<SchoolInfo> {
    const res = await request<{ success: boolean; schoolInfo: SchoolInfo }>('/api/school-info', {
      method: 'PUT',
      body: JSON.stringify(info),
    });
    return res.schoolInfo;
  },
};
