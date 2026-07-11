GYOKOI HUB — API CONNECTION

อัปทับไฟล์เดิม:
1. apps.js
2. script.js

ก่อนอัป:
- เปิด apps.js
- เปลี่ยน PASTE_YOUR_APPS_SCRIPT_EXEC_URL_HERE
- ใส่ Apps Script Web App URL ที่ลงท้ายด้วย /exec

ตัวอย่าง:
const HUB_API_URL =
  "https://script.google.com/macros/s/XXXXXXXXXXXX/exec";

สำคัญ:
- ใน index.html ต้องโหลด apps.js ก่อน script.js

ตัวอย่าง:
<script src="apps.js"></script>
<script src="script.js"></script>

ระบบจะ:
- ดึงข้อมูลจาก Google Sheet
- ใช้เฉพาะรายการ Visible
- เรียงตาม Order
- รองรับ Icon แบบตัวอักษร, URL หรือ path
- ถ้า API ล่ม จะใช้ข้อมูลเดิมแทน หน้าเว็บไม่หาย
