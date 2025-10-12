const apiBase = '/api/questions';
let lastCategorySelected = null;

function showRaw(obj){
  document.getElementById('raw').textContent = JSON.stringify(obj, null, 2);
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

async function loadRandom10(){
  try {
    const res = await fetch(`${apiBase}/random10`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    const listDiv = document.getElementById('random_list');
    if (data.length === 0) {
      listDiv.innerHTML = '<div style="padding:12px;color:#999">No questions found</div>';
    } else {
      listDiv.innerHTML = data.map(q=>`
        <div style="padding:8px;border-bottom:1px solid #f0f0f0">
          <a href="${q.externalUrl || '#'}" target="_blank" style="text-decoration:none;color:#0366d6;font-weight:500">
            ${q.title}
          </a>
          <span style="color:#666;font-size:13px;margin-left:8px">ID: ${q.id}</span>
          ${q.difficulty ? `<span style="margin-left:8px;padding:2px 6px;background:#e3f2fd;border-radius:3px;font-size:11px">${q.difficulty}</span>` : ''}
          ${q.category ? `<span style="margin-left:8px;color:#666;font-size:12px">[${q.category.name}]</span>` : ''}
        </div>
      `).join('');
    }
    showRaw(data);
  } catch(e) {
    console.error('Failed to load random questions', e);
    document.getElementById('random_list').innerHTML = '<div style="padding:12px;color:#d32f2f">Error loading questions. Check console.</div>';
  }
}

// load categories into datalist
async function loadCategories(){
  console.log('Loading categories from', `${apiBase}/listCategories`);
  const tbody = document.getElementById('categories_tbody');
  
  try{
    const res = await fetch(`${apiBase}/listCategories`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const cats = await res.json();
    console.log('Loaded categories:', cats.length, 'categories', cats);
    
    // populate category dropdown for create question form
    const categorySelect = document.getElementById('q_category');
    if (categorySelect) {
      if (cats.length === 0) {
        categorySelect.innerHTML = '<option value="">-- No categories available --</option>';
      } else {
        categorySelect.innerHTML = '<option value="">-- Select a category --</option>' + 
          cats.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
      }
    }
    
    // populate category dropdown for update question form
    const updateCategorySelect = document.getElementById('upd_category');
    if (updateCategorySelect) {
      if (cats.length === 0) {
        updateCategorySelect.innerHTML = '<option value="">-- No categories available --</option>';
      } else {
        updateCategorySelect.innerHTML = '<option value="">-- keep current --</option>' + 
          cats.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
      }
    }
    
    // populate the categories table
    if (tbody){
      if (cats.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" style="padding:12px;text-align:center;color:#999">No categories found. Add one using "Add Category" section.</td></tr>';
      } else {
        tbody.innerHTML = cats.map(c => `
          <tr style="cursor:pointer;border-bottom:1px solid #f0f0f0" 
              onmouseover="this.style.background='#f7fafc'" 
              onmouseout="this.style.background='white'"
              onclick="loadQuestionsForCategory('${c.name.replace(/'/g, "\\'")}')">
            <td style="padding:10px;font-weight:500">${c.name || ''}</td>
            <td style="padding:10px;color:#555;font-size:13px">${c.description || '—'}</td>
          </tr>
        `).join('');
        console.log('Populated categories table with', cats.length, 'rows');
      }
    } else {
      console.error('categories_tbody element not found in DOM');
    }
  }catch(e){ 
    console.error('Failed to load categories:', e); 
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="2" style="padding:12px;text-align:center;color:#d32f2f">Error loading categories: ${e.message}. Check console and verify backend is running.</td></tr>`;
    }
  }
}

// load questions for a selected category (called when clicking a row)
async function loadQuestionsForCategory(categoryName){
  console.log('Loading questions for category:', categoryName);
  lastCategorySelected = categoryName;
  try {
    const res = await fetch(`${apiBase}/byCategory/${encodeURIComponent(categoryName)}`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    const listDiv = document.getElementById('by_cat_list');
    if (data.length === 0) {
      listDiv.innerHTML = '<div style="padding:12px;color:#999">No questions found in this category</div>';
    } else {
      listDiv.innerHTML = data.map(q=>`
        <div style="padding:8px;border-bottom:1px solid #f0f0f0">
          <a href="${q.externalUrl || '#'}" target="_blank" style="text-decoration:none;color:#0366d6;font-weight:500">
            ${q.title}
          </a>
          <span style="color:#666;font-size:13px;margin-left:8px">ID: ${q.id}</span>
          ${q.difficulty ? `<span style="margin-left:8px;padding:2px 6px;background:#e3f2fd;border-radius:3px;font-size:11px">${q.difficulty}</span>` : ''}
        </div>
      `).join('');
    }
    showRaw(data);
  } catch(e) {
    console.error('Failed to load questions for category', categoryName, e);
    document.getElementById('by_cat_list').innerHTML = `<div style="padding:12px;color:#d32f2f">Error: ${e.message}</div>`;
  }
}

async function updateQuestion(){
  const id = document.getElementById('upd_id').value;
  if (!id) {
    alert('Question ID is required!');
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
    const res = await fetch(`${apiBase}/update/${id}`, {
      method:'PUT',
      headers:{'Content-Type':'application/json'}, 
      body:JSON.stringify(body)
    });
    if (res.status === 404){ 
      alert('Question not found!');
      showRaw({error:'Not found'}); 
      return; 
    }
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`HTTP ${res.status}: ${error}`);
    }
    const data = await res.json(); 
    showRaw(data);
    alert('Question updated successfully!');
  } catch(e) {
    console.error('Failed to update question:', e);
    alert('Failed to update question: ' + e.message);
    showRaw({error: e.message});
  }
}

async function deleteQuestion(){
  const id = document.getElementById('del_id').value;
  const res = await fetch(`${apiBase}/delete/${id}`, {method:'DELETE'});
  showRaw({status: res.status});
}

async function addCategory(){
  const name = document.getElementById('cat_name').value;
  const desc = document.getElementById('cat_desc').value;
  const res = await fetch(`${apiBase}/addCategory`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name, description: desc})});
  const data = await res.json(); showRaw(data);
}

async function findByDifficulty(){
  const difficulty = document.getElementById('diff_select').value;
  const res = await fetch(`${apiBase}/byDifficulty/${encodeURIComponent(difficulty)}`);
  const data = await res.json();
  document.getElementById('diff_list').innerHTML = data.map(q => {
    const linkHtml = q.externalUrl 
      ? `<a href="${q.externalUrl}" target="_blank" style="color:#1976d2;text-decoration:none;margin-left:8px" title="Open question link">🔗</a>`
      : '';
    return `<div style="padding:6px 0">${q.title} (ID: ${q.id})${linkHtml}</div>`;
  }).join('');
  showRaw(data);
}

document.getElementById('btn_create').addEventListener('click', createQuestion);
document.getElementById('btn_random').addEventListener('click', loadRandom10);
document.getElementById('btn_update').addEventListener('click', updateQuestion);
document.getElementById('btn_delete').addEventListener('click', deleteQuestion);
document.getElementById('btn_add_cat').addEventListener('click', addCategory);
document.getElementById('btn_find_diff').addEventListener('click', findByDifficulty);

// initialize UI
loadCategories();

// wire refresh button
const refreshBtn = document.getElementById('btn_refresh_categories');
if (refreshBtn){ refreshBtn.addEventListener('click', loadCategories); }

// auto-refresh support: refresh categories and the current category every 30s
async function refreshIfNeeded(){
  try{
    await loadCategories();
    if (lastCategorySelected){
      // re-load questions for the selected category
      await loadQuestionsForCategory(lastCategorySelected);
    }
  }catch(e){ console.warn('auto-refresh failed', e); }
}

// run refresh every 30 seconds
setInterval(refreshIfNeeded, 30000);
// run once at startup after loading categories
setTimeout(refreshIfNeeded, 1000);
