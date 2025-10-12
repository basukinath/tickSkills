const apiBase = '/api/questions';
let lastCategorySelected = null;

// Helper function to show raw JSON (works with both old and new UI)
function showRaw(obj){
  const rawElement = document.getElementById('raw');
  const createResponse = document.getElementById('create_response');
  const updateResponse = document.getElementById('update_response');
  const deleteResponse = document.getElementById('delete_response');
  
  const jsonStr = JSON.stringify(obj, null, 2);
  
  if (rawElement) rawElement.textContent = jsonStr;
  if (createResponse) createResponse.textContent = jsonStr;
  if (updateResponse) updateResponse.textContent = jsonStr;
  if (deleteResponse) deleteResponse.textContent = jsonStr;
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
            <div class="question-title">${q.title}</div>
            <div class="question-meta">
              ID: ${q.id}
              ${q.difficulty ? ` • ${q.difficulty}` : ''}
              ${q.category ? ` • ${q.category.name}` : ''}
              ${q.source ? ` • ${q.source}` : ''}
            </div>
          </div>
          ${q.externalUrl ? `<a href="${q.externalUrl}" target="_blank" class="link-icon" title="Open question link">🔗</a>` : ''}
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
    const res = await fetch(`${apiBase}/categories/all`);
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
            <div class="question-title">${q.title}</div>
            <div class="question-meta">
              ID: ${q.id}
              ${q.difficulty ? ` • ${q.difficulty}` : ''}
              ${q.source ? ` • ${q.source}` : ''}
            </div>
          </div>
          ${q.externalUrl ? `<a href="${q.externalUrl}" target="_blank" class="link-icon" title="Open question link">🔗</a>` : ''}
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
    
    // Clear form
    document.getElementById('upd_id').value = '';
    document.getElementById('upd_title').value = '';
    document.getElementById('upd_category').selectedIndex = 0;
    document.getElementById('upd_difficulty').selectedIndex = 0;
    document.getElementById('upd_source').selectedIndex = 0;
    document.getElementById('upd_url').value = '';
    document.getElementById('upd_tags').value = '';
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
    const res = await fetch(`${apiBase}/categories/add`, {
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

async function findByDifficulty(){
  const difficulty = document.getElementById('diff_select').value;
  const res = await fetch(`${apiBase}/byDifficulty/${encodeURIComponent(difficulty)}`);
  const data = await res.json();
  
  const listDiv = document.getElementById('diff_list');
  if (data.length === 0) {
    listDiv.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>No questions found for this difficulty</p></div>';
  } else {
    listDiv.innerHTML = data.map(q => `
      <div class="question-item">
        <div>
          <div class="question-title">${q.title}</div>
          <div class="question-meta">
            ID: ${q.id}
            ${q.category ? ` • ${q.category.name}` : ''}
            ${q.source ? ` • ${q.source}` : ''}
          </div>
        </div>
        ${q.externalUrl ? `<a href="${q.externalUrl}" target="_blank" class="link-icon" title="Open question link">🔗</a>` : ''}
      </div>
    `).join('');
  }
  showRaw(data);
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
  
  // Search page
  const btnFindDiff = document.getElementById('btn_find_diff');
  if (btnFindDiff) btnFindDiff.addEventListener('click', findByDifficulty);
  
  // Initialize - load categories
  loadCategories();
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
