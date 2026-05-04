import React, { forwardRef, useState } from 'react';
import './PrintForms.css';

const TRANSPORT_TYPES = [
  { id: 'hired', label: 'พาหนะรับจ้าง' },
  { id: 'public-bus', label: 'รถโดยสารประจำทาง' },
  { id: 'plane', label: 'เครื่องบิน' },
  { id: 'train', label: 'รถไฟ' },
  { id: 'ship', label: 'เรือ' },
  { id: 'private', label: 'รถส่วนตัว' },
];

const PrintForms = forwardRef(({ data }, ref) => {
  const [spacings, setSpacings] = useState({
    p1: 0,
    p2: 0,
    p2_back: 0,
    bk111: 0
  });

  // --- Helper Functions (Moved to top to avoid initialization errors) ---
  const safeNumber = (val) => Number(val) || 0;
  const clean = (val) => (val ? val.toString().trim() : '');

  const formatThaiDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
  };

  const formatThaiMonthYear = (dateString) => {
    if (!dateString) return '........................ พ.ศ. ............';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '........................ พ.ศ. ............';
    const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    return `${months[d.getMonth()]} พ.ศ. ${d.getFullYear() + 543}`;
  };

  const getDay = (dateString) => {
    if (!dateString) return '.......';
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? '.......' : d.getDate();
  };

  const bahtText = (number) => {
    if (isNaN(number) || number === 0) return "-";
    const numString = Number(number).toFixed(2);
    const parts = numString.split('.');
    const numberPart = parts[0];
    const decimalPart = parts[1];
    const textNumber = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
    const textPos = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];
    const readNumber = (numStr) => {
      let out = "";
      if (numStr.length === 1 && numStr[0] === '0') return "";
      for (let i = 0; i < numStr.length; i++) {
        let n = parseInt(numStr[i]);
        let pos = numStr.length - 1 - i;
        if (n !== 0) {
          if (pos === 1 && n === 1) out += "สิบ";
          else if (pos === 1 && n === 2) out += "ยี่สิบ";
          else if (pos === 0 && n === 1 && numStr.length > 1 && numStr[numStr.length - 2] !== '0') out += "เอ็ด";
          else out += textNumber[n] + textPos[pos];
        }
      }
      return out;
    };
    let result = readNumber(numberPart) + "บาท";
    if (decimalPart === "00") result += "ถ้วน";
    else result += readNumber(decimalPart) + "สตางค์";
    return `(${result})`;
  };

  const calculateDuration = () => {
    const sDate = data.actualStartDate || data.departDate;
    const sTime = data.actualStartTime || data.departTime;
    const eDate = data.actualEndDate || data.returnDate;
    const eTime = data.actualEndTime || data.returnTime;
    if (!sDate || !eDate || !sTime || !eTime) return { days: '.......', hours: '.......' };
    const start = new Date(`${sDate}T${sTime}`);
    const end = new Date(`${eDate}T${eTime}`);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return { days: '.......', hours: '.......' };
    const diffMs = end - start;
    if (diffMs < 0) return { days: '0', hours: '0' };
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;
    return { days: days.toString(), hours: remainingHours.toString() };
  };

  if (!data) {
    return (
      <div className="print-container no-print" style={{ display: 'flex', padding: '100px', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2>ไม่พบข้อมูลสำหรับพิมพ์</h2>
          <p>กรุณากลับไปกรอกข้อมูลให้ครบถ้วนก่อนกดพิมพ์</p>
        </div>
      </div>
    );
  }

  try {

    const duration = calculateDuration();

    const totalAllowance = safeNumber(data.allowanceRate) * safeNumber(data.allowanceDays);
    const totalAccommodation = safeNumber(data.accommodationRate) * safeNumber(data.accommodationDays);

    let allLegs = [];
    const rawItinerary = data.itinerary || [];

    for (let i = 0; i < rawItinerary.length; i++) {
      const day = rawItinerary[i];
      for (let j = 0; j < (day.legs || []).length; j++) {
        const leg = day.legs[j];

        // If this is a continuation, we find the "parent" leg and update it instead of adding a new row
        if (leg.isContinuation && allLegs.length > 0) {
          const lastLeg = allLegs[allLegs.length - 1];
          lastLeg.to = leg.to;
          lastLeg.endTime = leg.endTime;
          lastLeg.endDate = day.date;
          lastLeg.isMultiDay = true;
          continue;
        }

        let legData = {
          ...leg,
          date: day.date,
          direction: day.direction,
          dateText: formatThaiDate(day.date),
          endDate: day.date,
          isMultiDay: false
        };

        allLegs.push(legData);
      }
    }

    if (data.tripType === 'round-trip' && !allLegs.some(l => l.direction === 'inbound')) {
      const outboundLegs = allLegs.filter(l => l.direction === 'outbound');
      const returnLegs = [...outboundLegs].reverse().map(l => ({
        ...l,
        date: data.returnDate,
        direction: 'inbound',
        from: l.to,
        to: l.from,
        dateText: formatThaiDate(data.returnDate)
      }));
      allLegs = [...allLegs, ...returnLegs];
    }

    const totalTransport = allLegs.reduce((sum, leg) => sum + safeNumber(leg.price), 0);
    const totalAll = totalAllowance + totalAccommodation + totalTransport;

    const renderControl = (pageKey) => (
      <div className="sidebar-control no-print">
        <div className="sidebar-label">บีบตัวอักษร</div>
        <input
          type="range"
          min="-2"
          max="1"
          step="0.05"
          className="vertical-slider"
          value={spacings[pageKey]}
          onChange={(e) => setSpacings(prev => ({ ...prev, [pageKey]: parseFloat(e.target.value) }))}
        />
        <div className="spacing-value">{spacings[pageKey]}</div>
        <button
          className="reset-btn-circle"
          onClick={() => setSpacings(prev => ({ ...prev, [pageKey]: 0 }))}
          title="รีเซ็ต"
        >
          R
        </button>
      </div>
    );

    return (
      <div ref={ref} className="print-container">

        {/* --- PAGE 1: 8708 (FRONT) --- */}
        <div className="page-wrapper">
          <div className="print-page a4-portrait">
            <div className="text-right font-bold" style={{ fontSize: '16pt', marginBottom: '5pt' }}>แบบ 8708</div>
            <div className="doc-header-info">
              สัญญาเงินยืมเลขที่ <span style={{ borderBottom: '1px dotted black', display: 'inline-block', minWidth: '150pt' }}>&nbsp;</span> วันที่ <span style={{ borderBottom: '1px dotted black', display: 'inline-block', minWidth: '150pt' }}>&nbsp;</span> ส่วนที่ 1<br />
              ชื่อผู้ยืม <span style={{ borderBottom: '1px dotted black', display: 'inline-block', minWidth: '180pt' }}>&nbsp;</span> จำนวนเงิน <span style={{ borderBottom: '1px dotted black', display: 'inline-block', minWidth: '150pt' }}>&nbsp;</span> บาท
            </div>

            <h2 className="text-center mb-4" style={{ marginTop: '10pt' }}>ใบเบิกค่าใช้จ่ายในการเดินทางไปราชการ</h2>

            <div className="text-right lh-gov mb-4" style={{ marginTop: '10pt' }}>ที่ทำการ <span style={{ borderBottom: '1px dotted black' }}>&nbsp;&nbsp;{clean(data.department)}&nbsp;&nbsp;</span><br />วันที่ <span style={{ borderBottom: '1px dotted black' }}>&nbsp;&nbsp;{clean(getDay(new Date()))}&nbsp;&nbsp;</span> เดือน <span style={{ borderBottom: '1px dotted black' }}>&nbsp;&nbsp;{clean(formatThaiMonthYear(new Date()))}&nbsp;&nbsp;</span></div>

            <div className="print-body lh-gov">
              <div className="mb-1 font-bold">เรื่อง ขออนุมัติเบิกค่าใช้จ่ายในการเดินทางไปราชการ</div>
              <div className="mb-3 font-bold">เรียน {clean((data.approverPosition || '').split('ปฏิบัติราชการแทน')[0])}</div>

              <div className="indent-text lh-gov" style={{ letterSpacing: `${spacings.p1}px` }}>
                ตามคำสั่ง/บันทึก ที่ <span style={{ borderBottom: '1px dotted black' }}>&nbsp;&nbsp;{clean(data.orderNumber)}&nbsp;&nbsp;</span> ลงวันที่ <span style={{ borderBottom: '1px dotted black' }}>&nbsp;&nbsp;{clean(formatThaiDate(data.orderDate))}&nbsp;&nbsp;</span> ได้อนุมัติให้ข้าพเจ้า <span style={{ borderBottom: '1px dotted black' }}>&nbsp;&nbsp;{clean(data.name)}&nbsp;&nbsp;</span> ตำแหน่ง <span style={{ borderBottom: '1px dotted black' }}>&nbsp;&nbsp;{clean(data.position)}&nbsp;&nbsp;</span> สังกัด <span style={{ borderBottom: '1px dotted black' }}>&nbsp;&nbsp;{clean(data.department)}&nbsp;&nbsp;</span> กรมธนารักษ์ เดินทางไปปฏิบัติราชการ <span style={{ borderBottom: '1px dotted black' }}>&nbsp;&nbsp;{clean(data.purpose)}&nbsp;&nbsp;</span> ณ <span style={{ borderBottom: '1px dotted black' }}>&nbsp;&nbsp;{clean(data.destination)}&nbsp;&nbsp;</span> โดยออกเดินทางจาก {data.departFrom} ตั้งแต่ วันที่ <span style={{ borderBottom: '1px dotted black' }}>&nbsp;&nbsp;{clean(formatThaiDate(data.departDate))}&nbsp;&nbsp;</span> เวลา <span style={{ borderBottom: '1px dotted black' }}>&nbsp;&nbsp;{clean(data.departTime)}&nbsp;&nbsp;</span> น. และกลับถึง {data.returnTo} วันที่ <span style={{ borderBottom: '1px dotted black' }}>&nbsp;&nbsp;{clean(formatThaiDate(data.returnDate))}&nbsp;&nbsp;</span> เวลา <span style={{ borderBottom: '1px dotted black' }}>&nbsp;&nbsp;{clean(data.returnTime)}&nbsp;&nbsp;</span> น. รวมเวลาไปราชการครั้งนี้ <span style={{ borderBottom: '1px dotted black' }}>&nbsp;&nbsp;{clean(duration.days)}&nbsp;&nbsp;</span> วัน <span style={{ borderBottom: '1px dotted black' }}>&nbsp;&nbsp;{clean(duration.hours)}&nbsp;&nbsp;</span> ชั่วโมง
              </div>

              <div className="indent-text mt-3" style={{ letterSpacing: `${spacings.p1}px` }}>ข้าพเจ้าขอเบิกค่าใช้จ่ายในการเดินทางไปราชการสำหรับ {data.travelType === 'group' ? 'คณะเดินทาง' : 'ข้าพเจ้า'} ดังนี้</div>

              <table className="summary-table mt-2">
                <tbody>
                  <tr>
                    <td style={{ width: '60%' }}>ค่าเบี้ยเลี้ยงเดินทาง อัตรา <span style={{ borderBottom: '1px dotted black' }}>&nbsp;&nbsp;{clean(data.allowanceRate)}&nbsp;&nbsp;</span> บาทต่อวัน</td>
                    <td style={{ width: '20%' }}>จำนวน <span style={{ borderBottom: '1px dotted black' }}>&nbsp;&nbsp;{clean(data.allowanceDays)}&nbsp;&nbsp;</span> วัน</td>
                    <td style={{ width: '20%' }} className="text-right">รวม <span style={{ borderBottom: '1px dotted black' }}>&nbsp;&nbsp;{clean(totalAllowance.toLocaleString())}&nbsp;&nbsp;</span> บาท</td>
                  </tr>
                  <tr>
                    <td>ค่าเช่าที่พัก จำนวน <span style={{ borderBottom: '1px dotted black' }}>&nbsp;&nbsp;{clean(data.accommodationDays)}&nbsp;&nbsp;</span> วัน</td>
                    <td></td>
                    <td className="text-right">รวม <span style={{ borderBottom: '1px dotted black' }}>&nbsp;&nbsp;{totalAccommodation.toLocaleString()}&nbsp;&nbsp;</span> บาท</td>
                  </tr>
                  <tr>
                    <td>ค่าพาหนะ รายละเอียดตามแบบ บก.111</td>
                    <td></td>
                    <td className="text-right">รวม <span style={{ borderBottom: '1px dotted black' }}>&nbsp;&nbsp;{totalTransport.toLocaleString()}&nbsp;&nbsp;</span> บาท</td>
                  </tr>
                  <tr className="font-bold">
                    <td colSpan={2} className="text-right" style={{ paddingRight: '20pt' }}>รวมเงินทั้งสิ้น</td>
                    <td className="text-right">รวม <span style={{ borderBottom: '1px dotted black' }}>&nbsp;&nbsp;{totalAll.toLocaleString()}&nbsp;&nbsp;</span> บาท</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-2 mb-4">จำนวนเงิน (ตัวอักษร) <span style={{ borderBottom: '1px dotted black' }}>&nbsp;&nbsp;{totalAll > 0 ? bahtText(totalAll) : ''}&nbsp;&nbsp;</span></div>

              <div className="indent-text" style={{ letterSpacing: `${spacings.p1}px` }}>ข้าพเจ้าขอรับรองว่ารายการที่กล่าวมาข้างต้นเป็นความจริง และหลักฐานการจ่ายที่ส่งมาด้วย จำนวน <span style={{ borderBottom: '1px dotted black' }}>&nbsp;&nbsp;{allLegs.length}&nbsp;&nbsp;</span> ฉบับ รวมทั้งจำนวนเงินที่ขอเบิกถูกต้องตามระเบียบของทางราชการทุกประการ</div>

              <div className="signature-block" style={{ marginTop: '50pt' }}>
                <div>ลงชื่อ.........................................................ผู้ขอรับเงิน</div>
                <div className="mt-2">( {clean(data.name)} )</div>
                <div className="mt-1">ตำแหน่ง {clean(data.position)}</div>
              </div>
            </div>
          </div>
          {renderControl('p1')}
        </div>

        {/* --- PAGE 2: 8708 (BACK) --- */}
        <div className="page-wrapper">
          <div className="print-page a4-portrait">
            <div className="print-body lh-gov" style={{ letterSpacing: `${spacings.p2_back}px`, fontSize: '15pt' }}>
              <div style={{ display: 'flex', width: '100%', marginTop: '10pt' }}>
                <div style={{ width: '50%', paddingRight: '10pt' }}>
                  <div style={{ fontSize: '15pt' }}>ได้ตรวจสอบหลักฐานการเบิกจ่ายเงินที่ถูกต้องแล้ว</div>
                  <div style={{ fontSize: '15pt' }}>เห็นควรอนุมัติให้เบิกจ่ายได้</div>
                  <div style={{ marginTop: '40pt', textAlign: 'center' }}>
                    <div>ลงชื่อ.........................................................</div>
                    <div className="mt-2">(...........................................................)</div>
                  </div>
                </div>
                <div style={{ width: '50%', paddingLeft: '10pt', borderLeft: '1px solid #eee' }}>
                  <div className="text-center" style={{ fontSize: '15pt' }}>อนุมัติให้จ่ายได้</div>
                  <div style={{ marginTop: '40pt', textAlign: 'center' }}>
                    <div className="mt-4">ลงชื่อ.........................................................</div>
                    <div className="mt-2">( {clean(data.approverName) || '...........................................................'} )</div>
                    <div className="mt-1">{clean(data.approverPosition) || ''}</div>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid black', marginTop: '15pt', paddingTop: '10pt' }}>
                <div className="indent-text">ได้รับเงินค่าใช้จ่ายในการเดินทางไปราชการ จำนวน <span style={{ borderBottom: '1px dotted black' }}>&nbsp;&nbsp;{totalAll.toLocaleString()}&nbsp;&nbsp;</span> บาท ({bahtText(totalAll).replace('(', '').replace(')', '')}) ไว้เป็นการถูกต้องแล้ว</div>

                <div style={{ display: 'flex', width: '100%', marginTop: '15pt' }}>
                  <div style={{ width: '50%', textAlign: 'center' }}>
                    <div>ลงชื่อ.........................................................ผู้รับเงิน</div>
                    <div className="mt-1">( {clean(data.name)} )</div>
                    <div className="mt-1">ตำแหน่ง {clean(data.position)}</div>
                    <div className="mt-1">วันที่..........เดือน..........................พ.ศ............</div>
                  </div>
                  <div style={{ width: '50%', textAlign: 'center' }}>
                    <div>ลงชื่อ.........................................................ผู้จ่ายเงิน</div>
                    <div className="mt-1">(...........................................................)</div>
                    <div className="mt-1">ตำแหน่ง...........................................................</div>
                    <div className="mt-1">วันที่..........เดือน..........................พ.ศ............</div>
                  </div>
                </div>

                <div className="mt-4" style={{ fontSize: '14pt' }}>
                  จากเงินยืมตามสัญญาเลขที่ <span style={{ borderBottom: '1px dotted black', display: 'inline-block', minWidth: '100pt' }}>&nbsp;</span> วันที่ <span style={{ borderBottom: '1px dotted black', display: 'inline-block', minWidth: '100pt' }}>&nbsp;</span>
                </div>
              </div>

              <div className="mt-4" style={{ borderTop: '1px solid #ccc', paddingTop: '5pt' }}>
                <div className="font-bold">หมายเหตุ</div>
                <div style={{ fontSize: '13pt' }}>
                  <div style={{ fontSize: '13pt', lineHeight: '1.4' }}>
                    {(() => {
                      const isAutoReverse = data.tripType === 'round-trip-auto';
                      let displayItinerary = data.itinerary || [];
                      if (isAutoReverse) displayItinerary = displayItinerary.filter(d => d.direction === 'outbound');

                      return (
                        <>
                          {displayItinerary.map((day, idx) => (
                            <div key={idx} style={{ marginBottom: '2pt' }}>
                              {idx + 1}. วันที่ {formatThaiDate(day.date)} {(day.legs || []).map((leg, lIdx) => (
                                <span key={lIdx}>
                                  {lIdx > 0 ? ' และ ' : ''}ออกเดินทางจาก {leg.from || ''} ไปยัง {leg.to || ''}
                                  {leg.startTime ? ` เวลา ${leg.startTime} น.` : ''}
                                  {leg.endTime ? ` ถึงที่หมายเวลา ${leg.endTime} น.` : ''}
                                </span>
                              ))}
                            </div>
                          ))}
                          {isAutoReverse && <div className="mt-1 font-bold">- เดินทางไปกลับ รายละเอียดตามแบบ บก.111 ที่แนบ</div>}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className="mt-4" style={{ fontSize: '11pt', lineHeight: '1.2', borderTop: '1px double #ccc', paddingTop: '5pt', color: '#333' }}>
                <div className="font-bold">คำชี้แจง</div>
                <div style={{ display: 'flex', gap: '5pt' }}>
                  <span>1.</span>
                  <span>กรณีเดินทางเป็นหมู่คณะและจัดทำใบเบิกค่าใช้จ่ายรวมฉบับเดียวกัน หากระยะเวลาในการเริ่มต้นและสิ้นสุดการเดินทางของแต่ละบุคคลแตกต่างกัน ให้แสดงรายละเอียดของวันเวลาที่แตกต่างกันของบุคคลนั้นในช่องหมายเหตุ</span>
                </div>
                <div style={{ display: 'flex', gap: '5pt' }}>
                  <span>2.</span>
                  <span>กรณียื่นขอเบิกค่าใช้จ่ายรายบุคคล ให้ผู้ขอรับเงินเป็นผู้ลงลายมือชื่อผู้รับเงินและวันเดือนปีที่รับเงิน กรณีที่มีการยืมเงิน ให้ระบุวันที่ที่ได้รับเงินยืม เลขที่สัญญายืมและวันที่อนุมัติเงินยืมด้วย</span>
                </div>
                <div style={{ display: 'flex', gap: '5pt' }}>
                  <span>3.</span>
                  <span>กรณีที่ยื่นขอเบิกค่าใช้จ่ายรวมเป็นหมู่คณะ ผู้ขอรับเงินมิต้องลงลายมือชื่อในช่องผู้รับเงิน ทั้งนี้ ให้ผู้มีสิทธิแต่ละคนลงลายมือชื่อผู้รับเงินในหลักฐานการจ่ายเงิน (ส่วนที่ 2)</span>
                </div>
              </div>
            </div>
          </div>
          {renderControl('p2_back')}
        </div>

        {/* --- PAGE 3: บก.111 --- */}
        <div className="page-wrapper">
          <div className="print-page a4-portrait">
            <div className="text-right mb-4 font-bold" style={{ fontSize: '18pt' }}>แบบ บก.111</div>
            <h2 className="text-center mb-1">ใบรับรองแทนใบเสร็จรับเงิน</h2>
            <h3 className="text-center mb-4">ส่วนราชการ <span className="dotted-line" style={{ minWidth: '200pt' }}>{clean(data.department)}</span></h3>

            <table className="print-table w-full mb-4">
              <thead>
                <tr>
                  <th style={{ width: '120pt' }}>วัน เดือน ปี</th>
                  <th>รายละเอียดรายจ่าย</th>
                  <th style={{ width: '80pt' }}>จำนวนเงิน</th>
                  <th style={{ width: '80pt' }}>หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const rows = [];
                  let currentDir = null;
                  allLegs.forEach((leg, i) => {
                    if (leg.direction !== currentDir) {
                      currentDir = leg.direction;
                      rows.push(
                        <tr key={`dir-${i}`}>
                          <td colSpan={4} className="font-bold text-center" style={{ background: '#f8fafc', padding: '6pt' }}>
                            --- {currentDir === 'outbound' ? 'เดินทางขาไป' : (currentDir === 'inbound' ? 'เดินทางขากลับ' : 'ระหว่างปฏิบัติงาน')} ---
                          </td>
                        </tr>
                      );
                    }
                    rows.push(
                      <tr key={`leg-${i}`}>
                        <td className="text-center" style={{ fontSize: (leg.dateText || '').includes('-') ? '11pt' : '13pt' }}>
                          {leg.isMultiDay ? `${leg.dateText} - ${formatThaiDate(leg.endDate)}` : leg.dateText}
                        </td>
                        <td>
                          ค่า{TRANSPORT_TYPES.find(t => t.id === leg.type)?.label || leg.type} จาก {leg.from} ถึง {leg.to}
                          {leg.startTime && ` (เวลา ${leg.startTime} น.)`}
                          {leg.isMultiDay && ` ถึงวันที่ ${formatThaiDate(leg.endDate)} เวลา ${leg.endTime} น.`}
                          {!leg.isMultiDay && leg.endTime && ` ถึงที่หมายเวลา ${leg.endTime} น.`}
                        </td>
                        <td className="text-right">{safeNumber(leg.price).toLocaleString()}</td>
                        <td></td>
                      </tr>
                    );
                  });
                  return rows;
                })()}
                <tr className="font-bold">
                  <td colSpan={2} className="text-center">รวมเงินทั้งสิ้น</td>
                  <td className="text-right">{totalTransport.toLocaleString()}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>

            <div className="mb-4" style={{ marginTop: '20pt' }}>
              รวมทั้งสิ้น (ตัวอักษร) <span style={{ borderBottom: '1px dotted black', display: 'inline-block', minWidth: '350pt', paddingLeft: '20pt' }}>{totalTransport > 0 ? `(-${bahtText(totalTransport).replace('(', '').replace(')', '')}-)` : ''}</span>
            </div>

            <div className="lh-gov" style={{ letterSpacing: `${spacings.bk111}px` }}>
              <div style={{ display: 'flex', gap: '10pt' }}>
                <span>ข้าพเจ้า</span>
                <span style={{ borderBottom: '1px dotted black', flex: 1, textAlign: 'center' }}>{clean(data.name)}</span>
                <span>ตำแหน่ง</span>
                <span style={{ borderBottom: '1px dotted black', flex: 1, textAlign: 'center' }}>{clean(data.position)}</span>
              </div>
              <div style={{ display: 'flex', gap: '10pt', marginTop: '5pt' }}>
                <span style={{ borderBottom: '1px dotted black', flex: 1, textAlign: 'center' }}>{clean(data.department)}</span>
                <span>ขอรับรองว่ารายจ่ายข้างต้นนี้ ไม่อาจเรียกใบเสร็จรับเงินจากผู้รับได้</span>
              </div>
              <div style={{ marginTop: '5pt' }}>
                และข้าพเจ้าได้จ่ายไปในงานของราชการโดยแท้
              </div>
            </div>

            <div className="signature-block" style={{ marginLeft: 'auto', marginRight: '30pt', width: '220pt', textAlign: 'center', marginTop: '40pt' }}>
              <div>ลงชื่อ.........................................................</div>
              <div className="mt-2">( {clean(data.name)} )</div>
              <div className="mt-1">วันที่ {getDay(new Date())} {formatThaiMonthYear(new Date())}</div>
            </div>
          </div>
          {renderControl('bk111')}
        </div>

        {/* --- PAGE 4: 8708 PART 2 (LANDSCAPE - For Group Travel) --- */}
        {data.travelType === 'group' && (
          <div className="page-wrapper">
            <div className="print-page a4-landscape">
              <div className="text-right font-bold" style={{ fontSize: '16pt' }}>แบบ 8708 ส่วนที่ 2</div>
              <h2 className="text-center mb-1">หลักฐานการจ่ายเงินค่าใช้จ่ายในการเดินทางไปราชการ</h2>
              <div className="text-center mb-4">
                ส่วนราชการ <span className="dotted-line" style={{ minWidth: '150pt' }}>{clean(data.department)}</span> จังหวัด <span className="dotted-line" style={{ minWidth: '80pt' }}>บึงกาฬ</span>
              </div>

              <table className="print-table w-full" style={{ fontSize: '11pt' }}>
                <thead>
                  <tr>
                    <th rowSpan={2} style={{ width: '30pt' }}>ลำดับที่</th>
                    <th rowSpan={2} style={{ width: '180pt' }}>ชื่อ - นามสกุล</th>
                    <th rowSpan={2} style={{ width: '120pt' }}>ตำแหน่ง</th>
                    <th colSpan={4}>ค่าใช้จ่าย</th>
                    <th rowSpan={2} style={{ width: '70pt' }}>รวมเงิน</th>
                    <th rowSpan={2} style={{ width: '100pt' }}>ลายมือชื่อผู้รับเงิน</th>
                    <th rowSpan={2} style={{ width: '80pt' }}>วันที่รับเงิน</th>
                    <th rowSpan={2}>หมายเหตุ</th>
                  </tr>
                  <tr>
                    <th style={{ width: '50pt' }}>เบี้ยเลี้ยง</th>
                    <th style={{ width: '50pt' }}>ที่พัก</th>
                    <th style={{ width: '50pt' }}>พาหนะ</th>
                    <th style={{ width: '50pt' }}>อื่นๆ</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Main Requester (Row 1) */}
                  <tr>
                    <td className="text-center">1</td>
                    <td>{clean(data.name)}</td>
                    <td>{clean(data.position)}</td>
                    <td className="text-right">{totalAllowance.toLocaleString()}</td>
                    <td className="text-right">{totalAccommodation.toLocaleString()}</td>
                    <td className="text-right">{totalTransport.toLocaleString()}</td>
                    <td className="text-right">-</td>
                    <td className="text-right font-bold">{totalAll.toLocaleString()}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  {/* Team Members */}
                  {(data.team || []).map((member, mIdx) => {
                    // Re-calculate based on smart rules for each member
                    const mAllowanceDays = Number(member.allowanceDays) || 0;
                    const mAllowance = safeNumber(member.allowanceRate || data.allowanceRate) * mAllowanceDays;
                    const mAccommodationDays = Number(member.accommodationDays) || 0;
                    const mAccommodation = safeNumber(member.accommodationRate || data.accommodationRate) * mAccommodationDays;
                    const mTransport = safeNumber(member.transport) || 0;
                    const mTotal = mAllowance + mAccommodation + mTransport;

                    return (
                      <tr key={mIdx}>
                        <td className="text-center">{mIdx + 2}</td>
                        <td>{clean(member.name)}</td>
                        <td>{clean(member.position)}</td>
                        <td className="text-right">{mAllowance.toLocaleString()}</td>
                        <td className="text-right">{mAccommodation.toLocaleString()}</td>
                        <td className="text-right">{mTransport.toLocaleString()}</td>
                        <td className="text-right">-</td>
                        <td className="text-right font-bold">{mTotal.toLocaleString()}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                    );
                  })}
                  {/* Totals */}
                  <tr className="font-bold">
                    <td colSpan={3} className="text-center">รวมเงินทั้งสิ้น</td>
                    <td className="text-right">{(totalAllowance + (data.team || []).reduce((s, m) => s + (safeNumber(m.allowanceRate) * safeNumber(m.allowanceDays)), 0)).toLocaleString()}</td>
                    <td className="text-right">{(totalAccommodation + (data.team || []).reduce((s, m) => s + (safeNumber(m.accommodationRate) * safeNumber(m.accommodationDays)), 0)).toLocaleString()}</td>
                    <td className="text-right">{totalTransport.toLocaleString()}</td>
                    <td className="text-right">-</td>
                    <td className="text-right" style={{ background: '#eee' }}>{(totalAll + (data.team || []).reduce((s, m) => s + (safeNumber(m.allowanceRate) * safeNumber(m.allowanceDays) + safeNumber(m.accommodationRate) * safeNumber(m.accommodationDays)), 0)).toLocaleString()}</td>
                    <td colSpan={3} style={{ background: '#eee' }}></td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-5" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: '45%' }}>
                  <div>จำนวนเงินรวมทั้งสิ้น (ตัวอักษร) <span className="dotted-line" style={{ width: '100%' }}>....................................................................................</span></div>
                </div>
                <div style={{ width: '50%', textAlign: 'center' }}>
                  <div style={{ marginBottom: '40pt', marginTop: '80pt' }}>
                    ลงชื่อ.........................................................ผู้จ่ายเงิน<br />
                    <div style={{ marginTop: '10pt' }}>(...........................................................)</div>
                    <div style={{ marginTop: '5pt' }}>ตำแหน่ง...........................................................</div>
                    <div style={{ marginTop: '5pt' }}>วันที่..........เดือน..........................พ.ศ............</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  } catch (err) {
    console.error("Render Error in PrintForms:", err);
    return (
      <div className="print-container no-print" style={{ padding: '50px', color: 'red', background: 'white' }}>
        <h3>เกิดข้อผิดพลาดในการแสดงผลแบบฟอร์ม</h3>
        <p>{err.message}</p>
        <button onClick={() => window.location.reload()}>โหลดหน้าใหม่</button>
      </div>
    );
  }
});

export default PrintForms;
