// 设置默认浅色主题
(function() {
    document.documentElement.setAttribute('data-theme', 'light');
})();

document.getElementById('current-year').textContent = new Date().getFullYear();

// 添加移动端导航切换功能
document.addEventListener('DOMContentLoaded', function() {
    // 移动端菜单切换
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('mobile-active');
            // 切换图标
            const icon = menuToggle.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('mobile-active')) {
                    icon.className = 'fas fa-times';
                } else {
                    icon.className = 'fas fa-bars';
                }
            }
        });
        
        // 点击导航链接后关闭菜单
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navLinks.classList.remove('mobile-active');
                    const icon = menuToggle.querySelector('i');
                    if (icon) {
                        icon.className = 'fas fa-bars';
                    }
                }
            });
        });
    }
    
});

// 创建全新的返回顶部按钮 (v3 - Sleek Compact)
function createBackToTopButton() {
    // 彻底移除所有已知的旧按钮实例
    const oldButtonSelectors = [
        '.back-to-top-new', 
        '.modern-back-to-top', 
        '.floating-back-to-top', 
        '.sleek-back-to-top' // 也包括当前尝试创建的按钮，以防重复执行
    ];
    oldButtonSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(btn => btn.remove());
    });

    // 移除旧样式 (if any)
    const oldStyle = document.getElementById('back-to-top-style');
    if (oldStyle) {
        oldStyle.remove();
    }

    // 创建新按钮元素
    const backToTopButton = document.createElement('button');
    backToTopButton.className = 'sleek-back-to-top';
    backToTopButton.setAttribute('aria-label', '返回顶部');
    
    // 创建带有进度条的按钮结构
    backToTopButton.innerHTML = `
        <svg class="progress-ring" width="50" height="50" viewBox="0 0 50 50">
            <defs>
                <linearGradient id="progress-gradient-dark" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:var(--neon-cyan)" />
                    <stop offset="100%" style="stop-color:var(--neon-green)" />
                </linearGradient>
                <linearGradient id="progress-gradient-light" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:var(--neon-blue)" />
                    <stop offset="100%" style="stop-color:var(--neon-green)" />
                </linearGradient>
            </defs>
            <circle class="progress-ring__circle-bg" cx="25" cy="25" r="20" />
            <circle class="progress-ring__circle" cx="25" cy="25" r="20" />
        </svg>
        <span class="arrow-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                <path d="M12 8.293l-6.293 6.293a1 1 0 01-1.414-1.414l7-7a1 1 0 011.414 0l7 7a1 1 0 01-1.414 1.414L12 8.293z"/>
            </svg>
        </span>
    `;

    document.body.appendChild(backToTopButton);

    // 点击事件
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // 获取进度环元素
    const progressCircle = backToTopButton.querySelector('.progress-ring__circle');
    const circumference = 2 * Math.PI * 20; // 2πr，r=20 (circle radius)
    
    // 设置初始周长
    if (progressCircle) {
        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        progressCircle.style.strokeDashoffset = circumference;
    }

    // 更新进度条函数
    function updateProgressBar() {
        if (!progressCircle) return;
        
        // 计算滚动进度百分比
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercentage = scrollTop / scrollHeight;
        
        // 计算stroke-dashoffset值
        const offset = circumference - (scrollPercentage * circumference);
        progressCircle.style.strokeDashoffset = offset;
    }

    // 滚动显示/隐藏和更新进度条
    window.addEventListener('scroll', () => {
        if (window.scrollY > 200) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
        
        // 更新进度条
        updateProgressBar();
    });
    
    // Initial check
    if (window.scrollY > 200) {
        backToTopButton.classList.add('visible');
    }
    
    // 初始更新进度条
    updateProgressBar();
}

// 独立的返回顶部按钮功能
function initBackToTop() {
    createBackToTopButton();
}

// Ensure the initBackToTop is called after DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackToTop);
} else {
    initBackToTop(); // Or call it directly if DOM is already loaded
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initBackToTop(); // 添加返回顶部按钮初始化

    // 导航栏滚动效果
    const nav = document.querySelector('nav');
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }

    // 添加兼容Safari的剪贴板功能
    const citationButtons = document.querySelectorAll('.citation-btn');
    citationButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bibtex = this.getAttribute('data-bibtex');
            copyToClipboard(bibtex);
        });
    });

    // 平滑滚动到锚点
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 检查talks数量并调整布局
    const talksGrid = document.querySelector('.talks-grid');
    if (talksGrid) {
        const talkCards = talksGrid.querySelectorAll('.talk-card');
        if (talkCards.length === 1) {
            talksGrid.classList.add('single-talk');
        }
    }

    // 添加页面加载动画
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);

    // updateLastCommitTime();
});

// 页脚动态功能
function initFooter() {
    // 更新当前年份
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // 为页脚链接添加悬浮效果
    const footerLinks = document.querySelectorAll('.footer-section a');
    footerLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // 为页脚底部的"回到顶部"链接添加平滑滚动
    const backToTopLinks = document.querySelectorAll('a[href="#"]');
    backToTopLinks.forEach(link => {
        if (link.textContent.includes('回到顶部')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    });
}

// 页面加载完成后初始化页脚
document.addEventListener('DOMContentLoaded', function() {
    initFooter();

});

// 如果页面已经加载完成，立即初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooter);
} else {
    initFooter();
}

// 引用模态对话框功能
document.addEventListener('DOMContentLoaded', function() {
    // 获取模态对话框元素
    const citationModal = document.getElementById('citation-modal');
    const citationText = document.getElementById('citation-text');
    const closeBtn = document.querySelector('.citation-close');
    const copyBtn = document.getElementById('copy-citation-btn');
    
    // 为所有引用按钮添加点击事件
    document.querySelectorAll('.citation-button').forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            
            // 获取引用文件路径
            const citationFile = this.getAttribute('data-citation-file');
            if (!citationFile) return;
            
            try {
                // 获取引用文件内容
                const response = await fetch(citationFile);
                if (!response.ok) {
                    throw new Error('Failed to load citation file');
                }
                
                const data = await response.text();
                citationText.textContent = data;
                
                // 显示模态对话框
                citationModal.style.display = 'block';
                document.body.classList.add('modal-open'); // 使用CSS类控制滚动和补偿
            } catch (error) {
                console.error('Error getting citation information:', error);
                alert('Failed to get citation information, please try again later.');
            }
        });
    });
    
    // 关闭模态对话框
    closeBtn.addEventListener('click', function() {
        citationModal.style.display = 'none';
        document.body.classList.remove('modal-open'); // 移除模态框类
    });
    
    // 点击模态对话框外部关闭
    window.addEventListener('click', function(e) {
        if (e.target === citationModal) {
            citationModal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    });
    
    // 复制引用内容
    copyBtn.addEventListener('click', function() {
        const text = citationText.textContent;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                // 显示复制成功反馈
                copyBtn.classList.add('copy-success');
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copy Success';
                
                // 3秒后恢复按钮状态
                setTimeout(() => {
                    copyBtn.classList.remove('copy-success');
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Citation';
                }, 3000);
            }).catch(err => {
                console.error('Copy failed:', err);
                alert('Copy failed, please copy manually.');
            });
        } else {
            // 备用复制方法
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    copyBtn.classList.add('copy-success');
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copy Success';
                    
                    setTimeout(() => {
                        copyBtn.classList.remove('copy-success');
                        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Citation';
                    }, 3000);
                } else {
                    alert('Copy failed, please copy manually.');
                }
            } catch (err) {
                console.error('Copy failed:', err);
                alert('Copy failed, please copy manually.');
            }
            
            document.body.removeChild(textarea);
        }
    });
});
