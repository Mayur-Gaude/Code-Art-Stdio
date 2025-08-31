const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');

// Get UI elements
const tools = {
    pencil: document.getElementById('pencilTool'),
    brush: document.getElementById('brushTool'),
    eraser: document.getElementById('eraserTool'),
    bucket: document.getElementById('bucket'),
    line: document.getElementById('lineTool'),
    rectangle: document.getElementById('rectangleTool'),
    circle: document.getElementById('circleTool'),
    triangle: document.getElementById('triangleTool'),
    star: document.getElementById('starTool'),
    ellipse: document.getElementById('ellipseTool')
};

const customColorPicker = document.getElementById('customColorPicker');
const colorSwatches = document.querySelectorAll('.color-swatch');
const sizeSlider = document.getElementById('sizeSlider');
const sizeDisplay = document.getElementById('sizeDisplay');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');

// View controls
const canvasViewBtn = document.getElementById('canvasViewBtn');
const codeViewBtn = document.getElementById('codeViewBtn');
const splitViewBtn = document.getElementById('splitViewBtn');
const mainContent = document.getElementById('mainContent');
const codePanel = document.getElementById('codePanel');

// Code panel elements
const codeTabs = document.querySelectorAll('.code-tab');
const codeEditor = document.getElementById('codeEditor');
const copyBtn = document.getElementById('copyBtn');

// Drawing state
let isDrawing = false;
let currentTool = 'pencil';
let currentColor = '#000000';
let currentSize = 2;
let startX = 0;
let startY = 0;
let imageData = null;

// Undo/Redo system
let undoStack = [];
let redoStack = [];
let currentStateIndex = -1;

// Shape tracking for code generation
let shapes = [];
let shapeCounter = 0;
let currentCodeTab = 'css';

// Initialize canvas
function initCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
}


let history = [[]]; // Start with an array containing an empty shapes array
let historyIndex = 0;

// Undo/Redo functionality
// function saveState() {
//     currentStateIndex++;
//     if (currentStateIndex < undoStack.length) {
//         undoStack.length = currentStateIndex;
//     }
//     undoStack.push(canvas.toDataURL());
//     redoStack = [];

//     // Limit undo stack size
//     if (undoStack.length > 50) {
//         undoStack.shift();
//         currentStateIndex--;
//     }

//     updateUndoRedoButtons();
// }

function saveState() {
    // Create a deep copy of the current shapes array
    let newShapes = JSON.parse(JSON.stringify(shapes));

    // If we undo and then draw something new, trim the future history
    history = history.slice(0, historyIndex + 1);

    history.push(newShapes);
    historyIndex++;
    updateUndoRedoButtons();
}

// function undo() {
//     if (currentStateIndex > 0) {
//         const redoState = undoStack[currentStateIndex];
//         redoStack.push(redoState);
//         currentStateIndex--;
//         restoreState(undoStack[currentStateIndex]);
//         updateUndoRedoButtons();
//     }
// }

// function redo() {
//     if (redoStack.length > 0) {
//         currentStateIndex++;
//         const redoState = redoStack.pop();
//         if (currentStateIndex >= undoStack.length) {
//             undoStack.push(redoState);
//         }
//         restoreState(redoState);
//         updateUndoRedoButtons();
//     }
// }

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        shapes = JSON.parse(JSON.stringify(history[historyIndex]));
        redrawCanvas();
        updateCodeDisplay();
        updateUndoRedoButtons();
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        shapes = JSON.parse(JSON.stringify(history[historyIndex]));
        redrawCanvas();
        updateCodeDisplay();
        updateUndoRedoButtons();
    }
}

function redrawCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Note: You'll also need to handle freehand paths here
    shapes.forEach(shape => {
        // You'll need to modify your drawShape function to take a shape object
        // and draw it without adding it to the array again.
        drawShapeFromObject(shape);
    });
}

function drawShapeFromObject(shape) {
    // Set the drawing style based on the shape's saved properties
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';

    ctx.beginPath();

    switch (shape.type) {
        case 'line':
            ctx.moveTo(shape.x1, shape.y1);
            ctx.lineTo(shape.x2, shape.y2);
            break;

        case 'rectangle':
            ctx.strokeRect(shape.x1, shape.y1, shape.width, shape.height);
            break;

        case 'circle':
            ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, 2 * Math.PI);
            break;

        case 'triangle':
            const midX = (shape.x1 + shape.x2) / 2;
            ctx.moveTo(midX, shape.y1);
            ctx.lineTo(shape.x1, shape.y2);
            ctx.lineTo(shape.x2, shape.y2);
            ctx.closePath();
            break;

        case 'star':
            drawStar(ctx, shape.centerX, shape.centerY, shape.innerRadius, shape.outerRadius, 5);
            break;

        case 'ellipse':
            ctx.ellipse(shape.centerX, shape.centerY, shape.radiusX, shape.radiusY, 0, 0, 2 * Math.PI);
            break;

        case 'path':
            ctx.strokeStyle = shape.color;
            ctx.lineWidth = shape.size;
            ctx.globalCompositeOperation = shape.operation;

            ctx.moveTo(shape.points[0].x, shape.points[0].y);
            for (let i = 1; i < shape.points.length; i++) {
                ctx.lineTo(shape.points[i].x, shape.points[i].y);
            }
            break;
    }

    ctx.stroke();
}


function restoreState(dataURL) {
    const img = new Image();
    img.onload = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
    img.src = dataURL;
}

function updateUndoRedoButtons() {
    // undoBtn.disabled = currentStateIndex <= 0;
    undoBtn.disabled = historyIndex <= 1;

    // redoBtn.disabled = redoStack.length === 0;
    redoBtn.disabled = historyIndex >= history.length;

    undoBtn.style.opacity = undoBtn.disabled ? '0.5' : '1';
    redoBtn.style.opacity = redoBtn.disabled ? '0.5' : '1';
}

// View switching
// function switchView(view) {
//     canvasViewBtn.classList.remove('active');
//     codeViewBtn.classList.remove('active');
//     splitViewBtn.classList.remove('active');

//     switch (view) {
//         case 'canvas':
//             canvasViewBtn.classList.add('active');
//             mainContent.style.gridTemplateColumns = '1fr';
//             codePanel.classList.remove('active');
//             break;
//         case 'code':
//             codeViewBtn.classList.add('active');
//             mainContent.style.gridTemplateColumns = '0 1fr';
//             codePanel.classList.add('active');
//             break;
//         case 'split':
//             splitViewBtn.classList.add('active');
//             mainContent.style.gridTemplateColumns = '1fr auto';
//             codePanel.classList.add('active');
//             break;
//     }
// }

function switchView(view) {
    // Toggle active class on buttons
    canvasViewBtn.classList.remove('active');
    codeViewBtn.classList.remove('active');
    splitViewBtn.classList.remove('active');

    // Set the view mode class on the parent container
    mainContent.classList.remove('view-canvas', 'view-code', 'view-split');

    switch (view) {
        case 'canvas':
            canvasViewBtn.classList.add('active');
            mainContent.classList.add('view-canvas');
            break;
        case 'code':
            codeViewBtn.classList.add('active');
            mainContent.classList.add('view-code');
            break;
        case 'split':
            splitViewBtn.classList.add('active');
            mainContent.classList.add('view-split');
            break;
    }
}

// Tool selection
function setActiveTool(tool) {
    Object.values(tools).forEach(btn => btn.classList.remove('active'));
    currentTool = tool;
    tools[tool].classList.add('active');
    canvas.style.cursor = 'crosshair';
}

// Get mouse position
function getPosition(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

// Set drawing style based on current tool
function setDrawingStyle() {
    if (currentTool === 'pencil') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = currentSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = currentColor;
        ctx.globalAlpha = 1.0;
    } else if (currentTool === 'brush') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = currentSize * 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = currentColor;
        ctx.globalAlpha = 0.8;
    } else if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = currentSize * 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 1.0;
    }
}

let currentPath = [];

// Drawing functions
function startDrawing(e) {
    isDrawing = true;
    const pos = getPosition(e);
    startX = pos.x;
    startY = pos.y;

    if (['pencil', 'brush', 'eraser'].includes(currentTool)) {
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        setDrawingStyle();

        currentPath = [{ x: pos.x, y: pos.y }]; // Start recording the path
    } else {
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
}

function draw(e) {
    if (!isDrawing) return;

    const pos = getPosition(e);

    if (['pencil', 'brush', 'eraser'].includes(currentTool)) {
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();

        currentPath.push({ x: pos.x, y: pos.y }); // Add new point to the path
    } else {
        ctx.putImageData(imageData, 0, 0);
        drawShape(startX, startY, pos.x, pos.y, true);
    }
}

function stopDrawing(e) {
    if (!isDrawing) return;

    if (['pencil', 'brush', 'eraser'].includes(currentTool)) {
        // ctx.globalAlpha = 1.0;
        // ctx.globalCompositeOperation = 'source-over';

        // Create a path object and save it to the shapes array
        const path = {
            id: shapeCounter++,
            type: 'path',
            points: currentPath,
            color: currentTool === 'eraser' ? 'white' : currentColor,
            size: currentTool === 'eraser' ? currentSize * 3 : (currentTool === 'brush' ? currentSize * 2 : currentSize),
            operation: currentTool === 'eraser' ? 'destination-out' : 'source-over',
            // We need to store all properties for redrawing
            strokeWidth: currentTool === 'eraser' ? currentSize * 3 : (currentTool === 'brush' ? currentSize * 2 : currentSize)
        };
        shapes.push(path);
        currentPath = []; // Clear the path for the next drawing
    } else {
        const pos = getPosition(e);
        ctx.putImageData(imageData, 0, 0);
        const shape = drawShape(startX, startY, pos.x, pos.y, false);
        if (shape) {
            shapes.push(shape);
        }
    }

    isDrawing = false;
    saveState();
    updateCodeDisplay();
}

// Draw shapes
function drawShape(x1, y1, x2, y2, isPreview) {
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentSize;
    ctx.lineCap = 'round';
    ctx.globalAlpha = isPreview ? 0.5 : 1.0;
    ctx.globalCompositeOperation = 'source-over';

    const shape = {
        id: shapeCounter++,
        type: currentTool,
        x1: x1, y1: y1, x2: x2, y2: y2,
        color: currentColor,
        strokeWidth: currentSize
    };

    ctx.beginPath();

    switch (currentTool) {
        case 'line':
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            break;

        case 'rectangle':
            const width = x2 - x1;
            const height = y2 - y1;
            ctx.strokeRect(x1, y1, width, height);
            shape.width = width;
            shape.height = height;
            break;

        case 'circle':
            const centerX = (x1 + x2) / 2;
            const centerY = (y1 + y2) / 2;
            const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / 2;
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            shape.centerX = centerX;
            shape.centerY = centerY;
            shape.radius = radius;
            break;

        case 'triangle':
            const midX = (x1 + x2) / 2;
            ctx.moveTo(midX, y1);
            ctx.lineTo(x1, y2);
            ctx.lineTo(x2, y2);
            ctx.closePath();
            break;

        case 'star':
            const starCenterX = (x1 + x2) / 2;
            const starCenterY = (y1 + y2) / 2;
            const outerRadius = Math.abs(x2 - x1) / 2;
            const innerRadius = outerRadius / 2;
            drawStar(ctx, starCenterX, starCenterY, innerRadius, outerRadius, 5);
            shape.centerX = starCenterX;
            shape.centerY = starCenterY;
            shape.outerRadius = outerRadius;
            shape.innerRadius = innerRadius;
            break;

        case 'ellipse':
            const radiusX = Math.abs(x2 - x1) / 2;
            const radiusY = Math.abs(y2 - y1) / 2;
            const ellipseCenterX = (x1 + x2) / 2;
            const ellipseCenterY = (y1 + y2) / 2;
            ctx.ellipse(ellipseCenterX, ellipseCenterY, radiusX, radiusY, 0, 0, 2 * Math.PI);
            shape.centerX = ellipseCenterX;
            shape.centerY = ellipseCenterY;
            shape.radiusX = radiusX;
            shape.radiusY = radiusY;
            break;
    }

    ctx.stroke();
    ctx.globalAlpha = 1.0;

    return isPreview ? null : shape;
}

// Helper function to draw a star
function drawStar(ctx, cx, cy, innerRadius, outerRadius, points) {
    const angle = Math.PI / points;
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < 2 * points; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const starX = cx + Math.cos(i * angle - Math.PI / 2) * radius;
        const starY = cy + Math.sin(i * angle - Math.PI / 2) * radius;
        ctx.lineTo(starX, starY);
    }
    ctx.closePath();
}

// Code generation functions
function generateCSS() {
    let css = `/* Generated by Code Art Studio */\n.art-container {\n  position: relative;\n  width: ${canvas.width}px;\n  height: ${canvas.height}px;\n  background: white;\n}\n\n`;

    shapes.forEach((shape, index) => {
        css += `.shape-${index} {\n  position: absolute;\n`;

        switch (shape.type) {
            case 'rectangle':
                css += `  left: ${Math.min(shape.x1, shape.x2)}px;\n`;
                css += `  top: ${Math.min(shape.y1, shape.y2)}px;\n`;
                css += `  width: ${Math.abs(shape.width)}px;\n`;
                css += `  height: ${Math.abs(shape.height)}px;\n`;
                css += `  border: ${shape.strokeWidth}px solid ${shape.color};\n`;
                css += `  background: transparent;\n`;
                break;

            case 'circle':
                css += `  left: ${shape.centerX - shape.radius}px;\n`;
                css += `  top: ${shape.centerY - shape.radius}px;\n`;
                css += `  width: ${shape.radius * 2}px;\n`;
                css += `  height: ${shape.radius * 2}px;\n`;
                css += `  border: ${shape.strokeWidth}px solid ${shape.color};\n`;
                css += `  border-radius: 50%;\n`;
                css += `  background: transparent;\n`;
                break;

            case 'line':
                const length = Math.sqrt(Math.pow(shape.x2 - shape.x1, 2) + Math.pow(shape.y2 - shape.y1, 2));
                const angle = Math.atan2(shape.y2 - shape.y1, shape.x2 - shape.x1) * 180 / Math.PI;
                css += `  left: ${shape.x1}px;\n`;
                css += `  top: ${shape.y1 - shape.strokeWidth / 2}px;\n`;
                css += `  width: ${length}px;\n`;
                css += `  height: ${shape.strokeWidth}px;\n`;
                css += `  background: ${shape.color};\n`;
                css += `  transform-origin: 0 50%;\n`;
                css += `  transform: rotate(${angle}deg);\n`;
                break;

            case 'ellipse': // "Oval" is an ellipse
                // It's like a circle, but uses different radii for width/height
                css += `  left: ${shape.centerX - shape.radiusX}px;\n`;
                css += `  top: ${shape.centerY - shape.radiusY}px;\n`;
                css += `  width: ${shape.radiusX * 2}px;\n`;
                css += `  height: ${shape.radiusY * 2}px;\n`;
                css += `  border: ${shape.strokeWidth}px solid ${shape.color};\n`;
                css += `  border-radius: 50%;\n`; // A 50% radius on a rectangle makes an ellipse
                css += `  background: transparent;\n`;
                break;

            case 'triangle':
                // The CSS triangle trick: a zero-size element where one border is visible
                const triWidth = Math.abs(shape.x2 - shape.x1);
                const triHeight = Math.abs(shape.y2 - shape.y1);
                css += `  left: ${Math.min(shape.x1, shape.x2)}px;\n`;
                css += `  top: ${shape.y1}px;\n`;
                css += `  width: 0;\n`;
                css += `  height: 0;\n`;
                css += `  border-left: ${triWidth / 2}px solid transparent;\n`;
                css += `  border-right: ${triWidth / 2}px solid transparent;\n`;
                css += `  border-bottom: ${triHeight}px solid ${shape.color};\n`;
                // Note: This only creates an upright triangle. Stroke isn't possible this way.
                break;

            case 'star':
                // The best way to create a star in a single div is with clip-path
                const starSize = Math.abs(shape.x2 - shape.x1);
                css += `  left: ${shape.centerX - starSize / 2}px;\n`;
                css += `  top: ${shape.centerY - starSize / 2}px;\n`;
                css += `  width: ${starSize}px;\n`;
                css += `  height: ${starSize}px;\n`;
                css += `  background-color: ${shape.color};\n`; // clip-path works on background, not border
                css += `  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);\n`;
                break;
        }

        css += `}\n\n`;
    });

    return css;
}

function generateSVG() {
    let svg = `<!-- Generated by Code Art Studio -->\n<svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">\n`;
    svg += `  <rect width="100%" height="100%" fill="white"/>\n`;

    shapes.forEach(shape => {
        switch (shape.type) {
            case 'rectangle':
                svg += `  <rect x="${Math.min(shape.x1, shape.x2)}" y="${Math.min(shape.y1, shape.y2)}" `;
                svg += `width="${Math.abs(shape.width)}" height="${Math.abs(shape.height)}" `;
                svg += `fill="none" stroke="${shape.color}" stroke-width="${shape.strokeWidth}"/>\n`;
                break;

            case 'circle':
                svg += `  <circle cx="${shape.centerX}" cy="${shape.centerY}" r="${shape.radius}" `;
                svg += `fill="none" stroke="${shape.color}" stroke-width="${shape.strokeWidth}"/>\n`;
                break;

            case 'ellipse':
                svg += `  <ellipse cx="${shape.centerX}" cy="${shape.centerY}" `;
                svg += `rx="${shape.radiusX}" ry="${shape.radiusY}" `;
                svg += `fill="none" stroke="${shape.color}" stroke-width="${shape.strokeWidth}"/>\n`;
                break;

            case 'line':
                svg += `  <line x1="${shape.x1}" y1="${shape.y1}" x2="${shape.x2}" y2="${shape.y2}" `;
                svg += `stroke="${shape.color}" stroke-width="${shape.strokeWidth}"/>\n`;
                break;

            case 'triangle':
                const midX = (shape.x1 + shape.x2) / 2;
                svg += `  <polygon points="${midX},${shape.y1} ${shape.x1},${shape.y2} ${shape.x2},${shape.y2}" `;
                svg += `fill="none" stroke="${shape.color}" stroke-width="${shape.strokeWidth}"/>\n`;
                break;

            case 'path':
                // The 'd' attribute of a path is its data. M = Move To, L = Line To.
                const pathData = "M " + shape.points.map(p => `${p.x} ${p.y}`).join(" L ");
                svg += `  <path d="${pathData}" stroke="${shape.color}" stroke-width="${shape.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>\n`;
                break;
        }
    });

    svg += `</svg>`;
    return svg;
}

function generateHTML() {
    let html = `<!-- Generated by Code Art Studio -->\n<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>My Code Art</title>\n  <style>\n`;
    html += generateCSS();
    html += `  </style>\n</head>\n<body>\n  <div class="art-container">\n`;

    shapes.forEach((shape, index) => {
        html += `    <div class="shape-${index}"></div>\n`;
    });

    html += `  </div>\n</body>\n</html>`;
    return html;
}

function updateCodeDisplay() {
    let code = '';

    switch (currentCodeTab) {
        case 'css':
            code = generateCSS();
            break;
        case 'svg':
            code = generateSVG();
            break;
        case 'html':
            code = generateHTML();
            break;
    }

    codeEditor.value = code;

    if (shapes.length === 0) {
        codeEditor.placeholder = "Draw shapes to see the generated code...";
    } else {
        codeEditor.placeholder = "";
    }
}

// Event listeners for tools
Object.keys(tools).forEach(tool => {
    tools[tool].addEventListener('click', () => setActiveTool(tool));
});

// Color functionality
colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
        colorSwatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        currentColor = swatch.dataset.color;
        customColorPicker.value = currentColor;
    });
});

customColorPicker.addEventListener('change', (e) => {
    currentColor = e.target.value;
    colorSwatches.forEach(s => s.classList.remove('active'));
    const matchingSwatch = Array.from(colorSwatches).find(swatch =>
        swatch.dataset.color.toLowerCase() === currentColor.toLowerCase()
    );
    if (matchingSwatch) {
        matchingSwatch.classList.add('active');
    }
});

// Size slider
sizeSlider.addEventListener('input', (e) => {
    currentSize = parseInt(e.target.value);
    sizeDisplay.textContent = currentSize + 'px';
});

// View controls
canvasViewBtn.addEventListener('click', () => switchView('canvas'));
codeViewBtn.addEventListener('click', () => switchView('code'));
splitViewBtn.addEventListener('click', () => switchView('split'));

// Undo/Redo buttons
undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);

// Code tabs
codeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        codeTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentCodeTab = tab.dataset.tab;
        updateCodeDisplay();
    });
});

// Copy functionality
copyBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(codeEditor.value);
        copyBtn.textContent = '✓ Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
            copyBtn.textContent = '📋 Copy';
            copyBtn.classList.remove('copied');
        }, 2000);
    } catch (err) {
        codeEditor.select();
        document.execCommand('copy');
        copyBtn.textContent = '✓ Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
            copyBtn.textContent = '📋 Copy';
            copyBtn.classList.remove('copied');
        }, 2000);
    }
});

// Clear and save
clearBtn.addEventListener('click', () => {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    shapes = [];
    saveState();
    updateCodeDisplay();
});

saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'my-artwork.png';
    link.href = canvas.toDataURL();
    link.click();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
            case 'z':
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
                break;
            case 's':
                e.preventDefault();
                saveBtn.click();
                break;
            case 'c':
                if (codePanel.classList.contains('active')) {
                    e.preventDefault();
                    copyBtn.click();
                }
                break;
        }
    }

    // Tool shortcuts
    switch (e.key.toLowerCase()) {
        case 'p':
            if (!e.ctrlKey && !e.metaKey) setActiveTool('pencil');
            break;
        case 'b':
            if (!e.ctrlKey && !e.metaKey) setActiveTool('brush');
            break;
        case 'e':
            if (!e.ctrlKey && !e.metaKey) setActiveTool('eraser');
            break;
        case 'l':
            if (!e.ctrlKey && !e.metaKey) setActiveTool('line');
            break;
        case 'r':
            if (!e.ctrlKey && !e.metaKey) setActiveTool('rectangle');
            break;
        case 'o':
            if (!e.ctrlKey && !e.metaKey) setActiveTool('circle');
            break;
    }
});

// Mouse events - consolidated event handler
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);

    if (currentTool === "bucket") {
        bucketFill(x, y, currentColor);
        saveState(); // Save after filling
    } else {
        startDrawing(e);
    }
});
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

function bucketFill(startX, startY, fillColor) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    const targetColor = getPixel(data, startX, startY, width);

    const fillRgba = hexToRgba(fillColor);

    if (colorsMatch(targetColor, fillRgba)) return;

    const queue = [{ x: startX, y: startY }];

    while (queue.length > 0) {
        const { x, y } = queue.pop();

        const currentColor = getPixel(data, x, y, width);
        if (!colorsMatch(currentColor, targetColor)) continue;

        setPixel(data, x, y, fillRgba);

        if (x > 0) queue.push({ x: x - 1, y });
        if (x < width - 1) queue.push({ x: x + 1, y });
        if (y > 0) queue.push({ x, y: y - 1 });
        if (y < height - 1) queue.push({ x, y: y + 1 });
    }

    ctx.putImageData(imageData, 0, 0);
}

function getPixel(data, x, y, width) {
    const index = (y * width + x) * 4;
    return [
        data[index],     // R
        data[index + 1], // G
        data[index + 2], // B
        data[index + 3]  // A
    ];
}

function setPixel(data, x, y, rgba) {
    const index = (y * canvas.width + x) * 4;
    data[index] = rgba[0];
    data[index + 1] = rgba[1];
    data[index + 2] = rgba[2];
    data[index + 3] = rgba[3];
}

function colorsMatch(c1, c2) {
    return c1[0] === c2[0] && c1[1] === c2[1] && c1[2] === c2[2] && c1[3] === c2[3];
}

function hexToRgba(hex) {
    let r = 0, g = 0, b = 0, a = 255;
    if (hex.startsWith('#')) {
        hex = hex.slice(1);
    }

    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    }

    return [r, g, b, a];
}


// Touch events for mobile support
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    startDrawing(mouseEvent);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    draw(mouseEvent);
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    stopDrawing(mouseEvent);
});

// Prevent context menu on canvas
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

// Initialize the app
initCanvas();
updateUndoRedoButtons();
updateCodeDisplay();

// Auto-resize canvas on window resize
function resizeCanvas() {
    const container = canvas.parentElement;
    const containerRect = container.getBoundingClientRect();
    const maxWidth = containerRect.width - 40;
    const maxHeight = containerRect.height - 40;

    if (canvas.width > maxWidth || canvas.height > maxHeight) {
        const scale = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
        canvas.style.transform = `scale(${scale})`;
        canvas.style.transformOrigin = 'center';
    } else {
        canvas.style.transform = 'none';
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

console.log('🎨 Code Art Studio loaded successfully!');
console.log('Keyboard shortcuts:');
console.log('• Ctrl+Z: Undo');
console.log('• Ctrl+Shift+Z: Redo');
console.log('• Ctrl+S: Save');
console.log('• Ctrl+C: Copy code (when code panel is open)');
console.log('• P: Pencil, B: Brush, E: Eraser, L: Line, R: Rectangle, O: Circle');