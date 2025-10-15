# Directory Restructure - October 16, 2025

## Overview
Reorganized the static resources directory to separate admin functionality from the practice platform for better code organization and maintainability.

## New Directory Structure

```
src/main/resources/static/
├── admin/                          # Admin interface (all admin features)
│   ├── dashboard.html             # Main admin dashboard/landing page
│   ├── questions/                 # Question management
│   │   ├── index.html            # Question management interface
│   │   ├── app.js                # Question management logic
│   │   └── app.css               # Question management styles
│   └── users/                     # User management
│       ├── user-management.html  # User management interface
│       └── app-users.js          # User management logic
└── practice/                       # Practice platform (formerly userUI)
    ├── index.html                 # Practice interface
    ├── script.js                  # Practice logic
    ├── styles.css                 # Practice styles
    ├── README.md                  # Practice platform documentation
    └── tags.txt                   # Tags reference

# Legacy files (kept for reference, can be removed later)
├── app-new.js
├── app-old.js
├── app-sidebar.js
├── index-new.html
├── index-old.html
└── index-sidebar.html
```

## URL Changes

### Admin Interface
| Old URL | New URL |
|---------|---------|
| `/dashboard.html` | `/admin/dashboard.html` |
| `/index.html` | `/admin/questions/index.html` |
| `/user-management.html` | `/admin/users/user-management.html` |

### Practice Platform
| Old URL | New URL |
|---------|---------|
| `/userUI/index.html` | `/practice/index.html` |

## Updated References

### admin/dashboard.html
- Question Management link: `index.html` → `questions/index.html`
- User Management link: `user-management.html` → `users/user-management.html`

### admin/questions/index.html
- Back to Dashboard: `dashboard.html` → `../dashboard.html`
- Script reference: `/app.js` → `app.js` (relative)

### admin/users/user-management.html
- Back to Dashboard: `dashboard.html` → `../dashboard.html`
- Script reference: `app-users.js` (relative, unchanged)

## Benefits

1. **Better Organization**: Clear separation between admin and practice functionality
2. **Easier Maintenance**: Related files grouped together by feature
3. **Clearer Naming**: "practice" is more descriptive than "userUI"
4. **Scalability**: Easy to add new admin modules (e.g., admin/reports/, admin/settings/)
5. **Independent Development**: Teams can work on admin vs practice features independently

## Testing Checklist

- [ ] Access admin dashboard: `/admin/dashboard.html`
- [ ] Navigate to question management from dashboard
- [ ] Navigate to user management from dashboard
- [ ] Test back buttons from question/user management to dashboard
- [ ] Access practice platform: `/practice/index.html`
- [ ] Verify all JavaScript files load correctly
- [ ] Verify all CSS styles apply correctly

## Migration Notes

- No backend changes required - all changes are frontend/static resources only
- All API endpoints remain unchanged
- No database changes required
- Legacy files (index-old.html, app-old.js, etc.) can be cleaned up in future iterations
