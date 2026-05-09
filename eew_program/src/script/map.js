const mapContainer = document.getElementById('map-container');
const baseCanvas = document.getElementById('baseCanvas');
const overlayInfoCanvas = document.getElementById('overlayInfoCanvas');

const baseCtx = baseCanvas.getContext('2d');
const overlayInfoCtx = overlayInfoCanvas.getContext('2d');

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
    const zoom = scale / DEFAULT_SCALE;

    const limitX = width * zoom * 1.5;
    const limitY = height * zoom * 1.5;

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
export function moveToLatLon(lat, lon, targetScale) {
    scale = clampScale(targetScale);

    const proj = d3.geoMercator()
        .center([137, 38])
        .scale(scale)
        .translate([width / 2, height / 2]);

    const [x, y] = proj([lon, lat]);

    offsetX = width / 2 - x;
    offsetY = height / 2 - y;

    clampOffset();
    redraw();
}
export function fitIntensityRegions(
    intRegionData = currentIntData,
    padding = 80
) {
    if (!geojson) return;
    if (!intRegionData || intRegionData.length === 0) return;

    const codes = new Set(
        intRegionData.map(item => String(item.code))
    );

    const targetFeatures = geojson.features.filter(feature =>
        codes.has(String(feature.properties.code))
    );

    if (targetFeatures.length === 0) return;

    const collection = {
        type: 'FeatureCollection',
        features: targetFeatures
    };

    const fitProjection = d3.geoMercator()
        .center([137, 38])
        .fitExtent(
            [
                [padding, padding],
                [width - padding, height - padding]
            ],
            collection
        );

    const fittedScale = fitProjection.scale();
    const fittedTranslate = fitProjection.translate();

    scale = clampScale(fittedScale);

    // scale이 clamp되지 않은 경우
    if (scale === fittedScale) {
        offsetX = fittedTranslate[0] - width / 2;
        offsetY = fittedTranslate[1] - height / 2;
    }

    // scale이 min/max에 걸려 clamp된 경우
    else {
        const tempProjection = d3.geoMercator()
            .center([137, 38])
            .scale(scale)
            .translate([0, 0]);

        const path = d3.geoPath(tempProjection);
        const bounds = path.bounds(collection);

        const centerX = (bounds[0][0] + bounds[1][0]) / 2;
        const centerY = (bounds[0][1] + bounds[1][1]) / 2;

        offsetX = -centerX;
        offsetY = -centerY;
    }

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
        '#3c4250ff';

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
            '#505b6aff';

        baseCtx.fill('evenodd');

        // ===== Border =====

        baseCtx.strokeStyle =
            '#70849f';

        baseCtx.lineWidth = 1.5

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

export function drawIntOverlay(
    intRegionData = currentIntData
) {
    if (!geojson) return;

    currentIntData = intRegionData;

    overlayInfoCtx.clearRect(0, 0, width, height);

    const proj = projection();

    const intensityOrder = {
        "7": 1,
        "6+": 2,
        "6-": 3,
        "5+": 4,
        "5-": 5,
        "4": 6,
        "3": 7,
        "2": 8,
        "1": 9
    };

    const drawTargets = geojson.features
        .map(feature => {
            const code = feature.properties.code;

            const region = intRegionData.find(
                item => item.code === code
            );

            if (!region) return null;

            return {
                feature,
                region,
                intensity: region.maxInt
            };
        })
        .filter(Boolean)
        .sort((a, b) => {
            return intensityOrder[b.intensity] - intensityOrder[a.intensity];
        });

    drawTargets.forEach(({ feature, intensity }) => {
        const fillColor = color.intensity[intensity];

        if (!fillColor) return;

        overlayInfoCtx.beginPath();

        const path = d3.geoPath(proj, overlayInfoCtx);
        path(feature);

        overlayInfoCtx.fillStyle = fillColor;
        overlayInfoCtx.globalAlpha = 0.7;
        overlayInfoCtx.fill('evenodd');
        overlayInfoCtx.globalAlpha = 1;

        const centroid = d3.geoCentroid(feature);
        const point = proj(centroid);

        if (!point) return;

        const [cx, cy] = point;
        const img = intensityImages[intensity];

        if (img && img.complete) {
            const size = getIntensityImageSize();

            overlayInfoCtx.drawImage(
                img,
                cx - size / 2,
                cy - size / 2,
                size,
                size
            );
        }
    });
}
var mapImages = [];

export function addImageAtLatLon(
    img,
    lat,
    lon,
    baseSize = 32
) {

    mapImages.push({
        img,
        lat,
        lon,
        baseSize
    });

    redraw();
}
function drawMapImages() {

    const proj = projection();

    mapImages.forEach(item => {

        const point =
            proj([
                item.lon,
                item.lat
            ]);

        if (!point) return;

        const [x, y] = point;

        const zoom =
            scale / DEFAULT_SCALE;

        const size =
            Math.max(
                24,
                Math.min(
                    30,
                    item.baseSize /
                    Math.sqrt(zoom)
                )
            );

        overlayInfoCtx.drawImage(
            item.img,
            x - size / 2,
            y - size / 2,
            size,
            size
        );
    });
}
export function clearMapImages() {

    mapImages = [];

    redraw();
}
// ===== Show / Hide =====
export function showInfoOverlay() {
    overlayInfoCanvas.style.opacity = '1';
    fitIntensityRegions(currentIntData);
}

export function hideInfoOverlay() {
    overlayInfoCanvas.style.opacity = '0';
}

// ===== Redraw =====

export function redraw() {

    if (!geojson) return;

    drawBase();

    drawIntOverlay(
        currentIntData
    );
    drawMapImages();
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