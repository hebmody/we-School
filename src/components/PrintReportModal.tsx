import React from 'react';
import { Printer, Download, X } from 'lucide-react';
import { SchoolInfo } from '../types';
import { exportTableToPdf } from '../utils/exportTools';

interface PrintReportModalProps {
  config: {
    title: string;
    subtitle: string;
    headers: string[];
    rows: any[][];
    summaryRow?: Record<string, string>;
  };
  schoolInfo?: SchoolInfo;
  onClose: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  config,
  schoolInfo,
  onClose,
}) => {
  const currentDate = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const currentTime = new Date().toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleDirectPrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    exportTableToPdf(
      `${schoolInfo?.name || 'مدرسة وي للتكنولوجيا التطبيقية'} - ${config.title}`,
      config.headers,
      config.rows,
      `تقرير_${config.title.replace(/\s+/g, '_')}_${Date.now()}`
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full my-auto flex flex-col max-h-[92vh]">
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="no-print p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-xl shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-purple-700" />
            <span className="font-bold text-xs text-slate-800">
              معاينة الطباعة الرسمية المعتمدة (A4 Layout)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-semibold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تنزيل PDF</span>
            </button>

            <button
              onClick={handleDirectPrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-md text-xs font-bold shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة فورية</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area (A4 layout styling - Clean Typography Without Logos) */}
        <div className="p-8 sm:p-12 overflow-y-auto flex-1 font-sans text-slate-900" id="printable-sheet">
          {/* Official Egyptian School Letterhead (Pure Typography) */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-6">
            {/* Right Head: Ministry & Directorate */}
            <div className="text-right text-xs leading-relaxed space-y-0.5 font-bold text-slate-800">
              <div>جمهورية مصر العربية</div>
              <div>وزارة التربية والتعليم والتعليم الفني</div>
              <div>قطاع التعليم الفني والتطبيقي</div>
              <div>مديرية التربية والتعليم بمحافظة المنيا</div>
              <div className="text-purple-900 font-extrabold text-sm mt-1">
                {schoolInfo?.name || 'مدرسة وي للتكنولوجيا التطبيقية بالمنيا'}
              </div>
            </div>

            {/* Center Typographic Seal */}
            <div className="text-center px-4 self-center">
              <div className="border-2 border-slate-800 px-4 py-1.5 rounded text-center">
                <div className="font-extrabold text-xs text-slate-900 tracking-wider">
                  إدارة شئون العاملين
                </div>
                <div className="text-[10px] text-slate-600 font-semibold mt-0.5">
                  سجل رسمي معتمد
                </div>
              </div>
            </div>

            {/* Left Head: Date and Telecom Egypt Affiliation */}
            <div className="text-left text-xs leading-relaxed space-y-0.5 text-slate-700 font-semibold">
              <div className="font-bold text-purple-900">الشركة المصرية للاتصالات WE</div>
              <div>العام الدراسي: <strong className="font-mono text-slate-900">{schoolInfo?.academicYear || '2024 / 2025'}</strong></div>
              <div>تاريخ التحرير: <span className="font-medium">{currentDate}</span></div>
              <div className="text-[11px] text-slate-500">الساعة: <span className="font-mono">{currentTime}</span></div>
            </div>
          </div>

          {/* Report Title & Subtitle */}
          <div className="text-center mb-6 space-y-1">
            <h2 className="text-base sm:text-lg font-black text-slate-900 inline-block px-4 py-1 border-b-2 border-slate-800">
              {config.title}
            </h2>
            <p className="text-xs text-slate-600 font-medium">{config.subtitle}</p>
          </div>

          {/* Table Data */}
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-right border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400">
                  {config.headers.map((h, i) => (
                    <th key={i} className="border border-slate-400 py-2 px-2.5 text-center">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {config.rows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className={rowIdx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}
                  >
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className={`border border-slate-300 py-2 px-2.5 ${
                          cellIdx === 0 ? 'text-center font-mono font-bold' : ''
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Institutional Signature & Stamp Section */}
          <div className="mt-12 pt-6 border-t-2 border-slate-300 grid grid-cols-3 text-center text-xs font-bold text-slate-800 break-inside-avoid">
            <div className="space-y-8">
              <div>إعداد (مسئول شئون العاملين)</div>
              <div className="text-slate-700 font-medium">
                {schoolInfo?.hrLeadName || 'أ. عمر عيد سيد صابر'}
                <div className="text-[10px] mt-2 text-slate-400">التوقيع: .....................</div>
              </div>
            </div>

            <div className="space-y-8">
              <div>مراجعة (وكيل المدرسة / التطوير)</div>
              <div className="text-slate-700 font-medium">
                أ. محمد محمود عبدالفتاح
                <div className="text-[10px] mt-2 text-slate-400">التوقيع: .....................</div>
              </div>
            </div>

            <div className="space-y-8">
              <div>يعتمد (المدير الأكاديمي للمدرسة)</div>
              <div className="text-slate-900 font-bold">
                {schoolInfo?.principalName || 'أ. محمد أبوالعيون محمود خالد'}
                <div className="text-[10px] mt-2 text-slate-400">الخاتم والتوقيع: .....................</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
