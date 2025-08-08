// ======= Data Setup ========

// Predefined moods and their palettes
// Each palette is crafted from specific shades to reflect the mood.
const moodPalettes = {
  Joy: [
    ["#FFD700", "#FFEE58", "#FFF9C4"], // Gold, Sunny Yellow, Light Amber
    ["#FBC02D", "#FFF176", "#FFFF8D"], // Lemon, Gold
  ],
  Passion: [
    ["#C62828", "#E53935", "#FFCDD2"], // Crimson, Scarlet, Rose
    ["#D32F2F", "#F44336", "#EF9A9A"], // Ruby, Red
  ],
  Serenity: [
    ["#0277BD", "#29B6F6", "#B3E5FC"], // Sky Blue, Cerulean
    ["#546E7A", "#78909C", "#B0BEC5"], // Slate, Steel Blue
  ],
  Balance: [
    ["#2E7D32", "#66BB6A", "#C8E6C9"], // Emerald, Moss Green
    ["#81C784", "#A5D6A7", "#E8F5E9"], // Sage, Mint
  ],
  Luxury: [
    ["#6A1B9A", "#9C27B0", "#CE93D8"], // Amethyst, Violet
    ["#4A148C", "#7B1FA2", "#E1BEE7"], // Deep Plum, Royal Purple
  ],
  Mystery: [
    ["#1A1A1A", "#333333", "#555555"], // Jet Black, Onyx
    ["#37474F", "#546E7A", "#78909C"], // Charcoal, Ebony
  ],
  Sophistication: [
    ["#9E9E9E", "#E0E0E0", "#FAFAFA"], // Cool Silver, Platinum
    ["#616161", "#BDBDBD", "#F5F5F5"], // Pewter, Ash
  ],
  Comfort: [
    ["#5D4037", "#8D6E63", "#D7CCC8"], // Chestnut, Coffee
    ["#795548", "#A1887F", "#D7CCC8"], // Walnut, Taupe
  ],
};

let currentMood = 'Joy';
let currentPaletteIndex = 0;
let currentPalette = moodPalettes[currentMood][currentPaletteIndex];

// Load from localStorage and filter out invalid entries to prevent errors
let favorites = (JSON.parse(localStorage.getItem("favorites")) || []).filter(
  p => Array.isArray(p) && p.length > 0
);
let historyArr = (JSON.parse(localStorage.getItem("history")) || []).filter(
  p => Array.isArray(p) && p.length > 0
);
let lastPalette = JSON.parse(localStorage.getItem("lastPalette"));

// ======= DOM Elements ========
const paletteDiv = document.querySelector("#palette");
const applyBtn = document.querySelector("#apply-btn");
const copyBtn = document.querySelector("#copy-btn");
const favoriteBtn = document.querySelector("#favorite-btn");
const moodSelect = document.querySelector("#mood-select");
const favoritesDiv = document.querySelector("#favorites");
const historyDiv = document.querySelector("#history");
const contrastBadge = document.querySelector("#contrast-badge");
const fetchBtn = document.querySelector("#fetch-btn");
const themeToggleBtn = document.querySelector("#theme-toggle-btn");

// ======= Helpers ========

// Render a palette array into the #palette div (big preview)
function renderPalette(palette) {
  // Add fade-out class to start fade out
  paletteDiv.classList.add('fade-out');

  // After fade-out duration, update content and fade in
  setTimeout(() => {
    paletteDiv.innerHTML = "";
    palette.forEach(color => {
      const div = document.createElement("div");
      div.className = "color-cell";
      div.style.backgroundColor = color;
      paletteDiv.appendChild(div);
    });

    paletteDiv.classList.remove('fade-out');
    paletteDiv.classList.add('fade-in');

    // Remove fade-in class after animation completes to reset
    setTimeout(() => {
      paletteDiv.classList.remove('fade-in');
    }, 500);

    updateContrastBadge(palette);
  }, 500);
}

// Render favorites section
function renderFavorites() {
  favoritesDiv.innerHTML = "";
  favorites.forEach((palette, idx) => {
    const mini = createMiniPalette(palette, idx, 'favorites');
    mini.title = "Click to apply favorite palette";
    mini.onclick = () => {
      applyPalette(palette);
    };
    favoritesDiv.appendChild(mini);
  });

  // Update favorite button style if current palette is favorited
  favoriteBtn.classList.toggle("active", isFavorited(currentPalette));
}

// Render history section
function renderHistory() {
  historyDiv.innerHTML = "";
  historyArr.forEach((palette, idx) => {
    const mini = createMiniPalette(palette, idx, 'history');
    mini.title = "Click to apply palette from history";
    mini.onclick = () => {
      applyPalette(palette);
    };
    historyDiv.appendChild(mini);
  });
}

// Creates a mini palette element for favorites/history
function createMiniPalette(palette, index, source) {
  const container = document.createElement("div");
  container.className = "palette-mini";

  // Add color cells
  palette.forEach(color => {
    const cell = document.createElement("div");
    cell.className = "color-cell";
    cell.style.backgroundColor = color;
    container.appendChild(cell);
  });

  // Add remove button
  const removeBtn = document.createElement("button");
  removeBtn.className = "remove-btn";
  removeBtn.innerHTML = "&times;"; // 'X' symbol
  removeBtn.title = `Remove from ${source}`;
  removeBtn.onclick = (e) => {
    e.stopPropagation(); // Prevent parent click event from firing
    if (source === 'favorites') {
      favorites.splice(index, 1);
      renderFavorites();
    } else if (source === 'history') {
      historyArr.splice(index, 1);
      renderHistory();
    }
    saveState();
  };
  container.appendChild(removeBtn);
  return container;
}

// Check if palette is favorited (by shallow array comparison)
function isFavorited(palette) {
  return favorites.some(fav => arraysEqual(fav, palette));
}

// Compare two arrays for equality
function arraysEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
}

// Save all palettes to localStorage
function saveState() {
  localStorage.setItem("favorites", JSON.stringify(favorites));
  localStorage.setItem("history", JSON.stringify(historyArr));
  localStorage.setItem("lastPalette", JSON.stringify(currentPalette));
}

// Set current palette and update UI
function setCurrentPalette(palette) {
  currentPalette = palette;
  renderPalette(palette);
  favoriteBtn.classList.toggle("active", isFavorited(palette));
}

// Apply palette as body background gradient & update history
function applyPalette(palette) {
  document.body.style.background = `linear-gradient(135deg, ${palette.join(", ")})`;

  // Add to history only if not the last one
  if (!historyArr.length || !arraysEqual(historyArr[historyArr.length - 1], palette)) {
    historyArr.push(palette);
    if (historyArr.length > 20) historyArr.shift(); // Limit history size
    renderHistory();
    saveState();
  }
  setCurrentPalette(palette);
}

// Copy colors to clipboard as comma-separated string
async function copyPaletteColors() {
  try {
    await navigator.clipboard.writeText(currentPalette.join(", "));
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy Colors"), 1200);
  } catch (err) {
    copyBtn.textContent = "Failed to copy";
    setTimeout(() => (copyBtn.textContent = "Copy Colors"), 1500);
  }
}

// Contrast checker: returns "Good" or "Poor" contrast based on WCAG brightness difference
function getContrastStatus(palette) {
  // We check contrast between text (white) and darkest color in palette for simplicity
  const luminance = hexLuminance(getDarkestColor(palette));
  // Contrast ratio simplified: (L1+0.05)/(L2+0.05)
  // For white (luminance=1): ratio = (1+0.05)/(luminance+0.05)
  const ratio = (1 + 0.05) / (luminance + 0.05);
  return ratio >= 4.5 ? "Good Contrast" : "Poor Contrast";
}

// Returns the darkest color hex from a palette (by luminance)
function getDarkestColor(palette) {
  let darkest = palette[0];
  let darkestLum = hexLuminance(darkest);
  for (let color of palette) {
    const lum = hexLuminance(color);
    if (lum < darkestLum) {
      darkestLum = lum;
      darkest = color;
    }
  }
  return darkest;
}

// Compute relative luminance for a hex color (#RRGGBB)
function hexLuminance(hex) {
  const rgb = hexToRgb(hex);
  const [r, g, b] = rgb.map(channelToLin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // Converts sRGB channel to linear value
  function channelToLin(c) {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
}

// Converts hex color code to RGB array
function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace(/^#/, "");
  if (hex.length === 3)
    hex = hex
      .split("")
      .map(x => x + x)
      .join(""); // expand shorthand (#abc => #aabbcc)
  const bigint = parseInt(hex, 16);
  return [bigint >> 16, (bigint >> 8) & 255, bigint & 255];
}

// Update contrast badge text and color
function updateContrastBadge(palette) {
  const status = getContrastStatus(palette);
  contrastBadge.textContent = status;
  contrastBadge.style.backgroundColor = status === "Good Contrast" ? "#27ae60" : "#c0392b";
  contrastBadge.style.color = "#fff";
}

// ======= Event Listeners ========

applyBtn.onclick = () => applyPalette(currentPalette);

copyBtn.onclick = copyPaletteColors;

favoriteBtn.onclick = () => {
  if (isFavorited(currentPalette)) {
    favorites = favorites.filter(fav => !arraysEqual(fav, currentPalette)); // remove
    favoriteBtn.classList.remove("active");
  } else {
    favorites.push([...currentPalette]);
    favoriteBtn.classList.add("active");
  }
  renderFavorites();
  saveState();
};

moodSelect.onchange = () => {
  currentMood = moodSelect.value;
  currentPaletteIndex = 0;
  // Get the first palette for the new mood
  const newPalette = moodPalettes[currentMood][currentPaletteIndex];
  // Apply it, which also handles rendering and all state updates
  applyPalette(newPalette);
};

function toggleTheme() {
  document.body.classList.toggle('light-theme');
  const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
  localStorage.setItem('theme', currentTheme);
  themeToggleBtn.textContent = currentTheme === 'light' ? '🌙' : '☀️';
  // Update the descriptive text in the header
  const subhead = document.querySelector('header p');
  subhead.innerHTML = currentTheme === 'light' 
    ? `<em>Discover and apply modern light palettes for any mood.</em>`
    : `<em>Discover and apply modern dark palettes for any mood.</em>`;
}

// Simulated fetch palettes button (you can add real API here later)
fetchBtn.onclick = async () => {
  try {
    fetchBtn.textContent = "Fetching...";
    fetchBtn.disabled = true; // Good practice to disable the button during a request

    // This URL now points to a relative path on the same server!
    const response = await fetch(`/api/palettes/${currentMood}`);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const newPalettes = await response.json();

    if (newPalettes.length > 0) {
      // Add the new palettes from the server to your app's data
      moodPalettes[currentMood].push(...newPalettes);
      
      // Display the first new palette you received
      currentPaletteIndex = moodPalettes[currentMood].length - newPalettes.length;
      setCurrentPalette(moodPalettes[currentMood][currentPaletteIndex]);
    } else {
      alert('No new palettes were found for this mood.');
    }

  } catch (err) {
    alert("Failed to fetch palettes. Is the backend server running?");
    console.error("Fetch error:", err);
  } finally {
    fetchBtn.textContent = "Fetch More Palettes";
    fetchBtn.disabled = false; // Re-enable the button
  }
};

themeToggleBtn.onclick = toggleTheme;

// ======= Initialization ========

function init() {
  // Load last palette from localStorage or default
  if (lastPalette && Array.isArray(lastPalette)) {
    currentPalette = lastPalette;
    // Try to set currentMood roughly
    for (let mood in moodPalettes) {
      if (moodPalettes[mood].some(pal => arraysEqual(pal, lastPalette))) {
        currentMood = mood;
        moodSelect.value = currentMood;
        break;
      }
    }
  } else {
    currentPalette = moodPalettes[currentMood][currentPaletteIndex];
  }

  // Load saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    themeToggleBtn.textContent = '🌙';
    const subhead = document.querySelector('header p');
    subhead.innerHTML = `<em>Discover and apply modern light palettes for any mood.</em>`;
  }

  renderFavorites();
  renderHistory();
  applyPalette(currentPalette);
  favoriteBtn.classList.toggle("active", isFavorited(currentPalette));
}

init();
