// tasks.js - page-specific initialization for tasks.html
document.addEventListener('DOMContentLoaded', function(){
    try{ if(typeof renderTasks === 'function') renderTasks(); }catch(e){ console.warn('renderTasks missing', e); }
    try{ if(typeof renderRecentTasks === 'function') renderRecentTasks(); }catch(e){}
});