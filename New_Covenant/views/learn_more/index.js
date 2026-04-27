/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: LEARN MORE — About FlockOS & How to Roll It Out
   "Come and see." — John 1:46
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'learn_more';
export const title = 'Learn More';

const _e = s => String(s ?? '').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const FEATURES = [
  { icon: '🐑', title: 'People-Centered',    desc: 'Every member, visitor, and family in one place — The Fold.' },
  { icon: '💬', title: 'Real-Time Comms',    desc: 'Firebase-powered channels, prayer chain, and announcements.' },
  { icon: '📋', title: 'Pastoral Care',      desc: 'Structured care queue, follow-ups, and case management.' },
  { icon: '🌍', title: 'Missions First',     desc: 'Global country registry, missionary support, and outreach tracking.' },
  { icon: '📊', title: 'Live Analytics',     desc: 'Attendance trends, giving summaries, and kingdom metrics.' },
  { icon: '🔐', title: 'Role-Based Access',  desc: 'Nehemiah guards every action — pastor, elder, member roles enforced.' },
  { icon: '📖', title: 'Content Library',    desc: 'Sermon archive, series browser, and discipleship tracks.' },
  { icon: '🪙', title: 'Stewardship',        desc: 'Giving dashboard, fund breakdown, and pledge tracking.' },
];

const STEPS = [
  { n: 1, title: 'Request a Church',      desc: 'Fill out the church intake form — name, contact, denomination, size.' },
  { n: 2, title: 'Data Migration',        desc: 'We help you import members, giving history, and event records.' },
  { n: 3, title: 'Branding Setup',        desc: 'Upload your logo, set colours, and configure your church URL.' },
  { n: 4, title: 'Train Your Team',       desc: 'Walk-through for pastors, admin, and leaders — 2 hrs total.' },
  { n: 5, title: 'Go Live',              desc: 'Your church subdomain goes live. Invite members to create accounts.' },
];

export function render() {
  return /* html */`
    <section class="lm-view">
      ${pageHero({
        title:    'Learn More',
        subtitle: 'A church operating system built on the covenant — for the whole body, not just admin.',
        scripture: 'Come and see. — John 1:46',
      })}

      <!-- Mission statement -->
      <div class="lm-mission-card">
        <div class="lm-mission-icon">✝️</div>
        <div class="lm-mission-body">
          <h2 class="lm-mission-title">What is FlockOS?</h2>
          <p class="lm-mission-text">FlockOS is a covenant-rooted church management system that brings together pastoral care, communications, missions, giving, and discipleship into one living dashboard — built on Google Apps Script, Firebase, and the Spirit of God.</p>
          <div class="lm-mission-foot">
            <button class="flock-btn flock-btn--primary" data-go="software_deployment_referral">Request a Church →</button>
            <button class="flock-btn flock-btn--ghost"   data-go="about_flockos">About FlockOS</button>
          </div>
        </div>
      </div>

      <!-- Features grid -->
      <div class="way-section-header" style="margin-top:28px;">
        <h2 class="way-section-title">What's Included</h2>
      </div>
      <div class="lm-features">
        ${FEATURES.map(f => `
        <div class="lm-feature-card">
          <div class="lm-feature-icon">${f.icon}</div>
          <div class="lm-feature-title">${_e(f.title)}</div>
          <div class="lm-feature-desc">${_e(f.desc)}</div>
        </div>`).join('')}
      </div>

      <!-- Getting started -->
      <div class="way-section-header" style="margin-top:28px;">
        <h2 class="way-section-title">Getting Started</h2>
      </div>
      <div class="lm-steps">
        ${STEPS.map(s => `
        <div class="lm-step">
          <div class="lm-step-n">${s.n}</div>
          <div class="lm-step-body">
            <div class="lm-step-title">${_e(s.title)}</div>
            <div class="lm-step-desc">${_e(s.desc)}</div>
          </div>
        </div>`).join('')}
      </div>

    </section>
  `;
}

export function mount(root, ctx) {
  root.querySelectorAll('[data-go]').forEach(btn => {
    btn.addEventListener('click', () => ctx?.go?.(btn.dataset.go));
  });
  return () => {};
}

