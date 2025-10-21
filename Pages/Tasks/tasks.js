// tasks.js - complete functionality for tasks page

// Simple storage simulation
const TaskStore = {
    all: function() {
        const tasks = localStorage.getItem('tasks');
        return tasks ? JSON.parse(tasks) : [];
    },
    add: function(task) {
        const tasks = this.all();
        task.id = Date.now().toString();
        task.createdAt = new Date().toISOString();
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        return task;
    },
    update: function(id, updates) {
        const tasks = this.all();
        const index = tasks.findIndex(task => task.id === id);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...updates };
            localStorage.setItem('tasks', JSON.stringify(tasks));
            return tasks[index];
        }
        return null;
    },
    delete: function(id) {
        const tasks = this.all();
        const filtered = tasks.filter(task => task.id !== id);
        localStorage.setItem('tasks', JSON.stringify(filtered));
        return filtered;
    }
};

const EmployeeStore = {
    all: function() {
        return [
            { id: 1, name: 'Sarah Johnson' },
            { id: 2, name: 'Michael Chen' },
            { id: 3, name: 'Emma Wilson' },
            { id: 4, name: 'David Kim' },
            { id: 5, name: 'Alex Morgan' }
        ];
    }
};

// Utility function to escape HTML
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Modal functions
function createModalBackdrop(){
    let bd = document.querySelector('.modal-backdrop');
    if(bd) return bd;
    bd = document.createElement('div');
    bd.className = 'modal-backdrop';
    bd.innerHTML = '<div class="modal" role="dialog" aria-modal="true"><div class="modal-header"><h3 class="modal-title"></h3><button class="modal-close" aria-label="Close">&times;</button></div><div class="modal-body"></div></div>';
    document.body.appendChild(bd);
    return bd;
}

function openModal(options){
    const bd = createModalBackdrop();
    const modal = bd.querySelector('.modal');
    const titleEl = bd.querySelector('.modal-title');
    const body = bd.querySelector('.modal-body');
    const closeBtn = bd.querySelector('.modal-close');

    titleEl.textContent = options.title || '';
    body.innerHTML = '';
    if(typeof options.content === 'string') body.innerHTML = options.content;
    else if(options.content instanceof Element) body.appendChild(options.content);

    function closeHandler(){ 
        closeModal(); 
        if(typeof options.onClose === 'function') options.onClose(); 
    }
    
    closeBtn.onclick = closeHandler;
    bd.classList.add('open'); 
    modal.classList.add('open');
    trapFocus(modal);

    const esc = (e)=>{ if(e.key === 'Escape') closeHandler(); };
    document.addEventListener('keydown', esc);
    const outside = (ev)=>{ if(ev.target === bd) closeHandler(); };
    bd.addEventListener('click', outside);
    
    bd._teardown = ()=>{ 
        document.removeEventListener('keydown', esc); 
        bd.removeEventListener('click', outside); 
    };
}

function closeModal(){
    const bd = document.querySelector('.modal-backdrop'); 
    if(!bd) return;
    const modal = bd.querySelector('.modal'); 
    modal.classList.remove('open'); 
    bd.classList.remove('open');
    if(typeof bd._teardown === 'function') bd._teardown();
}

function trapFocus(container){
    const focusable = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const nodes = Array.from(container.querySelectorAll(focusable)).filter(n=>n.offsetParent !== null);
    if(!nodes.length) return; 
    const first = nodes[0]; 
    const last = nodes[nodes.length-1]; 
    first.focus();
    
    function handle(e){ 
        if(e.key !== 'Tab') return; 
        if(e.shiftKey && document.activeElement === first){ 
            e.preventDefault(); 
            last.focus(); 
        } else if(!e.shiftKey && document.activeElement === last){ 
            e.preventDefault(); 
            first.focus(); 
        } 
    }
    
    container._focusHandler = handle; 
    document.addEventListener('keydown', handle);
}

function releaseTrap(container){ 
    if(container && container._focusHandler) 
        document.removeEventListener('keydown', container._focusHandler); 
}

// Task modal function
function openTaskModal(existing) {
    const isEdit = !!existing;
    const form = document.createElement('form');
    form.className = 'space-y-4';

    const employees = EmployeeStore.all();
    const employeeOptions = employees.map(emp => 
        `<option value="${escapeHtml(emp.name)}" ${existing && existing.assignee === emp.name ? 'selected' : ''}>${escapeHtml(emp.name)}</option>`
    ).join('');

    form.innerHTML = `
        <div>
            <label class="block text-sm text-gray-700">Task Name</label>
            <input name="name" value="${existing ? escapeHtml(existing.name) : ''}" required 
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300" />
        </div>
        <div>
            <label class="block text-sm text-gray-700">Description</label>
            <textarea name="description" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300" rows="3">${existing ? escapeHtml(existing.description || '') : ''}</textarea>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm text-gray-700">Assignee</label>
                <select name="assignee" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300">
                    <option value="">Unassigned</option>
                    ${employeeOptions}
                </select>
            </div>
            <div>
                <label class="block text-sm text-gray-700">Due Date</label>
                <input type="date" name="dueDate" value="${existing ? escapeHtml(existing.dueDate || '') : ''}" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300" />
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm text-gray-700">Priority</label>
                <select name="priority" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>
            </div>
            <div>
                <label class="block text-sm text-gray-700">Status</label>
                <select name="status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300">
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Review">Review</option>
                </select>
            </div>
        </div>
        <div class="flex justify-end pt-4">
            <button type="button" onclick="closeModal()" class="mr-3 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" class="bg-primary-500 btn-animated hover:bg-primary-600 text-white px-4 py-2 rounded-lg">${isEdit ? 'Save Changes' : 'Add Task'}</button>
        </div>
    `;

    // Set initial values
    if (isEdit) {
        form.querySelector('select[name="priority"]').value = existing.priority || 'Medium';
        form.querySelector('select[name="status"]').value = existing.status || 'Pending';
    } else {
        form.querySelector('select[name="priority"]').value = 'Medium';
        form.querySelector('select[name="status"]').value = 'Pending';
    }

    form.addEventListener('submit', function(ev) {
        ev.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const payload = {
            name: form.name.value.trim(),
            description: form.description.value.trim(),
            assignee: form.assignee.value,
            dueDate: form.dueDate.value,
            priority: form.priority.value,
            status: form.status.value,
        };
        
        if (!payload.name) {
            alert('Task Name is required.');
            return;
        }
        
        if (isEdit) {
            TaskStore.update(existing.id, payload);
            closeModal();
        } else {
            TaskStore.add(payload);
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Saved! Add another?';
            submitBtn.disabled = true;
            form.reset();
            form.name.focus();
            form.querySelector('select[name="priority"]').value = 'Medium';
            form.querySelector('select[name="status"]').value = 'Pending';
            setTimeout(() => { 
                submitBtn.innerHTML = originalText; 
                submitBtn.disabled = false; 
            }, 2000);
        }
        
        renderTasks();
    });

    openModal({ 
        title: isEdit ? 'Edit Task' : 'New Task', 
        content: form 
    });
}

function renderTasks() {
    const container = document.getElementById('task-list');
    if (!container) return;
    
    const tasks = TaskStore.all();
    container.innerHTML = '';
    
    if (!tasks.length) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-12">
                <i data-feather="check-square" class="w-16 h-16 text-gray-400 mx-auto mb-4"></i>
                <p>No tasks yet. Use "New Task" to create one.</p>
            </div>`;
        feather.replace();
        return;
    }

    tasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.className = `task-card bg-white border-l-4 ${getPriorityClass(task.priority)} p-4 mb-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200`;
        
        taskCard.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-800">${escapeHtml(task.name)}</h4>
                    ${task.description ? `<p class="text-sm text-gray-600 mt-1">${escapeHtml(task.description)}</p>` : ''}
                    <div class="flex items-center mt-3 space-x-4 text-sm text-gray-500">
                        ${task.assignee ? `<span class="flex items-center"><i data-feather="user" class="w-4 h-4 mr-1"></i> ${escapeHtml(task.assignee)}</span>` : ''}
                        ${task.dueDate ? `<span class="flex items-center"><i data-feather="calendar" class="w-4 h-4 mr-1"></i> ${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                        <span class="flex items-center"><i data-feather="flag" class="w-4 h-4 mr-1"></i> ${escapeHtml(task.priority)}</span>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(task.status)}">${escapeHtml(task.status)}</span>
                    </div>
                </div>
                <div class="flex space-x-2 ml-4">
                    <button onclick="openTaskModal(${escapeHtml(JSON.stringify(task))})" class="text-primary-500 hover:text-primary-700">
                        <i data-feather="edit" class="w-4 h-4"></i>
                    </button>
                    <button onclick="deleteTask('${task.id}')" class="text-red-500 hover:text-red-700">
                        <i data-feather="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(taskCard);
    });
    
    feather.replace();
}

function getPriorityClass(priority) {
    switch(priority) {
        case 'High': return 'priority-high';
        case 'Medium': return 'priority-medium';
        case 'Low': return 'priority-low';
        default: return 'priority-medium';
    }
}

function getStatusClass(status) {
    switch(status) {
        case 'Completed': return 'bg-green-100 text-green-800';
        case 'In Progress': return 'bg-blue-100 text-blue-800';
        case 'Review': return 'bg-yellow-100 text-yellow-800';
        case 'Pending': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        TaskStore.delete(id);
        renderTasks();
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize feather icons
    feather.replace();
    
    // Add event listener to New Task button
    document.getElementById('new-task-btn').addEventListener('click', function() {
        openTaskModal();
    });
    
    // Render initial tasks
    renderTasks();
});