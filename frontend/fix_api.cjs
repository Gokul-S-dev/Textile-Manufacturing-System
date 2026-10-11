const fs = require('fs');
const path = require('path');

function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findFiles(filePath, fileList);
    } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = findFiles('d:/downloads/Textile Manufacturing System/frontend/src/pages');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('import axios from')) {
    content = content.replace(/import axios from 'axios';/g, "import api from '../services/api';");
    content = content.replace(/http:\/\/(localhost|192\.168\.137\.1):5000\/api\/v1/g, '');
    content = content.replace(/\/api\/v1/g, '');
    content = content.replace(/axios\./g, 'api.');
    content = content.replace(/, \{ withCredentials: true \}/g, '');
    content = content.replace(/, \{\s*headers: \{ Authorization: [^}]+\} \}/g, '');
    
    fs.writeFileSync(f, content);
    console.log('Fixed API usage in', f);
  }
});
