// Theme Toggle
function toggleTheme() {
    const htmlElement = document.documentElement;
    const currentTheme = htmlElement.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-bs-theme', newTheme);
    updateToggleButton(newTheme);
    
    // Save theme preference
    localStorage.setItem('theme', newTheme);
}

function updateToggleButton(theme) {
    const button = document.querySelector('.theme-toggle i');
    if (theme === 'dark') {
        button.className = 'bi bi-sun-fill';
    } else {
        button.className = 'bi bi-moon-fill';
    }
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
    updateToggleButton(savedTheme);
    
    // Start typing animation
    startTypingAnimation();
});

// Typing Animation
function startTypingAnimation() {
    const phrases = [
        "Welcome to my GitHub!",
        "Vibe Coding",
        "UI Perfectionist", 
        "Learning by Doing",
        "Simple Design, Obsessive Details"
    ];
    
    let currentPhraseIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    const typingElement = document.getElementById('typing-text');
    
    function type() {
        const currentPhrase = phrases[currentPhraseIndex];
        
        if (isDeleting) {
            typingElement.textContent = currentPhrase.substring(0, currentCharIndex - 1);
            currentCharIndex--;
        } else {
            typingElement.textContent = currentPhrase.substring(0, currentCharIndex + 1);
            currentCharIndex++;
        }
        
        let typingSpeed = isDeleting ? 50 : 100;
        
        if (!isDeleting && currentCharIndex === currentPhrase.length) {
            typingSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && currentCharIndex === 0) {
            isDeleting = false;
            currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
            typingSpeed = 500; // Pause before next phrase
        }
        
        setTimeout(type, typingSpeed);
    }
    
    type();
}

// GitHub API Integration
async function loadMoreRepositories() {
    const container = document.getElementById('repositories-container');
    const spinner = document.getElementById('loading-spinner');
    const loadButton = document.querySelector('button[onclick="loadMoreRepositories()"]');
    
    try {
        spinner.classList.remove('d-none');
        loadButton.disabled = true;
        loadButton.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Loading...';
        
        const response = await fetch('https://api.github.com/users/ian20040409/repos?sort=updated&per_page=12');
        
        if (!response.ok) {
            throw new Error('Failed to fetch repositories');
        }
        
        const repos = await response.json();
        
        // Filter out the featured repos
        const featuredRepos = [
            'Music-ChatBot-web-ui',
            'MusicAI-webview-ios', 
            'EeveeSpotifyReborn'
        ];
        
        const filteredRepos = repos.filter(repo => !featuredRepos.includes(repo.name));
        
        container.innerHTML = '';
        
        filteredRepos.forEach((repo, index) => {
            const repoCard = createRepositoryCard(repo);
            container.appendChild(repoCard);
            
            // Add staggered animation
            setTimeout(() => {
                repoCard.classList.add('fade-in');
            }, index * 100);
        });
        
        loadButton.style.display = 'none';
        
    } catch (error) {
        console.error('Error loading repositories:', error);
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning text-center">
                    <i class="bi bi-exclamation-triangle"></i>
                    Unable to load repositories. Please check your internet connection.
                </div>
            </div>
        `;
    } finally {
        spinner.classList.add('d-none');
        loadButton.disabled = false;
        loadButton.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Load All Repositories';
    }
}

function createRepositoryCard(repo) {
    const col = document.createElement('div');
    col.className = 'col-lg-4 col-md-6 mb-4';
    
    const languageColor = getLanguageColor(repo.language);
    const updatedDate = new Date(repo.updated_at).toLocaleDateString();
    
    col.innerHTML = `
        <div class="card repo-card shadow-sm h-100 border-0">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <h5 class="card-title mb-0">
                        <a href="${repo.html_url}" target="_blank" class="text-decoration-none">
                            <i class="bi bi-folder"></i> ${repo.name}
                        </a>
                    </h5>
                    ${repo.fork ? '<i class="bi bi-diagram-2 text-muted" title="Forked"></i>' : ''}
                </div>
                
                <p class="card-text text-muted">${repo.description || 'No description available.'}</p>
                
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        ${repo.language ? `
                            <span class="language-dot language-${repo.language.toLowerCase()}"></span>
                            <small class="text-muted me-3">${repo.language}</small>
                        ` : ''}
                        
                        <small class="text-muted">
                            <i class="bi bi-star"></i> ${repo.stargazers_count}
                        </small>
                    </div>
                    
                    <small class="text-muted">Updated ${updatedDate}</small>
                </div>
                
                ${repo.topics && repo.topics.length > 0 ? `
                    <div class="mt-2">
                        ${repo.topics.slice(0, 3).map(topic => 
                            `<span class="badge bg-light text-dark me-1">${topic}</span>`
                        ).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    return col;
}

function getLanguageColor(language) {
    const colors = {
        'Swift': '#FA7343',
        'Python': '#3776AB',
        'JavaScript': '#F7DF1E',
        'TypeScript': '#007ACC',
        'HTML': '#E34F26',
        'CSS': '#1572B6',
        'Java': '#ED8B00',
        'C++': '#00599C',
        'C#': '#239120'
    };
    return colors[language] || '#6c757d';
}

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
