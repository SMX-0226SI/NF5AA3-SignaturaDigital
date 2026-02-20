// --- DATA STORE ---
const appData = {
    phases: [
        {
            id: 'phase1',
            title: "Instal·lació de la CA Arrel",
            description: "Configuració inicial del rol Active Directory Certificate Services en mode Standalone.",
            tasks: [
                { id: 'p1-1', role: 'admin', text: "Obrir Server Manager i afegir rol 'Active Directory Certificate Services'.", completed: false },
                { id: 'p1-2', role: 'admin', text: "Seleccionar només 'Certification Authority' i instal·lar.", completed: false },
                { id: 'p1-3', role: 'admin', text: "Configurar Post-instal·lació: Standalone CA, Root CA.", completed: false },
                { id: 'p1-4', role: 'admin', text: "Crear Clau Privada nova: 4096 bits.", completed: false },
                { id: 'p1-5', role: 'admin', text: "Nom comú: 'Nexus-Root-CA', Validesa: 5 anys.", completed: false }
            ],
            deliverables: [1] // ID of deliverable
        },
        {
            id: 'phase2',
            title: "Generació Certificat SSL",
            description: "Creació manual d'un certificat web amb SAN per assegurar el portal.",
            tasks: [
                { id: 'p2-1', role: 'admin', text: "PowerShell: Crear carpeta C:\\temp i fitxer 'servercert.inf'.", completed: false },
                { id: 'p2-2', role: 'admin', text: "Configurar el fitxer .inf amb Subject='CN=ca.nexus.test' i extensions SAN.", completed: false },
                { id: 'p2-3', role: 'admin', text: "Executar: certreq -new C:\\temp\\servercert.inf C:\\temp\\servercert.req", completed: false },
                { id: 'p2-4', role: 'admin', text: "Executar: certreq -submit ... (Seleccionar CA)", completed: false },
                { id: 'p2-5', role: 'admin', text: "Consola CA: Emetre la petició des de 'Pending Requests'.", completed: false },
                { id: 'p2-6', role: 'admin', text: "Executar: certreq -retrieve ... (Obtenir .cer)", completed: false },
                { id: 'p2-7', role: 'admin', text: "Executar: certreq -accept ... (Instal·lar certificat)", completed: false }
            ],
            deliverables: [2]
        },
        {
            id: 'phase3',
            title: "Portal Web i IIS",
            description: "Afegir el rol de Web Enrollment per permetre peticions via navegador.",
            tasks: [
                { id: 'p3-1', role: 'admin', text: "Server Manager: Afegir servei de rol 'Certification Authority Web Enrollment'.", completed: false },
                { id: 'p3-2', role: 'admin', text: "Executar configuració post-instal·lació per Web Enrollment.", completed: false }
            ],
            deliverables: []
        },
        {
            id: 'phase4',
            title: "Configuració IIS",
            description: "Enllaçar el certificat SSL al lloc web per defecte per habilitar HTTPS.",
            tasks: [
                { id: 'p4-1', role: 'admin', text: "Obrir IIS Manager -> Default Web Site.", completed: false },
                { id: 'p4-2', role: 'admin', text: "Bindings (Enllaços): Afegir HTTPS port 443.", completed: false },
                { id: 'p4-3', role: 'admin', text: "Seleccionar 'Certificat Web Nexus'.", completed: false },
                { id: 'p4-4', role: 'admin', text: "Provar accés local: https://ca.nexus.test/certsrv", completed: false }
            ],
            deliverables: [3]
        },
        {
            id: 'phase5',
            title: "Client i Signatura PDF",
            description: "Procés col·laboratiu final: el client confia en la CA, demana certificat i signa un document.",
            tasks: [
                { id: 'p5-1', role: 'client', text: "Client: Accedir a https://ca.nexus.test/certsrv (acceptar error seguretat).", completed: false },
                { id: 'p5-2', role: 'client', text: "Client: Descarregar certificat CA Arrel del portal.", completed: false },
                { id: 'p5-3', role: 'client', text: "Client: Instal·lar CA a 'Entitats de certificació arrel de confiança'. Reiniciar navegador.", completed: false },
                { id: 'p5-4', role: 'client', text: "Client: Demanar certificat d'usuari via web. Avisar Admin.", completed: false },
                { id: 'p5-5', role: 'admin', text: "Admin: Consola CA -> Pending Requests -> Emetre (Issue) el certificat.", completed: false },
                { id: 'p5-6', role: 'client', text: "Client: Web -> View Status -> Descarregar i instal·lar certificat d'usuari.", completed: false },
                { id: 'p5-7', role: 'client', text: "Client: Obrir PDF amb Adobe/Lector i signar amb el nou certificat.", completed: false },
                { id: 'p5-8', role: 'client', text: "Client: Tancar i reobrir PDF. Verificar 'Signatura Vàlida'.", completed: false }
            ],
            deliverables: [4, 5, 6, 7]
        }
    ],
    deliverablesList: [
        { id: 1, role: 'admin', title: "Captura 1: Consola CA", desc: "Arbre desplegat i nom 'Nexus-Root-CA'." },
        { id: 2, role: 'admin', title: "Captura 2: PowerShell", desc: "Èxit de les comandes certreq." },
        { id: 3, role: 'admin', title: "Captura 3: IIS Bindings", desc: "Enllaç HTTPS port 443 configurat." },
        { id: 4, role: 'client', title: "Captura 4: Magatzem Client", desc: "Certificat CA instal·lat a Arrels de Confiança." },
        { id: 5, role: 'client', title: "Captura 5: Navegador Segur", desc: "Portal web sense errors (cadenat tancat)." },
        { id: 6, role: 'admin', title: "Captura 6: CA Issued Certs", desc: "Mostrant certificat Web i certificat Usuari." },
        { id: 7, role: 'client', title: "Captura 7: PDF Signat", desc: "Panell de signatura indicant 'Vàlida'." }
    ]
};

// --- STATE MANAGEMENT ---
let currentView = 'overview';
let currentFilter = 'all';

// --- INIT & CHART SETUP ---
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    renderDeliverables();
    updateGlobalProgress();
});

let roleChart, phaseChart;

function initCharts() {
    // Calculate Initial Data
    const adminTasks = appData.phases.reduce((acc, p) => acc + p.tasks.filter(t => t.role === 'admin').length, 0);
    const clientTasks = appData.phases.reduce((acc, p) => acc + p.tasks.filter(t => t.role === 'client').length, 0);

    // Role Distribution Chart
    const ctxRole = document.getElementById('roleChart').getContext('2d');
    roleChart = new Chart(ctxRole, {
        type: 'doughnut',
        data: {
            labels: ['Admin Servidor', 'Client Windows'],
            datasets: [{
                data: [adminTasks, clientTasks],
                backgroundColor: ['#2563eb', '#10b981'], // Blue-600, Emerald-500
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    // Phase Progress Chart
    const ctxPhase = document.getElementById('phaseChart').getContext('2d');
    phaseChart = new Chart(ctxPhase, {
        type: 'bar',
        data: {
            labels: appData.phases.map(p => `Fase ${p.id.replace('phase', '')}`),
            datasets: [{
                label: '% Completat',
                data: [0, 0, 0, 0, 0],
                backgroundColor: '#6366f1', // Indigo-500
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 100 }
            }
        }
    });
}

// --- NAVIGATION LOGIC ---
function navigateTo(targetId) {
    // Update UI State
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden-section'));
    document.querySelectorAll('.nav-btn').forEach(el => {
        el.classList.remove('bg-indigo-50', 'text-indigo-700', 'font-medium');
        el.classList.add('text-slate-600');
    });

    // Activate Target
    const activeBtn = document.querySelector(`button[data-target="${targetId}"]`);
    if (activeBtn) {
        activeBtn.classList.remove('text-slate-600');
        activeBtn.classList.add('bg-indigo-50', 'text-indigo-700', 'font-medium');
    }

    if (targetId.startsWith('phase')) {
        renderPhase(targetId);
        document.getElementById('view-phase').classList.remove('hidden-section');
    } else if (targetId === 'deliverables') {
        document.getElementById('view-deliverables').classList.remove('hidden-section');
    } else {
        document.getElementById('view-overview').classList.remove('hidden-section');
        // Refresh charts just in case size changed while hidden
        roleChart.resize();
        phaseChart.resize();
    }
}

// --- RENDER LOGIC ---
function renderPhase(phaseId) {
    const phase = appData.phases.find(p => p.id === phaseId);
    if (!phase) return;

    // Header
    document.getElementById('phase-title').textContent = phase.title;
    document.getElementById('phase-desc').textContent = phase.description;

    // Deliverables Hint Logic
    const hintContainer = document.getElementById('phase-deliverables-hint');
    const hintList = document.getElementById('phase-deliverables-list');
    hintList.innerHTML = '';
    
    if (phase.deliverables && phase.deliverables.length > 0) {
        hintContainer.classList.remove('hidden-section');
        phase.deliverables.forEach(delId => {
            const del = appData.deliverablesList.find(d => d.id === delId);
            if (del) {
                const li = document.createElement('li');
                li.textContent = `${del.title}: ${del.desc}`;
                hintList.appendChild(li);
            }
        });
    } else {
        hintContainer.classList.add('hidden-section');
    }

    // Tasks
    renderTasks(phase);
}

function renderTasks(phase) {
    const container = document.getElementById('tasks-container');
    container.innerHTML = '';
    
    let visibleCount = 0;
    let completedVisible = 0;

    phase.tasks.forEach(task => {
        // Filter Logic
        if (currentFilter !== 'all') {
            if (currentFilter === 'admin' && task.role !== 'admin') return;
            if (currentFilter === 'client' && task.role !== 'client') return;
        }
        
        visibleCount++;
        if (task.completed) completedVisible++;

        const row = document.createElement('div');
        row.className = `p-4 flex items-start gap-4 transition-colors hover:bg-slate-50 ${task.completed ? 'bg-slate-50 opacity-75' : 'bg-white'}`;
        
        // Role Badge
        const badgeColor = task.role === 'admin' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200';
        const roleLabel = task.role === 'admin' ? 'Admin' : 'Client';
        
        // Checkbox ID
        const checkId = `task-${task.id}`;

        row.innerHTML = `
            <div class="mt-1">
                <input type="checkbox" id="${checkId}" ${task.completed ? 'checked' : ''} 
                    class="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    onchange="toggleTask('${phase.id}', '${task.id}')">
            </div>
            <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${badgeColor}">${roleLabel}</span>
                </div>
                <label for="${checkId}" class="text-sm text-slate-700 cursor-pointer ${task.completed ? 'line-through text-slate-400' : ''}">${task.text}</label>
            </div>
        `;
        container.appendChild(row);
    });

    // Update Progress Badge
    document.getElementById('phase-progress-badge').textContent = `${completedVisible}/${visibleCount}`;
}

function renderDeliverables() {
    const container = document.getElementById('deliverables-grid');
    container.innerHTML = '';

    appData.deliverablesList.forEach(del => {
        const card = document.createElement('div');
        card.className = "bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between";
        
        const badgeClass = del.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800';
        
        card.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-xl">📷</div>
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <h4 class="font-bold text-slate-800 text-sm">${del.title}</h4>
                        <span class="text-[10px] px-2 rounded-full font-bold uppercase ${badgeClass}">${del.role}</span>
                    </div>
                    <p class="text-xs text-slate-500">${del.desc}</p>
                </div>
            </div>
            <div class="h-6 w-6 rounded-full border-2 border-slate-300 flex items-center justify-center">
                <!-- Placeholder for check -->
                <div class="w-3 h-3 bg-transparent rounded-full"></div>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- ACTION HANDLERS ---

function filterTasks(filter) {
    currentFilter = filter;
    // Update buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active', 'bg-slate-100'); // Add basic active styles back if needed
            // Re-apply specific color styles based on type
            if(filter === 'admin') btn.classList.add('bg-blue-50');
            if(filter === 'client') btn.classList.add('bg-emerald-50');
        } else {
            btn.classList.remove('active', 'bg-slate-100', 'bg-blue-50', 'bg-emerald-50');
        }
    });
    
    // Re-render current phase
    const phaseId = appData.phases.find(p => p.id === document.querySelector('button[data-target].bg-indigo-50').dataset.target)?.id;
    if (phaseId) renderPhase(phaseId);
}

function toggleTask(phaseId, taskId) {
    const phase = appData.phases.find(p => p.id === phaseId);
    const task = phase.tasks.find(t => t.id === taskId);
    task.completed = !task.completed;
    
    // Re-render to update strikethrough and count
    renderTasks(phase);
    updateGlobalProgress();
}

function updateGlobalProgress() {
    let totalTasks = 0;
    let completedTasks = 0;
    const phasePercentages = [];

    appData.phases.forEach(p => {
        const phaseTotal = p.tasks.length;
        const phaseCompleted = p.tasks.filter(t => t.completed).length;
        
        totalTasks += phaseTotal;
        completedTasks += phaseCompleted;
        
        phasePercentages.push(Math.round((phaseCompleted / phaseTotal) * 100));
    });

    const globalPct = Math.round((completedTasks / totalTasks) * 100);

    // Update UI Header
    document.getElementById('global-progress-text').textContent = `${globalPct}%`;
    document.getElementById('global-progress-bar').style.width = `${globalPct}%`;

    // Update Phase Chart
    if (phaseChart) {
        phaseChart.data.datasets[0].data = phasePercentages;
        phaseChart.update();
    }
}

// Add simple fade-in animation
const style = document.createElement('style');
style.innerHTML = `
    .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    .active-filter { background-color: #e2e8f0; } 
`;
document.head.appendChild(style);
