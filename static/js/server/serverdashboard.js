document.addEventListener('DOMContentLoaded', function() {
    function updateCurrentDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', options);
    }
    
    updateCurrentDate();
    
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.server-sidebar');
    const mainContent = document.querySelector('.server-main-content');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
            
            const icon = sidebarToggle.querySelector('i');
            if (sidebar.classList.contains('collapsed')) {
                icon.className = 'fas fa-bars';
            } else {
                icon.className = 'fas fa-times';
            }
        });
    }
    
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const dropdown = this.closest('.nav-dropdown');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            this.classList.toggle('active');
            menu.classList.toggle('show');
        });
    });
    
    const systemSettingsLinks = document.querySelectorAll('.system-settings-link');
    const unauthorizedModal = document.getElementById('unauthorizedModal');
    const closeModal = document.querySelector('.close-modal');
    
    systemSettingsLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const hasAccess = this.getAttribute('data-has-access') === 'true';
            
            if (!hasAccess) {
                e.preventDefault();
                unauthorizedModal.style.display = 'flex';
            }
        });
    });
    
    if (closeModal && unauthorizedModal) {
        closeModal.addEventListener('click', function() {
            unauthorizedModal.style.display = 'none';
        });
        
        unauthorizedModal.addEventListener('click', function(e) {
            if (e.target === unauthorizedModal) {
                unauthorizedModal.style.display = 'none';
            }
        });
    }
    
    let userChart = null;
    let eventChart = null;
    
    function getWeekDates() {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diff));
        
        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            weekDates.push(date);
        }
        return weekDates;
    }
    
    function getMonthNames() {
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    }
    
    function getYears() {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = 0; i < 10; i++) {
            years.push(currentYear - i);
        }
        return years.reverse();
    }
    
    function initializeCharts() {
        const userCtx = document.getElementById('userRegistrationChart').getContext('2d');
        userChart = new Chart(userCtx, {
            type: 'line',
            data: {
                labels: getMonthNames(),
                datasets: [{
                    label: 'User Registrations',
                    data: dashboardData.userRegistration.data,
                    borderColor: '#E64980',
                    backgroundColor: 'rgba(230, 73, 128, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#E64980',
                    pointBorderColor: '#151C2C',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: '#151C2C',
                        titleColor: '#E8EAF6',
                        bodyColor: '#A0AEC0',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#A0AEC0' }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#A0AEC0', precision: 0 },
                        beginAtZero: true
                    }
                }
            }
        });
        
        const eventCtx = document.getElementById('eventParticipationChart').getContext('2d');
        eventChart = new Chart(eventCtx, {
            type: 'bar',
            data: {
                labels: dashboardData.eventParticipation.labels,
                datasets: [{
                    label: 'Participants',
                    data: dashboardData.eventParticipation.data,
                    backgroundColor: '#6D6AFF',
                    borderColor: '#7C5CFF',
                    borderWidth: 2,
                    borderRadius: 6,
                    hoverBackgroundColor: '#7C5CFF'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#151C2C',
                        titleColor: '#E8EAF6',
                        bodyColor: '#A0AEC0',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#A0AEC0' }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#A0AEC0', precision: 0 },
                        beginAtZero: true
                    }
                }
            }
        });
        
        const ageGroupCtx = document.getElementById('ageGroupChart').getContext('2d');
        const ageGroupChart = new Chart(ageGroupCtx, {
            type: 'pie',
            data: {
                labels: dashboardData.ageGroups.labels,
                datasets: [{
                    data: dashboardData.ageGroups.data,
                    backgroundColor: [
                        '#3A7BFA',
                        '#7C5CFF',
                        '#E64980',
                        '#29E3A8'
                    ],
                    borderColor: '#151C2C',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#A0AEC0',
                            padding: 20
                        }
                    }
                }
            }
        });
        
        const genderCtx = document.getElementById('genderChart').getContext('2d');
        const genderChart = new Chart(genderCtx, {
            type: 'doughnut',
            data: {
                labels: dashboardData.genders.labels,
                datasets: [{
                    data: dashboardData.genders.data,
                    backgroundColor: [
                        '#3A7BFA',
                        '#E64980',
                        '#29E3A8'
                    ],
                    borderColor: '#151C2C',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#A0AEC0',
                            padding: 20
                        }
                    }
                }
            }
        });
        
        const educationCtx = document.getElementById('educationChart').getContext('2d');
        const educationChart = new Chart(educationCtx, {
            type: 'bar',
            data: {
                labels: dashboardData.educations.labels,
                datasets: [{
                    label: 'Users',
                    data: dashboardData.educations.data,
                    backgroundColor: '#3A7BFA',
                    borderColor: '#7C5CFF',
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#A0AEC0' }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#A0AEC0', precision: 0 },
                        beginAtZero: true
                    }
                }
            }
        });
        
        const youthClassCtx = document.getElementById('youthClassChart').getContext('2d');
        const youthClassChart = new Chart(youthClassCtx, {
            type: 'bar',
            data: {
                labels: dashboardData.youthClassifications.labels,
                datasets: [{
                    label: 'Users',
                    data: dashboardData.youthClassifications.data,
                    backgroundColor: '#7C5CFF',
                    borderColor: '#6D6AFF',
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#A0AEC0' }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#A0AEC0', precision: 0 },
                        beginAtZero: true
                    }
                }
            }
        });
        
        const workStatusCtx = document.getElementById('workStatusChart').getContext('2d');
        const workStatusChart = new Chart(workStatusCtx, {
            type: 'bar',
            data: {
                labels: dashboardData.workStatuses.labels,
                datasets: [{
                    label: 'Users',
                    data: dashboardData.workStatuses.data,
                    backgroundColor: '#E64980',
                    borderColor: '#FF6B9C',
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#A0AEC0' }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#A0AEC0', precision: 0 },
                        beginAtZero: true
                    }
                }
            }
        });
        
        const civilStatusCtx = document.getElementById('civilStatusChart').getContext('2d');
        const civilStatusChart = new Chart(civilStatusCtx, {
            type: 'bar',
            data: {
                labels: dashboardData.civilStatuses.labels,
                datasets: [{
                    label: 'Users',
                    data: dashboardData.civilStatuses.data,
                    backgroundColor: '#29E3A8',
                    borderColor: '#4ADE80',
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#A0AEC0' }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#A0AEC0', precision: 0 },
                        beginAtZero: true
                    }
                }
            }
        });
        
        const userChartFilter = document.getElementById('userChartFilter');
        const eventChartFilter = document.getElementById('eventChartFilter');
        
        if (userChartFilter) {
            userChartFilter.addEventListener('change', function() {
                const value = this.value;
                if (value === 'week') {
                    const weekDates = getWeekDates();
                    const labels = weekDates.map(date => {
                        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                        return dayNames[date.getDay()];
                    });
                    userChart.data.labels = labels;
                } else if (value === 'year') {
                    userChart.data.labels = getMonthNames();
                } else if (value === 'annual') {
                    userChart.data.labels = getYears();
                }
                userChart.update();
            });
        }
        
        if (eventChartFilter) {
            eventChartFilter.addEventListener('change', function() {
                const value = this.value;
                if (value === 'week') {
                    const weekDates = getWeekDates();
                    const labels = weekDates.map(date => {
                        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                        return dayNames[date.getDay()];
                    });
                    eventChart.data.labels = labels;
                } else if (value === 'year') {
                    eventChart.data.labels = getMonthNames();
                } else if (value === 'annual') {
                    eventChart.data.labels = getYears();
                }
                eventChart.update();
            });
        }
    }
    
    function initAnimations() {
        const statCards = document.querySelectorAll('.stat-card');
        const chartCards = document.querySelectorAll('.chart-card');
        const demographicCards = document.querySelectorAll('.demographic-card');
        const activityCards = document.querySelectorAll('.activity-card');
        
        statCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 + (index * 100));
        });
        
        chartCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = `opacity 0.5s ease ${0.3 + (index * 0.1)}s, transform 0.5s ease ${0.3 + (index * 0.1)}s`;
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 300 + (index * 100));
        });
        
        demographicCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = `opacity 0.5s ease ${0.4 + (index * 0.1)}s, transform 0.5s ease ${0.4 + (index * 0.1)}s`;
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 400 + (index * 100));
        });
        
        activityCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = `opacity 0.5s ease ${0.6 + (index * 0.1)}s, transform 0.5s ease ${0.6 + (index * 0.1)}s`;
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 600 + (index * 100));
        });
    }
    
    function refreshDashboardData() {
        setTimeout(() => {
            window.location.reload();
        }, 300000);
    }
    
    initializeCharts();
    initAnimations();
    refreshDashboardData();
});