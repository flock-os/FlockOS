# FlockOS — Master Training & Use Guide

> This document is the single source of truth for how FlockOS works, who can do what, and how to use every module. Keep it updated as the product evolves.

---

## 1. What Is FlockOS?

FlockOS is a church management and spiritual formation platform designed to serve pastoral staff, ministry leaders, and church members from a single web application. It runs entirely on Google infrastructure — no servers to maintain, no software to install. Staff access it from any browser on any device.

The application has two portals:

| Portal | URL pattern | Who uses it |
|---|---|---|
| **Member Portal** | `/index.html` | General church members |
| **Pastoral Portal** | `/FlockOS/Pages/the_good_shepherd.html` | Pastors, leaders, care workers, admins |

---

## 2. Roles & Access

Every user is assigned a role at login. The role controls which modules appear in the sidebar and what actions are available.

| Role | Access Level | Description |
|---|---|---|
| **member** | Member Portal only | Standard church member — personal profile, giving, prayer, learning |
| **care** | Pastoral Portal | Care workers — flock dashboard, compassion, prayer, comms |
| **leader** | Pastoral Portal | Ministry leaders — full Courts + Holy Place access |
| **pastor** | Pastoral Portal | Full access including Content Editor and admin tools |
| **admin** | Pastoral Portal | Full access equivalent to pastor |

> Roles are assigned in the Google Sheet database by an admin. A user's role cannot be changed from within the app.

---

## 3. Navigation — The Temple Structure

The sidebar is organized into zones modeled after the biblical Temple. Each zone groups related tools.

### The Gates — Entry & Overview
| Module | Who sees it | Purpose |
|---|---|---|
| **Dashboard** | All pastoral roles | At-a-glance summary: upcoming events, unread messages, key stats |
| **Calendar** | All pastoral roles | Church events calendar — view, create, and manage events |

### The Courts — Community, Shepherding & Service
| Module | Who sees it | Purpose |
|---|---|---|
| **Flock Dashboard** | care, leader, pastor, admin | Unified pastoral view — active care cases, follow-ups, prayer, compassion, outreach |
| **Messages** | All pastoral roles | Internal church communications — inbox, compose, broadcast |
| **People** | All pastoral roles | Full member directory with search and profile access |
| **Groups** | All pastoral roles | Small groups, Bible studies, and ministry teams |
| **Photos** | All pastoral roles | Link to external photo library (if configured) |
| **Attendance** | All pastoral roles | Track attendance by service and event |
| **Compassion** | All pastoral roles | Manage care requests and compassion fund cases |
| **Ministry Hub** | All pastoral roles | Ministry-level operations and team oversight |
| **Volunteers** | All pastoral roles | Volunteer roster, scheduling, and assignments |

### The Holy Place — Growth, Formation & Reach
| Module | Who sees it | Purpose |
|---|---|---|
| **Learning Hub** | All pastoral roles | Aggregated view of all spiritual formation content |
| **Content Editor** | pastor, admin only | Create and manage devotionals, apologetics, counseling content, and more |
| **Discipleship** | All pastoral roles | Discipleship pathways and tracking |
| **Prayer** | All pastoral roles | Church-wide prayer requests and prayer wall |
| **Sermons** | All pastoral roles | Sermon library — titles, dates, speakers, notes |
| **Service Plans** | All pastoral roles | Plan and manage Sunday and special services |
| **Songs** | All pastoral roles | Song library for worship planning |
| **Missions** | All pastoral roles | Mission trips and outreach partnerships |
| **Connect** | All pastoral roles | Outreach contacts and first-time guest follow-up |
| **Giving** | All pastoral roles | Giving records and fund management |

### The Holy of Holies — Encounter & Presence
| Module | Who sees it | Purpose |
|---|---|---|
| **The Upper Room** | All pastoral roles | Personal prayer and devotional space for staff |

### My Account — Personal
| Module | Who sees it | Purpose |
|---|---|---|
| **Profile** | All | View and edit personal information |
| **My Requests** | All | Personal prayer and care requests submitted |
| **My Giving** | All | Personal giving history |
| **My Card** | All | Digital member card |

---

## 4. Member Portal Modules

Members access a simplified portal at `/index.html` with spiritually focused content.

| Module | Purpose |
|---|---|
| **Dashboard** | Personal welcome and quick links |
| **Calendar** | View upcoming church events |
| **Upper Room** | Personal prayer |
| **Devotionals** | Daily and curated devotionals |
| **Prayer** | Submit and view prayer requests |
| **Reading Plan** | Church-wide Bible reading plan |
| **Quiz** | Biblical knowledge quizzes |
| **Library** | Content library — articles, teachings |
| **Learning Hub** | All learning content in one view |
| **Theology** | Doctrinal content and statements |
| **Words** | Biblical word studies |
| **Counseling** | Pastoral counseling content |
| **Apologetics** | Answers to common questions about faith |
| **Connect** | Submit interest in volunteering or groups |
| **My Profile** | Personal information |

---

## 5. Common Workflows

### Adding a New Member
1. Navigate to **People** (the_good_shepherd.html)
2. Click **+ Add Member**
3. Fill in name, email, phone, and role (`member` by default)
4. Save — the member can now log in at the Member Portal

### Recording Attendance
1. Navigate to **Attendance**
2. Select the service or event
3. Mark members present — search by name or scroll the list
4. Save the session

### Logging a Care Visit
1. Navigate to **Flock Dashboard** → **Care** tab
2. Find the member or create a new care case
3. Add a note with date, type (visit, call, hospital, etc.), and summary
4. Set a follow-up date if needed

### Sending a Message
1. Navigate to **Messages**
2. Click **Compose**
3. Select recipients (individual, group, or all members)
4. Write subject and body, then Send

### Creating a Prayer Request
1. Navigate to **Prayer**
2. Click **+ New Request**
3. Enter the request and assign it to a prayer team member if desired

### Planning a Service
1. Navigate to **Service Plans**
2. Click **+ New Plan**
3. Add date, title, and elements (songs, prayer, sermon, scripture)
4. Assign roles to team members

### Adding Content (Pastors Only)
1. Navigate to **Content Editor**
2. Select the content type (Devotional, Apologetics, Counseling, etc.)
3. Click **+ New** and fill in the form
4. Save — content is immediately visible in the Member Portal Learning Hub

---

## 6. Data Refresh & Sync

FlockOS automatically keeps data current without requiring manual page reloads:

- **On navigation** — every time you tap a sidebar module, it fetches fresh data
- **Every 3 minutes** — if you remain on a module, it silently refreshes in the background
- **On tab return** — if you switch away (another app or browser tab) and come back, FlockOS refreshes automatically after 2 minutes of absence
- **On reconnect** — if your internet drops and reconnects, data is refreshed automatically

> You can always force a refresh by tapping the current module name in the sidebar again.

---

## 7. Notifications

The bell icon in the top bar shows unread notifications. FlockOS polls for new notifications every 90 seconds. Notifications are generated for:

- New messages or broadcasts received
- New prayer requests submitted
- New compassion requests
- Assigned care tasks and follow-up reminders
- New volunteer applications

Tapping a notification navigates directly to the relevant module.

---

## 8. Settings & Themes

Tap your name or role in the top bar to access account options. FlockOS supports multiple visual themes (selectable per user). The theme choice is saved locally per device.

---

## 9. Logging Out

Tap **Sign Out** from the account menu. Sessions expire automatically after inactivity. All session data is cleared on logout.

---

## 10. Common Questions

**Q: I navigated to a module and it's blank.**
Tap the module name in the sidebar again to force a refresh. If it remains blank, check your internet connection.

**Q: I don't see a module that should be there.**
Your role may not include access to that module. Contact your administrator to verify your role assignment.

**Q: Can I use FlockOS on my phone?**
Yes — FlockOS is a responsive web app. Add it to your home screen from your browser's share menu for an app-like experience.

**Q: How do I change a member's role?**
Roles are managed directly in the database (Google Sheet). Only an administrator with Sheet access can change roles. This is intentional — roles control data access.

**Q: Is my data backed up?**
All data lives in Google Sheets on your church's Google account. Google automatically maintains revision history. Your administrator should periodically export backups.

---

## 11. For Administrators

### Adding a New Staff Member
1. Open the church's Google Sheet database
2. In the **Users** (or equivalent) tab, add a new row with their email, name, and role
3. The user can now sign in at the_good_shepherd.html with their Google account

### Module Enable/Disable
Modules can be enabled or disabled per church deployment via the `ChurchTemplate.json` configuration. Contact the FlockOS deployment administrator to adjust which modules are available.

### Resetting a Stuck Module
If a module is unresponsive:
1. Tap the module name in the sidebar (forces re-render)
2. If still stuck, hard-refresh the page (Cmd+Shift+R / Ctrl+Shift+R)
3. If the issue persists, check the Google Apps Script execution log for backend errors

---

*Last updated: April 2026*
