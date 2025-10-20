// schedule.js - page-specific initialization for schedule.html
document.addEventListener('DOMContentLoaded', function(){
    try{ if(typeof renderSchedule === 'function') renderSchedule(); }catch(e){ console.warn('renderSchedule missing', e); }
    try{ if(typeof initCalendarNavigation === 'function') initCalendarNavigation(); }catch(e){}
    // wire add-event buttons (they use data-modal-target handled by ui-modals)
    try{ document.querySelectorAll('[data-modal-target="add-event"]').forEach(b=> b.addEventListener('click', ()=> {})); }catch(e){}
});
