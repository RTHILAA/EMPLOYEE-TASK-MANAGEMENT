function openEmployeeModal(existing) {
    const isEdit = !!existing;
    const form = document.createElement('form');
    form.className = 'space-y-4';
    form.innerHTML = `
        <div><label class="block text-sm text-gray-700">Full Name</label><input name="name" value="${existing ? escapeHtml(existing.name) : ''}" required class="w-full px-3 py-2 border rounded-lg" /></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label class="block text-sm text-gray-700">Email</label><input type="email" name="email" value="${existing ? escapeHtml(existing.email || '') : ''}" required class="w-full px-3 py-2 border rounded-lg" /></div>
            <div><label class="block text-sm text-gray-700">Phone</label><input type="tel" name="phone" value="${existing ? escapeHtml(existing.phone || '') : ''}" class="w-full px-3 py-2 border rounded-lg" /></div>
        </div>
        <div><label class="block text-sm text-gray-700">Role / Position</label><input name="role" value="${existing ? escapeHtml(existing.role || '') : ''}" class="w-full px-3 py-2 border rounded-lg" /></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm text-gray-700">Department</label>
                <select name="department" class="w-full px-3 py-2 border rounded-lg">
                    <option>Engineering</option><option>Marketing</option><option>Sales</option><option>HR</option><option>Unassigned</option>
                </select>
            </div>
            <div>
                <label class="block text-sm text-gray-700">Status</label>
                <select name="status" class="w-full px-3 py-2 border rounded-lg">
                    <option>Active</option><option>Inactive</option><option>On Leave</option>
                </select>
            </div>
        </div>
        <div class="flex justify-end"><button type="submit" class="bg-primary-500 btn-animated text-white px-4 py-2 rounded-lg">${isEdit ? 'Save Changes' : 'Add Employee'}</button></div>
    `;

    if (isEdit) {
        form.department.value = existing.department || 'Unassigned';
        form.status.value = existing.status || 'Active';
    }

    form.addEventListener('submit', function(ev) {
        ev.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const payload = {
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            phone: form.phone.value.trim(),
            role: form.role.value.trim(),
            department: form.department.value,
            status: form.status.value,
        };
        if (!payload.name || !payload.email) { alert('Full Name and Email are required.'); return; }
        if (isEdit) {
            EmployeeStore.update(existing.id, payload);
            closeModal();
        } else {
            EmployeeStore.add(payload);
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Saved! Add another?';
            submitBtn.disabled = true;
            form.reset();
            form.name.focus();
            setTimeout(() => { submitBtn.innerHTML = originalText; submitBtn.disabled = false; }, 2000);
        }
        if (typeof renderEmployees === 'function') renderEmployees();
        if (typeof refreshDashboardMetrics === 'function') refreshDashboardMetrics();
    });
    openModal({ title: isEdit ? 'Edit Employee' : 'New Employee', content: form });
}

function getInitials(name) {
    if (!name) return '??';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '??';
    if (parts.length === 1) return name.substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function nameToColor(name) {
    const colors = ['#fecaca', '#fed7aa', '#fef08a', '#d9f99d', '#bfdbfe', '#e9d5ff'];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

const statusColorMap = {
    'Active': 'bg-green-100 text-green-800',
    'Inactive': 'bg-red-100 text-red-800',
    'On Leave': 'bg-yellow-100 text-yellow-800',
    'default': 'bg-gray-100 text-gray-800'
};

function renderEmployees() {
    const container = document.getElementById('employee-list'); if (!container) return;
    const employees = EmployeeStore.all(); container.innerHTML = '';
    if (!employees.length) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-12 col-span-full flex flex-col items-center justify-center">
                <i data-feather="users" class="w-16 h-16 text-gray-400 mb-4"></i>
                <p>No employees yet. Use "Add Employee" to create one.</p>
            </div>`;
        try { if (window.feather) feather.replace(); } catch (e) {}
        return;
    }
    employees.forEach(emp => {
        const card = document.createElement('div');
        card.className = 'employee-card bg-white rounded-xl shadow-sm p-6 flex flex-col text-center items-center';

        const initialsCircle = document.createElement('div');
        initialsCircle.className = 'w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-gray-700';
        initialsCircle.style.backgroundColor = nameToColor(emp.name);
        initialsCircle.textContent = getInitials(emp.name);

        const nameEl = document.createElement('h4');
        nameEl.className = 'font-semibold text-lg text-gray-800';
        nameEl.textContent = escapeHtml(emp.name);

        const roleEl = document.createElement('p');
        roleEl.className = 'text-sm text-primary-500';
        roleEl.textContent = escapeHtml(emp.role || 'N/A');

        const infoWrapper = document.createElement('div');
        infoWrapper.className = 'flex flex-wrap justify-center items-center gap-2 mt-3';

        const departmentBadge = document.createElement('span');
        departmentBadge.className = 'px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full';
        departmentBadge.textContent = emp.department || 'Unassigned';
        const statusBadge = document.createElement('span');
        statusBadge.className = `px-2 py-1 text-xs font-medium rounded-full ${statusColorMap[emp.status] || statusColorMap.default}`;
        statusBadge.textContent = emp.status || 'N/A';
        infoWrapper.append(departmentBadge, statusBadge);

        const contactWrapper = document.createElement('div');
        contactWrapper.className = 'mt-3 space-y-1 text-sm text-gray-500 flex-grow';
        contactWrapper.innerHTML = `
            <div class="flex items-center justify-center space-x-2">
                <i data-feather="mail" class="w-4 h-4"></i>
                <span>${escapeHtml(emp.email || '')}</span>
            </div>
            ${emp.phone ? `<div class="flex items-center justify-center space-x-2">
                <i data-feather="phone" class="w-4 h-4"></i>
                <span>${escapeHtml(emp.phone)}</span>
            </div>` : ''}
        `;

        const actionsWrapper = document.createElement('div');
        actionsWrapper.className = 'mt-auto pt-4 border-t border-gray-200 flex justify-center space-x-2';
        actionsWrapper.innerHTML = `
            <button data-employee-edit="${emp.id}" class="p-2 text-indigo-600 hover:text-indigo-800" title="Edit" aria-label="Edit employee"><i data-feather="edit-2"></i></button>
            <button data-employee-delete="${emp.id}" class="p-2 text-red-600 hover:text-red-800" title="Delete" aria-label="Delete employee"><i data-feather="trash-2"></i></button>
        `;

        card.append(initialsCircle, nameEl, roleEl, infoWrapper, contactWrapper, actionsWrapper);
        container.appendChild(card);
    });

    try { if (window.feather) feather.replace(); } catch (e) {}
}

function confirmDeleteEmployee(employeeId) {
    const employee = EmployeeStore.all().find(emp => emp.id === employeeId);
    if (!employee) return;

    const content = document.createElement('div');
    content.innerHTML = `
        <p class="text-gray-600 mb-6">Are you sure you want to delete the employee "${escapeHtml(employee.name)}"? This action cannot be undone.</p>
        <div class="flex justify-end space-x-3">
            <button id="cancel-delete" class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800">Cancel</button>
            <button id="confirm-delete" class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white btn-animated">Delete</button>
        </div>
    `;

    content.querySelector('#cancel-delete').addEventListener('click', closeModal);
    content.querySelector('#confirm-delete').addEventListener('click', () => {
        EmployeeStore.remove(employeeId);
        closeModal();
        renderEmployees();
        if (typeof refreshDashboardMetrics === 'function') refreshDashboardMetrics();
    });

    openModal({ title: 'Confirm Deletion', content });
}

function initEmployeeActions() {
    const container = document.getElementById('employee-list');
    if (!container || container._actionsInitialized) return;

    container.addEventListener('click', function(e) {
        const target = e.target.closest('button');
        if (!target) return;

        if (target.dataset.employeeEdit) {
            const emp = EmployeeStore.all().find(emp => emp.id === target.dataset.employeeEdit);
            if (emp) openEmployeeModal(emp);
        } else if (target.dataset.employeeDelete) {
            confirmDeleteEmployee(target.dataset.employeeDelete);
        }
    });
    container._actionsInitialized = true;
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('employee-list')) initEmployeeActions();
});