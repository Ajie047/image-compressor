// 密码验证相关元素
const loginSection = document.getElementById('loginSection');
const appContent = document.getElementById('appContent');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');

// 正确的密码
const CORRECT_PASSWORD = 'xiangjie';

// 检查是否已经登录
const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
if (isLoggedIn) {
    showApp();
}

// 密码验证
loginBtn.addEventListener('click', () => {
    const password = passwordInput.value.trim();
    if (password === 'xiangjie') {
        loginSection.style.display = 'none';
        appContent.style.display = 'block';
        // 清除密码输入
        passwordInput.value = '';
        loginError.textContent = '';
    } else {
        loginError.textContent = '密码错误，请重试';
        passwordInput.value = '';
    }
});

// 回车键验证
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loginBtn.click();
    }
});

function showApp() {
    loginSection.style.display = 'none';
    appContent.style.display = 'block';
}

// 获取DOM元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const uploadSection = document.getElementById('uploadSection');
const previewSection = document.getElementById('previewSection');
const originalImage = document.getElementById('originalImage');
const compressedImage = document.getElementById('compressedImage');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');

// 当前处理的图片文件
let currentFile = null;

// 绑定拖放事件
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#0071e3';
    dropZone.style.backgroundColor = '#f5f5f7';
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#86868b';
    dropZone.style.backgroundColor = 'white';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#86868b';
    dropZone.style.backgroundColor = 'white';
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImageUpload(file);
    }
});

// 点击上传
dropZone.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImageUpload(file);
    }
});

// 处理图片上传
function handleImageUpload(file) {
    currentFile = file;
    
    // 显示原始文件大小
    originalSize.textContent = formatFileSize(file.size);
    
    // 预览原始图片
    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage.src = e.target.result;
        // 压缩图片
        compressImage(e.target.result, qualitySlider.value / 100);
    };
    reader.readAsDataURL(file);
    
    // 显示预览区域
    uploadSection.style.display = 'none';
    previewSection.style.display = 'block';
}

// 压缩图片
function compressImage(base64Str, quality) {
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 保持原始尺寸
        canvas.width = img.width;
        canvas.height = img.height;
        
        // 绘制图片
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        // 压缩
        const compressedBase64 = canvas.toDataURL(currentFile.type, quality);
        
        // 显示压缩后的图片
        compressedImage.src = compressedBase64;
        
        // 计算压缩后的大小
        const compressedSize = Math.round((compressedBase64.length - 'data:image/png;base64,'.length) * 3/4);
        document.getElementById('compressedSize').textContent = formatFileSize(compressedSize);
    };
    img.src = base64Str;
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 质量滑块事件
qualitySlider.addEventListener('input', (e) => {
    const quality = e.target.value;
    qualityValue.textContent = quality + '%';
    if (currentFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
            compressImage(e.target.result, quality / 100);
        };
        reader.readAsDataURL(currentFile);
    }
});

// 下载按钮事件
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'compressed_' + currentFile.name;
    link.href = compressedImage.src;
    link.click();
});

// 重置按钮事件
resetBtn.addEventListener('click', () => {
    currentFile = null;
    fileInput.value = '';
    uploadSection.style.display = 'block';
    previewSection.style.display = 'none';
    originalImage.src = '';
    compressedImage.src = '';
    originalSize.textContent = '0 KB';
    compressedSize.textContent = '0 KB';
    qualitySlider.value = 80;
    qualityValue.textContent = '80%';
});

// 导航功能
document.addEventListener('DOMContentLoaded', () => {
    const compressBtn = document.getElementById('compressBtn');
    const resizeBtn = document.getElementById('resizeBtn');
    const minesweeperBtn = document.getElementById('minesweeperBtn');
    const compressSection = document.getElementById('compressSection');
    const resizeSection = document.getElementById('resizeSection');
    const minesweeperSection = document.getElementById('minesweeperSection');

    // 导航切换函数
    function switchSection(activeBtn, activeSection) {
        // 重置所有按钮状态
        [compressBtn, resizeBtn, minesweeperBtn].forEach(btn => {
            btn.classList.remove('active');
        });
        // 重置所有区域显示状态
        [compressSection, resizeSection, minesweeperSection].forEach(section => {
            section.style.display = 'none';
        });
        // 激活当前按钮和区域
        activeBtn.classList.add('active');
        activeSection.style.display = 'block';
    }

    // 添加导航按钮事件监听
    compressBtn.addEventListener('click', () => {
        switchSection(compressBtn, compressSection);
    });

    resizeBtn.addEventListener('click', () => {
        switchSection(resizeBtn, resizeSection);
    });

    minesweeperBtn.addEventListener('click', () => {
        switchSection(minesweeperBtn, minesweeperSection);
    });
}); 