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
    
    const viewRegBtns = document.querySelectorAll('.view-registrations-btn');
    const closeRegModal = document.getElementById('closeRegistrationsModal');
    const regModal = document.getElementById('registrationsModal');
    
    viewRegBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const eventId = this.getAttribute('data-event-id');
            openRegistrationsModal(eventId);
        });
    });
    
    if (closeRegModal) {
        closeRegModal.addEventListener('click', function() {
            regModal.classList.remove('active');
        });
    }
    
    const reviewModal = document.getElementById('reviewDocumentsModal');
    const closeReviewModal = document.getElementById('closeReviewModal');
    
    if (closeReviewModal) {
        closeReviewModal.addEventListener('click', function() {
            reviewModal.classList.remove('active');
        });
    }
    
    const approveBtn = document.getElementById('approveRegistration');
    const rejectBtn = document.getElementById('rejectRegistration');
    const waitlistBtn = document.getElementById('waitlistRegistration');
    
    if (approveBtn) {
        approveBtn.addEventListener('click', function() {
            const regId = this.getAttribute('data-reg-id');
            updateRegistrationStatus(regId, 'confirmed', 'Documents verified and approved');
        });
    }
    
    if (rejectBtn) {
        rejectBtn.addEventListener('click', function() {
            const regId = this.getAttribute('data-reg-id');
            updateRegistrationStatus(regId, 'cancelled', 'Documents did not meet requirements');
        });
    }
    
    if (waitlistBtn) {
        waitlistBtn.addEventListener('click', function() {
            const regId = this.getAttribute('data-reg-id');
            updateRegistrationStatus(regId, 'waitlisted', 'Placed on waitlist due to limited capacity');
        });
    }
    
    const attendanceBtns = document.querySelectorAll('.manage-attendance-btn');
    const closeAttendanceModal = document.getElementById('closeAttendanceModal');
    const attendanceModal = document.getElementById('attendanceModal');
    
    attendanceBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const eventId = this.getAttribute('data-event-id');
            openAttendanceModal(eventId);
        });
    });
    
    if (closeAttendanceModal) {
        closeAttendanceModal.addEventListener('click', function() {
            attendanceModal.classList.remove('active');
        });
    }
    
    const attendeesBtns = document.querySelectorAll('.attendees-btn');
    const closeAttendeesModal = document.getElementById('closeAttendeesModal');
    const attendeesModal = document.getElementById('attendeesModal');
    
    attendeesBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const eventId = this.getAttribute('data-event-id');
            openAttendeesModal(eventId);
        });
    });
    
    if (closeAttendeesModal) {
        closeAttendeesModal.addEventListener('click', function() {
            attendeesModal.classList.remove('active');
        });
    }
    
    document.addEventListener('click', function(e) {
        if (e.target === regModal) regModal.classList.remove('active');
        if (e.target === reviewModal) reviewModal.classList.remove('active');
        if (e.target === attendanceModal) attendanceModal.classList.remove('active');
        if (e.target === attendeesModal) attendeesModal.classList.remove('active');
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            regModal.classList.remove('active');
            reviewModal.classList.remove('active');
            attendanceModal.classList.remove('active');
            attendeesModal.classList.remove('active');
        }
    });
    
    function openRegistrationsModal(eventId) {
        const modal = document.getElementById('registrationsModal');
        const modalTitle = document.getElementById('modalEventTitle');
        
        modalTitle.textContent = `Loading event registrations...`;
        modal.classList.add('active');
        
        fetch(`/server/events/${eventId}/registrations/`, {
            method: 'GET',
            headers: {
                'X-CSRFToken': csrfToken,
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                modalTitle.textContent = `Registrations - ${data.event_title}`;
                displayRegistrations(data.registrations);
            } else {
                showMessage(data.message, 'error');
                modal.classList.remove('active');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Failed to load registrations', 'error');
            modal.classList.remove('active');
        });
    }
    
    function displayRegistrations(registrations) {
        const registrationsList = document.getElementById('registrationsList');
        const totalRegistrations = document.getElementById('totalRegistrations');
        const confirmedRegistrations = document.getElementById('confirmedRegistrations');
        const pendingRegistrations = document.getElementById('pendingRegistrations');
        
        totalRegistrations.textContent = registrations.length;
        confirmedRegistrations.textContent = registrations.filter(r => r.status === 'confirmed').length;
        pendingRegistrations.textContent = registrations.filter(r => r.status === 'pending').length;
        
        if (registrations.length === 0) {
            registrationsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users-slash"></i>
                    <h3>No Registrations</h3>
                    <p>No one has registered for this event yet.</p>
                </div>
            `;
            return;
        }
        
        registrationsList.innerHTML = registrations.map(registration => `
            <div class="registration-item" data-id="${registration.id}">
                <div class="user-info-small">
                    <div class="user-avatar">
                        ${registration.user.avatar ? 
                            `<img src="${registration.user.avatar}" alt="${registration.user.name}">` :
                            `<div class="user-avatar-initials">${registration.user.initials}</div>`
                        }
                    </div>
                    <div class="user-details">
                        <h4>${registration.user.name}</h4>
                        <p>${registration.user.email}</p>
                        <p>Registered: ${new Date(registration.registration_date).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="registration-status status-${registration.status}">
                    ${registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                </div>
                <div class="registration-actions">
                    <button class="action-btn review-documents-btn" data-id="${registration.id}">
                        <i class="fas fa-id-card"></i>
                        Review Documents
                    </button>
                </div>
            </div>
        `).join('');
        
        document.querySelectorAll('.review-documents-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const regId = this.getAttribute('data-id');
                openReviewDocumentsModal(regId);
            });
        });
    }
    
    function openReviewDocumentsModal(registrationId) {
        const modal = document.getElementById('reviewDocumentsModal');
        const userInfo = document.getElementById('userDocumentsInfo');
        const userDocuments = document.getElementById('userDocuments');
        
        modal.classList.add('active');
        
        fetch(`/server/registrations/${registrationId}/user-documents/`, {
            method: 'GET',
            headers: {
                'X-CSRFToken': csrfToken,
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                userInfo.innerHTML = `
                    <div class="user-details-large">
                        <div class="user-avatar-large">
                            ${data.user.avatar ? 
                                `<img src="${data.user.avatar}" alt="${data.user.name}">` :
                                `<div class="user-avatar-initials">${data.user.initials}</div>`
                            }
                        </div>
                        <div class="user-info-text">
                            <h3>${data.user.name}</h3>
                            <p>${data.user.email}</p>
                            <p>Registration No: ${data.user.registration_no}</p>
                            <p>Age: ${data.user.age} • ${data.user.gender}</p>
                            <p>Zone: ${data.user.purok_zone}</p>
                        </div>
                    </div>
                `;
                
                userDocuments.innerHTML = `
                    <div class="user-details-grid">
                        <div class="detail-section">
                            <h4>Personal Information</h4>
                            <div class="detail-row">
                                <span class="detail-label">Full Name:</span>
                                <span class="detail-value">${data.user.name}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Age:</span>
                                <span class="detail-value">${data.user.age} years (${data.user.age_group})</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Gender:</span>
                                <span class="detail-value">${data.user.gender}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Civil Status:</span>
                                <span class="detail-value">${data.user.civil_status}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Contact Number:</span>
                                <span class="detail-value">${data.user.contact_number}</span>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h4>Education & Employment</h4>
                            <div class="detail-row">
                                <span class="detail-label">Education Level:</span>
                                <span class="detail-value">${data.user.education}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Youth Classification:</span>
                                <span class="detail-value">${data.user.youth_classification}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Work Status:</span>
                                <span class="detail-value">${data.user.work_status}</span>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h4>Residence Information</h4>
                            <div class="detail-row">
                                <span class="detail-label">Address:</span>
                                <span class="detail-value">${data.user.address}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Purok/Zone:</span>
                                <span class="detail-value">${data.user.purok_zone}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">SK Voter:</span>
                                <span class="detail-value">${data.user.sk_voter}</span>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h4>Account Status</h4>
                            <div class="detail-row">
                                <span class="detail-label">Email Verified:</span>
                                <span class="detail-value">${data.user.is_email_verified}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Admin Verified:</span>
                                <span class="detail-value">${data.user.is_admin_verified}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Member Since:</span>
                                <span class="detail-value">${data.user.created_at}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="verification-documents">
                        <h4>Verification Documents</h4>
                        <div class="document-item">
                            <span>ID Document (${data.user.id_type})</span>
                            <a href="${data.user.id_picture}" class="document-view" target="_blank">
                                <i class="fas fa-eye"></i> View Document
                            </a>
                        </div>
                        ${data.user.birth_certificate ? `
                        <div class="document-item">
                            <span>Birth Certificate</span>
                            <a href="${data.user.birth_certificate}" class="document-view" target="_blank">
                                <i class="fas fa-eye"></i> View Document
                            </a>
                        </div>
                        ` : ''}
                    </div>
                `;
                
                document.getElementById('approveRegistration').setAttribute('data-reg-id', registrationId);
                document.getElementById('rejectRegistration').setAttribute('data-reg-id', registrationId);
                document.getElementById('waitlistRegistration').setAttribute('data-reg-id', registrationId);
            } else {
                showMessage(data.message, 'error');
                modal.classList.remove('active');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Failed to load user documents', 'error');
            modal.classList.remove('active');
        });
    }
    
    function updateRegistrationStatus(registrationId, status, reason) {
        fetch(`/server/registrations/${registrationId}/update-status/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({
                status: status,
                reason: reason
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage(`Registration ${status} successfully!`, 'success');
                
                setTimeout(() => {
                    document.getElementById('reviewDocumentsModal').classList.remove('active');
                    const eventId = document.querySelector('.registration-item[data-id="' + registrationId + '"]')
                        .closest('.registrations-container').querySelector('.view-registrations-btn').getAttribute('data-event-id');
                    openRegistrationsModal(eventId);
                }, 1500);
            } else {
                showMessage(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Failed to update registration status', 'error');
        });
    }
    
    function openAttendanceModal(eventId) {
        const modal = document.getElementById('attendanceModal');
        const modalTitle = document.getElementById('attendanceEventTitle');
        
        modalTitle.textContent = `Loading attendance data...`;
        modal.classList.add('active');
        
        fetch(`/server/events/${eventId}/attendance/`, {
            method: 'GET',
            headers: {
                'X-CSRFToken': csrfToken,
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                modalTitle.textContent = `Attendance - ${data.event_title}`;
                displayAttendance(data.attendance);
            } else {
                showMessage(data.message, 'error');
                modal.classList.remove('active');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Failed to load attendance data', 'error');
            modal.classList.remove('active');
        });
    }
    
    function displayAttendance(attendance) {
        const attendanceList = document.getElementById('attendanceList');
        const totalParticipants = document.getElementById('totalParticipants');
        const presentCount = document.getElementById('presentCount');
        const absentCount = document.getElementById('absentCount');
        
        totalParticipants.textContent = attendance.length;
        presentCount.textContent = attendance.filter(a => a.present).length;
        absentCount.textContent = attendance.filter(a => !a.present).length;
        
        attendanceList.innerHTML = attendance.map(attendee => `
            <div class="attendance-item" data-id="${attendee.id}">
                <div class="user-info-small">
                    <div class="user-avatar">
                        ${attendee.user.avatar ? 
                            `<img src="${attendee.user.avatar}" alt="${attendee.user.name}">` :
                            `<div class="user-avatar-initials">${attendee.user.initials}</div>`
                        }
                    </div>
                    <div class="user-details">
                        <h4>${attendee.user.name}</h4>
                    </div>
                </div>
                <div class="attendance-toggle">
                    <label class="toggle-switch">
                        <input type="checkbox" ${attendee.present ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                    <span>${attendee.present ? 'Present' : 'Absent'}</span>
                </div>
            </div>
        `).join('');
        
        document.querySelectorAll('.toggle-switch input').forEach(toggle => {
            toggle.addEventListener('change', function() {
                const attendeeId = this.closest('.attendance-item').getAttribute('data-id');
                updateAttendance(attendeeId, this.checked);
            });
        });
        
        document.getElementById('markAllPresent').addEventListener('click', function() {
            document.querySelectorAll('.toggle-switch input').forEach(toggle => {
                toggle.checked = true;
                const attendeeId = toggle.closest('.attendance-item').getAttribute('data-id');
                updateAttendance(attendeeId, true);
            });
        });
        
        document.getElementById('markAllAbsent').addEventListener('click', function() {
            document.querySelectorAll('.toggle-switch input').forEach(toggle => {
                toggle.checked = false;
                const attendeeId = toggle.closest('.attendance-item').getAttribute('data-id');
                updateAttendance(attendeeId, false);
            });
        });
    }
    
    function updateAttendance(attendeeId, isPresent) {
        fetch(`/server/registrations/${attendeeId}/update-attendance/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({
                present: isPresent
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage(`Attendance ${isPresent ? 'marked as Present' : 'marked as Absent'}!`, 'success');
                
                const statusText = document.querySelector(`.attendance-item[data-id="${attendeeId}"] .attendance-toggle span`);
                if (statusText) {
                    statusText.textContent = isPresent ? 'Present' : 'Absent';
                }
                
                setTimeout(() => {
                    const presentCount = document.getElementById('presentCount');
                    const absentCount = document.getElementById('absentCount');
                    
                    const currentPresent = parseInt(presentCount.textContent);
                    const currentAbsent = parseInt(absentCount.textContent);
                    
                    if (isPresent) {
                        presentCount.textContent = currentPresent + 1;
                        absentCount.textContent = Math.max(0, currentAbsent - 1);
                    } else {
                        presentCount.textContent = Math.max(0, currentPresent - 1);
                        absentCount.textContent = currentAbsent + 1;
                    }
                }, 300);
            } else {
                showMessage(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Failed to update attendance', 'error');
        });
    }
    
    function openAttendeesModal(eventId) {
        const modal = document.getElementById('attendeesModal');
        const modalTitle = document.getElementById('attendeesEventTitle');
        
        modalTitle.textContent = `Loading attendees...`;
        modal.classList.add('active');
        
        fetch(`/server/events/${eventId}/attendees/`, {
            method: 'GET',
            headers: {
                'X-CSRFToken': csrfToken,
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                modalTitle.textContent = `Attendees - ${data.event_title}`;
                displayAttendees(data.attendees);
            } else {
                showMessage(data.message, 'error');
                modal.classList.remove('active');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Failed to load attendees', 'error');
            modal.classList.remove('active');
        });
    }
    
    function displayAttendees(attendees) {
        const attendeesList = document.getElementById('attendeesList');
        const totalAttendees = document.getElementById('totalAttendees');
        const totalPoints = document.getElementById('totalPoints');
        
        totalAttendees.textContent = attendees.length;
        totalPoints.textContent = attendees.reduce((sum, attendee) => sum + attendee.points_earned, 0);
        
        if (attendees.length === 0) {
            attendeesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users-slash"></i>
                    <h3>No Attendees</h3>
                    <p>No one attended this event.</p>
                </div>
            `;
            return;
        }
        
        attendeesList.innerHTML = attendees.map(attendee => `
            <div class="attendance-item" data-id="${attendee.id}">
                <div class="user-info-small">
                    <div class="user-avatar">
                        ${attendee.user.avatar ? 
                            `<img src="${attendee.user.avatar}" alt="${attendee.user.name}">` :
                            `<div class="user-avatar-initials">${attendee.user.initials}</div>`
                        }
                    </div>
                    <div class="user-details">
                        <h4>${attendee.user.name}</h4>
                        <p>${attendee.user.email}</p>
                        <p>Checked in: ${attendee.check_in_time ? new Date(attendee.check_in_time).toLocaleString() : 'N/A'}</p>
                    </div>
                </div>
                <div class="attendance-info">
                    <span class="points-badge">
                        <i class="fas fa-star"></i>
                        ${attendee.points_earned} points
                    </span>
                </div>
            </div>
        `).join('');
    }
    
    function showMessage(message, type) {
        const existingMessage = document.querySelector('.event-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageEl = document.createElement('div');
        messageEl.className = `event-message message-${type}`;
        messageEl.innerHTML = `
            <p>${message}</p>
            <button class="message-close"><i class="fas fa-times"></i></button>
        `;
        
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            max-width: 400px;
            z-index: 3000;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease;
            ${type === 'success' ? 'background: rgba(46, 125, 50, 0.9); color: white;' : 
              type === 'error' ? 'background: rgba(211, 47, 47, 0.9); color: white;' :
              'background: rgba(25, 118, 210, 0.9); color: white;'}
            backdrop-filter: blur(10px);
        `;

        const closeBtn = messageEl.querySelector('.message-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: inherit;
            margin-left: 15px;
            cursor: pointer;
            font-size: 1.1rem;
        `;
        
        closeBtn.addEventListener('click', function() {
            messageEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                messageEl.remove();
            }, 300);
        });
        
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    messageEl.remove();
                }, 300);
            }
        }, 5000);
        document.body.appendChild(messageEl);
        
        if (!document.querySelector('#message-animations')) {
            const style = document.createElement('style');
            style.id = 'message-animations';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    const statCards = document.querySelectorAll('.stat-card');
    const segmentCards = document.querySelectorAll('.segment-card');
    
    statCards.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });
    
    segmentCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${0.3 + (index * 0.2)}s, transform 0.6s ease ${0.3 + (index * 0.2)}s`;
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 300 + (index * 200));
    });
});