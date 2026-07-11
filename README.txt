GYOKOI HUB ADMIN API FILES

Upload these files and replace the old versions:
- admin.js
- config.js

Before upload:
1. Open config.js
2. Replace PASTE_YOUR_APPS_SCRIPT_EXEC_URL_HERE
3. Paste your Google Apps Script Web App URL ending in /exec

Example:
window.GYOKOI_ADMIN_CONFIG = {
  API_URL: "https://script.google.com/macros/s/XXXXXXXXXXXX/exec"
};

Do not put the password in config.js.
The password is checked by Google Apps Script.
