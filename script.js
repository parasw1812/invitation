(() => {
  "use strict";

  const experience = document.getElementById("experience");
  const openBtn = document.getElementById("openBtn");
  const replayBtn = document.getElementById("replayBtn");
  const resetBtn = document.getElementById("resetScratchBtn");

  const canvas = document.getElementById("scratchCanvas");
  const scratchCard = document.getElementById("miniScratch");
  const hint = document.getElementById("scratchHint");
  const sparkleHolder = document.getElementById("sparkles");

  if (!experience || !openBtn || !canvas || !scratchCard) {
    console.error("Invitation setup: required HTML elements were not found.");
    return;
  }

  const ctx = canvas.getContext("2d", {
    willReadFrequently: true
  });

  let drawing = false;
  let revealed = false;
  let lastCheck = 0;

  // Draw the golden scratch coating
  function drawCover(width, height) {
    ctx.globalCompositeOperation = "source-over";

    const gradient = ctx.createLinearGradient(
      0, 0, width, height
    );

    gradient.addColorStop(0, "#57344f");
    gradient.addColorStop(0.38, "#a4778d");
    gradient.addColorStop(0.72, "#754d70");
    gradient.addColorStop(1, "#3c2847");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Gold foil texture
    for (let i = 0; i < 115; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 1.1 + 0.25;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);

      ctx.fillStyle = "rgba(255, 226, 170, 0.65)";
      ctx.fill();
    }

    // Decorative border
    ctx.strokeStyle = "rgba(255, 225, 170, 0.8)";
    ctx.lineWidth = 1;

    ctx.strokeRect(
      5,
      5,
      width - 10,
      height - 10
    );

    ctx.globalCompositeOperation = "source-over";
  }

  // Set canvas size correctly
  function resizeCanvas() {
    if (revealed) return;

    const rect = canvas.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    const dpr = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    drawCover(rect.width, rect.height);
  }

  // Get mouse or touch position
  function getPosition(event) {
    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  // Scratch interaction
  function scratch(event) {
    if (!drawing || revealed) return;

    const { x, y } = getPosition(event);

    ctx.globalCompositeOperation = "destination-out";

    ctx.beginPath();
    ctx.arc(x, y, 13, 0, Math.PI * 2);
    ctx.fill();

    const now = performance.now();

    if (now - lastCheck > 250) {
      lastCheck = now;
      checkProgress();
    }
  }

  // Check how much of the coating has been removed
  function checkProgress() {
    const pixels = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    ).data;

    let transparent = 0;
    let total = 0;

    for (let i = 3; i < pixels.length; i += 32) {
      total++;

      if (pixels[i] < 80) {
        transparent++;
      }
    }

    if (total && transparent / total > 0.32) {
      revealMessage();
    }
  }

  // Reveal the invitation message
  function revealMessage() {
    if (revealed) return;

    revealed = true;
    drawing = false;

    scratchCard.classList.add("revealed");

    hint?.setAttribute("aria-hidden", "true");

    createSparkles(22);
  }

  // Create floating golden particles
  function createSparkles(amount) {
    if (!sparkleHolder) return;

    for (let i = 0; i < amount; i++) {
      const sparkle = document.createElement("i");

      sparkle.className = "spark";

      sparkle.style.left =
        `${8 + Math.random() * 84}%`;

      sparkle.style.top =
        `${35 + Math.random() * 55}%`;

      sparkle.style.animationDelay =
        `${Math.random() * 0.8}s`;

      sparkleHolder.appendChild(sparkle);

      window.setTimeout(() => {
        sparkle.remove();
      }, 4200);
    }
  }

  // Open the invitation
  function openInvitation() {
    if (experience.classList.contains("open")) return;

    experience.classList.add("open");

    createSparkles(34);
  }

  // Reset only the scratch card
  function resetScratch() {
    revealed = false;
    drawing = false;

    scratchCard.classList.remove("revealed");

    hint?.removeAttribute("aria-hidden");

    resizeCanvas();
  }

  // Mouse and mobile touch support
  canvas.addEventListener("pointerdown", event => {
    if (!experience.classList.contains("open") || revealed) {
      return;
    }

    drawing = true;

    if (canvas.setPointerCapture) {
      canvas.setPointerCapture(event.pointerId);
    }

    scratch(event);
  });

  canvas.addEventListener("pointermove", scratch);

  canvas.addEventListener("pointerup", () => {
    drawing = false;
  });

  canvas.addEventListener("pointercancel", () => {
    drawing = false;
  });

  canvas.addEventListener("lostpointercapture", () => {
    drawing = false;
  });

  // Open button
  openBtn.addEventListener("click", openInvitation);

  // Reset scratch button
  resetBtn?.addEventListener("click", resetScratch);

  // Replay complete invitation
  replayBtn?.addEventListener("click", () => {
    experience.classList.remove("open");

    resetScratch();

    sparkleHolder?.replaceChildren();
  });

  // Handle browser resizing
  window.addEventListener("resize", resizeCanvas);

  // Initialize canvas after page layout
  window.requestAnimationFrame(resizeCanvas);

})();