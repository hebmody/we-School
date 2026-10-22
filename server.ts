import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Simple in-memory session/token store
const activeSessions = new Map<string, { userId: string; role: string; name: string }>();

// Auth Helper Middleware
function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const session = activeSessions.get(token);
    if (session) {
      (req as any).user = session;
      return next();
    }
  }

  // Fallback to default admin for ease of initial demo if not supplied
  const defaultAdmin = db.getData().users[0];
  (req as any).user = {
    userId: defaultAdmin.id,
    role: defaultAdmin.role,
    name: defaultAdmin.name,
  };
  next();
}

// ---------------- API ROUTES ---------------- //

// 1. Auth Endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const users = db.getData().users;
  const user = users.find((u) => u.email.trim().toLowerCase() === (email || '').trim().toLowerCase());

  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة، يرجى التأكد من البريد وكلمة المرور' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'هذا الحساب تم إيقافه من قبل الإدارة' });
  }

  const token = 'token-' + Date.now() + '-' + Math.random().toString(36).substring(2);
  activeSessions.set(token, { userId: user.id, role: user.role, name: user.name });

  user.lastLogin = new Date().toISOString();

  db.addAuditLog({
    userId: user.id,
    userName: user.name,
    role: user.role,
    action: 'تسجيل دخول للنظام',
    targetType: 'user',
    targetId: user.id,
    details: 'تسجيل دخول ناجح للمنظومة',
  });

  return res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
    },
  });
});

app.get('/api/auth/me', authenticateUser, (req, res) => {
  const current = (req as any).user;
  const user = db.getData().users.find((u) => u.id === current.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
  }
  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
    },
  });
});

// Quick role switch for school administrators / evaluators demo testing
app.post('/api/auth/switch-demo-role', (req, res) => {
  const { role } = req.body;
  const user = db.getData().users.find((u) => u.role === role);
  if (!user) {
    return res.status(404).json({ success: false, message: 'الدور غير موجود' });
  }
  const token = 'token-switch-' + Date.now();
  activeSessions.set(token, { userId: user.id, role: user.role, name: user.name });
  return res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
    },
  });
});

// 2. Dashboard Statistics
app.get('/api/dashboard/stats', authenticateUser, (_req, res) => {
  const stats = db.getDashboardStats();
  return res.json({ success: true, stats, schoolInfo: db.getData().schoolInfo });
});

// 3. Employees
app.get('/api/employees', authenticateUser, (req, res) => {
  const user = (req as any).user;
  const { search, departmentId, specializationId, employmentStatus, contractType, fileStatus, includeArchived } = req.query;

  let deptFilter = departmentId as string | undefined;
  // If user is department head, limit to their department unless specified
  if (user.role === 'dept_head') {
    const fullUser = db.getData().users.find((u) => u.id === user.userId);
    if (fullUser?.departmentId) {
      deptFilter = fullUser.departmentId;
    }
  }

  const employees = db.getEmployees({
    search: search as string,
    departmentId: deptFilter,
    specializationId: specializationId as string,
    employmentStatus: employmentStatus as string,
    contractType: contractType as string,
    fileStatus: fileStatus as string,
    includeArchived: includeArchived === 'true',
  });

  // Mask National ID if user is viewer or principal without explicit full security access
  const sanitized = employees.map((e) => {
    if (user.role === 'viewer') {
      return {
        ...e,
        nationalId: e.nationalId.substring(0, 4) + '******' + e.nationalId.substring(10),
      };
    }
    return e;
  });

  return res.json({ success: true, employees: sanitized });
});

app.get('/api/employees/:id', authenticateUser, (req, res) => {
  const emp = db.getEmployeeById(req.params.id);
  if (!emp) {
    return res.status(404).json({ success: false, message: 'سجل الموظف غير موجود' });
  }
  return res.json({ success: true, employee: emp });
});

app.post('/api/employees', authenticateUser, (req, res) => {
  const user = (req as any).user;
  if (!['admin', 'hr'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'عفواً، لا تملك صلاحية إضافة موظفين جدد. مقتصر على مسئولي شئون العاملين والإدارة' });
  }

  try {
    const { employeeData, qualifications, trainings } = req.body;
    if (!employeeData.fullName || !employeeData.nationalId || !employeeData.departmentId) {
      return res.status(400).json({ success: false, message: 'الاسم الرباعي والرقم القومي والقسم حقول إجبارية' });
    }

    if (!/^\d{14}$/.test(employeeData.nationalId.trim())) {
      return res.status(400).json({ success: false, message: 'الرقم القومي يجب أن يتكون من 14 رقماً دقيقاً' });
    }

    const newEmp = db.addEmployee(employeeData, qualifications || [], trainings || [], {
      id: user.userId,
      name: user.name,
      role: user.role,
    });

    return res.status(201).json({ success: true, employee: newEmp });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message || 'حدث خطأ أثناء حفظ سجل الموظف' });
  }
});

app.put('/api/employees/:id', authenticateUser, (req, res) => {
  const user = (req as any).user;
  if (!['admin', 'hr', 'dept_head'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'غير مصرح بتعديل السجلات' });
  }

  try {
    const updated = db.updateEmployee(req.params.id, req.body, {
      id: user.userId,
      name: user.name,
      role: user.role,
    });
    return res.json({ success: true, employee: updated });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message || 'خطأ أثناء التعديل' });
  }
});

app.post('/api/employees/:id/archive', authenticateUser, (req, res) => {
  const user = (req as any).user;
  if (!['admin', 'hr'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'غير مصرح بأرشفة سجلات العاملين' });
  }

  const success = db.archiveEmployee(req.params.id, {
    id: user.userId,
    name: user.name,
    role: user.role,
  });

  return res.json({ success, message: success ? 'تم أرشفة الموظف بنجاح' : 'تعذر أرشفة السجل' });
});

app.post('/api/employees/:id/restore', authenticateUser, (req, res) => {
  const user = (req as any).user;
  if (!['admin', 'hr'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'غير مصرح باستعادة السجلات' });
  }

  const success = db.restoreEmployee(req.params.id, {
    id: user.userId,
    name: user.name,
    role: user.role,
  });

  return res.json({ success, message: success ? 'تم استعادة الموظف للخدمة بنجاح' : 'تعذر استعادة السجل' });
});

// 4. Employee Documents Management
app.post('/api/employees/:id/documents', authenticateUser, (req, res) => {
  const user = (req as any).user;
  if (!['admin', 'hr'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'غير مصرح برفع المستندات' });
  }

  try {
    const doc = db.addDocument(
      {
        employeeId: req.params.id,
        name: req.body.name,
        docType: req.body.docType,
        fileName: req.body.fileName || 'document.pdf',
        fileType: req.body.fileType || 'application/pdf',
        fileData: req.body.fileData,
        uploadDate: new Date().toISOString().split('T')[0],
        expiryDate: req.body.expiryDate,
        verificationStatus: req.body.verificationStatus || 'معتمد',
        notes: req.body.notes,
      },
      { id: user.userId, name: user.name, role: user.role }
    );

    return res.status(201).json({ success: true, document: doc });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

app.put('/api/documents/:docId/verify', authenticateUser, (req, res) => {
  const user = (req as any).user;
  if (!['admin', 'hr'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'غير مصرح باعتماد المستندات' });
  }

  try {
    const updated = db.verifyDocument(req.params.docId, req.body.status, {
      id: user.userId,
      name: user.name,
      role: user.role,
    });
    return res.json({ success: true, document: updated });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

app.delete('/api/documents/:docId', authenticateUser, (req, res) => {
  const user = (req as any).user;
  if (!['admin', 'hr'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'غير مصرح بحذف المستندات' });
  }

  const ok = db.deleteDocument(req.params.docId, {
    id: user.userId,
    name: user.name,
    role: user.role,
  });
  return res.json({ success: ok, message: ok ? 'تم حذف المستند' : 'المستند غير موجود' });
});

// Qualifications & Trainings additions
app.post('/api/employees/:id/qualifications', authenticateUser, (req, res) => {
  const item = db.addQualification({
    employeeId: req.params.id,
    degree: req.body.degree,
    major: req.body.major,
    institution: req.body.institution,
    graduationYear: Number(req.body.graduationYear),
    grade: req.body.grade,
  });
  return res.json({ success: true, qualification: item });
});

app.post('/api/employees/:id/trainings', authenticateUser, (req, res) => {
  const item = db.addTraining({
    employeeId: req.params.id,
    courseName: req.body.courseName,
    organizer: req.body.organizer,
    completionDate: req.body.completionDate,
    hours: req.body.hours ? Number(req.body.hours) : undefined,
    certificateNo: req.body.certificateNo,
  });
  return res.json({ success: true, training: item });
});

// 5. Departments & Specializations
app.get('/api/departments', authenticateUser, (_req, res) => {
  const depts = db.getData().departments;
  const employees = db.getData().employees.filter((e) => !e.isArchived);

  const enriched = depts.map((d) => ({
    ...d,
    employeeCount: employees.filter((e) => e.departmentId === d.id).length,
  }));

  return res.json({ success: true, departments: enriched });
});

app.post('/api/departments', authenticateUser, (req, res) => {
  const user = (req as any).user;
  if (!['admin', 'hr'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'مقتصر على مدير النظام ومسئول شئون العاملين' });
  }

  try {
    const dept = db.addDepartment(req.body.name, req.body.description || '', {
      id: user.userId,
      name: user.name,
      role: user.role,
    });
    return res.status(201).json({ success: true, department: dept });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

app.put('/api/departments/:id', authenticateUser, (req, res) => {
  const user = (req as any).user;
  if (user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'مقتصر على مدير النظام' });
  }

  try {
    const updated = db.updateDepartment(req.params.id, req.body.name, req.body.description, {
      id: user.userId,
      name: user.name,
      role: user.role,
    });
    return res.json({ success: true, department: updated });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

app.delete('/api/departments/:id', authenticateUser, (req, res) => {
  const user = (req as any).user;
  if (user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'مقتصر على مدير النظام' });
  }

  try {
    const resData = db.deleteOrArchiveDepartment(req.params.id, {
      id: user.userId,
      name: user.name,
      role: user.role,
    });
    return res.json({
      success: true,
      action: resData.action,
      message:
        resData.action === 'archived'
          ? `تم أرشفة القسم لوجود عدد (${resData.count}) موظف مسجل به حفاظاً على السجلات التاريخية`
          : 'تم حذف القسم الخالي بنجاح',
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

app.get('/api/specializations', authenticateUser, (req, res) => {
  const { departmentId } = req.query;
  let specs = db.getData().specializations.filter((s) => s.status === 'active');
  if (departmentId && departmentId !== 'all') {
    specs = specs.filter((s) => s.departmentId === departmentId);
  }
  const emps = db.getData().employees.filter((e) => !e.isArchived);
  const enriched = specs.map((s) => ({
    ...s,
    employeeCount: emps.filter((e) => e.specializationId === s.id).length,
  }));
  return res.json({ success: true, specializations: enriched });
});

app.post('/api/specializations', authenticateUser, (req, res) => {
  const user = (req as any).user;
  if (!['admin', 'hr'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'مقتصر على مدير النظام ومسئول شئون العاملين' });
  }

  try {
    const spec = db.addSpecialization(req.body.departmentId, req.body.name, {
      id: user.userId,
      name: user.name,
      role: user.role,
    });
    return res.status(201).json({ success: true, specialization: spec });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// 6. Required Documents Configuration
app.get('/api/required-documents', authenticateUser, (_req, res) => {
  return res.json({ success: true, requiredDocuments: db.getData().requiredDocuments });
});

app.post('/api/required-documents', authenticateUser, (req, res) => {
  const user = (req as any).user;
  if (user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'مقتصر على مدير النظام' });
  }

  const newReq = {
    id: 'req-' + Date.now(),
    departmentId: req.body.departmentId || 'all',
    name: req.body.name.trim(),
    isMandatory: req.body.isMandatory !== false,
    description: req.body.description || '',
  };

  db.getData().requiredDocuments.push(newReq);
  db.addAuditLog({
    userId: user.userId,
    userName: user.name,
    role: user.role,
    action: 'إضافة مستند مطلوب للملفات',
    targetType: 'system',
    details: `تم إضافة مسوغ التعيين الإجباري (${newReq.name})`,
  });

  return res.json({ success: true, requiredDocument: newReq });
});

// 7. Missing Documents Alerts & Monitoring
app.get('/api/monitoring/missing-documents', authenticateUser, (_req, res) => {
  const emps = db.getData().employees.filter((e) => !e.isArchived);
  const depts = db.getData().departments;
  const specs = db.getData().specializations;

  const results = emps
    .map((e) => {
      const check = db.checkEmployeeDocuments(e.id);
      const dept = depts.find((d) => d.id === e.departmentId);
      const spec = specs.find((s) => s.id === e.specializationId);

      return {
        employeeId: e.id,
        fullName: e.fullName,
        nationalId: e.nationalId,
        phone: e.phone,
        departmentName: dept?.name || 'غير محدد',
        specializationName: spec?.name || '',
        jobTitle: e.jobTitle,
        totalRequired: check?.totalRequired || 0,
        completedCount: check?.completedCount || 0,
        completionRate: check?.completionRate || 0,
        missingList: check?.missingList || [],
        pendingList: check?.pendingList || [],
        fileStatus: check?.fileStatus || 'غير مكتمل',
      };
    })
    .filter((item) => item.fileStatus !== 'مكتمل');

  return res.json({ success: true, incompleteFiles: results });
});

// 8. User Management & Audit Logs
app.get('/api/users', authenticateUser, (req, res) => {
  const user = (req as any).user;
  if (user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'مقتصر على مدير النظام' });
  }

  const users = db.getData().users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    departmentId: u.departmentId,
    isActive: u.isActive,
    lastLogin: u.lastLogin,
    createdAt: u.createdAt,
  }));

  return res.json({ success: true, users });
});

app.post('/api/users', authenticateUser, (req, res) => {
  const user = (req as any).user;
  if (user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'مقتصر على مدير النظام' });
  }

  const newUser = {
    id: 'usr-' + Date.now(),
    name: req.body.name,
    email: req.body.email,
    password: req.body.password || 'admin',
    role: req.body.role,
    departmentId: req.body.departmentId,
    isActive: true,
    createdAt: new Date().toISOString().split('T')[0],
  };

  db.getData().users.push(newUser);
  db.addAuditLog({
    userId: user.userId,
    userName: user.name,
    role: user.role,
    action: 'إنشاء حساب مستخدم',
    targetType: 'user',
    targetId: newUser.id,
    details: `تم إضافة المستخدم (${newUser.name}) برتبة [${newUser.role}]`,
  });

  return res.json({ success: true, user: newUser });
});

app.put('/api/users/:id', authenticateUser, (req, res) => {
  const user = (req as any).user;
  if (user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'مقتصر على مدير النظام' });
  }

  const target = db.getData().users.find((u) => u.id === req.params.id);
  if (!target) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });

  if (req.body.name) target.name = req.body.name;
  if (req.body.role) target.role = req.body.role;
  if (req.body.departmentId !== undefined) target.departmentId = req.body.departmentId;
  if (req.body.isActive !== undefined) target.isActive = req.body.isActive;
  if (req.body.password) target.password = req.body.password;

  db.addAuditLog({
    userId: user.userId,
    userName: user.name,
    role: user.role,
    action: 'تعديل صلاحيات مستخدم',
    targetType: 'user',
    targetId: target.id,
    details: `تم تعديل إعدادات الحساب للمستخدم (${target.name})`,
  });

  return res.json({ success: true, user: target });
});

app.get('/api/audit-logs', authenticateUser, (req, res) => {
  const user = (req as any).user;
  if (!['admin', 'principal', 'hr'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'غير مصرح بعرض سجل العمليات' });
  }

  return res.json({ success: true, auditLogs: db.getData().auditLogs });
});

// 9. Database Backup & Restore & Demo Reset
app.get('/api/database/export', authenticateUser, (req, res) => {
  const user = (req as any).user;
  if (user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'مقتصر على مدير النظام' });
  }

  db.addAuditLog({
    userId: user.userId,
    userName: user.name,
    role: user.role,
    action: 'تصدير نسخة احتياطية للقاعدة',
    targetType: 'system',
    details: 'تم تنزيل نسخة احتياطية كاملة من قاعدة بيانات المدرسة بتنسيق JSON',
  });

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="we_minya_db_backup_${Date.now()}.json"`);
  return res.send(JSON.stringify(db.getData(), null, 2));
});

app.post('/api/database/restore', authenticateUser, (req, res) => {
  const user = (req as any).user;
  if (user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'مقتصر على مدير النظام' });
  }

  const ok = db.restoreFromSnapshot(req.body);
  if (!ok) {
    return res.status(400).json({ success: false, message: 'ملف النسخة الاحتياطية غير صالح أو تالف' });
  }

  db.addAuditLog({
    userId: user.userId,
    userName: user.name,
    role: user.role,
    action: 'استعادة قاعدة البيانات',
    targetType: 'system',
    details: 'تم استعادة قاعدة بيانات المدرسة من ملف نسخة احتياطية بنجاح',
  });

  return res.json({ success: true, message: 'تم استعادة قاعدة البيانات بنجاح' });
});

app.post('/api/database/reset-demo', authenticateUser, (req, res) => {
  const user = (req as any).user;
  if (user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'مقتصر على مدير النظام' });
  }

  db.resetToSeed();
  return res.json({ success: true, message: 'تم إعادة ضبط البيانات التجريبية للمدرسة بنجاح' });
});

app.post('/api/database/clear-demo', authenticateUser, (req, res) => {
  const user = (req as any).user;
  if (user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'مقتصر على مدير النظام' });
  }

  db.clearDemoData();
  return res.json({ success: true, message: 'تم تفريغ كافة البيانات التجريبية استعداداً لبدء الإدخال الفعلي' });
});

// Bulk Import
app.post('/api/employees/bulk-import', authenticateUser, (req, res) => {
  const user = (req as any).user;
  if (!['admin', 'hr'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'مقتصر على مسئولي شئون العاملين' });
  }

  const { rows } = req.body;
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ success: false, message: 'لم يتم العثور على سجلات صالحة للاستيراد' });
  }

  let importedCount = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      if (!row.fullName || !row.nationalId) {
        errors.push(`تخطي سطر لعدم وجود الاسم أو الرقم القومي`);
        continue;
      }

      // Find department by name or use default
      let dept = db.getData().departments.find((d) => d.name.trim() === (row.department || '').trim());
      if (!dept) {
        dept = db.getData().departments[0];
      }

      let specId: string | undefined = undefined;
      if (row.specialization) {
        const spec = db.getData().specializations.find((s) => s.name.trim() === row.specialization.trim());
        if (spec) specId = spec.id;
      }

      db.addEmployee(
        {
          fullName: row.fullName,
          nationalId: row.nationalId.toString(),
          birthDate: row.birthDate || '1990-01-01',
          gender: row.gender === 'أنثى' ? 'أنثى' : 'ذكر',
          phone: row.phone ? row.phone.toString() : '01000000000',
          email: row.email || `${row.nationalId}@we-minya.edu.eg`,
          address: row.address || 'المنيا',
          departmentId: dept.id,
          specializationId: specId,
          jobTitle: row.jobTitle || 'موظف',
          contractType: row.contractType || 'قطاع خاص محدد المدة',
          hiringEntity: row.hiringEntity || 'الشركة المصرية للاتصالات WE',
          hireDate: row.hireDate || new Date().toISOString().split('T')[0],
          schoolStartDate: row.schoolStartDate || new Date().toISOString().split('T')[0],
          employmentStatus: 'على رأس العمل',
        },
        [],
        [],
        { id: user.userId, name: user.name, role: user.role }
      );
      importedCount++;
    } catch (err: any) {
      errors.push(`خطأ في ${row.fullName}: ${err.message}`);
    }
  }

  return res.json({
    success: true,
    importedCount,
    errors,
    message: `تم بنجاح استيراد عدد (${importedCount}) سجل موظف إلى قاعدة البيانات`,
  });
});

// Update school info
app.put('/api/school-info', authenticateUser, (req, res) => {
  const user = (req as any).user;
  if (user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'مقتصر على مدير النظام' });
  }

  const info = db.getData().schoolInfo;
  Object.assign(info, req.body);
  return res.json({ success: true, schoolInfo: info });
});

// ---------------- VITE MIDDLEWARE OR STATIC SERVING ---------------- //

async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, () => {
    console.log(`WE Minya HR Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
