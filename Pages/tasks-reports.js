// tasks-reports.js - rendering helpers for tasks and reports plus analysis
function openTaskModal(existing) {
    const isEdit = !!existing;
    const form = document.createElement('form');
    form.className = 'space-y-4';
    form.innerHTML = `
        <div><label class="block text-sm text-gray-700">Title</label><input name="title" value="${existing ? escapeHtml(existing.title) : ''}" required class="w-full px-3 py-2 border rounded-lg" /></div>
        <div><label class="block text-sm text-gray-700">Description</label><textarea name="description" class="w-full px-3 py-2 border rounded-lg" rows="3">${existing ? escapeHtml(existing.description || '') : ''}</textarea></div>
        <div class="grid grid-cols-2 gap-4">
            <div><label class="block text-sm text-gray-700">Assignee</label><input name="assignee" value="${existing ? escapeHtml(existing.assignee || '') : ''}" class="w-full px-3 py-2 border rounded-lg" /></div>
            <div><label class="block text-sm text-gray-700">Due Date</label><input type="date" name="dueDate" value="${existing ? escapeHtml(existing.dueDate || '') : ''}" class="w-full px-3 py-2 border rounded-lg" /></div>
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div><label class="block text-sm text-gray-700">Priority</label><select name="priority" class="w-full px-3 py-2 border rounded-lg"><option>Low</option><option>Medium</option><option>High</option></select></div>
            <div><label class="block text-sm text-gray-700">Status</label><select name="status" class="w-full px-3 py-2 border rounded-lg"><option>Pending</option><option>In Progress</option><option>Completed</option></select></div>
        </div>
        <div class="flex justify-end"><button type="submit" class="bg-primary-500 btn-animated text-white px-4 py-2 rounded-lg">${isEdit ? 'Save Changes' : 'Add Task'}</button></div>
    `;

    if (isEdit) {
        form.priority.value = existing.priority || 'Medium';
        form.status.value = existing.status || 'Pending';
    }

    form.addEventListener('submit', function(ev) {
        ev.preventDefault();
        const payload = {
            title: form.title.value.trim(), description: form.description.value.trim(),
            assignee: form.assignee.value.trim(), dueDate: form.dueDate.value,
            priority: form.priority.value, status: form.status.value,
        };
        if (!payload.title) { alert('Title is required.'); return; }
        if (isEdit) { TaskStore.update(existing.id, payload); } else { TaskStore.add(payload); }
        closeModal();
        if (typeof renderTasks === 'function') renderTasks();
        if (typeof renderRecentTasks === 'function') renderRecentTasks();
    });
    openModal({ title: isEdit ? 'Edit Task' : 'New Task', content: form });
}

function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

function statusBadgeClass(status){
    if(!status) return 'bg-gray-100 text-gray-800';
    switch((status||'').toLowerCase()){
        case 'completed': return 'bg-green-100 text-green-800';
        case 'in progress': return 'bg-yellow-100 text-yellow-800';
        case 'overdue': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function renderTasks(){
    const container = document.getElementById('task-list'); if(!container) return;
    const tasks = TaskStore.all(); container.innerHTML = '';
    if(!tasks.length){ container.innerHTML = '<div class="text-center text-gray-500 py-8">No tasks yet. Use "New Task" to create one.</div>'; return; }
    tasks.forEach(task=>{
        const card = document.createElement('div'); card.className = 'task-card bg-white rounded-lg border border-gray-200 p-4';
        card.innerHTML = `
            <div class="flex justify-between">
                <h4 class="font-semibold text-gray-800">${escapeHtml(task.title)}</h4>
                <span class="px-2 py-1 text-xs rounded-full ${statusBadgeClass(task.status)}">${escapeHtml(task.priority || '')}</span>
            </div>
            <p class="text-sm text-gray-600 mt-1">${escapeHtml(task.description || '')}</p>
            <div class="flex justify-between items-center mt-4">
                <div class="flex items-center">
                    <div class="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-sm text-gray-700">${(task.assignee||'')[0]||'?'}</div>
                    <span class="text-sm text-gray-500 ml-2">${escapeHtml(task.assignee || 'Unassigned')}</span>
                </div>
                <div class="flex items-center">
                    <i data-feather="calendar" class="w-4 h-4 text-gray-400 mr-1"></i>
                    <span class="text-sm text-gray-500">${escapeHtml(task.dueDate || '')}</span>
                </div>
                <div class="flex items-center space-x-2">
                    <button data-task-view="${task.id}" class="p-2 text-blue-600 hover:text-blue-800" title="View" aria-label="View task"><i data-feather="eye"></i></button>
                    <button data-task-edit="${task.id}" class="p-2 text-indigo-600 hover:text-indigo-800" title="Edit" aria-label="Edit task"><i data-feather="edit-2"></i></button>
                    <button data-task-delete="${task.id}" class="p-2 text-red-600 hover:text-red-800" title="Delete" aria-label="Delete task"><i data-feather="trash-2"></i></button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    container.querySelectorAll('[data-task-view]').forEach(b=> b.addEventListener('click', ()=> viewTask(b.getAttribute('data-task-view'))));
    container.querySelectorAll('[data-task-edit]').forEach(b=> b.addEventListener('click', ()=> editTask(b.getAttribute('data-task-edit'))));
    container.querySelectorAll('[data-task-delete]').forEach(b=> b.addEventListener('click', ()=> { if(confirm('Delete this task?')){ TaskStore.remove(b.getAttribute('data-task-delete')); renderTasks(); refreshDashboardMetrics(); }}));
    try{ if(window.feather) feather.replace(); }catch(e){}
}

function renderRecentTasks(){ const tbody = document.getElementById('recent-tasks-list'); if(!tbody) return; const tasks = TaskStore.all(); tbody.innerHTML = ''; if(!tasks.length){ tbody.innerHTML = '<tr><td colspan="5" class="text-center text-gray-500 py-8">No tasks yet. Use "New Task" to create one.</td></tr>'; return; } tasks.slice(0,10).forEach(t=>{ const tr = document.createElement('tr'); tr.className = 'task-card'; tr.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${escapeHtml(t.title)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${escapeHtml(t.assignee||'Unassigned')}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${escapeHtml(t.dueDate||'')}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${escapeHtml(t.status||'')}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <button data-task-view="${t.id}" class="p-2 text-blue-600" title="View" aria-label="View task"><i data-feather="eye"></i></button>
            <button data-task-edit="${t.id}" class="p-2 text-indigo-600" title="Edit" aria-label="Edit task"><i data-feather="edit-2"></i></button>
            <button data-task-delete="${t.id}" class="p-2 text-red-600" title="Delete" aria-label="Delete task"><i data-feather="trash-2"></i></button>
        </td>
    `; tbody.appendChild(tr); }); tbody.querySelectorAll('[data-task-view]').forEach(b=> b.addEventListener('click', ()=> viewTask(b.getAttribute('data-task-view')))); tbody.querySelectorAll('[data-task-edit]').forEach(b=> b.addEventListener('click', ()=> editTask(b.getAttribute('data-task-edit')))); tbody.querySelectorAll('[data-task-delete]').forEach(b=> b.addEventListener('click', ()=> { if(confirm('Delete this task?')){ TaskStore.remove(b.getAttribute('data-task-delete')); renderTasks(); renderRecentTasks(); refreshDashboardMetrics(); }})); try{ if(window.feather) feather.replace(); }catch(e){}
}

function renderReports(){ const tbody = document.getElementById('report-list'); if(!tbody) return; const reports = ReportStore.all(); tbody.innerHTML = ''; if(!reports.length){ tbody.innerHTML = '<tr><td colspan="5" class="text-center text-gray-500 py-8">No reports yet. Use "Generate Report" to create one.</td></tr>'; return; } reports.forEach(r=>{ const tr = document.createElement('tr'); tr.className = 'report-card'; tr.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${escapeHtml(r.title||'Untitled')}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${escapeHtml(r.type||'')}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(r.createdAt).toLocaleString()}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${escapeHtml(r.status||'')}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <button data-report-view="${r.id}" class="p-2 text-blue-600" title="View report" aria-label="View report"><i data-feather="eye"></i></button>
            <button data-report-delete="${r.id}" class="p-2 text-red-600" title="Delete report" aria-label="Delete report"><i data-feather="trash-2"></i></button>
        </td>
    `; tbody.appendChild(tr); }); tbody.querySelectorAll('[data-report-view]').forEach(b=> b.addEventListener('click', ()=>{ const id = b.getAttribute('data-report-view'); const rpt = ReportStore.all().find(x=>x.id===id); if(!rpt) return alert('Report not found'); const el = document.createElement('div'); el.innerHTML = `<h3 class="text-lg font-semibold mb-2">${escapeHtml(rpt.title)}</h3><p class="text-sm text-gray-700">Type: ${escapeHtml(rpt.type||'')}</p><p class="text-sm text-gray-700 mt-2">Includes Tasks: ${rpt.incTasks ? 'Yes' : 'No'}</p><p class="text-sm text-gray-700">Includes Users: ${rpt.incUsers ? 'Yes' : 'No'}</p>`; openModal({title: 'Report', content: el}); })); tbody.querySelectorAll('[data-report-delete]').forEach(b=> b.addEventListener('click', ()=>{ const id = b.getAttribute('data-report-delete'); if(!confirm('Delete this report?')) return; ReportStore.remove(id); renderReports(); })); try{ if(window.feather) feather.replace(); }catch(e){}
}

function runAnalysis(){
    try{
        const tasks = TaskStore.all();
        const total = tasks.length; const completed = tasks.filter(t=> (t.status||'').toLowerCase()==='completed').length; const pending = total - completed;
        const byAssignee = {};
        tasks.forEach(t=>{ const a = t.assignee || 'Unassigned'; byAssignee[a] = (byAssignee[a]||0) + 1; });
        const summary = `Tasks: ${total}, Completed: ${completed}, Pending: ${pending}`;
        const payload = { summary, total, completed, pending, byAssignee, timestamp: new Date().toISOString() };
        localStorage.setItem('tfp_analysis_v1', JSON.stringify(payload));
        const el = document.getElementById('analysis-summary'); if(el) el.textContent = summary;
        const ts = document.getElementById('analysis-timestamp'); if(ts) ts.textContent = new Date().toLocaleString();
        return payload;
    }catch(e){ console.warn('runAnalysis error', e); return null }
}
