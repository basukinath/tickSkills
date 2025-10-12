// API Base URLs
const questionsApiBase = '/api/questions';
const usersApiBase = '/api/users';

// Utility: Show response in all response divs
function showRaw(obj) {
  const responses = [
    'q_create_response', 'q_browse_raw', 'q_update_response', 'q_delete_response', 'q_categories_raw',
    'u_create_response', 'u_browse_response', 'u_update_response', 'u_delete_response'
  ];
  
  responses.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = JSON.stringify(obj, null, 2);
    }
  });
}

// ============================================
// QUESTION MANAGEMENT FUNCTIONS
// ============================================

async function createQuestion() {
  const title = document.getElementById('q_title').value;
  const category = document.getElementById('q_category').value;
  const difficulty = document.getElementById('q_difficulty').value;
  const source = document.getElementById('q_source').value;
  const externalUrl = document.getElementById('q_url').value;
  const tagsStr = document.getElementById('q_tags').value;
  
  if (!title || !category || !difficulty || !source) {
    alert('Please fill in all required fields');
    return;
  }
  
  const tags = tagsStr ? tagsStr.split(',').map(s => s.trim()).filter(Boolean) : [];
  
  const body = { title, category, difficulty, source, externalUrl, tags };
  
  try {
    const res = await fetch(`${questionsApiBase}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`HTTP ${res.status}: ${error}`);
    }
    
    const data = await res.json();
    showRaw(data);
    
    alert(`Question created successfully!\n\nID: ${data.id}\nTitle: ${data.title}\nCategory: ${data.category?.name || 'N/A'}\nDifficulty: ${data.difficulty}\nSource: ${data.source}`);
    
    clearQuestionForm();
  } catch (e) {
    console.error('Failed to create question:', e);
    alert('Failed to create question: ' + e.message);
    showRaw({ error: e.message });
  }
}

async function loadCategories() {
  try {
    const res = await fetch(`${questionsApiBase}/listCategories`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const cats = await res.json();
    
    const selects = ['q_category', 'q_upd_category'];
    selects.forEach(id => {
      const select = document.getElementById(id);
      if (select) {
        select.innerHTML = '<option value="">-- Select Category --</option>' + 
          cats.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
      }
    });
    
    return cats;
  } catch (e) {
    console.error('Failed to load categories:', e);
    return [];
  }
}

// ============================================
// USER MANAGEMENT FUNCTIONS
// ============================================

async function createUser() {
  const name = document.getElementById('u_name').value;
  const username = document.getElementById('u_username').value;
  const email = document.getElementById('u_email').value;
  const phone = document.getElementById('u_phone').value;
  const password = document.getElementById('u_password').value;
  const userType = document.getElementById('u_usertype').value;
  const photoUrl = document.getElementById('u_photourl').value;
  
  if (!email || !userType) {
    alert('Email and User Type are required');
    return;
  }
  
  const body = {
    name: name || null,
    username: username || null,
    email,
    phone: phone || null,
    password: password || null,
    userType,
    photoUrl: photoUrl || null
  };
  
  try {
    const res = await fetch(`${usersApiBase}/addUser`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`HTTP ${res.status}: ${error}`);
    }
    
    const text = await res.text();
    showRaw({ message: text });
    
    alert(`User created successfully!\n\n${text}`);
    
    clearUserForm();
    loadDashboardStats();
  } catch (e) {
    console.error('Failed to create user:', e);
    alert('Failed to create user: ' + e.message);
    showRaw({ error: e.message });
  }
}

async function loadAllUsers() {
  try {
    const res = await fetch(`${usersApiBase}/getAllUsers`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const usernames = await res.json();
    showRaw(usernames);
    
    const listDiv = document.getElementById('user_list');
    if (usernames.length === 0) {
      listDiv.innerHTML = '<div class="empty-state"><div class="empty-state-icon">👤</div><p>No users found</p></div>';
    } else {
      listDiv.innerHTML = usernames.map(username => `
        <div class="item">
          <div>
            <div class="item-title">${username}</div>
            <div class="item-meta">Username</div>
          </div>
          <button class="secondary" onclick="getUserDetails('${username}')" style="padding: 8px 16px; margin-left: 12px;">View Details</button>
        </div>
      `).join('');
    }
  } catch (e) {
    console.error('Failed to load users:', e);
    const listDiv = document.getElementById('user_list');
    listDiv.innerHTML = `<div style="padding:12px;color:#d32f2f">Error: ${e.message}</div>`;
    showRaw({ error: e.message });
  }
}

async function loadActiveUsers() {
  try {
    const res = await fetch(`${usersApiBase}/getAllActiveUsers`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const usernames = await res.json();
    showRaw(usernames);
    
    const listDiv = document.getElementById('user_list');
    if (usernames.length === 0) {
      listDiv.innerHTML = '<div class="empty-state"><div class="empty-state-icon">👤</div><p>No active users found</p></div>';
    } else {
      listDiv.innerHTML = usernames.map(username => `
        <div class="item" style="border-left-color: #43e97b;">
          <div>
            <div class="item-title">${username}</div>
            <div class="item-meta"><span class="badge badge-success">Active</span></div>
          </div>
          <button class="secondary" onclick="getUserDetails('${username}')" style="padding: 8px 16px; margin-left: 12px;">View Details</button>
        </div>
      `).join('');
    }
  } catch (e) {
    console.error('Failed to load active users:', e);
    const listDiv = document.getElementById('user_list');
    listDiv.innerHTML = `<div style="padding:12px;color:#d32f2f">Error: ${e.message}</div>`;
    showRaw({ error: e.message });
  }
}

async function getUserDetails(username) {
  try {
    const res = await fetch(`${usersApiBase}/getUser/${encodeURIComponent(username)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const user = await res.json();
    showRaw(user);
    
    alert(`User Details:\n\nID: ${user.id || 'N/A'}\nName: ${user.name || 'N/A'}\nUsername: ${user.username || 'N/A'}\nEmail: ${user.email || 'N/A'}\nPhone: ${user.phone || 'N/A'}\nType: ${user.userType || 'N/A'}\nPhoto: ${user.photoUrl || 'N/A'}`);
  } catch (e) {
    console.error('Failed to get user details:', e);
    alert('Failed to get user details: ' + e.message);
  }
}

async function searchUserForUpdate() {
  const username = document.getElementById('u_upd_username').value;
  if (!username) {
    alert('Please enter a username');
    return;
  }
  
  try {
    const res = await fetch(`${usersApiBase}/getUser/${encodeURIComponent(username)}`);
    if (!res.ok) {
      if (res.status === 404) {
        showUserNotFound();
        return;
      }
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    showUserPreview(data);
  } catch (e) {
    console.error('Failed to search user:', e);
    alert('Error searching for user: ' + e.message);
  }
}

function showUserPreview(user) {
  document.getElementById('user_notfound_modal').style.display = 'none';
  document.getElementById('user_update_form').style.display = 'none';
  
  const previewContent = document.getElementById('user_preview_content');
  previewContent.innerHTML = `
    <div style="display: grid; gap: 12px;">
      <div>
        <strong style="color: #667eea;">ID:</strong> 
        <span style="color: #2d3748;">${user.id || 'N/A'}</span>
      </div>
      <div>
        <strong style="color: #667eea;">Name:</strong> 
        <span style="color: #2d3748;">${user.name || '—'}</span>
      </div>
      <div>
        <strong style="color: #667eea;">Username:</strong> 
        <span style="color: #2d3748;">${user.username || '—'}</span>
      </div>
      <div>
        <strong style="color: #667eea;">Email:</strong> 
        <span style="color: #2d3748;">${user.email || '—'}</span>
      </div>
      <div>
        <strong style="color: #667eea;">Phone:</strong> 
        <span style="color: #2d3748;">${user.phone || '—'}</span>
      </div>
      <div>
        <strong style="color: #667eea;">User Type:</strong> 
        <span class="badge ${user.userType === 'ADMIN' ? 'badge-danger' : 'badge-info'}">${user.userType || '—'}</span>
      </div>
      <div>
        <strong style="color: #667eea;">Photo URL:</strong> 
        ${user.photoUrl ? `<a href="${user.photoUrl}" target="_blank" style="color: #667eea;">🔗 ${user.photoUrl}</a>` : '<span style="color: #718096;">—</span>'}
      </div>
    </div>
  `;
  
  document.getElementById('user_preview_modal').style.display = 'block';
}

function showUserNotFound() {
  document.getElementById('user_preview_modal').style.display = 'none';
  document.getElementById('user_update_form').style.display = 'none';
  document.getElementById('user_notfound_modal').style.display = 'block';
}

function closeUserPreviewAndShowForm() {
  document.getElementById('user_preview_modal').style.display = 'none';
  document.getElementById('user_update_form').style.display = 'block';
}

function closeUserNotFoundModal() {
  document.getElementById('user_notfound_modal').style.display = 'none';
  document.getElementById('u_upd_username').value = '';
}

async function updateUser() {
  const username = document.getElementById('u_upd_username').value;
  if (!username) {
    alert('Username is required');
    return;
  }
  
  const name = document.getElementById('u_upd_name').value;
  const email = document.getElementById('u_upd_email').value;
  const phone = document.getElementById('u_upd_phone').value;
  const password = document.getElementById('u_upd_password').value;
  const userType = document.getElementById('u_upd_usertype').value;
  const photoUrl = document.getElementById('u_upd_photourl').value;
  
  const body = {
    name: name || null,
    email: email || null,
    phone: phone || null,
    password: password || null,
    userType: userType || null,
    photoUrl: photoUrl || null
  };
  
  try {
    const res = await fetch(`${usersApiBase}/updateUser/${encodeURIComponent(username)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`HTTP ${res.status}: ${error}`);
    }
    
    const text = await res.text();
    showRaw({ message: text });
    
    alert(`User updated successfully!\n\n${text}`);
    
    // Clear and hide form
    document.getElementById('u_upd_username').value = '';
    document.getElementById('u_upd_name').value = '';
    document.getElementById('u_upd_email').value = '';
    document.getElementById('u_upd_phone').value = '';
    document.getElementById('u_upd_password').value = '';
    document.getElementById('u_upd_usertype').selectedIndex = 0;
    document.getElementById('u_upd_photourl').value = '';
    document.getElementById('user_update_form').style.display = 'none';
    
    loadDashboardStats();
  } catch (e) {
    console.error('Failed to update user:', e);
    alert('Failed to update user: ' + e.message);
    showRaw({ error: e.message });
  }
}

async function deleteUser() {
  const username = document.getElementById('u_del_username').value;
  if (!username) {
    alert('Username is required');
    return;
  }
  
  if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
    return;
  }
  
  try {
    const res = await fetch(`${usersApiBase}/deleteUser/${encodeURIComponent(username)}`, {
      method: 'DELETE'
    });
    
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`HTTP ${res.status}: ${error}`);
    }
    
    const text = await res.text();
    showRaw({ message: text });
    
    alert(`User deleted successfully!\n\n${text}`);
    
    document.getElementById('u_del_username').value = '';
    loadDashboardStats();
  } catch (e) {
    console.error('Failed to delete user:', e);
    alert('Failed to delete user: ' + e.message);
    showRaw({ error: e.message });
  }
}

// ============================================
// DASHBOARD FUNCTIONS
// ============================================

async function loadDashboardStats() {
  try {
    // Load users count
    const usersRes = await fetch(`${usersApiBase}/getAllUsers`);
    if (usersRes.ok) {
      const users = await usersRes.json();
      document.getElementById('stat-users').textContent = users.length;
    }
    
    // Load active users count
    const activeUsersRes = await fetch(`${usersApiBase}/getAllActiveUsers`);
    if (activeUsersRes.ok) {
      const activeUsers = await activeUsersRes.json();
      document.getElementById('stat-active-users').textContent = activeUsers.length;
    }
    
    // Load categories count
    const catsRes = await fetch(`${questionsApiBase}/listCategories`);
    if (catsRes.ok) {
      const cats = await catsRes.json();
      document.getElementById('stat-categories').textContent = cats.length;
    }
    
    // Note: We don't have a total questions endpoint, so we'll show a placeholder
    document.getElementById('stat-questions').textContent = '—';
    
  } catch (e) {
    console.error('Failed to load dashboard stats:', e);
  }
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Load initial data
  loadCategories();
  loadDashboardStats();
  
  // Question Management Event Listeners
  const btnQCreate = document.getElementById('btn_q_create');
  if (btnQCreate) btnQCreate.addEventListener('click', createQuestion);
  
  // User Management Event Listeners
  const btnUCreate = document.getElementById('btn_u_create');
  if (btnUCreate) btnUCreate.addEventListener('click', createUser);
  
  const btnUAll = document.getElementById('btn_u_all');
  if (btnUAll) btnUAll.addEventListener('click', loadAllUsers);
  
  const btnUActive = document.getElementById('btn_u_active');
  if (btnUActive) btnUActive.addEventListener('click', loadActiveUsers);
  
  const btnURefresh = document.getElementById('btn_u_refresh');
  if (btnURefresh) btnURefresh.addEventListener('click', loadAllUsers);
  
  const btnUSearch = document.getElementById('btn_u_search');
  if (btnUSearch) btnUSearch.addEventListener('click', searchUserForUpdate);
  
  const btnUClosePreview = document.getElementById('btn_u_close_preview');
  if (btnUClosePreview) btnUClosePreview.addEventListener('click', closeUserPreviewAndShowForm);
  
  const btnUCloseNotfound = document.getElementById('btn_u_close_notfound');
  if (btnUCloseNotfound) btnUCloseNotfound.addEventListener('click', closeUserNotFoundModal);
  
  const btnUUpdate = document.getElementById('btn_u_update');
  if (btnUUpdate) btnUUpdate.addEventListener('click', updateUser);
  
  const btnUDelete = document.getElementById('btn_u_delete');
  if (btnUDelete) btnUDelete.addEventListener('click', deleteUser);
});
