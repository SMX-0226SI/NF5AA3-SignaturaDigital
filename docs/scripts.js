// --- Navigation Logic ---
function switchTab(phaseId) {
    // Hide all contents
    document.getElementById('content-phase1').classList.add('hidden');
    document.getElementById('content-phase2').classList.add('hidden');
    document.getElementById('content-phase3').classList.add('hidden');
    
    // Show selected
    document.getElementById('content-' + phaseId).classList.remove('hidden');

    // Reset tabs styling
    const tabs = ['tab-phase1', 'tab-phase2', 'tab-phase3'];
    tabs.forEach(tab => {
        const el = document.getElementById(tab);
        el.classList.remove('tab-active', 'border-b-2', 'border-blue-600', 'text-blue-600');
        el.classList.add('tab-inactive');
    });

    // Activate selected tab
    const activeTab = document.getElementById('tab-' + phaseId);
    activeTab.classList.remove('tab-inactive');
    activeTab.classList.add('tab-active', 'border-b-2', 'border-blue-600', 'text-blue-600');
}

function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// --- Role Filtering Logic ---
let currentRole = 'all';
function filterSteps(role) {
    currentRole = role;
    
    // Reset buttons
    document.getElementById('btn-all').className = "px-3 py-1 text-sm rounded-md text-slate-600 hover:bg-slate-50 transition-colors";
    document.getElementById('btn-admin').className = "px-3 py-1 text-sm rounded-md text-slate-600 hover:bg-slate-50 transition-colors";
    document.getElementById('btn-client').className = "px-3 py-1 text-sm rounded-md text-slate-600 hover:bg-slate-50 transition-colors";

    // Highlight active button
    const activeClass = "px-3 py-1 text-sm rounded-md bg-blue-50 text-blue-700 font-medium transition-colors";
    document.getElementById('btn-' + role).className = activeClass;

    const adminSteps = document.querySelectorAll('.role-admin');
    const clientSteps = document.querySelectorAll('.role-client');

    if (role === 'all') {
        adminSteps.forEach(el => el.style.opacity = '1');
        clientSteps.forEach(el => el.style.opacity = '1');
    } else if (role === 'admin') {
        adminSteps.forEach(el => el.style.opacity = '1');
        clientSteps.forEach(el => el.style.opacity = '0.3');
    } else if (role === 'client') {
        adminSteps.forEach(el => el.style.opacity = '0.3');
        clientSteps.forEach(el => el.style.opacity = '1');
    }
}

// --- Progress Tracking Logic ---
function updateProgress() {
    const checkboxes = document.querySelectorAll('.task-checkbox');
    const total = checkboxes.length;
    let checked = 0;
    checkboxes.forEach(cb => {
        if (cb.checked) checked++;
    });

    const percent = Math.round((checked / total) * 100);
    document.getElementById('globalProgressBar').style.width = percent + '%';
    document.getElementById('globalProgressText').innerText = percent + '%';
}

// --- Grade Calculator Logic ---
function calculateGrade() {
    const pki = parseFloat(document.getElementById('range-pki').value);
    const sign = parseFloat(document.getElementById('range-sign').value);
    const doc = parseFloat(document.getElementById('range-doc').value);
    
    const total = pki + sign + doc;
    document.getElementById('finalGrade').innerText = total.toFixed(1);

    // Color change based on grade
    const gradeEl = document.getElementById('finalGrade');
    if (total < 5) gradeEl.className = "text-4xl font-bold text-red-400";
    else if (total < 8) gradeEl.className = "text-4xl font-bold text-yellow-400";
    else gradeEl.className = "text-4xl font-bold text-green-400";
}

// --- Chart.js Initialization ---
document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('gradeChart').getContext('2d');
    
    // Data derived from Source Report criteria
    const data = {
        labels: ['PKI Funcional (40%)', 'Signatura Correcta (30%)', 'Memòria Tècnica (30%)'],
        datasets: [{
            data: [40, 30, 30],
            backgroundColor: [
                '#3b82f6', // Blue 500
                '#22c55e', // Green 500
                '#a855f7'  // Purple 500
            ],
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    const config = {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8,
                        font: { size: 11, family: "'Inter', sans-serif" }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label;
                        }
                    }
                }
            },
            cutout: '70%',
        }
    };

    new Chart(ctx, config);
});