const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Store references once (Better performance)
const fileInput = document.querySelector(".btnfile");
const sliders = {
    brightness: document.getElementById("brightness"),
    contrast: document.getElementById("contrast"),
    saturation: document.getElementById("saturation"),
    blur: document.getElementById("blur")
};
const sepiaBtn = document.getElementById("sepia");
const downloadBtn = document.getElementById("downloadBtn");

let imgElement = new Image();
let isSepia = false;

// 1. Handle File Upload (Optimized with ObjectURL)
fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Revoke old URL to save memory
    if (imgElement.src) URL.revokeObjectURL(imgElement.src);
    imgElement.src = URL.createObjectURL(file);
});

// 2. Initialize Canvas
imgElement.onload = () => {
    canvas.width = imgElement.width;
    canvas.height = imgElement.height;
    applyFilters();
};

// 3. Centralized Filter Function
function applyFilters() {
    if (!imgElement.src) return;

    const { brightness, contrast, saturation, blur } = sliders;
    const sepiaVal = isSepia ? 100 : 0;

    ctx.filter = `
        brightness(${brightness.value}%) 
        contrast(${contrast.value}%) 
        saturate(${saturation.value}%) 
        blur(${blur.value}px) 
        sepia(${sepiaVal}%)
    `;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
}

// 4. Event Listeners (Delegation)
document.querySelectorAll('input[type="range"]').forEach(s => {
    s.addEventListener("input", applyFilters);
});

// 5. Preset Filters
document.getElementById("grayScale").addEventListener("click", () => {
    sliders.saturation.value = 0;
    applyFilters();
});

sepiaBtn.addEventListener("click", () => {
    isSepia = !isSepia;
    sepiaBtn.classList.toggle('active', isSepia); // Use CSS classes for styling
    applyFilters();
});

// 6. Reset
document.getElementById("reset").addEventListener("click", () => {
    Object.values(sliders).forEach(s => s.value = s.id === 'blur' ? 0 : 100);
    isSepia = false;
    applyFilters();
});

// 7. Download (Highest Quality)
downloadBtn.addEventListener("click", () => {
    if (!imgElement.src) return;
    const link = document.createElement("a");
    link.download = `edit-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png", 1.0);
    link.click();
});
