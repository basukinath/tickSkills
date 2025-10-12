// API Base URLs
const usersApiBase = '/api/users';

// Navigation
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupFormHandlers();
});

function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const pages = document.querySelectorAll('.page');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove active class from all links and pages
      navLinks.forEach(l => l.classList.remove('active'));
      pages.forEach(p => p.classList.remove('active'));
      
      // Add active class to clicked link
      link.classList.add('active');
      
      // Show corresponding page
      const pageId = link.getAttribute('data-page');
      document.getElementById(pageId).classList.add('active');
    });
  });
}

function setupFormHandlers() {
  // Create User Form
  document.getElementById('createUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await createUser();
  });
  
  // Update User Form
  document.getElementById('updateUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await updateUser();
  });
  
  // Delete User Form
  document.getElementById('deleteUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await deleteUser();
  });
}

// Utility function to show raw response
function showRaw(obj, elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = JSON.stringify(obj, null, 2);
  }
}

// Collapsible functionality
function toggleCollapsible(header) {
  const content = header.nextElementSibling;
  const icon = header.querySelector('.collapsible-icon');
  
  if (content.classList.contains('open')) {
    content.classList.remove('open');
    icon.classList.remove('open');
  } else {
    content.classList.add('open');
    icon.classList.add('open');
  }
}

// ============================================
// CREATE USER FUNCTIONS
// ============================================

async function createUser() {
  const name = document.getElementById('create_name').value.trim();
  const username = document.getElementById('create_username').value.trim();
  const email = document.getElementById('create_email').value.trim();
  const phone = document.getElementById('create_phone').value.trim();
  const password = document.getElementById('create_password').value.trim();
  const userType = document.getElementById('create_userType').value;
  const photoUrl = document.getElementById('create_photoUrl').value.trim();
  
  // Validate required fields
  if (!email || !userType) {
    showAlert('Validation Error', 'Email and User Type are required!', 'error');
    return;
  }
  
  const userData = {
    name: name || null,
    username: username || null,
    email: email,
    phone: phone || null,
    password: password || null,
    userType: userType,
    photoUrl: photoUrl || null
  };
  
  try {
    const response = await fetch(`${usersApiBase}/addUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (response.ok) {
      // Backend returns plain text like "username added successfully"
      const result = await response.text();
      showRaw({ message: result }, 'create_raw_response');
      showAlert('Success', result, 'success');
      clearCreateForm();
    } else {
      const error = await response.text();
      showRaw({ error: error }, 'create_raw_response');
      showAlert('Error', error, 'error');
    }
  } catch (error) {
    console.error('Error creating user:', error);
    showRaw({ error: error.message }, 'create_raw_response');
    showAlert('Error', `Error creating user: ${error.message}`, 'error');
  }
}

function clearCreateForm() {
  document.getElementById('createUserForm').reset();
  showRaw({ message: 'Form cleared' }, 'create_raw_response');
}

// ============================================
// BROWSE USERS FUNCTIONS
// ============================================

async function loadAllUsers() {
  try {
    const response = await fetch(`${usersApiBase}/getAllUsersWithDetails`);
    
    if (response.ok) {
      const users = await response.json();
      showRaw(users, 'browse_raw_response');
      displayUserList(users, false);
    } else {
      const error = await response.text();
      showRaw({ error: error }, 'browse_raw_response');
      showAlert('Error', error, 'error');
    }
  } catch (error) {
    console.error('Error loading users:', error);
    showRaw({ error: error.message }, 'browse_raw_response');
    showAlert('Error', `Error loading users: ${error.message}`, 'error');
  }
}

async function loadActiveUsers() {
  try {
    const response = await fetch(`${usersApiBase}/getAllActiveUsers`);
    
    if (response.ok) {
      const usernames = await response.json();
      showRaw(usernames, 'browse_raw_response');
      
      // Fetch full details for active users
      const usersPromises = usernames.map(username => 
        fetch(`${usersApiBase}/getUser/${username}`).then(r => r.json())
      );
      const users = await Promise.all(usersPromises);
      displayUserList(users, true);
    } else {
      const error = await response.text();
      showRaw({ error: error }, 'browse_raw_response');
      showAlert('Error', error, 'error');
    }
  } catch (error) {
    console.error('Error loading active users:', error);
    showRaw({ error: error.message }, 'browse_raw_response');
    showAlert('Error', `Error loading active users: ${error.message}`, 'error');
  }
}

function displayUserList(users, activeOnly) {
  const resultsDiv = document.getElementById('browse_results');
  const userListDiv = document.getElementById('browse_user_list');
  
  if (!users || users.length === 0) {
    userListDiv.innerHTML = '<p style="color: #718096;">No users found.</p>';
    resultsDiv.style.display = 'block';
    return;
  }
  
  userListDiv.innerHTML = users.map(user => {
    const isDeleted = user.isDeleted === true;
    const isActive = !isDeleted;
    const statusClass = isActive ? 'user-active' : 'user-deleted';
    const statusBadge = isActive 
      ? '<span class="user-badge badge-active">Active</span>' 
      : '<span class="user-badge" style="background: #fed7d7; color: #c53030;">Deleted</span>';
    const userTypeBadge = user.userType === 'ADMIN' 
      ? '<span class="user-badge badge-admin">ADMIN</span>' 
      : '<span class="user-badge badge-user">USER</span>';
    
    return `
      <div class="user-item ${statusClass}">
        <div class="user-info">
          <strong>${user.username || 'N/A'}</strong>
          ${userTypeBadge}
          ${statusBadge}
        </div>
        <button onclick='showUserDetailsModal(${JSON.stringify(user)})'>View Details</button>
      </div>
    `;
  }).join('');
  
  resultsDiv.style.display = 'block';
}

function showUserDetailsModal(user) {
  const overlay = document.getElementById('userDetailsOverlay');
  const body = document.getElementById('userDetailsBody');
  
  const userTypeBadge = user.userType === 'ADMIN' 
    ? '<span class="user-badge badge-admin">ADMIN</span>' 
    : '<span class="user-badge badge-user">USER</span>';
  
  const statusBadge = user.isDeleted 
    ? '<span class="user-badge" style="background: #fed7d7; color: #c53030;">Deleted</span>'
    : '<span class="user-badge badge-active">Active</span>';
  
  body.innerHTML = `
    <div class="user-detail-row">
      <div class="user-detail-label">ID:</div>
      <div class="user-detail-value">${user.id || 'N/A'}</div>
    </div>
    <div class="user-detail-row">
      <div class="user-detail-label">Name:</div>
      <div class="user-detail-value">${user.name || 'N/A'}</div>
    </div>
    <div class="user-detail-row">
      <div class="user-detail-label">Username:</div>
      <div class="user-detail-value">${user.username || 'N/A'}</div>
    </div>
    <div class="user-detail-row">
      <div class="user-detail-label">Email:</div>
      <div class="user-detail-value">${user.email || 'N/A'}</div>
    </div>
    <div class="user-detail-row">
      <div class="user-detail-label">Phone:</div>
      <div class="user-detail-value">${user.phone || 'N/A'}</div>
    </div>
    <div class="user-detail-row">
      <div class="user-detail-label">User Type:</div>
      <div class="user-detail-value">${userTypeBadge}</div>
    </div>
    <div class="user-detail-row">
      <div class="user-detail-label">Status:</div>
      <div class="user-detail-value">${statusBadge}</div>
    </div>
    <div class="user-detail-row">
      <div class="user-detail-label">Photo URL:</div>
      <div class="user-detail-value">${user.photoUrl ? `<a href="${user.photoUrl}" target="_blank" style="color: #667eea;">🔗 View Photo</a>` : 'N/A'}</div>
    </div>
    <div class="user-detail-row">
      <div class="user-detail-label">Created On:</div>
      <div class="user-detail-value">${user.createdOn || 'N/A'}</div>
    </div>
  `;
  
  overlay.classList.add('show');
}

function closeUserDetailsModal() {
  document.getElementById('userDetailsOverlay').classList.remove('show');
}

function getUserDetails(username) {
  // This is kept for backward compatibility but now we use showUserDetailsModal
  fetch(`${usersApiBase}/getUser/${username}`)
    .then(r => r.json())
    .then(user => {
      showRaw(user, 'browse_raw_response');
      showUserDetailsModal(user);
    })
    .catch(error => {
      console.error('Error loading user details:', error);
      showAlert('Error', `Error loading user details: ${error.message}`, 'error');
    });
}

function refreshUserList() {
  loadAllUsers();
}

// Alert Modal Function
function showAlert(title, message, type = 'success') {
  const overlay = document.getElementById('alertOverlay');
  const card = document.getElementById('alertCard');
  const icon = document.getElementById('alertIcon');
  const titleEl = document.getElementById('alertTitle');
  const messageEl = document.getElementById('alertMessage');
  
  // Set type class
  card.className = 'alert-card ' + type;
  
  // Set icon based on type
  if (type === 'success') {
    icon.textContent = '✓';
    icon.style.color = '#48bb78';
  } else if (type === 'error') {
    icon.textContent = '✕';
    icon.style.color = '#f56565';
  } else if (type === 'info') {
    icon.textContent = 'ℹ';
    icon.style.color = '#4299e1';
  }
  
  titleEl.textContent = title;
  messageEl.textContent = message;
  
  overlay.classList.add('show');
}

function closeAlertModal() {
  document.getElementById('alertOverlay').classList.remove('show');
}

// ============================================
// UPDATE USER FUNCTIONS
// ============================================

async function searchUserForUpdate() {
  const username = document.getElementById('update_search_username').value.trim();
  
  if (!username) {
    showAlert('Validation Error', 'Please enter a username to search', 'error');
    return;
  }
  
  try {
    const response = await fetch(`${usersApiBase}/getUser/${username}`);
    
    if (response.ok) {
      const user = await response.json();
      showRaw(user, 'update_raw_response');
      
      // Disable the username field after successful search
      document.getElementById('update_search_username').disabled = true;
      
      showUserPreview(user);
    } else if (response.status === 404) {
      showRaw({ error: 'User not found' }, 'update_raw_response');
      showUserNotFound();
    } else {
      const error = await response.text();
      showRaw({ error: error }, 'update_raw_response');
      showAlert('Error', error, 'error');
    }
  } catch (error) {
    console.error('Error searching user:', error);
    showRaw({ error: error.message }, 'update_raw_response');
    showAlert('Error', `Error searching user: ${error.message}`, 'error');
  }
}

function showUserPreview(user) {
  // Hide not found modal and form
  document.getElementById('update_notfound_modal').classList.remove('show');
  document.getElementById('updateUserForm').style.display = 'none';
  
  // Show preview modal
  const previewModal = document.getElementById('update_preview_modal');
  const previewContent = document.getElementById('update_preview_content');
  
  const userTypeBadge = user.userType === 'ADMIN' 
    ? '<span class="user-badge badge-admin">ADMIN</span>' 
    : '<span class="user-badge badge-user">USER</span>';
  
  previewContent.innerHTML = `
    <div class="detail-row">
      <span class="detail-label">ID:</span>
      <span>${user.id || 'N/A'}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Name:</span>
      <span>${user.name || 'N/A'}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Username:</span>
      <span>${user.username || 'N/A'}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Email:</span>
      <span>${user.email || 'N/A'}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Phone:</span>
      <span>${user.phone || 'N/A'}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">User Type:</span>
      <span>${userTypeBadge}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Photo URL:</span>
      <span>${user.photoUrl ? `<a href="${user.photoUrl}" target="_blank">🔗 View</a>` : 'N/A'}</span>
    </div>
    <p style="margin-top: 16px; color: #667eea; font-weight: 600;">
      👇 Close this preview to edit the user below
    </p>
  `;
  
  previewModal.classList.add('show');
}

function showUserNotFound() {
  // Hide preview modal and form
  document.getElementById('update_preview_modal').classList.remove('show');
  document.getElementById('updateUserForm').style.display = 'none';
  
  // Show not found modal
  document.getElementById('update_notfound_modal').classList.add('show');
}

function closePreviewAndShowForm() {
  // Hide preview modal
  document.getElementById('update_preview_modal').classList.remove('show');
  
  // Show update form
  document.getElementById('updateUserForm').style.display = 'block';
}

function closeNotFoundModal() {
  // Hide not found modal
  document.getElementById('update_notfound_modal').classList.remove('show');
  
  // Clear search field
  document.getElementById('update_search_username').value = '';
}

async function updateUser() {
  const username = document.getElementById('update_search_username').value.trim();
  
  if (!username) {
    showAlert('Validation Error', 'Please search for a user first', 'error');
    return;
  }
  
  // Collect update data (null if empty)
  const name = document.getElementById('update_name').value.trim() || null;
  const email = document.getElementById('update_email').value.trim() || null;
  const phone = document.getElementById('update_phone').value.trim() || null;
  const password = document.getElementById('update_password').value.trim() || null;
  const userType = document.getElementById('update_userType').value || null;
  const photoUrl = document.getElementById('update_photoUrl').value.trim() || null;
  
  const updateData = {
    name,
    email,
    phone,
    password,
    userType,
    photoUrl
  };
  
  // Remove null fields
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === null) {
      delete updateData[key];
    }
  });
  
  if (Object.keys(updateData).length === 0) {
    showAlert('Validation Error', 'Please enter at least one field to update', 'error');
    return;
  }
  
  try {
    const response = await fetch(`${usersApiBase}/updateUser/${username}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (response.ok) {
      // Backend returns plain text like "username updated successfully"
      const result = await response.text();
      showRaw({ message: result, updatedFields: Object.keys(updateData) }, 'update_raw_response');
      showAlert('Success', `${result}\n\nUpdated fields: ${Object.keys(updateData).join(', ')}`, 'success');
      clearUpdateForm();
    } else {
      const error = await response.text();
      showRaw({ error: error }, 'update_raw_response');
      showAlert('Error', error, 'error');
    }
  } catch (error) {
    console.error('Error updating user:', error);
    showRaw({ error: error.message }, 'update_raw_response');
    showAlert('Error', `Error updating user: ${error.message}`, 'error');
  }
}

function clearUpdateForm() {
  document.getElementById('update_search_username').value = '';
  document.getElementById('update_search_username').disabled = false; // Re-enable username field
  document.getElementById('update_name').value = '';
  document.getElementById('update_email').value = '';
  document.getElementById('update_phone').value = '';
  document.getElementById('update_password').value = '';
  document.getElementById('update_userType').value = '';
  document.getElementById('update_photoUrl').value = '';
  
  document.getElementById('update_preview_modal').classList.remove('show');
  document.getElementById('update_notfound_modal').classList.remove('show');
  document.getElementById('updateUserForm').style.display = 'none';
  
  showRaw({ message: 'Form cleared' }, 'update_raw_response');
}

// ============================================
// DELETE USER FUNCTIONS
// ============================================

async function deleteUser() {
  const username = document.getElementById('delete_username').value.trim();
  
  if (!username) {
    showAlert('Validation Error', 'Please enter a username to delete', 'error');
    return;
  }
  
  // Confirmation dialog
  const confirmed = confirm(
    `Are you sure you want to delete user '${username}'?\n\nThis action cannot be undone.`
  );
  
  if (!confirmed) {
    return;
  }
  
  try {
    const response = await fetch(`${usersApiBase}/deleteUser/${username}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      const result = await response.text();
      showRaw({ message: result }, 'delete_raw_response');
      showAlert('Success', `User '${username}' deleted successfully!`, 'success');
      clearDeleteForm();
    } else {
      const error = await response.text();
      showRaw({ error: error }, 'delete_raw_response');
      showAlert('Error', error, 'error');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    showRaw({ error: error.message }, 'delete_raw_response');
    showAlert('Error', `Error deleting user: ${error.message}`, 'error');
  }
}

function clearDeleteForm() {
  document.getElementById('delete_username').value = '';
  showRaw({ message: 'Form cleared' }, 'delete_raw_response');
}
