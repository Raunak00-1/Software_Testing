/**
 * app.js — Software Testing Sessional Result Portal
 * Authentication: Enrollment Number + Date of Birth
 */

'use strict';

/* ── DOM REFERENCES ── */
const form = document.getElementById('searchForm');
const enrollInput = document.getElementById('enrollInput');
const dobInput = document.getElementById('dobInput');
const searchBtn = document.getElementById('searchBtn');
const resultSection = document.getElementById('resultSection');

/* ── SET FOOTER YEAR ── */
const footerYear = document.getElementById('footerYear');
if (footerYear) footerYear.textContent = new Date().getFullYear();

/* ── HELPER: classify attendance ── */
function attClass(pct) {
  if (pct >= 60) return 'good';
  if (pct >= 40) return 'mid';
  return 'low';
}

/* ── HELPER: calculate grade ── */
function getGrade(total, max) {
  const pct = (total / max) * 100;
  if (pct >= 80) return { label: 'A', cls: 'grade-A' };
  if (pct >= 65) return { label: 'B', cls: 'grade-B' };
  if (pct >= 50) return { label: 'C', cls: 'grade-C' };
  if (pct >= 35) return { label: 'D', cls: 'grade-D' };
  return { label: 'F', cls: 'grade-F' };
}

/* ── HELPER: render a single mark tile ── */
function markTile(label, val, max) {
  const pct = max > 0 ? (val / max) * 100 : 0;
  return `
    <div class="mark-tile">
      <div class="mark-tile-label">${label}</div>
      <div class="mark-tile-row">
        <span class="mark-tile-val">${val}</span>
        <span class="mark-tile-max">/ ${max}</span>
      </div>
      <div class="mark-tile-bar">
        <div class="mark-tile-bar-fill" style="width:0%" data-target="${pct}%"></div>
      </div>
    </div>`;
}

/* ── HELPER: 3D Tilt effect for cards ── */
function apply3DTilt(element) {
  if (!element) return;
  element.style.transition = 'transform 0.15s ease-out, box-shadow 0.3s ease';

  element.addEventListener('mousemove', (e) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    element.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
  });

  element.addEventListener('mouseleave', () => {
    element.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease';
    element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  });
}

/* ── HELPER: Confetti Particle Burst for High Scores ── */
function triggerConfetti() {
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;overflow:hidden;';
  document.body.appendChild(container);

  const colors = ['#2563eb', '#38bdf8', '#60a5fa', '#0284c7', '#f59e0b', '#ffffff'];
  for (let i = 0; i < 45; i++) {
    const p = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 8 + 6;
    const left = Math.random() * 80 + 10;

    p.style.cssText = `
      position: absolute;
      top: -15px;
      left: ${left}%;
      width: ${size}px;
      height: ${size * 0.6}px;
      background: ${color};
      border-radius: 2px;
      opacity: 0.95;
      transform: rotate(${Math.random() * 360}deg);
      transition: transform 2.2s cubic-bezier(0.25, 1, 0.5, 1), top 2.2s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.8s 0.8s;
    `;
    container.appendChild(p);

    setTimeout(() => {
      p.style.top = `${Math.random() * 75 + 30}%`;
      p.style.transform = `rotate(${Math.random() * 720}deg) scale(0.6)`;
      p.style.opacity = '0';
    }, 25);
  }

  setTimeout(() => container.remove(), 2600);
}

/* ── HELPER: animate bars after render ── */
function animateBars() {
  requestAnimationFrame(() => {
    document.querySelectorAll('.mark-tile-bar-fill[data-target]').forEach(el => {
      setTimeout(() => {
        el.style.width = el.dataset.target;
      }, 80);
    });
    const fill = document.querySelector('.progress-fill[data-target]');
    if (fill) {
      setTimeout(() => {
        fill.style.width = fill.dataset.target;
      }, 80);
    }
    const resCard = document.querySelector('.result-card');
    if (resCard) {
      apply3DTilt(resCard);
    }
  });
}

/* ── RENDER: error/warning message ── */
function renderMsg(type, title, body) {
  const icon = type === 'error' ? '🚫' : '⚠️';
  return `
    <div class="msg-box ${type}" role="alert">
      <span class="msg-icon">${icon}</span>
      <div>
        <div class="msg-title">${title}</div>
        <div class="msg-body">${body}</div>
      </div>
    </div>`;
}

/* ── RENDER: result card ── */
function renderResultCard(s) {
  const pct = s.attPct || 0;
  const cls = attClass(pct);
  const MAX_TOTAL = 20; // Sessional total out of 20

  /* Breakdown & Automatic Sum (Abhi sirf A1 aur CT1 active hain) */
  const assignTotal = Number(s.a1) || 0;
  const ctTotal     = Number(s.ct1) || 0;
  const attTotal    = Number(s.attMarks) || 0;

  /* Automatic Real-Time Grand Total: 10 + 5 + 5 = 20 */
  const autoTotal = attTotal + assignTotal + ctTotal;
  const grade     = getGrade(autoTotal, MAX_TOTAL);

  /* Low attendance warning */
  const attWarn = pct < 75
    ? `<div class="att-warning">⚠️ Attendance below 75% — you may be detained from exams if not improved.</div>`
    : '';

  return `
  <div class="result-card">

    <!-- Student identity hero -->
    <div class="student-hero">
      <div class="hero-top">
        <div>
          <div class="student-name">${s.name}</div>
          <div class="student-father">S/o D/o ${s.father || '—'}</div>
        </div>
        <div class="sr-badge">SR #${s.sr}</div>
      </div>
      <div class="hero-meta">
        <div class="meta-chip">
          <span class="meta-chip-label">Enrollment No.</span>
          <span class="meta-chip-value">${s.enroll}</span>
        </div>
        <div class="meta-chip">
          <span class="meta-chip-label">Subject</span>
          <span class="meta-chip-value">Software Testing</span>
        </div>
        <div class="meta-chip">
          <span class="meta-chip-label">Semester</span>
          <span class="meta-chip-value">${s.sem} Sem</span>
        </div>
        <div class="meta-chip">
          <span class="meta-chip-label">Session</span>
          <span class="meta-chip-value">2024-25</span>
        </div>
      </div>
    </div>

    <!-- Stats body -->
    <div class="stats-body">

      <!-- Attendance section -->
      <div class="attendance-section">
        <div class="section-label">📅 Attendance</div>
        <div class="att-row">
          <div class="att-label">Classes Attended <strong>${s.classesAttended}</strong> of <strong>${s.classesHeld}</strong></div>
          <div class="att-pct ${cls}">${pct.toFixed(pct === Math.floor(pct) ? 0 : 2)}%</div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${cls}" style="width:0%" data-target="${Math.min(pct, 100)}%"></div>
        </div>
        <div class="att-sub-info">
          <span>Attendance Marks: <strong>${s.attMarks} / 10</strong></span>
          <span>${pct >= 75 ? '✅ Eligible' : pct >= 60 ? '⚠️ Borderline' : '❌ Short'}</span>
        </div>
        ${attWarn}
      </div>

      <!-- Marks section -->
      <div class="marks-section">
        <div class="section-label">📝 Marks Breakdown</div>

        <!-- Sirf abhi active tests aur assignments dikhenge -->
        <div class="marks-grid" style="margin-bottom:16px">
          ${markTile('Assignment 1', s.a1, 5)}
          ${markTile('Class Test 1', s.ct1, 5)}
        </div>

        <!-- Grand total -->
        <div class="total-score-row">
          <div class="total-label">
            Sessional Total
            <span>Att. (10) + Assignment 1 (5) + Class Test 1 (5)</span>
          </div>
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
            <div>
              <span class="total-num">${autoTotal}</span>
              <span class="total-max"> / ${MAX_TOTAL}</span>
            </div>
            <div class="grade-badge ${grade.cls}">Grade ${grade.label}</div>
          </div>
        </div>

        <!-- Action row -->
        <div class="action-row">
          <button class="btn-outline" id="printBtn" onclick="window.print()" aria-label="Print result">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print / Save PDF
          </button>
          <button class="btn-outline" id="resetBtn" aria-label="Search again">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Search Again
          </button>
        </div>

        <!-- Print-only official signatures -->
        <div class="print-signatures" aria-hidden="true">
          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="sig-title">Subject Teacher Signature</div>
            <div class="sig-dept">Dept. of Information Technology</div>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="sig-title">Head of Department (HOD)</div>
            <div class="sig-dept">CSJMGP Ambedkarnagar</div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

/* ── SEARCH HANDLER ── */
function handleSearch(e) {
  e.preventDefault();

  const rawEnroll = enrollInput.value.trim();
  const rawDob = dobInput.value.trim();

  /* Basic validation */
  if (!rawEnroll) {
    showResult(renderMsg('error', 'Enrollment Number Required', 'Please enter your enrollment number to proceed.'));
    enrollInput.focus();
    return;
  }
  if (!rawDob) {
    showResult(renderMsg('error', 'Date of Birth Required', 'Please select your date of birth to authenticate your identity.'));
    dobInput.focus();
    return;
  }

  /* Simulate network delay for realism */
  setLoading(true);
  setTimeout(() => {
    const enroll = rawEnroll.toUpperCase();
    const student = STUDENT_INDEX[enroll];

    if (!student) {
      showResult(renderMsg('error',
        'Enrollment Number Not Found',
        `No record was found for <strong>${escHtml(rawEnroll)}</strong>. Please check your enrollment number and try again. Only Software Testing (5th Sem) students are listed here.`
      ));
      setLoading(false);
      return;
    }

    /* DOB check */
    if (student.dob !== rawDob) {
      showResult(renderMsg('error',
        'Date of Birth Mismatch',
        'The date of birth you entered does not match our records. Please verify and try again. If you believe there is an error, contact your subject teacher.'
      ));
      setLoading(false);
      return;
    }

    /* Success */
    showResult(renderResultCard(student));
    setLoading(false);
    animateBars();

    /* Trigger celebration confetti for top performers (>=16 marks / 80%) */
    const tot = (Number(student.attMarks) || 0) + (Number(student.a1) || 0) + (Number(student.ct1) || 0);
    if (tot >= 16) {
      setTimeout(triggerConfetti, 350);
    }

    /* Attach reset button */
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        resultSection.innerHTML = '';
        enrollInput.value = '';
        dobInput.value = '';
        enrollInput.focus();
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    /* Smooth scroll to result */
    setTimeout(() => {
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, 600);
}

/* ── UI HELPERS ── */
function showResult(html) {
  resultSection.innerHTML = html;
}

function setLoading(state) {
  searchBtn.disabled = state;
  searchBtn.classList.toggle('loading', state);
}

function escHtml(str) {
  return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

/* ── EVENT LISTENERS ── */
form.addEventListener('submit', handleSearch);

/* Allow Enter on enrollment input */
enrollInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); dobInput.focus(); }
});

/* Auto-uppercase enrollment */
enrollInput.addEventListener('input', () => {
  const pos = enrollInput.selectionStart;
  enrollInput.value = enrollInput.value.toUpperCase();
  enrollInput.setSelectionRange(pos, pos);
});

/* Clear result on re-edit */
enrollInput.addEventListener('input', () => {
  if (resultSection.innerHTML) resultSection.innerHTML = '';
});
dobInput.addEventListener('change', () => {
  if (resultSection.innerHTML) resultSection.innerHTML = '';
});

/* ── INITIALIZE 3D TILT ON SEARCH CARD ── */
const searchCard = document.querySelector('.search-card');
if (searchCard) {
  apply3DTilt(searchCard);
}
