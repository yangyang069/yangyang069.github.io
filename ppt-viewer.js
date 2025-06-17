// PPT查看器主要功能
class PPTViewer {
    constructor() {
        this.currentUrl = '';
        this.currentTitle = '';
        this.isFullscreen = false;
        this.isShowingGuide = false; // 防止重复显示指导
        this.hasShownGuideRecently = false; // 防止频繁显示指导
        this.currentSlideNumber = 0; // 当前幻灯片编号
        this.totalSlides = 0; // 总幻灯片数
        this.isLastSlide = false; // 是否在最后一页
        this.lastRightArrowTime = 0; // 最后一次按右箭头的时间戳
        this.lastSlideAreaClickTime = 0; // 最后一次点击幻灯片区域的时间戳
        this.isLoadingPresentation = false; // 添加新的标志位
        this.loadAttempts = 0; // 添加加载尝试次数
        this.repeatedNavigationAttempts = 0; // 添加重复导航尝试次数
        this.hasSuccessfullyLoaded = false; // 添加成功加载标志
        this.usingPptxJS = false; // 是否使用PptxJS渲染
        this.pptxSlides = null; // 存储PPTX幻灯片对象
        this.init();
    }

    init() {
        this.parseUrlParams();
        this.setupEventListeners();
        this.setupMessageListener();
        this.loadPresentation();
        this.hideLoading();
    }

    // 解析URL参数
    parseUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        this.currentUrl = urlParams.get('url') || urlParams.get('ppt') || '';
        this.currentTitle = urlParams.get('title') || '演示文稿';
        
        // 设置标题
        document.getElementById('presentationTitle').textContent = this.currentTitle;
        document.title = `${this.currentTitle} - PPT查看器 - YangYang`;

        console.log('解析的参数:', {
            url: this.currentUrl,
            title: this.currentTitle
        });
    }

    // 设置事件监听器
    setupEventListeners() {
        // 全屏按钮
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        fullscreenBtn?.addEventListener('click', () => this.toggleFullscreen());

        // 下载按钮
        const downloadBtn = document.getElementById('downloadBtn');
        downloadBtn?.addEventListener('click', () => this.downloadPresentation());

        // 分享按钮
        const shareBtn = document.getElementById('shareBtn');
        shareBtn?.addEventListener('click', () => this.showShareModal());

        // 控制面板切换
        const togglePanel = document.getElementById('togglePanel');
        const controlPanel = document.getElementById('controlPanel');
        togglePanel?.addEventListener('click', () => {
            controlPanel.classList.toggle('expanded');
        });

        // 演示模式切换
        const presentationMode = document.getElementById('presentationMode');
        presentationMode?.addEventListener('change', (e) => {
            this.changePresentationMode(e.target.value);
        });

        // 比例切换
        const aspectRatio = document.getElementById('aspectRatio');
        aspectRatio?.addEventListener('change', (e) => {
            this.changeAspectRatio(e.target.value);
        });

        // 重置视图
        const resetView = document.getElementById('resetView');
        resetView?.addEventListener('click', () => this.resetView());

        // 刷新按钮
        const refreshBtn = document.getElementById('refreshBtn');
        refreshBtn?.addEventListener('click', () => this.refreshPresentation());

        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // 全屏状态变化监听
        document.addEventListener('fullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.onFullscreenChange());

        // 监听鼠标点击事件
        document.addEventListener('click', (e) => {
            // 检查是否点击了PPT区域
            const slidesContainer = document.getElementById('slidesContainer');
            if (slidesContainer && slidesContainer.contains(e.target)) {
                this.lastSlideAreaClickTime = Date.now();
            }
        });
        
        // PPTX本地渲染相关控制
        const prevSlide = document.getElementById('prevSlide');
        const nextSlide = document.getElementById('nextSlide');
        
        prevSlide?.addEventListener('click', () => {
            if (this.usingPptxJS) {
                this.navigatePptxSlide('prev');
            } else {
                this.navigateSlide('prev');
            }
        });
        
        nextSlide?.addEventListener('click', () => {
            if (this.usingPptxJS) {
                this.navigatePptxSlide('next');
            } else {
                this.navigateSlide('next');
            }
        });
    }

    // 加载演示文稿
    loadPresentation() {
        if (!this.currentUrl) {
            this.showError('未提供演示文稿URL');
            return;
        }

        try {
            // 检查是否是本地PPTX文件
            const isLocalPptx = this.currentUrl.endsWith('.pptx') && 
                               (this.currentUrl.startsWith('./') || this.currentUrl.startsWith('/'));
            
            if (isLocalPptx) {
                console.log('检测到本地PPTX文件:', this.currentUrl);
                
                // 直接使用Google Docs Viewer查看PPTX
                this.directGoogleDocsViewer(this.currentUrl);
                
                // 设置下载链接
                const downloadLink = document.getElementById('downloadLink');
                if (downloadLink) {
                    downloadLink.href = this.currentUrl;
                    downloadLink.download = this.currentUrl.split('/').pop();
                }
            } else {
                const embedUrl = this.convertToEmbedUrl(this.currentUrl);
                if (embedUrl) {
                    // 设置标志位表示正在尝试加载
                    this.isLoadingPresentation = true;
                    this.loadEmbedPresentation(embedUrl);
                } else {
                    this.showFallbackContent();
                }
            }
        } catch (error) {
            console.error('加载演示文稿出错:', error);
            this.showError('加载演示文稿时出现错误');
        }
    }
    
    // 直接使用Google Docs Viewer (无降级方案)
    directGoogleDocsViewer(url) {
        console.log('直接使用Google Docs Viewer...');
        
        const pptxContainer = document.getElementById('pptxContainer');
        const slidesContainer = document.getElementById('slidesContainer');
        const fallbackContent = document.getElementById('fallbackContent');
        const controlPanel = document.getElementById('controlPanel');
        
        // 显示PPTX容器，隐藏其他容器
        pptxContainer.style.display = 'block';
        slidesContainer.style.display = 'none';
        fallbackContent.style.display = 'none';
        
        // 确保控制面板可见
        if (controlPanel) {
            controlPanel.style.display = 'block';
        }
        
        // 设置标志位
        this.usingPptxJS = false;
        this.isLoadingPresentation = true;
        
        // 显示加载指示器
        const loadingText = document.querySelector('#loadingIndicator p');
        if (loadingText) {
            loadingText.textContent = '正在加载Google文档查看器...';
        }
        
        // 完整的文件URL
        let fileUrl = url;
        
        // 如果是相对路径，转换为完整URL
        if (url.startsWith('./') || url.startsWith('/')) {
            const baseUrl = window.location.origin;
            fileUrl = baseUrl + (url.startsWith('/') ? url : '/' + url.substring(2));
        }
        
        // 构建Google Docs Viewer URL
        const encodedUrl = encodeURIComponent(fileUrl);
        const googleViewerUrl = `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;
        
        console.log('Google Docs Viewer URL:', googleViewerUrl);
        
        // 显示Google Docs Viewer - 移除内联样式，让CSS文件中的样式生效
        $("#pptx-viewer").empty();
        $("#pptx-viewer").html(`
            <div class="office-viewer-container"> 
                <div class="loading-message">正在加载Google文档查看器...</div>
                <iframe 
                    id="google-viewer-frame"
                    src="${googleViewerUrl}" 
                    frameborder="0">
                </iframe>
            </div>
        `);
        
        // 设置iframe加载事件
        const iframe = document.getElementById('google-viewer-frame');
        if (iframe) {
            iframe.onload = () => {
                console.log('Google Docs Viewer已加载');
                
                // 检查是否加载了错误页面
                try {
                    // 尝试捕获iframe内容中的错误信息
                    const iframeContent = iframe.contentDocument || iframe.contentWindow.document;
                    const errorText = iframeContent.body.innerText || '';
                    
                    if (errorText.includes('error') || errorText.includes('sorry') || errorText.includes('cannot')) {
                        console.log('检测到Google Viewer错误页面，使用备选方案');
                        this.tryEmbeddedPptViewer(url);
                        return;
                    }
                } catch (e) {
                    // 跨域限制无法访问iframe内容
                    console.log('无法检查iframe内容:', e);
                }
                
                // 隐藏加载信息
                $(".loading-message").fadeOut();
                
                // 设置成功标志
                this.hasSuccessfullyLoaded = true;
                this.isLoadingPresentation = false;
                this.hideLoading();
                
                // 显示成功提示
                showToast('✅ 已使用Google文档查看器打开', 3000);
            };
            
            iframe.onerror = () => {
                console.error('Google Docs Viewer加载失败');
                this.tryEmbeddedPptViewer(url);
            };
            
            // 监听iframe的加载事件，检测错误
            const handleIframeError = () => {
                // 检查iframe是否包含错误信息
                try {
                    const frameWindow = iframe.contentWindow;
                    if (frameWindow.document.title.includes("error") || 
                        frameWindow.document.body.innerHTML.includes("error") ||
                        frameWindow.document.body.innerHTML.includes("can't open")) {
                        console.log('检测到Google Viewer错误');
                        this.tryEmbeddedPptViewer(url);
                    }
                } catch (e) {
                    // 可能因为跨域无法访问内容
                    console.log('无法检查iframe内容(跨域限制)');
                }
            };
            
            // 添加额外的错误检测
            iframe.addEventListener('load', handleIframeError);
            
            // 设置超时，如果加载时间过长，则使用备选方案
            setTimeout(() => {
                if (this.isLoadingPresentation) {
                    console.log('Google Docs Viewer加载超时');
                    this.tryEmbeddedPptViewer(url);
                }
            }, 10000);
        } else {
            // 如果无法创建iframe，使用备选方案
            this.tryEmbeddedPptViewer(url);
        }
    }

    // 尝试使用内嵌PPT查看器 (备选方案)
    tryEmbeddedPptViewer(url) {
        console.log('尝试使用内嵌PPT查看器...');
        
        // 提示用户
        showToast('⚠️ 在线查看服务不可用，使用内嵌查看器...', 3000);
        
        // 获取文件名
        const filename = url.split('/').pop();
        
        // 修改界面，提供更友好的体验
        $("#pptx-viewer").empty();
        $("#pptx-viewer").html(`
            <div class="embedded-viewer">
                <div class="viewer-header">
                    <h3>${this.currentTitle}</h3>
                    <p>内置查看器模式</p>
                </div>
                <div class="viewer-content">
                    <div class="slide-preview">
                        <div class="preview-content">
                            <div class="preview-icon">
                                <i class="fas fa-file-powerpoint"></i>
                            </div>
                            <div class="preview-text">
                                <h4>${filename}</h4>
                                <p>PowerPoint 演示文稿</p>
                            </div>
                        </div>
                        <div class="preview-overlay">
                            <div class="preview-message">
                                <i class="fas fa-eye"></i>
                                <p>查看器不可用</p>
                            </div>
                        </div>
                    </div>
                    <div class="slide-info">
                        <div class="file-info">
                            <p><i class="fas fa-info-circle"></i> 由于技术限制，无法在浏览器中直接查看此演示文稿</p>
                            <p><i class="fas fa-file-powerpoint"></i> <strong>文件名:</strong> ${filename}</p>
                            <p><i class="fas fa-download"></i> <strong>解决方案:</strong> 请下载文件后使用PowerPoint查看</p>
                        </div>
                        <div class="actions">
                            <button class="action-button download-btn" id="embedded-download-btn">
                                <i class="fas fa-download"></i> 下载查看
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        // 添加下载按钮事件
        const downloadBtn = document.getElementById('embedded-download-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.downloadPresentation();
            });
        }
        
        // 如果完全无法显示，最终回退到下载界面
        this.hasSuccessfullyLoaded = true;
        this.isLoadingPresentation = false;
        this.hideLoading();
    }

    // PPTX加载完成回调
    onPptxLoaded(args) {
        console.log('PPTX加载完成:', args);
        
        // 隐藏加载指示器
        this.hideLoading();
        
        // 设置幻灯片计数
        this.totalSlides = args.totalSlides || $('.slide').length || 0;
        this.currentSlideNumber = args.currentSlide || 1;
        
        // 更新UI
        this.updatePptxSlideCounter();
        
        // 重置标志位
        this.isLoadingPresentation = false;
        this.hasSuccessfullyLoaded = true;
        
        // 获取幻灯片对象
        this.pptxSlides = $('#all_slides_warpper');
        
        // 显示成功提示
        showToast('PPTX文件加载成功', 2000);
    }
    
    // PPTX幻灯片切换回调
    onPptxSlideChanged(args) {
        console.log('幻灯片已切换:', args);
        
        if (args) {
            this.currentSlideNumber = args.currentSlide || this.currentSlideNumber;
            this.totalSlides = args.totalSlides || this.totalSlides;
            
            // 更新是否在最后一页的状态
            this.isLastSlide = (this.currentSlideNumber === this.totalSlides);
            
            // 更新计数器
            this.updatePptxSlideCounter();
        }
    }
    
    // 更新PPTX幻灯片计数器
    updatePptxSlideCounter() {
        const currentSlideEl = document.getElementById('currentSlide');
        const totalSlidesEl = document.getElementById('totalSlides');
        
        if (currentSlideEl) {
            currentSlideEl.textContent = this.currentSlideNumber;
        }
        
        if (totalSlidesEl) {
            totalSlidesEl.textContent = this.totalSlides;
        }
    }
    
    // 导航PPTX幻灯片
    navigatePptxSlide(direction) {
        if (!this.pptxSlides) return;
        
        if (direction === 'next') {
            if (this.currentSlideNumber < this.totalSlides) {
                // 使用PptxJS的API切换到下一页
                $("#slides-next-btn").click();
                this.currentSlideNumber++;
                this.updatePptxSlideCounter();
            } else {
                showToast('⚠️ 已经是最后一页', 2000);
            }
        } else if (direction === 'prev') {
            if (this.currentSlideNumber > 1) {
                // 使用PptxJS的API切换到上一页
                $("#slides-prev-btn").click();
                this.currentSlideNumber--;
                this.updatePptxSlideCounter();
            } else {
                showToast('⚠️ 已经是第一页', 2000);
            }
        }
    }
    
    // PPTX渲染失败时显示备用界面
    showPptxFallback(url) {
        console.log('PPTX渲染失败，显示备用界面');
        
        // 显示备用下载界面
        this.showLocalPptxContent();
        
        // 显示错误提示
        showToast('⚠️ PPTX渲染失败，请下载后查看', 3000);
    }

    // 显示本地PPTX文件的下载界面
    showLocalPptxContent() {
        const slidesContainer = document.getElementById('slidesContainer');
        const pptxContainer = document.getElementById('pptxContainer');
        const fallbackContent = document.getElementById('fallbackContent');
        const downloadLink = document.getElementById('downloadLink');
        const externalLink = document.getElementById('externalLink');

        // 隐藏其他容器，显示备用内容
        slidesContainer.style.display = 'none';
        pptxContainer.style.display = 'none';
        fallbackContent.style.display = 'flex';

        // 设置下载链接
        downloadLink.href = this.currentUrl;
        downloadLink.download = this.currentUrl.split('/').pop();
        
        // 修改备用内容的显示文本
        const fallbackMessage = fallbackContent.querySelector('.fallback-message');
        if (fallbackMessage) {
            const icon = fallbackMessage.querySelector('i');
            const title = fallbackMessage.querySelector('h3');
            const description = fallbackMessage.querySelector('p.enhanced-desc');
            
            if (icon) {
                icon.className = 'fas fa-file-powerpoint enhanced-icon';
                // 根据文件类型设置不同的图标颜色
                if (this.currentUrl.endsWith('.pptx')) {
                    icon.style.color = '#e74c3c'; // PowerPoint红色
                }
            }
            
            if (title) title.textContent = '演示文稿准备就绪';
            if (description) {
                const filename = this.currentUrl.split('/').pop();
                description.textContent = `演示文稿"${filename}"可供下载查看。无法在浏览器中直接渲染该PPTX文件。`;
            }
            
            // 设置下载按钮文本
            const downloadBtn = downloadLink.querySelector('span') || downloadLink;
            if (downloadBtn) {
                const downloadIcon = downloadLink.querySelector('i');
                if (downloadIcon) downloadIcon.className = 'fas fa-download';
                downloadLink.innerHTML = '<i class="fas fa-download"></i> 下载演示文稿';
            }
        }
        
        // 隐藏外部链接按钮
        if (externalLink) externalLink.style.display = 'none';
        
        // 重置加载状态
        this.isLoadingPresentation = false;
        this.loadAttempts = 0;
        
        // 隐藏加载指示器
        this.hideLoading();
        
        // 添加动画效果，吸引用户注意
        setTimeout(() => {
            const icon = fallbackMessage.querySelector('i.enhanced-icon');
            if (icon) {
                icon.style.animation = 'pulse 2s infinite';
            }
            
            // 在下载按钮上添加脉冲动画
            if (downloadLink) {
                downloadLink.classList.add('pulse-animation');
            }
        }, 500);
    }

    // 下载演示文稿
    downloadPresentation() {
        if (this.currentUrl) {
            // 创建下载链接
            const link = document.createElement('a');
            link.href = this.currentUrl;
            
            // 获取文件名
            const filename = this.currentUrl.split('/').pop();
            link.download = filename; 
            
            // 触发下载
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // 显示提示
            showToast(`正在下载: ${filename}`, 3000);
        } else {
            showToast('没有可下载的文件', 2000);
        }
    }

    // 转换为嵌入URL
    convertToEmbedUrl(url) {
        if (!url) return null;
        
        try {
            // 本地PPTX文件支持
            if (url.endsWith('.pptx')) {
                // 如果是本地PPTX文件，使用Office Online Viewer
                const encodedUrl = encodeURIComponent(window.location.origin + '/' + url);
                return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
            }
            
            // Google Slides URL转换
            if (url.includes('docs.google.com/presentation')) {
                // 提取文档ID
                const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
                if (match) {
                    const docId = match[1];
                    return `https://docs.google.com/presentation/d/${docId}/embed?start=false&loop=false&delayms=3000`;
                }
            }

            // Google Drive分享链接
            if (url.includes('drive.google.com/file')) {
                const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
                if (match) {
                    const fileId = match[1];
                    
                    // 如果是PPTX文件，使用Office Online Viewer
                    if (url.toLowerCase().includes('.pptx') || url.toLowerCase().includes('presentation')) {
                        const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
                        const encodedUrl = encodeURIComponent(driveUrl);
                        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
                    }
                    
                    return `https://drive.google.com/file/d/${fileId}/preview`;
                }
            }

            // 直接的嵌入链接
            if (url.includes('/embed') || url.includes('/preview')) {
                return url;
            }

            // 检查其他可能的URL格式
            if (url.startsWith('http') || url.startsWith('https')) {
                // 可能是有效URL但不支持转换
                return url; // 尝试直接使用URL
            }
            
            // OneDrive或其他云存储链接可以在此添加支持
        } catch (error) {
            console.error('URL转换错误:', error);
        }
        
        return null;
    }

    // 加载嵌入演示文稿
    loadEmbedPresentation(embedUrl) {
        const iframe = document.getElementById('slidesIframe');
        const slidesContainer = document.getElementById('slidesContainer');
        const fallbackContent = document.getElementById('fallbackContent');

        // 确保URL是有效的
        if (!embedUrl) {
            this.showFallbackContent();
            return;
        }

        // 重置状态
        this.loadAttempts = this.loadAttempts || 0;
        this.loadAttempts++;
        
        // 最多尝试3次
        if (this.loadAttempts > 3) {
            console.log('超过最大加载尝试次数');
            this.showFallbackContent();
            return;
        }
        
        console.log(`尝试加载URL(第${this.loadAttempts}次): ${embedUrl}`);
        iframe.src = embedUrl;
        
        // 监听iframe加载
        iframe.onload = () => {
            console.log('演示文稿加载成功');
            slidesContainer.style.display = 'flex';
            fallbackContent.style.display = 'none';
            
            // 重置加载尝试次数
            this.loadAttempts = 0;
            this.isLoadingPresentation = false;
            this.hasSuccessfullyLoaded = true;
        };

        iframe.onerror = (e) => {
            console.error('演示文稿加载失败:', e);
            
            // 优先检查是否是因为在最后一页导航引起的错误
            if (this.handleLoadingError()) {
                return; // 已经处理了这个特殊错误
            }
            
            this.showFallbackContent();
        };

        // 设置超时检查
        this.clearLoadTimeout();
        this.loadTimeout = setTimeout(() => {
            // 如果iframe内容无法访问，可能是跨域或加载失败
            if (iframe.src && (this.isLoadingTimeout() || this.isIframeEmpty())) {
                // 只有在确实是加载错误时才显示备用内容
                if (!this.handleLoadingError()) {
                    console.log('演示文稿加载超时');
                    this.showFallbackContent();
                }
            }
        }, 8000);
    }

    // 清除加载超时
    clearLoadTimeout() {
        if (this.loadTimeout) {
            clearTimeout(this.loadTimeout);
            this.loadTimeout = null;
        }
    }
    
    // 检查是否加载超时
    isLoadingTimeout() {
        return this.isLoadingPresentation && this.loadAttempts > 0;
    }
    
    // 检查iframe是否为空
    isIframeEmpty() {
        const iframe = document.getElementById('slidesIframe');
        try {
            // 尝试检查内容文档
            return !iframe.contentDocument || 
                   !iframe.contentWindow || 
                   iframe.contentDocument.body.innerHTML === '';
        } catch (e) {
            // 跨域错误，无法检查内容
            return false;
        }
    }

    // 显示备用内容
    showFallbackContent() {
        // 检查是否有加载中的iframe
        const iframe = document.getElementById('slidesIframe');
        if (iframe && iframe.src && this.currentUrl) {
            // 如果已经成功加载过，并且是翻页操作导致的错误，不显示备用内容
            if (this.hasSuccessfullyLoaded) {
                console.log('已经成功加载过，不显示备用内容');
                return;
            }
        }
    
        const slidesContainer = document.getElementById('slidesContainer');
        const fallbackContent = document.getElementById('fallbackContent');
        const downloadLink = document.getElementById('downloadLink');
        const externalLink = document.getElementById('externalLink');

        slidesContainer.style.display = 'none';
        fallbackContent.style.display = 'flex';

        // 设置下载和外部链接
        if (this.currentUrl) {
            // 检查是否是本地PPTX文件
            const isLocalPptx = this.currentUrl.endsWith('.pptx') && 
                               (this.currentUrl.startsWith('./') || this.currentUrl.startsWith('/'));
            
            if (isLocalPptx) {
                // 本地PPTX文件
                downloadLink.href = this.currentUrl;
                downloadLink.download = this.currentUrl.split('/').pop();
                
                // 修改备用内容的显示文本
                const fallbackMessage = fallbackContent.querySelector('.fallback-message');
                if (fallbackMessage) {
                    const title = fallbackMessage.querySelector('h3');
                    const description = fallbackMessage.querySelector('p');
                    
                    if (title) title.textContent = '无法在线预览PPTX';
                    if (description) description.textContent = '您可以下载演示文稿在本地查看。';
                }
                
                // 隐藏外部链接按钮
                if (externalLink) externalLink.style.display = 'none';
            } else {
                // 其他链接
                downloadLink.href = this.currentUrl;
                externalLink.href = this.currentUrl;
            }
        }
        
        // 重置加载状态
        this.isLoadingPresentation = false;
        this.loadAttempts = 0;
    }

    // 显示错误信息
    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        
        errorText.textContent = message;
        errorMessage.style.display = 'flex';
        
        this.hideLoading();
    }

    // 隐藏加载指示器
    hideLoading() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        const pptViewerContainer = document.getElementById('pptViewerContainer');
        
        setTimeout(() => {
            loadingIndicator.style.display = 'none';
            pptViewerContainer.style.display = 'flex';
        }, 1000);
    }

    // 切换全屏模式
    toggleFullscreen() {
        const container = document.getElementById('pptViewerContainer');
        
        if (!this.isFullscreen) {
            this.requestFullscreen(container);
        } else {
            this.exitFullscreen();
        }
    }

    // 请求全屏
    requestFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    // 退出全屏
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    // 全屏状态变化处理
    onFullscreenChange() {
        const container = document.getElementById('pptViewerContainer');
        this.isFullscreen = !!(document.fullscreenElement || 
                              document.webkitFullscreenElement || 
                              document.mozFullScreenElement || 
                              document.msFullscreenElement);
        
        if (this.isFullscreen) {
            container.classList.add('fullscreen');
        } else {
            container.classList.remove('fullscreen');
        }

        // 更新按钮图标
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const icon = fullscreenBtn.querySelector('i');
        if (this.isFullscreen) {
            icon.className = 'fas fa-compress';
            fullscreenBtn.title = '退出全屏';
        } else {
            icon.className = 'fas fa-expand';
            fullscreenBtn.title = '全屏模式';
        }
    }

    // 在新窗口打开
    openInNewWindow() {
        if (this.currentUrl) {
            window.open(this.currentUrl, '_blank', 'noopener,noreferrer');
        }
    }

    // 显示分享模态框
    showShareModal() {
        const modal = document.getElementById('shareModal');
        const shareLink = document.getElementById('shareLink');
        
        shareLink.value = window.location.href;
        modal.style.display = 'flex';
    }

    // 改变演示模式
    changePresentationMode(mode) {
        const iframe = document.getElementById('slidesIframe');
        
        if (mode === 'fullscreen') {
            this.toggleFullscreen();
        } else if (mode === 'embed') {
            if (this.isFullscreen) {
                this.exitFullscreen();
            }
        }
    }

    // 改变显示比例
    changeAspectRatio(ratio) {
        console.log('Changing aspect ratio to:', ratio);
        const googleFrame = document.getElementById('google-viewer-frame');
        let targetElement = null;

        if (googleFrame && googleFrame.closest) { // Ensure googleFrame and closest method exist
            targetElement = googleFrame.closest('.office-viewer-container');
        }

        if (!targetElement) {
            console.warn('Target element for aspect ratio change not found.');
            // Fallback to pptxContainer or slidesContainer if Google Viewer is not the active one
            // This part might need more context on how `this.usingPptxJS` is determined reliably
            const pptxContainer = document.getElementById('pptxContainer');
            const slidesContainer = document.getElementById('slidesContainer');
            if (pptxContainer && pptxContainer.style.display !== 'none') {
                targetElement = pptxContainer;
            } else if (slidesContainer && slidesContainer.style.display !== 'none') {
                targetElement = slidesContainer;
            }
            if (!targetElement) {
                console.error('No suitable target element found for aspect ratio change.');
                 showToast('无法应用显示比例：未找到目标容器', 2000);
                return;
            }
        }

        // Resetting properties that might interfere with aspect-ratio
        targetElement.style.width = ''; // Let CSS handle width initially or set explicitly below
        targetElement.style.height = ''; // Let CSS handle height or set explicitly below
        targetElement.style.maxWidth = '';
        targetElement.style.maxHeight = ''; // CSS will enforce max-height from .office-viewer-container

        switch (ratio) {
            case '16:9':
                targetElement.style.aspectRatio = '16/9';
                targetElement.style.width = '100%'; // Take full width, height adjusts
                targetElement.style.maxHeight = '80vh'; // Re-apply if needed, though CSS should handle
                break;
            case '4:3':
                targetElement.style.aspectRatio = '4/3';
                targetElement.style.width = '100%'; // Take full width, height adjusts
                targetElement.style.maxHeight = '80vh'; // Re-apply if needed
                break;
            case 'custom': // Fill available space, respecting max-height from CSS
                targetElement.style.aspectRatio = 'auto';
                targetElement.style.width = '100%';
                targetElement.style.height = '100%'; // Try to fill height, CSS max-height will cap it
                // If .office-viewer-container has max-height: 80vh, this effectively makes it 80vh
                break;
            default:
                console.warn('Unknown aspect ratio:', ratio);
                return;
        }
        showToast(`显示比例已设置为: ${ratio}`, 1500);
    }

    // 重置视图
    resetView() {
        console.log('Resetting view...');
        const googleFrame = document.getElementById('google-viewer-frame');
        let targetElement = null;

        if (googleFrame && googleFrame.closest) {
            targetElement = googleFrame.closest('.office-viewer-container');
        }
        
        if (!targetElement) {
            console.warn('Target element for view reset not found.');
            const pptxContainer = document.getElementById('pptxContainer');
            const slidesContainer = document.getElementById('slidesContainer');
            if (pptxContainer && pptxContainer.style.display !== 'none') {
                targetElement = pptxContainer;
            } else if (slidesContainer && slidesContainer.style.display !== 'none') {
                targetElement = slidesContainer;
            }
             if (!targetElement) {
                console.error('No suitable target element found for view reset.');
                showToast('无法重置视图：未找到目标容器', 2000);
                return;
            }
        }

        // Reset to default defined in CSS for .office-viewer-container
        targetElement.style.aspectRatio = '16/9';
        targetElement.style.width = '100%';
        targetElement.style.height = ''; // Let aspect ratio and max-height determine height
        targetElement.style.maxWidth = '';
        targetElement.style.maxHeight = '80vh'; // Explicitly reset max-height if it was changed

        // Reset the dropdown in the UI
        const aspectRatioSelect = document.getElementById('aspectRatio');
        if (aspectRatioSelect) {
            aspectRatioSelect.value = '16:9';
        }

        // Optionally, refresh the iframe if it's Google Docs Viewer to ensure changes apply
        if (googleFrame && googleFrame.src && targetElement === googleFrame.closest('.office-viewer-container')) {
            // To prevent rapid reloads, consider if this is always necessary
            // googleFrame.src = googleFrame.src; 
            console.log('Google Docs Viewer frame will be visually reset by style changes.');
        }

        showToast('视图已重置为默认设置', 1500);
    }
    
    // 刷新演示文稿
    refreshPresentation() {
        const iframe = document.getElementById('slidesIframe');
        const googleFrame = document.getElementById('google-viewer-frame');
        
        if (googleFrame && googleFrame.src) {
            // 刷新Google Docs Viewer
            googleFrame.src = googleFrame.src;
            showToast('正在刷新演示文稿...', 1500);
            return;
        }
        
        if (iframe && iframe.src) {
            iframe.src = iframe.src;
            showToast('正在刷新演示文稿...', 1500);
        }
    }

    // 键盘快捷键处理
    handleKeyboard(e) {
        switch (e.key) {
            case 'F11':
                e.preventDefault();
                this.toggleFullscreen();
                break;
            case 'Escape':
                if (this.isFullscreen) {
                    this.exitFullscreen();
                }
                break;
            case 'r':
            case 'R':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.refreshPresentation();
                }
                break;
            case 'ArrowRight':
                // 设置最后点击右箭头的时间戳
                this.lastRightArrowTime = Date.now();
                
                // 如果是最后一页，显示提示
                if (this.isLastSlide || 
                   (this.totalSlides > 0 && this.currentSlideNumber === this.totalSlides)) {
                    // 重置状态，防止显示错误信息
                    this.repeatedNavigationAttempts = 0;
                    // 显示提示
                    showToast('⚠️ 已经是最后一页', 2000);
                    // 防止页面刷新或重新加载
                    e.preventDefault();
                    e.stopPropagation();
                }
                break;
            case 'ArrowLeft':
                // 如果是第一页，显示提示
                if (this.currentSlideNumber === 1) {
                    showToast('⚠️ 已经是第一页', 2000);
                    // 防止页面刷新或重新加载
                    e.preventDefault();
                    e.stopPropagation();
                }
                break;
        }
    }

    // 上一页幻灯片
    previousSlide() {
        this.navigateSlide('prev');
    }

    // 下一页幻灯片
    nextSlide() {
        this.navigateSlide('next');
    }

    // 幻灯片导航主方法
    navigateSlide(direction) {
        const iframe = document.getElementById('slidesIframe');
        
        if (!iframe) {
            showToast('演示文稿未加载');
            return;
        }

        // 首先尝试直接翻页
        this.attemptDirectNavigation(direction);
    }

    // 尝试直接导航翻页
    attemptDirectNavigation(direction) {
        const iframe = document.getElementById('slidesIframe');
        const keyCode = direction === 'prev' ? 'ArrowLeft' : 'ArrowRight';
        const keyCodeNum = direction === 'prev' ? 37 : 39;
        
        try {
            // 先设置焦点到iframe
            iframe.focus();
            
            // 短暂延迟后发送键盘事件
            setTimeout(() => {
                // 方法1: 向iframe的contentWindow发送键盘事件
                this.sendKeyToIframeContent(keyCode, keyCodeNum);
                
                // 方法2: 在当前文档触发事件
                this.triggerDocumentKeyEvent(keyCode, keyCodeNum);
                
                // 方法3: 模拟用户真实按键
                this.simulateRealKeyPress(keyCode, keyCodeNum);
                
                // 显示翻页提示
                const message = direction === 'prev' ? '⬅️ 上一页' : '➡️ 下一页';
                showToast(message, 1000);
                
                // 如果多次尝试后仍然需要指导，显示提示
                if (!this.hasShownGuideRecently) {
                    setTimeout(() => {
                        this.showQuickGuide(direction);
                    }, 2000);
                }
            }, 150);
            
        } catch (error) {
            console.log('直接翻页尝试失败:', error);
            this.showQuickGuide(direction);
        }
    }

    // 向iframe内容发送键盘事件
    sendKeyToIframeContent(keyCode, keyCodeNum) {
        const iframe = document.getElementById('slidesIframe');
        
        try {
            // 方法1: postMessage到iframe
            if (iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'keydown',
                    key: keyCode,
                    code: keyCode,
                    keyCode: keyCodeNum,
                    which: keyCodeNum
                }, '*');
            }
            
            // 方法2: 如果能访问contentDocument，直接分发事件
            if (iframe.contentDocument) {
                const events = ['keydown', 'keyup'];
                events.forEach(eventType => {
                    const event = new KeyboardEvent(eventType, {
                        key: keyCode,
                        code: keyCode,
                        keyCode: keyCodeNum,
                        which: keyCodeNum,
                        bubbles: true,
                        cancelable: true
                    });
                    
                    iframe.contentDocument.dispatchEvent(event);
                    if (iframe.contentDocument.body) {
                        iframe.contentDocument.body.dispatchEvent(event);
                    }
                });
            }
        } catch (e) {
            console.log('iframe内容事件发送失败:', e);
        }
    }

    // 在当前文档触发键盘事件
    triggerDocumentKeyEvent(keyCode, keyCodeNum) {
        const events = ['keydown', 'keyup'];
        
        events.forEach(eventType => {
            const event = new KeyboardEvent(eventType, {
                key: keyCode,
                code: keyCode,
                keyCode: keyCodeNum,
                which: keyCodeNum,
                bubbles: true,
                cancelable: true
            });
            
            // 分发到多个目标
            document.dispatchEvent(event);
            document.body.dispatchEvent(event);
            
            const iframe = document.getElementById('slidesIframe');
            if (iframe) {
                iframe.dispatchEvent(event);
            }
        });
    }

    // 模拟真实按键
    simulateRealKeyPress(keyCode, keyCodeNum) {
        const iframe = document.getElementById('slidesIframe');
        
        try {
            // 创建更真实的键盘事件序列
            const sequence = ['keydown', 'keypress', 'keyup'];
            
            sequence.forEach((eventType, index) => {
                setTimeout(() => {
                    const event = new KeyboardEvent(eventType, {
                        key: keyCode,
                        code: keyCode,
                        keyCode: keyCodeNum,
                        which: keyCodeNum,
                        bubbles: true,
                        cancelable: true,
                        composed: true
                    });
                    
                    // 尝试在iframe上分发
                    if (iframe.contentWindow) {
                        try {
                            iframe.contentWindow.dispatchEvent(event);
                        } catch (e) {
                            // 跨域限制，忽略
                        }
                    }
                    
                    // 在iframe元素本身分发
                    iframe.dispatchEvent(event);
                    
                    // 在当前窗口分发
                    window.dispatchEvent(event);
                }, index * 50);
            });
        } catch (e) {
            console.log('模拟按键失败:', e);
        }
    }

    // 显示快速指导
    showQuickGuide(direction) {
        const dontShowAgain = localStorage.getItem('ppt-viewer-hide-navigation-guide');
        if (dontShowAgain === 'true') {
            return;
        }
        
        // 防止频繁显示
        if (this.hasShownGuideRecently) {
            return;
        }
        
        this.hasShownGuideRecently = true;
        setTimeout(() => {
            this.hasShownGuideRecently = false;
        }, 10000); // 10秒内不再显示
        
        const keyText = direction === 'prev' ? '左箭头 ⬅️' : '右箭头 ➡️';
        
        // 创建简化的指导提示
        const quickGuide = document.createElement('div');
        quickGuide.className = 'quick-guide';
        quickGuide.innerHTML = `
            <div class="quick-guide-content">
                <p><strong>💡 翻页提示</strong></p>
                <p>点击PPT区域，然后按 <strong>${keyText}</strong> 键翻页</p>
                <button class="quick-close">知道了</button>
            </div>
        `;
        
        quickGuide.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: rgba(44, 62, 80, 0.95);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: slideInRight 0.3s ease;
            max-width: 250px;
        `;
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            .quick-guide-content p {
                margin: 0 0 10px 0;
                font-size: 14px;
                line-height: 1.4;
            }
            .quick-close {
                background: #3498db;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                margin-top: 5px;
            }
            .quick-close:hover {
                background: #2980b9;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(quickGuide);
        
        // 关闭按钮事件
        quickGuide.querySelector('.quick-close').addEventListener('click', () => {
            quickGuide.remove();
            style.remove();
        });
        
        // 5秒后自动关闭
        setTimeout(() => {
            if (quickGuide.parentElement) {
                quickGuide.remove();
                style.remove();
            }
        }, 5000);
    }

    // 显示详细导航指导 (用于重置功能)
    showNavigationGuide(direction = 'next') {
        // 防止重复显示
        if (this.isShowingGuide) {
            return;
        }

        // 设置标志位
        this.isShowingGuide = true;

        // 检查是否已存在指导框
        const existingGuide = document.querySelector('.navigation-guide');
        if (existingGuide) {
            existingGuide.remove();
        }

        const keyText = direction === 'prev' ? '左箭头 ⬅️' : '右箭头 ➡️';
        const currentUrl = this.currentUrl;
        
        // 创建详细指导提示
        const guide = document.createElement('div');
        guide.className = 'navigation-guide';
        guide.innerHTML = `
            <div class="guide-content">
                <h4>💡 翻页操作指导</h4>
                <p>由于浏览器安全限制，按钮无法直接控制PPT翻页。</p>
                <p>请按以下步骤操作：</p>
                <ol style="text-align: left; margin: 15px 0; padding-left: 20px;">
                    <li>点击下方PPT内容区域获得焦点</li>
                    <li>使用键盘 <strong>${keyText}</strong> 键进行翻页</li>
                </ol>
                <div class="guide-actions">
                    <button class="guide-btn">我知道了</button>
                    <button class="guide-btn secondary">新窗口打开</button>
                </div>
                <label style="margin-top: 15px; display: block; font-size: 14px; color: #7f8c8d;">
                    <input type="checkbox" id="dontShowAgain" style="margin-right: 8px;">
                    不再显示此提示
                </label>
            </div>
        `;
        
        // 获取按钮引用
        const buttons = guide.querySelectorAll('.guide-btn');
        const closeBtn = buttons[0];
        const newWindowBtn = buttons[1];
        
        // 添加关闭方法
        const closeGuide = () => {
            const checkbox = guide.querySelector('#dontShowAgain');
            if (checkbox && checkbox.checked) {
                localStorage.setItem('ppt-viewer-hide-navigation-guide', 'true');
            }
            guide.remove();
            if (document.head.contains(style)) {
                style.remove();
            }
            this.isShowingGuide = false; // 重置标志位
        };
        
        // 绑定事件
        closeBtn.addEventListener('click', closeGuide);
        newWindowBtn.addEventListener('click', () => {
            window.open(currentUrl, '_blank');
        });
        
        // 设置样式
        guide.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10001;
            animation: fadeIn 0.3s ease;
        `;
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .navigation-guide .guide-content {
                background: white;
                padding: 30px;
                border-radius: 12px;
                max-width: 450px;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }
            .navigation-guide h4 {
                color: #2c3e50;
                margin-bottom: 15px;
                font-size: 18px;
            }
            .navigation-guide p {
                color: #7f8c8d;
                margin-bottom: 15px;
                line-height: 1.6;
            }
            .navigation-guide ol {
                color: #2c3e50;
                line-height: 1.8;
            }
            .navigation-guide .guide-actions {
                display: flex;
                gap: 10px;
                justify-content: center;
                margin-bottom: 15px;
            }
            .navigation-guide .guide-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
            }
            .navigation-guide .guide-btn:not(.secondary) {
                background: #3498db;
                color: white;
            }
            .navigation-guide .guide-btn.secondary {
                background: #95a5a6;
                color: white;
            }
            .navigation-guide .guide-btn:hover {
                transform: translateY(-1px);
            }
            .navigation-guide label {
                cursor: pointer;
                user-select: none;
            }
            .navigation-guide input[type="checkbox"] {
                cursor: pointer;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(guide);
        
        // 点击背景关闭
        guide.addEventListener('click', (e) => {
            if (e.target === guide) {
                closeGuide();
            }
        });
        
        // 8秒后自动移除
        setTimeout(() => {
            if (guide.parentElement) {
                closeGuide();
            }
        }, 8000);
    }

    // 向iframe发送键盘事件 (保留原方法以防需要)
    sendKeyToIframe(keyCode) {
        // 这个方法由于跨域限制通常不会生效，但保留作为备用
        const iframe = document.getElementById('slidesIframe');
        
        if (iframe && iframe.contentWindow) {
            try {
                iframe.contentWindow.postMessage({
                    type: 'keydown',
                    key: keyCode
                }, '*');
            } catch (error) {
                console.log('postMessage失败:', error);
            }
        }
    }

    // 显示幻灯片导航提示 (简化版本)
    showSlideNavigationHint(direction) {
        const hint = direction === 'ArrowLeft' ? 
            '请点击PPT区域，然后按左箭头键 ⬅️' : 
            '请点击PPT区域，然后按右箭头键 ➡️';
        showToast(hint, 4000);
    }

    // 监听来自iframe的消息
    setupMessageListener() {
        window.addEventListener('message', (event) => {
            try {
                if (event.data && event.data.type) {
                    switch (event.data.type) {
                        case 'slideInfo':
                            this.updateSlideInfo(event.data);
                            break;
                        case 'slideChanged':
                            this.onSlideChanged(event.data);
                            break;
                        case 'slideNavigationError':
                            // 处理幻灯片导航错误（例如已经到达最后一页）
                            this.handleSlideNavigationError(event.data);
                            break;
                    }
                }
            } catch (error) {
                console.log('处理iframe消息时出错:', error);
            }
        });
    }

    // 更新幻灯片信息
    updateSlideInfo(data) {
        if (data.currentSlide && data.totalSlides) {
            this.currentSlideNumber = data.currentSlide;
            this.totalSlides = data.totalSlides;
            console.log(`当前幻灯片: ${data.currentSlide}/${data.totalSlides}`);
            
            // 如果是最后一页，记录状态
            this.isLastSlide = (data.currentSlide === data.totalSlides);
        }
    }

    // 幻灯片切换时的回调
    onSlideChanged(data) {
        console.log('幻灯片已切换:', data);
        
        if (data.currentSlide && data.totalSlides) {
            this.currentSlideNumber = data.currentSlide;
            this.totalSlides = data.totalSlides;
            
            // 更新是否在最后一页的状态
            this.isLastSlide = (data.currentSlide === data.totalSlides);
        }
    }
    
    // 处理幻灯片导航错误
    handleSlideNavigationError(data) {
        const errorType = data.errorType;
        
        if (errorType === 'endReached') {
            showToast('⚠️ 已经是最后一页', 2000);
        } else if (errorType === 'startReached') {
            showToast('⚠️ 已经是第一页', 2000);
        }
    }
    
    // 处理iframe加载失败的情况
    handleLoadingError() {
        // 检查是否最近有尝试翻到下一页的动作（点击或键盘右箭头）
        const now = Date.now();
        const recentRightArrow = this.lastRightArrowTime && (now - this.lastRightArrowTime < 2000);
        const recentClick = this.lastSlideAreaClickTime && (now - this.lastSlideAreaClickTime < 2000);
        
        // 记录调试信息
        console.log('检测到可能的导航错误:', {
            isLastSlide: this.isLastSlide,
            recentRightArrow: recentRightArrow,
            recentClick: recentClick,
            lastArrowTime: this.lastRightArrowTime ? (now - this.lastRightArrowTime) + 'ms前' : '无',
            lastClickTime: this.lastSlideAreaClickTime ? (now - this.lastSlideAreaClickTime) + 'ms前' : '无',
            currentSlide: this.currentSlideNumber,
            totalSlides: this.totalSlides
        });
        
        // 多种情况下显示"已经是最后一页"提示：
        
        // 1. 已知是最后一页，且有最近的导航操作
        if (this.isLastSlide && (recentRightArrow || recentClick)) {
            showToast('⚠️ 已经是最后一页', 2000);
            return true;
        }
        
        // 2. 已知总页数，且当前页是最后一页
        if (this.totalSlides > 0 && this.currentSlideNumber === this.totalSlides && (recentRightArrow || recentClick)) {
            this.isLastSlide = true; // 更新状态
            showToast('⚠️ 已经是最后一页', 2000);
            return true;
        }
        
        // 3. 如果是首次加载，不应该触发"已经是最后一页"的提示
        if (this.isLoadingPresentation && this.loadAttempts <= 1) {
            return false;
        }
        
        // 4. 如果最近没有导航操作，这可能是真正的加载错误
        if (!recentRightArrow && !recentClick) {
            return false;
        }
        
        // 5. 作为后备策略，如果检测到多次重复的导航操作，可能用户在尝试翻到最后一页之后
        if (this.repeatedNavigationAttempts >= 2) {
            showToast('⚠️ 已到达边界页', 2000);
            this.repeatedNavigationAttempts = 0;
            return true;
        }
        
        // 记录连续导航尝试
        this.repeatedNavigationAttempts = (this.repeatedNavigationAttempts || 0) + 1;
        
        return false; // 默认不拦截，让正常的错误处理流程继续
    }

    // 重置导航指导设置
    resetNavigationGuide() {
        localStorage.removeItem('ppt-viewer-hide-navigation-guide');
        
        // 移除现有的指导框
        const existingGuide = document.querySelector('.navigation-guide');
        if (existingGuide) {
            existingGuide.remove();
        }
        
        // 重置标志位
        this.isShowingGuide = false;
        this.hasShownGuideRecently = false;
        
        showToast('✅ 翻页指导已重新启用');
        
        // 延迟显示详细指导
        setTimeout(() => {
            this.showNavigationGuide('next');
        }, 1000);
    }
}

// 分享功能
function closeShareModal() {
    const modal = document.getElementById('shareModal');
    modal.style.display = 'none';
}

function copyShareLink() {
    const shareLink = document.getElementById('shareLink');
    shareLink.select();
    shareLink.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        showToast('链接已复制到剪贴板');
    } catch (err) {
        console.error('复制失败:', err);
        showToast('复制失败，请手动复制');
    }
}

function shareViaEmail() {
    const shareLink = document.getElementById('shareLink');
    const subject = encodeURIComponent('分享演示文稿');
    const body = encodeURIComponent(`我想与您分享这个演示文稿：\n\n${shareLink.value}`);
    
    window.open(`mailto:?subject=${subject}&body=${body}`);
}

// 显示提示消息
function showToast(message, duration = 3000) {
    // 创建提示元素
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2c3e50;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // 显示动画
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // 自动消失
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, duration);
}

// 点击模态框外部关闭
document.addEventListener('click', (e) => {
    const modal = document.getElementById('shareModal');
    if (e.target === modal) {
        closeShareModal();
    }
});

// URL参数帮助函数
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// 创建PPT查看器URL
function createPPTViewerUrl(pptUrl, title = '') {
    const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/ppt-viewer.html');
    const params = new URLSearchParams();
    
    if (pptUrl) params.set('url', pptUrl);
    if (title) params.set('title', title);
    
    return `${baseUrl}?${params.toString()}`;
}

// 错误处理
window.addEventListener('error', (e) => {
    console.error('全局错误:', e.error);
    
    // 如果是iframe相关错误，尝试处理
    if (e.filename && e.filename.includes('iframe')) {
        const viewer = document.querySelector('.ppt-viewer-container');
        if (viewer) {
            const viewerInstance = window.pptViewerInstance;
            if (viewerInstance && viewerInstance.hasSuccessfullyLoaded) {
                // 如果已经成功加载过，忽略后续iframe错误
                e.preventDefault();
                e.stopPropagation();
                return;
            }
        }
    }
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('未处理的Promise拒绝:', e.reason);
    
    // 如果是加载或导航相关的错误，尝试处理
    if (e.reason && (e.reason.message || '').includes('load')) {
        const viewerInstance = window.pptViewerInstance;
        if (viewerInstance && viewerInstance.hasSuccessfullyLoaded) {
            // 如果已经成功加载过，显示边界提示
            const now = Date.now();
            const recentNav = (viewerInstance.lastRightArrowTime && (now - viewerInstance.lastRightArrowTime < 2000)) ||
                             (viewerInstance.lastSlideAreaClickTime && (now - viewerInstance.lastSlideAreaClickTime < 2000));
            
            if (recentNav) {
                if (viewerInstance.isLastSlide) {
                    showToast('⚠️ 已经是最后一页', 2000);
                } else {
                    showToast('⚠️ 已到达边界页', 2000);
                }
                e.preventDefault();
            }
        }
    }
});

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.pptViewerInstance = new PPTViewer();
});

// 导出工具函数（如果需要在其他地方使用）
window.PPTViewerUtils = {
    createPPTViewerUrl,
    showToast
}; 