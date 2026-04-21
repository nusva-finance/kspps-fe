const fs = require('fs');
const path = require('path');

// 1. Tentukan nama file hasil gabungan
const outputFilename = 'gabungan_kspps_fe.txt';

// 2. Tentukan folder mana saja yang ingin digabung 
// (Biasanya frontend ada di folder src, app, atau pages)
const targetFolders = ['./src', './app', './pages', './components', './utils', './store', './context', './hooks'];

// 3. Tentukan ekstensi file yang ingin diambil
const allowedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.html'];

// Hapus file output lama jika ada
if (fs.existsSync(outputFilename)) {
    fs.unlinkSync(outputFilename);
}

// Fungsi untuk menelusuri folder secara rekursif
function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

// Proses penggabungan
let fileStream = fs.createWriteStream(outputFilename, { flags: 'a' });

targetFolders.forEach(folder => {
    if (!fs.existsSync(folder)) {
        console.log(`Melewati ${folder} (folder tidak ditemukan)`);
        return;
    }

    walkDir(folder, function(filePath) {
        const ext = path.extname(filePath);
        if (allowedExtensions.includes(ext)) {
            const header = `\n\n============================================================\nFILE: ${filePath}\n============================================================\n\n`;
            fileStream.write(header);
            
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                fileStream.write(content);
            } catch (err) {
                fileStream.write(`// Error membaca file: ${err}\n`);
            }
        }
    });
});

fileStream.end();
console.log(`\n✅ Selesai bro! File berhasil digabung dan disimpan di: ${outputFilename}`);