const colorPicker = document.getElementById("color");
const brushSizeSelector = document.getElementById("brushSize");
const penTools = document.getElementById("pen");
const eraserTool = document.getElementById("eraser");
const drawSquareBtn = document.getElementById("Square");
const clearCanvasBtn = document.getElementById("clean");
const DownloadBtn = document.getElementById("download");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.height = 420;
canvas.width = 800;
ctx.strokeStyle = colorPicker.value;
ctx.lineWidth = brushSizeSelector.value;
ctx.lineCap = "round";

let isDrawing = false;

function draw(e) {
    if (isDrawing) {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }
}

function startDrawing(e) {
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
    ctx.lineWidth = brushSizeSelector.value;
    ctx.strokeStyle = colorPicker.value;
}

function stopDrawing() {
    isDrawing = false;
}

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);