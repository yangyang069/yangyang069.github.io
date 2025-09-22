(function () {
    document.documentElement.setAttribute('data-theme', 'light');

    // 阻止页面加载时的默认锚点跳转
    if (window.location.hash) {
        // 临时移除锚点，防止浏览器自动跳转
        const hash = window.location.hash;
        window.history.replaceState(null, null, window.location.pathname + window.location.search);

        // 页面加载完成后恢复锚点并正确定位
        window.addEventListener('load', function() {
            window.history.replaceState(null, null, window.location.pathname + window.location.search + hash);
        });
    }
})();
// 获取最新的 git 提交日期
async function updateLastCommitDate() {
    try {
        // 使用 GitHub API 获取最新提交信息
        const response = await fetch('https://api.github.com/repos/yangyang069/yangyang069.github.io/commits?per_page=1');
        const commits = await response.json();

        if (commits && commits.length > 0) {
            const lastCommitDate = new Date(commits[0].commit.committer.date);
            const options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            const formattedDate = lastCommitDate.toLocaleDateString('en-US', options);
            document.getElementById('last-updated').textContent = formattedDate;
        } else {
            // 如果无法获取提交信息，使用当前日期作为备用
            const now = new Date();
            const options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            const currentDate = now.toLocaleDateString('en-US', options);
            document.getElementById('last-updated').textContent = currentDate;
        }
    } catch (error) {
        console.log('Failed to fetch commit date:', error);
        // 如果 API 调用失败，使用当前日期作为备用
        const now = new Date();
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        const currentDate = now.toLocaleDateString('en-US', options);
        document.getElementById('last-updated').textContent = currentDate;
    }
}

// 处理导航栏链接点击事件，实现平滑滚动（仅桌面端）
function setupSmoothScrolling() {
    const desktopNavLinks = document.querySelectorAll('.desktop-nav a');
    const navTitle = document.querySelector('.nav-title a');

    // 处理导航栏标题链接点击事件
    navTitle.addEventListener('click', function (e) {
        e.preventDefault();

        // 平滑滚动到顶部
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        // 更新活动链接
        desktopNavLinks.forEach(link => link.classList.remove('active'));
        const homeLink = document.querySelector('.desktop-nav a[href="#home"]');
        if (homeLink) homeLink.classList.add('active');
    });

    desktopNavLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            // 只处理页内链接
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();

                const targetId = this.getAttribute('href');

                // 如果是Home链接，滚动到顶部
                if (targetId === '#home') {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                } else {
                    const targetElement = document.querySelector(targetId);

                    if (targetElement) {
                        // 获取导航栏高度
                        const navHeight = document.querySelector('.top-nav').offsetHeight;

                        // 计算目标位置，考虑导航栏高度
                        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;

                        // 平滑滚动到目标位置
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }

                // 更新活动链接
                desktopNavLinks.forEach(link => link.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}

// 处理滚动时导航栏的活动状态更新
function handleScroll() {
    const sections = document.querySelectorAll('section[id], header[id]');
    const desktopNavLinks = document.querySelectorAll('.desktop-nav a');
    const navHeight = document.querySelector('.top-nav').offsetHeight;

    // 监听滚动事件
    window.addEventListener('scroll', function () {
        let current = '';

        // 如果在页面顶部，高亮Home链接
        if (window.pageYOffset < 100) {
            current = '#home';
        } else {
            sections.forEach(section => {
                const sectionTop = section.offsetTop - navHeight - 10;
                const sectionHeight = section.offsetHeight;

                if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                    current = '#' + section.getAttribute('id');
                }
            });
        }

        // 更新活动链接（仅桌面端）
        desktopNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === current) {
                link.classList.add('active');
            }
        });
    });
}

// 处理滚动时导航栏的样式变化
function handleNavbarScroll() {
    const topNav = document.querySelector('.top-nav');
    const navContainer = document.querySelector('.nav-container');
    const navTitle = document.querySelector('.nav-title a');

    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            topNav.classList.add('scrolled');
            navContainer.classList.add('scrolled');
            navTitle.classList.add('scrolled');
        } else {
            topNav.classList.remove('scrolled');
            navContainer.classList.remove('scrolled');
            navTitle.classList.remove('scrolled');
        }
    });
}

// 移动端汉堡菜单功能
function setupMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const mobileNavClose = document.getElementById('mobileNavClose');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav a');

    // 检查必要元素是否存在
    if (!mobileMenuToggle || !mobileNav || !mobileNavOverlay) {
        return;
    }

    // 汉堡菜单点击事件
    mobileMenuToggle.addEventListener('click', function() {
        const icon = mobileMenuToggle.querySelector('i');
        mobileMenuToggle.classList.toggle('active');
        mobileNav.classList.toggle('active');
        mobileNavOverlay.classList.toggle('active');

        // 切换图标和页面滚动
        if (mobileMenuToggle.classList.contains('active')) {
            icon.className = 'fas fa-times';
            document.body.classList.add('mobile-menu-open');
        } else {
            icon.className = 'fas fa-bars';
            document.body.classList.remove('mobile-menu-open');
        }
    });

    // 移动端菜单链接点击事件
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // 只处理页内链接
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();

                const targetId = this.getAttribute('href');
                const icon = mobileMenuToggle.querySelector('i');
                mobileMenuToggle.classList.remove('active');
                mobileNav.classList.remove('active');
                mobileNavOverlay.classList.remove('active');
                document.body.classList.remove('mobile-menu-open');
                icon.className = 'fas fa-bars';

                // 如果是Home链接，滚动到顶部
                if (targetId === '#home') {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                } else {
                    const targetElement = document.querySelector(targetId);

                    if (targetElement) {
                        const navHeight = document.querySelector('.nav-container').offsetHeight;

                        // 使用 offsetTop 获取元素相对于文档的绝对位置
                        const elementTop = targetElement.offsetTop;

                        // 滚动到目标位置，让目标元素顶部紧贴导航栏下方
                        const targetPosition = elementTop - navHeight-10;

                        // 平滑滚动到目标位置
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }

                // 更新活动链接（桌面端）
                const desktopNavLinks = document.querySelectorAll('.desktop-nav a');
                desktopNavLinks.forEach(link => link.classList.remove('active'));
                const correspondingDesktopLink = document.querySelector(`.desktop-nav a[href="${targetId}"]`);
                if (correspondingDesktopLink) {
                    correspondingDesktopLink.classList.add('active');
                }
            }
        });
    });

    // 点击页面其他地方关闭菜单
    document.addEventListener('click', function(e) {
        if (!mobileMenuToggle.contains(e.target) && !mobileNav.contains(e.target)) {
            const icon = mobileMenuToggle.querySelector('i');
            mobileMenuToggle.classList.remove('active');
            mobileNav.classList.remove('active');
            mobileNavOverlay.classList.remove('active');
            document.body.classList.remove('mobile-menu-open');
            icon.className = 'fas fa-bars';
        }
    });

    // 点击遮罩层关闭菜单
    mobileNavOverlay.addEventListener('click', function() {
        const icon = mobileMenuToggle.querySelector('i');
        mobileMenuToggle.classList.remove('active');
        mobileNav.classList.remove('active');
        mobileNavOverlay.classList.remove('active');
        document.body.classList.remove('mobile-menu-open');
        icon.className = 'fas fa-bars';
    });
}

// 禁用包含"Under Review"的条目的链接（标题和 pub-links）
function disableUnderReviewLinks() {
    document.querySelectorAll('.publication-item').forEach(item => {
        const hasUnderReview = item.querySelector('.venue-rank')?.textContent.trim().toLowerCase() === 'under review';
        if (!hasUnderReview) return;
        // 标题链接
        const titleLink = item.querySelector('.pub-content h3 a');
        if (titleLink) {
            titleLink.classList.add('link-disabled');
            titleLink.removeAttribute('href');
            titleLink.removeAttribute('target');
        }
        // pub-links 内的链接
        item.querySelectorAll('.pub-links a').forEach(a => {
            a.classList.add('link-disabled');
            a.removeAttribute('href');
            a.removeAttribute('target');
        });
    });
}

// Publications 过滤和排序功能
function setupPublicationsFilter() {
    const showSelectedLink = document.getElementById('show-selected-link');
    const showAllLink = document.getElementById('show-all-link');
    const publicationsList = document.querySelector('.publications-list');

    if (!showSelectedLink || !showAllLink || !publicationsList) return;

    // 获取所有publication项目
    const allPublications = Array.from(document.querySelectorAll('.publication-item'));

    // 显示已接收的文章（没有under review标志）
    function showSelectedPublications() {
        // 清空列表
        publicationsList.innerHTML = '';

        // 过滤已接收的文章
        const acceptedPublications = allPublications.filter(item => {
            return item.dataset.status === 'accepted';
        });

        // 按日期排序（最新的在前）
        acceptedPublications.sort((a, b) => {
            const dateA = new Date(a.dataset.date + '-01');
            const dateB = new Date(b.dataset.date + '-01');
            return dateB - dateA;
        });

        // 添加到列表
        acceptedPublications.forEach(item => {
            publicationsList.appendChild(item);
        });

        // 更新链接状态
        showSelectedLink.classList.add('active');
        showSelectedLink.classList.remove('inactive');
        showAllLink.classList.remove('active');
        showAllLink.classList.add('inactive');
    }

    // 显示所有文章，按年份分组
    function showAllPublications() {
        // 清空列表
        publicationsList.innerHTML = '';

        // 按年份分组
        const publicationsByYear = {};
        allPublications.forEach(item => {
            const year = item.dataset.date.split('-')[0];
            if (!publicationsByYear[year]) {
                publicationsByYear[year] = [];
            }
            publicationsByYear[year].push(item);
        });

        // 按年份排序（最新的在前）
        const sortedYears = Object.keys(publicationsByYear).sort((a, b) => b - a);

        // 为每个年份创建分组
        sortedYears.forEach(year => {
            // 创建年份标题
            const yearHeader = document.createElement('div');
            yearHeader.className = 'year-header';
            yearHeader.innerHTML = `<h3>${year} (${publicationsByYear[year].length})</h3>`;
            publicationsList.appendChild(yearHeader);

            // 按日期排序该年份的文章（最新的在前）
            const yearPublications = publicationsByYear[year].sort((a, b) => {
                const dateA = new Date(a.dataset.date + '-01');
                const dateB = new Date(b.dataset.date + '-01');
                return dateB - dateA;
            });

            // 添加该年份的文章
            yearPublications.forEach(item => {
                // 确保under-review文章在show all模式下可见
                if (item.dataset.status === 'under-review') {
                    item.style.display = 'flex';
                }
                publicationsList.appendChild(item);
            });
        });

        // 更新链接状态
        showAllLink.classList.add('active');
        showAllLink.classList.remove('inactive');
        showSelectedLink.classList.remove('active');
        showSelectedLink.classList.add('inactive');
    }

    // 绑定点击事件
    showSelectedLink.addEventListener('click', showSelectedPublications);
    showAllLink.addEventListener('click', showAllPublications);

    // 默认显示已选择的文章
    showSelectedPublications();
}

// Carousel functionality
function setupCarousel() {
    const carouselTrack = document.getElementById('carouselTrack');
    const carouselPrev = document.getElementById('carouselPrev');
    const carouselNext = document.getElementById('carouselNext');
    const indicators = document.querySelectorAll('.indicator');
    const carouselContainer = document.querySelector('.carousel-container');
    const slides = document.querySelectorAll('.carousel-slide');
    
    if (!carouselTrack || !carouselPrev || !carouselNext) {
        return;
    }
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    let autoPlayInterval;
    const autoPlayDelay = 5000; // 5 seconds
    let isAnimating = false;
    
    // 向前移动的函数 - 从最后一张到第一张也是向前移动
    function moveNext() {
        if (isAnimating) return;
        isAnimating = true;
        
        // 先移除所有active类
        slides.forEach(slide => slide.classList.remove('active'));
        
        // 计算下一张幻灯片的索引
        const nextSlide = (currentSlide + 1) % totalSlides;
        
        // 如果是从最后一张到第一张
        if (currentSlide === totalSlides - 1 && nextSlide === 0) {
            // 先将第一张幻灯片克隆并添加到轨道末尾
            const firstSlideClone = slides[0].cloneNode(true);
            carouselTrack.appendChild(firstSlideClone);
            
            // 向左移动到克隆的幻灯片
            carouselTrack.style.transition = 'transform 0.5s ease';
            carouselTrack.style.transform = `translateX(-${totalSlides * 50}%)`;
            
            // 动画结束后，重置位置
            setTimeout(() => {
                carouselTrack.style.transition = 'none';
                carouselTrack.style.transform = 'translateX(0)';
                carouselTrack.removeChild(firstSlideClone);
                slides[0].classList.add('active');
                isAnimating = false;
            }, 500);
            
            currentSlide = 0;
        } else {
            // 正常向前移动
            carouselTrack.style.transition = 'transform 0.5s ease';
            carouselTrack.style.transform = `translateX(-${nextSlide * 50}%)`;
            slides[nextSlide].classList.add('active');
            
            setTimeout(() => {
                isAnimating = false;
            }, 500);
            
            currentSlide = nextSlide;
        }
        
        // 更新指示器
        if (indicators.length > 0) {
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentSlide);
            });
        }
    }
    
    // 向后移动的函数 - 从第一张到最后一张也是向后移动
    function movePrev() {
        if (isAnimating) return;
        isAnimating = true;
        
        // 先移除所有active类
        slides.forEach(slide => slide.classList.remove('active'));
        
        // 计算上一张幻灯片的索引
        const prevSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        
        // 如果是从第一张到最后一张
        if (currentSlide === 0 && prevSlide === totalSlides - 1) {
            // 先将最后一张幻灯片克隆并添加到轨道开头
            const lastSlideClone = slides[totalSlides - 1].cloneNode(true);
            carouselTrack.insertBefore(lastSlideClone, carouselTrack.firstChild);
            
            // 立即调整位置，让克隆的幻灯片在左侧
            carouselTrack.style.transition = 'none';
            carouselTrack.style.transform = 'translateX(-50%)';
            
            // 强制浏览器重绘
            carouselTrack.offsetHeight;
            
            // 向右移动到克隆的幻灯片
            carouselTrack.style.transition = 'transform 0.5s ease';
            carouselTrack.style.transform = 'translateX(0)';
            
            // 动画结束后，重置位置
            setTimeout(() => {
                carouselTrack.style.transition = 'none';
                carouselTrack.style.transform = `translateX(-${prevSlide * 50}%)`;
                carouselTrack.removeChild(lastSlideClone);
                slides[prevSlide].classList.add('active');
                isAnimating = false;
            }, 500);
            
            currentSlide = prevSlide;
        } else {
            // 正常向后移动
            carouselTrack.style.transition = 'transform 0.5s ease';
            carouselTrack.style.transform = `translateX(-${prevSlide * 50}%)`;
            slides[prevSlide].classList.add('active');
            
            setTimeout(() => {
                isAnimating = false;
            }, 500);
            
            currentSlide = prevSlide;
        }
        
        // 更新指示器
        if (indicators.length > 0) {
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentSlide);
            });
        }
    }
    
    // 自动播放
    function startAutoPlay() {
        autoPlayInterval = setInterval(moveNext, autoPlayDelay);
    }
    
    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    }
    
    // 左右按钮分别控制不同方向的循环播放
    carouselNext.addEventListener('click', function() {
        moveNext(); // 向右按钮 - 向前移动
        stopAutoPlay();
        startAutoPlay();
    });
    
    carouselPrev.addEventListener('click', function() {
        movePrev(); // 向左按钮 - 向后移动
        stopAutoPlay();
        startAutoPlay();
    });
    
    // 指示器 - 直接跳转到指定幻灯片
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', function() {
            if (index !== currentSlide && !isAnimating) {
                isAnimating = true;
                
                // 先移除所有active类
                slides.forEach(slide => slide.classList.remove('active'));
                
                // 设置目标幻灯片为active
                slides[index].classList.add('active');
                
                // 移动到目标幻灯片
                carouselTrack.style.transition = 'transform 0.5s ease';
                carouselTrack.style.transform = `translateX(-${index * 50}%)`;
                
                setTimeout(() => {
                    isAnimating = false;
                }, 500);
                
                currentSlide = index;
                
                // 更新指示器
                indicators.forEach((ind, i) => {
                    ind.classList.toggle('active', i === currentSlide);
                });
                
                stopAutoPlay();
                startAutoPlay();
            }
        });
    });
    
    // 鼠标悬停
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', stopAutoPlay);
        carouselContainer.addEventListener('mouseleave', startAutoPlay);
    }
    
    // 键盘导航 - 左右箭头分别控制不同方向的循环播放
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            movePrev(); // 左箭头 - 向后移动
            stopAutoPlay();
            startAutoPlay();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            moveNext(); // 右箭头 - 向前移动
            stopAutoPlay();
            startAutoPlay();
        }
    });
    
    // 触摸事件 - 左右滑动分别控制不同方向的循环播放
    let touchStartX = 0;
    
    carouselContainer?.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoPlay();
    });
    
    carouselContainer?.addEventListener('touchend', function(e) {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                // 向左滑动 - 向前移动
                moveNext();
            } else {
                // 向右滑动 - 向后移动
                movePrev();
            }
        }
        startAutoPlay();
    });
    
    // 初始化
    slides[0].classList.add('active');
    carouselTrack.style.transform = 'translateX(0)';
    if (indicators.length > 0) {
        indicators[0].classList.add('active');
    }
    startAutoPlay();
    
    // 可见性变化
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            stopAutoPlay();
        } else {
            startAutoPlay();
        }
    });
}


document.addEventListener('DOMContentLoaded', function () {
    updateLastCommitDate();
    setupSmoothScrolling();
    handleScroll();
    handleNavbarScroll();
    setupMobileMenu();
    disableUnderReviewLinks();
    setupPublicationsFilter();
    setupCarousel(); // Initialize carousel
});

// 回到顶部按钮功能
document.addEventListener('DOMContentLoaded', function () {
    const backToTopButton = document.getElementById('backToTop');

    if (!backToTopButton) return;

    // 监听滚动事件
    window.addEventListener('scroll', function () {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    // 点击事件
    backToTopButton.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});
