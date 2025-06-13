const promptForm = document.querySelector(".prompt-form");
const themeToggle = document.querySelector(".theme-toggle");
const promptBtn = document.querySelector(".prompt-btn");
const promptInput = document.querySelector(".prompt-input");
const generateBtn = document.querySelector(".generate-btn");
const galleryGrid = document.querySelector(".gallery-grid");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");

const HUGGINGFACE_API_KEY = "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";
const HUGGINGFACE_MODEL = "black-forest-labs/FLUX.1-dev";


const examplePrompts = [
  "A magic forest with glowing plants and fairy homes among giant mushrooms",
  "An old steampunk airship floating through golden clouds at sunset",
  "A future Mars colony with glass domes and gardens against red mountains",
  "A dragon sleeping on gold coins in a crystal cave",
  "An underwater kingdom with merpeople and glowing coral buildings"
];

(() => {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = savedTheme === "dark" || (!savedTheme && prefersDark);
  document.body.classList.toggle("dark-theme", isDark);
  themeToggle.querySelector("i").className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
})();

const toggleTheme = () => {
  const isDark = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  themeToggle.querySelector("i").className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
};

const getImageDimensions = (aspectRatio, baseSize = 512) => {
  const [w, h] = aspectRatio.split("/").map(Number);
  const scale = baseSize / Math.sqrt(w * h);
  let width = Math.floor((w * scale) / 8) * 8;
  let height = Math.floor((h * scale) / 8) * 8;
  return { width, height };
};

const createImageCard = (id) => {
  const card = document.createElement("div");
  card.className = "img-card loading";
  card.id = id;
  card.innerHTML = `
    <div class="status-container">
      <div class="spinner"></div>
      <p>Generating image...</p>
    </div>
  `;
  galleryGrid.appendChild(card);
  return card;
};

const updateImageCard = (card, imageUrl) => {
  card.classList.remove("loading");
  card.innerHTML = `
    <img class="result-img" src="${imageUrl}" alt="Generated Image" loading="lazy" />
    <div class="img-overlay">
      <a class="img-download-btn" href="${imageUrl}" download title="Download Image">
        <i class="fa-solid fa-download"></i>
      </a>
    </div>
  `;
};

const generateImages = async (prompt, count, aspectRatio) => {
  const { width, height } = getImageDimensions(aspectRatio);

  for (let i = 0; i < count; i++) {
    const card = createImageCard(`img-${Date.now()}-${i}`);
    try {
      const response = await fetch(`https://api-inference.huggingface.co/models/${HUGGINGFACE_MODEL}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          options: { wait_for_model: true },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to generate image.");
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      updateImageCard(card, imageUrl);
    } catch (err) {
      card.innerHTML = `<p>Error: ${err.message}</p>`;
      console.error(err);
    }
  }
};

promptBtn.addEventListener("click", () => {
  promptInput.value = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
});

themeToggle.addEventListener("click", toggleTheme);

promptForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const prompt = promptInput.value.trim();
  const count = Number(countSelect.value);
  const ratio = ratioSelect.value;

  if (!prompt || !count || !ratio) {
    alert("Please fill all the fields.");
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = "Generating...";

  try {
    await generateImages(prompt, count, ratio);
  } catch (error) {
    alert("Error generating images: " + error.message);
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerHTML = `<i class="fa-solid fa-wand-sparkles"></i> Generate`;
  }
});
