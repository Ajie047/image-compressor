// 图片编辑功能
document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const editorDropZone = document.getElementById('editorDropZone');
    const editorFileInput = document.getElementById('editorFileInput');
    const editorWorkspace = document.getElementById('editorWorkspace');
    const editorCanvas = document.getElementById('editorCanvas');
    const ctx = editorCanvas.getContext('2d');
    
    const textInput = document.getElementById('textInput');
    const fontFamily = document.getElementById('fontFamily');
    const fontSize = document.getElementById('fontSize');
    const fontColor = document.getElementById('fontColor');
    const boldBtn = document.getElementById('boldBtn');
    const underlineBtn = document.getElementById('underlineBtn');
    const letterSpacing = document.getElementById('letterSpacing');
    const letterSpacingValue = document.getElementById('letterSpacingValue');
    const colorPickerBtn = document.getElementById('colorPickerBtn');
    const addTextBtn = document.getElementById('addTextBtn');
    const updateTextBtn = document.getElementById('updateTextBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const resetEditorBtn = document.getElementById('resetEditorBtn');
    const downloadEditedBtn = document.getElementById('downloadEditedBtn');
    const textAreaItems = document.getElementById('textAreaItems');
    const controls = document.querySelector('.editor-controls');
    
    // 状态变量
    let currentImage = null;  // 当前编辑的图片
    let textAreas = [];       // 文本区域列表
    let selectedArea = null;  // 当前选中的文本区域
    let isDragging = false;   // 是否正在拖动
    let dragOffsetX = 0;      // 拖动偏移X
    let dragOffsetY = 0;      // 拖动偏移Y
    let isBold = false;       // 是否粗体
    let isUnderline = false;  // 是否下划线
    let isColorPicking = false; // 是否在颜色吸取模式
    let isEditMode = false;   // 是否在编辑模式
    
    // 绑定拖放事件
    editorDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        editorDropZone.style.borderColor = '#0071e3';
        editorDropZone.style.backgroundColor = '#f5f5f7';
    });
    
    editorDropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        editorDropZone.style.borderColor = '#86868b';
        editorDropZone.style.backgroundColor = 'white';
    });
    
    editorDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        editorDropZone.style.borderColor = '#86868b';
        editorDropZone.style.backgroundColor = 'white';
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(file);
        }
    });
    
    // 点击上传
    editorDropZone.addEventListener('click', () => {
        editorFileInput.click();
    });
    
    editorFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(file);
        }
    });
    
    // 处理图片上传
    function handleImageUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            currentImage = new Image();
            currentImage.onload = () => {
                // 设置画布大小与图片一致
                editorCanvas.width = currentImage.width;
                editorCanvas.height = currentImage.height;
                
                // 绘制图片到画布
                ctx.drawImage(currentImage, 0, 0);
                
                // 显示编辑区域
                editorDropZone.style.display = 'none';
                editorWorkspace.style.display = 'flex';
            };
            currentImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    // 颜色吸取工具事件
    colorPickerBtn.addEventListener('click', () => {
        isColorPicking = true;
        
        // 更改鼠标样式为吸管
        document.querySelector('.editor-canvas-container').classList.add('canvas-color-picker');
        
        // 显示提示消息
        showMessage('请点击图片上的任意位置吸取颜色');
    });
    
    // 画布点击事件，用于吸取颜色
    editorCanvas.addEventListener('click', (e) => {
        if (!isColorPicking) return;
        
        const rect = editorCanvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) * (editorCanvas.width / rect.width));
        const y = Math.floor((e.clientY - rect.top) * (editorCanvas.height / rect.height));
        
        // 获取点击位置的像素颜色
        const pixelData = ctx.getImageData(x, y, 1, 1).data;
        const hexColor = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
        
        // 设置颜色
        fontColor.value = hexColor;
        
        // 退出吸管模式
        isColorPicking = false;
        document.querySelector('.editor-canvas-container').classList.remove('canvas-color-picker');
        
        // 显示提示消息
        showMessage(`已吸取颜色: ${hexColor}`);
    });
    
    // RGB转十六进制颜色
    function rgbToHex(r, g, b) {
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    
    // 显示临时提示消息
    function showMessage(text) {
        // 检查是否已存在消息元素
        let messageElement = document.querySelector('.editor-message');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.className = 'editor-message';
            document.querySelector('.editor-canvas-container').appendChild(messageElement);
        }
        
        // 显示消息
        messageElement.textContent = text;
        messageElement.style.display = 'block';
        
        // 3秒后自动隐藏
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 3000);
    }
    
    // 粗体按钮事件
    boldBtn.addEventListener('click', () => {
        isBold = !isBold;
        boldBtn.classList.toggle('active', isBold);
    });
    
    // 下划线按钮事件
    underlineBtn.addEventListener('click', () => {
        isUnderline = !isUnderline;
        underlineBtn.classList.toggle('active', isUnderline);
    });
    
    // 文字间距事件
    letterSpacing.addEventListener('input', (e) => {
        const spacing = e.target.value;
        letterSpacingValue.textContent = `${spacing}px`;
    });
    
    // 添加文本区域
    addTextBtn.addEventListener('click', () => {
        const text = textInput.value.trim();
        if (!text || !currentImage) return;
        
        const textStyle = {
            text: text,
            font: `${isBold ? 'bold' : 'normal'} ${fontSize.value}px ${fontFamily.value}`,
            color: fontColor.value,
            x: editorCanvas.width / 2,  // 默认位置：中心
            y: editorCanvas.height / 2,
            fontFamily: fontFamily.value,
            fontSize: fontSize.value,
            letterSpacing: letterSpacing.value,
            isBold: isBold,
            isUnderline: isUnderline
        };
        
        textAreas.push(textStyle);
        
        // 更新文本区域列表
        updateTextAreasList();
        
        // 重绘画布
        redrawCanvas();
        
        // 清空输入
        textInput.value = '';
    });
    
    // 更新文本区域
    updateTextBtn.addEventListener('click', () => {
        const text = textInput.value.trim();
        if (!text || selectedArea === null) return;
        
        // 更新选定的文本区域
        textAreas[selectedArea].text = text;
        textAreas[selectedArea].font = `${isBold ? 'bold' : 'normal'} ${fontSize.value}px ${fontFamily.value}`;
        textAreas[selectedArea].color = fontColor.value;
        textAreas[selectedArea].fontFamily = fontFamily.value;
        textAreas[selectedArea].fontSize = fontSize.value;
        textAreas[selectedArea].letterSpacing = letterSpacing.value;
        textAreas[selectedArea].isBold = isBold;
        textAreas[selectedArea].isUnderline = isUnderline;
        
        // 退出编辑模式
        exitEditMode();
        
        // 更新文本区域列表
        updateTextAreasList();
        
        // 重绘画布
        redrawCanvas();
    });
    
    // 取消编辑按钮
    cancelEditBtn.addEventListener('click', exitEditMode);
    
    // 进入编辑模式
    function enterEditMode() {
        isEditMode = true;
        controls.classList.add('edit-mode-active');
    }
    
    // 退出编辑模式
    function exitEditMode() {
        isEditMode = false;
        controls.classList.remove('edit-mode-active');
        textInput.value = '';
        selectedArea = null;
        
        // 移除选中状态
        document.querySelectorAll('.draggable-text').forEach(el => {
            el.classList.remove('selected');
        });
    }
    
    // 更新文本区域列表
    function updateTextAreasList() {
        textAreaItems.innerHTML = '';
        
        textAreas.forEach((area, index) => {
            const item = document.createElement('div');
            item.className = 'text-area-item';
            
            const content = document.createElement('div');
            content.className = 'text-area-content';
            content.textContent = area.text;
            
            const actions = document.createElement('div');
            actions.className = 'text-area-actions';
            
            const editBtn = document.createElement('button');
            editBtn.innerHTML = '✏️';
            editBtn.title = '编辑';
            editBtn.onclick = () => {
                // 选中当前区域
                selectedArea = index;
                
                // 将文本内容填充到输入框
                textInput.value = area.text;
                
                // 设置样式控制器
                fontFamily.value = area.fontFamily;
                fontSize.value = area.fontSize;
                fontColor.value = area.color;
                letterSpacing.value = area.letterSpacing || 0;
                letterSpacingValue.textContent = `${area.letterSpacing || 0}px`;
                isBold = area.isBold;
                isUnderline = area.isUnderline || false;
                boldBtn.classList.toggle('active', isBold);
                underlineBtn.classList.toggle('active', isUnderline);
                
                // 进入编辑模式
                enterEditMode();
                
                // 选中对应的可拖动文本
                document.querySelectorAll('.draggable-text').forEach(el => {
                    el.classList.remove('selected');
                });
                const draggableText = document.getElementById(`text-area-${index}`);
                if (draggableText) {
                    draggableText.classList.add('selected');
                }
            };
            
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '🗑️';
            deleteBtn.title = '删除';
            deleteBtn.onclick = () => {
                textAreas.splice(index, 1);
                updateTextAreasList();
                redrawCanvas();
                
                // 如果正在编辑这个区域，退出编辑模式
                if (selectedArea === index) {
                    exitEditMode();
                } else if (selectedArea > index) {
                    // 如果删除的是前面的区域，更新selectedArea的索引
                    selectedArea--;
                }
            };
            
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            
            item.appendChild(content);
            item.appendChild(actions);
            textAreaItems.appendChild(item);
        });
        
        // 创建所有可拖动文本元素
        redrawCanvas();
    }
    
    // 重绘画布
    function redrawCanvas() {
        // 清除画布，只绘制背景图片
        ctx.clearRect(0, 0, editorCanvas.width, editorCanvas.height);
        if (currentImage) {
            ctx.drawImage(currentImage, 0, 0);
        }
        
        // 移除所有可拖动文本元素
        document.querySelectorAll('.draggable-text').forEach(el => {
            el.remove();
        });
        
        // 创建新的可拖动文本元素
        textAreas.forEach((area, index) => {
            createDraggableText(area, index);
        });
    }
    
    // 创建可拖动文本元素
    function createDraggableText(textArea, index) {
        const draggableText = document.createElement('div');
        draggableText.className = 'draggable-text';
        draggableText.id = `text-area-${index}`;
        draggableText.textContent = textArea.text;
        draggableText.style.fontSize = `${textArea.fontSize}px`;
        draggableText.style.fontFamily = textArea.fontFamily;
        draggableText.style.color = textArea.color;
        draggableText.style.fontWeight = textArea.isBold ? 'bold' : 'normal';
        draggableText.style.letterSpacing = `${textArea.letterSpacing || 0}px`;
        if (textArea.isUnderline) {
            draggableText.style.textDecoration = 'underline';
        }
        
        const canvasContainer = document.querySelector('.editor-canvas-container');
        const canvasRect = editorCanvas.getBoundingClientRect();
        const scaleX = editorCanvas.width / canvasRect.width;
        const scaleY = editorCanvas.height / canvasRect.height;
        
        // 计算文本元素的实际位置
        const x = textArea.x / scaleX;
        const y = textArea.y / scaleY;
        
        // 直接使用left和top设置位置
        draggableText.style.left = `${x}px`;
        draggableText.style.top = `${y}px`;
        
        // 添加调整大小的控制点
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        draggableText.appendChild(resizeHandle);
        
        // 点击选中
        draggableText.addEventListener('mousedown', (e) => {
            // 如果点击的是调整大小的控制点，不触发拖动
            if (e.target === resizeHandle) return;
            
            // 防止事件冒泡
            e.stopPropagation();
            
            // 移除其他选中状态
            document.querySelectorAll('.draggable-text').forEach(el => {
                el.classList.remove('selected');
            });
            
            // 添加选中状态
            draggableText.classList.add('selected');
            selectedArea = index;
            
            // 记录拖动起始位置
            isDragging = true;
            
            // 计算鼠标与元素的偏移
            const rect = draggableText.getBoundingClientRect();
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
            
            // 填充编辑器
            textInput.value = textArea.text;
            fontFamily.value = textArea.fontFamily;
            fontSize.value = textArea.fontSize;
            fontColor.value = textArea.color;
            letterSpacing.value = textArea.letterSpacing || 0;
            letterSpacingValue.textContent = `${textArea.letterSpacing || 0}px`;
            isBold = textArea.isBold;
            isUnderline = textArea.isUnderline || false;
            boldBtn.classList.toggle('active', isBold);
            underlineBtn.classList.toggle('active', isUnderline);
        });
        
        // 添加调整大小的功能
        let isResizing = false;
        
        resizeHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            isResizing = true;
            
            // 移除其他选中状态
            document.querySelectorAll('.draggable-text').forEach(el => {
                el.classList.remove('selected');
            });
            
            // 添加选中状态
            draggableText.classList.add('selected');
            selectedArea = index;
        });
        
        // 调整大小的鼠标移动事件
        document.addEventListener('mousemove', (e) => {
            if (!isResizing || selectedArea !== index) return;
            
            const textRect = draggableText.getBoundingClientRect();
            const newWidth = e.clientX - textRect.left;
            
            if (newWidth < 10) return; // 防止文字过小
            
            // 计算新的字体大小
            const scaleFactor = newWidth / textRect.width;
            const newFontSize = Math.max(8, Math.round(textArea.fontSize * scaleFactor));
            
            // 更新文本区域数据
            textAreas[selectedArea].fontSize = newFontSize;
            textAreas[selectedArea].font = `${textAreas[selectedArea].isBold ? 'bold' : 'normal'} ${newFontSize}px ${textAreas[selectedArea].fontFamily}`;
            
            // 更新字体大小输入框
            fontSize.value = newFontSize;
            
            // 更新可拖动文本元素的样式
            draggableText.style.fontSize = `${newFontSize}px`;
        });
        
        // 调整大小的鼠标松开事件
        document.addEventListener('mouseup', () => {
            isResizing = false;
        });
        
        // 将元素添加到编辑器画布容器
        canvasContainer.appendChild(draggableText);
    }
    
    // 鼠标移动事件
    document.addEventListener('mousemove', (e) => {
        if (isDragging && selectedArea !== null) {
            const draggableText = document.getElementById(`text-area-${selectedArea}`);
            if (!draggableText) return;
            
            const canvasContainer = document.querySelector('.editor-canvas-container');
            const containerRect = canvasContainer.getBoundingClientRect();
            
            // 计算新位置
            let newX = e.clientX - containerRect.left - dragOffsetX;
            let newY = e.clientY - containerRect.top - dragOffsetY;
            
            // 边界检查
            const textRect = draggableText.getBoundingClientRect();
            if (newX < 0) newX = 0;
            if (newY < 0) newY = 0;
            if (newX + textRect.width > containerRect.width) {
                newX = containerRect.width - textRect.width;
            }
            if (newY + textRect.height > containerRect.height) {
                newY = containerRect.height - textRect.height;
            }
            
            // 更新位置
            draggableText.style.left = `${newX}px`;
            draggableText.style.top = `${newY}px`;
            
            // 更新数据
            const canvasRect = editorCanvas.getBoundingClientRect();
            const scaleX = editorCanvas.width / canvasRect.width;
            const scaleY = editorCanvas.height / canvasRect.height;
            
            // 保存实际在Canvas中的位置
            textAreas[selectedArea].x = newX * scaleX;
            textAreas[selectedArea].y = newY * scaleY;
        }
    });
    
    // 鼠标松开事件
    document.addEventListener('mouseup', () => {
        if (isDragging && selectedArea !== null) {
            isDragging = false;
        }
    });
    
    // 获取文本宽度的辅助函数
    function getTextWidth(text, font, letterSpacing = 0) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = font;
        const metrics = context.measureText(text);
        // 加上字母间距的额外宽度
        return metrics.width + (text.length - 1) * letterSpacing;
    }
    
    // 重置按钮事件
    resetEditorBtn.addEventListener('click', () => {
        // 清空文本区域
        textAreas = [];
        selectedArea = null;
        
        // 移除可拖动文本元素
        document.querySelectorAll('.draggable-text').forEach(el => {
            el.remove();
        });
        
        // 重置输入
        textInput.value = '';
        fontFamily.value = 'Arial';
        fontSize.value = '24';
        fontColor.value = '#000000';
        letterSpacing.value = '0';
        letterSpacingValue.textContent = '0px';
        isBold = false;
        isUnderline = false;
        boldBtn.classList.remove('active');
        underlineBtn.classList.remove('active');
        
        // 重置界面
        editorDropZone.style.display = 'block';
        editorWorkspace.style.display = 'none';
        
        // 清除画布
        ctx.clearRect(0, 0, editorCanvas.width, editorCanvas.height);
        
        // 清空文本区域列表
        textAreaItems.innerHTML = '';
    });
    
    // 下载按钮事件
    downloadEditedBtn.addEventListener('click', () => {
        if (!currentImage) return;
        
        // 创建临时画布用于导出
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = editorCanvas.width;
        tempCanvas.height = editorCanvas.height;
        
        // 首先绘制原始图片
        tempCtx.drawImage(currentImage, 0, 0);
        
        // 隐藏所有调整大小的控制点和选中状态（为了截图）
        const selectedElements = document.querySelectorAll('.draggable-text.selected');
        const resizeHandles = document.querySelectorAll('.resize-handle');
        
        // 保存当前选中状态和控制点显示状态
        selectedElements.forEach(el => el.classList.remove('selected'));
        resizeHandles.forEach(handle => handle.style.display = 'none');
        
        // 对每个文本区域进行处理
        for (let i = 0; i < textAreas.length; i++) {
            // 获取当前DOM文本元素
            const textElement = document.getElementById(`text-area-${i}`);
            if (!textElement) continue;
            
            // 获取文本元素的样式和内容
            const computedStyle = window.getComputedStyle(textElement);
            const text = textElement.textContent;
            
            // 确保获取正确的字体大小
            const fontSize = parseInt(computedStyle.fontSize);
            const fontFamily = computedStyle.fontFamily;
            const fontWeight = computedStyle.fontWeight;
            const fontColor = computedStyle.color;
            const letterSpacing = parseFloat(computedStyle.letterSpacing) || 0;
            const textDecoration = computedStyle.textDecoration;
            
            // 获取元素位置
            const rect = textElement.getBoundingClientRect();
            const containerRect = document.querySelector('.editor-canvas-container').getBoundingClientRect();
            
            // 计算相对于容器的位置
            const relativeLeft = rect.left - containerRect.left;
            const relativeTop = rect.top - containerRect.top;
            
            // 从页面坐标转换为canvas坐标
            const canvasRect = editorCanvas.getBoundingClientRect();
            const scaleX = editorCanvas.width / canvasRect.width;
            const scaleY = editorCanvas.height / canvasRect.height;
            
            const canvasX = relativeLeft * scaleX;
            // 添加垂直偏移量修正，解决上移问题
            const verticalOffset = fontSize * 0.15 * scaleY; // 添加15%字体高度的向下偏移
            const canvasY = (relativeTop * scaleY) + verticalOffset;
            
            // 设置字体样式
            let fontStyle = '';
            if (fontWeight === 'bold' || fontWeight >= 700) {
                fontStyle += 'bold ';
            }
            
            // 设置精确的字体
            tempCtx.font = `${fontStyle}${fontSize * scaleY}px ${fontFamily}`;
            
            // 提取RGB颜色值
            const rgbMatch = fontColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (rgbMatch) {
                const r = parseInt(rgbMatch[1]);
                const g = parseInt(rgbMatch[2]);
                const b = parseInt(rgbMatch[3]);
                tempCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            } else {
                tempCtx.fillStyle = fontColor;
            }
            
            // 修改文字的基线对齐方式，解决位置偏移问题
            tempCtx.textBaseline = 'top';
            tempCtx.textAlign = 'left';
            
            // 绘制文本，考虑字间距
            if (letterSpacing > 0) {
                const chars = text.split('');
                let currentX = canvasX;
                
                chars.forEach(char => {
                    tempCtx.fillText(char, currentX, canvasY);
                    const charWidth = tempCtx.measureText(char).width;
                    currentX += charWidth + (letterSpacing * scaleX);
                });
            } else {
                // 无字间距，直接绘制
                tempCtx.fillText(text, canvasX, canvasY);
            }
            
            // 如果有下划线，添加下划线
            if (textDecoration.includes('underline')) {
                let textWidth;
                if (letterSpacing > 0) {
                    // 计算带字间距的文本宽度
                    const chars = text.split('');
                    let totalWidth = 0;
                    chars.forEach(char => {
                        totalWidth += tempCtx.measureText(char).width + (letterSpacing * scaleX);
                    });
                    totalWidth -= letterSpacing * scaleX; // 减去最后一个多余的间距
                    textWidth = totalWidth;
                } else {
                    textWidth = tempCtx.measureText(text).width;
                }
                
                // 调整下划线位置，与DOM元素一致
                const underlineY = canvasY + (fontSize * scaleY * 1.1);
                tempCtx.beginPath();
                tempCtx.moveTo(canvasX, underlineY);
                tempCtx.lineTo(canvasX + textWidth, underlineY);
                tempCtx.lineWidth = Math.max(1, (fontSize * scaleY) / 15);
                tempCtx.strokeStyle = tempCtx.fillStyle;
                tempCtx.stroke();
            }
        }
        
        // 恢复控制点显示
        selectedElements.forEach(el => el.classList.add('selected'));
        resizeHandles.forEach(handle => handle.style.display = '');
        
        // 创建下载链接
        const link = document.createElement('a');
        link.download = 'edited_image.png';
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
        
        // 显示成功提示
        showMessage('图片已成功下载');
    });
}); 
