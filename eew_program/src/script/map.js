const mapContainer = document.getElementById('map-container');
const baseCanvas = document.getElementById('baseCanvas');
const overlayInfoCanvas = document.getElementById('overlayInfoCanvas');

const baseCtx = baseCanvas.getContext('2d');
const overlayCtx = overlayInfoCanvas.getContext('2d');

let geojson = null;

let width = 0;
let height = 0;

// ===== Zoom =====

const DEFAULT_SCALE = 2200;

const MIN_SCALE = 1200;
const MAX_SCALE = 25000;

let scale = DEFAULT_SCALE;

let offsetX = 0;
let offsetY = 0;

// ===== Drag =====

let dragging = false;

let lastX = 0;
let lastY = 0;

// ===== Data =====

const color = await fetch(
    './src/script/color.json'
).then(r => r.json());

let currentIntData = [];

// ===== Intensity Images =====

const intensityImages = {};

const levels = [
    '1', '2', '3', '4',
    '5-', '5+',
    '6-', '6+',
    '7'
];

levels.forEach(level => {

    const img = new Image();

    img.src =
        `./src/icons/int${level}.png`;

    img.onload = () => redraw();

    intensityImages[level] = img;
});

// ===== Resize =====

function resize() {

    const sidebar = 400;

    width =
        window.innerWidth - sidebar;

    height =
        window.innerHeight;

    document.getElementById('sidebar').style =
        `width:${sidebar}px;height:${height}px;`;

    document.getElementById('info-box').style =
        `height:${height - 100}px;`;

    [baseCanvas, overlayInfoCanvas]
    .forEach(canvas => {

        canvas.width = width;
        canvas.height = height;

        canvas.style.width =
            width + 'px';

        canvas.style.height =
            height + 'px';
    });

    redraw();
}

window.addEventListener(
    'resize',
    resize
);

// ===== Projection =====

function projection() {

    return d3.geoMercator()
        .center([137, 38])
        .scale(scale)
        .translate([
            width / 2 + offsetX,
            height / 2 + offsetY
        ]);
}

// ===== Clamp =====

function clampScale(value) {

    return Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, value)
    );
}

function clampOffset() {

    const limitX = width * 1.5;
    const limitY = height * 1.5;

    offsetX = Math.max(
        -limitX,
        Math.min(limitX, offsetX)
    );

    offsetY = Math.max(
        -limitY,
        Math.min(limitY, offsetY)
    );
}

// ===== Zoom =====

function zoomAt(
    canvasX,
    canvasY,
    zoomFactor
) {

    const prevScale = scale;

    const nextScale =
        clampScale(
            scale * zoomFactor
        );

    const ratio =
        nextScale / prevScale;

    const centerX = width / 2;
    const centerY = height / 2;

    scale = nextScale;

    offsetX =
        canvasX - centerX -
        (
            canvasX -
            centerX -
            offsetX
        ) * ratio;

    offsetY =
        canvasY - centerY -
        (
            canvasY -
            centerY -
            offsetY
        ) * ratio;

    clampOffset();

    redraw();
}

// ===== Base =====

function drawBase() {

    if (!geojson) return;

    baseCtx.clearRect(
        0,
        0,
        width,
        height
    );

    // ===== Sea =====

    baseCtx.fillStyle =
        '#313c52';

    baseCtx.fillRect(
        0,
        0,
        width,
        height
    );

    const proj = projection();

    const path =
        d3.geoPath(
            proj,
            baseCtx
        );

    geojson.features.forEach(feature => {

        baseCtx.beginPath();

        path(feature);

        // ===== Land =====

        baseCtx.fillStyle =
            '#273952';

        baseCtx.fill('evenodd');

        // ===== Border =====

        baseCtx.strokeStyle =
            '#70849f';

        baseCtx.lineWidth =
            Math.max(
                0.4,
                1 / (
                    scale /
                    DEFAULT_SCALE
                )
            );

        baseCtx.stroke();
    });
}

// ===== Image Size =====

function getIntensityImageSize() {

    const zoom =
        scale / DEFAULT_SCALE;

    const baseSize = 22;

    const minSize = 20;
    const maxSize = 23;

    const size =
        baseSize /
        Math.sqrt(zoom);

    return Math.max(
        minSize,
        Math.min(maxSize, size)
    );
}

// ===== Overlay =====

export function drawOverlay(
    intRegionData = currentIntData
) {

    if (!geojson) return;

    currentIntData =
        intRegionData;

    overlayCtx.clearRect(
        0,
        0,
        width,
        height
    );

    const proj = projection();

    geojson.features.forEach(feature => {

        const code =
            feature.properties.code;

        // ===== Region =====

        const region =
            intRegionData.find(
                item =>
                    item.code === code
            );

        if (!region) return;

        // ===== Intensity =====

        const intensity =
            region.maxInt;

        const fillColor =
            color.intensity[
            intensity
            ];

        if (!fillColor) return;

        overlayCtx.beginPath();

        const path =
            d3.geoPath(
                proj,
                overlayCtx
            );

        path(feature);

        // ===== Fill =====

        overlayCtx.fillStyle =
            fillColor;

        overlayCtx.globalAlpha =
            0.7;

        overlayCtx.fill(
            'evenodd'
        );

        overlayCtx.globalAlpha =
            1;

        // ===== Center =====

        const centroid =
            d3.geoCentroid(
                feature
            );

        const point =
            proj(centroid);

        if (!point) return;

        const [cx, cy] = point;

        // ===== Image =====

        const img =
            intensityImages[
            intensity
            ];

        if (
            img &&
            img.complete
        ) {

            const size =
                getIntensityImageSize();

            overlayCtx.drawImage(
                img,
                cx - size / 2,
                cy - size / 2,
                size,
                size
            );
        }
    });
}

// ===== Show / Hide =====
export function showInfoOverlay() {
    overlayInfoCanvas.style.opacity = '1';
}

export function hideInfoOverlay() {
    overlayInfoCanvas.style.opacity = '0';
}

// ===== Redraw =====

export function redraw() {

    if (!geojson) return;

    drawBase();

    drawOverlay(
        currentIntData
    );
}

// ===== Drag =====

document.addEventListener(
    'mousedown',
    e => {

        const rect =
            mapContainer.getBoundingClientRect();

        if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
        ) return;

        dragging = true;

        lastX = e.clientX;
        lastY = e.clientY;
    }
);

document.addEventListener(
    'mouseup',
    () => {
        dragging = false;
    }
);

document.addEventListener(
    'mousemove',
    e => {

        if (!dragging) return;

        const dx =
            e.clientX - lastX;

        const dy =
            e.clientY - lastY;

        lastX = e.clientX;
        lastY = e.clientY;

        offsetX += dx;
        offsetY += dy;

        clampOffset();

        redraw();
    }
);

// ===== Wheel Zoom =====

mapContainer.addEventListener(
    'wheel',
    e => {

        e.preventDefault();

        const rect = mapContainer.getBoundingClientRect();

        const x =
            e.clientX - rect.left;

        const y =
            e.clientY - rect.top;

        const zoomFactor =
            e.deltaY < 0
                ? 1.15
                : 0.85;

        zoomAt(
            x,
            y,
            zoomFactor
        );

    },
    { passive: false }
);

// ===== Buttons =====

document
.getElementById('zoomIn')
.addEventListener(
    'click',
    () => {

        zoomAt(
            width / 2,
            height / 2,
            1.2
        );
    }
);

document
.getElementById('zoomOut')
.addEventListener(
    'click',
    () => {

        zoomAt(
            width / 2,
            height / 2,
            0.8
        );
    }
);

// ===== Clock =====

const clockElement =
    document.getElementById(
        'nowTime'
    );

function updateClock() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, '0');

    const day =
        String(
            now.getDate()
        ).padStart(2, '0');

    const hours =
        String(
            now.getHours()
        ).padStart(2, '0');

    const minutes =
        String(
            now.getMinutes()
        ).padStart(2, '0');

    const seconds =
        String(
            now.getSeconds()
        ).padStart(2, '0');

    clockElement.textContent =
        `${year}-${month}-${day}
${hours}:${minutes}:${seconds}`;
}

updateClock();

setInterval(
    updateClock,
    1000
);

// ===== Load =====

async function loadMap() {

    geojson =
        await fetch(
            './src/japan.geojson'
        ).then(r => r.json());

    redraw();
}

// ===== Init =====

resize();

loadMap();