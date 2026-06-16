// Slides Navigation System
const slides = document.querySelectorAll('.slide');
const prevBtn = document.getElementById('prev-slide-btn');
const nextBtn = document.getElementById('next-slide-btn');
const progress = document.getElementById('presentation-progress');
const currentSlideNum = document.getElementById('current-slide-num');
const totalSlidesNum = document.getElementById('total-slides-num');
const fullscreenToggle = document.getElementById('fullscreen-toggle');

let currentSlideIdx = 0;
const totalSlides = slides.length;
totalSlidesNum.textContent = totalSlides;

function showSlide(idx) {
    if (idx < 0 || idx >= totalSlides) return;
    
    // Deactivate current slide
    slides[currentSlideIdx].classList.remove('active');
    
    // Activate new slide
    slides[idx].classList.add('active');
    currentSlideIdx = idx;
    
    // Update footer info
    currentSlideNum.textContent = idx + 1;
    progress.style.width = `${((idx + 1) / totalSlides) * 100}%`;
    
    // Update button states
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === totalSlides - 1;

    // Reset step-by-step simulator if leaving Slide 8
    if (idx !== 7) { // Slide 8 is index 7 (0-based)
        if (typeof stopAutoplay === 'function') {
            stopAutoplay();
        }
        resetSimulator();
    }
}

function nextSlide() {
    if (currentSlideIdx < totalSlides - 1) {
        showSlide(currentSlideIdx + 1);
    }
}

function prevSlide() {
    if (currentSlideIdx > 0) {
        showSlide(currentSlideIdx - 1);
    }
}

// Navigation event listeners
prevBtn.addEventListener('click', prevSlide);
nextBtn.addEventListener('click', nextSlide);

// Keyboard controls
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'PageDown':
            e.preventDefault();
            nextSlide();
            break;
        case 'ArrowLeft':
        case 'Backspace':
        case 'PageUp':
            e.preventDefault();
            prevSlide();
            break;
        case 'Home':
            e.preventDefault();
            showSlide(0);
            break;
        case 'End':
            e.preventDefault();
            showSlide(totalSlides - 1);
            break;
        case 'f':
        case 'F':
            toggleFullscreen();
            break;
    }
});

// Fullscreen logic
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

fullscreenToggle.addEventListener('click', toggleFullscreen);

// Update fullscreen button indicator
document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        fullscreenToggle.textContent = '📥';
        fullscreenToggle.title = "Exit Fullscreen (F)";
    } else {
        fullscreenToggle.textContent = '⛶';
        fullscreenToggle.title = "Toggle Fullscreen (F)";
    }
});

// ==========================================
// Slide 6: Code Switcher Tab Logic
// ==========================================
// Let's implement code switching between solver.py and infrastructure.py
const codeFileName = document.getElementById('code-file-name');
const codeSnippetBox = document.getElementById('code-snippet-box');

const codeTemplates = {
    solver: `<span class="comment"># Manual Dijkstra Implementation Loop</span>
<span class="keyword">def</span> <span class="function">get_shortest_path_manual</span>(graph, start, end):
    distances = {node: <span class="function">float</span>(<span class="string">'inf'</span>) <span class="keyword">for</span> node <span class="keyword">in</span> graph.nodes()}
    distances[start] = <span class="number">0</span>
    previous = {node: <span class="keyword">None</span> <span class="keyword">for</span> node <span class="keyword">in</span> graph.nodes()}
    unvisited = <span class="function">list</span>(graph.nodes())
    
    <span class="keyword">while</span> unvisited:
        <span class="comment"># Select node with minimum tentative distance</span>
        current = <span class="function">min</span>(unvisited, key=<span class="keyword">lambda</span> n: distances[n])
        <span class="keyword">if</span> distances[current] == <span class="function">float</span>(<span class="string">'inf'</span>): <span class="keyword">break</span>
        <span class="keyword">if</span> current == end: <span class="keyword">break</span>
            
        unvisited.remove(current)
        
        <span class="keyword">for</span> neighbor <span class="keyword">in</span> graph.neighbors(current):
            weight = graph[current][neighbor][<span class="string">'weight'</span>]
            new_dist = distances[current] + weight
            <span class="keyword">if</span> new_dist &lt; distances[neighbor]:
                distances[neighbor] = new_dist
                previous[neighbor] = current
                
    <span class="keyword">return</span> path, distance`,
    
    infrastructure: `<span class="comment"># Regional Infrastructure Graph Model</span>
<span class="keyword">import</span> networkx <span class="keyword">as</span> nx
<span class="keyword">import</span> urllib.request, json

<span class="keyword">def</span> <span class="function">fetch_real_road_geometry</span>(lon1, lat1, lon2, lat2):
    url = <span class="string">f"http://router.project-osrm.org/route/v1/driving/\${lon1},\${lat1};\${lon2},\${lat2}?overview=full&geometries=geojson"</span>
    <span class="keyword">try</span>:
        req = urllib.request.Request(url, headers={<span class="string">'User-Agent'</span>: <span class="string">'Mozilla/5.0'</span>})
        <span class="keyword">with</span> urllib.request.urlopen(req, timeout=<span class="number">7</span>) <span class="keyword">as</span> response:
            data = json.loads(response.read().decode())
            <span class="keyword">if</span> data.get(<span class="string">'routes'</span>):
                <span class="keyword">return</span> data[<span class="string">'routes'</span>][<span class="number">0</span>][<span class="string">'geometry'</span>][<span class="string">'coordinates'</span>]
    <span class="keyword">except</span> Exception:
        <span class="keyword">return</span> <span class="keyword">None</span>

<span class="comment"># Define 15 Dutch cities & coordinates</span>
cities = {
    <span class="string">"Rotterdam"</span>: (<span class="number">4.4777</span>, <span class="number">51.9244</span>), <span class="string">"The Hague"</span>: (<span class="number">4.3007</span>, <span class="number">52.0705</span>),
    <span class="string">"Amsterdam"</span>: (<span class="number">4.9041</span>, <span class="number">52.3676</span>), <span class="string">"Utrecht"</span>: (<span class="number">5.1214</span>, <span class="number">52.0907</span>),
    <span class="string">"Almere"</span>: (<span class="number">5.2236</span>, <span class="number">52.3718</span>), ...
}`
};

// Add tab-switch capability programmatically to code window
const codeHeader = document.querySelector('.code-header');
if (codeHeader) {
    const tabContainer = document.createElement('div');
    tabContainer.style.display = 'flex';
    tabContainer.style.gap = '10px';
    tabContainer.style.marginLeft = '20px';
    
    const solverTab = document.createElement('button');
    solverTab.textContent = 'solver.py';
    solverTab.style.background = 'rgba(0, 229, 255, 0.15)';
    solverTab.style.border = '1px solid var(--color-cyan)';
    solverTab.style.color = 'var(--color-cyan)';
    solverTab.style.padding = '4px 10px';
    solverTab.style.borderRadius = '4px';
    solverTab.style.cursor = 'pointer';
    solverTab.style.fontSize = '0.75rem';
    
    const infraTab = document.createElement('button');
    infraTab.textContent = 'infrastructure.py';
    infraTab.style.background = 'rgba(255, 255, 255, 0.05)';
    infraTab.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    infraTab.style.color = 'var(--color-text-muted)';
    infraTab.style.padding = '4px 10px';
    infraTab.style.borderRadius = '4px';
    infraTab.style.cursor = 'pointer';
    infraTab.style.fontSize = '0.75rem';
    
    tabContainer.appendChild(solverTab);
    tabContainer.appendChild(infraTab);
    
    // Insert after the red/yellow/green dots
    const dotsElement = codeHeader.querySelector('.dots');
    if (dotsElement) {
        dotsElement.after(tabContainer);
    }
    
    solverTab.addEventListener('click', () => {
        codeFileName.textContent = 'solver.py (Dijkstra Core)';
        codeSnippetBox.innerHTML = codeTemplates.solver;
        solverTab.style.background = 'rgba(0, 229, 255, 0.15)';
        solverTab.style.borderColor = 'var(--color-cyan)';
        solverTab.style.color = 'var(--color-cyan)';
        infraTab.style.background = 'rgba(255, 255, 255, 0.05)';
        infraTab.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        infraTab.style.color = 'var(--color-text-muted)';
    });
    
    infraTab.addEventListener('click', () => {
        codeFileName.textContent = 'infrastructure.py (OSRM API)';
        codeSnippetBox.innerHTML = codeTemplates.infrastructure;
        infraTab.style.background = 'rgba(0, 229, 255, 0.15)';
        infraTab.style.borderColor = 'var(--color-cyan)';
        infraTab.style.color = 'var(--color-cyan)';
        solverTab.style.background = 'rgba(255, 255, 255, 0.05)';
        solverTab.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        solverTab.style.color = 'var(--color-text-muted)';
    });
}

// ==========================================
// Slide 8: Dijkstra Step-by-Step Simulator
// ==========================================
const simStepsList = document.getElementById('sim-steps-list');
const simNodesGrid = document.getElementById('sim-nodes-grid');
const simPrevBtn = document.getElementById('sim-prev-btn');
const simPlayBtn = document.getElementById('sim-play-btn');
const simNextBtn = document.getElementById('sim-next-btn');

const nodesList = [
    "Rotterdam", "The Hague", "Breda", "Utrecht", "Amsterdam", 
    "Tilburg", "'s-Hertogenbosch", "Veenendaal", "Eindhoven", 
    "Almere", "Arnhem", "Zwolle", "Meppel", "Leeuwarden", "Groningen"
];

// Dijkstra Execution Steps Data
const dijkstraSteps = [
    {
        num: 0,
        current: null,
        visited: [],
        distances: { Rotterdam: 0 },
        parents: {},
        desc: "Initialize Rotterdam as source (0 KM) and all other nodes to infinity (∞). All nodes unvisited."
    },
    {
        num: 1,
        current: "Rotterdam",
        visited: ["Rotterdam"],
        distances: { Rotterdam: 0, "The Hague": 26, Breda: 48, Utrecht: 62 },
        parents: { "The Hague": "Rotterdam", Breda: "Rotterdam", Utrecht: "Rotterdam" },
        desc: "Select unvisited node with minimum tentative distance: Rotterdam (0 KM). Relax outgoing edges: The Hague (26 KM), Breda (48 KM), and Utrecht (62 KM)."
    },
    {
        num: 2,
        current: "The Hague",
        visited: ["Rotterdam", "The Hague"],
        distances: { Rotterdam: 0, "The Hague": 26, Breda: 48, Utrecht: 62, Amsterdam: 91 },
        parents: { "The Hague": "Rotterdam", Breda: "Rotterdam", Utrecht: "Rotterdam", Amsterdam: "The Hague" },
        desc: "Select next smallest unvisited node: The Hague (26 KM). Relax edge to Amsterdam. Tentative distance to Amsterdam becomes 26 + 65 = 91 KM."
    },
    {
        num: 3,
        current: "Breda",
        visited: ["Rotterdam", "The Hague", "Breda"],
        distances: { Rotterdam: 0, "The Hague": 26, Breda: 48, Utrecht: 62, Tilburg: 73, Amsterdam: 91 },
        parents: { "The Hague": "Rotterdam", Breda: "Rotterdam", Utrecht: "Rotterdam", Amsterdam: "The Hague", Tilburg: "Breda" },
        desc: "Select next smallest unvisited node: Breda (48 KM). Relax edge to Tilburg. Tentative distance to Tilburg is 48 + 25 = 73 KM."
    },
    {
        num: 4,
        current: "Utrecht",
        visited: ["Rotterdam", "The Hague", "Breda", "Utrecht"],
        distances: { Rotterdam: 0, "The Hague": 26, Breda: 48, Utrecht: 62, Tilburg: 73, Amsterdam: 91, Veenendaal: 95 },
        parents: { "The Hague": "Rotterdam", Breda: "Rotterdam", Utrecht: "Rotterdam", Amsterdam: "The Hague", Tilburg: "Breda", Veenendaal: "Utrecht" },
        desc: "Select next smallest unvisited node: Utrecht (62 KM). Relax edges. Veenendaal becomes 95 KM. Amsterdam is not updated as 62 + 45 (107 KM) > 91 KM."
    },
    {
        num: 5,
        current: "Tilburg",
        visited: ["Rotterdam", "The Hague", "Breda", "Utrecht", "Tilburg"],
        distances: { Rotterdam: 0, "The Hague": 26, Breda: 48, Utrecht: 62, Tilburg: 73, Amsterdam: 91, Veenendaal: 95, "'s-Hertogenbosch": 98, Eindhoven: 108 },
        parents: { "The Hague": "Rotterdam", Breda: "Rotterdam", Utrecht: "Rotterdam", Amsterdam: "The Hague", Tilburg: "Breda", Veenendaal: "Utrecht", "'s-Hertogenbosch": "Tilburg", Eindhoven: "Tilburg" },
        desc: "Select next smallest unvisited node: Tilburg (73 KM). Relax edges to Eindhoven (108 KM) and 's-Hertogenbosch (98 KM)."
    },
    {
        num: 6,
        current: "Amsterdam",
        visited: ["Rotterdam", "The Hague", "Breda", "Utrecht", "Tilburg", "Amsterdam"],
        distances: { Rotterdam: 0, "The Hague": 26, Breda: 48, Utrecht: 62, Tilburg: 73, Amsterdam: 91, Veenendaal: 95, "'s-Hertogenbosch": 98, Eindhoven: 108, Almere: 121 },
        parents: { "The Hague": "Rotterdam", Breda: "Rotterdam", Utrecht: "Rotterdam", Amsterdam: "The Hague", Tilburg: "Breda", Veenendaal: "Utrecht", "'s-Hertogenbosch": "Tilburg", Eindhoven: "Tilburg", Almere: "Amsterdam" },
        desc: "Select next smallest unvisited: Amsterdam (91 KM). Relax edge to Almere. Tentative distance to Almere is updated to 91 + 30 = 121 KM."
    },
    {
        num: 7,
        current: "Veenendaal",
        visited: ["Rotterdam", "The Hague", "Breda", "Utrecht", "Tilburg", "Amsterdam", "Veenendaal"],
        distances: { Rotterdam: 0, "The Hague": 26, Breda: 48, Utrecht: 62, Tilburg: 73, Amsterdam: 91, Veenendaal: 95, "'s-Hertogenbosch": 98, Eindhoven: 108, Almere: 121, Arnhem: 125 },
        parents: { "The Hague": "Rotterdam", Breda: "Rotterdam", Utrecht: "Rotterdam", Amsterdam: "The Hague", Tilburg: "Breda", Veenendaal: "Utrecht", "'s-Hertogenbosch": "Tilburg", Eindhoven: "Tilburg", Almere: "Amsterdam", Arnhem: "Veenendaal" },
        desc: "Select next smallest unvisited: Veenendaal (95 KM). Relax edge to Arnhem. Tentative distance to Arnhem is updated to 95 + 30 = 125 KM."
    },
    {
        num: 8,
        current: "'s-Hertogenbosch",
        visited: ["Rotterdam", "The Hague", "Breda", "Utrecht", "Tilburg", "Amsterdam", "Veenendaal", "'s-Hertogenbosch"],
        distances: { Rotterdam: 0, "The Hague": 26, Breda: 48, Utrecht: 62, Tilburg: 73, Amsterdam: 91, Veenendaal: 95, "'s-Hertogenbosch": 98, Eindhoven: 108, Almere: 121, Arnhem: 125 },
        parents: { "The Hague": "Rotterdam", Breda: "Rotterdam", Utrecht: "Rotterdam", Amsterdam: "The Hague", Tilburg: "Breda", Veenendaal: "Utrecht", "'s-Hertogenbosch": "Tilburg", Eindhoven: "Tilburg", Almere: "Amsterdam", Arnhem: "Veenendaal" },
        desc: "Select next smallest unvisited: 's-Hertogenbosch (98 KM). Relax edges. No updates since paths to Utrecht and Arnhem are longer than current values."
    },
    {
        num: 9,
        current: "Eindhoven",
        visited: ["Rotterdam", "The Hague", "Breda", "Utrecht", "Tilburg", "Amsterdam", "Veenendaal", "'s-Hertogenbosch", "Eindhoven"],
        distances: { Rotterdam: 0, "The Hague": 26, Breda: 48, Utrecht: 62, Tilburg: 73, Amsterdam: 91, Veenendaal: 95, "'s-Hertogenbosch": 98, Eindhoven: 108, Almere: 121, Arnhem: 125 },
        parents: { "The Hague": "Rotterdam", Breda: "Rotterdam", Utrecht: "Rotterdam", Amsterdam: "The Hague", Tilburg: "Breda", Veenendaal: "Utrecht", "'s-Hertogenbosch": "Tilburg", Eindhoven: "Tilburg", Almere: "Amsterdam", Arnhem: "Veenendaal" },
        desc: "Select next smallest unvisited: Eindhoven (108 KM). Relax outgoing edges. No updates."
    },
    {
        num: 10,
        current: "Almere",
        visited: ["Rotterdam", "The Hague", "Breda", "Utrecht", "Tilburg", "Amsterdam", "Veenendaal", "'s-Hertogenbosch", "Eindhoven", "Almere"],
        distances: { Rotterdam: 0, "The Hague": 26, Breda: 48, Utrecht: 62, Tilburg: 73, Amsterdam: 91, Veenendaal: 95, "'s-Hertogenbosch": 98, Eindhoven: 108, Almere: 121, Arnhem: 125, Zwolle: 196 },
        parents: { "The Hague": "Rotterdam", Breda: "Rotterdam", Utrecht: "Rotterdam", Amsterdam: "The Hague", Tilburg: "Breda", Veenendaal: "Utrecht", "'s-Hertogenbosch": "Tilburg", Eindhoven: "Tilburg", Almere: "Amsterdam", Arnhem: "Veenendaal", Zwolle: "Almere" },
        desc: "Select next smallest unvisited: Almere (121 KM). Relax edge to Zwolle. Tentative distance to Zwolle is updated to 121 + 75 = 196 KM."
    },
    {
        num: 11,
        current: "Arnhem",
        visited: ["Rotterdam", "The Hague", "Breda", "Utrecht", "Tilburg", "Amsterdam", "Veenendaal", "'s-Hertogenbosch", "Eindhoven", "Almere", "Arnhem"],
        distances: { Rotterdam: 0, "The Hague": 26, Breda: 48, Utrecht: 62, Tilburg: 73, Amsterdam: 91, Veenendaal: 95, "'s-Hertogenbosch": 98, Eindhoven: 108, Almere: 121, Arnhem: 125, Zwolle: 196 },
        parents: { "The Hague": "Rotterdam", Breda: "Rotterdam", Utrecht: "Rotterdam", Amsterdam: "The Hague", Tilburg: "Breda", Veenendaal: "Utrecht", "'s-Hertogenbosch": "Tilburg", Eindhoven: "Tilburg", Almere: "Amsterdam", Arnhem: "Veenendaal", Zwolle: "Almere" },
        desc: "Select next smallest unvisited: Arnhem (125 KM). Relax edge to Zwolle. No update since 125 + 80 (205 KM) > 196 KM."
    },
    {
        num: 12,
        current: "Zwolle",
        visited: ["Rotterdam", "The Hague", "Breda", "Utrecht", "Tilburg", "Amsterdam", "Veenendaal", "'s-Hertogenbosch", "Eindhoven", "Almere", "Arnhem", "Zwolle"],
        distances: { Rotterdam: 0, "The Hague": 26, Breda: 48, Utrecht: 62, Tilburg: 73, Amsterdam: 91, Veenendaal: 95, "'s-Hertogenbosch": 98, Eindhoven: 108, Almere: 121, Arnhem: 125, Zwolle: 196, Meppel: 224 },
        parents: { "The Hague": "Rotterdam", Breda: "Rotterdam", Utrecht: "Rotterdam", Amsterdam: "The Hague", Tilburg: "Breda", Veenendaal: "Utrecht", "'s-Hertogenbosch": "Tilburg", Eindhoven: "Tilburg", Almere: "Amsterdam", Arnhem: "Veenendaal", Zwolle: "Almere", Meppel: "Zwolle" },
        desc: "Select next smallest unvisited: Zwolle (196 KM). Relax edge to Meppel. Tentative distance to Meppel is updated to 196 + 28 = 224 KM."
    },
    {
        num: 13,
        current: "Meppel",
        visited: ["Rotterdam", "The Hague", "Breda", "Utrecht", "Tilburg", "Amsterdam", "Veenendaal", "'s-Hertogenbosch", "Eindhoven", "Almere", "Arnhem", "Zwolle", "Meppel"],
        distances: { Rotterdam: 0, "The Hague": 26, Breda: 48, Utrecht: 62, Tilburg: 73, Amsterdam: 91, Veenendaal: 95, "'s-Hertogenbosch": 98, Eindhoven: 108, Almere: 121, Arnhem: 125, Zwolle: 196, Meppel: 224, Leeuwarden: 284, Groningen: 299 },
        parents: { "The Hague": "Rotterdam", Breda: "Rotterdam", Utrecht: "Rotterdam", Amsterdam: "The Hague", Tilburg: "Breda", Veenendaal: "Utrecht", "'s-Hertogenbosch": "Tilburg", Eindhoven: "Tilburg", Almere: "Amsterdam", Arnhem: "Veenendaal", Zwolle: "Almere", Meppel: "Zwolle", Leeuwarden: "Meppel", Groningen: "Meppel" },
        desc: "Select next smallest unvisited: Meppel (224 KM). Relax edges to Leeuwarden (284 KM) and Groningen (299 KM)."
    },
    {
        num: 14,
        current: "Leeuwarden",
        visited: ["Rotterdam", "The Hague", "Breda", "Utrecht", "Tilburg", "Amsterdam", "Veenendaal", "'s-Hertogenbosch", "Eindhoven", "Almere", "Arnhem", "Zwolle", "Meppel", "Leeuwarden"],
        distances: { Rotterdam: 0, "The Hague": 26, Breda: 48, Utrecht: 62, Tilburg: 73, Amsterdam: 91, Veenendaal: 95, "'s-Hertogenbosch": 98, Eindhoven: 108, Almere: 121, Arnhem: 125, Zwolle: 196, Meppel: 224, Leeuwarden: 284, Groningen: 299 },
        parents: { "The Hague": "Rotterdam", Breda: "Rotterdam", Utrecht: "Rotterdam", Amsterdam: "The Hague", Tilburg: "Breda", Veenendaal: "Utrecht", "'s-Hertogenbosch": "Tilburg", Eindhoven: "Tilburg", Almere: "Amsterdam", Arnhem: "Veenendaal", Zwolle: "Almere", Meppel: "Zwolle", Leeuwarden: "Meppel", Groningen: "Meppel" },
        desc: "Select next smallest unvisited: Leeuwarden (284 KM). Relax edge to Groningen. No update since 284 + 60 (344 KM) > 299 KM."
    },
    {
        num: 15,
        current: "Groningen",
        visited: ["Rotterdam", "The Hague", "Breda", "Utrecht", "Tilburg", "Amsterdam", "Veenendaal", "'s-Hertogenbosch", "Eindhoven", "Almere", "Arnhem", "Zwolle", "Meppel", "Leeuwarden", "Groningen"],
        distances: { Rotterdam: 0, "The Hague": 26, Breda: 48, Utrecht: 62, Tilburg: 73, Amsterdam: 91, Veenendaal: 95, "'s-Hertogenbosch": 98, Eindhoven: 108, Almere: 121, Arnhem: 125, Zwolle: 196, Meppel: 224, Leeuwarden: 284, Groningen: 299 },
        parents: { "The Hague": "Rotterdam", Breda: "Rotterdam", Utrecht: "Rotterdam", Amsterdam: "The Hague", Tilburg: "Breda", Veenendaal: "Utrecht", "'s-Hertogenbosch": "Tilburg", Eindhoven: "Tilburg", Almere: "Amsterdam", Arnhem: "Veenendaal", Zwolle: "Almere", Meppel: "Zwolle", Leeuwarden: "Meppel", Groningen: "Meppel" },
        desc: "Destination node Groningen reached with optimal distance of 299 KM! Backtrace paths to establish the route: Rotterdam ➔ The Hague ➔ Amsterdam ➔ Almere ➔ Zwolle ➔ Meppel ➔ Groningen."
    }
];

let currentSimStep = 0;
let playInterval = null;

function stopAutoplay() {
    if (playInterval) {
        clearInterval(playInterval);
        playInterval = null;
        if (simPlayBtn) {
            simPlayBtn.innerHTML = '▶ Play';
            simPlayBtn.classList.remove('playing');
        }
    }
}

function startAutoplay() {
    if (playInterval) return;
    
    // If we're already at the end when play is clicked, reset to 0 first
    if (currentSimStep === dijkstraSteps.length - 1) {
        renderSimulatorStep(0);
    } else {
        // Advance to the next step immediately to eliminate the delay
        renderSimulatorStep(currentSimStep + 1);
        if (currentSimStep === dijkstraSteps.length - 1) {
            return; // Already reached the end, no need to start interval
        }
    }
    
    if (simPlayBtn) {
        simPlayBtn.innerHTML = '⏸ Pause';
        simPlayBtn.classList.add('playing');
    }
    
    playInterval = setInterval(() => {
        if (currentSimStep < dijkstraSteps.length - 1) {
            renderSimulatorStep(currentSimStep + 1);
            // Stop when we reach the end
            if (currentSimStep === dijkstraSteps.length - 1) {
                stopAutoplay();
            }
        } else {
            stopAutoplay();
        }
    }, 2000);
}

function renderSimulatorStep(stepIdx) {
    const stepData = dijkstraSteps[stepIdx];
    const prevStepData = stepIdx > 0 ? dijkstraSteps[stepIdx - 1] : null;
    
    // Update active/completed class in step list
    const stepItems = document.querySelectorAll('.sim-step-item');
    stepItems.forEach((item, idx) => {
        item.classList.remove('active');
        item.classList.remove('completed');
        if (idx === stepIdx) {
            item.classList.add('active');
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else if (idx < stepIdx) {
            item.classList.add('completed');
        }
    });
    
    // Update progress bar
    const progressFill = document.getElementById('sim-progress-fill');
    const progressLabel = document.getElementById('sim-progress-label');
    if (progressFill && progressLabel) {
        const pct = ((stepIdx) / (dijkstraSteps.length - 1)) * 100;
        progressFill.style.width = `${pct}%`;
        progressLabel.textContent = `Step ${stepIdx} / ${dijkstraSteps.length - 1}`;
    }
    
    // Update nodes grid status with animations
    simNodesGrid.innerHTML = '';
    
    const optimalPath = ["Rotterdam", "The Hague", "Amsterdam", "Almere", "Zwolle", "Meppel", "Groningen"];
    const isFinalStep = stepIdx === dijkstraSteps.length - 1;
    
    nodesList.forEach((node, i) => {
        const isCurrent = stepData.current === node;
        const isVisited = stepData.visited.includes(node);
        const dist = stepData.distances[node] !== undefined ? stepData.distances[node] : Infinity;
        const parent = stepData.parents[node] || 'None';
        const isOnOptimalPath = isFinalStep && optimalPath.includes(node);
        
        // Detect if distance was just updated this step
        let wasUpdated = false;
        let changeBadgeHtml = '';
        if (prevStepData) {
            const prevDist = prevStepData.distances[node] !== undefined ? prevStepData.distances[node] : Infinity;
            if (dist !== prevDist && dist !== Infinity) {
                wasUpdated = true;
                const prevDistLabel = prevDist === Infinity ? '∞' : prevDist + ' KM';
                changeBadgeHtml = `<span class="dist-change-badge">${prevDistLabel} → ${dist} KM</span>`;
            }
        }
        
        let statusClass = '';
        let statusIcon = '○';  // unvisited
        
        if (isOnOptimalPath) {
            statusClass = 'on-path';
            statusIcon = '★';
        } else if (isCurrent) {
            statusClass = 'current';
            statusIcon = '◉';
        } else if (wasUpdated) {
            statusClass = 'updated';
            statusIcon = '↓';
        } else if (isVisited) {
            statusClass = 'visited';
            statusIcon = '✓';
        }
        
        const card = document.createElement('div');
        card.className = `node-status-card ${statusClass} animate-in`;
        card.style.animationDelay = `${i * 20}ms`;
        
        card.innerHTML = `
            <span class="node-status-icon">${statusIcon}</span>
            <div class="node-name">${node}</div>
            <div class="node-distance">Distance: ${dist === Infinity ? '∞' : dist + ' KM'}${changeBadgeHtml}</div>
            <div class="node-parent">Parent: ${parent}</div>
        `;
        
        simNodesGrid.appendChild(card);
    });
    
    // Add Route Found Completion Banner on Final Step
    if (isFinalStep) {
        const routeBanner = document.createElement('div');
        routeBanner.className = 'sim-route-found';
        routeBanner.style.gridColumn = '1 / -1';
        routeBanner.style.marginTop = '15px';
        routeBanner.innerHTML = `
            <h4>Shortest Route Established!</h4>
            <p><strong>Rotterdam</strong> ➔ <strong>The Hague</strong> ➔ <strong>Amsterdam</strong> ➔ <strong>Almere</strong> ➔ <strong>Zwolle</strong> ➔ <strong>Meppel</strong> ➔ <strong>Groningen</strong> (Total: 299 KM)</p>
        `;
        simNodesGrid.appendChild(routeBanner);
    }
    
    // Button states
    simPrevBtn.disabled = stepIdx === 0;
    simNextBtn.disabled = stepIdx === dijkstraSteps.length - 1;
    currentSimStep = stepIdx;
}

function initSimulator() {
    // Add progress bar before scroller
    const controlPanel = document.querySelector('.sim-control-panel');
    if (controlPanel && !document.getElementById('sim-progress-fill')) {
        const progressWrapper = document.createElement('div');
        progressWrapper.innerHTML = `
            <div class="sim-progress-label" id="sim-progress-label">Step 0 / ${dijkstraSteps.length - 1}</div>
            <div class="sim-progress-bar"><div class="sim-progress-fill" id="sim-progress-fill" style="width: 0%"></div></div>
        `;
        controlPanel.insertBefore(progressWrapper, controlPanel.firstChild);
    }
    
    // Add legend to the visualization panel title
    const titleEl = document.querySelector('.network-table-title');
    if (titleEl && !titleEl.querySelector('.legend-strip')) {
        const legend = document.createElement('div');
        legend.className = 'legend-strip';
        legend.innerHTML = `
            <span class="legend-item"><span class="legend-dot dot-current"></span>Current</span>
            <span class="legend-item"><span class="legend-dot dot-updated"></span>Updated</span>
            <span class="legend-item"><span class="legend-dot dot-visited"></span>Visited</span>
            <span class="legend-item"><span class="legend-dot dot-unvisited"></span>Unvisited</span>
        `;
        titleEl.appendChild(legend);
    }
    
    // Populate the step-by-step description panel
    simStepsList.innerHTML = '';
    dijkstraSteps.forEach((step, idx) => {
        const stepItem = document.createElement('div');
        stepItem.className = 'sim-step-item';
        if (idx === 0) stepItem.classList.add('active');
        
        stepItem.innerHTML = `
            <div class="sim-step-num">${step.num}</div>
            <div class="sim-step-desc">${step.desc}</div>
        `;
        
        stepItem.addEventListener('click', () => {
            stopAutoplay();
            renderSimulatorStep(idx);
        });
        
        simStepsList.appendChild(stepItem);
    });
    
    // Initialize nodes grid
    renderSimulatorStep(0);
}

function resetSimulator() {
    stopAutoplay();
    currentSimStep = 0;
    renderSimulatorStep(0);
}

simPrevBtn.addEventListener('click', () => {
    stopAutoplay();
    if (currentSimStep > 0) {
        renderSimulatorStep(currentSimStep - 1);
    }
});

simNextBtn.addEventListener('click', () => {
    stopAutoplay();
    if (currentSimStep < dijkstraSteps.length - 1) {
        renderSimulatorStep(currentSimStep + 1);
    }
});

if (simPlayBtn) {
    simPlayBtn.addEventListener('click', () => {
        if (playInterval) {
            stopAutoplay();
        } else {
            startAutoplay();
        }
    });
}

// Initialize simulation on load
document.addEventListener('DOMContentLoaded', () => {
    initSimulator();
});
