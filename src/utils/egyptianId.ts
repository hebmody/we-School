export interface EgyptianIdData {
  isValid: boolean;
  birthDate?: string; // YYYY-MM-DD
  formattedBirthDate?: string;
  gender?: 'ذكر' | 'أنثى';
  governorate?: string;
  century?: number;
  errorMessage?: string;
}

const GOVERNORATES: Record<string, string> = {
  '01': 'القاهرة',
  '02': 'الإسكندرية',
  '03': 'بورسعيد',
  '04': 'السويس',
  '11': 'دمياط',
  '12': 'الدقهلية',
  '13': 'الشرقية',
  '14': 'القليوبية',
  '15': 'كفر الشيخ',
  '16': 'الغربية',
  '17': 'المنوفية',
  '18': 'البحيرة',
  '19': 'الإسماعيلية',
  '21': 'الجيزة',
  '22': 'بني سويف',
  '23': 'الفيوم',
  '24': 'المنيا',
  '25': 'أسيوط',
  '26': 'سوهاج',
  '27': 'قنا',
  '28': 'أسوان',
  '29': 'الأقصر',
  '31': 'البحر الأحمر',
  '32': 'الوادي الجديد',
  '33': 'مطروح',
  '34': 'شمال سيناء',
  '35': 'جنوب سيناء',
  '88': 'خارج الجمهورية',
};

export function parseEgyptianNationalId(id: string): EgyptianIdData {
  const cleanId = id.trim();
  if (cleanId.length !== 14 || !/^\d{14}$/.test(cleanId)) {
    return {
      isValid: false,
      errorMessage: 'يجب أن يتكون الرقم القومي من 14 رقماً بالتمام والكمال',
    };
  }

  const centuryChar = cleanId.charAt(0);
  let century = 1900;
  if (centuryChar === '2') {
    century = 1900;
  } else if (centuryChar === '3') {
    century = 2000;
  } else {
    return {
      isValid: false,
      errorMessage: 'الرقم القومي غير صالح (الرقم الأول لا يطابق القرن)',
    };
  }

  const yearPart = parseInt(cleanId.substring(1, 3), 10);
  const monthPart = parseInt(cleanId.substring(3, 5), 10);
  const dayPart = parseInt(cleanId.substring(5, 7), 10);
  const fullYear = century + yearPart;

  if (monthPart < 1 || monthPart > 12) {
    return { isValid: false, errorMessage: 'شهر الميلاد في الرقم القومي غير صحيح' };
  }

  if (dayPart < 1 || dayPart > 31) {
    return { isValid: false, errorMessage: 'يوم الميلاد في الرقم القومي غير صحيح' };
  }

  const monthStr = monthPart.toString().padStart(2, '0');
  const dayStr = dayPart.toString().padStart(2, '0');
  const birthDate = `${fullYear}-${monthStr}-${dayStr}`;

  // Governorate
  const govCode = cleanId.substring(7, 9);
  const governorate = GOVERNORATES[govCode] || 'محافظة أخرى';

  // Gender (13th digit: Odd = Male, Even = Female)
  const genderDigit = parseInt(cleanId.charAt(12), 10);
  const gender: 'ذكر' | 'أنثى' = genderDigit % 2 === 1 ? 'ذكر' : 'أنثى';

  return {
    isValid: true,
    birthDate,
    formattedBirthDate: `${dayStr}/${monthStr}/${fullYear}`,
    gender,
    governorate,
    century,
  };
}
