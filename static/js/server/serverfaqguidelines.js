document.addEventListener('DOMContentLoaded', function() {
    console.log('FAQ Guidelines Management loaded');
    
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
    
    const addModal = document.getElementById('addModal');
    const editModal = document.getElementById('editModal');
    const deleteModal = document.getElementById('deleteModal');
    const closeBtns = document.querySelectorAll('.close, .close-modal');
    
    const addBtns = document.querySelectorAll('.add-btn');
    
    addBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Add button clicked');
            const type = this.getAttribute('data-type');
            const typeName = getTypeName(type);
            
            document.getElementById('addModalTitle').textContent = `Add New ${typeName}`;
            document.getElementById('addType').value = type;
            
            document.getElementById('addQuestion').value = '';
            document.getElementById('addAnswer').value = '';
            document.getElementById('addContent').value = '';
            document.getElementById('addCategory').value = 'General';
            document.getElementById('addIsActive').checked = true;
            document.getElementById('addGuidelineIsActive').checked = true;
            
            if (type === 'faq') {
                document.getElementById('faqFields').style.display = 'block';
                document.getElementById('guidelineFields').style.display = 'none';
                const faqCount = document.querySelectorAll('.faq-item').length;
                document.getElementById('addOrder').value = faqCount + 1;
            } else {
                document.getElementById('faqFields').style.display = 'none';
                document.getElementById('guidelineFields').style.display = 'block';
                const guidelineCount = document.querySelectorAll('.guideline-item').length;
                document.getElementById('addGuidelineOrder').value = guidelineCount + 1;
            }
            
            addModal.style.display = 'block';
        });
    });
    
    const editBtns = document.querySelectorAll('.edit-btn');
    editBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-faq-id') || this.getAttribute('data-guideline-id');
            const type = this.getAttribute('data-faq-id') ? 'faq' : 'guideline';
            const typeName = getTypeName(type);
            const item = document.querySelector(`[data-${type}-id="${id}"]`);
            
            document.getElementById('editModalTitle').textContent = `Edit ${typeName}`;
            document.getElementById('editId').value = id;
            document.getElementById('editType').value = type;
            
            if (type === 'faq') {
                document.getElementById('editFaqFields').style.display = 'block';
                document.getElementById('editGuidelineFields').style.display = 'none';
                
                const question = item.querySelector('.faq-question h3').textContent;
                const answer = item.querySelector('.faq-answer p').textContent;
                const category = item.querySelector('.category-badge').textContent;
                const order = item.querySelector('.faq-order').textContent.replace('#', '');
                const isActive = item.querySelector('.status-badge').classList.contains('status-active');
                
                document.getElementById('editQuestion').value = question;
                document.getElementById('editAnswer').value = answer;
                document.getElementById('editCategory').value = category;
                document.getElementById('editOrder').value = order;
                document.getElementById('editIsActive').checked = isActive;
            } else {
                document.getElementById('editFaqFields').style.display = 'none';
                document.getElementById('editGuidelineFields').style.display = 'block';
                
                const content = item.querySelector('.guideline-content p').textContent;
                const order = item.querySelector('.guideline-order').textContent.replace('#', '');
                const isActive = item.querySelector('.status-badge').classList.contains('status-active');
                
                document.getElementById('editContent').value = content;
                document.getElementById('editGuidelineOrder').value = order;
                document.getElementById('editGuidelineIsActive').checked = isActive;
            }
            
            editModal.style.display = 'block';
        });
    });
    
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-faq-id') || this.getAttribute('data-guideline-id');
            const type = this.getAttribute('data-faq-id') ? 'faq' : 'guideline';
            const currentStatus = this.getAttribute('data-current-status') === 'true';
            
            toggleStatus(id, type, !currentStatus);
        });
    });
    
    const deleteBtns = document.querySelectorAll('.delete-btn');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-faq-id') || this.getAttribute('data-guideline-id');
            const type = this.getAttribute('data-faq-id') ? 'faq' : 'guideline';
            
            document.getElementById('confirmDelete').setAttribute('data-id', id);
            document.getElementById('confirmDelete').setAttribute('data-type', type);
            deleteModal.style.display = 'block';
        });
    });
    
    const moveUpBtns = document.querySelectorAll('.move-up');
    moveUpBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-faq-id') || this.getAttribute('data-guideline-id');
            const type = this.getAttribute('data-faq-id') ? 'faq' : 'guideline';
            
            updateOrder(id, type, 'up');
        });
    });
    
    const moveDownBtns = document.querySelectorAll('.move-down');
    moveDownBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-faq-id') || this.getAttribute('data-guideline-id');
            const type = this.getAttribute('data-faq-id') ? 'faq' : 'guideline';
            
            updateOrder(id, type, 'down');
        });
    });
    
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            } else {
                unauthorizedModal.style.display = 'none';
            }
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
    const faqCategoryFilter = document.getElementById('faqCategoryFilter');
    const faqStatusFilter = document.getElementById('faqStatusFilter');
    
    if (addForm) {
        addForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Add form submitted');
            const type = document.getElementById('addType').value;
            
            let formData = {};
            
            if (type === 'faq') {
                const question = document.getElementById('addQuestion').value.trim();
                const answer = document.getElementById('addAnswer').value.trim();
                const category = document.getElementById('addCategory').value;
                const order = parseInt(document.getElementById('addOrder').value);
                const isActive = document.getElementById('addIsActive').checked;
                
                if (!question || !answer) {
                    alert('Please fill in both question and answer fields.');
                    return;
                }
                
                formData = {
                    type: type,
                    question: question,
                    answer: answer,
                    category: category,
                    order: order,
                    is_active: isActive
                };
            } else {
                const content = document.getElementById('addContent').value.trim();
                const order = parseInt(document.getElementById('addGuidelineOrder').value);
                const isActive = document.getElementById('addGuidelineIsActive').checked;
                
                if (!content) {
                    alert('Please fill in the guideline content.');
                    return;
                }
                
                formData = {
                    type: type,
                    content: content,
                    order: order,
                    is_active: isActive
                };
            }
            
            console.log('Sending add request:', formData);
            addItem(formData);
        });
    }
    
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const id = document.getElementById('editId').value;
            const type = document.getElementById('editType').value;
            
            let formData = {
                id: id,
                type: type
            };
            
            if (type === 'faq') {
                const question = document.getElementById('editQuestion').value.trim();
                const answer = document.getElementById('editAnswer').value.trim();
                const category = document.getElementById('editCategory').value;
                const order = parseInt(document.getElementById('editOrder').value);
                const isActive = document.getElementById('editIsActive').checked;
                
                if (!question || !answer) {
                    alert('Please fill in both question and answer fields.');
                    return;
                }
                
                formData.question = question;
                formData.answer = answer;
                formData.category = category;
                formData.order = order;
                formData.is_active = isActive;
            } else {
                const content = document.getElementById('editContent').value.trim();
                const order = parseInt(document.getElementById('editGuidelineOrder').value);
                const isActive = document.getElementById('editGuidelineIsActive').checked;
                
                if (!content) {
                    alert('Please fill in the guideline content.');
                    return;
                }
                
                formData.content = content;
                formData.order = order;
                formData.is_active = isActive;
            }
            
            updateItem(formData);
        });
    }
    
    if (confirmDelete) {
        confirmDelete.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const type = this.getAttribute('data-type');
            
            deleteItem(id, type);
        });
    }
    
    if (faqCategoryFilter) {
        faqCategoryFilter.addEventListener('change', function() {
            filterFAQs();
        });
    }
    
    if (faqStatusFilter) {
        faqStatusFilter.addEventListener('change', function() {
            filterFAQs();
        });
    }
    
    function addItem(formData) {
        console.log('addItem called with:', formData);
        console.log('API endpoint:', faqGuidelinesData.apiEndpoints.addItem);
        
        fetch(faqGuidelinesData.apiEndpoints.addItem, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            console.log('Response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Response data:', data);
            if (data.success) {
                addModal.style.display = 'none';
                location.reload();
            } else {
                alert('Error adding item: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while adding the item.');
        });
    }
    
    function updateItem(formData) {
        fetch(faqGuidelinesData.apiEndpoints.updateItem, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                editModal.style.display = 'none';
                location.reload();
            } else {
                alert('Error updating item: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while updating the item.');
        });
    }
    
    function deleteItem(id, type) {
        fetch(faqGuidelinesData.apiEndpoints.deleteItem, {
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
                alert('Error deleting item: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while deleting the item.');
        });
    }
    
    function toggleStatus(id, type, newStatus) {
        fetch(faqGuidelinesData.apiEndpoints.toggleStatus, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({ 
                id: id,
                type: type,
                is_active: newStatus
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Error toggling status: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while toggling the status.');
        });
    }
    
    function updateOrder(id, type, direction) {
        fetch(faqGuidelinesData.apiEndpoints.updateOrder, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({ 
                id: id,
                type: type,
                direction: direction
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Error updating order: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while updating the order.');
        });
    }
    
    function filterFAQs() {
        const categoryFilter = document.getElementById('faqCategoryFilter').value;
        const statusFilter = document.getElementById('faqStatusFilter').value;
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const category = item.getAttribute('data-category');
            const status = item.getAttribute('data-status');
            
            const categoryMatch = categoryFilter === 'all' || category === categoryFilter;
            const statusMatch = statusFilter === 'all' || status === statusFilter;
            
            if (categoryMatch && statusMatch) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    function getTypeName(type) {
        const typeMap = {
            'faq': 'FAQ',
            'guideline': 'Guideline'
        };
        return typeMap[type] || 'Item';
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
});