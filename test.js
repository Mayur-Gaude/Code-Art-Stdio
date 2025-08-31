// Get canvas and context
const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');

// Get UI elements
const pencilTool = document.getElementById('pencilTool');
const brushTool = document.getElementById('brushTool');
const eraserTool = document.getElementById('eraserTool');
const bucketTool = document.getElementById('bucketTool');
const lineTool = document.getElementById('lineTool');
const rectangleTool = document.getElementById('rectangleTool');
const circleTool = document.getElementById('circleTool');
const triangleTool = document.getElementById('triangleTool');
const starTool = document.getElementById('starTool');
const ellipseTool = document.getElementById('ellipseTool');
const hexagonTool = document.getElementById('hexagonTool');
const customColorPicker = document.getElementById('customColorPicker');
const colorSwatches = document.querySelectorAll('.color-swatch');
const sizeSlider = document.getElementById('sizeSlider');
const sizeDisplay = document.getElementById('sizeDisplay');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');

// Drawing state
let isDrawing = false;
let currentTool = 'pencil';
let currentColor = '#000000';
let currentSize = 2;
let startX, startY;
let imageData; // For shape preview

// Set canvas background
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Tool selection
function setActiveTool(tool) {
    // Remove active class from all tools
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));

    // Set current tool and add active class
    currentTool = tool;
    document.getElementById(tool + 'Tool').classList.add('active');
    canvas.style.cursor = 'crosshair';
}

pencilTool.addEventListener('click', () => setActiveTool('pencil'));
brushTool.addEventListener('click', () => setActiveTool('brush'));
eraserTool.addEventListener('click', () => setActiveTool('eraser'));
bucketTool.addEventListener('click', () => setActiveTool('bucket'));
lineTool.addEventListener('click', () => setActiveTool('line'));
rectangleTool.addEventListener('click', () => setActiveTool('rectangle'));
circleTool.addEventListener('click', () => setActiveTool('circle'));
triangleTool.addEventListener('click', () => setActiveTool('triangle'));
starTool.addEventListener('click', () => setActiveTool('star'));
ellipseTool.addEventListener('click', () => setActiveTool('ellipse'));
hexagonTool.addEventListener('click', () => setActiveTool('hexagon'));

// Color palette functionality
colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
        // Remove active class from all swatches
        colorSwatches.forEach(s => s.classList.remove('active'));

        // Add active class to clicked swatch
        swatch.classList.add('active');

        // Set current color
        currentColor = swatch.dataset.color;

        // Update custom color picker to match
        customColorPicker.value = currentColor;
    });
});

// Custom color picker
customColorPicker.addEventListener('change', (e) => {
    currentColor = e.target.value;

    // Remove active class from all swatches when using custom picker
    colorSwatches.forEach(s => s.classList.remove('active'));

    // Check if the custom color matches any existing swatch
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

// Clear canvas
clearBtn.addEventListener('click', () => {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});

// Save canvas
saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'my-artwork.png';
    link.href = canvas.toDataURL();
    link.click();
});

// Get mouse/touch position
function getPosition(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

// Drawing functions
function startDrawing(e) {
    isDrawing = true;
    const pos = getPosition(e);
    startX = pos.x;
    startY = pos.y;

    if (currentTool === 'pencil' || currentTool === 'brush' || currentTool === 'eraser') {
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);

        // Set drawing properties based on tool
        if (currentTool === 'pencil') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.lineWidth = currentSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = currentColor;
        } else if (currentTool === 'brush') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.lineWidth = currentSize * 2; // Brush is thicker
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = currentColor;
            ctx.globalAlpha = 0.8; // Brush has slight transparency
        } else if (currentTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = currentSize * 3; // Eraser is thicker
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
    } else {
        // For shapes, save the current canvas state for preview
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
}

function draw(e) {
    if (!isDrawing) return;

    const pos = getPosition(e);

    if (currentTool === 'pencil' || currentTool === 'brush' || currentTool === 'eraser') {
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    } else {
        // For shapes, restore canvas and draw preview
        ctx.putImageData(imageData, 0, 0);
        drawShape(startX, startY, pos.x, pos.y, true);
    }
}

function stopDrawing(e) {
    if (!isDrawing) return;

    if (currentTool === 'pencil' || currentTool === 'brush' || currentTool === 'eraser') {
        ctx.globalAlpha = 1.0; // Reset alpha
        ctx.globalCompositeOperation = 'source-over'; // Reset composite operation
    } else {
        // For shapes, draw the final shape
        const pos = getPosition(e);
        ctx.putImageData(imageData, 0, 0);
        drawShape(startX, startY, pos.x, pos.y, false);
    }

    isDrawing = false;
}

function drawShape(x1, y1, x2, y2, isPreview) {
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentSize;
    ctx.lineCap = 'round';
    ctx.globalAlpha = isPreview ? 0.5 : 1.0;

    ctx.beginPath();

    switch (currentTool) {
        case 'line':
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            break;

        case 'rectangle':
            const width = x2 - x1;
            const height = y2 - y1;
            ctx.strokeRect(x1, y1, width, height);
            break;

        case 'circle':
            const centerX = (x1 + x2) / 2;
            const centerY = (y1 + y2) / 2;
            const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / 2;
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.stroke();
            break;

        case 'triangle':
            const midX = (x1 + x2) / 2;
            ctx.moveTo(midX, y1);
            ctx.lineTo(x1, y2);
            ctx.lineTo(x2, y2);
            ctx.closePath();
            ctx.stroke();
            break;

        case 'star':
            drawStar(ctx, (x1 + x2) / 2, (y1 + y2) / 2, Math.abs(x2 - x1) / 4, Math.abs(x2 - x1) / 2, 5);
            ctx.stroke();
            break;

        case 'ellipse':
            const radiusX = Math.abs(x2 - x1) / 2;
            const radiusY = Math.abs(y2 - y1) / 2;
            const ellipseCenterX = (x1 + x2) / 2;
            const ellipseCenterY = (y1 + y2) / 2;
            ctx.ellipse(ellipseCenterX, ellipseCenterY, radiusX, radiusY, 0, 0, 2 * Math.PI);
            ctx.stroke();
            break;

        case 'hexagon':
            drawPolygon(ctx, (x1 + x2) / 2, (y1 + y2) / 2, Math.abs(x2 - x1) / 2, 6);
            ctx.stroke();
            break;
    }

    ctx.globalAlpha = 1.0;
}

// Helper function to draw a star
function drawStar(ctx, cx, cy, innerRadius, outerRadius, points) {
    const angle = Math.PI / points;
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < 2 * points; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = cx + Math.cos(i * angle - Math.PI / 2) * radius;
        const y = cy + Math.sin(i * angle - Math.PI / 2) * radius;
        ctx.lineTo(x, y);
    }

    ctx.closePath();
}

// Helper function to draw a polygon
function drawPolygon(ctx, cx, cy, radius, sides) {
    const angle = (2 * Math.PI) / sides;

    ctx.moveTo(cx + radius, cy);

    for (let i = 1; i < sides; i++) {
        const x = cx + Math.cos(i * angle) * radius;
        const y = cy + Math.sin(i * angle) * radius;
        ctx.lineTo(x, y);
    }

    ctx.closePath();
}

// Flood fill algorithm
function floodFill(startX, startY, fillColor) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    // Convert fill color to RGB
    const fillR = parseInt(fillColor.slice(1, 3), 16);
    const fillG = parseInt(fillColor.slice(3, 5), 16);
    const fillB = parseInt(fillColor.slice(5, 7), 16);

    // Get the color at the starting point
    const startIndex = (startY * width + startX) * 4;
    const targetR = data[startIndex];
    const targetG = data[startIndex + 1];
    const targetB = data[startIndex + 2];
    const targetA = data[startIndex + 3];

    // If the target color is the same as fill color, don't fill
    if (targetR === fillR && targetG === fillG && targetB === fillB) {
        return;
    }

    // Stack for flood fill
    const stack = [[startX, startY]];
    const visited = new Set();

    while (stack.length > 0) {
        const [x, y] = stack.pop();

        // Check bounds
        if (x < 0 || x >= width || y < 0 || y >= height) continue;

        const key = `${x},${y}`;
        if (visited.has(key)) continue;
        visited.add(key);

        const index = (y * width + x) * 4;

        // Check if this pixel matches the target color
        if (data[index] === targetR &&
            data[index + 1] === targetG &&
            data[index + 2] === targetB &&
            data[index + 3] === targetA) {

            // Fill this pixel
            data[index] = fillR;
            data[index + 1] = fillG;
            data[index + 2] = fillB;
            data[index + 3] = 255; // Full opacity

            // Add neighboring pixels to stack
            stack.push([x + 1, y]);
            stack.push([x - 1, y]);
            stack.push([x, y + 1]);
            stack.push([x, y - 1]);
        }
    }

    // Apply the changes
    ctx.putImageData(imageData, 0, 0);
}

// Handle bucket fill click
function handleBucketFill(e) {
    if (currentTool !== 'bucket') return;

    const pos = getPosition(e);
    const x = Math.floor(pos.x);
    const y = Math.floor(pos.y);

    floodFill(x, y, currentColor);
}

// Mouse events
canvas.addEventListener('mousedown', (e) => {
    if (currentTool === 'bucket') {
        handleBucketFill(e);
    } else {
        startDrawing(e);
    }
});
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Touch events for mobile/tablet support
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    canvas.dispatchEvent(mouseEvent);
});

// Initialize
canvas.style.cursor = 'crosshair';
