import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Export an array of objects to an authentic Excel (.xlsx) file
export function exportToExcel(data: any[], fileName: string, sheetName: string = 'البيانات') {
  const ws = XLSX.utils.json_to_sheet(data);
  // Set RTL direction on worksheet
  if (!ws['!views']) ws['!views'] = [];
  ws['!views'].push({ rightToLeft: true });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

// Generate sample Excel template for employee bulk import
export function downloadEmployeeTemplate() {
  const template = [
    {
      'الاسم الرباعي': 'محمد أحمد حسن محمود',
      'الرقم القومي': '28912152401234',
      'تاريخ الميلاد': '1989-12-15',
      النوع: 'ذكر',
      'رقم الهاتف': '01012345678',
      'البريد الإلكتروني': 'm.ahmed@we-minya.edu.eg',
      العنوان: 'المنيا الجديدة - الحي الثالث',
      القسم: 'معلمو قطاع خاص',
      التخصص: 'برمجة',
      'المسمى الوظيفي': 'معلم برمجة وتطوير ويب',
      'نوع التعاقد': 'قطاع خاص محدد المدة',
      'جهة التعيين': 'الشركة المصرية للاتصالات WE',
      'تاريخ التعيين': '2023-09-01',
      'تاريخ استلام العمل': '2023-09-15',
    },
    {
      'الاسم الرباعي': 'إيمان محمود علي إبراهيم',
      'الرقم القومي': '29304182402345',
      'تاريخ الميلاد': '1993-04-18',
      النوع: 'أنثى',
      'رقم الهاتف': '01123456789',
      'البريد الإلكتروني': 'e.ali@we-minya.edu.eg',
      العنوان: 'مدينة المنيا - ش طه حسين',
      القسم: 'معلمون حكومي',
      التخصص: '',
      'المسمى الوظيفي': 'معلم لغة إنجليزية',
      'نوع التعاقد': 'حكومي دائم',
      'جهة التعيين': 'وزارة التربية والتعليم',
      'تاريخ التعيين': '2022-09-01',
      'تاريخ استلام العمل': '2022-09-15',
    },
  ];

  exportToExcel(template, 'نموذج_استيراد_العاملين_مدرسة_وي_المنيا', 'بيانات_العاملين');
}

// Export a table to PDF
export function exportTableToPdf(title: string, headers: string[], rows: any[][], fileName: string) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  doc.setFontSize(14);
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 60,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 4,
      halign: 'right',
    },
    headStyles: {
      fillColor: [77, 29, 117], // WE School Purple
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  doc.save(`${fileName}.pdf`);
}
