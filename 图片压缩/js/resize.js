// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const resizeBtn = document.getElementById('resizeBtn');
    const compressBtn = document.getElementById('compressBtn');
    const minesweeperBtn = document.getElementById('minesweeperBtn');
    const resizeSection = document.getElementById('resizeSection');
    const compressSection = document.getElementById('compressSection');
    const minesweeperSection = document.getElementById('minesweeperSection');
    const resizeDropZone = document.getElementById('resizeDropZone');
    const resizeFileInput = document.getElementById('resizeFileInput');
    const resizePreview = document.getElementById('resizePreview');
    const resizeList = document.getElementById('resizeList');
    const selectedCount = document.getElementById('selectedCount');
    const startResizeBtn = document.getElementById('startResizeBtn');
    const clearResizeBtn = document.getElementById('clearResizeBtn');

    // 存储待处理的图片
    let filesToResize = [];

    // 导航切换
    resizeBtn.addEventListener('click', () => {
        resizeBtn.classList.add('active');
        compressBtn.classList.remove('active');
        minesweeperBtn.classList.remove('active');
        resizeSection.style.display = 'block';
        compressSection.style.display = 'none';
        minesweeperSection.style.display = 'none';
    });

    compressBtn.addEventListener('click', () => {
        compressBtn.classList.add('active');
        resizeBtn.classList.remove('active');
        minesweeperBtn.classList.remove('active');
        compressSection.style.display = 'block';
        resizeSection.style.display = 'none';
        minesweeperSection.style.display = 'none';
    });

    minesweeperBtn.addEventListener('click', () => {
        minesweeperBtn.classList.add('active');
        compressBtn.classList.remove('active');
        resizeBtn.classList.remove('active');
        minesweeperSection.style.display = 'block';
        compressSection.style.display = 'none';
        resizeSection.style.display = 'none';
    });

    // 处理文件拖放
    if (resizeDropZone) {
        resizeDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            resizeDropZone.classList.add('dragover');
        });

        resizeDropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            resizeDropZone.classList.remove('dragover');
        });

        resizeDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            resizeDropZone.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
            handleFiles(files);
        });

        // 处理文件选择
        resizeDropZone.addEventListener('click', () => {
            if (resizeFileInput) {
                resizeFileInput.click();
            }
        });
    }

    if (resizeFileInput) {
        resizeFileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
            handleFiles(files);
        });
    }

    // 处理文件列表
    function handleFiles(files) {
        if (!files || files.length === 0) return;
        
        files.forEach(file => {
            if (!filesToResize.some(f => f.name === file.name)) {
                filesToResize.push(file);
                addFileToList(file);
            }
        });
        
        updateFileCount();
        if (resizePreview) {
            resizePreview.style.display = 'block';
        }
    }

    // 添加文件到列表
    function addFileToList(file) {
        if (!resizeList) return;

        const item = document.createElement('div');
        item.className = 'resize-item';
        item.dataset.name = file.name;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            item.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
                <button class="remove-btn" title="移除">×</button>
                <div class="resize-progress">
                    <div class="resize-progress-bar"></div>
                </div>
            `;
            
            // 添加移除按钮事件
            const removeBtn = item.querySelector('.remove-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    filesToResize = filesToResize.filter(f => f.name !== file.name);
                    item.remove();
                    updateFileCount();
                    if (filesToResize.length === 0 && resizePreview) {
                        resizePreview.style.display = 'none';
                    }
                });
            }
        };
        reader.readAsDataURL(file);
        resizeList.appendChild(item);
    }

    // 更新文件计数
    function updateFileCount() {
        if (selectedCount) {
            selectedCount.textContent = filesToResize.length;
        }
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 调整图片尺寸
    async function resizeImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 800;
                canvas.height = 800;
                const ctx = canvas.getContext('2d');
                
                // 计算缩放比例，保持宽高比
                const scale = Math.min(800 / img.width, 800 / img.height);
                const width = img.width * scale;
                const height = img.height * scale;
                
                // 计算居中位置
                const x = (800 - width) / 2;
                const y = (800 - height) / 2;
                
                // 绘制图片
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, 800, 800);
                ctx.drawImage(img, x, y, width, height);
                
                // 转换为 Blob
                canvas.toBlob(blob => {
                    resolve(new File([blob], file.name, {
                        type: file.type,
                        lastModified: Date.now()
                    }));
                }, file.type);
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }

    // 开始处理图片
    if (startResizeBtn) {
        startResizeBtn.addEventListener('click', async () => {
            if (filesToResize.length === 0) return;
            
            startResizeBtn.disabled = true;
            if (clearResizeBtn) {
                clearResizeBtn.disabled = true;
            }

            // 创建进度提示
            const progressInfo = document.createElement('div');
            progressInfo.className = 'progress-info';
            progressInfo.innerHTML = '<p>正在处理图片，请稍候...</p>';
            resizePreview.insertBefore(progressInfo, resizeList);
            
            try {
                // 创建 ZIP 文件
                const zip = new JSZip();
                let processedCount = 0;
                
                // 处理所有图片
                for (let i = 0; i < filesToResize.length; i++) {
                    const file = filesToResize[i];
                    const item = resizeList.querySelector(`[data-name="${file.name}"]`);
                    if (!item) continue;
                    
                    const progressBar = item.querySelector('.resize-progress-bar');
                    if (!progressBar) continue;
                    
                    try {
                        const resizedFile = await resizeImage(file);
                        zip.file(resizedFile.name, resizedFile);
                        
                        // 更新进度条
                        progressBar.style.width = '100%';
                        processedCount++;
                        
                        // 更新进度信息
                        progressInfo.innerHTML = `<p>正在处理图片 (${processedCount}/${filesToResize.length})...</p>`;
                    } catch (error) {
                        console.error('处理图片失败:', error);
                        if (progressBar) {
                            progressBar.style.background = '#FF3B30';
                        }
                    }
                }
                
                // 生成 ZIP 文件
                progressInfo.innerHTML = '<p>正在生成压缩包...</p>';
                const content = await zip.generateAsync({type: 'blob'});
                
                // 创建下载按钮
                const downloadContainer = document.createElement('div');
                downloadContainer.className = 'download-container';
                downloadContainer.innerHTML = `
                    <button id="downloadZipBtn" class="primary-btn download-zip-btn">
                        <span class="download-icon">📦</span>
                        下载所有图片 (${processedCount}张)
                    </button>
                `;
                
                // 替换进度信息为下载按钮
                progressInfo.replaceWith(downloadContainer);
                
                // 添加下载按钮事件
                const downloadZipBtn = document.getElementById('downloadZipBtn');
                if (downloadZipBtn) {
                    downloadZipBtn.addEventListener('click', () => {
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(content);
                        link.download = `resized_images_${new Date().toISOString().slice(0,10)}.zip`;
                        link.click();
                    });
                }
                
            } catch (error) {
                console.error('生成压缩包失败:', error);
                progressInfo.innerHTML = '<p class="error-message">处理失败，请重试</p>';
            } finally {
                startResizeBtn.disabled = false;
                if (clearResizeBtn) {
                    clearResizeBtn.disabled = false;
                }
            }
        });
    }

    // 清空列表
    if (clearResizeBtn) {
        clearResizeBtn.addEventListener('click', () => {
            filesToResize = [];
            if (resizeList) {
                resizeList.innerHTML = '';
            }
            if (resizePreview) {
                resizePreview.style.display = 'none';
            }
            updateFileCount();
        });
    }

    // 添加调试信息
    console.log('图片尺寸调整功能已初始化');
    console.log('上传区域元素:', resizeDropZone);
    console.log('文件输入元素:', resizeFileInput);
}); 