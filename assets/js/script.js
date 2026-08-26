document.addEventListener('DOMContentLoaded', function() {
    // Smooth Anchor Scrolling
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || !targetId) return;
            
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                e.preventDefault();
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Dynamic Copyright Year
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    initializeThemeToggle();
    initializeNavVisibility();
    initializeProjects();

    function initializeThemeToggle() {
        const root = document.documentElement;
        const toggle = document.querySelector('.theme-toggle');
        const graphImg = document.getElementById('contribution-graph-img');
        if (!toggle) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const savedTheme = localStorage.getItem('theme');
        const initialTheme = savedTheme || (mediaQuery.matches ? 'dark' : 'light');
        
        setTheme(initialTheme, false);

        toggle.addEventListener('click', () => {
            const currentTheme = root.getAttribute('data-bs-theme');
            const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', nextTheme);
            setTheme(nextTheme, true);
        });

        // Listen for OS system theme changes
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', e => {
                if (!localStorage.getItem('theme')) {
                    setTheme(e.matches ? 'dark' : 'light', true);
                }
            });
        }

        function setTheme(theme, withTransition = false) {
            const isDark = theme === 'dark';

            if (withTransition) {
                document.body.classList.add('theme-transition');
                setTimeout(() => {
                    document.body.classList.remove('theme-transition');
                }, 350);
            }

            root.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
            toggle.innerHTML = `<i class="bi ${isDark ? 'bi-sun-fill' : 'bi-moon-fill'}" aria-hidden="true"></i>`;
            toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
            toggle.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');

            // Dynamically update contribution graph base color
            if (graphImg) {
                const accentColor = isDark ? '2dd4bf' : '0d9488';
                graphImg.src = `https://ghchart.rshah.org/${accentColor}/ian20040409`;
            }
        }
    }

    function initializeNavVisibility() {
        const nav = document.querySelector('.site-nav');
        if (!nav) return;

        const mobileQuery = window.matchMedia('(max-width: 768px)');
        let lastScrollY = window.scrollY;
        let accumulatedDownScroll = 0;
        let isTicking = false;

        const TOP_SAFE_ZONE = 200;       // Stay visible within top 200px
        const HIDE_SCROLL_DISTANCE = 60; // Require 60px continuous downward scroll to hide
        const SHOW_SCROLL_DISTANCE = 8;  // Require only 8px upward scroll to reveal

        function updateNavVisibility() {
            // Navbar auto-hide only runs on mobile phones
            if (!mobileQuery.matches) {
                nav.classList.remove('is-hidden');
                accumulatedDownScroll = 0;
                lastScrollY = Math.max(window.scrollY, 0);
                isTicking = false;
                return;
            }

            const currentScrollY = Math.max(window.scrollY, 0);
            const delta = currentScrollY - lastScrollY;

            if (currentScrollY <= TOP_SAFE_ZONE) {
                nav.classList.remove('is-hidden');
                accumulatedDownScroll = 0;
            } else if (delta > 0) {
                // Scrolling downwards
                accumulatedDownScroll += delta;
                if (accumulatedDownScroll >= HIDE_SCROLL_DISTANCE) {
                    nav.classList.add('is-hidden');
                }
            } else if (delta < -SHOW_SCROLL_DISTANCE) {
                // Scrolling upwards
                nav.classList.remove('is-hidden');
                accumulatedDownScroll = 0;
            }

            lastScrollY = currentScrollY;
            isTicking = false;
        }

        window.addEventListener('scroll', () => {
            if (!isTicking) {
                window.requestAnimationFrame(updateNavVisibility);
                isTicking = true;
            }
        }, { passive: true });

        // Ensure nav is always visible when resizing to desktop
        if (mobileQuery.addEventListener) {
            mobileQuery.addEventListener('change', e => {
                if (!e.matches) {
                    nav.classList.remove('is-hidden');
                    accumulatedDownScroll = 0;
                }
            });
        }
    }
});

const githubIcon = '<svg class="github-icon" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.24c0 4.52 2.87 8.36 6.84 9.71.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.22-3.37-1.22-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .08 1.53 1.06 1.53 1.06.9 1.59 2.35 1.13 2.92.86.09-.67.35-1.13.64-1.39-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.2 9.2 0 0 1 12 7.14c.85 0 1.71.12 2.51.36 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.59.69.49A10.25 10.25 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z"/></svg>';
const languageColors = {
    Swift: '#FA7343',
    Python: '#3776AB',
    JavaScript: '#F7DF1E',
    TypeScript: '#3178C6',
    HTML: '#E34F26',
    CSS: '#1572B6',
    'C++': '#F34B7D',
    Dart: '#00B4AB',
    Kotlin: '#A97BFF'
};

let publicProjects = [];
let showAllProjects = false;
let activeCategory = 'all';

const categoryLanguages = {
    mobile: ['Swift', 'Kotlin', 'Dart'],
    python: ['Python'],
    web: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'C++']
};

async function initializeProjects() {
    const status = document.getElementById('projects-status');
    try {
        const response = await fetch('https://api.github.com/users/ian20040409/repos?type=owner&sort=updated&per_page=100');
        if (!response.ok) throw new Error('Unable to load projects');
        
        publicProjects = (await response.json()).filter(repo => !repo.fork && repo.name.toLowerCase() !== 'fork');
        updateGitHubStats();
        initializeCategoryFilters();
        populateLanguageFilter();
        renderProjects();
    } catch (error) {
        if (status) {
            status.textContent = 'Repositories could not be loaded right now. View all public repositories on GitHub.';
            status.classList.add('is-error');
        }
    }
}

function updateGitHubStats() {
    const languages = new Set(publicProjects.map(repo => repo.language).filter(Boolean));
    const stars = publicProjects.reduce((total, repo) => total + (repo.stargazers_count || 0), 0);
    
    const repoStat = document.getElementById('repo-stat');
    const starStat = document.getElementById('star-stat');
    const languageStat = document.getElementById('language-stat');
    
    if (repoStat) repoStat.textContent = publicProjects.length;
    if (starStat) starStat.textContent = stars;
    if (languageStat) languageStat.textContent = languages.size;
}

function initializeCategoryFilters() {
    document.querySelectorAll('.category-filter').forEach(button => {
        button.addEventListener('click', () => {
            activeCategory = button.dataset.category;
            document.querySelectorAll('.category-filter').forEach(item => item.classList.toggle('is-active', item === button));
            
            const langFilter = document.getElementById('language-filter');
            if (langFilter) langFilter.value = '';
            
            showAllProjects = false;
            updateClearFiltersButton();
            renderProjects();
        });
    });
}

function populateLanguageFilter() {
    const filter = document.getElementById('language-filter');
    const search = document.getElementById('project-search');
    const clearButton = document.getElementById('clear-filters');
    const showMoreBtn = document.getElementById('show-more-projects');
    
    if (filter) {
        const uniqueLanguages = [...new Set(publicProjects.map(repo => repo.language).filter(Boolean))].sort();
        uniqueLanguages.forEach(language => {
            const option = document.createElement('option');
            option.value = language;
            option.textContent = language;
            filter.appendChild(option);
        });

        filter.addEventListener('change', () => {
            activeCategory = 'all';
            document.querySelectorAll('.category-filter').forEach(item => item.classList.toggle('is-active', item.dataset.category === 'all'));
            updateClearFiltersButton();
            renderProjects();
        });
    }

    if (search) {
        search.addEventListener('input', () => {
            showAllProjects = false;
            updateClearFiltersButton();
            renderProjects();
        });
    }

    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', () => {
            showAllProjects = !showAllProjects;
            renderProjects();
            if (!showAllProjects) {
                const projectsSection = document.getElementById('projects');
                if (projectsSection) {
                    projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    }

    if (clearButton) {
        clearButton.addEventListener('click', () => {
            if (search) search.value = '';
            if (filter) filter.value = '';
            activeCategory = 'all';
            showAllProjects = false;
            document.querySelectorAll('.category-filter').forEach(item => item.classList.toggle('is-active', item.dataset.category === 'all'));
            updateClearFiltersButton();
            renderProjects();
            if (search) search.focus();
        });
    }
}

function updateClearFiltersButton() {
    const button = document.getElementById('clear-filters');
    const search = document.getElementById('project-search');
    const filter = document.getElementById('language-filter');
    if (!button) return;
    
    const hasSearch = search && search.value.trim() !== '';
    const hasFilter = filter && filter.value !== '';
    const hasCategory = activeCategory !== 'all';
    
    button.hidden = !hasSearch && !hasFilter && !hasCategory;
}

function renderProjects() {
    const grid = document.getElementById('projects-grid');
    const searchInput = document.getElementById('project-search');
    const filterSelect = document.getElementById('language-filter');
    const countEl = document.getElementById('project-count');
    const statusEl = document.getElementById('projects-status');
    const showMoreButton = document.getElementById('show-more-projects');

    if (!grid) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const language = filterSelect ? filterSelect.value : '';
    
    const visibleProjects = publicProjects.filter(repo => {
        const searchableText = `${repo.name} ${repo.description || ''}`.toLowerCase();
        const categoryMatch = activeCategory === 'all' || (categoryLanguages[activeCategory] || []).includes(repo.language);
        return searchableText.includes(query) && (!language || repo.language === language) && categoryMatch;
    });

    const displayProjects = showAllProjects ? visibleProjects : visibleProjects.slice(0, 6);
    
    if (countEl) {
        countEl.textContent = `${visibleProjects.length} public ${visibleProjects.length === 1 ? 'repository' : 'repositories'}`;
    }
    
    if (statusEl) {
        statusEl.textContent = visibleProjects.length ? '' : 'No repositories match your filters.';
    }

    if (showMoreButton) {
        showMoreButton.hidden = visibleProjects.length <= 6;
        showMoreButton.innerHTML = `${showAllProjects ? 'Show less' : 'Show all repositories'} <svg class="projects-toggle-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`;
        showMoreButton.setAttribute('aria-expanded', String(showAllProjects));
    }

    grid.innerHTML = displayProjects.map(createProjectCard).join('');
}

function createProjectCard(repo) {
    const language = repo.language || 'Other';
    const color = languageColors[language] || '#64748b';
    const description = repo.description || 'Open-source project on GitHub';
    
    return `
        <div class="col-lg-4 col-md-6 mb-4">
            <article class="card repo-card">
                <div class="card-body">
                    <h5 class="card-title">
                        <a href="${repo.html_url}" target="_blank" rel="noopener">${escapeHtml(repo.name)}</a>
                    </h5>
                    <p class="card-text">${escapeHtml(description)}</p>
                    <div class="project-card-footer">
                        <small class="text-muted d-inline-flex align-items-center">
                            <span class="language-dot" style="background-color: ${color}"></span>
                            ${escapeHtml(language)}
                        </small>
                        <a href="${repo.html_url}" class="btn btn-outline-primary" target="_blank" rel="noopener" aria-label="Open ${escapeHtml(repo.name)} on GitHub">
                            ${githubIcon} View
                        </a>
                    </div>
                </div>
            </article>
        </div>
    `;
}

function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#039;',
        '"': '&quot;'
    }[character]));
}
