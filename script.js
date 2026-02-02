const video = document.getElementById("video");
const videoInput = document.getElementById("videoInput");

const enInput = document.getElementById("en");
const phInput = document.getElementById("ph");
const esInput = document.getElementById("es");

const addBtn = document.getElementById("addLine");
const adjustBtn = document.getElementById("adjustBtn");
const lyricsBox = document.getElementById("lyrics");

let lyrics = [];
let currentSongKey = "";

// 🔧 Ajustes finos
const OFFSET = 0.9;       // adelanto general
const WORD_FALLBACK = 3;  // duración si es última línea

/* =========================
   SUBIR VIDEO
========================= */
videoInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  video.src = URL.createObjectURL(file);
  video.load();

  currentSongKey = "lyrics_" + file.name;

  const saved = localStorage.getItem(currentSongKey);
  lyrics = saved ? JSON.parse(saved) : [];

  renderLyrics();
});

/* =========================
   AGREGAR LÍNEA
========================= */
addBtn.addEventListener("click", () => {
  if (!video.src) {
    alert("Sube un video primero");
    return;
  }

  if (!enInput.value.trim()) return;

  const line = {
    time: video.currentTime,
    en: enInput.value,
    ph: phInput.value,
    es: esInput.value
  };

  lyrics.push(line);
  lyrics.sort((a, b) => a.time - b.time);

  localStorage.setItem(currentSongKey, JSON.stringify(lyrics));

  enInput.value = "";
  phInput.value = "";
  esInput.value = "";

  renderLyrics();
});

/* =========================
   AJUSTAR TODAS LAS LÍNEAS
========================= */
adjustBtn.addEventListener("click", () => {
  if (!lyrics.length) return;

  const ADJUST = 0.5;

  lyrics = lyrics.map(l => ({
    ...l,
    time: Math.max(0, l.time - ADJUST)
  }));

  localStorage.setItem(currentSongKey, JSON.stringify(lyrics));
  renderLyrics();

  alert("✅ Letras ajustadas");
});

/* =========================
   RENDER DE LETRAS
========================= */
function renderLyrics(activeIndex = -1) {
  lyricsBox.innerHTML = "";

  lyrics.forEach((l, i) => {
    const div = document.createElement("div");
    div.className = "line" + (i === activeIndex ? " active" : "");

    /* ===== INGLÉS palabra por palabra ===== */
    const englishDiv = document.createElement("div");
    englishDiv.className = "english";

    const words = l.en.split(" ");
    const start = l.time;
    const end = lyrics[i + 1] ? lyrics[i + 1].time : start + WORD_FALLBACK;
    const step = (end - start) / words.length;

    words.forEach((w, idx) => {
      const span = document.createElement("span");
      span.className = "word";
      span.dataset.time = (start + step * idx).toFixed(2);
      span.textContent = w + " ";
      englishDiv.appendChild(span);
    });

    div.appendChild(englishDiv);

    /* ===== Fonética ===== */
    const ph = document.createElement("div");
    ph.className = "phonetic";
    ph.textContent = l.ph;
    div.appendChild(ph);

    /* ===== Español ===== */
    const es = document.createElement("div");
    es.className = "spanish";
    es.textContent = l.es;
    div.appendChild(es);

    lyricsBox.appendChild(div);

    // auto-scroll a la línea activa
    if (i === activeIndex) {
      setTimeout(() => {
        div.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }, 50);
    }
  });
}

/* =========================
   SINCRONIZACIÓN
========================= */
video.addEventListener("timeupdate", () => {
  if (!lyrics.length) return;

  const current = video.currentTime + OFFSET;
  let activeIndex = -1;

  for (let i = 0; i < lyrics.length; i++) {
    if (current >= lyrics[i].time) {
      activeIndex = i;
    } else break;
  }

  renderLyrics(activeIndex);

  // Karaoke palabra por palabra
  document.querySelectorAll(".word").forEach(word => {
    const wt = parseFloat(word.dataset.time);
    if (current >= wt) {
      word.classList.add("active");
    } else {
      word.classList.remove("active");
    }
  });
});


const toggleBtn = document.getElementById("toggleEditor");
const editor = document.getElementById("editor");

toggleBtn.addEventListener("click", () => {
  editor.classList.toggle("hidden");

  toggleBtn.textContent = editor.classList.contains("hidden")
    ? "✏️ Editar"
    : "👁️ Ver";
});
