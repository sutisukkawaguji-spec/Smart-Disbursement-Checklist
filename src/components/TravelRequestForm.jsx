import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Users, User, Car, Plane, Train, Ship, Check, ChevronRight, Save, Calendar, Clock, MapPin, Truck, ArrowRightLeft, Map, Printer, RefreshCcw } from 'lucide-react';

const formatThaiDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;
};

const TRANSPORT_TYPES = [
  { id: 'hired', label: 'พาหนะรับจ้าง (Taxi/มอเตอร์ไซค์)', icon: Truck },
  { id: 'public-bus', label: 'รถโดยสารประจำทาง', icon: Car },
  { id: 'plane', label: 'เครื่องบิน', icon: Plane },
  { id: 'train', label: 'รถไฟ', icon: Train },
  { id: 'ship', label: 'เรือ', icon: Ship },
  { id: 'private', label: 'รถส่วนตัว', icon: Car },
];

const TimeSelect24 = ({ value, onChange, className }) => {
  const [h, m] = (value || '08:00').split(':');
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <select
        value={h}
        onChange={e => onChange(`${e.target.value}:${m}`)}
        className="time-select-mini"
      >
        {hours.map(hour => <option key={hour} value={hour}>{hour}</option>)}
      </select>
      <span className="text-white">:</span>
      <select
        value={m}
        onChange={e => onChange(`${h}:${e.target.value}`)}
        className="time-select-mini"
      >
        {minutes.map(min => <option key={min} value={min}>{min}</option>)}
      </select>
    </div>
  );
};

const TravelDisbursementForm = ({ onComplete, onSave, initialData }) => {
  const defaultData = {
    name: '',
    position: '',
    department: '',
    province: 'บึงกาฬ',
    orderNumber: '',
    orderDate: '',
    purpose: '',
    destination: '',
    eventStartDate: '',
    eventEndDate: '',
    approverName: '',
    approverPosition: '',
    isPaymentAuthorized: true,
    departDate: '',
    departTime: '08:00',
    returnDate: '',
    returnTime: '17:00',
    departFrom: 'บ้านพัก',
    returnTo: 'บ้านพัก',
    allowanceRate: 240,
    allowanceDays: 0,
    accommodationDays: 0,
    accommodationRate: 0,
    accommodationType: 'เหมาจ่าย',
    isOvernight: false,
    mealCount: 0,
    itineraryNote: '',
    travelType: 'individual',
    tripType: 'round-trip-auto',
    team: [{ name: '', position: '', allowanceDays: 0, accommodationDays: 0, transport: '' }],
    itinerary: [
      {
        id: Date.now(),
        date: '2026-03-11',
        direction: 'outbound',
        legs: [
          {
            id: Date.now() + 1, type: 'hired', from: '', to: '', price: '', crossDistrict: false, distance: '',
            startTime: '08:00', durationHours: '', durationMinutes: '', endTime: '', isNextDay: false
          }
        ]
      }
    ]
  };

  const [formData, setFormData] = useState({ ...defaultData, ...initialData });

  const addDay = () => {
    const itinerary = formData.itinerary || [];
    const lastDay = itinerary[itinerary.length - 1];
    const lastLeg = (lastDay?.legs || [])[(lastDay?.legs || []).length - 1];
    const newFrom = lastLeg ? lastLeg.to : '';

    setFormData(prev => ({
      ...prev,
      itinerary: [...(prev.itinerary || []), {
        id: Date.now(),
        date: '',
        direction: 'outbound',
        legs: [{
          id: Date.now() + 1, type: 'hired', from: newFrom, to: '', price: '', crossDistrict: false, distance: '',
          startTime: '', durationHours: '', durationMinutes: '', endTime: '', isNextDay: false
        }]
      }]
    }));
  };

  const removeDay = (dayId) => {
    if (formData.itinerary.length > 1) {
      setFormData(prev => ({
        ...prev,
        itinerary: prev.itinerary.filter(d => d.id !== dayId)
      }));
    }
  };

  const updateDay = (dayId, field, value) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map(d => d.id === dayId ? { ...d, [field]: value } : d)
    }));
  };

  const addLegToDay = (dayId) => {
    setFormData(prev => ({
      ...prev,
      itinerary: (prev.itinerary || []).map(d => {
        if (d.id === dayId) {
          const legs = d.legs || [];
          const lastLeg = legs[legs.length - 1];
          const newFrom = lastLeg ? lastLeg.to : '';
          return {
            ...d,
            legs: [...legs, {
              id: Date.now(), type: lastLeg?.type || 'hired', from: newFrom, to: '', price: '',
              crossDistrict: false, distance: '', startTime: lastLeg?.endTime || '',
              durationHours: '', durationMinutes: '', endTime: '', isNextDay: false
            }]
          };
        }
        return d;
      })
    }));
  };


  const removeLegFromDay = (dayId, legId) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map(d => d.id === dayId ? {
        ...d,
        legs: d.legs.filter(l => l.id !== legId)
      } : d)
    }));
  };

  const removeTeamMember = (index) => {
    setFormData(prev => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== index)
    }));
  };

  const calculateEndTime = (startTime, h, m) => {
    if (!startTime) return { time: '', isNextDay: false };
    const [startH, startM] = startTime.split(':').map(Number);
    let totalMinutes = startH * 60 + startM + (Number(h) || 0) * 60 + (Number(m) || 0);

    let isNextDay = false;
    if (totalMinutes >= 1440) {
      isNextDay = true;
      totalMinutes %= 1440;
    }

    const endH = Math.floor(totalMinutes / 60);
    const endM = totalMinutes % 60;
    const time = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

    return { time, isNextDay };
  };

  const updateLeg = (dayId, legId, field, value) => {
    setFormData(prev => {
      let newItinerary = prev.itinerary.map(d => {
        if (d.id === dayId) {
          return {
            ...d,
            legs: d.legs.map(l => {
              if (l.id === legId) {
                const updatedLeg = { ...l, [field]: value };
                if (['startTime', 'durationHours', 'durationMinutes'].includes(field)) {
                  const { time, isNextDay } = calculateEndTime(updatedLeg.startTime, updatedLeg.durationHours, updatedLeg.durationMinutes);
                  updatedLeg.endTime = time;
                  updatedLeg.isNextDay = isNextDay;
                }
                return updatedLeg;
              }
              return l;
            })
          };
        }
        return d;
      });

      const currentDay = newItinerary.find(d => d.id === dayId);
      const currentLeg = currentDay?.legs.find(l => l.id === legId);

      if (currentLeg?.isNextDay) {
        const dayIndex = newItinerary.findIndex(d => d.id === dayId);
        const nextDay = newItinerary[dayIndex + 1];

        if (!nextDay) {
          const d = new Date(currentDay.date || prev.departDate);
          d.setDate(d.getDate() + 1);
          const nextDateStr = d.toISOString().split('T')[0];

          newItinerary.push({
            id: Date.now() + Math.random(),
            date: nextDateStr,
            direction: currentDay.direction,
            legs: [{
              id: Date.now() + Math.random(),
              type: currentLeg.type, // Copy type
              from: currentLeg.from, // Copy original From for reference if needed
              to: currentLeg.to,     // Copy current To
              price: 0,
              crossDistrict: currentLeg.crossDistrict,
              distance: currentLeg.distance,
              startTime: currentLeg.endTime,
              durationHours: '',
              durationMinutes: '',
              endTime: '',
              isNextDay: false,
              isContinuation: true
            }]
          });
        } else {
          // Update the first leg of next day if it's already a continuation
          nextDay.legs[0] = {
            ...nextDay.legs[0],
            type: currentLeg.type,
            from: currentLeg.from,
            to: currentLeg.to,
            startTime: currentLeg.endTime,
            isContinuation: true,
            price: 0
          };
        }
      }

      return { ...prev, itinerary: newItinerary };
    });
  };

  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      team: [...prev.team, { name: '', position: '', allowanceDays: 0, accommodationDays: 0, transport: '' }]
    }));
  };

  const updateTeamMember = (index, field, value) => {
    const newTeam = [...formData.team];
    newTeam[index][field] = value;
    setFormData(prev => ({ ...prev, team: newTeam }));
  };

  const handlePinLocation = (dayId, legId, type) => {
    // Mock pinning location
    alert(`ระบบกำลังดึงพิกัด GPS สำหรับ ${type}... (จำลอง)`);
    updateLeg(dayId, legId, 'distance', '120'); // Mock distance 120km
  };

  const calculateAllowanceDaysAuto = (startStr, startTime, endStr, endTime, isOvernight) => {
    if (!startStr || !endStr) return 0;
    const start = new Date(`${startStr}T${startTime || '00:00'}`);
    const end = new Date(`${endStr}T${endTime || '00:00'}`);
    const diffMs = end - start;
    if (diffMs <= 0) return 0;

    const totalHours = diffMs / (1000 * 60 * 60);
    if (isNaN(totalHours)) return 0;

    if (isOvernight) {
      // Overnight rule: use 24-hour cycle
      const fullDays = Math.floor(totalHours / 24);
      const remainingHours = totalHours % 24;

      let extra = 0;
      if (remainingHours > 12) extra = 1;
      else if (remainingHours > 6) extra = 0.5;

      return fullDays + extra;
    } else {
      // No stay rule (Day Trip): use 12h/6h rule on total hours
      if (totalHours > 12) return 1;
      if (totalHours > 6) return 0.5;
      return 0;
    }
  };

  // Auto-update allowance days when timing or accommodation changes
  useEffect(() => {
    const autoDays = calculateAllowanceDaysAuto(
      formData.departDate,
      formData.departTime,
      formData.returnDate,
      formData.returnTime,
      formData.isOvernight
    );
    if (autoDays !== Number(formData.allowanceDays)) {
      setFormData(prev => ({ ...prev, allowanceDays: autoDays }));
    }
  }, [formData.departDate, formData.departTime, formData.returnDate, formData.returnTime, formData.isOvernight, formData.allowanceDays]);

  // Sync first day date/time with departDate/departTime
  useEffect(() => {
    if (formData.itinerary?.[0]) {
      const firstDay = formData.itinerary[0];
      const firstLeg = firstDay.legs?.[0];

      const needsDateSync = formData.departDate && firstDay.date !== formData.departDate;
      const needsTimeSync = formData.departTime && firstLeg && firstLeg.startTime !== formData.departTime;

      if (needsDateSync || needsTimeSync) {
        setFormData(prev => ({
          ...prev,
          itinerary: prev.itinerary.map((d, i) => {
            if (i === 0) {
              const updatedLegs = d.legs.map((l, li) =>
                li === 0 ? { ...l, startTime: needsTimeSync ? formData.departTime : l.startTime } : l
              );
              return {
                ...d,
                date: needsDateSync ? formData.departDate : d.date,
                legs: updatedLegs
              };
            }
            return d;
          })
        }));
      }
    }
  }, [formData.departDate, formData.departTime]);

  // AUTO-SYNC RETURN LEGS: This effect keeps the return legs in sync with outbound legs automatically.
  useEffect(() => {
    if (formData.tripType === 'round-trip-auto') {
      const outboundLegs = [];
      formData.itinerary.filter(d => d.direction === 'outbound').forEach(day => {
        (day.legs || []).forEach(leg => {
          if (!leg.isContinuation) outboundLegs.push({ ...leg });
        });
      });

      if (outboundLegs.length === 0) return;

      const rawReturn = [...outboundLegs].reverse().map((leg, idx) => ({
        id: `auto-ret-${idx}`,
        type: leg.type,
        from: leg.to,
        to: leg.from,
        price: leg.price,
        crossDistrict: leg.crossDistrict,
        distance: leg.distance,
        startTime: '',
        durationHours: leg.durationHours,
        durationMinutes: leg.durationMinutes,
        endTime: '',
        isNextDay: false,
        isContinuation: false
      }));

      const returnDays = [];
      let currentDayDate = formData.returnDate || formData.departDate;
      let currentStartTime = formData.returnTime;
      let currentLegs = [];

      rawReturn.forEach((leg) => {
        leg.startTime = currentStartTime;
        const { time, isNextDay } = calculateEndTime(leg.startTime, leg.durationHours, leg.durationMinutes);
        leg.endTime = time;
        leg.isNextDay = isNextDay;
        currentLegs.push(leg);
        currentStartTime = time;

        if (isNextDay) {
          returnDays.push({ id: `auto-ret-d-${returnDays.length}`, date: currentDayDate, direction: 'inbound', legs: currentLegs });
          const d = new Date(currentDayDate);
          d.setDate(d.getDate() + 1);
          currentDayDate = d.toISOString().split('T')[0];
          currentLegs = [];
        }
      });

      if (currentLegs.length > 0) {
        returnDays.push({ id: `auto-ret-d-${returnDays.length}`, date: currentDayDate, direction: 'inbound', legs: currentLegs });
      }

      const currentInbound = formData.itinerary.filter(d => d.direction === 'inbound');
      if (JSON.stringify(currentInbound) !== JSON.stringify(returnDays)) {
        setFormData(prev => ({
          ...prev,
          itinerary: [
            ...prev.itinerary.filter(d => d.direction === 'outbound'),
            ...returnDays
          ]
        }));
      }
    }
  }, [JSON.stringify(formData.itinerary.filter(d => d.direction === 'outbound')), formData.returnTime, formData.returnDate, formData.tripType]);

  // AUTO-SAVE ON CHANGE
  useEffect(() => {
    // Only save if it's an existing record or has a name
    if (formData.id || formData.name) {
      const timer = setTimeout(() => {
        if (onSave) onSave(formData, true); // true = silent save
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData]);

  const generateReturnLegs = () => {
    const itinerary = formData.itinerary || [];
    const outboundDays = itinerary.filter(d => d.direction === 'outbound');
    const allOutboundLegs = [];
    outboundDays.forEach(day => {
      (day.legs || []).forEach(leg => {
        if (!leg.isContinuation) {
          allOutboundLegs.push({ ...leg });
        }
      });
    });

    if (allOutboundLegs.length === 0) return;

    // 1. Reverse the legs
    const rawReturnLegs = [...allOutboundLegs].reverse().map((leg, idx) => ({
      id: Date.now() + 3000 + idx,
      type: leg.type,
      from: leg.to,
      to: leg.from,
      price: leg.price,
      crossDistrict: leg.crossDistrict,
      distance: leg.distance,
      startTime: '',
      durationHours: leg.durationHours,
      durationMinutes: leg.durationMinutes,
      endTime: '',
      isNextDay: false,
      isContinuation: false
    }));

    // 2. Process legs and split into days if needed
    const returnDays = [];
    let currentDayDate = formData.returnDate || formData.departDate;
    let currentStartTime = formData.returnTime;
    let currentLegs = [];

    rawReturnLegs.forEach((leg, idx) => {
      leg.startTime = currentStartTime;
      const { time, isNextDay } = calculateEndTime(leg.startTime, leg.durationHours, leg.durationMinutes);
      leg.endTime = time;
      leg.isNextDay = isNextDay;

      currentLegs.push(leg);
      currentStartTime = time;

      if (isNextDay) {
        // Close current day
        returnDays.push({
          id: Date.now() + 500 + returnDays.length,
          date: currentDayDate,
          direction: 'inbound',
          legs: currentLegs
        });

        // Prepare next day
        const d = new Date(currentDayDate);
        d.setDate(d.getDate() + 1);
        currentDayDate = d.toISOString().split('T')[0];

        currentLegs = []; // Start fresh list for next day
        // Note: The next day should ideally start with a continuation if the leg was split,
        // but here the leg itself was completed. If the leg has isNextDay, 
        // it means THIS leg ends on the next day. 
        // So the NEXT leg in the reversed list should start on that next day.
      }
    });

    // Push final day if legs remain
    if (currentLegs.length > 0) {
      returnDays.push({
        id: Date.now() + 500 + returnDays.length,
        date: currentDayDate,
        direction: 'inbound',
        legs: currentLegs
      });
    }

    setFormData(prev => ({
      ...prev,
      itinerary: [
        ...prev.itinerary.filter(d => d.direction === 'outbound'),
        ...returnDays
      ]
    }));
    alert('สร้างรายการขากลับเรียบร้อยแล้ว (ตรวจสอบข้ามวันอัตโนมัติ)');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Manual validation check for better UX
    const requiredFields = [
      { key: 'name', label: 'ชื่อ-นามสกุล' },
      { key: 'orderNumber', label: 'เลขที่คำสั่ง/บันทึก' },
      { key: 'orderDate', label: 'วันที่คำสั่ง' },
      { key: 'destination', label: 'สถานที่ปลายทาง' },
      { key: 'departDate', label: 'วันที่ออกเดินทาง' },
      { key: 'returnDate', label: 'วันที่กลับถึง' }
    ];

    const missing = requiredFields.filter(f => !formData[f.key]);
    if (missing.length > 0) {
      alert(`กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน:\n- ${missing.map(m => m.label).join('\n- ')}`);
      return;
    }

    onComplete(formData);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="disbursement-form-wrapper">
      <div className="glass-card form-card wide" id="tour-step-4">
        <h2 className="form-title">แบบคำขอและใบเบิกค่าใช้จ่ายในการเดินทางไปราชการ</h2>

        <form onSubmit={handleSubmit}>

          {/* ส่วนที่ 1: รายละเอียดการขออนุมัติ */}
          <div className="form-section-highlight section-box">
            <h3 className="section-header">ส่วนที่ 1: รายละเอียดการขออนุมัติไปราชการ</h3>
            <div className="form-grid-2">
              <div className="input-group">
                <label>ชื่อ-นามสกุล ผู้ขอเบิก</label>
                <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="input-group">
                <label>ตำแหน่ง</label>
                <input value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} required />
              </div>
              <div className="input-group-row">
                <div className="input-group" style={{ flex: 2 }}>
                  <label>สังกัด</label>
                  <input value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} required />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>จังหวัด</label>
                  <input value={formData.province} onChange={e => setFormData({ ...formData, province: e.target.value })} placeholder="เช่น บึงกาฬ" />
                </div>
              </div>
              <div className="input-group-row">
                <div className="input-group" style={{ flex: 2 }}>
                  <label>ตามคำสั่ง/บันทึก ที่</label>
                  <input value={formData.orderNumber} onChange={e => setFormData({ ...formData, orderNumber: e.target.value })} required />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>ลงวันที่</label>
                  <input type="date" value={formData.orderDate} onChange={e => setFormData({ ...formData, orderDate: e.target.value })} required />
                </div>
              </div>
            </div>

            <div className="form-section mt-3">
              <div className="input-group-row">
                <div className="input-group" style={{ flex: 2 }}>
                  <label>วัตถุประสงค์การเดินทางไปราชการ</label>
                  <textarea rows="2" value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })} required />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>วันที่จัดงาน/อบรม (ถ้ามี)</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted w-8">เริ่ม</span>
                      <input type="date" className="time-select-mini w-full" value={formData.eventStartDate} onChange={e => setFormData({ ...formData, eventStartDate: e.target.value })} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted w-8">ถึง</span>
                      <input type="date" className="time-select-mini w-full" value={formData.eventEndDate} onChange={e => setFormData({ ...formData, eventEndDate: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="input-group mt-3">
                <label>สถานที่ปฏิบัติราชการ (ปลายทาง)</label>
                <input value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} required />
              </div>

              <div className="form-grid-2 mt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                <div className="input-group">
                  <label>ผู้มีอำนาจอนุมัติ (สำหรับพิมพ์ในแบบฟอร์ม)</label>
                  <input value={formData.approverName} onChange={e => setFormData({ ...formData, approverName: e.target.value })} placeholder="ชื่อ-นามสกุล" />
                </div>
                <div className="input-group">
                  <label>ตำแหน่งผู้อนุมัติ</label>
                  <input value={formData.approverPosition} onChange={e => setFormData({ ...formData, approverPosition: e.target.value })} placeholder="ตำแหน่ง" />
                </div>
              </div>
              <div className="mt-3">
                <label className="checkbox-styled">
                  <input type="checkbox" checked={formData.isPaymentAuthorized} onChange={e => setFormData({ ...formData, isPaymentAuthorized: e.target.checked })} />
                  <span className="checkmark"></span>
                  อนุมัติให้จ่ายได้ (แสดงในใบเบิก)
                </label>
              </div>
            </div>
          </div>

          {/* ส่วนที่ 2: จัดทำแบบเบิกจ่าย 8708 */}
          <div className="form-section-highlight section-box secondary-bg">
            <h3 className="section-header">ส่วนที่ 2: แบบเบิกจ่ายไปราชการ (แบบ 8708 ส่วนที่ 1)</h3>

            <div className="form-grid-2 mb-3">
              <div className="config-item">
                <label>ลักษณะการเดินทาง</label>
                <div className="mini-toggle">
                  <button type="button" className={formData.travelType === 'individual' ? 'active' : ''} onClick={() => setFormData({ ...formData, travelType: 'individual' })}>คนเดียว</button>
                  <button type="button" className={formData.travelType === 'group' ? 'active' : ''} onClick={() => setFormData({ ...formData, travelType: 'group' })}>เป็นคณะ</button>
                </div>
              </div>
              <div className="config-item">
                <label>รูปแบบการเดินทาง</label>
                <div className="mini-toggle">
                  <button type="button" className={formData.tripType === 'one-way' ? 'active' : ''} onClick={() => setFormData({ ...formData, tripType: 'one-way' })}>ขาเดียว</button>
                  <button type="button" className={formData.tripType === 'round-trip' ? 'active' : ''} onClick={() => setFormData({ ...formData, tripType: 'round-trip' })}>ไป-กลับ</button>
                  <button type="button" className={formData.tripType === 'round-trip-auto' ? 'active' : ''} onClick={() => setFormData({ ...formData, tripType: 'round-trip-auto' })}>ไป-กลับ (ย้อนอัตโนมัติ)</button>
                </div>
              </div>
            </div>

            <div className="form-grid-2 mb-3">
              <div className="config-item">
                <label>ออกเดินทางจาก</label>
                <select value={formData.departFrom} onChange={e => setFormData({ ...formData, departFrom: e.target.value })} className="select-input">
                  <option value="บ้านพัก">บ้านพัก</option>
                  <option value="สำนักงาน">สำนักงาน</option>
                  <option value="ประเทศไทย">ประเทศไทย</option>
                </select>
              </div>
              <div className="config-item">
                <label>กลับถึง</label>
                <select value={formData.returnTo} onChange={e => setFormData({ ...formData, returnTo: e.target.value })} className="select-input">
                  <option value="บ้านพัก">บ้านพัก</option>
                  <option value="สำนักงาน">สำนักงาน</option>
                  <option value="ประเทศไทย">ประเทศไทย</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="date-time-group">
                <label>ตั้งแต่วันที่ (ออกเดินทาง)</label>
                <div className="flex-row">
                  <input type="date" value={formData.departDate} onChange={e => setFormData({ ...formData, departDate: e.target.value })} required />
                  <TimeSelect24 value={formData.departTime} onChange={val => setFormData({ ...formData, departTime: val })} />
                </div>
              </div>
              <div className="date-time-group">
                <label>ถึงวันที่ (กลับถึง)</label>
                <div className="flex-row">
                  <input type="date" value={formData.returnDate} onChange={e => setFormData({ ...formData, returnDate: e.target.value })} required />
                  <TimeSelect24 value={formData.returnTime} onChange={val => setFormData({ ...formData, returnTime: val })} />
                </div>
              </div>
            </div>

            <div className="form-grid-2 mb-3">
              <div className="input-group">
                <label>ลักษณะการเดินทาง (คิดเบี้ยเลี้ยง)</label>
                <div className="mini-toggle" style={{ marginTop: '5px' }}>
                  <button type="button" className={!formData.isOvernight ? 'active' : ''} onClick={() => setFormData({ ...formData, isOvernight: false, accommodationDays: 0, accommodationRate: 0 })}>ไป-กลับ (Day Trip)</button>
                  <button type="button" className={formData.isOvernight ? 'active' : ''} onClick={() => setFormData({ ...formData, isOvernight: true })}>ค้างคืน (Overnight)</button>
                </div>
              </div>
              <div className="input-group">
                <label>ค่าเบี้ยเลี้ยง (บาท/วัน)</label>
                <input type="number" value={formData.allowanceRate} onChange={e => setFormData({ ...formData, allowanceRate: e.target.value })} />
              </div>
            </div>

            <div className="allowance-grid mt-4">
              <div className="input-group">
                <label>จำนวนวัน (เบี้ยเลี้ยง)</label>
                <input type="number" step="0.5" value={formData.allowanceDays} onChange={e => setFormData({ ...formData, allowanceDays: e.target.value })} />
              </div>
              {formData.isOvernight && (
                <>
                  <div className="input-group">
                    <label>ประเภทการเบิกที่พัก</label>
                    <select
                      value={formData.accommodationType || 'เหมาจ่าย'}
                      onChange={e => setFormData({ ...formData, accommodationType: e.target.value })}
                      className="select-input"
                    >
                      <option value="-">-</option>
                      <option value="เหมาจ่าย">แบบเหมาจ่าย (Flat Rate)</option>
                      <option value="จ่ายจริง">แบบจ่ายจริง (Actual Cost)</option>
                    </select>
                    {formData.accommodationType !== '-' && (
                      <div className="text-[10px] mt-2 p-2 rounded bg-white/5 border border-white/10">
                        {formData.accommodationType === 'จ่ายจริง' ? (
                          <div className="flex flex-col gap-1 text-blue-300">
                            <p>• เบิกได้เท่าที่จ่ายจริง (ไม่เกินเพดานที่กำหนด)</p>
                            {formData.travelType === 'group' && (
                              <p className="text-orange-300">• คณะเดินทาง (ระดับ 8 ลงมา) พักรวมกัน 2 คน/ห้อง (อัตราห้องพักคู่)</p>
                            )}
                            <p>• หลักฐาน: ต้องแนบใบเสร็จรับเงิน หรือ Folio</p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1 text-green-300">
                            <p>• เบิกตามอัตราคงที่ของระดับตำแหน่ง</p>
                            <p>• หลักฐาน: ไม่ต้องใช้ใบเสร็จรับเงิน</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="input-group">
                    <label>ค่าที่พัก (บาท/คืน)</label>
                    <input type="number" value={formData.accommodationRate} onChange={e => setFormData({ ...formData, accommodationRate: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>จำนวนคืน (ที่พัก)</label>
                    <input type="number" value={formData.accommodationDays} onChange={e => setFormData({ ...formData, accommodationDays: e.target.value })} />
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-4">
              <div className="input-group" style={{ background: 'rgba(255,165,0,0.1)', padding: '10pt', borderRadius: '8pt', border: '1px solid rgba(255,165,0,0.2)' }}>
                <div className="flex-between">
                  <label style={{ color: '#ffa500', fontWeight: 'bold' }}>มื้ออาหารที่เจ้าภาพจัดเลี้ยง (มื้อ)</label>
                  <span className="text-[10px] text-orange-300">* หักออกมื้อละ 1/3 ของเบี้ยเลี้ยง ({Math.round(formData.allowanceRate / 3)} บาท)</span>
                </div>
                <input type="number" value={formData.mealCount} onChange={e => setFormData({ ...formData, mealCount: e.target.value })} style={{ borderBottomColor: '#ffa500', fontSize: '1.2rem' }} />
              </div>
            </div>
          </div>

          {/* ส่วนที่ 3: แบบ 8708 ส่วนที่ 2 (เฉพาะคณะ) */}
          <AnimatePresence>
            {formData.travelType === 'group' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="form-section-highlight section-box accent-bg"
              >
                <h3 className="section-header">แบบ 8708 ส่วนที่ 2 (ใบขวางสำหรับเดินทางเป็นคณะ)</h3>
                <div className="group-table-container">
                  <table className="group-expense-table modern">
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>ลำดับ</th>
                        <th>ชื่อ-นามสกุล</th>
                        <th>ตำแหน่ง</th>
                        <th style={{ width: '60px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.team.map((member, idx) => (
                        <tr key={idx}>
                          <td className="text-center">{idx + 2}</td>
                          <td>
                            <input placeholder="ชื่อ-นามสกุล" className="w-full" value={member.name} onChange={e => updateTeamMember(idx, 'name', e.target.value)} />
                          </td>
                          <td>
                            <input placeholder="ตำแหน่ง" className="w-full" value={member.position} onChange={e => updateTeamMember(idx, 'position', e.target.value)} />
                          </td>
                          <td className="text-center">
                            {formData.team.length > 1 && (
                              <button type="button" onClick={() => removeTeamMember(idx)} className="btn-icon-danger-small">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={addTeamMember} className="btn-add-text mt-3">
                    <Plus size={16} /> เพิ่มรายชื่อผู้ร่วมเดินทาง
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="form-section-highlight section-box dark-bg">
            <div className="flex-between mb-4">
              <h3 className="section-header mb-0">แผนการใช้พาหนะ (บก.111 ค่าพาหนะรับจ้าง)</h3>
            </div>
            <div className="config-item horizontal">
              <label className="mr-2 text-sm">ประเภททริป:</label>
              <div className="mini-toggle">
                <button type="button" className={formData.tripType === 'round-trip-auto' ? 'active' : ''} onClick={() => setFormData({ ...formData, tripType: 'round-trip-auto' })}>ไป-กลับ (ย้อนอัตโนมัติ)</button>
                <button type="button" className={formData.tripType === 'one-way' ? 'active' : ''} onClick={() => setFormData({ ...formData, tripType: 'one-way' })}>เที่ยวเดียว</button>
              </div>
            </div>

            <p className="text-muted text-sm mb-4">
              * หากเลือก "ไป-กลับ" ระบบจะนำรายการขาไปมาสร้างเป็นรายการขากลับให้อัตโนมัติในตอนพิมพ์แบบฟอร์ม เพียงระบุวันที่เดินทางกลับในส่วนที่ 2
            </p>

            {(formData.itinerary || []).map((day, dIdx) => (
              <div key={day.id} className={`itinerary-day-box section-box ${day.direction}`}>
                <div className="day-header-flex">
                  <div className="day-info-main">
                    <div className="day-badge">
                      <Calendar size={18} />
                      <input
                        type="date"
                        value={day.date}
                        onChange={e => updateDay(day.id, 'date', e.target.value)}
                        className="date-input-inline"
                      />
                      <span>({day.direction === 'outbound' ? 'ขาไป' : (day.direction === 'inbound' ? 'ขากลับ' : 'ระหว่างทาง')})</span>
                    </div>
                  </div>
                  <select value={day.direction} onChange={e => updateDay(day.id, 'direction', e.target.value)} className="direction-select">
                    <option value="outbound">ขาไป (Outbound)</option>
                    <option value="inbound">ขากลับ (Inbound)</option>
                    <option value="traveling">ระหว่างปฏิบัติงาน</option>
                  </select>
                  <button type="button" className="btn-icon-danger-circle" onClick={() => removeDay(day.id)} title="ลบวันเดินทางนี้">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="legs-list">
                  {(day.legs || []).map((leg, lIdx) => (
                    <div key={leg.id} className={`leg-item-card-v3 ${leg.isContinuation ? 'continuation' : ''}`}>
                      <div className="leg-card-header">
                        <div className="leg-type-badge">
                          {leg.type === 'private' && <Car size={14} />}
                          {leg.type === 'van' && <Users size={14} />}
                          {leg.type === 'bus' && <Truck size={14} />}
                          {leg.type === 'taxi' && <Car size={14} />}
                          {leg.type === 'plane' && <Plane size={14} />}
                          {leg.type === 'train' && <Train size={14} />}
                          {leg.type === 'ship' && <Ship size={14} />}
                          <span>{TRANSPORT_TYPES.find(t => t.id === leg.type)?.label || 'พาหนะ'}</span>
                        </div>
                        <div className="leg-index">ช่วงที่ {lIdx + 1}</div>
                        <button type="button" className="btn-remove-leg" onClick={() => removeLegFromDay(day.id, leg.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="leg-card-body">
                        {/* Route Section */}
                        <div className="leg-route-section">
                          <div className="route-input-group">
                            <label><MapPin size={12} /> ต้นทาง</label>
                            <input 
                              placeholder="ระบุสถานที่ต้นทาง" 
                              value={leg.from} 
                              onChange={e => updateLeg(day.id, leg.id, 'from', e.target.value)} 
                            />
                          </div>
                          <div className="route-connector">
                            <ArrowRightLeft size={16} />
                          </div>
                          <div className="route-input-group">
                            <label><MapPin size={12} /> ปลายทาง</label>
                            <input 
                              placeholder="ระบุสถานที่ปลายทาง" 
                              value={leg.to} 
                              onChange={e => updateLeg(day.id, leg.id, 'to', e.target.value)} 
                            />
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="leg-details-grid">
                          <div className="detail-item">
                            <label>ประเภทพาหนะ</label>
                            <select className="table-select-v2" value={leg.type} onChange={e => updateLeg(day.id, leg.id, 'type', e.target.value)}>
                              {TRANSPORT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                            </select>
                          </div>

                          <div className="detail-item">
                            <label>เวลาออกเดินทาง</label>
                            <div className="time-input-wrapper">
                              <Clock size={14} />
                              <TimeSelect24 value={leg.startTime} onChange={val => updateLeg(day.id, leg.id, 'startTime', val)} />
                            </div>
                          </div>

                          <div className="detail-item">
                            <label>ระยะเวลาเดินทาง</label>
                            <div className="duration-inputs">
                              <input type="number" placeholder="ชม." value={leg.durationHours} onChange={e => updateLeg(day.id, leg.id, 'durationHours', e.target.value)} />
                              <span>:</span>
                              <input type="number" placeholder="นาที" value={leg.durationMinutes} onChange={e => updateLeg(day.id, leg.id, 'durationMinutes', e.target.value)} />
                            </div>
                          </div>

                          <div className="detail-item">
                            <label>เวลาถึงปลายทาง</label>
                            <div className="time-input-wrapper" style={{ background: 'rgba(56, 189, 248, 0.05)', borderColor: 'rgba(56, 189, 248, 0.2)' }}>
                              <span className={leg.isNextDay ? "text-orange-400 font-bold" : "text-sky-400 font-bold"}>
                                {leg.endTime || '--:--'}
                              </span>
                              {leg.isNextDay && <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded ml-1 font-bold">+1 วัน</span>}
                            </div>
                          </div>

                          <div className="detail-item">
                            <label>ราคา/ระยะทาง</label>
                            {leg.type === 'private' ? (
                              <div className="cost-input-v2">
                                <input type="number" placeholder="กม." value={leg.distance} onChange={e => updateLeg(day.id, leg.id, 'distance', e.target.value)} />
                                <span className="unit">กม.</span>
                              </div>
                            ) : (
                              <div className="cost-input-v2">
                                <input 
                                  type="number" 
                                  value={leg.isContinuation ? 0 : leg.price}
                                  onChange={e => updateLeg(day.id, leg.id, 'price', e.target.value)}
                                  disabled={leg.isContinuation}
                                  placeholder="บาท"
                                />
                                <span className="unit">฿</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {leg.type === 'private' && (
                          <div className="leg-actions-row">
                            <button type="button" className="btn-action-outline" onClick={() => handlePinLocation(day.id, leg.id, 'ต้นทาง')}>
                              <MapPin size={14} /> ปักหมุดต้นทาง
                            </button>
                            <button type="button" className="btn-action-outline" onClick={() => handlePinLocation(day.id, leg.id, 'ปลายทาง')}>
                              <Map size={14} /> ปักหมุดปลายทาง
                            </button>
                            <div className="flex-1"></div>
                            <label className="checkbox-modern">
                              <input type="checkbox" checked={leg.crossDistrict} onChange={e => updateLeg(day.id, leg.id, 'crossDistrict', e.target.checked)} />
                              <span className="checkbox-box"></span>
                              <span>ข้ามเขตจังหวัด</span>
                            </label>
                          </div>
                        )}

                        {leg.type !== 'private' && (
                          <div className="leg-actions-row">
                            <div className="flex-1"></div>
                            <label className="checkbox-modern">
                              <input type="checkbox" checked={leg.crossDistrict} onChange={e => updateLeg(day.id, leg.id, 'crossDistrict', e.target.checked)} />
                              <span className="checkbox-box"></span>
                              <span>เดินทางข้ามเขต</span>
                            </label>
                          </div>
                        )}

                        {leg.isContinuation && (
                          <div className="continuation-info">
                            <ArrowRightLeft size={12} />
                            <span>เดินทางต่อเนื่อง (ข้ามวัน) - ไม่คิดเงินซ้ำ</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" className="btn-add-leg-full" onClick={() => addLegToDay(day.id)}>
                  <Plus size={18} /> เพิ่มรายการพาหนะในวันนี้
                </button>
              </div>
            ))}

            <div className="flex flex-col gap-4 mt-6">
              <div className="flex gap-4">
                <button type="button" onClick={addDay} className="btn-add-day-premium flex-1" style={{ margin: 0 }}>
                  <div className="btn-content">
                    <Calendar size={20} />
                    <div className="text-stack">
                      <span className="main-text" style={{ fontSize: '1rem' }}>เพิ่มวันเดินทางใหม่</span>
                    </div>
                  </div>
                  <Plus size={18} />
                </button>
                {formData.tripType === 'round-trip-auto' && (
                  <button type="button" className="btn-auto-reverse flex-1" onClick={generateReturnLegs} style={{ background: 'var(--accent)', color: 'black', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                    <ArrowRightLeft size={20} /> สร้างรายการขากลับอัตโนมัติ
                  </button>
                )}
              </div>


            </div>
          </div>

          <div className="form-actions-dual sticky-footer print-action">
            <button type="button" className="btn-secondary-large" onClick={() => onSave(formData)}>
              <Save size={24} /> บันทึกข้อมูล (Save)
            </button>
            <button type="submit" className="btn-primary-large">
              <Printer size={24} /> ดูตัวอย่างและพิมพ์ (Print)
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default TravelDisbursementForm;
