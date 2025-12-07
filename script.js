/**
 * CDS PYQ Quiz Platform
 * Single File Version for Sandbox Compatibility
 * FEATURES: MathJax, HTML Parsing, Back Button, Home Button, Prev Button, State Persistence
 */

const REPO_OWNER = "deepak-gurjar07";
const REPO_NAME = "cds-quiz";
const BRANCH = "main";

// --- CONFIGURATION: STATIC DATA MAP ---
const QUIZ_TREE = {
  computer_science: ["2025-I"],
  economics: [
    "2007-II",
    "2008-I",
    "2008-II",
    "2011-II",
    "2012-I",
    "2012-II",
    "2013-I",
    "2013-II",
    "2014-I",
    "2014-II",
    "2015-I",
    "2015-II",
    "2016-I",
    "2016-II",
    "2017-I",
    "2017-II",
    "2018-I",
    "2018-II",
    "2019-I",
    "2019-II",
    "2020-I",
    "2025-I",
  ],
  geography: [
    "2007-I",
    "2007-II",
    "2008-I",
    "2008-II",
    "2009-I",
    "2009-II",
    "2010-I",
    "2010-II",
    "2011-I",
    "2011-II",
    "2012-I",
    "2012-II",
    "2013-I",
    "2013-II",
    "2014-I",
    "2014-II",
    "2015-I",
    "2015-II",
    "2016-I",
    "2016-II",
    "2017-I",
    "2017-II",
    "2018-1",
    "2018-II",
    "2019-I",
    "2019-II",
    "2020-I",
    "2024-II",
    "2025-I",
  ],
  history: [
    "2007-II",
    "2008-I",
    "2008-II",
    "2009-I",
    "2009-II",
    "2010-I",
    "2010-II",
    "2011-I",
    "2011-II",
    "2012-I",
    "2012-II",
    "2013-I",
    "2013-II",
    "2014-I",
    "2014-II",
    "2015-I",
    "2015-II",
    "2016-I",
    "2016-II",
    "2017-I",
    "2017-II",
    "2018-I",
    "2018-II",
    "2019-I",
    "2019-II",
    "2020-I",
    "2024-II",
    "2025-I",
  ],
  polity: [
    "2007-I",
    "2007-II",
    "2008-I",
    "2008-II",
    "2009-I",
    "2009-II",
    "2010-I",
    "2010-II",
    "2011-I",
    "2012-I",
    "2012-II",
    "2013-I",
    "2013-II",
    "2014-I",
    "2014-II",
    "2015-I",
    "2015-II",
    "2016-I",
    "2016-II",
    "2017-I",
    "2017-II",
    "2018-I",
    "2018-II",
    "2019-I",
    "2019-II",
    "2020-I",
    "2024-II",
    "2025-I",
  ],
  science: [
    "2007-I",
    "2007-II",
    "2008-I",
    "2008-II",
    "2009-I",
    "2009-II",
    "2010-I",
    "2010-II",
    "2011-I",
    "2011-II",
    "2012-I",
    "2012-II",
    "2013-I",
    "2013-II",
    "2014-I",
    "2014-II",
    "2015-I",
    "2015-II",
    "2016-I",
    "2016-II",
    "2017-I",
    "2017-II",
    "2018-I",
    "2018-II",
    "2019-I",
    "2019-II",
    "2020-I",
    "2020-II",
    "2025-I",
  ],
  Mathematics: [
    "2007-I",
    "2007-II",
    "2008-I",
    "2008-II",
    "2009-I",
    "2009-II",
    "2010-I",
    "2010-II",
    "2011-I",
    "2011-II",
    "2012-I",
    "2012-II",
    "2013-I",
    "2013-II",
    "2014-I",
    "2014-II",
    "2015-I",
    "2015-II",
    "2016-I",
    "2016-II",
    "2017-I",
    "2017-II",
    "2018-I",
    "2018-II",
    "2019-I",
    "2019-II",
    "2020-I",
    "2020-II",
    "2021-I",
    "2021-II",
    "2022-I",
    "2022-II",
    "2023-I",
    "2023-II",
  ],
};

// --- App State ---
const appState = {
  currentScreen: "screen-subjects",
  subject: null,
  year: null,
  subtopics: [],
  questions: [],
  currentQuestionIndex: 0,
  userAnswers: {},
  topicMap: null,
};

// **FIXED: Correct variable name used throughout functions**
const APP_STATE_STORAGE_KEY = "cdsQuizStateV1";

// --- DOM Elements ---
const screens = {
  subjects: document.getElementById("screen-subjects"),
  years: document.getElementById("screen-years"),
  subtopics: document.getElementById("screen-subtopics"),
  quiz: document.getElementById("screen-quiz"),
  result: document.getElementById("screen-result"),
  loader: document.getElementById("loader"),
  error: document.getElementById("error-screen"),
};

// --- Helpers for saving/restoring app state ---
function saveAppState() {
  try {
    const toSave = {
      currentScreen: appState.currentScreen,
      subject: appState.subject,
      year: appState.year,
      subtopics: appState.subtopics,
      questions: appState.questions,
      currentQuestionIndex: appState.currentQuestionIndex,
      userAnswers: appState.userAnswers,
      topicMap: appState.topicMap,
    };
    localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(toSave));
  } catch (err) {
    console.warn("Failed to save app state", err);
  }
}

function loadSavedAppState() {
  try {
    const raw = localStorage.getItem(APP_STATE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Failed to parse saved app state", err);
    return null;
  }
}

function clearSavedAppState() {
  try {
    localStorage.removeItem(APP_STATE_STORAGE_KEY);
  } catch (err) {
    console.warn("Failed to clear saved app state", err);
  }
}

// --- Navigation Logic ---
const app = {
  showScreen: (screenId, options = {}) => {
    Object.values(screens).forEach((s) =>
      s.classList.remove("active", "hidden")
    );
    Object.values(screens).forEach((s) => {
      if (s.id !== screenId) s.classList.add("hidden");
    });

    const el = document.getElementById(screenId);
    if (!el) return;

    el.classList.add("active");
    appState.currentScreen = screenId;

    // History integration for browser back button
    if (!options.skipHistory) {
      try {
        history.pushState(
          {
            screenId,
          },
          "",
          "#" + screenId
        );
      } catch (_) {}
    }

    saveAppState();
  },

  showLoader: (msg = "Loading...") => {
    document.getElementById("loader-text").textContent = msg;
    Object.values(screens).forEach((s) => s.classList.add("hidden"));
    screens.loader.classList.remove("hidden");
  },

  showError: (msg) => {
    document.getElementById("error-message").textContent = msg;
    Object.values(screens).forEach((s) => s.classList.add("hidden"));
    screens.error.classList.remove("hidden");
    screens.error.classList.add("active");
  },

  goBack: () => {
    if (appState.currentScreen === "screen-years") {
      app.showScreen("screen-subjects");
    } else if (appState.currentScreen === "screen-subtopics") {
      app.showScreen("screen-years");
    } else if (appState.currentScreen === "screen-quiz") {
      app.showScreen("screen-subtopics");
    }
  },

  goHome: () => {
    if (confirm("Return to Home? Any current progress will be lost.")) {
      clearSavedAppState();
      app.showScreen("screen-subjects");
    }
  },

  quitQuiz: () => {
    if (
      confirm(
        "Are you sure you want to quit the quiz? Your progress will be lost."
      )
    ) {
      app.showScreen("screen-subtopics");
    }
  },
};

// --- 1. Load Subjects ---
function loadSubjects() {
  console.log("Loading Subjects...");
  const grid = document.getElementById("subject-grid");
  grid.innerHTML = "";

  const subjects = Object.keys(QUIZ_TREE);

  subjects.forEach((subName) => {
    const displayName = subName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    const btn = document.createElement("div");
    btn.className = "card-btn";
    btn.textContent = displayName;
    btn.onclick = () => selectSubject(subName);
    grid.appendChild(btn);
  });

  // Don't auto-show here, restoreOrBoot handles showing the correct screen
}

// --- 2. Load Years ---
function selectSubject(subjectName) {
  appState.subject = subjectName;
  // Don't rely on localStorage 'lastSubject', use appState

  const title = subjectName
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  document.getElementById("selected-subject-title").textContent = title;

  const years = QUIZ_TREE[subjectName] || [];

  const grid = document.getElementById("year-grid");
  grid.innerHTML = "";

  if (years.length === 0) {
    grid.innerHTML =
      '<p style="grid-column: 1/-1; text-align: center;">No papers added for this subject yet.</p>';
  } else {
    years.forEach((year) => {
      const btn = document.createElement("div");
      btn.className = "card-btn";
      btn.textContent = year;
      btn.onclick = () => selectYear(subjectName, `${year}.json`);
      grid.appendChild(btn);
    });
  }

  app.showScreen("screen-years");
}

// --- 3. Fetch Full JSON & Extract Subtopics ---
async function selectYear(subject, filename) {
  const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${subject}/${filename}`;
  appState.year = filename.replace(".json", "");

  app.showLoader("Parsing Questions...");

  try {
    const res = await fetch(rawUrl);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();

    // SMART PARSER LOGIC
    let finalMap = {};

    if (json.subtopics) {
      finalMap = json.subtopics;
    } else if (json.topics) {
      finalMap = json.topics;
    } else {
      const keys = Object.keys(json);
      keys.forEach((key) => {
        if (Array.isArray(json[key])) {
          finalMap[key] = json[key];
        }
      });
    }

    appState.topicMap = finalMap;
    const subtopics = Object.keys(finalMap);

    renderSubtopics(subtopics);
    app.showScreen("screen-subtopics");
  } catch (err) {
    console.error(err);
    app.showError(
      "Error parsing the question file. Check console for details."
    );
  }
}

// --- Subtopic Rendering ---
function renderSubtopics(topicList) {
  const list = document.getElementById("subtopic-list");
  list.innerHTML = "";

  if (topicList.length === 0) {
    list.innerHTML =
      "<p>No subtopics found. The file structure might be unrecognized.</p>";
    return;
  }

  topicList.forEach((topic) => {
    const questionsInTopic = appState.topicMap[topic];
    const qCount = questionsInTopic ? questionsInTopic.length : 0;
    if (qCount === 0) return;

    const label = document.createElement("label");
    label.className = "checkbox-item";
    label.innerHTML = `
            <input type="checkbox" value="${topic}" checked>
            <span>${topic} <small class="text-muted">(${qCount})</small></span>
        `;
    list.appendChild(label);
  });

  document.getElementById("btn-start-quiz").onclick = generateQuizFromSelection;
}

// --- Quiz Generation ---
function generateQuizFromSelection() {
  const checkboxes = document.querySelectorAll("#subtopic-list input:checked");
  const selectedTopics = Array.from(checkboxes).map((cb) => cb.value);

  if (selectedTopics.length === 0) {
    alert("Please select at least one topic.");
    return;
  }

  let quizQuestions = [];
  selectedTopics.forEach((topic) => {
    const questions = appState.topicMap[topic];
    if (questions) {
      const taggedQuestions = questions.map((q) => ({ ...q, _topic: topic }));
      quizQuestions = [...quizQuestions, ...taggedQuestions];
    }
  });

  startQuizEngine(quizQuestions);
}

// --- Quiz Engine ---
function startQuizEngine(questions) {
  appState.questions = questions;
  appState.currentQuestionIndex = 0;
  appState.userAnswers = {};

  app.showScreen("screen-quiz");
  renderQuestion();
}

function renderQuestion() {
  const qData = appState.questions[appState.currentQuestionIndex];
  if (!qData) return;

  const total = appState.questions.length;
  const current = appState.currentQuestionIndex + 1;
  document.getElementById("q-progress").textContent = `${current} / ${total}`;
  document.getElementById("progress-fill").style.width = `${
    (current / total) * 100
  }%`;

  const qText = qData.question || qData.statement || "Question text missing";
  document.getElementById("q-text").innerHTML = `${current}. ${qText}`;

  const optionsContainer = document.getElementById("q-options");
  optionsContainer.innerHTML = "";

  let options = qData.options || qData.choices || [];
  if (!Array.isArray(options) && typeof options === "object") {
    options = Object.values(options);
  }

  options.forEach((optText, index) => {
    const label = document.createElement("label");
    label.className = "option-label";
    const isSelected =
      appState.userAnswers[appState.currentQuestionIndex] === optText;
    if (isSelected) label.classList.add("selected");

    label.innerHTML = `
            <input type="radio" name="q-opt" class="hidden" ${
              isSelected ? "checked" : ""
            }>
            <span>${optText}</span>
        `;
    label.onclick = () => selectOption(optText, index);
    optionsContainer.appendChild(label);
  });

  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");
  const btnSubmit = document.getElementById("btn-submit");

  if (current === 1) {
    btnPrev.classList.add("hidden");
  } else {
    btnPrev.classList.remove("hidden");
  }

  if (current === total) {
    btnNext.classList.add("hidden");
    btnSubmit.classList.remove("hidden");
  } else {
    btnNext.classList.remove("hidden");
    btnSubmit.classList.add("hidden");
  }

  btnPrev.onclick = () => {
    if (appState.currentQuestionIndex > 0) {
      appState.currentQuestionIndex--;
      renderQuestion();
    }
  };

  btnNext.onclick = () => {
    if (appState.currentQuestionIndex < appState.questions.length - 1) {
      appState.currentQuestionIndex++;
      renderQuestion();
    }
  };

  btnSubmit.onclick = calculateResults;

  if (window.MathJax) {
    MathJax.typesetPromise();
  }

  // Save on every question render so reload can restore mid-quiz
  saveAppState();
}

function selectOption(optText, index) {
  appState.userAnswers[appState.currentQuestionIndex] = optText;
  renderQuestion();
}

// --- Results with Topic-wise Strength/Weakness ---
function calculateResults() {
  let score = 0;
  let correctCount = 0;
  let wrongCount = 0;
  const total = appState.questions.length;

  const reviewList = document.getElementById("review-list");
  reviewList.innerHTML = "";

  // Topic-wise stats object
  const topicStats = {};

  appState.questions.forEach((q, index) => {
    const userAns = appState.userAnswers[index];
    const correctAns = q.answer;
    const topic = q._topic || "Misc";

    if (!topicStats[topic]) {
      topicStats[topic] = {
        total: 0,
        correct: 0,
        wrong: 0,
        unattempted: 0,
        accuracy: 0,
        level: "",
      };
    }

    const t = topicStats[topic];
    t.total += 1;

    const isUnattempted =
      userAns == null || userAns === "" || userAns === undefined;
    const isCorrect = !isUnattempted && userAns === correctAns;

    if (isUnattempted) {
      t.unattempted += 1;
    } else if (isCorrect) {
      score++;
      correctCount++;
      t.correct += 1;
    } else {
      wrongCount++;
      t.wrong += 1;
    }

    const reviewItem = document.createElement("div");
    reviewItem.className = `review-item ${isCorrect ? "correct" : "wrong"}`;
    reviewItem.innerHTML = `
            <p><strong>Q${index + 1}:</strong> ${q.question || q.statement}</p>
            <div class="ans-row">
                <span class="${isCorrect ? "text-green" : "text-red"}">
                    Your Answer: ${userAns || "Not Attempted"}
                </span>
            </div>
            ${
              !isCorrect
                ? `<div class="ans-row"><span class="text-green">Correct Answer: ${correctAns}</span></div>`
                : ""
            }
            <div class="ans-row"><small class="text-muted">Topic: ${topic}</small></div>
            ${
              q.explanation
                ? `<div class="ans-row" style="margin-top:0.5rem; font-style:italic; font-size:0.9rem; color:#64748b;">💡 Explanation: ${q.explanation}</div>`
                : ""
            }
        `;
    reviewList.appendChild(reviewItem);
  });

  Object.keys(topicStats).forEach((topic) => {
    const t = topicStats[topic];
    t.accuracy = t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0;

    if (t.accuracy >= 80) {
      t.level = "Strong";
    } else if (t.accuracy >= 50) {
      t.level = "Needs Practice";
    } else {
      t.level = "Weak";
    }
  });

  document.getElementById("score-text").textContent = `${score}/${total}`;
  document.getElementById("stat-correct").textContent = correctCount;
  document.getElementById("stat-wrong").textContent = wrongCount;

  renderTopicStats(topicStats);

  app.showScreen("screen-result");

  if (window.MathJax) {
    MathJax.typesetPromise([document.getElementById("review-list")]);
  }

  saveAppState();
}

function renderTopicStats(topicStats) {
  const container = document.getElementById("topic-stats");
  if (!container) return;

  container.innerHTML = "";

  const topics = Object.keys(topicStats);
  if (topics.length === 0) {
    container.textContent = "No topic data available.";
    return;
  }

  topics.forEach((topic) => {
    const { total, correct, wrong, unattempted, accuracy, level } =
      topicStats[topic];

    let levelClass = "";
    if (level === "Strong") levelClass = "text-green";
    if (level === "Weak") levelClass = "text-red";

    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.alignItems = "center";
    row.style.padding = "0.5rem 0";
    row.style.borderBottom = "1px solid var(--border)";

    row.innerHTML = `
            <div>
                <strong>${topic}</strong>
                <div style="font-size:0.8rem; color:var(--text-muted);">
                    ${correct}/${total} correct,
                    ${wrong} wrong,
                    ${unattempted} unattempted
                </div>
            </div>
            <div style="text-align:right;">
                <div class="${levelClass}" style="font-weight:600;">${accuracy}%</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">${level}</div>
            </div>
        `;

    container.appendChild(row);
  });
}

// --- Theme Management ---
function initTheme() {
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
    document.body.setAttribute("data-theme", "dark");
    document.getElementById("sun-icon").classList.remove("hidden");
    document.getElementById("moon-icon").classList.add("hidden");
  } else {
    document.body.removeAttribute("data-theme");
    document.getElementById("sun-icon").classList.add("hidden");
    document.getElementById("moon-icon").classList.remove("hidden");
  }

  toggle.onclick = () => {
    const isDark = document.body.getAttribute("data-theme") === "dark";
    if (isDark) {
      document.body.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
      document.getElementById("sun-icon").classList.add("hidden");
      document.getElementById("moon-icon").classList.remove("hidden");
    } else {
      document.body.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
      document.getElementById("sun-icon").classList.remove("hidden");
      document.getElementById("moon-icon").classList.add("hidden");
    }
  };
}
// --- Router / reload handling ---
function restoreOrBoot() {
  const saved = loadSavedAppState();

  // Always build subjects, it's the root
  loadSubjects();

  if (!saved) {
    app.showScreen("screen-subjects", { skipHistory: true });
    return;
  }

  // Restore state object
  appState.subject = saved.subject || null;
  appState.year = saved.year || null;
  appState.subtopics = saved.subtopics || [];
  appState.questions = saved.questions || [];
  appState.currentQuestionIndex = saved.currentQuestionIndex || 0;
  appState.userAnswers = saved.userAnswers || {};
  appState.topicMap = saved.topicMap || null;
  appState.currentScreen = saved.currentScreen || "screen-subjects";

  // **ROBUST RESTORE LOGIC**

  // 1. If we have a subject saved, re-run selectSubject logic to populate Years Grid
  //    (This ensures the "Back" button works if we are deep in the app)
  if (appState.subject) {
    // We do this manually to avoid triggering the 'showScreen' inside selectSubject
    // which might conflict with where we actually want to go.
    // Re-setting the header:
    const title = appState.subject
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    document.getElementById("selected-subject-title").textContent = title;

    // Re-populating the grid:
    const years = QUIZ_TREE[appState.subject] || [];
    const grid = document.getElementById("year-grid");
    grid.innerHTML = "";
    years.forEach((year) => {
      const btn = document.createElement("div");
      btn.className = "card-btn";
      btn.textContent = year;
      btn.onclick = () => selectYear(appState.subject, `${year}.json`);
      grid.appendChild(btn);
    });
  }

  // 2. Decide which screen to actually show
  const screen = appState.currentScreen;

  if (screen === "screen-years") {
    app.showScreen("screen-years", { skipHistory: true });
  } else if (screen === "screen-subtopics") {
    if (appState.topicMap) {
      const subtopics = Object.keys(appState.topicMap);
      renderSubtopics(subtopics);
      app.showScreen("screen-subtopics", { skipHistory: true });
    } else {
      // Fallback if data missing
      app.showScreen("screen-subjects", { skipHistory: true });
    }
  } else if (screen === "screen-quiz") {
    if (appState.questions && appState.questions.length > 0) {
      // Determine if we also need to populate subtopics (for back button)
      if (appState.topicMap) {
        renderSubtopics(Object.keys(appState.topicMap));
      }
      app.showScreen("screen-quiz", { skipHistory: true });
      renderQuestion();
    } else {
      app.showScreen("screen-subjects", { skipHistory: true });
    }
  } else if (screen === "screen-result") {
    if (appState.questions && appState.questions.length > 0) {
      calculateResults();
    } else {
      app.showScreen("screen-subjects", { skipHistory: true });
    }
  } else {
    app.showScreen("screen-subjects", { skipHistory: true });
  }
}

function initRouter() {
  window.addEventListener("popstate", (event) => {
    const state = event.state;
    if (state && state.screenId) {
      const screenId = state.screenId;
      app.showScreen(screenId, {
        skipHistory: true,
      });

      if (screenId === "screen-quiz") {
        renderQuestion();
      } else if (screenId === "screen-result") {
        calculateResults();
      }
    } else {
      app.showScreen("screen-subjects", {
        skipHistory: true,
      });
    }
  });
}
// --- INITIALIZATION ---
initTheme();
restoreOrBoot();
initRouter();
