const practiceApiBase = '/api/practice';
const tagsApiEndpoint = `${practiceApiBase}/tags`;
const usernameStorageKey = 'tickskills.practice.username';
const starredStoragePrefix = 'tickskills.practice.starred.';

let availableTags = [];
let activeUsername = null;
let practiceQuestions = [];
let originalPracticeQuestions = []; // Store original questions when showing random
let practiceStats = null;
let starredQuestionIds = new Set();
let isLoadingData = false;
let isShowingRandomQuestions = false;

function getStarredStorageKey(username) {
    return `${starredStoragePrefix}${username}`;
}

function initializeUser() {
    // Skip login - use default demo user for now
    activeUsername = 'demo-user';
    localStorage.setItem(usernameStorageKey, activeUsername);
    loadStarredState();
}

function loadStarredState() {
    if (!activeUsername) {
        starredQuestionIds = new Set();
        return;
    }

    try {
        const raw = localStorage.getItem(getStarredStorageKey(activeUsername));
        if (!raw) {
            starredQuestionIds = new Set();
            return;
        }
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            starredQuestionIds = new Set(parsed.map(Number));
        } else {
            starredQuestionIds = new Set();
        }
    } catch (error) {
        console.warn('Failed to load starred questions from storage', error);
        starredQuestionIds = new Set();
    }
}

function persistStarredState() {
    if (!activeUsername) {
        return;
    }
    try {
        const raw = JSON.stringify(Array.from(starredQuestionIds));
        localStorage.setItem(getStarredStorageKey(activeUsername), raw);
    } catch (error) {
        console.warn('Failed to persist starred questions', error);
    }
}

function mapPracticeQuestionDto(dto, previous = null) {
    if (!dto) {
        return null;
    }

    const starred = previous ? previous.starred : starredQuestionIds.has(dto.id);

    return {
        id: dto.id,
        title: dto.title || 'Untitled',
        difficulty: (dto.difficulty || 'UNKNOWN').toUpperCase(),
        status: (dto.status || 'UNSOLVED').toLowerCase(),
        starred,
        notes: dto.note || '',
        tags: Array.isArray(dto.tags) ? dto.tags : [],
        externalUrl: dto.externalUrl || '',
        category: dto.category || '',
        source: dto.source || '',
        premium: Boolean(dto.premium),
        active: Boolean(dto.active),
        acceptanceRate: (dto.acceptanceRate !== undefined && dto.acceptanceRate !== null) ? dto.acceptanceRate : null,
        companies: Array.isArray(dto.companies) ? dto.companies : [],
        lastUpdated: dto.lastUpdated || null
    };
}

async function loadPracticeData() {
    if (!activeUsername) {
        return;
    }

    isLoadingData = true;
    showProblemsLoadingState();

    try {
        const [questions, stats] = await Promise.all([
            fetchPracticeQuestions(),
            fetchPracticeStats()
        ]);

        practiceQuestions = questions;
        practiceStats = stats;

        console.log(`Loaded ${questions.length} questions from API`);

        // Initialize pagination data
        allProblems = questions;
        currentPage = 1;
        // Note: totalQuestions will be set by renderProblems based on category count

        updateStatsCards();
        updateDifficultyCounts();
        updateProgressOverview();
        
        // Mark loading as complete before rendering to avoid "Loading..." message
        isLoadingData = false;
        
        applyAllFilters();
        animateProgressBars();
        animateCircularProgress();
    } catch (error) {
        console.error('Failed to load practice data:', error);
        showProblemsErrorState(error);
        isLoadingData = false;
    }
}

async function fetchPracticeQuestions() {
    const response = await fetch(`${practiceApiBase}/questions?username=${encodeURIComponent(activeUsername)}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch practice questions (HTTP ${response.status})`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
        throw new Error('Unexpected response format for practice questions');
    }

    const allQuestions = data.map(dto => mapPracticeQuestionDto(dto)).filter(Boolean);
    
    // Limit to 25 questions per category to improve performance
    const limitedQuestions = limitQuestionsPerCategory(allQuestions, 25);
    
    console.log(`Loaded ${allQuestions.length} total questions, limited to ${limitedQuestions.length} (max 25 per category)`);
    
    return limitedQuestions;
}

// Helper function to limit questions per category
function limitQuestionsPerCategory(questions, maxPerCategory) {
    const categorized = {};
    
    // Group by category
    questions.forEach(q => {
        const cat = q.category || 'Uncategorized';
        if (!categorized[cat]) {
            categorized[cat] = [];
        }
        categorized[cat].push(q);
    });
    
    // Take max 25 from each category
    const limited = [];
    Object.keys(categorized).forEach(cat => {
        limited.push(...categorized[cat].slice(0, maxPerCategory));
    });
    
    return limited;
}

async function fetchPracticeStats() {
    const response = await fetch(`${practiceApiBase}/statistics?username=${encodeURIComponent(activeUsername)}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch practice statistics (HTTP ${response.status})`);
    }
    const data = await response.json();
    return data;
}

async function refreshPracticeStats() {
    try {
        practiceStats = await fetchPracticeStats();
        updateStatsCards();
        updateDifficultyCounts();
        updateProgressOverview();
    } catch (error) {
        console.error('Failed to refresh practice statistics', error);
    }
}

function showProblemsLoadingState() {
    if (!categorizedProblemsContainer) {
        return;
    }
    categorizedProblemsContainer.innerHTML = `
        <div style="padding: 40px; text-align: center; color: #00d4aa;">
            <div style="font-size: 24px; margin-bottom: 10px;">⏳</div>
            Loading practice questions...
        </div>
    `;
}

function showProblemsErrorState(error) {
    if (!categorizedProblemsContainer) {
        return;
    }
    categorizedProblemsContainer.innerHTML = `
        <div style="padding: 40px; text-align: center; color: #d32f2f;">
            <div style="font-size: 24px; margin-bottom: 10px;">❌</div>
            Failed to load questions: ${error.message}
        </div>
    `;
}

// Notes management
let currentEditingProblem = null;
let currentFilter = null; // Track current filter state - null means no filter (show all)
let currentDifficultyFilter = null; // Track difficulty filter from new section
let currentStatusFilter = null; // Track status filter (solved/unsolved)
let selectedTags = []; // Track selected tags

// Pagination state
let currentPage = 1;
let pageSize = 100; // Categories per page (set high to show all categories by default)
let totalQuestions = 0; // This will track total categories
let totalProblems = 0; // Total number of actual problems
let allProblems = []; // Store all problems for pagination

// DOM elements
const searchInput = document.querySelector('.search-input');
const categorizedProblemsContainer = document.getElementById('categorizedProblems');
const paginationControls = document.getElementById('paginationControls');
const paginationInfo = document.getElementById('paginationInfo');
const pageSizeSelector = document.getElementById('pageSizeSelector');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageNumbersContainer = document.getElementById('pageNumbers');

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    initializeUser();
    setupEventListeners();
    setupTooltips();

    await Promise.all([
        loadTags(),
        loadPracticeData()
    ]);
});

// Render problems grouped by category with pagination
function renderProblems(problems) {
    if (!categorizedProblemsContainer) {
        return;
    }

    const isArray = Array.isArray(problems);
    if (!isArray || problems.length === 0) {
        categorizedProblemsContainer.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #718096;">
                ${isLoadingData ? 'Loading practice questions…' : 'No practice questions match your filters yet.'}
            </div>
        `;
        if (paginationControls) paginationControls.style.display = 'none';
        return;
    }

    // Show loading message for large datasets
    if (problems.length > 500) {
        categorizedProblemsContainer.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #00d4aa;">
                <div style="font-size: 24px; margin-bottom: 10px;">⚡</div>
                Organizing ${problems.length} questions into categories...
            </div>
        `;
    }

    // Use setTimeout to prevent UI blocking
    setTimeout(() => {
        // Group ALL problems by category
        const allCategorizedProblems = problems.reduce((acc, problem) => {
            const category = problem.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(problem);
            return acc;
        }, {});

        // Get all categories sorted
        const allCategories = Object.keys(allCategorizedProblems).sort();
        
        // Update total counts
    totalQuestions = allCategories.length; // Total categories for pagination
    totalProblems = problems.length; // Total actual problems

    console.log('Total categories:', totalQuestions);
    console.log('All categories:', allCategories);
    console.log('Current page:', currentPage, 'Page size:', pageSize);

    // Calculate pagination at category level
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const paginatedCategories = allCategories.slice(startIdx, endIdx);

    console.log('Showing categories from index', startIdx, 'to', endIdx);
    console.log('Paginated categories:', paginatedCategories);

    // Clear container
    categorizedProblemsContainer.innerHTML = '';

    // Render each category section with ALL its questions
    paginatedCategories.forEach(category => {
        const categoryProblems = allCategorizedProblems[category];
        
        // Calculate progress for the entire category
        const solvedCount = categoryProblems.filter(p => p.status === 'solved').length;
        const totalCount = categoryProblems.length;
        const progressPercent = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

        const categorySection = document.createElement('div');
        categorySection.className = 'category-section';
        categorySection.innerHTML = `
            <div class="category-header" data-category="${category}">
                <div class="category-info">
                    <h3 class="category-title">${category}</h3>
                    <div class="category-progress">
                        <span>${solvedCount}/${totalCount} solved</span>
                        <div class="progress-bar" style="margin-left: 12px;">
                            <div class="progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <span style="margin-left: 8px;">${progressPercent}%</span>
                    </div>
                </div>
                <span class="category-toggle">▼</span>
            </div>
            <div class="category-content">
                <table class="problems-table">
                    <thead>
                        <tr>
                            <th style="width: 40px;">Status</th>
                            <th style="width: 40px;">Star</th>
                            <th>Problem</th>
                            <th style="width: 120px;">Difficulty</th>
                            <th style="width: 100px;">Notes</th>
                        </tr>
                    </thead>
                    <tbody class="problems-table-body"></tbody>
                </table>
            </div>
        `;

        const tbody = categorySection.querySelector('.problems-table-body');
        
        // Add all questions from this category (already limited to 25 at fetch time)
        categoryProblems.forEach(problem => {
            const row = document.createElement('tr');
            
            // Format acceptance rate if available
            const acceptanceRateHtml = problem.acceptanceRate 
                ? `<span style="color: #10b981; font-weight: 500; margin-left: 8px;">${problem.acceptanceRate}%</span>`
                : '';
            
            row.innerHTML = `
                <td>
                    <span class="status-icon" data-id="${problem.id}" title="Click to toggle status">
                        ${problem.status === 'solved' ? '✅' : '⬜'}
                    </span>
                </td>
                <td>
                    <span class="star-icon ${problem.starred ? 'starred' : ''}" data-id="${problem.id}">
                        ⭐
                    </span>
                </td>
                <td>
                    <a href="#" class="problem-link" data-id="${problem.id}">
                        ${problem.title}
                    </a>
                    ${acceptanceRateHtml}
                </td>
                <td>
                    <span class="difficulty ${problem.difficulty.toLowerCase()}">
                        ${problem.difficulty}
                    </span>
                </td>
                <td>
                    <button class="notes-btn ${problem.notes ? 'has-notes' : ''}" 
                            data-id="${problem.id}" 
                            title="${problem.notes ? 'Edit Notes' : 'Add Notes'}">
                        ${problem.notes ? '📝 Edit' : '📝 Add'}
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        categorizedProblemsContainer.appendChild(categorySection);
    });

    // Setup category toggle handlers
    document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const toggle = this.querySelector('.category-toggle');
            
            if (content.style.display === 'none') {
                content.style.display = 'block';
                toggle.classList.remove('collapsed');
            } else {
                content.style.display = 'none';
                toggle.classList.add('collapsed');
            }
        });
    });

    // Update pagination controls
    updatePagination();
    }, 0); // End of setTimeout
}

// Update pagination controls
function updatePagination() {
    if (!paginationControls) return;

    const totalPages = Math.ceil(totalQuestions / pageSize);
    
    if (totalPages <= 1) {
        paginationControls.style.display = 'none';
        return;
    }
    
    paginationControls.style.display = 'flex';

    // Update pagination info
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalQuestions);
    if (paginationInfo) {
        paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${totalQuestions} categories`;
    }

    // Update prev/next buttons
    if (prevPageBtn) {
        prevPageBtn.disabled = currentPage === 1;
    }
    if (nextPageBtn) {
        nextPageBtn.disabled = currentPage === totalPages;
    }

    // Render page numbers
    renderPageNumbers(totalPages);
}

// Render page number buttons
function renderPageNumbers(totalPages) {
    if (!pageNumbersContainer) return;

    pageNumbersContainer.innerHTML = '';

    // Show max 7 page numbers
    let startPage = Math.max(1, currentPage - 3);
    let endPage = Math.min(totalPages, currentPage + 3);

    // Adjust if we're near the start or end
    if (currentPage <= 4) {
        endPage = Math.min(7, totalPages);
    } else if (currentPage >= totalPages - 3) {
        startPage = Math.max(1, totalPages - 6);
    }

    // First page
    if (startPage > 1) {
        addPageButton(1);
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.padding = '0 8px';
            ellipsis.style.color = '#666';
            pageNumbersContainer.appendChild(ellipsis);
        }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        addPageButton(i);
    }

    // Last page
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.padding = '0 8px';
            ellipsis.style.color = '#666';
            pageNumbersContainer.appendChild(ellipsis);
        }
        addPageButton(totalPages);
    }
}

// Add page button helper
function addPageButton(pageNum) {
    const button = document.createElement('button');
    button.className = 'page-number';
    button.textContent = pageNum;
    if (pageNum === currentPage) {
        button.classList.add('active');
    }
    button.addEventListener('click', () => goToPage(pageNum));
    pageNumbersContainer.appendChild(button);
}

// Navigate to specific page
function goToPage(page) {
    currentPage = page;
    renderProblems(allProblems);
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', handleSearch);

    const searchButton = document.querySelector('.search-btn');
    if (searchButton) {
        searchButton.addEventListener('click', function(e) {
            e.preventDefault();
            handleSearch();
        });
    }
    
    // Star toggle functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('star-icon')) {
            toggleStar(e.target);
        }
    });
    
    // Status toggle functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('status-icon')) {
            toggleProblemStatus(e.target);
        }
    });
    
    // Problem link clicks
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('problem-link')) {
            e.preventDefault();
            handleProblemClick(e.target.dataset.id);
        }
    });
    
    // Notes button clicks
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('notes-btn')) {
            handleNotesClick(e.target);
        }
    });
    
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this);
        });
    });
    
    // View controls
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            switchView(this);
        });
    });
    
    // Sidebar collapse
    const collapseBtn = document.querySelector('.collapse-btn');
    collapseBtn.addEventListener('click', toggleSidebar);
    
    // Notes modal event listeners
    setupNotesModal();
    
    // Stats card click handlers
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('click', handleStatCardClick);
    });
    
    // Clear filter button
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    clearFilterBtn.addEventListener('click', clearFilter);
    
    // Difficulty dropdown
    const difficultyDropdown = document.getElementById('difficultyDropdown');
    difficultyDropdown.addEventListener('change', handleDifficultyFilter);
    
    // Status dropdown
    const statusDropdown = document.getElementById('statusDropdown');
    statusDropdown.addEventListener('change', handleStatusFilter);
    
    // Clear tags button
    const clearTagsBtn = document.getElementById('clearTagsBtn');
    clearTagsBtn.addEventListener('click', clearAllTags);
    
    // Random button
    const randomBtn = document.getElementById('randomBtn');
    if (randomBtn) {
        randomBtn.addEventListener('click', handleRandomQuestions);
    }

    // Pagination controls
    if (pageSizeSelector) {
        pageSizeSelector.addEventListener('change', function() {
            pageSize = parseInt(this.value);
            currentPage = 1;
            renderProblems(allProblems);
        });
    }

    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', function() {
            if (currentPage > 1) {
                goToPage(currentPage - 1);
            }
        });
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', function() {
            const totalPages = Math.ceil(totalQuestions / pageSize);
            if (currentPage < totalPages) {
                goToPage(currentPage + 1);
            }
        });
    }
}

function handleSearch() {
    applyAllFilters();
}

async function handleRandomQuestions() {
    if (!activeUsername) {
        showNotification('Please set a username first');
        return;
    }

    // If already showing random questions, restore the full list
    if (isShowingRandomQuestions) {
        restoreFullQuestionList();
        return;
    }

    try {
        const response = await fetch(`${practiceApiBase}/random?username=${encodeURIComponent(activeUsername)}&count=10`);
        if (!response.ok) {
            throw new Error(`Failed to fetch random questions (HTTP ${response.status})`);
        }

        const randomDtos = await response.json();
        if (!Array.isArray(randomDtos) || randomDtos.length === 0) {
            showNotification('No random questions available');
            return;
        }

        const randomQuestions = randomDtos.map(dto => mapPracticeQuestionDto(dto)).filter(Boolean);

        // Store original questions before replacing
        originalPracticeQuestions = practiceQuestions.slice();
        
        // Clear all filters
        clearAllFilters();

        // Update practice questions with random set
        practiceQuestions = randomQuestions;
        isShowingRandomQuestions = true;

        // Update pagination data
        allProblems = randomQuestions;
        currentPage = 1;
        // Note: totalQuestions will be set by renderProblems based on category count

        // Render the random questions
        renderProblems(randomQuestions);
        updateSectionHeader(randomQuestions);

        // Update button text to indicate toggle behavior
        const randomBtn = document.getElementById('randomBtn');
        if (randomBtn) {
            randomBtn.innerHTML = '🔙 Back to Full List';
            randomBtn.title = 'Click to return to full question list';
        }

        showNotification(`Loaded ${randomQuestions.length} random questions!`);
        scrollToProblemsSection();
    } catch (error) {
        console.error('Failed to load random questions:', error);
        showNotification('Unable to load random questions');
    }
}

function restoreFullQuestionList() {
    // Restore original questions
    practiceQuestions = originalPracticeQuestions.slice();
    isShowingRandomQuestions = false;
    originalPracticeQuestions = [];

    // Clear all filters and restore
    clearAllFilters();

    // Update pagination data
    allProblems = practiceQuestions;
    currentPage = 1;
    // Note: totalQuestions will be set by renderProblems based on category count

    // Render the full list
    renderProblems(practiceQuestions);
    updateSectionHeader(practiceQuestions);

    // Update button text back to normal
    const randomBtn = document.getElementById('randomBtn');
    if (randomBtn) {
        randomBtn.innerHTML = '🎲 Random 10';
        randomBtn.title = 'Load 10 random questions';
    }

    showNotification('Returned to full question list');
    scrollToProblemsSection();
}

// Handle search functionality
function toggleStar(starElement) {
    const problemId = parseInt(starElement.dataset.id);
    const problem = practiceQuestions.find(p => p.id === problemId);

    if (!problem) {
        return;
    }

    problem.starred = !problem.starred;
    if (problem.starred) {
        starredQuestionIds.add(problemId);
    } else {
        starredQuestionIds.delete(problemId);
    }
    persistStarredState();

    starElement.classList.toggle('starred', problem.starred);

    // Add animation effect
    starElement.style.transform = 'scale(1.2)';
    setTimeout(() => {
        starElement.style.transform = 'scale(1)';
    }, 150);
}

// Toggle problem status (solved/unsolved)
async function toggleProblemStatus(statusElement) {
    const problemId = parseInt(statusElement.dataset.id);
    const problem = practiceQuestions.find(p => p.id === problemId);

    if (!problem || !activeUsername) {
        return;
    }

    const targetStatus = problem.status === 'solved' ? 'UNSOLVED' : 'SOLVED';

    statusElement.dataset.originalStatus = problem.status;
    statusElement.textContent = '⏳';
    statusElement.classList.add('updating');

    try {
        const response = await fetch(`${practiceApiBase}/questions/${problemId}/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: activeUsername,
                status: targetStatus
            })
        });

        if (!response.ok) {
            throw new Error(`Status update failed with HTTP ${response.status}`);
        }

        const updatedDto = await response.json();
        const updatedProblem = mapPracticeQuestionDto(updatedDto, problem);

        const index = practiceQuestions.findIndex(p => p.id === problemId);
        if (index !== -1) {
            practiceQuestions[index] = updatedProblem;
        }

        await refreshPracticeStats();
        applyAllFilters();

        const statusText = updatedProblem.status === 'solved' ? 'marked as solved' : 'marked as unsolved';
        showNotification(`"${updatedProblem.title}" ${statusText}!`);
    } catch (error) {
        console.error('Failed to update practice status', error);
        showNotification('Unable to update status right now.');
        statusElement.textContent = statusElement.dataset.originalStatus === 'solved' ? '✅' : '⬜';
    } finally {
        statusElement.classList.remove('updating');
        delete statusElement.dataset.originalStatus;
    }
}

// Handle problem link clicks
function handleProblemClick(problemId) {
    const problem = practiceQuestions.find(p => p.id === Number(problemId));
    if (!problem) {
        showNotification('Problem unavailable.');
        return;
    }

    if (problem.externalUrl) {
        window.open(problem.externalUrl, '_blank', 'noopener');
    } else {
        showNotification(`No external link available for "${problem.title}" yet.`);
    }
}

// Handle notes button clicks
function handleNotesClick(button) {
    const problemId = parseInt(button.dataset.id);
    const problem = practiceQuestions.find(p => p.id === problemId);

    if (problem) {
        openNotesModal(problem);
    }
}

// Switch between tabs
function switchTab(selectedTab) {
    const allTabs = document.querySelectorAll('.tab-btn');
    allTabs.forEach(tab => tab.classList.remove('active'));
    selectedTab.classList.add('active');
    
    // Here you could load different content based on the tab
    const tabText = selectedTab.textContent.trim();
    console.log(`Switched to tab: ${tabText}`);
}

// Switch between views
function switchView(selectedView) {
    const allViews = document.querySelectorAll('.view-btn');
    allViews.forEach(view => view.classList.remove('active'));
    selectedView.classList.add('active');
    
    console.log('View switched');
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const collapseBtn = document.querySelector('.collapse-btn');
    
    sidebar.classList.toggle('collapsed');
    
    if (sidebar.classList.contains('collapsed')) {
        sidebar.style.width = '60px';
        collapseBtn.innerHTML = '→';
        
        // Hide text in sidebar items
        const sidebarTexts = sidebar.querySelectorAll('.sidebar-item span:not(.icon)');
        sidebarTexts.forEach(text => text.style.display = 'none');
    } else {
        sidebar.style.width = '280px';
        collapseBtn.innerHTML = '←';
        
        // Show text in sidebar items
        const sidebarTexts = sidebar.querySelectorAll('.sidebar-item span:not(.icon)');
        sidebarTexts.forEach(text => text.style.display = 'inline');
    }
}

// Setup tooltips
function setupTooltips() {
    const tooltipTriggers = document.querySelectorAll('[title]');
    
    tooltipTriggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', function() {
            const title = this.getAttribute('title');
            if (title) {
                this.setAttribute('data-title', title);
                this.removeAttribute('title');
                
                const tooltip = document.createElement('div');
                tooltip.className = 'custom-tooltip';
                tooltip.textContent = title;
                document.body.appendChild(tooltip);
                
                this.tooltip = tooltip;
            }
        });
        
        trigger.addEventListener('mouseleave', function() {
            if (this.tooltip) {
                document.body.removeChild(this.tooltip);
                this.tooltip = null;
                
                const title = this.getAttribute('data-title');
                if (title) {
                    this.setAttribute('title', title);
                    this.removeAttribute('data-title');
                }
            }
        });
    });
}

// Animate progress bars on load
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.sidebar .progress-fill, .main-progress-fill, .section-progress-fill');
    
    progressBars.forEach(bar => {
        const targetWidth = bar.style.width;
        bar.style.width = '0%';
        
        setTimeout(() => {
            bar.style.width = targetWidth;
        }, 500);
    });
}

// Animate circular progress bars
function animateCircularProgress() {
    const circularProgress = document.querySelectorAll('.circular-progress');
    
    circularProgress.forEach((progress, index) => {
        const progressValue = parseInt(progress.dataset.progress);
        const progressFill = progress.querySelector('.progress-fill');
        const progressText = progress.querySelector('.progress-percentage');
        
        // Reset progress
        progressFill.style.setProperty('--progress-deg', '0deg');
        
        // Animate after a delay
        setTimeout(() => {
            const targetDegrees = (progressValue / 100) * 360;
            progressFill.style.setProperty('--progress-deg', `${targetDegrees}deg`);
            
            // Animate the percentage text
            animateValue(progressText, 0, progressValue, 1000, '%');
        }, 200 + (index * 100));
    });
}

// Animate numerical values
function animateValue(element, start, end, duration, suffix = '') {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        
        if (suffix === '%') {
            element.textContent = Math.round(current) + suffix;
        } else {
            element.textContent = Math.round(current) + suffix;
        }
    }, 16);
}

// Show notification (simple implementation)
function showNotification(message) {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background-color: #00d4aa;
        color: #000000;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Slide in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add some interactive hover effects
document.addEventListener('mouseover', function(e) {
    if (e.target.classList.contains('course-card')) {
        e.target.style.transform = 'translateY(-4px) scale(1.02)';
    }
});

document.addEventListener('mouseout', function(e) {
    if (e.target.classList.contains('course-card')) {
        e.target.style.transform = 'translateY(0) scale(1)';
    }
});

// Simulate loading states
function simulateLoading() {
    const loadingElements = document.querySelectorAll('.progress-fill');
    
    loadingElements.forEach((element, index) => {
        setTimeout(() => {
            element.style.opacity = '0.5';
            setTimeout(() => {
                element.style.opacity = '1';
            }, 200);
        }, index * 100);
    });
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
    }
    
    // Escape to clear search
    if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        searchInput.blur();
        applyAllFilters();
    }
});

// Update progress periodically (simulation)
setInterval(() => {
    const progressElements = document.querySelectorAll('.sidebar .progress-fill');
    progressElements.forEach(element => {
        const currentWidth = parseFloat(element.style.width);
        if (Math.random() > 0.95) { // 5% chance to update
            const newWidth = Math.min(currentWidth + Math.random() * 2, 100);
            element.style.width = newWidth + '%';
        }
    });
}, 5000);

// Add smooth scrolling for internal links
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Notes Modal Functions
function setupNotesModal() {
    const modal = document.getElementById('notesModal');
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = document.getElementById('cancelNotes');
    const saveBtn = document.getElementById('saveNotes');
    const toolbarBtns = modal.querySelectorAll('.toolbar-btn');
    
    // Close modal events
    closeBtn.addEventListener('click', closeNotesModal);
    cancelBtn.addEventListener('click', closeNotesModal);
    
    // Save notes
    saveBtn.addEventListener('click', saveNotes);
    
    // Toolbar functionality
    toolbarBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const command = this.dataset.command;
            const value = this.dataset.value || null;
            
            if (command === 'formatBlock') {
                document.execCommand(command, false, value);
            } else {
                document.execCommand(command, false, value);
            }
            
            // Update toolbar button states
            updateToolbarStates();
        });
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeNotesModal();
        }
    });
    
    // Update toolbar states on selection change
    document.addEventListener('selectionchange', updateToolbarStates);
}

function openNotesModal(problem) {
    currentEditingProblem = problem;
    const modal = document.getElementById('notesModal');
    const modalTitle = document.getElementById('modalTitle');
    const notesEditor = document.getElementById('notesEditor');
    
    modalTitle.textContent = `Notes for "${problem.title}"`;
    notesEditor.innerHTML = problem.notes || '';
    
    modal.style.display = 'block';
    
    // Focus the editor
    setTimeout(() => {
        notesEditor.focus();
    }, 100);
}

function closeNotesModal() {
    const modal = document.getElementById('notesModal');
    modal.style.display = 'none';
    currentEditingProblem = null;
}

function updateToolbarStates() {
    const toolbarBtns = document.querySelectorAll('.toolbar-btn');
    
    toolbarBtns.forEach(btn => {
        const command = btn.dataset.command;
        const value = btn.dataset.value;
        
        try {
            let isActive = false;
            
            if (command === 'formatBlock' && value) {
                isActive = document.queryCommandValue(command) === value;
            } else {
                isActive = document.queryCommandState(command);
            }
            
            btn.classList.toggle('active', isActive);
        } catch (e) {
            // Some commands might not be supported
            btn.classList.remove('active');
        }
    });
}

// Keyboard shortcuts for notes editor
document.addEventListener('keydown', function(e) {
    const notesEditor = document.getElementById('notesEditor');
    
    if (document.getElementById('notesModal').style.display === 'block') {
        // Ctrl/Cmd + B for bold
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            document.execCommand('bold');
            updateToolbarStates();
        }
        
        // Ctrl/Cmd + I for italic
        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            document.execCommand('italic');
            updateToolbarStates();
        }
        
        // Ctrl/Cmd + U for underline
        if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
            e.preventDefault();
            document.execCommand('underline');
            updateToolbarStates();
        }
        
        // Ctrl/Cmd + S to save notes
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveNotes();
        }
        
        // Escape to close modal
        if (e.key === 'Escape') {
            closeNotesModal();
        }
    }
});

// Notes persistence
async function saveNotes() {
    if (!currentEditingProblem || !activeUsername) {
        return;
    }

    const notesEditor = document.getElementById('notesEditor');
    const notesContent = notesEditor.innerHTML.trim();
    const problemId = currentEditingProblem.id;

    try {
        const response = await fetch(`${practiceApiBase}/questions/${problemId}/note`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: activeUsername,
                note: notesContent
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to update notes (HTTP ${response.status})`);
        }

        const updatedDto = await response.json();
        const updatedProblem = mapPracticeQuestionDto(updatedDto, currentEditingProblem);

        const index = practiceQuestions.findIndex(p => p.id === problemId);
        if (index !== -1) {
            practiceQuestions[index] = updatedProblem;
            currentEditingProblem = practiceQuestions[index];
        }

        applyAllFilters();
        closeNotesModal();

        const message = notesContent ? 'Notes saved successfully!' : 'Notes cleared!';
        showNotification(message);
    } catch (error) {
        console.error('Failed to save notes', error);
        showNotification('Unable to save notes right now.');
    }
}

function calculateStatsSnapshot() {
    if (practiceStats) {
        return {
            easy: { solved: practiceStats.easySolved || 0, total: practiceStats.easyTotal || 0 },
            medium: { solved: practiceStats.mediumSolved || 0, total: practiceStats.mediumTotal || 0 },
            hard: { solved: practiceStats.hardSolved || 0, total: practiceStats.hardTotal || 0 },
            total: { solved: practiceStats.solvedCount || 0, total: practiceStats.totalQuestions || practiceQuestions.length }
        };
    }

    const fallback = {
        easy: { solved: 0, total: 0 },
        medium: { solved: 0, total: 0 },
        hard: { solved: 0, total: 0 },
        total: { solved: 0, total: practiceQuestions.length }
    };

    practiceQuestions.forEach(problem => {
        const difficulty = problem.difficulty ? problem.difficulty.toLowerCase() : 'unknown';
        if (fallback[difficulty]) {
            fallback[difficulty].total += 1;
            if (problem.status === 'solved') {
                fallback[difficulty].solved += 1;
                fallback.total.solved += 1;
            }
        }
    });

    return fallback;
}

function updateStatsCards() {
    const stats = calculateStatsSnapshot();

    const easyCard = document.querySelector('.stat-card.easy');
    const easyCount = easyCard.querySelector('.stat-count');
    const easyProgress = easyCard.querySelector('.circular-progress');
    const easyPercentage = easyCard.querySelector('.progress-percentage');

    easyCount.textContent = `${stats.easy.solved} / ${stats.easy.total}`;
    const easyPercent = stats.easy.total > 0 ? Math.round((stats.easy.solved / stats.easy.total) * 100) : 0;
    easyProgress.dataset.progress = easyPercent;
    easyPercentage.textContent = `${easyPercent}%`;
    
    // Update Medium stats
    const mediumCard = document.querySelector('.stat-card.medium');
    const mediumCount = mediumCard.querySelector('.stat-count');
    const mediumProgress = mediumCard.querySelector('.circular-progress');
    const mediumPercentage = mediumCard.querySelector('.progress-percentage');
    
    mediumCount.textContent = `${stats.medium.solved} / ${stats.medium.total}`;
    const mediumPercent = stats.medium.total > 0 ? Math.round((stats.medium.solved / stats.medium.total) * 100) : 0;
    mediumProgress.dataset.progress = mediumPercent;
    mediumPercentage.textContent = `${mediumPercent}%`;
    
    // Update Hard stats
    const hardCard = document.querySelector('.stat-card.hard');
    const hardCount = hardCard.querySelector('.stat-count');
    const hardProgress = hardCard.querySelector('.circular-progress');
    const hardPercentage = hardCard.querySelector('.progress-percentage');
    
    hardCount.textContent = `${stats.hard.solved} / ${stats.hard.total}`;
    const hardPercent = stats.hard.total > 0 ? Math.round((stats.hard.solved / stats.hard.total) * 100) : 0;
    hardProgress.dataset.progress = hardPercent;
    hardPercentage.textContent = `${hardPercent}%`;
    
    // Update Total stats
    const totalCard = document.querySelector('.stat-card.total');
    const totalCount = totalCard.querySelector('.stat-count');
    const totalProgress = totalCard.querySelector('.circular-progress');
    const totalPercentage = totalCard.querySelector('.progress-percentage');
    
    totalCount.textContent = `${stats.total.solved} / ${stats.total.total}`;
    const totalPercent = stats.total.total > 0 ? Math.round((stats.total.solved / stats.total.total) * 100) : 0;
    totalProgress.dataset.progress = totalPercent;
    totalPercentage.textContent = `${totalPercent}%`;
}

// Handle stat card clicks
function handleStatCardClick(e) {
    const card = e.currentTarget;
    const difficulty = card.classList.contains('easy') ? 'easy' :
                     card.classList.contains('medium') ? 'medium' :
                     card.classList.contains('hard') ? 'hard' : 'all';
    
    // Remove active state from all cards
    document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('active'));
    
    // Add active state to clicked card
    card.classList.add('active');
    
    // Clear other filters
    currentDifficultyFilter = null;
    selectedTags = [];
    const difficultyDropdown = document.getElementById('difficultyDropdown');
    if (difficultyDropdown) {
        difficultyDropdown.value = '';
    }
    document.querySelectorAll('.tag-btn').forEach(btn => btn.classList.remove('selected'));
    updateSelectedTagsDisplay();
    
    // Update filter and render problems
    currentFilter = difficulty;
    applyAllFilters();
    
    // Clear search input
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Show notification
    const filterName = difficulty === 'all' ? 'All Completed Problems' : `Completed ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Problems`;
    showNotification(`Showing ${filterName}`);
    
    // Add click animation
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
        card.style.transform = 'scale(1)';
    }, 150);
}

// Clear filter and show all problems (updated to use clearAllFilters)
function clearFilter() {
    clearAllFilters();
}

// Get filtered problems based on current filter (for stats cards only)
function getFilteredProblems() {
    if (!practiceQuestions.length) {
        return [];
    }

    if (!currentFilter) {
        return practiceQuestions.slice();
    }

    if (currentFilter === 'all') {
        return practiceQuestions.filter(problem => problem.status === 'solved');
    }

    return practiceQuestions.filter(problem => 
        problem.status === 'solved' && problem.difficulty.toLowerCase() === currentFilter
    );
}

// Update section header based on current filter
function updateSectionHeader(displayedProblems = practiceQuestions) {
    const filterStatus = document.getElementById('filterStatus');
    const problemsCount = document.getElementById('problemsCount');
    const hasActiveStatCard = document.querySelector('.stat-card.active');

    if (!filterStatus || !problemsCount) {
        return;
    }
    
    if (hasActiveStatCard) {
        // Show filter status badge
        filterStatus.style.display = 'block';
        
        // Update count to show filtered results
        const filteredProblems = getFilteredProblems();
    problemsCount.textContent = `(${filteredProblems.length} completed)`;
        
        // Update filter badge text based on difficulty
        const filterBadge = filterStatus.querySelector('.filter-badge');
        if (currentFilter === 'all') {
            filterBadge.textContent = '✅ Showing All Completed Problems';
        } else if (currentFilter) {
            const difficultyName = currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1);
            filterBadge.textContent = `✅ Showing Completed ${difficultyName} Problems`;
        }
    } else {
        // Hide filter status badge and show normal count
        filterStatus.style.display = 'none';
        const totalCount = Array.isArray(displayedProblems) ? displayedProblems.length : practiceQuestions.length;
        problemsCount.textContent = `(${totalCount} total)`;
    }
}

function cssEscapeValue(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') {
        return window.CSS.escape(value);
    }
    return String(value).replace(/"/g, '\\"');
}

function getTagButton(tag) {
    return document.querySelector(`[data-tag="${cssEscapeValue(tag)}"]`);
}

async function loadTags() {
    const tagsGrid = document.getElementById('tagsGrid');
    if (tagsGrid) {
        tagsGrid.innerHTML = '<div style="padding:12px;color:#718096;">Loading tags…</div>';
    }

    try {
        const response = await fetch(tagsApiEndpoint);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const tags = await response.json();
        if (!Array.isArray(tags)) {
            throw new Error('Unexpected tag response format');
        }

        availableTags = tags
            .filter(tag => typeof tag === 'string')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)
            .sort((a, b) => a.localeCompare(b));

        initializeTags();
    } catch (error) {
        console.error('Failed to load tags from backend:', error);
        availableTags = [];
        if (tagsGrid) {
            tagsGrid.innerHTML = '<div style="padding:12px;color:#d32f2f;">Unable to load tags. Please try again later.</div>';
        }
    }
}

// Initialize tags section
function initializeTags() {
    const tagsGrid = document.getElementById('tagsGrid');
    if (!tagsGrid) {
        return;
    }

    tagsGrid.innerHTML = '';

    if (!availableTags.length) {
        tagsGrid.innerHTML = '<div style="padding:12px;color:#718096;">No tags available yet.</div>';
        return;
    }

    availableTags.forEach(tag => {
        const tagBtn = document.createElement('button');
        tagBtn.className = 'tag-btn';
        tagBtn.textContent = tag;
        tagBtn.dataset.tag = tag;
        tagBtn.addEventListener('click', () => toggleTag(tag));
        tagsGrid.appendChild(tagBtn);
    });
}

// Update difficulty counts in dropdown options
function updateDifficultyCounts() {
    const dropdown = document.getElementById('difficultyDropdown');
    if (!dropdown || !dropdown.options) {
        return;
    }

    const stats = calculateStatsSnapshot();

    for (let i = 1; i < dropdown.options.length; i++) {
        const option = dropdown.options[i];

        switch (option.value) {
            case 'easy':
                option.textContent = `🟢 Easy (${stats.easy.total} problems)`;
                break;
            case 'medium':
                option.textContent = `🟡 Medium (${stats.medium.total} problems)`;
                break;
            case 'hard':
                option.textContent = `🔴 Hard (${stats.hard.total} problems)`;
                break;
            default:
                break;
        }
    }
}

function updateProgressOverview() {
    const stats = calculateStatsSnapshot();
    const solved = stats.total.solved;
    const total = stats.total.total || practiceQuestions.length;
    const percentage = total > 0 ? (solved / total) * 100 : 0;
    const percentageLabel = percentage.toFixed(1);
    const widthValue = `${Math.min(100, Math.max(0, percentage))}%`;

    const progressText = document.querySelector('.progress-section .progress-text');
    if (progressText) {
        progressText.textContent = `${solved} / ${total}`;
        progressText.setAttribute('data-percentage', percentageLabel);
    }

    const mainProgressFill = document.querySelector('.main-progress-fill');
    if (mainProgressFill) {
        mainProgressFill.style.width = widthValue;
        mainProgressFill.setAttribute('aria-valuenow', percentageLabel);
    }

    document.querySelectorAll('.section-progress-fill').forEach(fill => {
        fill.style.width = widthValue;
    });
}

// Handle difficulty filter dropdown change
function handleDifficultyFilter(e) {
    const difficulty = e.target.value;
    
    // Clear stats card filters
    document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('active'));
    currentFilter = null;
    
    // Update difficulty filter
    currentDifficultyFilter = difficulty || null;
    
    // Apply filters and render
    applyAllFilters();
    
    if (difficulty) {
        showNotification(`Showing ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} problems`);
        // Add a small delay to ensure the problems are rendered before scrolling
        setTimeout(scrollToProblemsSection, 100);
    } else {
        showNotification('Showing all difficulties');
    }
}

// Handle status filter dropdown change
function handleStatusFilter(e) {
    const status = e.target.value;
    
    // Clear stats card filters
    document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('active'));
    currentFilter = null;
    
    // Update status filter
    currentStatusFilter = status || null;
    
    // Apply filters and render
    applyAllFilters();
    
    if (status === 'unsolved') {
        showNotification('Showing unsolved problems only');
        setTimeout(scrollToProblemsSection, 100);
    } else if (status === 'solved') {
        showNotification('Showing solved problems only');
        setTimeout(scrollToProblemsSection, 100);
    } else {
        showNotification('Showing all problems');
    }
}

// Toggle tag selection
function toggleTag(tag) {
    const tagBtn = getTagButton(tag);
    if (!tagBtn) {
        console.warn('Tag button not found for', tag);
        return;
    }
    
    if (selectedTags.includes(tag)) {
        // Remove tag
        selectedTags = selectedTags.filter(t => t !== tag);
        tagBtn.classList.remove('selected');
    } else {
        // Add tag
        selectedTags.push(tag);
        tagBtn.classList.add('selected');
    }
    
    updateSelectedTagsDisplay();
    applyAllFilters();
    
    const action = selectedTags.includes(tag) ? 'Added' : 'Removed';
    showNotification(`${action} ${tag} tag`);
    
    // Scroll to problems section if tag was added
    if (selectedTags.includes(tag)) {
        setTimeout(scrollToProblemsSection, 100);
    }
}

// Update selected tags display
function updateSelectedTagsDisplay() {
    const selectedTagsContainer = document.getElementById('selectedTags');
    const selectedTagsList = document.getElementById('selectedTagsList');
    
    if (selectedTags.length === 0) {
        selectedTagsContainer.style.display = 'none';
    } else {
        selectedTagsContainer.style.display = 'block';
        selectedTagsList.innerHTML = '';
        
        selectedTags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'selected-tag';
            tagElement.innerHTML = `
                ${tag}
                <span class="remove-tag" onclick="removeTag('${tag}')">×</span>
            `;
            selectedTagsList.appendChild(tagElement);
        });
    }
}

// Remove individual tag
function removeTag(tag) {
    selectedTags = selectedTags.filter(t => t !== tag);
    const tagBtn = getTagButton(tag);
    if (tagBtn) {
        tagBtn.classList.remove('selected');
    }
    
    updateSelectedTagsDisplay();
    applyAllFilters();
    
    showNotification(`Removed ${tag} tag`);
}

// Clear all tags
function clearAllTags() {
    selectedTags = [];
    document.querySelectorAll('.tag-btn').forEach(btn => btn.classList.remove('selected'));
    updateSelectedTagsDisplay();
    applyAllFilters();
    
    showNotification('Cleared all tags');
}

// Apply all active filters
function applyAllFilters() {
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';

    let filteredProblems = practiceQuestions.slice();

    // Apply stats card filter (completed problems only)
    if (currentFilter) {
        if (currentFilter === 'all') {
            filteredProblems = filteredProblems.filter(problem => problem.status === 'solved');
        } else {
            filteredProblems = filteredProblems.filter(problem => 
                problem.status === 'solved' && problem.difficulty.toLowerCase() === currentFilter
            );
        }
    }

    // Apply difficulty filter from new section
    if (currentDifficultyFilter) {
        filteredProblems = filteredProblems.filter(problem => 
            problem.difficulty.toLowerCase() === currentDifficultyFilter
        );
    }

    // Apply tags filter
    if (selectedTags.length > 0) {
        filteredProblems = filteredProblems.filter(problem => 
            selectedTags.every(tag => problem.tags.includes(tag))
        );
    }

    // Apply status filter
    if (currentStatusFilter) {
        if (currentStatusFilter === 'solved') {
            filteredProblems = filteredProblems.filter(problem => problem.status === 'solved');
        } else if (currentStatusFilter === 'unsolved') {
            filteredProblems = filteredProblems.filter(problem => problem.status !== 'solved');
        }
    }

    // Apply text search filter
    if (searchTerm) {
        filteredProblems = filteredProblems.filter(problem => {
            const titleMatch = problem.title.toLowerCase().includes(searchTerm);
            const tagMatch = problem.tags.some(tag => tag.toLowerCase().includes(searchTerm));
            const companyMatch = problem.companies.some(company => company.toLowerCase().includes(searchTerm));
            return titleMatch || tagMatch || companyMatch;
        });
    }

    // Update pagination state
    allProblems = filteredProblems;
    currentPage = 1;
    // Note: totalQuestions will be set by renderProblems based on category count

    renderProblems(filteredProblems);
    updateSectionHeader(filteredProblems);
    const hasActiveFilters = Boolean(currentFilter || currentDifficultyFilter || selectedTags.length > 0 || currentStatusFilter || searchTerm);
    toggleClearFilterButton(hasActiveFilters);

    // Scroll to problems section
    scrollToProblemsSection();
}

function toggleClearFilterButton(visible) {
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    if (!clearFilterBtn) {
        return;
    }
    clearFilterBtn.style.display = visible ? 'flex' : 'none';
}

// Update the existing clear filter function
function clearAllFilters() {
    currentFilter = null;
    currentDifficultyFilter = null;
    currentStatusFilter = null;
    selectedTags = [];

    document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('active'));

    const difficultyDropdown = document.getElementById('difficultyDropdown');
    if (difficultyDropdown) {
        difficultyDropdown.value = '';
    }

    const statusDropdown = document.getElementById('statusDropdown');
    if (statusDropdown) {
        statusDropdown.value = '';
    }

    document.querySelectorAll('.tag-btn').forEach(btn => btn.classList.remove('selected'));

    if (searchInput) {
        searchInput.value = '';
    }

    updateSelectedTagsDisplay();
    applyAllFilters();

    showNotification('Cleared all filters');
}

// Smooth scroll to problems section
function scrollToProblemsSection() {
    const problemsSection = document.querySelector('.problems-section');
    if (problemsSection) {
        problemsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
        });
    }
}

console.log('Coding Practice Platform UI loaded successfully! 🚀');