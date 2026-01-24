const apiBase = '/api/questions';
let lastCategorySelected = null;

// Helper function to format acceptance rate
function formatAcceptanceRate(rate) {
  if (!rate) return '';
  return ` • <span style="color: #10b981; font-weight: 500;">${rate}%</span>`;
}

// Helper function to show raw JSON in all response areas
function showRaw(obj){
  const jsonStr = JSON.stringify(obj, null, 2);
  
  // Update all raw response elements
  const rawElements = [
    'raw',
    'home_raw',
    'create_response',
    'update_response',
    'delete_response',
    'browse_raw',
    'categories_raw'
  ];
  
  rawElements.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.textContent = jsonStr;
  });
}

async function createQuestion(){
  const title = document.getElementById('q_title').value;
  const category = document.getElementById('q_category').value;
  const difficulty = document.getElementById('q_difficulty').value;
  const source = document.getElementById('q_source').value;
  const externalUrl = document.getElementById('q_url').value;
  const tags = document.getElementById('q_tags').value.split(',').map(s=>s.trim()).filter(Boolean);
  
  // Validation
  if (!title || !category) {
    alert('Title and Category are required!');
    return;
  }
  
  const body = { 
    title, 
    category, 
    difficulty: difficulty || null,
    source: source || null,
    externalUrl: externalUrl || null,
    tags 
  };
  
  try {
    const res = await fetch(`${apiBase}/create`, {
      method:'POST', 
      headers:{'Content-Type':'application/json'}, 
      body:JSON.stringify(body)
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`HTTP ${res.status}: ${error}`);
    }
    const data = await res.json(); 
    showRaw(data);
    
    // Show detailed success message
    const summary = `✓ Question Created Successfully!\n\n` +
      `ID: ${data.id}\n` +
      `Title: ${data.title}\n` +
      `Category: ${data.category ? data.category.name : 'N/A'}\n` +
      `Difficulty: ${data.difficulty || 'N/A'}\n` +
      `Source: ${data.source || 'N/A'}\n` +
      `External URL: ${data.externalUrl || 'N/A'}\n` +
      `Tags: ${data.tags && data.tags.length > 0 ? data.tags.map(t => t.name).join(', ') : 'None'}\n` +
      `Active: ${data.active ? 'Yes' : 'No'}`;
    
    alert(summary);
    
    // Clear form
    document.getElementById('q_title').value = '';
    document.getElementById('q_category').value = '';
    document.getElementById('q_difficulty').selectedIndex = 1; // Reset to MEDIUM (default)
    document.getElementById('q_source').selectedIndex = 0; // Reset to LEETCODE (default)
    document.getElementById('q_url').value = '';
    document.getElementById('q_tags').value = '';
  } catch(e) {
    console.error('Failed to create question:', e);
    alert('Failed to create question: ' + e.message);
    showRaw({error: e.message});
  }
}

async function loadRandom10(targetElementId = 'random_list'){
  try {
    const res = await fetch(`${apiBase}/random10`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    const listDiv = document.getElementById(targetElementId);
    if (!listDiv) return;
    
    if (data.length === 0) {
      listDiv.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>No questions found</p></div>';
    } else {
      listDiv.innerHTML = data.map(q=>`
        <div class="question-item">
          <div>
            <div class="question-title">
              ${q.title}
              ${q.externalUrl ? `<a href="${q.externalUrl}" target="_blank" class="link-icon" title="Open question link" style="margin-left: 8px; font-size: 0.9em;">↗</a>` : ''}
            </div>
            <div class="question-meta">
              ID: ${q.id}
              ${q.difficulty ? ` • ${q.difficulty}` : ''}${formatAcceptanceRate(q.acceptanceRate)}
              ${q.category ? ` • ${q.category.name}` : ''}
              ${q.source ? ` • ${q.source}` : ''}
            </div>
          </div>
        </div>
      `).join('');
    }
    showRaw(data);
  } catch(e) {
    console.error('Failed to load random questions', e);
    const listDiv = document.getElementById(targetElementId);
    if (listDiv) {
      listDiv.innerHTML = '<div style="padding:12px;color:#d32f2f">Error loading questions. Check console.</div>';
    }
  }
}

// Load categories into select dropdowns
async function loadCategories(){
  console.log('Loading categories...');
  try{
    const res = await fetch(`${apiBase}/listCategories`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to fetch categories`);
    }
    const cats = await res.json();
    console.log('Categories loaded:', cats);
    
    // Populate create category select
    const createCategorySelect = document.getElementById('q_category');
    if (createCategorySelect) {
      if (cats.length === 0) {
        createCategorySelect.innerHTML = '<option value="">-- No categories available --</option>';
      } else {
        createCategorySelect.innerHTML = '<option value="">-- Select Category --</option>' + 
          cats.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
      }
    }
    
    // Populate update category select
    const updateCategorySelect = document.getElementById('upd_category');
    if (updateCategorySelect) {
      if (cats.length === 0) {
        updateCategorySelect.innerHTML = '<option value="">-- keep current --</option>';
      } else {
        updateCategorySelect.innerHTML = '<option value="">-- keep current --</option>' + 
          cats.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
      }
    }
    
    // Populate browse page category select for search
    const browseCategorySelect = document.getElementById('cat_select');
    if (browseCategorySelect) {
      if (cats.length === 0) {
        browseCategorySelect.innerHTML = '<option value="">-- No categories available --</option>';
      } else {
        browseCategorySelect.innerHTML = '<option value="">-- SELECT --</option>' + 
          cats.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
      }
    }
    
    // Populate the categories table
    const tbody = document.getElementById('categories_tbody');
    if (tbody){
      if (cats.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" style="padding:24px;text-align:center;color:#718096">No categories found. Add one using the form.</td></tr>';
      } else {
        tbody.innerHTML = cats.map(c => `
          <tr onclick="loadQuestionsForCategory('${c.name.replace(/'/g, "\\'")}')">
            <td>${c.name || ''}</td>
            <td style="color:#718096">${c.description || '—'}</td>
          </tr>
        `).join('');
        console.log('Populated categories table with', cats.length, 'rows');
      }
    } else {
      console.error('categories_tbody element not found in DOM');
    }
  }catch(e){ 
    console.error('Failed to load categories:', e); 
    const tbody = document.getElementById('categories_tbody');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="2" style="padding:24px;text-align:center;color:#d32f2f">Error loading categories: ${e.message}. Check console and verify backend is running.</td></tr>`;
    }
  }
}

// Load questions for a selected category
async function loadQuestionsForCategory(categoryName){
  console.log('Loading questions for category:', categoryName);
  lastCategorySelected = categoryName;
  
  try {
    const res = await fetch(`${apiBase}/byCategory/${encodeURIComponent(categoryName)}`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to fetch questions for category`);
    }
    const data = await res.json();
    console.log(`Loaded ${data.length} questions for category:`, categoryName);
    
    const listDiv = document.getElementById('by_cat_list');
    if (!listDiv) {
      console.error('by_cat_list element not found');
      return;
    }
    
    if (data.length === 0) {
      listDiv.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📭</div><p>No questions in "${categoryName}" category</p></div>`;
    } else {
      listDiv.innerHTML = data.map(q => `
        <div class="question-item">
          <div>
            <div class="question-title">
              ${q.title}
              ${q.externalUrl ? `<a href="${q.externalUrl}" target="_blank" class="link-icon" title="Open question link" style="margin-left: 8px; font-size: 0.9em;">↗</a>` : ''}
            </div>
            <div class="question-meta">
              ID: ${q.id}
              ${q.difficulty ? ` • ${q.difficulty}` : ''}${formatAcceptanceRate(q.acceptanceRate)}
              ${q.source ? ` • ${q.source}` : ''}
            </div>
          </div>
        </div>
      `).join('');
    }
    showRaw(data);
  } catch(e) {
    console.error('Failed to load questions for category:', e);
    const listDiv = document.getElementById('by_cat_list');
    if (listDiv) {
      listDiv.innerHTML = `<div style="padding:12px;color:#d32f2f">Error: ${e.message}</div>`;
    }
  }
}

// Search for question to preview before updating
async function searchQuestionForUpdate() {
  const id = document.getElementById('upd_id').value;
  if (!id) {
    alert('Please enter a Question ID');
    return;
  }
  
  try {
    const res = await fetch(`${apiBase}/findById/${encodeURIComponent(id)}`);
    if (!res.ok) {
      if (res.status === 404) {
        showQuestionNotFound();
        return;
      }
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    showQuestionPreview(data);
  } catch(e) {
    console.error('Failed to search question:', e);
    alert('Error searching for question: ' + e.message);
  }
}

// Show question preview modal
function showQuestionPreview(question) {
  // Hide not found modal if visible
  document.getElementById('question_notfound_modal').style.display = 'none';
  
  // Hide update form
  document.getElementById('update_form_fields').style.display = 'none';
  
  // Build preview content
  const previewContent = document.getElementById('question_preview_content');
  previewContent.innerHTML = `
    <div style="display: grid; gap: 12px;">
      <div>
        <strong style="color: #667eea;">ID:</strong> 
        <span style="color: #2d3748;">${question.id}</span>
      </div>
      <div>
        <strong style="color: #667eea;">Title:</strong> 
        <span style="color: #2d3748;">${question.title || '—'}</span>
        ${question.externalUrl ? `<a href="${question.externalUrl}" target="_blank" style="color: #667eea; margin-left: 12px; font-size: 0.9em;" title="Open link">↗</a>` : ''}
      </div>
      <div>
        <strong style="color: #667eea;">Category:</strong> 
        <span style="color: #2d3748;">${question.category ? question.category.name : '—'}</span>
      </div>
      <div>
        <strong style="color: #667eea;">Difficulty:</strong> 
        <span style="color: #2d3748;">${question.difficulty || '—'}</span>
        ${question.acceptanceRate ? `<span style="color: #10b981; font-weight: 500; margin-left: 12px;">${question.acceptanceRate}%</span>` : ''}
      </div>
      <div>
        <strong style="color: #667eea;">Source:</strong> 
        <span style="color: #2d3748;">${question.source || '—'}</span>
      </div>
      <div>
        <strong style="color: #667eea;">Tags:</strong> 
        <span style="color: #2d3748;">${question.tags && question.tags.length > 0 ? question.tags.map(t => t.name).join(', ') : '—'}</span>
      </div>
    </div>
  `;
  
  // Show preview modal
  document.getElementById('question_preview_modal').style.display = 'block';
}

// Show question not found modal
function showQuestionNotFound() {
  // Hide preview modal if visible
  document.getElementById('question_preview_modal').style.display = 'none';
  
  // Hide update form
  document.getElementById('update_form_fields').style.display = 'none';
  
  // Show not found modal
  document.getElementById('question_notfound_modal').style.display = 'block';
}

// Close preview and show update form
function closePreviewAndShowForm() {
  document.getElementById('question_preview_modal').style.display = 'none';
  document.getElementById('update_form_fields').style.display = 'block';
}

// Close not found modal
function closeNotFoundModal() {
  document.getElementById('question_notfound_modal').style.display = 'none';
  document.getElementById('upd_id').value = ''; // Clear the invalid ID
}

async function updateQuestion(){
  const id = document.getElementById('upd_id').value;
  if (!id) {
    alert('Question ID is required');
    return;
  }
  
  const title = document.getElementById('upd_title').value;
  const category = document.getElementById('upd_category').value;
  const difficulty = document.getElementById('upd_difficulty').value;
  const source = document.getElementById('upd_source').value;
  const externalUrl = document.getElementById('upd_url').value;
  const tagsStr = document.getElementById('upd_tags').value;
  const tags = tagsStr ? tagsStr.split(',').map(s=>s.trim()).filter(Boolean) : null;
  
  const body = {
    title: title || null,
    category: category || null,
    difficulty: difficulty || null,
    source: source || null,
    externalUrl: externalUrl || null,
    tags: tags
  };
  
  try {
    const res = await fetch(`${apiBase}/update/${encodeURIComponent(id)}`, {
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(body)
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`HTTP ${res.status}: ${error}`);
    }
    const data = await res.json();
    showRaw(data);
    alert('Question updated successfully!');
    
    // Clear form and hide update form
    document.getElementById('upd_id').value = '';
    document.getElementById('upd_title').value = '';
    document.getElementById('upd_category').selectedIndex = 0;
    document.getElementById('upd_difficulty').selectedIndex = 0;
    document.getElementById('upd_source').selectedIndex = 0;
    document.getElementById('upd_url').value = '';
    document.getElementById('upd_tags').value = '';
    
    // Hide the form fields after successful update
    document.getElementById('update_form_fields').style.display = 'none';
  } catch(e) {
    console.error('Failed to update question:', e);
    alert('Failed to update question: ' + e.message);
    showRaw({error: e.message});
  }
}

async function deleteQuestion(){
  const id = document.getElementById('del_id').value;
  if (!id) {
    alert('Question ID is required');
    return;
  }
  
  if (!confirm(`Are you sure you want to delete question ID ${id}?`)) {
    return;
  }
  
  try {
    const res = await fetch(`${apiBase}/delete/${encodeURIComponent(id)}`, {method:'DELETE'});
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`HTTP ${res.status}: ${error}`);
    }
    const data = await res.text();
    showRaw({message: data});
    alert('Question deleted successfully!');
    document.getElementById('del_id').value = '';
  } catch(e) {
    console.error('Failed to delete question:', e);
    alert('Failed to delete question: ' + e.message);
    showRaw({error: e.message});
  }
}

async function addCategory(){
  const name = document.getElementById('cat_name').value;
  const description = document.getElementById('cat_desc').value;
  
  if (!name) {
    alert('Category name is required');
    return;
  }
  
  try {
    const res = await fetch(`${apiBase}/addCategory`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({name, description})
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`HTTP ${res.status}: ${error}`);
    }
    const data = await res.json();
    showRaw(data);
    alert(`Category "${name}" created successfully!`);
    
    // Clear form and reload categories
    document.getElementById('cat_name').value = '';
    document.getElementById('cat_desc').value = '';
    loadCategories();
  } catch(e) {
    console.error('Failed to add category:', e);
    alert('Failed to add category: ' + e.message);
    showRaw({error: e.message});
  }
}

// Reset all search controls to default
function resetSearchControls() {
  document.getElementById('cat_select').value = '';
  document.getElementById('diff_select').value = '';
  document.getElementById('id_search').value = '';
}

async function findByCategory(){
  const category = document.getElementById('cat_select').value;
  if (!category) {
    alert('Please select a category');
    return;
  }
  
  // Reset other search controls
  document.getElementById('diff_select').value = '';
  document.getElementById('id_search').value = '';
  
  try {
    const res = await fetch(`${apiBase}/byCategory/${encodeURIComponent(category)}`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    
    const listDiv = document.getElementById('search_results');
    if (data.length === 0) {
      listDiv.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📭</div><p>No questions found in "${category}" category</p></div>`;
    } else {
      listDiv.innerHTML = data.map(q => `
        <div class="question-item">
          <div>
            <div class="question-title">
              ${q.title}
              ${q.externalUrl ? `<a href="${q.externalUrl}" target="_blank" class="link-icon" title="Open question link" style="margin-left: 8px; font-size: 0.9em;">↗</a>` : ''}
            </div>
            <div class="question-meta">
              ID: ${q.id}
              ${q.difficulty ? ` • ${q.difficulty}` : ''}${formatAcceptanceRate(q.acceptanceRate)}
              ${q.source ? ` • ${q.source}` : ''}
            </div>
          </div>
        </div>
      `).join('');
    }
    showRaw(data);
  } catch(e) {
    console.error('Failed to find questions by category:', e);
    const listDiv = document.getElementById('search_results');
    listDiv.innerHTML = `<div style="padding:12px;color:#d32f2f">Error: ${e.message}</div>`;
    showRaw({error: e.message});
  }
}

async function findByDifficulty(){
  const difficulty = document.getElementById('diff_select').value;
  if (!difficulty) {
    alert('Please select a difficulty');
    return;
  }
  
  // Reset other search controls
  document.getElementById('cat_select').value = '';
  document.getElementById('id_search').value = '';
  
  const res = await fetch(`${apiBase}/byDifficulty/${encodeURIComponent(difficulty)}`);
  const data = await res.json();
  
  const listDiv = document.getElementById('search_results');
  if (data.length === 0) {
    listDiv.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>No questions found for this difficulty</p></div>';
  } else {
    listDiv.innerHTML = data.map(q => `
      <div class="question-item">
        <div>
          <div class="question-title">
            ${q.title}
            ${q.externalUrl ? `<a href="${q.externalUrl}" target="_blank" class="link-icon" title="Open question link" style="margin-left: 8px; font-size: 0.9em;">↗</a>` : ''}
          </div>
          <div class="question-meta">
            ID: ${q.id}
            ${q.difficulty ? ` • ${q.difficulty}` : ''}${formatAcceptanceRate(q.acceptanceRate)}
            ${q.category ? ` • ${q.category.name}` : ''}
            ${q.source ? ` • ${q.source}` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }
  showRaw(data);
}

async function findById(){
  const id = document.getElementById('id_search').value;
  if (!id) {
    alert('Question ID is required');
    return;
  }
  
  // Reset other search controls
  document.getElementById('cat_select').value = '';
  document.getElementById('diff_select').value = '';
  
  try {
    const res = await fetch(`${apiBase}/findById/${encodeURIComponent(id)}`);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Question not found');
      }
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    
    const listDiv = document.getElementById('search_results');
    listDiv.innerHTML = `
      <div class="question-item">
        <div>
          <div class="question-title">
            ${data.title}
            ${data.externalUrl ? `<a href="${data.externalUrl}" target="_blank" class="link-icon" title="Open question link" style="margin-left: 8px; font-size: 0.9em;">↗</a>` : ''}
          </div>
          <div class="question-meta">
            ID: ${data.id}
            ${data.difficulty ? ` • ${data.difficulty}` : ''}${formatAcceptanceRate(data.acceptanceRate)}
            ${data.category ? ` • ${data.category.name}` : ''}
            ${data.source ? ` • ${data.source}` : ''}
          </div>
        </div>
      </div>
    `;
    showRaw(data);
  } catch(e) {
    console.error('Failed to find question by ID:', e);
    const listDiv = document.getElementById('search_results');
    listDiv.innerHTML = `<div style="padding:12px;color:#d32f2f">${e.message}</div>`;
    showRaw({error: e.message});
  }
}

// ==================== NEW: ADVANCED FILTERING ====================

async function applyAdvancedFilters() {
  const categoryName = document.getElementById('cat_select')?.value || '';
  const difficulty = document.getElementById('diff_select')?.value || '';
  const tagName = document.getElementById('tag_select')?.value || '';
  const source = document.getElementById('source_select')?.value || '';
  const search = document.getElementById('title_search')?.value?.trim() || '';
  const sortBy = document.getElementById('sort_by')?.value || '';
  
  // Build query parameters
  const params = new URLSearchParams();
  if (categoryName) params.append('categoryName', categoryName);
  if (difficulty) params.append('difficulty', difficulty);
  if (tagName) params.append('tagName', tagName);
  if (source) params.append('source', source);
  if (search) params.append('search', search);
  params.append('page', '0');
  params.append('size', '1000'); // Get more results for client-side sorting
  
  try {
    const res = await fetch(`${apiBase}?${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const data = await res.json();
    let questions = data.content || [];
    
    // Client-side sorting
    if (sortBy && questions.length > 0) {
      const difficultyOrder = { 'EASY': 1, 'MEDIUM': 2, 'HARD': 3 };
      
      switch(sortBy) {
        case 'difficulty_asc':
          questions.sort((a, b) => (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0));
          break;
        case 'difficulty_desc':
          questions.sort((a, b) => (difficultyOrder[b.difficulty] || 0) - (difficultyOrder[a.difficulty] || 0));
          break;
        case 'acceptance_asc':
          questions.sort((a, b) => (a.acceptanceRate || 0) - (b.acceptanceRate || 0));
          break;
        case 'acceptance_desc':
          questions.sort((a, b) => (b.acceptanceRate || 0) - (a.acceptanceRate || 0));
          break;
        case 'title_asc':
          questions.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
          break;
        case 'title_desc':
          questions.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
          break;
      }
    }
    
    // Update results count
    const countSpan = document.getElementById('results_count');
    if (countSpan) {
      countSpan.textContent = `(${data.totalElements} question${data.totalElements !== 1 ? 's' : ''} found)`;
    }
    
    // Display results
    const listDiv = document.getElementById('search_results');
    if (!questions || questions.length === 0) {
      listDiv.innerHTML = '<div class="empty-state">🔍 No questions match your filters</div>';
    } else {
      listDiv.innerHTML = questions.map(q => `
        <div class="question-item">
          <div>
            <div class="question-title">
              ${q.title}
              ${q.externalUrl ? `<a href="${q.externalUrl}" target="_blank" class="link-icon" title="Open question link" style="margin-left: 8px; font-size: 0.9em;">↗</a>` : ''}
            </div>
            <div class="question-meta">
              ID: ${q.id}
              ${q.difficulty ? ` • ${q.difficulty}` : ''}${formatAcceptanceRate(q.acceptanceRate)}
              ${q.category ? ` • ${q.category.name}` : ''}
              ${q.source ? ` • ${q.source}` : ''}
            </div>
            ${q.tags && q.tags.length > 0 ? `
              <div class="question-tags">
                ${q.tags.map(t => `<span class="tag-badge">${t.name}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      `).join('');
    }
    
    showRaw(data);
  } catch(e) {
    console.error('Failed to apply filters:', e);
    const listDiv = document.getElementById('search_results');
    listDiv.innerHTML = `<div style="padding:12px;color:#d32f2f">Failed to load questions: ${e.message}</div>`;
  }
}

function clearAllFilters() {
  // Clear all filter inputs
  const catSelect = document.getElementById('cat_select');
  if (catSelect) catSelect.value = '';
  
  const diffSelect = document.getElementById('diff_select');
  if (diffSelect) diffSelect.value = '';
  
  const tagSelect = document.getElementById('tag_select');
  if (tagSelect) tagSelect.value = '';
  
  const sourceSelect = document.getElementById('source_select');
  if (sourceSelect) sourceSelect.value = '';
  
  const titleSearch = document.getElementById('title_search');
  if (titleSearch) titleSearch.value = '';
  
  const sortBySelect = document.getElementById('sort_by');
  if (sortBySelect) sortBySelect.value = '';
  
  // Clear results
  const listDiv = document.getElementById('search_results');
  if (listDiv) listDiv.innerHTML = '';
  
  const countSpan = document.getElementById('results_count');
  if (countSpan) countSpan.textContent = '';
}

// ==================== NEW: TAG MANAGEMENT ====================

let allTagsData = []; // Store all tags for filtering

async function loadTags() {
  try {
    const res = await fetch(`${apiBase}/listTags`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    allTagsData = await res.json();
    
    // Populate tag dropdown in Browse page
    const tagSelect = document.getElementById('tag_select');
    if (tagSelect) {
      tagSelect.innerHTML = '<option value="">-- ALL TAGS --</option>';
      allTagsData.forEach(tag => {
        tagSelect.innerHTML += `<option value="${tag.name}">${tag.name} (${tag.questionCount || 0})</option>`;
      });
    }
    
    // Display tags on Tags page
    displayAllTags();
    
    // Calculate and display statistics
    calculateTagStats();
    
    showRaw(allTagsData);
  } catch(e) {
    console.error('Failed to load tags:', e);
  }
}

function displayAllTags() {
  const tagsList = document.getElementById('tags_list');
  if (!tagsList) return;
  
  if (allTagsData.length === 0) {
    tagsList.innerHTML = '<div class="empty-state">No tags available</div>';
    return;
  }
  
  tagsList.innerHTML = allTagsData.map(tag => 
    `<span class="tag-badge" onclick="findQuestionsByTag('${tag.name}')" title="Click to view questions">
      ${tag.name} ${tag.questionCount ? `(${tag.questionCount})` : ''}
    </span>`
  ).join('');
}

function filterTagsList() {
  const searchInput = document.getElementById('tag_search');
  if (!searchInput) return;
  
  const searchTerm = searchInput.value.toLowerCase().trim();
  
  const tagsList = document.getElementById('tags_list');
  if (!tagsList) return;
  
  if (!searchTerm) {
    displayAllTags();
    return;
  }
  
  const filtered = allTagsData.filter(tag => 
    tag.name.toLowerCase().includes(searchTerm)
  );
  
  if (filtered.length === 0) {
    tagsList.innerHTML = '<div class="empty-state">🔍 No tags match your search</div>';
  } else {
    tagsList.innerHTML = filtered.map(tag => 
      `<span class="tag-badge" onclick="findQuestionsByTag('${tag.name}')" title="Click to view questions">
        ${tag.name} ${tag.questionCount ? `(${tag.questionCount})` : ''}
      </span>`
    ).join('');
  }
}

async function findQuestionsByTag(tagName) {
  try {
    const res = await fetch(`${apiBase}/byTag/${encodeURIComponent(tagName)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const questions = await res.json();
    
    const byTagList = document.getElementById('by_tag_list');
    if (!byTagList) return;
    
    if (questions.length === 0) {
      byTagList.innerHTML = `<div class="empty-state">No questions found for tag: ${tagName}</div>`;
    } else {
      byTagList.innerHTML = `
        <h3>Questions tagged with "${tagName}" (${questions.length})</h3>
        ${questions.map(q => `
          <div class="question-item">
            <div>
              <div class="question-title">
                ${q.title}
                ${q.externalUrl ? `<a href="${q.externalUrl}" target="_blank" class="link-icon" title="Open question link" style="margin-left: 8px; font-size: 0.9em;">↗</a>` : ''}
              </div>
              <div class="question-meta">
                ID: ${q.id}
                ${q.difficulty ? ` • ${q.difficulty}` : ''}${formatAcceptanceRate(q.acceptanceRate)}
                ${q.category ? ` • ${q.category.name}` : ''}
                ${q.source ? ` • ${q.source}` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      `;
    }
    
    showRaw(questions);
  } catch(e) {
    console.error('Failed to find questions by tag:', e);
    const byTagList = document.getElementById('by_tag_list');
    if (byTagList) {
      byTagList.innerHTML = `<div style="padding:12px;color:#d32f2f">Failed to load questions: ${e.message}</div>`;
    }
  }
}

function calculateTagStats() {
  const totalTagsSpan = document.getElementById('total_tags');
  const mostUsedSpan = document.getElementById('most_used_tag');
  const leastUsedSpan = document.getElementById('least_used_tag');
  const avgTagsSpan = document.getElementById('avg_tags_per_q');
  
  if (!totalTagsSpan) return; // Not on tags page
  
  if (allTagsData.length === 0) {
    totalTagsSpan.textContent = '0';
    mostUsedSpan.textContent = '-';
    leastUsedSpan.textContent = '-';
    avgTagsSpan.textContent = '-';
    return;
  }
  
  // Total tags
  totalTagsSpan.textContent = allTagsData.length;
  
  // Most used tag
  const sorted = [...allTagsData].sort((a, b) => (b.questionCount || 0) - (a.questionCount || 0));
  if (sorted.length > 0 && sorted[0].questionCount) {
    mostUsedSpan.textContent = `${sorted[0].name} (${sorted[0].questionCount})`;
  } else {
    mostUsedSpan.textContent = '-';
  }
  
  // Least used tag
  const leastUsed = sorted[sorted.length - 1];
  if (leastUsed && leastUsed.questionCount !== undefined) {
    leastUsedSpan.textContent = `${leastUsed.name} (${leastUsed.questionCount})`;
  } else {
    leastUsedSpan.textContent = '-';
  }
  
  // Average tags per question (approximate)
  const totalQuestionTags = allTagsData.reduce((sum, tag) => sum + (tag.questionCount || 0), 0);
  if (totalQuestionTags > 0) {
    // This is an approximation - actual value would need total unique questions
    avgTagsSpan.textContent = (totalQuestionTags / allTagsData.length).toFixed(1);
  } else {
    avgTagsSpan.textContent = '-';
  }
}

// ==================== NEW: BULK IMPORT ====================

async function bulkImportQuestions() {
  const fileInput = document.getElementById('bulk_file');
  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    alert('⚠️ Please select a JSON file to import');
    return;
  }
  
  const file = fileInput.files[0];
  
  // Validate file type
  if (!file.name.endsWith('.json')) {
    alert('⚠️ Please select a valid JSON file');
    return;
  }
  
  try {
    // Read file
    const text = await file.text();
    const questions = JSON.parse(text);
    
    // Validate it's an array
    if (!Array.isArray(questions)) {
      alert('⚠️ JSON file must contain an array of questions');
      return;
    }
    
    if (questions.length === 0) {
      alert('⚠️ JSON file is empty');
      return;
    }
    
    // Show loading indicator
    const resultsDiv = document.getElementById('bulk_results');
    if (resultsDiv) {
      resultsDiv.innerHTML = '<div style="padding:20px;text-align:center">⏳ Importing questions... This may take a moment.</div>';
    }
    
    // Send to API
    const startTime = Date.now();
    const res = await fetch(`${apiBase}/bulkImport`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(questions)
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    
    const result = await res.json();
    const duration = Date.now() - startTime;
    
    // Display results
    if (resultsDiv) {
      resultsDiv.innerHTML = `
        <h3>✅ Import Complete!</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin:16px 0">
          <div class="import-stat stat-total">
            <div style="font-size:32px;font-weight:bold">${result.totalQuestions}</div>
            <div>Total Questions</div>
          </div>
          <div class="import-stat stat-success">
            <div style="font-size:32px;font-weight:bold">${result.successfulImports}</div>
            <div>✓ Successfully Imported</div>
          </div>
          <div class="import-stat stat-skip">
            <div style="font-size:32px;font-weight:bold">${result.skippedDuplicates}</div>
            <div>⊘ Skipped (Duplicates)</div>
          </div>
          <div class="import-stat stat-fail">
            <div style="font-size:32px;font-weight:bold">${result.failedImports}</div>
            <div>✗ Failed</div>
          </div>
        </div>
        <div style="padding:12px;background:#f5f5f5;border-radius:8px;margin-top:16px">
          <strong>Duration:</strong> ${(result.durationMs / 1000).toFixed(2)}s (client side: ${(duration / 1000).toFixed(2)}s)
        </div>
        ${result.errorMessages && result.errorMessages.length > 0 ? `
          <div style="margin-top:16px">
            <details>
              <summary style="cursor:pointer;color:#d32f2f;font-weight:600">❌ Error Messages (${result.errorMessages.length})</summary>
              <pre style="background:#ffebee;padding:12px;border-radius:4px;overflow:auto;max-height:200px;margin-top:8px">${result.errorMessages.join('\n')}</pre>
            </details>
          </div>
        ` : ''}
        ${result.skippedTitles && result.skippedTitles.length > 0 ? `
          <div style="margin-top:16px">
            <details>
              <summary style="cursor:pointer;color:#f57c00;font-weight:600">⊘ Skipped Questions (${result.skippedTitles.length})</summary>
              <div style="background:#fff3e0;padding:12px;border-radius:4px;overflow:auto;max-height:200px;margin-top:8px">
                ${result.skippedTitles.map(title => `<div>• ${title}</div>`).join('')}
              </div>
            </details>
          </div>
        ` : ''}
      `;
    }
    
    showRaw(result);
    
    // Reload tags since new tags may have been created
    await loadTags();
    
  } catch(e) {
    console.error('Bulk import failed:', e);
    const resultsDiv = document.getElementById('bulk_results');
    if (resultsDiv) {
      resultsDiv.innerHTML = `
        <div style="padding:20px;background:#ffebee;border-radius:8px;color:#d32f2f">
          <h3>❌ Import Failed</h3>
          <p>${e.message}</p>
        </div>
      `;
    }
    alert('❌ Bulk import failed: ' + e.message);
  }
}

async function validateJsonFile() {
  const fileInput = document.getElementById('bulk_file');
  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    alert('⚠️ Please select a JSON file first');
    return;
  }
  
  const file = fileInput.files[0];
  
  try {
    const text = await file.text();
    const questions = JSON.parse(text);
    
    if (!Array.isArray(questions)) {
      alert('❌ Invalid: JSON must be an array of questions');
      return;
    }
    
    if (questions.length === 0) {
      alert('❌ Invalid: JSON array is empty');
      return;
    }
    
    // Validate structure of first few questions
    const requiredFields = ['title', 'slug', 'difficulty', 'category', 'source', 'tags'];
    const sampleSize = Math.min(5, questions.length);
    const errors = [];
    
    for (let i = 0; i < sampleSize; i++) {
      const q = questions[i];
      const missing = requiredFields.filter(field => !q[field]);
      if (missing.length > 0) {
        errors.push(`Question ${i + 1}: Missing fields: ${missing.join(', ')}`);
      }
    }
    
    // Show preview
    const previewDiv = document.getElementById('bulk_preview');
    if (previewDiv) {
      const preview = questions.slice(0, 3);
      previewDiv.innerHTML = `
        <h3>✅ JSON Validation Successful</h3>
        <div style="padding:12px;background:#e8f5e9;border-radius:8px;margin:16px 0">
          <strong>Total Questions:</strong> ${questions.length}<br>
          <strong>Structure:</strong> Valid JSON array<br>
          ${errors.length > 0 ? `<strong style="color:#d32f2f">Warnings:</strong> ${errors.length} validation issues found` : '<strong style="color:#2e7d32">✓</strong> All required fields present'}
        </div>
        ${errors.length > 0 ? `
          <div style="background:#fff3e0;padding:12px;border-radius:8px;margin-bottom:16px">
            <strong>⚠️ Validation Warnings:</strong>
            ${errors.map(err => `<div>• ${err}</div>`).join('')}
          </div>
        ` : ''}
        <h4>Preview (First 3 Questions):</h4>
        <pre style="background:#f5f5f5;padding:12px;border-radius:8px;overflow:auto;max-height:400px">${JSON.stringify(preview, null, 2)}</pre>
      `;
    }
    
    showRaw({
      valid: true,
      totalQuestions: questions.length,
      errors: errors,
      preview: preview
    });
    
  } catch(e) {
    console.error('JSON validation failed:', e);
    alert('❌ Invalid JSON: ' + e.message);
    
    const previewDiv = document.getElementById('bulk_preview');
    if (previewDiv) {
      previewDiv.innerHTML = `
        <div style="padding:20px;background:#ffebee;border-radius:8px;color:#d32f2f">
          <h3>❌ JSON Validation Failed</h3>
          <p>${e.message}</p>
        </div>
      `;
    }
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Create page
  const btnCreate = document.getElementById('btn_create');
  if (btnCreate) btnCreate.addEventListener('click', createQuestion);
  
  // Browse page
  const btnRandom = document.getElementById('btn_random');
  if (btnRandom) btnRandom.addEventListener('click', () => loadRandom10('random_list'));
  
  const btnRefreshBrowse = document.getElementById('btn_refresh_browse');
  if (btnRefreshBrowse) btnRefreshBrowse.addEventListener('click', () => loadRandom10('random_list'));
  
  // Home page random
  const btnHomeRandom = document.getElementById('btn_home_random');
  if (btnHomeRandom) {
    btnHomeRandom.addEventListener('click', () => loadRandom10('home_random_list'));
  }
  
  // Update page
  const btnSearchQuestion = document.getElementById('btn_search_question');
  if (btnSearchQuestion) btnSearchQuestion.addEventListener('click', searchQuestionForUpdate);
  
  const btnClosePreview = document.getElementById('btn_close_preview');
  if (btnClosePreview) btnClosePreview.addEventListener('click', closePreviewAndShowForm);
  
  const btnCloseNotFound = document.getElementById('btn_close_notfound');
  if (btnCloseNotFound) btnCloseNotFound.addEventListener('click', closeNotFoundModal);
  
  const btnUpdate = document.getElementById('btn_update');
  if (btnUpdate) btnUpdate.addEventListener('click', updateQuestion);
  
  // Delete page
  const btnDelete = document.getElementById('btn_delete');
  if (btnDelete) btnDelete.addEventListener('click', deleteQuestion);
  
  // Categories page
  const btnAddCat = document.getElementById('btn_add_cat');
  if (btnAddCat) btnAddCat.addEventListener('click', addCategory);
  
  const btnRefreshCategories = document.getElementById('btn_refresh_categories');
  if (btnRefreshCategories) btnRefreshCategories.addEventListener('click', loadCategories);
  
  // Search functionality on Browse page (legacy)
  const btnFindCat = document.getElementById('btn_find_cat');
  if (btnFindCat) btnFindCat.addEventListener('click', findByCategory);
  
  const btnFindDiff = document.getElementById('btn_find_diff');
  if (btnFindDiff) btnFindDiff.addEventListener('click', findByDifficulty);
  
  const btnFindById = document.getElementById('btn_find_id');
  if (btnFindById) btnFindById.addEventListener('click', findById);
  
  // New advanced filter functionality
  const btnFilterQuestions = document.getElementById('btn_filter_questions');
  if (btnFilterQuestions) btnFilterQuestions.addEventListener('click', applyAdvancedFilters);
  
  const btnClearFilters = document.getElementById('btn_clear_filters');
  if (btnClearFilters) btnClearFilters.addEventListener('click', clearAllFilters);
  
  const btnSearchById = document.getElementById('btn_search_by_id');
  if (btnSearchById) btnSearchById.addEventListener('click', findById);
  
  // Bulk Import page
  const btnBulkImport = document.getElementById('btn_bulk_import');
  if (btnBulkImport) btnBulkImport.addEventListener('click', bulkImportQuestions);
  
  const btnValidateJson = document.getElementById('btn_validate_json');
  if (btnValidateJson) btnValidateJson.addEventListener('click', validateJsonFile);
  
  // Tags page
  const btnRefreshTags = document.getElementById('btn_refresh_tags');
  if (btnRefreshTags) btnRefreshTags.addEventListener('click', loadTags);
  
  const tagSearchInput = document.getElementById('tag_search');
  if (tagSearchInput) {
    tagSearchInput.addEventListener('input', filterTagsList);
  }
  
  // Initialize - load categories and tags
  loadCategories();
  loadTags();
});

// Auto-refresh support (if needed)
async function refreshIfNeeded(){
  try{
    await loadCategories();
    if (lastCategorySelected){
      await loadQuestionsForCategory(lastCategorySelected);
    }
  }catch(e){
    console.error('Auto-refresh failed:', e);
  }
}

// Optional: Auto-refresh every 30 seconds
// setInterval(refreshIfNeeded, 30000);
