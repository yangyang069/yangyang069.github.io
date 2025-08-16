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

    // 点击关闭按钮关闭菜单（如果存在的话）
    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', function() {
            const icon = mobileMenuToggle.querySelector('i');
            mobileMenuToggle.classList.remove('active');
            mobileNav.classList.remove('active');
            mobileNavOverlay.classList.remove('active');
            document.body.classList.remove('mobile-menu-open');
            icon.className = 'fas fa-bars';
        });
    }
}



// 禁用包含“Under Review”的条目的链接（标题和 pub-links）
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

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function () {
    updateLastCommitDate();
    setupSmoothScrolling();
    handleScroll();
    handleNavbarScroll();
    setupMobileMenu();
    disableUnderReviewLinks();
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
