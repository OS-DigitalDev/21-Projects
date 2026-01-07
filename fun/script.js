/* ===============================
   GLOBAL STATE
================================ */

let drawMode = "pen";        // pen | eraser | shape
let currentShape = "rectangle";
let isDrawing = false;

let startX = 0;
let startY = 0;
let snapshot = null;

/* ===============================
   COLOR + OPACITY
================================ */

const colorArea = document.querySelector(".color-area");
const colorCursor = document.querySelector(".color-cursor");
const colorPreview = document.querySelector(".color-preview");
const alphaSlider = document.querySelector(".alpha-slider");
const alphaValue = document.querySelector(".alpha-value");

document.documentElement.style.setProperty("--active-alpha", 1);
document.documentElement.style.setProperty("--active-color", "hsl(0,100%,50%)");

alphaSlider.addEventListener("input", () => {
  const alpha = alphaSlider.value / 100;
  document.documentElement.style.setProperty("--active-alpha", alpha);
  alphaValue.textContent = `${alphaSlider.value}%`;
});

/* ===============================
   HUE PICKER
================================ */

const hueSlider = document.querySelector(".hue-slider");
const hueCursor = document.querySelector(".hue-cursor");

let pickingHue = false;

function pickHue(e) {
  const rect = hueSlider.getBoundingClientRect();
  let y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
  hueCursor.style.top = `${y}px`;

  const hue = Math.round((y / rect.height) * 360);
  document.documentElement.style.setProperty(
    "--picker-hue",
    `hsl(${hue},100%,50%)`
  );
}

hueSlider.addEventListener("mousedown", (e) => {
  pickingHue = true;
  pickHue(e);
});

document.addEventListener("mousemove", (e) => {
  if (pickingHue) pickHue(e);
});

document.addEventListener("mouseup", () => {
  pickingHue = false;
});

/* ===============================
   COLOR AREA PICKER (HSV-ish)
================================ */

function getHueNumber() {
  const hsl = getComputedStyle(document.documentElement)
    .getPropertyValue("--picker-hue");
  return parseInt(hsl.match(/\d+/)[0], 10);
}

function pickColor(e) {
  const rect = colorArea.getBoundingClientRect();

  let x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
  let y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

  colorCursor.style.left = `${x}px`;
  colorCursor.style.top = `${y}px`;

  const saturation = (x / rect.width) * 100;
  const lightness = 100 - (y / rect.height) * 50;
  const hue = getHueNumber();

  const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

  document.documentElement.style.setProperty("--active-color", color);
  colorPreview.style.backgroundColor = color;
}

let pickingColor = false;

colorArea.addEventListener("mousedown", (e) => {
  pickingColor = true;
  pickColor(e);
});

document.addEventListener("mousemove", (e) => {
  if (pickingColor) pickColor(e);
});

document.addEventListener("mouseup", () => {
  pickingColor = false;
});

/* ===============================
   COLOR SWATCHES
================================ */

document.querySelectorAll(".color-swatch").forEach((swatch) => {
  swatch.addEventListener("click", () => {
    document.querySelectorAll(".color-swatch")
      .forEach(s => s.classList.remove("active"));

    swatch.classList.add("active");

    const color = getComputedStyle(swatch)
      .getPropertyValue("--swatch-color");

    document.documentElement.style.setProperty("--active-color", color);
    colorPreview.style.backgroundColor = color;
  });
});

/* ===============================
   CANVAS SETUP
================================ */

const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 500;

function initCanvasBackground() {
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

initCanvasBackground();

/* ===============================
   TOOL BUTTONS
================================ */

document.querySelectorAll(".tool-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tool-btn")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    const tool = btn.dataset.tool;

    if (tool === "pen" || tool === "eraser" || tool === "bucket") {
      drawMode = tool;
    } else {
      drawMode = "shape";
      currentShape = tool;
    }
  });
});

/* ===============================
   STYLE HELPERS
================================ */

function applyStrokeStyle() {
  const color = getComputedStyle(document.documentElement)
    .getPropertyValue("--active-color");

  const alpha = parseFloat(
    getComputedStyle(document.documentElement)
      .getPropertyValue("--active-alpha")
  );

  ctx.strokeStyle = color;
  ctx.fillStyle = color; 
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
}

function applyShapeStyle() {
  applyStrokeStyle();
  ctx.lineWidth = 2;
}

/* ===============================
   DRAWING PIPELINE
================================ */

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  startX = e.offsetX;
  startY = e.offsetY;

  if (drawMode === "bucket") {
  const x = Math.floor(e.offsetX);
  const y = Math.floor(e.offsetY);
  bucketFill(x, y);
  return;
}


  if (drawMode === "pen" || drawMode === "eraser") {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
  }

  if (drawMode === "shape") {
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;

  const x = e.offsetX;
  const y = e.offsetY;

  if (drawMode === "pen") {
    applyStrokeStyle();
    ctx.lineTo(x, y);
    ctx.stroke();
    return;
  }

  if (drawMode === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 20;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
    return;
  }

  if (drawMode === "shape") {
    ctx.putImageData(snapshot, 0, 0);
    applyShapeStyle();

    switch (currentShape) {
        case "line":
        drawLine(startX, startY, x, y);
        break;
      case "rectangle":
        drawRectangle(startX, startY, x, y);
        break;
      case "circle":
        drawCircle(startX, startY, x, y);
        break;
      case "triangle":
        drawTriangle(startX, startY, x, y);
        break;
      case "pentagon":
        drawPolygon(startX, startY, x, y, 5);
        break;
      case "hexagon":
        drawPolygon(startX, startY, x, y, 6);
        break;
      case "star":
        drawStar(startX, startY, x, y, 5);
        break;
    }
  }
});

document.addEventListener("mouseup", () => {
  isDrawing = false;
  snapshot = null;
});

/* ===============================
   SHAPE FUNCTIONS
================================ */



function drawLine(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}


function drawRectangle(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.rect(x1, y1, x2 - x1, y2 - y1);
  drawPath();
}

function drawCircle(x1, y1, x2, y2) {
  const r = Math.hypot(x2 - x1, y2 - y1);
  ctx.beginPath();
  ctx.arc(x1, y1, r, 0, Math.PI * 2);
  drawPath();
}

function drawTriangle(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y2);
  ctx.lineTo(x2, y2);
  ctx.lineTo((x1 + x2) / 2, y1);
  ctx.closePath();
  drawPath();
}

function drawPolygon(x1, y1, x2, y2, sides) {
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  const r = Math.hypot(x2 - x1, y2 - y1) / 2;
  const step = (Math.PI * 2) / sides;

  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const a = i * step - Math.PI / 2;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  drawPath();
}

function drawStar(x1, y1, x2, y2, points) {
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  const outer = Math.hypot(x2 - x1, y2 - y1) / 2;
  const inner = outer / 2;
  const step = Math.PI / points;

  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = i * step - Math.PI / 2;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  drawPath();
}


let shapeFill = false;

const fillToggle = document.getElementById("fillToggle");

fillToggle.addEventListener("click", () => {
  shapeFill = !shapeFill;

  fillToggle.classList.toggle("active", shapeFill);
  fillToggle.textContent = shapeFill ? "Fill: ON" : "Fill: OFF";
});

function drawPath() {
  if (shapeFill) {
    ctx.fill();
  } else {
    ctx.stroke();
  }
}

function bucketFill(startX, startY) {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  const targetColor = getPixelColor(data, startX, startY);
  const fillColor = getActiveFillColorRGBA();

  if (colorsMatch(targetColor, fillColor)) return;

  const stack = [[startX, startY]];

  while (stack.length) {
    const [x, y] = stack.pop();
    const idx = (y * canvas.width + x) * 4;

    if (!colorsMatch(getPixelColor(data, x, y), targetColor)) continue;

    setPixelColor(data, idx, fillColor);

    if (x > 0) stack.push([x - 1, y]);
    if (x < canvas.width - 1) stack.push([x + 1, y]);
    if (y > 0) stack.push([x, y - 1]);
    if (y < canvas.height - 1) stack.push([x, y + 1]);
  }

  ctx.putImageData(imgData, 0, 0);
}


function getPixelColor(data, x, y) {
  const idx = (y * canvas.width + x) * 4;
  return [
    data[idx],
    data[idx + 1],
    data[idx + 2],
    data[idx + 3],
  ];
}

function setPixelColor(data, idx, [r, g, b, a]) {
  data[idx] = r;
  data[idx + 1] = g;
  data[idx + 2] = b;
  data[idx + 3] = a;
}

function colorsMatch(a, b, tolerance = 12) {
  return (
    Math.abs(a[0] - b[0]) <= tolerance &&
    Math.abs(a[1] - b[1]) <= tolerance &&
    Math.abs(a[2] - b[2]) <= tolerance &&
    Math.abs(a[3] - b[3]) <= tolerance
  );
}


function getActiveFillColorRGBA() {
  const color = getComputedStyle(document.documentElement)
    .getPropertyValue("--active-color")
    .trim();

  const alpha = parseFloat(
    getComputedStyle(document.documentElement)
      .getPropertyValue("--active-alpha")
  );

  const ctxTemp = document.createElement("canvas").getContext("2d");
  ctxTemp.fillStyle = color;
  ctxTemp.globalAlpha = alpha;
  ctxTemp.fillRect(0, 0, 1, 1);

  return ctxTemp.getImageData(0, 0, 1, 1).data;
}
