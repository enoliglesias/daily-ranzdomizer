(function () {
  const existing = document.getElementById("daily-randomizer-widget");
  if (existing) {
    existing.remove();
    return;
  }

  const widget = document.createElement("div");
  widget.id = "daily-randomizer-widget";
  widget.innerHTML = `
    <div class="dr-header">
      <span class="dr-title">Daily Randomizer</span>
      <button class="dr-toggle" type="button" title="Minimizar">−</button>
    </div>
    <div class="dr-body">
      <div class="dr-controls">
        <button class="dr-randomize" type="button">Randomizar participantes</button>
        <button class="dr-start" type="button" hidden>Empezar daily</button>
        <div class="dr-nav" hidden>
          <button class="dr-prev" type="button" title="Anterior">←</button>
          <span class="dr-progress"></span>
          <button class="dr-next" type="button" title="Siguiente">→</button>
        </div>
        <button class="dr-reset" type="button" hidden>Finalizar daily</button>
      </div>
      <p class="dr-status"></p>
      <ol class="dr-result"></ol>
    </div>
  `;
  document.body.appendChild(widget);

  const $ = (sel) => widget.querySelector(sel);
  const randomizeBtn = $(".dr-randomize");
  const startBtn = $(".dr-start");
  const prevBtn = $(".dr-prev");
  const nextBtn = $(".dr-next");
  const resetBtn = $(".dr-reset");
  const navEl = $(".dr-nav");
  const progressEl = $(".dr-progress");
  const toggleBtn = $(".dr-toggle");
  const header = $(".dr-header");
  const statusEl = $(".dr-status");
  const resultEl = $(".dr-result");

  // state: 'idle' | 'ready' | 'running'
  let state = "idle";
  let participants = [];
  let currentIndex = -1;

  randomizeBtn.addEventListener("click", () => {
    const names = extractParticipants();
    if (names.length === 0) {
      statusEl.textContent = "Abre el panel de participantes en Meet.";
      statusEl.classList.add("dr-error");
      return;
    }
    shuffle(names);
    participants = names;
    currentIndex = -1;
    state = "ready";
    render();
  });

  startBtn.addEventListener("click", () => {
    if (participants.length === 0) return;
    state = "running";
    currentIndex = 0;
    render();
  });

  nextBtn.addEventListener("click", () => {
    if (currentIndex < participants.length - 1) {
      currentIndex++;
      render();
    }
  });

  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      render();
    }
  });

  resetBtn.addEventListener("click", () => {
    state = "ready";
    currentIndex = -1;
    render();
  });

  toggleBtn.addEventListener("click", () => {
    const collapsed = widget.classList.toggle("dr-collapsed");
    toggleBtn.textContent = collapsed ? "+" : "−";
    toggleBtn.title = collapsed ? "Expandir" : "Minimizar";
  });

  enableDrag(widget, header, toggleBtn);

  function render() {
    statusEl.classList.remove("dr-error");
    resultEl.innerHTML = "";

    const showStart = state === "ready";
    const showNav = state === "running";
    startBtn.hidden = !showStart;
    navEl.hidden = !showNav;
    resetBtn.hidden = !showNav;

    if (state === "running") {
      const atEnd = currentIndex >= participants.length - 1;
      const atStart = currentIndex <= 0;
      prevBtn.disabled = atStart;
      nextBtn.disabled = atEnd;
      progressEl.textContent = `${currentIndex + 1} / ${participants.length}`;
      statusEl.textContent = atEnd
        ? "Última persona — daily completada"
        : `En curso (${currentIndex + 1} de ${participants.length})`;
    } else if (state === "ready") {
      statusEl.textContent = `Orden aleatorio (${participants.length} participantes):`;
    } else {
      statusEl.textContent = "";
    }

    participants.forEach((name, idx) => {
      const li = document.createElement("li");
      li.textContent = name;
      if (state === "running") {
        if (idx === currentIndex) li.classList.add("dr-active");
        else if (idx < currentIndex) li.classList.add("dr-done");
      }
      resultEl.appendChild(li);
    });

    const active = resultEl.querySelector(".dr-active");
    if (active) active.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function extractParticipants() {
    const lists = document.querySelectorAll("div[role='list']");
    const names = [];
    for (const list of lists) {
      for (const item of list.children) {
        const first = item.children[0];
        const text = first?.innerText?.trim();
        if (text) names.push(text);
      }
    }
    return names;
  }

  function shuffle(items) {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
  }

  function enableDrag(target, handle, ignoreEl) {
    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    handle.addEventListener("mousedown", (e) => {
      if (e.target === ignoreEl) return;
      dragging = true;
      const rect = target.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      target.style.left = `${e.clientX - offsetX}px`;
      target.style.top = `${e.clientY - offsetY}px`;
      target.style.right = "auto";
      target.style.bottom = "auto";
    });

    document.addEventListener("mouseup", () => {
      dragging = false;
    });
  }
})();
