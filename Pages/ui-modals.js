// ui-modals.js - modal helpers used across the app
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

    function closeHandler(){ closeModal(); if(typeof options.onClose === 'function') options.onClose(); }
    closeBtn.onclick = closeHandler;
    bd.classList.add('open'); modal.classList.add('open');
    trapFocus(modal);

    const esc = (e)=>{ if(e.key === 'Escape') closeHandler(); };
    document.addEventListener('keydown', esc);
    const outside = (ev)=>{ if(ev.target === bd) closeHandler(); };
    bd.addEventListener('click', outside);
    bd._teardown = ()=>{ document.removeEventListener('keydown', esc); bd.removeEventListener('click', outside); };
}

function closeModal(){
    const bd = document.querySelector('.modal-backdrop'); if(!bd) return;
    const modal = bd.querySelector('.modal'); modal.classList.remove('open'); bd.classList.remove('open');
    if(typeof bd._teardown === 'function') bd._teardown();
}

function trapFocus(container){
    const focusable = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const nodes = Array.from(container.querySelectorAll(focusable)).filter(n=>n.offsetParent !== null);
    if(!nodes.length) return; const first = nodes[0]; const last = nodes[nodes.length-1]; first.focus();
    function handle(e){ if(e.key !== 'Tab') return; if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); } else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); } }
    container._focusHandler = handle; document.addEventListener('keydown', handle);
}

function releaseTrap(container){ if(container && container._focusHandler) document.removeEventListener('keydown', container._focusHandler); }

function initModals(){
    createModalBackdrop();
    document.querySelectorAll('[data-modal-target]').forEach(btn => {
        btn.addEventListener('click', function(e){
            const target = btn.getAttribute('data-modal-target');
            // leave logic for main.js to handle specific targets via openEventModal or other functions
            if(target === 'save-changes'){ openModal({title:'Save Changes', content:'<p class="text-sm text-gray-600">Confirm save?</p>'}); }
            else if(target === 'today'){ openModal({title:'Today', content:'<p class="text-sm text-gray-600">Today quick actions</p>'}); }
            else if(target === 'new-task'){ if(typeof openTaskModal === 'function') openTaskModal(); }
            else if(target === 'new-employee'){ if(typeof openEmployeeModal === 'function') openEmployeeModal(); }
            else if(target === 'add-event' || target === 'new-event'){ if(typeof openEventModal === 'function') openEventModal(); }
            else { openModal({title: target || 'Modal', content:'<p>Replace this with your content.</p>'}); }
        });
    });
}
