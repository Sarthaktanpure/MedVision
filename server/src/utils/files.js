const fs = require("fs");
const path = require("path");

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function saveBase64File({ base64, outputDir, fileName }) {
  ensureDir(outputDir);
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = path.join(outputDir, `${Date.now()}-${safeName}`);
  const buffer = Buffer.from(base64, "base64");
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

module.exports = {
  ensureDir,
  saveBase64File,
};
