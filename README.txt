GYOKOI HUB ADMIN — STATIC V1

ไฟล์ที่ต้องอัปขึ้น GitHub
- admin.html
- admin.css
- admin.js
- config.js

วิธีใช้
1. วางไฟล์ทั้งหมดไว้ใน root เดียวกับหน้า Hub
2. เปิด config.js
3. เปลี่ยน TEMP_PASSWORD จาก change-me-gyokoi เป็นรหัสที่ต้องการ
4. เข้าใช้งานผ่าน /admin.html

ระบบในเวอร์ชันนี้
- Login ด้วยรหัสผ่านชั่วคราว
- Add / Edit / Delete App
- Name
- Description
- Icon URL หรือ relative path
- URL
- Category
- Visible
- Order
- Search
- Preview
- บันทึกข้อมูลใน localStorage ของ browser

ข้อสำคัญ
GitHub Pages เป็นเว็บสาธารณะ จึงสามารถเปิดดู config.js ได้
รหัสผ่านนี้เหมาะสำหรับล็อกหน้าชั่วคราวเท่านั้น ไม่ใช่ระบบรักษาความปลอดภัยจริง
เมื่อทำ CMS ต่อ ให้ย้ายการตรวจรหัสและข้อมูลทั้งหมดไป Google Apps Script
