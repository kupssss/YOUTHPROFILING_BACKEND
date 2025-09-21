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
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    function initializeCharts() {
        const userCtx = document.getElementById('userRegistrationChart').getContext('2d');
        const userChart = new Chart(userCtx, {
            type: 'line',
            data: {
                labels: dashboardData.userRegistration.labels,
                datasets: [{
                    label: 'User Registrations',
                    data: dashboardData.userRegistration.data,
                    borderColor: '#42a5f5',
                    backgroundColor: 'rgba(66, 165, 245, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#42a5f5',
                    pointBorderColor: '#ffffff',
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
                        backgroundColor: 'rgba(26, 35, 126, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#bbdefb',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#bbdefb' }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#bbdefb', precision: 0 },
                        beginAtZero: true
                    }
                }
            }
        });
        
        const eventCtx = document.getElementById('eventParticipationChart').getContext('2d');
        const eventChart = new Chart(eventCtx, {
            type: 'bar',
            data: {
                labels: dashboardData.eventParticipation.labels,
                datasets: [{
                    label: 'Participants',
                    data: dashboardData.eventParticipation.data,
                    backgroundColor: 'rgba(76, 175, 80, 0.8)',
                    borderColor: 'rgba(76, 175, 80, 1)',
                    borderWidth: 2,
                    borderRadius: 6,
                    hoverBackgroundColor: 'rgba(76, 175, 80, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(26, 35, 126, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#bbdefb',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#bbdefb' }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#bbdefb', precision: 0 },
                        beginAtZero: true
                    }
                }
            }
        });
        
        const userChartFilter = document.getElementById('userChartFilter');
        const eventChartFilter = document.getElementById('eventChartFilter');
        
        if (userChartFilter) {
            userChartFilter.addEventListener('change', function() {
                console.log('User chart filter changed to:', this.value);
            });
        }
        
        if (eventChartFilter) {
            eventChartFilter.addEventListener('change', function() {
                console.log('Event chart filter changed to:', this.value);
            });
        }
    }
    
    function simulateLoading(chart) {
        chart.data.datasets[0].data = chart.data.datasets[0].data.map(() => 0);
        chart.update();
        
        setTimeout(() => {
            chart.data.datasets[0].data = dashboardData.userRegistration.data;
            chart.update();
        }, 1000);
    }
    
    function initAnimations() {
        const statCards = document.querySelectorAll('.stat-card');
        const chartCards = document.querySelectorAll('.chart-card');
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
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
