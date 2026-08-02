// ============================================
// Roblox Auth App — Main JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initSmoothScroll();
    initNavbarScroll();
    initActiveLinkHighlight();
    initFadeInAnimations();
});

// Mobile Menu Toggle
function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    if (!menuBtn || !mobileNav) return;

    menuBtn.addEventListener('click', function() {
        mobileNav.classList.toggle('open');
        const spans = menuBtn.querySelectorAll('span');
        if (mobileNav.classList.contains('open')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('open');
            const spans = menuBtn.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });
}

// Smooth Scroll for Anchor Links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Navbar Scroll Effect
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    window.addEventListener('scroll', function() {
        navbar.style.boxShadow = window.pageYOffset > 10 ? '0 4px 20px rgba(0,0,0,0.3)' : 'none';
    });
}

// Active Link Highlighting in TOC
function initActiveLinkHighlight() {
    const sections = document.querySelectorAll('.legal-content section');
    const tocLinks = document.querySelectorAll('.legal-toc a');
    if (!sections.length || !tocLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                tocLinks.forEach(link => {
                    link.style.background = '';
                    link.style.color = '';
                    if (link.getAttribute('href') === '#' + id) {
                        link.style.background = 'var(--bg-tertiary)';
                        link.style.color = 'var(--text-primary)';
                    }
                });
            }
        });
    }, { root: null, rootMargin: '-20% 0px -60% 0px', threshold: 0 });

    sections.forEach(section => observer.observe(section));
}

// Fade-in Animations on Scroll
function initFadeInAnimations() {
    const fadeElements = document.querySelectorAll('.feature-card, .legal-card');
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        fadeObserver.observe(el);
    });
}

// Toast Notification
function showComingSoon() {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}
