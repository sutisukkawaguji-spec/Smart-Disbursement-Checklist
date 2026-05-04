import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Home, MapPin, ChevronRight, CheckCircle, ArrowLeft, FileText, ShieldCheck, PlusCircle, List, Edit, Printer, Download, Upload, Plus, Folder, Search, Database } from 'lucide-react';
import { DISBURSEMENT_CATEGORIES } from './data/config';
import TravelRequestForm from './components/TravelRequestForm';
import ReimbursementForm from './components/ReimbursementForm';
import PrintForms from './components/PrintForms';
import './App.css';

const IconMap = {
  Plane: Plane,
  Home: Home,
  MapPin: MapPin,
};

// --- Knowledge Base & Downloads Content ---
const KNOWLEDGE_BASE = [
  {
    title: "ผู้มีสิทธิเบิกค่าใช้จ่าย",
    timestamp: "00:32",
    items: [
      "ข้าราชการและลูกจ้างของรัฐ",
      "บุคคลในครอบครัว ผู้ติดตาม และบุคคลภายนอก (ตามเงื่อนไขเฉพาะ)",
      "สิทธิเกิดเมื่อได้รับอนุมัติจากผู้มีอำนาจก่อนเดินทางเท่านั้น"
    ]
  },
  {
    title: "ลักษณะการเดินทาง 3 ประเภท",
    timestamp: "01:08",
    items: [
      "ชั่วคราว: ไปปฏิบัติงานนอกที่ตั้ง/ช่วยราชการ (< 1 ปี)",
      "ประจำ: ย้ายสำนักงาน/ไปช่วยราชการ (> 1 ปี)",
      "กลับภูมิลำเนา: เกษียณ/ออกจากราชการ/เสียชีวิต"
    ]
  },
  {
    title: "อัตราเบี้ยเลี้ยง (เหมาจ่าย)",
    timestamp: "01:38",
    items: [
      "อัตรา 240 หรือ 270 บาท ต่อวัน/คน (ตามระดับตำแหน่ง)",
      "นับเวลา: ตั้งแต่ออกจากที่พัก/สำนักงาน จนกลับถึงที่พัก/สำนักงาน",
      "พักแรม: 24 ชม. = 1 วัน (เศษเกิน 12 ชม. ปัดเป็น 1 วัน)",
      "ไม่พักแรม: > 12 ชม. = 1 วัน / 6-12 ชม. = ครึ่งวัน"
    ]
  },
  {
    title: "อัตราค่าเช่าที่พัก",
    timestamp: "02:13",
    items: [
      "เหมาจ่าย: 800 หรือ 1,200 บาท ต่อวัน/คน",
      "จ่ายจริง: พักเดี่ยว/พักคู่ (หมู่คณะต้องพักคู่ 2 คน/ห้อง)",
      "ข้อยกเว้นพักเดี่ยว: ต่างเพศ, ไม่ใช่คู่สมรส, เป็นโรคติดต่อ"
    ]
  },
  {
    title: "พาหนะรับจ้าง & รถไฟ",
    timestamp: "02:56",
    items: [
      "แท็กซี่: ข้ามเขตจังหวัด/ผ่าน กทม. จ่ายจริงไม่เกิน 600 บาท",
      "เขตติดต่อจังหวัดอื่น: จ่ายจริงไม่เกิน 500 บาท",
      "รถไฟ: ระดับปฏิบัติการ/งาน เบิกได้ไม่เกินชั้น 2"
    ]
  },
  {
    title: "เครื่องบิน & รถส่วนตัว",
    timestamp: "03:18",
    items: [
      "เครื่องบิน: ระดับปฏิบัติการ/งาน ไม่มีสิทธิ (ยกเว้นเหตุเร่งด่วน)",
      "รถส่วนตัว: ต้องได้รับอนุมัติก่อนเดินทางเท่านั้น",
      "เงินชดเชย: รถยนต์ 4 บาท/กม. | จักรยานยนต์ 2 บาท/กม."
    ]
  }
];

const DOWNLOAD_CENTER = [
  {
    category: "แบบฟอร์มคำขอและรายงานหลัก",
    files: [
      { name: "ใบเบิกค่าใช้จ่ายในการเดินทาง (แบบ 8708)", type: "PDF/Excel", url: "#", id: "8708" },
      { name: "แบบขออนุมัติเดินทางไปราชการ (บันทึกข้อความ)", type: "Word", url: "#", id: "memo" },
      { name: "แบบขออนุญาตใช้ยานพาหนะส่วนตัว", type: "Word", url: "#", id: "car-perm" }
    ]
  },
  {
    category: "เอกสารหลักฐานประกอบ (แนบเบิก)",
    files: [
      { name: "ใบรับรองแทนใบเสร็จรับเงิน (แบบ บก.111)", type: "PDF/Excel", url: "#", id: "bk111" },
      { name: "ใบเสร็จค่าที่พัก / ใบแจ้งรายการ (Folio)", type: "Evidence", url: "#", id: "folio" },
      { name: "กากตั๋วเครื่องบิน (Boarding Pass) / E-Ticket", type: "Evidence", url: "#", id: "boarding" }
    ]
  },
  {
    category: "กฎหมายและระเบียบที่เกี่ยวข้อง",
    files: [
      { name: "พระราชกฤษฎีกาค่าใช้จ่ายในการเดินทางไปราชการ พ.ศ. 2526 และที่แก้ไขเพิ่มเติม", type: "Regulation", url: "#", id: "royal-decree" },
      { name: "ระเบียบกระทรวงการคลัง ว่าด้วยการเบิกค่าใช้จ่ายในการเดินทางไปราชการ พ.ศ. 2550 และที่แก้ไขเพิ่มเติม", type: "Regulation", url: "#", id: "mof-reg" }
    ]
  }
];

function App() {
  const [showNotice, setShowNotice] = useState(true);
  const [userRole, setUserRole] = useState('user'); // Default to user
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [activeView, setActiveView] = useState('menu'); // 'menu' | 'travel-request' | 'history' | 'reimbursement' | 'print-preview'
  const [travelRequests, setTravelRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const printRef = React.useRef();

  const [searchTerm, setSearchTerm] = useState('');
  const fileHandlesRef = React.useRef(new Map());

  const [downloadItems, setDownloadItems] = useState(DOWNLOAD_CENTER);

  // Load Dynamic Downloads
  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        const response = await fetch('/downloads/manifest.json');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setDownloadItems(data);
          }
        }
      } catch (e) {
        // Fallback to static DOWNLOAD_CENTER
      }
    };
    fetchDownloads();
  }, []);

  // Load from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('sdc_history_v2');

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTravelRequests(parsed);
        }
      } catch (e) { console.error("Failed to load history", e); }
    }
  }, []);

  // Save to localStorage
  React.useEffect(() => {
    localStorage.setItem('sdc_history_v2', JSON.stringify(travelRequests));
  }, [travelRequests]);

  const exportSingleRequest = (req) => {
    try {
      const dataStr = JSON.stringify(req, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileName = `${req.name}_${req.departDate}_${req.id.toString().slice(-4)}.json`.replace(/\s+/g, '_');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('เกิดข้อผิดพลาดในการบันทึกไฟล์');
    }
  };

  const exportHistory = () => {
    try {
      const dataStr = JSON.stringify(travelRequests, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sdc_all_history_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
    }
  };

  const handleImportFiles = async () => {
    if (window.showOpenFilePicker) {
      try {
        const handles = await window.showOpenFilePicker({
          multiple: true,
          types: [{
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] }
          }],
        });
        await processHandles(handles);
      } catch (err) {
        if (err.name !== 'AbortError') alert('เกิดข้อผิดพลาดในการเลือกไฟล์');
      }
    } else {
      document.getElementById('import-input')?.click();
    }
  };

  const handleImportFolder = async () => {
    if ('showDirectoryPicker' in window) {
      try {
        const directoryHandle = await window.showDirectoryPicker();
        const handles = [];

        async function scanDirectory(handle) {
          for await (const entry of handle.values()) {
            if (entry.kind === 'file' && entry.name.endsWith('.json')) {
              handles.push(entry);
            } else if (entry.kind === 'directory') {
              await scanDirectory(entry);
            }
          }
        }

        await scanDirectory(directoryHandle);

        if (handles.length === 0) {
          alert('ไม่พบไฟล์ .json ในโฟลเดอร์ที่เลือก');
          return;
        }

        await processHandles(handles);
        alert(`นำเข้าไฟล์จากโฟลเดอร์และโฟลเดอร์ย่อยเรียบร้อยแล้ว (${handles.length} ไฟล์)`);
      } catch (err) {
        if (err.name !== 'AbortError') alert('เกิดข้อผิดพลาดในการเลือกโฟลเดอร์: ' + err.message);
      }
    } else {
      alert('เบราว์เซอร์ของคุณไม่รองรับการนำเข้าโฟลเดอร์โดยตรง กรุณานำเข้าทีละไฟล์แทน');
    }
  };

  const processHandles = async (handles) => {
    for (const handle of handles) {
      const file = await handle.getFile();
      const content = await file.text();
      try {
        const imported = JSON.parse(content);
        const processItem = (item) => {
          if (item.id && item.name) {
            setTravelRequests(prev => {
              const existingIds = new Set(prev.map(r => r.id));
              if (!existingIds.has(item.id)) return [item, ...prev];
              return prev.map(r => r.id === item.id ? item : r);
            });
            fileHandlesRef.current.set(item.id, handle);
          }
        };

        if (Array.isArray(imported)) imported.forEach(processItem);
        else processItem(imported);
      } catch (err) {
        console.error('Error parsing file:', handle.name, err);
      }
    }
    alert('นำเข้าข้อมูลเรียบร้อยแล้ว');
  };

  const importHistory = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const imported = JSON.parse(evt.target.result);
          const processItem = (item) => {
            if (item.id && item.name) {
              setTravelRequests(prev => {
                const existingIds = new Set(prev.map(r => r.id));
                if (!existingIds.has(item.id)) return [item, ...prev];
                return prev.map(r => r.id === item.id ? item : r);
              });
            }
          };

          if (Array.isArray(imported)) {
            imported.forEach(processItem);
          } else {
            processItem(imported);
          }
        } catch (err) {
          console.error('Error importing file:', file.name);
        }
      };
      reader.readAsText(file);
    });
    alert('ดำเนินการนำเข้าข้อมูลเรียบร้อยแล้ว');
  };

  const handleLogin = (role) => {
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const category = useMemo(() =>
    DISBURSEMENT_CATEGORIES.find(c => c.id === selectedCategory),
    [selectedCategory]);

  const checklist = useMemo(() => {
    if (!category) return [];
    const forms = new Set();
    const evidence = new Set();

    // The mandatory base items are now handled within the category rules in config.js
    // to ensure they match the specific wording for each category.

    category.rules.forEach(rule => {
      const conditionMet = rule.condition.id === category.id ||
        Object.entries(rule.condition).every(([qId, val]) => answers[qId] === val);

      if (conditionMet) {
        rule.require.forEach(item => {
          if (item.type === 'form') forms.add(item.text);
          else evidence.add(item.text);
        });
      }
    });
    return {
      forms: Array.from(forms),
      evidence: Array.from(evidence)
    };
  }, [category, answers]);

  const handleSelectCategory = (id) => {
    setSelectedCategory(id);
    setActiveView('checklist');
    setAnswers({});
    setStep(0);
    setShowResult(false);
  };

  const saveToHistory = (data) => {
    try {
      const newRequest = {
        ...data,
        id: data.id || Date.now(),
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setTravelRequests(prev => {
        const current = Array.isArray(prev) ? prev : [];
        const exists = current.find(r => r.id === newRequest.id);
        if (exists) return current.map(r => r.id === newRequest.id ? newRequest : r);
        return [...current, newRequest];
      });
      return newRequest;
    } catch (e) {
      console.error("Save to history failed", e);
      return null;
    }
  };

  const handleTravelRequestComplete = (data) => {
    try {
      console.log("Completing travel request...", data);
      const saved = saveToHistory(data);
      if (!saved) throw new Error("Failed to save request");

      setSelectedRequest(saved);
      setActiveView('print-preview');
      window.scrollTo(0, 0);
    } catch (err) {
      console.error("Error in handleTravelRequestComplete:", err);
      alert("เกิดข้อผิดพลาดในการเตรียมเอกสาร: " + err.message);
    }
  };

  const handleSaveOnly = async (data) => {
    const isEdit = !!data.id;
    const saved = saveToHistory(data);

    if (saved) {
      // 1. Try to save to a known file handle if it exists
      const handle = fileHandlesRef.current.get(saved.id);
      if (handle) {
        try {
          const writable = await handle.createWritable();
          await writable.write(JSON.stringify(saved, null, 2));
          await writable.close();
          alert(`บันทึกการแก้ไขลงไฟล์เดิมเรียบร้อยแล้ว: ${handle.name}`);
          return;
        } catch (err) {
          console.error("Failed to save to handle", err);
        }
      }

      // 2. If no handle, try using the File System Access API (Picker)
      if (window.showSaveFilePicker) {
        try {
          const newHandle = await window.showSaveFilePicker({
            suggestedName: `${saved.name || 'travel'}_${saved.departDate || ''}.json`.replace(/\s+/g, '_'),
            types: [{
              description: 'JSON File',
              accept: { 'application/json': ['.json'] }
            }],
          });
          const writable = await newHandle.createWritable();
          await writable.write(JSON.stringify(saved, null, 2));
          await writable.close();
          fileHandlesRef.current.set(saved.id, newHandle);
          alert("บันทึกไฟล์ลงคอมพิวเตอร์เรียบร้อยแล้ว");
          return;
        } catch (err) {
          if (err.name === 'AbortError') return;
          console.error("Save Picker Error", err);
          // Fall through to traditional download
        }
      }

      // 3. Fallback: Direct download (legacy)
      exportSingleRequest(saved);
      alert("บันทึกข้อมูลเรียบร้อยแล้ว (ดาวน์โหลดไฟล์ลงเครื่อง)");
    }
  };

  const handleStartPrint = (req) => {
    setSelectedRequest(req);
    setActiveView('print-preview');
    window.scrollTo(0, 0);
  };

  const handleStartReimbursement = (req) => {
    setSelectedRequest(req);
    setActiveView('reimbursement');
    window.scrollTo(0, 0);
  };

  const handleReimbursementComplete = (data) => {
    setTravelRequests(prev => prev.map(r => r.id === data.id ? { ...data, status: 'reimbursed' } : r));
    setSelectedRequest(data);
    setActiveView('print-preview');
  };

  const handlePrint = () => {
    document.body.classList.add('printing-mode');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-mode');
    }, 500);
  };

  const handleAnswer = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const nextStep = () => {
    if (step < category.questions.length - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  const reset = () => {
    setSelectedCategory(null);
    setActiveView('menu');
    setAnswers({});
    setStep(0);
    setShowResult(false);
  };

  const handleAcceptNotice = () => {
    setShowNotice(false);
  };

  const logout = () => {
    setShowNotice(true);
    reset();
  };

  if (showNotice) {
    return (
      <div className="login-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card login-card"
          style={{ maxWidth: '850px', width: '95%' }}
        >
          <div className="login-header">
            <div style={{ marginBottom: '1.5rem' }}>
              <ShieldCheck size={64} className="accent-color" />
            </div>
            <h1 className="title-gradient" style={{ fontSize: '2.8rem', marginBottom: '0.25rem' }}>SDC System</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--accent)', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              Smart Disbursement Checklist
            </p>

            <button className="btn-primary-large pulse-effect" onClick={handleAcceptNotice} style={{ width: '100%', padding: '1.25rem', fontSize: '1.2rem' }}>
              เข้าสู่ระบบใช้งาน
            </button>
          </div>

          <div className="notice-content" style={{ marginTop: '2.5rem' }}>
            <div className="login-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div className="section-box accent-bg" style={{ padding: '1.5rem', borderRadius: '1.5rem', textAlign: 'left' }}>
                <h3 style={{ color: 'var(--accent)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
                  <CheckCircle size={20} /> วัตถุประสงค์โครงการ
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', opacity: 0.9, lineHeight: '1.7', margin: 0 }}>
                  เพื่ออำนวยความสะดวกให้แก่บุคลากรในการเตรียมเอกสารเบิกจ่ายค่าเดินทางไปราชการให้มีความถูกต้อง รวดเร็ว และเป็นไปตามระเบียบกระทรวงการคลังอย่างเคร่งครัด ช่วยลดความผิดพลาดในการกรอกข้อมูลและเพิ่มความโปร่งใสในกระบวนการเบิกจ่ายเงินงบประมาณของหน่วยงาน
                </p>
              </div>

              <div className="section-box" style={{ padding: '1.5rem', borderRadius: '1.5rem', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.15)', textAlign: 'left' }}>
                <h3 style={{ color: 'var(--accent)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
                  <ShieldCheck size={20} /> ระบบความปลอดภัยข้อมูล
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', opacity: 0.9, lineHeight: '1.7', margin: 0 }}>
                  ข้อมูลส่วนบุคคลและรายละเอียดการเดินทางทั้งหมดจะถูกประมวลผลและจัดเก็บไว้ภายในหน่วยความจำเครื่องคอมพิวเตอร์ (Local Storage) ของท่านเท่านั้น ระบบจะไม่มีการส่งต่อข้อมูลไปยังเซิร์ฟเวอร์ภายนอก เพื่อรักษาความลับทางราชการและความเป็นส่วนตัวสูงสุดของเจ้าหน้าที่ผู้ใช้งาน 🔒
                </p>
              </div>
            </div>

            <div className="section-box" style={{ padding: '1.25rem', borderRadius: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>
                อ้างอิง: พระราชกฤษฎีกาค่าใช้จ่ายในการเดินทางไปราชการ พ.ศ. 2526 และ ระเบียบกระทรวงการคลังว่าด้วยการเบิกค่าใช้จ่ายในการเดินทางไปราชการ พ.ศ. 2550 (และที่แก้ไขเพิ่มเติมทุกฉบับ)
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <div className="logo" onClick={reset} style={{ cursor: 'pointer' }}>
          <ShieldCheck size={32} className="accent-color" />
          <h1 className="title-gradient">SDC System</h1>
        </div>
        <div className="header-actions">
          <div className="flex flex-col items-end gap-2">
            <div className="badge">Smart Disbursement Checklist</div>
            <button
              className="btn-manual-pill"
              onClick={() => setActiveView('user-manual')}
            >
              <FileText size={16} />
              <span>คู่มือการใช้งานระบบ</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        {(() => {
          switch (activeView) {
            case 'menu':
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="dashboard-container"
                >
                  <div className="main-cards-grid">
                    {DISBURSEMENT_CATEGORIES.map(cat => {
                      const Icon = IconMap[cat.icon] || FileText;
                      return (
                        <button key={cat.id} className={`main-card ${cat.id}`} onClick={() => handleSelectCategory(cat.id)}>
                          <div className="card-icon">
                            <Icon size={48} />
                          </div>
                          <div className="card-content">
                            <h3>{cat.title}</h3>
                            <p>{cat.description}</p>
                          </div>
                          <ChevronRight className="card-arrow" />
                        </button>
                      );
                    })}

                    <button className="main-card docs" onClick={() => setActiveView('knowledge-center')}>
                      <div className="card-icon">
                        <FileText size={48} />
                      </div>
                      <div className="card-content">
                        <h3>สาระน่ารู้และเอกสารดาวน์โหลด</h3>
                        <p>สรุปหลักเกณฑ์การเบิกจ่ายและแบบฟอร์มที่เกี่ยวข้อง</p>
                      </div>
                      <ChevronRight className="card-arrow" />
                    </button>
                  </div>

                  <div className="quick-actions mini" style={{ justifyContent: 'center', marginTop: '3rem', gap: '1.5rem' }}>
                    <button className="btn-premium" onClick={() => { setSelectedRequest(null); setActiveView('travel-request'); }} style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                      <PlusCircle size={24} />
                      <span>สร้างแบบฟอร์มใหม่</span>
                    </button>
                    <button className="btn-premium-success" onClick={() => setActiveView('history')} style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                      <List size={24} />
                      <span>ดูประวัติการเบิกจ่าย ({travelRequests.length})</span>
                    </button>
                  </div>
                </motion.div>
              );

            case 'travel-request':
              return (
                <div className="workflow-container">
                  <div className="flex items-center gap-4 mb-8">
                    <button className="back-btn-circle" onClick={reset}><ArrowLeft size={22} /></button>
                    <h2 className="m-0 flex items-center gap-3">
                      <PlusCircle size={28} className="text-accent" />
                      สร้างแบบฟอร์มขออนุมัติเดินทาง
                    </h2>
                  </div>
                  <TravelRequestForm
                    onComplete={handleTravelRequestComplete}
                    onSave={handleSaveOnly}
                    initialData={selectedRequest}
                  />
                </div>
              );

            case 'history':
              return (
                <div className="history-view">
                  <div className="history-header">
                    <div className="flex items-center justify-between mb-8">
                      {/* Top Row Left: Back & Title */}
                      <div className="flex items-center gap-4">
                        <button className="back-btn-circle" onClick={reset}><ArrowLeft size={22} /></button>
                        <h2 className="m-0 flex items-center gap-3">
                          <List size={28} className="text-accent" />
                          ประวัติการเบิกจ่าย
                        </h2>
                      </div>

                      {/* Top Row Right: Actions */}
                      <div className="flex gap-3 flex-nowrap">
                        <button className="btn-secondary-small whitespace-nowrap" onClick={handleImportFiles} title="นำเข้าไฟล์ .json">
                          <FileText size={18} className="text-blue-400" /> <span className="btn-text">นำเข้าไฟล์</span>
                        </button>
                        <button className="btn-secondary-small whitespace-nowrap" onClick={handleImportFolder} title="นำเข้าโฟลเดอร์">
                          <Folder size={18} className="text-indigo-400" /> <span className="btn-text">นำเข้าโฟลเดอร์</span>
                        </button>
                        <button className="btn-premium whitespace-nowrap" style={{ padding: '0.6rem 1.25rem', minWidth: 'auto' }} onClick={exportHistory} title="สำรองข้อมูลประวัติลง PC">
                          <Database size={18} /> <span className="btn-text">สำรองข้อมูลประวัติลง PC</span>
                        </button>
                      </div>
                    </div>

                    {/* Bottom Row: Full Width Search Bar */}
                    <div className="search-container" style={{ maxWidth: 'none' }}>
                      <Search className="search-icon-inside" size={20} />
                      <input
                        type="text"
                        placeholder="ค้นหาตามชื่อผู้เดินทาง, สถานที่ หรือเลขที่คำสั่ง..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                      />
                    </div>
                    <input id="import-input" type="file" multiple accept=".json" onChange={importHistory} className="hidden" />
                  </div>

                  <div className="history-grid mt-6">
                    {travelRequests
                      .filter(req =>
                        (req.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (req.destination || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (req.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map(req => (
                        <div key={req.id} className="history-card-v2 glass-card">
                          <div className="card-header">
                            <div className="flex flex-col">
                              <span className="card-date">{new Date(req.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}</span>
                              <h4 className="card-title">{req.name || 'ไม่ระบุชื่อ'}</h4>
                            </div>
                            <span className={`travel-type-tag ${req.travelType}`}>{req.travelType === 'group' ? 'คณะเดินทาง' : 'รายบุคคล'}</span>
                          </div>
                          <div className="card-body">
                            <div className="meta-item"><MapPin size={12} /> {req.destination || 'ไม่ได้ระบุสถานที่'}</div>
                            <div className="meta-item"><FileText size={12} /> {req.orderNumber || 'ไม่มีเลขที่คำสั่ง'}</div>
                          </div>
                          <div className="card-actions">
                            <button className="btn-history-pill print" onClick={() => handleStartPrint(req)}>
                              <Printer size={14} /> พิมพ์
                            </button>
                            <button className="btn-history-pill reimburse" onClick={() => handleStartReimbursement(req)}>
                              <FileText size={14} /> เบิกจ่าย
                            </button>
                            <button className="btn-history-pill edit" onClick={() => {
                              setSelectedRequest(req);
                              setActiveView('travel-request');
                            }}>
                              <Edit size={14} /> แก้ไข
                            </button>
                            <button className="btn-history-pill save" onClick={() => exportSingleRequest(req)} title="บันทึกลงเครื่อง">
                              <Download size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    {travelRequests.length === 0 && (
                      <div className="col-span-full text-center py-20 opacity-50">
                        <List size={48} className="mx-auto mb-4" />
                        <p>ยังไม่มีประวัติการขออนุมัติในระบบ</p>
                      </div>
                    )}
                  </div>
                </div>
              );

            case 'reimbursement':
              return (
                <div className="workflow-container">
                  <div className="flex items-center gap-4 mb-8">
                    <button className="back-btn-circle" onClick={() => setActiveView('history')}><ArrowLeft size={22} /></button>
                    <h2 className="m-0 flex items-center gap-3">
                      <FileText size={28} className="text-accent" />
                      เบิกจ่ายเงินค่าใช้จ่ายเดินทาง
                    </h2>
                  </div>
                  <ReimbursementForm
                    request={selectedRequest}
                    onComplete={handleReimbursementComplete}
                    onCancel={() => setActiveView('history')}
                  />
                </div>
              );

            case 'print-preview':
              return (
                <div className="print-preview-mode w-full max-w-none">
                  <div className="workflow-container mb-6 no-print">
                    <div className="white-bg-actions">
                      <button className="btn-white-premium" onClick={reset}>
                        <Home size={20} className="text-blue-500" /> หน้าหลัก
                      </button>
                      <button className="btn-white-premium" onClick={() => setActiveView('history')}>
                        <List size={20} className="text-emerald-500" /> กลับรายการบันทึก
                      </button>

                      <div className="flex gap-3">
                        <button className="btn-white-premium" onClick={() => setActiveView('travel-request')}>
                          <Edit size={20} className="text-amber-500" /> แก้ไขข้อมูล
                        </button>
                        <button className="btn-primary-large pulse-effect" style={{ padding: '0.8rem 2.5rem', width: 'auto', borderRadius: '1rem' }} onClick={handlePrint}>
                          <Printer size={22} /> พิมพ์เอกสารทั้งหมด
                        </button>
                      </div>
                    </div>
                  </div>
                  <PrintForms data={selectedRequest} ref={printRef} />
                </div>
              );

            case 'checklist':
              return (
                <div className="workflow-container">
                  <div className="flex justify-between items-center mb-8">
                    <button className="back-btn-circle" onClick={reset}><ArrowLeft size={22} /></button>
                    <h2 className="m-0 flex items-center gap-3">
                      <CheckCircle size={28} className="text-accent" />
                      ตรวจสอบรายการเอกสาร
                    </h2>
                    <div style={{ width: '46px' }}></div> {/* Spacer to keep title centered */}
                  </div>

                  <AnimatePresence mode="wait">
                    {!showResult ? (
                      <motion.div
                        key="question"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="glass-card questionnaire"
                      >
                        <div className="progress">
                          <div
                            className="progress-fill"
                            style={{ width: `${((step + 1) / category.questions.length) * 100}%` }}
                          />
                        </div>

                        <span className="step-count">คำถามที่ {step + 1} จาก {category.questions.length}</span>
                        <h2>{category.questions[step].text}</h2>

                        <div className="options-list">
                          {category.questions[step].options.map((opt) => (
                            <button
                              key={opt.value}
                              className={`option-item ${answers[category.questions[step].id] === opt.value ? 'active' : ''}`}
                              onClick={() => handleAnswer(category.questions[step].id, opt.value)}
                            >
                              <div className="radio-circle" />
                              {opt.label}
                            </button>
                          ))}
                        </div>

                        <button
                          className="btn-primary full-width"
                          disabled={!answers[category.questions[step].id]}
                          onClick={nextStep}
                        >
                          {step === category.questions.length - 1 ? 'ดูรายการเอกสาร' : 'ถัดไป'}
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card result-card"
                      >
                        <div className="result-header">
                          <div className="success-icon">
                            <CheckCircle size={48} />
                          </div>
                          <h2>รายการเอกสารที่ต้องเตรียม</h2>
                          <p>ประเภท: {category.title}</p>
                        </div>

                        <div className="checklist-items printable-checklist">
                          <div className="print-only" style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2px solid black', paddingBottom: '0.75rem' }}>
                            <h2 style={{ fontSize: '18pt', fontWeight: 'bold', margin: 0 }}>รายการตรวจสอบเอกสารประกอบการเบิกจ่าย</h2>
                            <p style={{ fontSize: '12pt', marginTop: '0.25rem' }}>หมวด: {category.title}</p>
                          </div>
                          {checklist.forms.length > 0 && (
                            <div className="checklist-group">
                              <h3 className="group-title"><FileText size={18} /> แบบฟอร์มที่ต้องกรอก (Forms)</h3>
                              {checklist.forms.map((item, index) => (
                                <motion.div
                                  key={`form-${index}`}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="checklist-item"
                                >
                                  <div className="print-checkbox"></div>
                                  <span>{item}</span>
                                </motion.div>
                              ))}
                            </div>
                          )}

                          {checklist.evidence.length > 0 && (
                            <div className="checklist-group mt-4">
                              <h3 className="group-title"><ShieldCheck size={18} /> เอกสารประกอบ / หลักฐาน (Evidence)</h3>
                              {checklist.evidence.map((item, index) => (
                                <motion.div
                                  key={`doc-${index}`}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="checklist-item"
                                >
                                  <div className="print-checkbox"></div>
                                  <span>{item}</span>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="result-actions" style={{ flexDirection: 'column', gap: '1rem' }}>
                          <button className="btn-primary-large pulse-effect" onClick={() => setActiveView('travel-request')} style={{ width: '100%' }}>
                            <PlusCircle size={20} /> สร้างแบบฟอร์มขออนุมัติเดินทาง
                          </button>
                          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                            <button className="btn-outline flex items-center justify-center gap-2" style={{ flex: 1, borderRadius: '2rem' }} onClick={reset}>
                              <ArrowLeft size={18} /> กลับสู่หน้าหลัก
                            </button>
                            <button className="btn-outline flex items-center justify-center gap-2" style={{ flex: 1, borderRadius: '2rem' }} onClick={() => window.print()}>
                              <Printer size={18} /> พิมพ์รายการเอกสาร
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );

            case 'knowledge-center':
              return (
                <div className="workflow-container">
                  <div className="flex justify-between items-center mb-32">
                    <button className="back-btn-circle" onClick={reset}><ArrowLeft size={22} /></button>
                    <h2 className="m-0 flex items-center gap-3">
                      <ShieldCheck size={28} className="text-accent" />
                      สาระน่ารู้และเอกสารดาวน์โหลด
                    </h2>
                    <div style={{ width: '46px' }}></div> {/* Spacer */}
                  </div>

                  <div className="knowledge-container">
                    {/* Knowledge Section */}
                    <section className="knowledge-section">
                      <h2><CheckCircle size={24} /> สรุปหลักเกณฑ์การเบิกจ่าย (สาระน่ารู้)</h2>
                      <div className="knowledge-grid">
                        {KNOWLEDGE_BASE.map((item, idx) => (
                          <div key={idx} className="info-card">
                            <h4>
                              {item.title}
                            </h4>
                            <ul>
                              {item.items.map((li, lidx) => <li key={lidx}>{li}</li>)}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Downloads Section */}
                    <section className="knowledge-section">
                      <h2><Download size={24} /> ศูนย์ดาวน์โหลดแบบฟอร์ม (Download Center)</h2>
                      <div className="knowledge-grid">
                        {downloadItems.map((group, gidx) => (
                          <div key={gidx} className="download-group">
                            <h3 className="mb-4 text-accent" style={{ fontSize: '1.1rem' }}>{group.category}</h3>
                            <div className="download-list">
                              {group.files.map((file, fidx) => (
                                <a key={fidx} href={file.url} className="download-item">
                                  <div className="doc-info">
                                    <FileText className="download-icon" size={20} />
                                    <span>{file.name}</span>
                                  </div>
                                  <div className="download-action">
                                    <span>{file.type}</span>
                                    <Download size={14} />
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Credits Section - Single Block Version */}
                    <section className="knowledge-section no-print">
                      <div className="text-center mb-6">
                        <h2 className="justify-center mb-1"><ShieldCheck size={32} /> คณะผู้จัดทำโครงการ (Credits)</h2>
                        <p className="text-accent opacity-80" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                          โครงการ "เก่ง" สำนักงานธนารักษ์พื้นที่หนองบัวลำภู
                        </p>
                        <p className="opacity-60 text-sm mt-2">
                          ระบบ Smart Disbursement Checklist (SDC) <br />
                          เครื่องมือช่วยตรวจสอบและจัดทำเอกสารเบิกจ่ายการเดินทางไปราชการอย่างมืออาชีพ
                        </p>
                      </div>

                      <div className="info-card" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '2rem' }}>
                        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
                          <p className="mb-4">
                            <strong className="text-accent">ที่ปรึกษาโครงการ</strong><br />
                            นางศุภมาส สิงสำราญ (ข้าราชการเกษียณ / บุคคลดีเด่น)
                          </p>

                          <p className="mb-4">
                            <strong className="text-accent">ผู้อำนวยการโครงการ (Project Manager)</strong><br />
                            ว่าที่ร้อยตรีวาสิทธิ์ นนทสิน (ธนารักษ์พื้นที่หนองบัวลำภู)
                          </p>

                          <p className="mb-4">
                            <strong className="text-accent">ผู้ประสานงานหลัก (Scrum Master)</strong><br />
                            นางสาวเกษราภรณ์ โสมศรีแพง (นักประเมินราคาทรัพย์สินปฏิบัติการ)
                          </p>

                          <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <strong className="text-accent block mb-3">คณะทำงานและทีมพัฒนาระบบ (Project Team)</strong>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                              <span>นางสาวเบ็ญจวรรณ แสงสุวรรณ (นักประเมินราคาทรัพย์สินชำนาญการ)</span>
                              <span>นายภาคภูมิ ศรีดารา (เจ้าหน้าที่จัดผลประโยชน์ชำนาญการ)</span>
                              <span>นางสาวสุกัญญา ไปปอด (นักวิเคราะห์นโยบายและแผน)</span>
                              <span>นางสาวจุฑามณี เทียงปา (เจ้าหน้าที่จัดผลประโยชน์)</span>
                              <span>นางสาวสุพัตรา ผิวเพชร (เจ้าหน้าที่จัดผลประโยชน์)</span>
                              <span>นายสุธิศักดิ์ คาวากุจิ (นายช่างสำรวจ)</span>
                              <span>นายสุวัตน์ สุราช (เจ้าหน้าที่จัดผลประโยชน์)</span>
                              <span>นางสาวสุพัตรา บุญหล้า (เจ้าหน้าที่จัดผลประโยชน์)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                    
                    {/* Bottom Action Section */}
                    <div className="mt-12 text-center no-print pb-10">
                      <button className="btn-outline flex items-center justify-center gap-2 mx-auto" onClick={reset} style={{ padding: '0.8rem 2.5rem', borderRadius: '2rem' }}>
                        <ArrowLeft size={18} /> กลับสู่หน้าหลัก
                      </button>
                    </div>
                  </div>
                </div>
              );

            case 'user-manual':
              return (
                <div className="workflow-container">
                  <div className="flex justify-between items-center mb-10">
                    <button className="back-btn-circle" onClick={reset}><ArrowLeft size={22} /></button>
                    <div className="text-center">
                      <h2 className="m-0 flex items-center justify-center gap-3 title-gradient" style={{ fontSize: '2.2rem' }}>
                        <FileText size={36} className="text-accent" />
                        คู่มือการใช้งานระบบ SDC
                      </h2>
                      <p className="opacity-60 mt-1">Smart Disbursement Checklist - ธนารักษ์พื้นที่หนองบัวลำภู</p>
                    </div>
                    <div style={{ width: '46px' }}></div>
                  </div>

                  <div className="knowledge-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    {/* Welcome Section */}
                    <div className="section-box text-center mb-10" style={{ marginTop: '3rem', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), transparent)' }}>
                      <h3 className="text-accent mb-3">เปลี่ยนการเบิกจ่ายให้เป็นเรื่อง "ง่าย" และ "ถูกต้อง"</h3>
                      <p className="text-muted leading-relaxed">
                        ระบบ SDC ถูกออกแบบมาเพื่อลดความผิดพลาดในการเตรียมเอกสารและการคำนวณเบี้ยเลี้ยง
                        โดยอ้างอิงตามระเบียบกระทรวงการคลังล่าสุด ท่านสามารถทำตามขั้นตอนด้านล่างนี้เพื่อเริ่มต้นใช้งาน
                      </p>
                    </div>

                    {/* Step-by-Step Details */}
                    <div className="manual-detailed-grid">
                      <div className="manual-detail-card">
                        <div className="detail-header">
                          <div className="detail-num">1</div>
                          <h4>ตรวจสอบรายการเอกสาร (Checklist)</h4>
                        </div>
                        <div className="detail-body">
                          <p>เริ่มต้นด้วยการเลือก <strong>"ประเภทการเดินทาง"</strong> ในหน้าหลัก (เช่น ไปราชการคนเดียว หรือ ไปเป็นคณะ) จากนั้นตอบคำถามสั้นๆ 2-3 ข้อ</p>
                          <ul className="mini-tips">
                            <li>✅ ระบบจะแสดงรายการเอกสารที่ต้องใช้จริง</li>
                            <li>✅ สามารถสั่งพิมพ์รายการเพื่อใช้ตรวจสอบหน้าซองเอกสารได้</li>
                          </ul>
                        </div>
                      </div>

                      <div className="manual-detail-card">
                        <div className="detail-header">
                          <div className="detail-num">2</div>
                          <h4>สร้างแบบฟอร์มขออนุมัติ (Form Entry)</h4>
                        </div>
                        <div className="detail-body">
                          <p>คลิกปุ่ม <strong>"สร้างแบบฟอร์มใหม่"</strong> เพื่อกรอกข้อมูลพื้นฐานและแผนการเดินทาง (Itinerary)</p>
                          <ul className="mini-tips">
                            <li>🚀 <strong>ระบบช่วยคำนวณ:</strong> เพียงกรอกวัน/เวลา ไป-กลับ ระบบจะนับวันเบี้ยเลี้ยงให้ทันที</li>
                            <li>🔄 <strong>ขากลับอัตโนมัติ:</strong> หากเดินทางไป-กลับเส้นทางเดิม ใช้ปุ่ม "สร้างขากลับอัตโนมัติ" เพื่อประหยัดเวลา</li>
                          </ul>
                        </div>
                      </div>

                      <div className="manual-detail-card">
                        <div className="detail-header">
                          <div className="detail-num">3</div>
                          <h4>ดูตัวอย่างและสั่งพิมพ์ (Print Preview)</h4>
                        </div>
                        <div className="detail-body">
                          <p>เมื่อกรอกข้อมูลครบถ้วน ระบบจะจัดเตรียมแบบฟอร์ม <strong>8708 (ส่วนที่ 1 และ 2)</strong> รวมถึง <strong>บก.111</strong> ให้โดยอัตโนมัติ</p>
                          <ul className="mini-tips">
                            <li>📄 ตรวจสอบความถูกต้องในหน้า Preview ก่อนกดพิมพ์</li>
                            <li>🖨️ ระบบปรับแต่งหน้ากระดาษให้เหมาะสมกับการพิมพ์ราชการแล้ว</li>
                          </ul>
                        </div>
                      </div>

                      <div className="manual-detail-card highlight-accent">
                        <div className="detail-header">
                          <div className="detail-num">4</div>
                          <h4>ความปลอดภัยและการสำรองข้อมูล</h4>
                        </div>
                        <div className="detail-body">
                          <p>สำคัญที่สุด! ข้อมูลของท่าน <strong>"ไม่ถูกเก็บไว้บนอินเทอร์เน็ต"</strong> แต่จะอยู่ในคอมพิวเตอร์เครื่องนี้เท่านั้น</p>
                          <ul className="mini-tips">
                            <li>💾 <strong>สำรองข้อมูล:</strong> ในหน้าประวัติ ให้ใช้ปุ่ม "สำรองข้อมูลประวัติ" เพื่อเก็บไฟล์ไว้ใน Flash Drive หรือ PC</li>
                            <li>📂 <strong>นำเข้าข้อมูล:</strong> ท่านสามารถนำไฟล์ที่สำรองไว้กลับมาแก้ไขหรือพิมพ์ใหม่ได้เสมอ</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Footer Warning */}
                    <div className="section-box accent-bg mt-10 text-center">
                      <p className="m-0">
                        <ShieldCheck size={20} style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--accent)' }} />
                        <strong>คำแนะนำ:</strong> หากท่านล้างประวัติการเข้าชมเบราว์เซอร์ (Clear Cache) ข้อมูลอาจสูญหายได้ โปรดหมั่นสำรองข้อมูลเป็นประจำ
                      </p>
                    </div>
                  </div>
                </div>
              );

            default:
              return <div>View not found</div>;
          }
        })()}
      </main>

      <footer className="app-footer">
        <p>© 2026 SDC System - ธนารักษ์พื้นที่หนองบัวลำภู</p>
      </footer>
    </div>
  );
}

export default App;
