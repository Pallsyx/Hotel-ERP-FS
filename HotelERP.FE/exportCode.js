import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Lấy đường dẫn thư mục hiện tại (hỗ trợ ES Module)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputFile = 'ToanBoCodeFE.txt';
const rootDir = __dirname;

// Các thư mục và file không cần thiết phải xuất ra
const ignoreDirs = ['node_modules', '.git', 'dist', 'public', 'assets'];
const ignoreFiles = ['package-lock.json', outputFile, 'exportCode.js'];

// Chỉ lấy các file có đuôi này
const allowedExtensions = ['.js', '.jsx', '.css', '.json', '.html', '.cjs'];

// Xóa file cũ nếu đã tồn tại
if (fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile);
}

function scanAndAppend(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!ignoreDirs.includes(file)) {
                scanAndAppend(fullPath);
            }
        } else {
            const ext = path.extname(file);
            if (allowedExtensions.includes(ext) && !ignoreFiles.includes(file)) {
                const relativePath = path.relative(rootDir, fullPath);
                const content = fs.readFileSync(fullPath, 'utf8');
                
                // Tiêu đề phân cách giữa các file
                const header = `\n\n${'='.repeat(60)}\n--- FILE: ${relativePath.replace(/\\/g, '/')} ---\n${'='.repeat(60)}\n\n`;
                
                fs.appendFileSync(outputFile, header + content);
                console.log(`✅ Đã gộp: ${relativePath}`);
            }
        }
    });
}

console.log('🚀 Đang bắt đầu gom code...');
scanAndAppend(rootDir);
console.log(`\n🎉 HOÀN TẤT! Toàn bộ code đã được lưu vào file: ${outputFile}`);