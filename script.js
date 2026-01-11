/**
 * CDS PYQ Quiz Platform
 * Customized for cds-pyq-json data structure
 * Fixed: Variable hoisting, Error Handling, and Robust Initialization
 */

(function () {
  // Wrap in IIFE to avoid global scope pollution
  try {
    const REPO_OWNER = "deepak-gurjar07";
    const REPO_NAME = "cds-pyq-json";
    const BRANCH = "main";

    // --- Random GK Cache ---
    const GK_CACHE = {};
    const CACHE_PREFIX = "cds-gk-cache-v2";

    // --- CONFIGURATION: SUBJECTS FOR RANDOM QUIZ (Moved to top) ---
    const GK_SUBJECTS = [
      "Biology",
      "Chemistry",
      "Economy",
      "General_Knowledge",
      "Geography",
      "History",
      "Physics",
    ];

    // --- CONFIGURATION: FILE MAPPING ---
    const QUIZ_TREE = {
      Biology: [
        "2007-I", "2007-II", "2008-I", "2008-II", "2009-I", "2009-II", "2010-I", "2010-II",
        "2011-I", "2011-II", "2013-II", "2014-I", "2014-II", "2015-I", "2015-II",
        "2016-I", "2016-II", "2017-I", "2017-II", "2018-I", "2018-II", "2019-I", "2019-II",
        "2020-I", "Unknown-I"
      ],
      Chemistry: [
        "2007-II", "2008-I", "2008-II", "2009-I", "2009-II", "2010-I", "2010-II",
        "2011-I", "2011-II", "2012-I", "2012-II", "2013-I", "2013-II", "2014-II",
        "2015-I", "2015-II", "2016-I", "2016-II", "2017-I", "2017-II", "2018-I", "2018-II",
        "2019-I", "2019-II", "2020-I", "Unknown-I"
      ],
      Economy: ["2016-II", "Unknown-I"],
      General_Knowledge: [
        "2007-II", "2008-I", "2008-II", "2011-II", "2012-I", "2012-II", "2013-I", "2013-II",
        "2014-I", "2014-II", "2015-I", "2015-II", "2016-I", "2016-II", "2017-I",
        "2018-I", "2018-II", "2019-I", "2019-II", "2020-I", "Unknown-I"
      ],
      Geography: [
        "2007-I", "2007-II", "2008-I", "2008-II", "2009-I", "2009-II", "2010-I", "2010-II",
        "2011-I", "2011-II", "2012-I", "2012-II", "2013-I", "2013-II", "2014-I", "2014-II",
        "2015-I", "2015-II", "2016-I", "2016-II", "2017-I", "Unknown-I", "unknown-II"
      ],
      History: [
        "2007-II", "2008-I", "2008-II", "2009-I", "2009-II", "2010-I", "2010-II",
        "2011-I", "2011-II", "2012-I", "2012-II", "2013-I", "2013-II", "2014-I", "2014-II",
        "2015-I", "2015-II", "2016-I", "2016-II", "2017-I", "Unknown-I"
      ],
      Miscellaneous: ["Unknown-I"],
      Physics: [
        "2007-II", "2008-II", "2009-I", "2009-II", "2010-I", "2010-II", "2011-I", "2011-II",
        "2013-II", "2014-I", "2014-II", "2015-I", "2015-II", "2016-I", "2016-II",
        "2017-I", "2017-II", "Unknown-I"
      ]
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
      _resultsComputed: false,
      negativeMarking: true,
    };

    const APP_STATE_STORAGE_KEY = "cdsQuizStateV3"; // Force fresh state

    // --- DOM Elements ---
    const screens = {
      subjects: document.getElementById("screen-subjects"),
      random: document.getElementById("screen-random-config"),
      years: document.getElementById("screen-years"),
      subtopics: document.getElementById("screen-subtopics"),
      quiz: document.getElementById("screen-quiz"),
      result: document.getElementById("screen-result"),
      loader: document.getElementById("loader"),
      error: document.getElementById("error-screen"),
    };

    // --- Helpers ---
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
        console.warn("Failed to save state", err);
      }
    }

    function loadSavedAppState() {
      try {
        const raw = localStorage.getItem(APP_STATE_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    }

    function clearSavedAppState() {
      try {
        localStorage.removeItem(APP_STATE_STORAGE_KEY);
      } catch {}
    }

    // --- Navigation ---
    const app = {
      showScreen: (screenId, options = {}) => {
        // 1. Hide all first
        Object.values(screens).forEach((s) => {
          if (s) {
            s.classList.remove("active");
            s.classList.add("hidden");
          }
        });

        // 2. Show target
        const el = document.getElementById(screenId);
        if (el) {
          el.classList.remove("hidden");
          el.classList.add("active");
        } else {
          console.error(`Screen ID not found: ${screenId}`);
          return;
        }

        appState.currentScreen = screenId;

        if (!options.skipHistory) {
          try {
            history.pushState({ screenId }, "", "#" + screenId);
          } catch (_) {}
        }
        appState._resultsComputed = true;
        saveAppState();
      },

      showLoader: (msg = "Loading...") => {
        const txt = document.getElementById("loader-text");
        if (txt) txt.textContent = msg;

        Object.values(screens).forEach((s) => {
          if (s) {
            s.classList.remove("active");
            s.classList.add("hidden");
          }
        });

        if (screens.loader) {
          screens.loader.classList.remove("hidden");
          screens.loader.classList.add("active");
        }
      },

      showError: (msg) => {
        const txt = document.getElementById("error-message");
        if (txt) txt.textContent = msg;

        Object.values(screens).forEach((s) => {
          if (s) s.classList.add("hidden");
        });

        if (screens.error) {
          screens.error.classList.remove("hidden");
          screens.error.classList.add("active");
        }
      },

      goBack: () => {
        const s = appState.currentScreen;
        if (s === "screen-years") app.showScreen("screen-subjects");
        else if (s === "screen-subtopics") app.showScreen("screen-years");
        else if (s === "screen-quiz") app.showScreen("screen-subtopics");
        else if (s === "screen-result") app.showScreen("screen-subjects");
        else if (s === "screen-random-config") app.showScreen("screen-subjects");
        else app.showScreen("screen-subjects");
      },

      goHome: () => {
        if (confirm("Return to Home? Progress will be lost.")) {
          clearSavedAppState();
          app.showScreen("screen-subjects");
        }
      },

      quitQuiz: () => {
        if (confirm("Quit quiz? Progress will be lost.")) {
          app.showScreen("screen-subtopics");
        }
      },
    };

    // --- Logic: Load Subjects ---
    function loadSubjects() {
      const grid = document.getElementById("subject-grid");
      if (!grid) return;
      grid.innerHTML = "";

      const subjects = Object.keys(QUIZ_TREE);

      subjects.forEach((subName) => {
        const displayName = subName.replace(/_/g, " ");
        const btn = document.createElement("div");
        btn.className = "card-btn";
        btn.textContent = displayName;
        btn.onclick = () => selectSubject(subName);
        grid.appendChild(btn);
      });
    }

    // --- Logic: Load Years ---
    function selectSubject(subjectName) {
      appState.subject = subjectName;
      const titleEl = document.getElementById("selected-subject-title");
      if (titleEl) titleEl.textContent = subjectName.replace(/_/g, " ");

      const years = QUIZ_TREE[subjectName] || [];
      const grid = document.getElementById("year-grid");
      if (grid) {
        grid.innerHTML = "";
        if (years.length === 0) {
          grid.innerHTML = "<p>No papers found.</p>";
        } else {
          years.forEach((year) => {
            const btn = document.createElement("div");
            btn.className = "card-btn";
            btn.textContent = year;
            btn.onclick = () => selectYear(subjectName, `${year}.json`);
            grid.appendChild(btn);
          });
        }
      }
      app.showScreen("screen-years");
    }

    // --- Logic: Fetch & Parse ---
    async function selectYear(subject, filename) {
      const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${subject}/${filename}`;
      appState.year = filename.replace(".json", "");
      app.showLoader("Fetching Questions...");

      try {
        const res = await fetch(rawUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        let finalMap = {};
        if (json.subtopics) finalMap = json.subtopics;
        else if (json.topics) finalMap = json.topics;
        else {
          Object.keys(json).forEach((key) => {
            if (Array.isArray(json[key])) finalMap[key] = json[key];
          });
        }

        appState.topicMap = finalMap;
        renderSubtopics(Object.keys(finalMap));
        app.showScreen("screen-subtopics");
      } catch (err) {
        console.error(err);
        app.showError("Failed to load questions. Check internet or file URL.");
      }
    }

    // --- Logic: Random Quiz ---
    function loadRandomGKSubjects() {
      const container = document.getElementById("random-subjects");
      if (!container || container.children.length > 0) return;
      container.innerHTML = "";

      GK_SUBJECTS.forEach((subject) => {
        const label = document.createElement("label");
        label.className = "checkbox-item";
        label.innerHTML = `
          <input type="checkbox" value="${subject}" checked>
          <span>${subject.replace(/_/g, " ")}</span>
        `;
        container.appendChild(label);
      });
    }

    async function buildRandomGKQuiz() {
      const checkedBoxes = document.querySelectorAll(
        "#random-subjects input:checked"
      );
      const selectedSubjects = Array.from(checkedBoxes).map((cb) => cb.value);

      if (selectedSubjects.length === 0) {
        alert("Select at least one subject.");
        return;
      }

      let count = parseInt(document.getElementById("random-q-count").value);
      if (!count || count < 5) count = 20;

      const negToggle = document.getElementById("neg-marking-toggle");
      appState.negativeMarking = negToggle ? negToggle.checked : true;

      app.showLoader("Building Random Quiz...");

      let allQuestions = [];

      for (const subject of selectedSubjects) {
        updateLoaderText(`Loading ${subject}...`);
        const years = QUIZ_TREE[subject] || [];

        for (const year of years) {
          try {
            let map = getCachedGK(subject, year);
            if (!map) {
              const url = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${subject}/${year}.json`;
              const res = await fetch(url);
              const json = await res.json();
              map = json.subtopics || json.topics || json;
              setCachedGK(subject, year, map);
            }

            Object.entries(map).forEach(([topic, qArr]) => {
              if (Array.isArray(qArr)) {
                qArr.forEach((q) => {
                  allQuestions.push({ ...q, _subject: subject, _topic: topic });
                });
              }
            });
          } catch (e) {
            console.warn(`Skip ${subject} ${year}`);
          }
        }
      }

      updateLoaderText("Finalizing...");
      allQuestions.sort(() => Math.random() - 0.5);
      const finalQ = pickRandomQuestions(allQuestions, count);

      if (finalQ.length === 0) {
        app.showError("No questions available.");
        return;
      }

      startQuizEngine(finalQ);
    }

    function pickRandomQuestions(allQ, limit) {
      const result = [];
      // Simple random pick
      while (result.length < limit && allQ.length > 0) {
        const idx = Math.floor(Math.random() * allQ.length);
        result.push(allQ.splice(idx, 1)[0]);
      }
      return result;
    }

    function updateLoaderText(msg) {
      const el = document.getElementById("loader-text");
      if (el) el.textContent = msg;
    }

    // --- Subtopics ---
    function renderSubtopics(topics) {
      const list = document.getElementById("subtopic-list");
      if (!list) return;
      list.innerHTML = "";

      if (topics.length === 0) {
        list.innerHTML = "<p>No subtopics found.</p>";
        return;
      }

      topics.forEach((t) => {
        const count = appState.topicMap[t] ? appState.topicMap[t].length : 0;
        if (count === 0) return;
        const lbl = document.createElement("label");
        lbl.className = "checkbox-item";
        lbl.innerHTML = `<input type="checkbox" value="${t}" checked> <span>${t} <small>(${count})</small></span>`;
        list.appendChild(lbl);
      });

      const startBtn = document.getElementById("btn-start-quiz");
      if (startBtn) startBtn.onclick = generateQuizFromSelection;
    }

    function generateQuizFromSelection() {
      const checked = document.querySelectorAll("#subtopic-list input:checked");
      const topics = Array.from(checked).map((cb) => cb.value);
      if (topics.length === 0) {
        alert("Select a topic.");
        return;
      }
      let quizQ = [];
      topics.forEach((t) => {
        const arr = appState.topicMap[t];
        if (arr) quizQ = [...quizQ, ...arr.map((q) => ({ ...q, _topic: t }))];
      });
      startQuizEngine(quizQ);
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
      const q = appState.questions[appState.currentQuestionIndex];
      if (!q) return;

      const curr = appState.currentQuestionIndex + 1;
      const total = appState.questions.length;

      document.getElementById("q-progress").textContent = `${curr} / ${total}`;
      document.getElementById("progress-fill").style.width = `${
        (curr / total) * 100
      }%`;

      document.getElementById("q-text").innerHTML = `${curr}. ${
        q.question || q.statement || "No text"
      }`;

      const optsDiv = document.getElementById("q-options");
      optsDiv.innerHTML = "";

      let opts = q.options || q.choices || [];
      if (!Array.isArray(opts) && typeof opts === "object")
        opts = Object.values(opts);

      opts.forEach((opt) => {
        const lbl = document.createElement("label");
        lbl.className = "option-label";
        if (appState.userAnswers[appState.currentQuestionIndex] === opt) {
          lbl.classList.add("selected");
        }
        lbl.innerHTML = `<input type="radio" class="hidden"> <span>${opt}</span>`;
        lbl.onclick = () => {
          appState.userAnswers[appState.currentQuestionIndex] = opt;
          renderQuestion();
        };
        optsDiv.appendChild(lbl);
      });

      // Buttons
      const prev = document.getElementById("btn-prev");
      const next = document.getElementById("btn-next");
      const submit = document.getElementById("btn-submit");
      const clear = document.getElementById("btn-clear");

      if (appState.userAnswers[appState.currentQuestionIndex])
        clear.classList.remove("hidden");
      else clear.classList.add("hidden");

      clear.onclick = () => {
        delete appState.userAnswers[appState.currentQuestionIndex];
        renderQuestion();
      };

      if (curr === 1) prev.classList.add("hidden");
      else prev.classList.remove("hidden");

      if (curr === total) {
        next.classList.add("hidden");
        submit.classList.remove("hidden");
      } else {
        next.classList.remove("hidden");
        submit.classList.add("hidden");
      }

      prev.onclick = () => {
        appState.currentQuestionIndex--;
        renderQuestion();
      };
      next.onclick = () => {
        appState.currentQuestionIndex++;
        renderQuestion();
      };
      submit.onclick = calculateResults;

      if (window.MathJax) MathJax.typesetPromise();
      saveAppState();
    }

    function calculateResults() {
      let score = 0,
        correct = 0,
        wrong = 0;
      const reviewDiv = document.getElementById("review-list");
      reviewDiv.innerHTML = "";
      const stats = {};

      appState.questions.forEach((q, idx) => {
        const uAns = appState.userAnswers[idx];
        const cAns = q.answer;
        const topic = q._topic || "General";

        if (!stats[topic])
          stats[topic] = { total: 0, correct: 0, wrong: 0, unattempted: 0 };
        stats[topic].total++;

        const isCorrect = uAns === cAns;
        const isUnattempted = !uAns;

        if (isCorrect) {
          score++;
          correct++;
          stats[topic].correct++;
        } else if (!isUnattempted) {
          wrong++;
          stats[topic].wrong++;
          if (appState.negativeMarking) score -= 0.33;
        } else {
          stats[topic].unattempted++;
        }

        const div = document.createElement("div");
        div.className = `review-item ${isCorrect ? "correct" : "wrong"}`;
        div.innerHTML = `
          <p><strong>Q${idx + 1}:</strong> ${q.question || q.statement}</p>
          <div class="ans-row">
             <span class="${isCorrect ? "text-green" : "text-red"}">Your: ${
          uAns || "Skipped"
        }</span>
          </div>
          ${
            !isCorrect
              ? `<div class="ans-row"><span class="text-green">Correct: ${cAns}</span></div>`
              : ""
          }
          <div class="ans-row"><small>${topic}</small></div>
        `;
        reviewDiv.appendChild(div);
      });

      document.getElementById("score-text").textContent = Math.max(
        0,
        score
      ).toFixed(2);
      document.getElementById("stat-correct").textContent = correct;
      document.getElementById("stat-wrong").textContent = wrong;

      const statDiv = document.getElementById("topic-stats");
      statDiv.innerHTML = "";
      Object.keys(stats).forEach((t) => {
        const s = stats[t];
        const acc = s.total ? Math.round((s.correct / s.total) * 100) : 0;
        const row = document.createElement("div");
        row.style =
          "display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:5px 0";
        row.innerHTML = `<div><strong>${t}</strong><br><small>${s.correct}/${s.total}</small></div> <strong>${acc}%</strong>`;
        statDiv.appendChild(row);
      });

      app.showScreen("screen-result");
    }

    // --- Cache ---
    function getCachedGK(sub, yr) {
      const key = `${sub}-${yr}`;
      if (GK_CACHE[key]) return GK_CACHE[key];
      const local = localStorage.getItem(`${CACHE_PREFIX}-${key}`);
      return local ? JSON.parse(local) : null;
    }
    function setCachedGK(sub, yr, data) {
      const key = `${sub}-${yr}`;
      GK_CACHE[key] = data;
      try {
        localStorage.setItem(`${CACHE_PREFIX}-${key}`, JSON.stringify(data));
      } catch {}
    }

    // --- Init ---
    function initTheme() {
      const t = localStorage.getItem("theme");
      if (t === "dark") document.body.setAttribute("data-theme", "dark");
      const btn = document.getElementById("theme-toggle");
      if (btn) {
        btn.onclick = () => {
          if (document.body.getAttribute("data-theme") === "dark") {
            document.body.removeAttribute("data-theme");
            localStorage.setItem("theme", "light");
          } else {
            document.body.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
          }
        };
      }
    }

    function init() {
      initTheme();

      // Hook up static buttons
      const randBtn = document.getElementById("random-quiz-btn");
      if (randBtn) {
        randBtn.onclick = () => {
          app.showScreen("screen-random-config");
          loadRandomGKSubjects();
        };
      }

      const startRand = document.getElementById("start-random");
      if (startRand) startRand.onclick = buildRandomGKQuiz;

      // Global Expose for Header
      window.app = app;

      // Boot
      const saved = loadSavedAppState();
      loadSubjects(); // Ensure grid is populated

      if (saved && saved.currentScreen) {
        // Restore minimal state
        appState.subject = saved.subject;
        appState.year = saved.year;
        appState.subtopics = saved.subtopics;
        appState.questions = saved.questions;
        appState.currentQuestionIndex = saved.currentQuestionIndex;
        appState.userAnswers = saved.userAnswers;
        appState.topicMap = saved.topicMap;

        // Route
        if (saved.currentScreen === "screen-subjects") {
          app.showScreen("screen-subjects");
        } else {
          // If deep linked, show screen.
          // Note: If topicMap is missing (cleared cache), might fail. Safe fallback:
          if (
            (saved.currentScreen === "screen-quiz" ||
              saved.currentScreen === "screen-subtopics") &&
            !appState.topicMap
          ) {
            app.showScreen("screen-subjects");
          } else {
            app.showScreen(saved.currentScreen);
            if (saved.currentScreen === "screen-quiz") renderQuestion();
          }
        }
      } else {
        app.showScreen("screen-subjects");
      }
    }

    // Run Init
    init();
  } catch (criticalError) {
    alert("Critical Script Error: " + criticalError.message);
    console.error(criticalError);
  }
})();
