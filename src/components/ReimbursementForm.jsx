import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Save, CheckCircle, ArrowLeft, Download, Plus, Trash2 } from 'lucide-react';

const ReimbursementForm = ({ request, onComplete, onCancel }) => {
  const [formData, setFormData] = useState(() => {
    // Flatten legs from itinerary for the reimbursement view
    const flattenedLegs = [];
    (request.itinerary || []).forEach(day => {
      (day.legs || []).forEach(leg => {
        flattenedLegs.push({ ...leg, date: day.date });
      });
    });

    return {
      ...request,
      actualStartDate: request.departDate || '',
      actualEndDate: request.returnDate || '',
      actualStartTime: request.departTime || '08:00',
      actualEndTime: request.returnTime || '17:00',
      actualLegs: flattenedLegs.map(l => ({ ...l, actualPrice: l.price || '' })),
      expenses: [
        { id: 1, type: 'per_diem', label: 'ค่าเบี้ยเลี้ยง', amount: '' },
        { id: 2, type: 'accommodation', label: 'ค่าที่พัก', amount: '' }
      ],
      groupExpenses: request.travelType === 'group' ? (request.team || []).map(m => ({
        ...m,
        perDiem: '',
        accommodation: '',
        transport: ''
      })) : []
    };
  });

  const handleActualPriceChange = (id, value) => {
    setFormData(prev => ({
      ...prev,
      actualLegs: prev.actualLegs.map(l => l.id === id ? { ...l, actualPrice: value } : l)
    }));
  };

  const handleGroupExpenseChange = (index, field, value) => {
    const newGroup = [...formData.groupExpenses];
    newGroup[index][field] = value;
    setFormData(prev => ({ ...prev, groupExpenses: newGroup }));
  };

  const totalAmount = () => {
    const legsTotal = formData.actualLegs.reduce((sum, l) => sum + Number(l.actualPrice || 0), 0);
    const individualTotal = formData.expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const groupTotal = formData.groupExpenses.reduce((sum, m) => 
      sum + Number(m.perDiem || 0) + Number(m.accommodation || 0) + Number(m.transport || 0), 0
    );
    return legsTotal + individualTotal + groupTotal;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="reimbursement-container"
    >
      <div className="glass-card form-card wide">
        <div className="form-header-with-back">
          <button className="back-btn-small" onClick={onCancel}><ArrowLeft size={16} /> กลับ</button>
          <h2 className="form-title">ระบบบันทึกข้อมูลการเบิกจ่าย (บก. 111 / 8708)</h2>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onComplete(formData); }}>
          <div className="form-grid-2">
            {/* Left Col: Info */}
            <div className="section-box secondary-bg">
              <div className="section-header">สรุปข้อมูลคำขอเดินทาง</div>
              <div className="info-grid">
                <p><strong>ชื่อโครงการ:</strong> {request.title}</p>
                <p><strong>ประเภทการเดินทาง:</strong> <span className="badge-small">{request.travelType === 'group' ? 'คณะเดินทาง' : 'รายบุคคล'}</span></p>
                <p><strong>วัตถุประสงค์:</strong> {request.purpose}</p>
                <p><strong>สถานที่:</strong> {request.destination}</p>
              </div>
            </div>

            {/* Right Col: Dates */}
            <div className="section-box dark-bg">
              <div className="section-header">วันเวลาที่ปฏิบัติราชการจริง</div>
              <div className="form-grid-2">
                <div className="input-group">
                  <label>วันที่/เวลา เริ่มเดินทางจริง (24 ชม.)</label>
                  <div className="flex-row gap-2">
                    <input type="date" value={formData.actualStartDate} onChange={e => setFormData({...formData, actualStartDate: e.target.value})} />
                    <input type="time" value={formData.actualStartTime} onChange={e => setFormData({...formData, actualStartTime: e.target.value})} lang="en-GB" />
                  </div>
                </div>
                <div className="input-group">
                  <label>วันที่/เวลา เดินทางกลับจริง (24 ชม.)</label>
                  <div className="flex-row gap-2">
                    <input type="date" value={formData.actualEndDate} onChange={e => setFormData({...formData, actualEndDate: e.target.value})} />
                    <input type="time" value={formData.actualEndTime} onChange={e => setFormData({...formData, actualEndTime: e.target.value})} lang="en-GB" />
                  </div>
                </div>
              </div>
              <p className="text-muted mt-2" style={{ fontSize: '0.8rem' }}>* ข้อมูลนี้จะใช้ในการคำนวณเบี้ยเลี้ยงและที่พักในใบเบิก</p>
            </div>
          </div>

          {/* Full Width: Transport Details */}
          <div className="section-box">
            <div className="section-header">รายละเอียดค่าพาหนะ (ระบุยอดที่จ่ายจริง)</div>
            <div className="actual-legs-list">
              {formData.actualLegs.map((leg, idx) => (
                <div key={leg.id} className="actual-leg-item">
                  <div className="leg-info">
                    <span className="font-bold">ช่วงที่ {idx + 1}: {leg.type}</span>
                    <span className="text-muted" style={{ marginLeft: '1rem' }}>{leg.from} → {leg.to}</span>
                    {leg.crossDistrict && <span className="badge-small" style={{ marginLeft: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>ข้ามเขต</span>}
                  </div>
                  <div className="input-inline">
                    <label>จ่ายจริง:</label>
                    <input 
                      type="number" 
                      className="cost-input"
                      value={leg.actualPrice} 
                      onChange={e => handleActualPriceChange(leg.id, e.target.value)}
                    />
                    <span className="unit">บาท</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Full Width: Expenses Table */}
          <div className="section-box">
            <div className="section-header">
              {formData.travelType === 'group' 
                ? 'บัญชีรายละเอียดรายบุคคล (แบบ 8708 ส่วนที่ 2)' 
                : 'รายละเอียดค่าใช้จ่ายอื่นๆ'}
            </div>
            
            {formData.travelType === 'group' ? (
              <div className="group-table-container">
                <table className="group-expense-table">
                  <thead>
                    <tr>
                      <th>ชื่อ-นามสกุล / ตำแหน่ง</th>
                      <th style={{ width: '150px' }}>เบี้ยเลี้ยง</th>
                      <th style={{ width: '150px' }}>ที่พัก</th>
                      <th style={{ width: '150px' }}>พาหนะ</th>
                      <th style={{ width: '120px' }}>รวม</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.groupExpenses.map((member, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="member-name font-bold">{member.name}</div>
                          <div className="member-pos text-muted" style={{ fontSize: '0.8rem' }}>{member.position}</div>
                        </td>
                        <td><input type="number" placeholder="0" value={member.perDiem} onChange={e => handleGroupExpenseChange(idx, 'perDiem', e.target.value)} /></td>
                        <td><input type="number" placeholder="0" value={member.accommodation} onChange={e => handleGroupExpenseChange(idx, 'accommodation', e.target.value)} /></td>
                        <td><input type="number" placeholder="0" value={member.transport} onChange={e => handleGroupExpenseChange(idx, 'transport', e.target.value)} /></td>
                        <td className="row-total font-bold text-accent">{(Number(member.perDiem) + Number(member.accommodation) + Number(member.transport)).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="form-grid-2">
                {formData.expenses.map(exp => (
                  <div key={exp.id} className="input-group-horizontal">
                    <span className="label-text">{exp.label}</span>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={exp.amount}
                      onChange={e => {
                        const newExp = formData.expenses.map(i => i.id === exp.id ? {...i, amount: e.target.value} : i);
                        setFormData({...formData, expenses: newExp});
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Grid: Total & Actions */}
          <div className="form-grid-2" style={{ alignItems: 'center' }}>
            <div className="total-summary-card" style={{ margin: 0, padding: '1rem 2rem' }}>
              <div className="total-label">ยอดรวมเงินขอเบิกทั้งสิ้น</div>
              <div className="total-amount" style={{ fontSize: '2.5rem' }}>{totalAmount().toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>บาท</span></div>
            </div>

            <div className="form-actions" style={{ marginTop: 0 }}>
              <button type="submit" className="btn-primary-large">
                <CheckCircle size={24} /> ยืนยันและพิมพ์เอกสาร <Download size={20} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ReimbursementForm;
