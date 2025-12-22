<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Derby Timer</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
  <link href="style.css" rel="stylesheet" />
</head>

<body class="bg-dark text-white">
  <!-- NAV -->
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <a class="navbar-brand fw-bold" href="#">DerbyTimer</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu" aria-controls="navMenu" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navMenu">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item"><a class="nav-link" href="#" data-page="periodPage">Période</a></li>
          <li class="nav-item"><a class="nav-link" href="#" data-page="jamPage">Jam</a></li>
          <li class="nav-item"><a class="nav-link" href="#" data-page="lineupPage">Lineup</a></li>
          <li class="nav-item"><a class="nav-link" href="#" data-page="scorePage">Scoreboard</a></li>
          <li class="nav-item"><a class="nav-link" href="#" data-page="settingsPage">Paramètres</a></li>
          <li class="nav-item"><a class="nav-link" href="#" data-page="historyPage">Historique</a></li>
        </ul>
        <div class="d-flex gap-2">
          <button id="themeBtn" class="btn btn-outline-light">Mode Light/Dark</button>
          <button id="fullscreenBtn" class="btn btn-outline-light">Plein écran</button>
          <button id="resetAllBtn" class="btn btn-outline-danger">Reset complet</button>
        </div>
      </div>
    </div>
  </nav>

  <div class="container py-4">

    <!-- PERIOD PAGE -->
    <section id="periodPage" class="page">
      <h2 class="mb-3">Période</h2>
      <div class="status-row mb-2">
        <span id="periodStatus" class="status-pill bg-stopped">Arrêté</span>
        <span id="periodNumber" class="badge bg-light text-dark ms-2">Période #1</span>
      </div>
      <div id="periodDisplay" class="timer-display">30:00</div>
      <div class="btn-row">
        <button class="btn btn-success btn-lg" id="periodStartBtn">Start</button>
        <button class="btn btn-warning btn-lg" id="periodPauseBtn">Pause</button>
        <button class="btn btn-danger btn-lg" id="periodResetBtn">Reset</button>
        <button class="btn btn-outline-info btn-lg" id="nextPeriodBtn">Période suivante</button>
      </div>
    </section>

    <!-- JAM PAGE -->
    <section id="jamPage" class="page d-none">
      <h2 class="mb-3">Jam <span id="jamCount" class="badge bg-light text-dark">#0</span></h2>
      <div class="status-row mb-2">
        <span id="jamStatus" class="status-pill bg-stopped">Arrêté</span>
      </div>
      <div id="jamDisplay" class="timer-display">02:00</div>
      <div class="btn-row">
        <button class="btn btn-success btn-lg" id="jamStartBtn">Start Jam</button>
        <button class="btn btn-warning btn-lg" id="jamPauseBtn">Pause Jam</button>
        <button class="btn btn-danger btn-lg" id="jamEndBtn">End Jam</button>
        <button class="btn btn-outline-light btn-lg" id="jamResetBtn">Reset Jam</button>
      </div>
      <div class="mt-2">
        <button class="btn btn-light btn-sm" id="jamMinusBtn">−</button>
        <button class="btn btn-light btn-sm" id="jamPlusBtn">+</button>
      </div>
    </section>

    <!-- LINEUP PAGE -->
    <section id="lineupPage" class="page d-none">
      <h2 class="mb-3">Lineup</h2>
      <div class="status-row mb-2">
        <span id="lineupStatus" class="status-pill bg-stopped">Arrêté</span>
        <div class="form-check ms-2">
          <input class="form-check-input" type="checkbox" id="autoLineupCheckbox" checked>
          <label class="form-check-label" for="autoLineupCheckbox">Lancer le Jam automatiquement à la fin</label>
        </div>
      </div>
      <div id="lineupDisplay" class="timer-display">00:30</div>
      <div class="btn-row">
        <button class="btn btn-success btn-lg" id="lineupStartBtn">Start Lineup</button>
        <button class="btn btn-warning btn-lg" id="lineupPauseBtn">Pause</button>
        <button class="btn btn-danger btn-lg" id="lineupResetBtn">Reset</button>
      </div>
    </section>

    <!-- SCOREBOARD PAGE -->
    <section id="scorePage" class="page d-none">
      <h2 class="mb-4">Scoreboard</h2>
      <div class="row g-4 align-items-center">
        <div class="col-md-6 text-center">
          <input id="teamAName" class="form-control text-center mb-2" placeholder="Équipe A" />
          <div class="score-display" id="scoreA">0</div>
          <div class="d-flex justify-content-center flex-wrap">
            <button class="btn btn-light m-1" data-score="A" data-delta="1">+1</button>
            <button class="btn btn-light m-1" data-score="A" data-delta="5">+5</button>
            <button class="btn btn-light m-1" data-score="A" data-delta="-1">−1</button>
            <button class="btn btn-light m-1" data-score="A" data-delta="-5">−5</button>
          </div>
        </div>
        <div class="col-md-6 text-center">
          <input id="teamBName" class="form-control text-center mb-2" placeholder="Équipe B" />
          <div class="score-display" id="scoreB">0</div>
          <div class="d-flex justify-content-center flex-wrap">
            <button class="btn btn-light m-1" data-score="B" data-delta="1">+1</button>
            <button class="btn btn-light m-1" data-score="B" data-delta="5">+5</button>
            <button class="btn btn-light m-1" data-score="B" data-delta="-1">−1</button>
            <button class="btn btn-light m-1" data-score="B" data-delta="-5">−5</button>
          </div>
        </div>
      </div>
    </section>

    <!-- SETTINGS PAGE -->
    <section id="settingsPage" class="page d-none">
      <h2 class="mb-3">Paramètres</h2>
      <div class="row g-3 justify-content-center">
        <div class="col-sm-4">
          <label class="form-label">Durée Jam (sec)</label>
          <input type="number" id="jamDurationInput" class="form-control text-center" value="120" />
        </div>
        <div class="col-sm-4">
          <label class="form-label">Durée Période (sec)</label>
          <input type="number" id="periodDurationInput" class="form-control text-center" value="1800" />
        </div>
        <div class="col-sm-4">
          <label class="form-label">Durée Lineup (sec)</label>
          <input type="number" id="lineupDurationInput" class="form-control text-center" value="30" />
        </div>
      </div>
      <div class="text-center mt-3">
        <button class="btn btn-info" id="applySettingsBtn">Appliquer</button>
      </div>
      <div class="mt-4">
        <p class="text-secondary small">
          Raccourcis: Space = Start/Pause Jam, E = End Jam, L = Start/Pause Lineup, P = Start/Pause Période, F = Plein écran
        </p>
      </div>
    </section>

    <!-- HISTORY PAGE -->
    <section id="historyPage" class="page d-none">
      <h2 class="mb-3">Historique des Jams</h2>
      <div class="table-responsive">
        <table class="table table-dark table-striped align-middle">
          <thead>
            <tr>
              <th>Jam #</th>
              <th>Durée (s)</th>
              <th>Période</th>
              <th>Score A</th>
              <th>Score B</th>
              <th>Horodatage</th>
            </tr>
          </thead>
          <tbody id="historyBody"></tbody>
        </table>
      </div>
      <div class="d-flex justify-content-end gap-2">
        <button class="btn btn-outline-light" id="exportCSVBtn">Export CSV</button>
        <button class="btn btn-outline-light" id="exportJSONBtn">Export JSON</button>
        <button class="btn btn-outline-warning" id="clearHistoryBtn">Effacer l’historique</button>
      </div>
    </section>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  <script src="script.js"></script>
</body>
</html>
