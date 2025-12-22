// -------------------- CONFIG DEFAULTS --------------------
let periodDuration = 30 * 60; // seconds
let jamDuration = 2 * 60;     // seconds
let lineupDuration = 30;      // seconds

// -------------------- STATE --------------------
let periodRemaining = periodDuration;
let jamRemaining = jamDuration;
let lineupRemaining = lineupDuration;

let periodRunning = false;
let jamRunning = false;
let lineupRunning = false;

let periodStartedAt = null;
let jamStartedAt = null;
let lineupStartedAt = null;

let periodNumber = 1;
let jamCount = 0;

let scoreA = 0;
let scoreB = 0;

let autoLineupEnabled = true;

let history = []; // { jamNumber, elapsedSeconds, periodNumber, scoreA, scoreB, timestamp }

let masterInterval = null;

// -------------------- ELEMENTS --------------------
const periodDisplay = document.getElementById("periodDisplay");
const jamDisplay = document.getElementById("jamDisplay");
const lineupDisplay = document.getElementById("lineupDisplay");

const periodStatus = document.getElementById("periodStatus");
const jamStatus = document.getElementById("jamStatus");
const lineupStatus = document.getElementById("lineupStatus");

const periodNumberEl = document.getElementById("periodNumber");
const jamCountEl = document.getElementById("jamCount");

const scoreAEl = document.getElementById("scoreA");
const scoreBEl = document.getElementById("scoreB");

const teamANameEl = document.getElementById("teamAName");
const teamBNameEl = document.getElementById("teamBName");

const autoLineupCheckbox = document.getElementById("autoLineupCheckbox");
const historyBody = document.getElementById("historyBody");

// Buttons
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    showPage(link.dataset.page);
  });
});

document.getElementById("periodStartBtn").addEventListener("click", startPeriod);
document.getElementById("periodPauseBtn").addEventListener("click", pausePeriod);
document.getElementById("periodResetBtn").addEventListener("click", resetPeriod);
document.getElementById("nextPeriodBtn").addEventListener("click", nextPeriod);

document.getElementById("jamStartBtn").addEventListener("click", startJam);
document.getElementById("jamPauseBtn").addEventListener("click", pauseJam);
document.getElementById("jamEndBtn").addEventListener("click", endJam);
document.getElementById("jamResetBtn").addEventListener("click", resetJam);
document.getElementById("jamMinusBtn").addEventListener("click", () => adjustJamCount(-1));
document.getElementById("jamPlusBtn").addEventListener("click", () => adjustJamCount(1));

document.getElementById("lineupStartBtn").addEventListener("click", startLineup);
document.getElementById("lineupPauseBtn").addEventListener("click", pauseLineup);
document.getElementById("lineupResetBtn").addEventListener("click", resetLineup);

document.getElementById("applySettingsBtn").addEventListener("click", applySettings);

document.getElementById("exportCSVBtn").addEventListener("click", exportHistoryCSV);
document.getElementById("exportJSONBtn").addEventListener("click", exportHistoryJSON);
document.getElementById("clearHistoryBtn").addEventListener("click", clearHistory);

document.getElementById("themeBtn").addEventListener("click", toggleTheme);
document.getElementById("fullscreenBtn").addEventListener("click", toggleFullscreen);
document.getElementById("resetAllBtn").addEventListener("click", resetAll);

document.querySelectorAll("[data-score]").forEach(btn => {
  btn.addEventListener("click", () => adjustScore(btn.dataset.score, parseInt(btn.dataset.delta, 10)));
});

autoLineupCheckbox.addEventListener("change", () => {
  autoLineupEnabled = autoLineupCheckbox.checked;
  saveState();
});

teamANameEl?.addEventListener("input", saveState);
teamBNameEl?.addEventListener("input", saveState);

// -------------------- NAVIGATION --------------------
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("d-none"));

  const page = document.getElementById(id);
  if (!page) {
    console.warn("Page introuvable :", id);
    return;
  }

  page.classList.remove("d-none");
}
// -------------------- MASTER CLOCK --------------------
function startMasterClock() {
  if (masterInterval) return;
  masterInterval = setInterval(tick, 250); // 4x par seconde pour plus de fluidité
}

function stopMasterClockIfIdle() {
  if (!periodRunning && !jamRunning && !lineupRunning) {
    clearInterval(masterInterval);
    masterInterval = null;
  }
}

function tick() {
  const now = Date.now();

  // Period
  if (periodRunning && periodRemaining > 0 && periodStartedAt) {
    const elapsed = Math.floor((now - periodStartedAt) / 1000);
    const newRemaining = periodRemainingAtStart - elapsed;
    setPeriodRemaining(newRemaining);
    if (periodRemaining <= 0) {
      periodRemaining = 0;
      pausePeriod();
      pauseJam();
      pauseLineup();
    }
  }

  // Jam
  if (jamRunning && jamRemaining > 0 && jamStartedAt) {
    const elapsed = Math.floor((now - jamStartedAt) / 1000);
    const newRemaining = jamRemainingAtStart - elapsed;
    setJamRemaining(newRemaining);
    if (jamRemaining <= 0) {
      jamRemaining = 0;
      endJam(); // enregistre + lineup auto selon option
    }
  }

  // Lineup
  if (lineupRunning && lineupRemaining > 0 && lineupStartedAt) {
    const elapsed = Math.floor((now - lineupStartedAt) / 1000);
    const newRemaining = lineupRemainingAtStart - elapsed;
    setLineupRemaining(newRemaining);
    if (lineupRemaining <= 0) {
      lineupRemaining = 0;
      pauseLineup();
      resetLineup();
      if (autoLineupEnabled) startJam(); // auto start jam
    }
  }

  updateDisplays();
  saveState();
}

// Snapshot remaining at start for precise sync
let periodRemainingAtStart = periodRemaining;
let jamRemainingAtStart = jamRemaining;
let lineupRemainingAtStart = lineupRemaining;

// -------------------- UTIL --------------------
function formatTime(seconds) {
  seconds = Math.max(0, Math.floor(seconds));
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function setStatus(el, status) {
  // status: "running" | "paused" | "stopped"
  el.classList.remove("bg-running", "bg-paused", "bg-stopped");
  if (status === "running") el.classList.add("bg-running");
  else if (status === "paused") el.classList.add("bg-paused");
  else el.classList.add("bg-stopped");
  el.textContent = status === "running" ? "En cours" : status === "paused" ? "En pause" : "Arrêté";
}

function updateDisplays() {
  periodDisplay.textContent = formatTime(periodRemaining);
  jamDisplay.textContent = formatTime(jamRemaining);
  lineupDisplay.textContent = formatTime(lineupRemaining);

  // low time warning under 10s
  [periodDisplay, jamDisplay, lineupDisplay].forEach((el, idx) => {
    const t = idx === 0 ? periodRemaining : idx === 1 ? jamRemaining : lineupRemaining;
    if (t <= 10 && t > 0) el.classList.add("low-time");
    else el.classList.remove("low-time");
  });

  // low time warning under 5s
  [periodDisplay, jamDisplay, lineupDisplay].forEach((el, idx) => {
    const t = idx === 0 ? periodRemaining : idx === 1 ? jamRemaining : lineupRemaining;
    if (t <= 5 && t > 0) el.classList.add("low-time2");
    else el.classList.remove("low-time2");
  });
  
  periodNumberEl.textContent = `Période #${periodNumber}`;
  jamCountEl.textContent = `#${jamCount}`;

  scoreAEl.textContent = scoreA;
  scoreBEl.textContent = scoreB;
}

// -------------------- PERIOD CONTROLS --------------------
function startPeriod() {
  if (periodRemaining <= 0) return;
  if (periodRunning) return;
  periodRunning = true;
  periodStartedAt = Date.now();
  periodRemainingAtStart = periodRemaining;
  setStatus(periodStatus, "running");
  startMasterClock();
}

function pausePeriod() {
  if (!periodRunning) return;
  // Freeze remaining based on elapsed
  const now = Date.now();
  const elapsed = Math.floor((now - periodStartedAt) / 1000);
  setPeriodRemaining(periodRemainingAtStart - elapsed);
  periodRunning = false;
  periodStartedAt = null;
  setStatus(periodStatus, "paused");
  stopMasterClockIfIdle();
}

function resetPeriod() {
  periodRunning = false;
  periodStartedAt = null;
  setPeriodRemaining(periodDuration);
  setStatus(periodStatus, "stopped");
  updateDisplays();
  stopMasterClockIfIdle();
}

function nextPeriod() {
  periodNumber++;
  resetPeriod();
  updateDisplays();
}

// safe setter
function setPeriodRemaining(val) {
  periodRemaining = Math.max(0, val);
}

// -------------------- JAM CONTROLS --------------------
function startJam() {
  if (periodRemaining <= 0) return;          // interdit si période terminée
  if (!periodRunning) startPeriod();          // auto start period
  if (jamRemaining <= 0) jamRemaining = jamDuration;
  if (jamRunning) return;

  jamRunning = true;
  jamStartedAt = Date.now();
  jamRemainingAtStart = jamRemaining;
  setStatus(jamStatus, "running");
  startMasterClock();
}

function pauseJam() {
  if (!jamRunning) return;
  const now = Date.now();
  const elapsed = Math.floor((now - jamStartedAt) / 1000);
  setJamRemaining(jamRemainingAtStart - elapsed);
  jamRunning = false;
  jamStartedAt = null;
  setStatus(jamStatus, "paused");
  stopMasterClockIfIdle();
}

function endJam() {
  // Enregistrer l'historique
  const elapsed = Math.max(0, jamDuration - jamRemaining);
  jamCount++;
  pushJamHistory({
    jamNumber: jamCount,
    elapsedSeconds: elapsed,
    periodNumber,
    scoreA,
    scoreB
  });

  // Reset jam clock
  jamRunning = false;
  jamStartedAt = null;
  setJamRemaining(jamDuration);
  setStatus(jamStatus, "stopped");

  // Auto lineup
  if (autoLineupEnabled) startLineup();

  updateDisplays();
  stopMasterClockIfIdle();
}

function resetJam() {
  jamRunning = false;
  jamStartedAt = null;
  setJamRemaining(jamDuration);
  setStatus(jamStatus, "stopped");
  updateDisplays();
  stopMasterClockIfIdle();
}

function adjustJamCount(delta) {
  jamCount = Math.max(0, jamCount + delta);
  updateDisplays();
  saveState();
}

function setJamRemaining(val) {
  jamRemaining = Math.max(0, val);
}

// -------------------- LINEUP CONTROLS --------------------
function startLineup() {
  if (lineupRemaining <= 0) lineupRemaining = lineupDuration;
  if (lineupRunning) return;

  lineupRunning = true;
  lineupStartedAt = Date.now();
  lineupRemainingAtStart = lineupRemaining;
  setStatus(lineupStatus, "running");
  startMasterClock();
}

function pauseLineup() {
  if (!lineupRunning) return;
  const now = Date.now();
  const elapsed = Math.floor((now - lineupStartedAt) / 1000);
  setLineupRemaining(lineupRemainingAtStart - elapsed);
  lineupRunning = false;
  lineupStartedAt = null;
  setStatus(lineupStatus, "paused");
  stopMasterClockIfIdle();
}

function resetLineup() {
  lineupRunning = false;
  lineupStartedAt = null;
  setLineupRemaining(lineupDuration);
  setStatus(lineupStatus, "stopped");
  updateDisplays();
  stopMasterClockIfIdle();
}

function setLineupRemaining(val) {
  lineupRemaining = Math.max(0, val);
}

// -------------------- SCOREBOARD --------------------
function adjustScore(team, delta) {
  if (team === "A") {
    scoreA = Math.max(0, scoreA + delta);
  } else {
    scoreB = Math.max(0, scoreB + delta);
  }
  updateDisplays();
  saveState();
}

// -------------------- SETTINGS --------------------
function applySettings() {
  const jd = parseInt(document.getElementById("jamDurationInput").value, 10);
  const pd = parseInt(document.getElementById("periodDurationInput").value, 10);
  const ld = parseInt(document.getElementById("lineupDurationInput").value, 10);

  if (!isNaN(jd) && jd > 0) {
    jamDuration = jd;
    if (!jamRunning) setJamRemaining(jamDuration);
  }
  if (!isNaN(pd) && pd > 0) {
    periodDuration = pd;
    if (!periodRunning) setPeriodRemaining(periodDuration);
  }
  if (!isNaN(ld) && ld > 0) {
    lineupDuration = ld;
    if (!lineupRunning) setLineupRemaining(lineupDuration);
  }
  updateDisplays();
  saveState();
}

// -------------------- HISTORY --------------------
function pushJamHistory(entry) {
  const enriched = { ...entry, timestamp: new Date().toISOString() };
  history.push(enriched);
  renderHistory();
  saveState();
}

function renderHistory() {
  historyBody.innerHTML = "";
  history.forEach((h) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${h.jamNumber}</td>
      <td>${h.elapsedSeconds}</td>
      <td>${h.periodNumber}</td>
      <td>${h.scoreA}</td>
      <td>${h.scoreB}</td>
      <td>${h.timestamp}</td>
    `;
    historyBody.appendChild(tr);
  });
}

function exportHistoryCSV() {
  const headers = ["Jam #", "Durée (s)", "Période", "Score A", "Score B", "Horodatage"];
  const rows = history.map(h => [h.jamNumber, h.elapsedSeconds, h.periodNumber, h.scoreA, h.scoreB, h.timestamp]);
  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  downloadFile("derby_history.csv", csv, "text/csv");
}

function exportHistoryJSON() {
  const json = JSON.stringify(history, null, 2);
  downloadFile("derby_history.json", json, "application/json");
}

function clearHistory() {
  if (!confirm("Effacer l’historique des jams ?")) return;
  history = [];
  renderHistory();
  saveState();
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// -------------------- THEME + FULLSCREEN + RESET --------------------
function toggleTheme() {
  document.body.classList.toggle("light");
  saveState();
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

function resetAll() {
  if (!confirm("Reset complet (timers, scores, historique) ?")) return;

  // stop
  periodRunning = jamRunning = lineupRunning = false;
  periodStartedAt = jamStartedAt = lineupStartedAt = null;
  clearInterval(masterInterval);
  masterInterval = null;

  // defaults
  periodDuration = 30 * 60;
  jamDuration = 2 * 60;
  lineupDuration = 30;

  periodRemaining = periodDuration;
  jamRemaining = jamDuration;
  lineupRemaining = lineupDuration;

  periodNumber = 1;
  jamCount = 0;

  scoreA = 0;
  scoreB = 0;

  autoLineupEnabled = true;
  autoLineupCheckbox.checked = true;

  teamANameEl.value = "";
  teamBNameEl.value = "";

  history = [];

  setStatus(periodStatus, "stopped");
  setStatus(jamStatus, "stopped");
  setStatus(lineupStatus, "stopped");

  renderHistory();
  updateDisplays();
  saveState();
}

// -------------------- PERSISTENCE --------------------
function saveState() {
  const state = {
    periodDuration, jamDuration, lineupDuration,
    periodRemaining, jamRemaining, lineupRemaining,
    periodRunning, jamRunning, lineupRunning,
    periodNumber, jamCount,
    scoreA, scoreB,
    teamAName: teamANameEl?.value ?? "",
    teamBName: teamBNameEl?.value ?? "",
    autoLineupEnabled,
    themeLight: document.body.classList.contains("light"),
    history
  };
  localStorage.setItem("derbyTimerStateV3", JSON.stringify(state));
}

function loadState() {
  const s = localStorage.getItem("derbyTimerStateV3");
  if (!s) return;
  try {
    const state = JSON.parse(s);
    periodDuration = state.periodDuration ?? periodDuration;
    jamDuration = state.jamDuration ?? jamDuration;
    lineupDuration = state.lineupDuration ?? lineupDuration;

    periodRemaining = state.periodRemaining ?? periodDuration;
    jamRemaining = state.jamRemaining ?? jamDuration;
    lineupRemaining = state.lineupRemaining ?? lineupDuration;

    periodRunning = false; // on ne relance pas automatiquement pour éviter surprises
    jamRunning = false;
    lineupRunning = false;

    periodNumber = state.periodNumber ?? 1;
    jamCount = state.jamCount ?? 0;

    scoreA = state.scoreA ?? 0;
    scoreB = state.scoreB ?? 0;

    if (teamANameEl) teamANameEl.value = state.teamAName ?? "";
    if (teamBNameEl) teamBNameEl.value = state.teamBName ?? "";

    autoLineupEnabled = state.autoLineupEnabled ?? true;
    autoLineupCheckbox.checked = autoLineupEnabled;

    if (state.themeLight) document.body.classList.add("light");
    else document.body.classList.remove("light");

    history = Array.isArray(state.history) ? state.history : [];
    renderHistory();
  } catch (e) {
    console.warn("Failed to load state:", e);
  }
}

// -------------------- KEYBOARD SHORTCUTS --------------------
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;
  switch (e.key.toLowerCase()) {
    case " ":
      if (jamRunning) pauseJam();
      else startJam();
      e.preventDefault();
      break;
    case "e":
      endJam();
      break;
    case "l":
      if (lineupRunning) pauseLineup();
      else startLineup();
      break;
    case "p":
      if (periodRunning) pausePeriod();
      else startPeriod();
      break;
    case "f":
      toggleFullscreen();
      break;
    default:
      break;
  }
});

// -------------------- INIT --------------------
function initStatuses() {
  setStatus(periodStatus, "stopped");
  setStatus(jamStatus, "stopped");
  setStatus(lineupStatus, "stopped");
}

function init() {
  loadState();
  updateDisplays();
  initStatuses();
  showPage("jamPage"); // page par défaut orientée action
}

init();
