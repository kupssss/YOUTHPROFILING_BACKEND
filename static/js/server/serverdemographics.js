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
    
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
    
    const addBtns = document.querySelectorAll('.add-btn');
    const editBtns = document.querySelectorAll('.edit-btn');
    const deleteBtns = document.querySelectorAll('.delete-btn');
    
    const addModal = document.getElementById('addModal');
    const editModal = document.getElementById('editModal');
    const deleteModal = document.getElementById('deleteModal');
    const closeBtns = document.querySelectorAll('.close, .close-modal');
    
    addBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            const typeName = getTypeName(type);
            
            document.getElementById('addModalTitle').textContent = `Add New ${typeName}`;
            document.getElementById('addType').value = type;
            document.getElementById('addName').value = '';
            addModal.style.display = 'block';
        });
    });
    
    editBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const type = this.getAttribute('data-type');
            const typeName = getTypeName(type);
            const row = document.querySelector(`tr[data-id="${id}"][data-type="${type}"]`);
            const name = row.querySelector('.editable').textContent;
            
            document.getElementById('editModalTitle').textContent = `Edit ${typeName}`;
            document.getElementById('editId').value = id;
            document.getElementById('editType').value = type;
            document.getElementById('editName').value = name;
            editModal.style.display = 'block';
        });
    });
    
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.disabled) {
                const id = this.getAttribute('data-id');
                const type = this.getAttribute('data-type');
                
                document.getElementById('confirmDelete').setAttribute('data-id', id);
                document.getElementById('confirmDelete').setAttribute('data-type', type);
                deleteModal.style.display = 'block';
            }
        });
    });
    
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    const addForm = document.getElementById('addForm');
    const editForm = document.getElementById('editForm');
    const confirmDelete = document.getElementById('confirmDelete');
    
    if (addForm) {
        addForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const type = document.getElementById('addType').value;
            const name = document.getElementById('addName').value;
            
            addOption(type, name);
        });
    }
    
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const id = document.getElementById('editId').value;
            const type = document.getElementById('editType').value;
            const name = document.getElementById('editName').value;
            
            updateOption(id, type, name);
        });
    }
    
    if (confirmDelete) {
        confirmDelete.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const type = this.getAttribute('data-type');
            
            deleteOption(id, type);
        });
    }
    
    const editableCells = document.querySelectorAll('.editable');
    editableCells.forEach(cell => {
        cell.addEventListener('dblclick', function() {
            if (!this.classList.contains('editing')) {
                enableInlineEditing(this);
            }
        });
    });
    
    function enableInlineEditing(cell) {
        const originalValue = cell.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = originalValue;
        input.style.width = '100%';
        input.style.padding = '8px 12px';
        input.style.background = 'rgba(255, 255, 255, 0.1)';
        input.style.border = '1px solid #3A7BFA';
        input.style.borderRadius = '4px';
        input.style.color = '#E8EAF6';
        input.style.fontFamily = 'Poppins, sans-serif';
        
        cell.textContent = '';
        cell.appendChild(input);
        cell.classList.add('editing');
        
        input.focus();
        input.select();
        
        function saveEdit() {
            const newValue = input.value.trim();
            if (newValue && newValue !== originalValue) {
                const row = cell.closest('tr');
                const id = row.getAttribute('data-id');
                const type = row.getAttribute('data-type');
                
                updateOption(id, type, newValue);
            } else {
                cancelEdit();
            }
        }
        
        function cancelEdit() {
            cell.textContent = originalValue;
            cell.classList.remove('editing');
        }
        
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                saveEdit();
            } else if (e.key === 'Escape') {
                cancelEdit();
            }
        });
    }
    
    function addOption(type, name) {
        fetch(demographicsData.apiEndpoints.addOption, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({ 
                type: type,
                name: name
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                addModal.style.display = 'none';
                location.reload();
            } else {
                alert('Error adding option: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while adding the option.');
        });
    }
    
    function updateOption(id, type, name) {
        fetch(demographicsData.apiEndpoints.updateOption, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({ 
                id: id,
                type: type,
                name: name
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                editModal.style.display = 'none';
                location.reload();
            } else {
                alert('Error updating option: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while updating the option.');
        });
    }
    
    function deleteOption(id, type) {
        fetch(demographicsData.apiEndpoints.deleteOption, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({ 
                id: id,
                type: type
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                deleteModal.style.display = 'none';
                location.reload();
            } else {
                alert('Error deleting option: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while deleting the option.');
        });
    }
    
    function getTypeName(type) {
        const typeMap = {
            'gender': 'Gender',
            'civil_status': 'Civil Status',
            'age_group': 'Age Group',
            'education_level': 'Education Level',
            'youth_classification': 'Youth Classification',
            'work_status': 'Work Status'
        };
        return typeMap[type] || 'Option';
    }
    
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            this.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.4)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
        });
    });
    
    const tableRows = document.querySelectorAll('.demographic-table tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        row.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });
});