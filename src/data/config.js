export const DISBURSEMENT_CATEGORIES = [
  {
    id: 'travel-temp',
    title: 'การเดินทางไปราชการชั่วคราว',
    description: 'การเดินทางไปปฏิบัติราชการนอกที่ตั้งสำนักงานปกติ',
    icon: 'Plane',
    questions: [
      {
        id: 'transport',
        text: 'เดินทางโดยพาหนะประเภทใด?',
        options: [
          { label: 'รถยนต์ส่วนตัว', value: 'private-car' },
          { label: 'เครื่องบิน', value: 'plane' },
          { label: 'รถโดยสารประจำทาง/รถไฟ', value: 'public' }
        ]
      },
      {
        id: 'accommodation',
        text: 'มีการเบิกค่าที่พักหรือไม่?',
        options: [
          { label: 'เบิกจ่ายจริง', value: 'actual' },
          { label: 'เหมาจ่าย', value: 'flat' },
          { label: 'ไม่มีการค้างคืน', value: 'none' }
        ]
      }
    ],
    rules: [
      { 
        condition: { id: 'travel-temp' }, 
        require: [
          { text: 'แบบขออนุญาตไปราชการ / คำสั่งให้เดินทางไปราชการ', type: 'form' },
          { text: 'ใบเบิกค่าใช้จ่ายในการเดินทางไปราชการ (แบบ 8708)', type: 'form' },
          { text: 'ใบตราคุมงบประมาณ (ใบ GF)', type: 'evidence' }
        ] 
      },
      { 
        condition: { transport: 'private-car' }, 
        require: [
          { text: 'แบบขออนุญาตใช้ยานพาหนะส่วนตัวเดินทางไปราชการ (แบบ 10)', type: 'form' },
          { text: 'สำเนาคู่มือจดทะเบียนรถ (เล่มทะเบียน)', type: 'evidence' }
        ] 
      },
      { 
        condition: { transport: 'plane' }, 
        require: [
          { text: 'ใบเสร็จรับเงิน / ใบแจ้งหนี้ของบริษัทสายการบิน', type: 'evidence' },
          { text: 'กากตั๋วเดินทาง (Boarding Pass) หรือ E-Ticket', type: 'evidence' }
        ] 
      },
      { 
        condition: { transport: 'public' }, 
        require: [
          { text: 'ใบรับรองแทนใบเสร็จรับเงิน (แบบ บก.111) พร้อมระบุรายละเอียดเส้นทางและจำนวนเงิน', type: 'form' }
        ] 
      },
      { 
        condition: { accommodation: 'actual' }, 
        require: [
          { text: 'ใบเสร็จรับเงิน หรือ ใบแจ้งรายการ (Folio) ของโรงแรม', type: 'evidence' }
        ] 
      }
    ]
  },
  {
    id: 'travel-perm',
    title: 'การเดินทางไปราชการประจำ',
    description: 'การย้ายไปรับตำแหน่งใหม่ หรือการย้ายที่ตั้งสำนักงาน',
    icon: 'Home',
    questions: [
      {
        id: 'moving_stuff',
        text: 'มีการเบิกค่าขนย้ายสิ่งของเครื่องใช้หรือไม่?',
        options: [
          { label: 'เบิกค่าขนย้าย', value: 'yes' },
          { label: 'ไม่เบิก', value: 'no' }
        ]
      }
    ],
    rules: [
      { 
        condition: { id: 'travel-perm' }, 
        require: [
          { text: 'คำสั่งย้าย / คำสั่งให้ไปปฏิบัติราชการประจำ', type: 'evidence' },
          { text: 'ใบเบิกค่าใช้จ่ายในการเดินทางไปราชการ (แบบ 8708)', type: 'form' },
          { text: 'ใบตราคุมงบประมาณ (ใบ GF)', type: 'evidence' }
        ] 
      },
      { 
        condition: { id: 'travel-perm' }, 
        require: [
          { text: 'ใบเสร็จค่าโดยสารพาหนะ (เช่น เครื่องบิน, รถไฟ)', type: 'evidence' }
        ] 
      },
      { 
        condition: { moving_stuff: 'yes' }, 
        require: [
          { text: 'ใบเสร็จค่าขนย้ายสิ่งของเครื่องใช้ส่วนตัว', type: 'evidence' }
        ] 
      }
    ]
  },
  {
    id: 'return-home',
    title: 'การเดินทางกลับภูมิลำเนา',
    description: 'กรณีพ้นจากราชการหรือเกษียณอายุ',
    icon: 'MapPin',
    questions: [
      {
        id: 'moving_stuff',
        text: 'มีการเบิกค่าขนย้ายหรือไม่?',
        options: [
          { label: 'เบิกค่าขนย้าย', value: 'yes' },
          { label: 'ไม่เบิก', value: 'no' }
        ]
      }
    ],
    rules: [
      { 
        condition: { id: 'return-home' }, 
        require: [
          { text: 'คำสั่งให้ออกจากราชการ / ประกาศเกษียณอายุราชการ', type: 'evidence' },
          { text: 'ใบเบิกค่าใช้จ่ายในการเดินทางไปราชการ (แบบ 8708)', type: 'form' },
          { text: 'ใบตราคุมงบประมาณ (ใบ GF)', type: 'evidence' }
        ] 
      },
      { 
        condition: { id: 'return-home' }, 
        require: [
          { text: 'ใบเสร็จค่าโดยสารพาหนะกลับภูมิลำเนา', type: 'evidence' }
        ] 
      },
      { 
        condition: { moving_stuff: 'yes' }, 
        require: [
          { text: 'ใบเสร็จค่าขนย้ายสิ่งของกลับภูมิลำเนา', type: 'evidence' }
        ] 
      }
    ]
  }
];
