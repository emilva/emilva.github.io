/*
 * Slide Navigation
 * View Transitions API, keyboard, touch, hash navigation
 */

const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;
const progress = document.getElementById('progress');
const counter = document.getElementById('counter');
let currentSlide = 0;

// Progressive within-slide reveal: elements with [data-step] appear one step per click.
function maxStep(s) { let m = 0; s.querySelectorAll('[data-step]').forEach(e => { const v = +e.dataset.step; if (v > m) m = v; }); return m; }
function curReveal(s) { return +(s.dataset.reveal || 0); }
function startReveal(s) { return +(s.dataset.revealStart || 0); }
function applyStep(s, k) {
    s.dataset.reveal = k;
    s.querySelectorAll('[data-step]').forEach(e => e.classList.toggle('on', +e.dataset.step <= k));
}

function transitionTo(n, back) {
    slides[currentSlide].classList.remove('active');
    currentSlide = Math.max(0, Math.min(n, totalSlides - 1));
    slides[currentSlide].classList.add('active');
    // Reset reveal: entering forward shows nothing yet; entering backward shows all.
    if (maxStep(slides[currentSlide]) > 0) applyStep(slides[currentSlide], back ? maxStep(slides[currentSlide]) : startReveal(slides[currentSlide]));

    // Progress bar
    progress.style.width = ((currentSlide + 1) / totalSlides * 100) + '%';

    // Counter: hide on title and section-divider slides
    const isSpecial = slides[currentSlide].classList.contains('section-divider') ||
                      slides[currentSlide].classList.contains('title-slide');
    progress.style.opacity = isSpecial ? '0' : '1';
    counter.style.opacity = isSpecial ? '0' : '1';
    counter.textContent = `${currentSlide + 1} \u2044 ${totalSlides}`;

    // URL hash
    history.replaceState(null, null, '#' + (currentSlide + 1));
}

function showSlide(n, back) {
    if (n === currentSlide) return;

    if (document.startViewTransition) {
        document.startViewTransition(() => transitionTo(n, back));
    } else {
        transitionTo(n, back);
    }
}

function nextSlide() {
    const s = slides[currentSlide];
    if (maxStep(s) > curReveal(s)) { applyStep(s, curReveal(s) + 1); return; }
    if (currentSlide < totalSlides - 1) showSlide(currentSlide + 1, false);
}

function prevSlide() {
    const s = slides[currentSlide];
    if (curReveal(s) > startReveal(s)) { applyStep(s, curReveal(s) - 1); return; }
    if (currentSlide > 0) showSlide(currentSlide - 1, true);
}

function getSlideFromHash() {
    const n = parseInt(window.location.hash.slice(1), 10);
    return (n >= 1 && n <= totalSlides) ? n - 1 : 0;
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'PageDown':
            e.preventDefault();
            nextSlide();
            break;
        case 'ArrowLeft':
        case 'PageUp':
            e.preventDefault();
            prevSlide();
            break;
        case 'Home':
            e.preventDefault();
            showSlide(0);
            break;
        case 'End':
            e.preventDefault();
            showSlide(totalSlides - 1);
            break;
    }
});

// Touch / swipe navigation
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    const dy = touchStartY - e.changedTouches[0].clientY;
    // Only trigger on horizontal swipe, not vertical scroll
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        dx > 0 ? nextSlide() : prevSlide();
    }
});

// Hash navigation
window.addEventListener('hashchange', () => {
    const target = getSlideFromHash();
    if (target !== currentSlide) showSlide(target);
});

// Initialize
transitionTo(getSlideFromHash());
