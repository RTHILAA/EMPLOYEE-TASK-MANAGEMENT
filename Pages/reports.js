// reports.js - page-specific initialization for reports.html
document.addEventListener('DOMContentLoaded', function(){
    try{ if(typeof renderReports === 'function') renderReports(); }catch(e){ console.warn('renderReports missing', e); }
    try{ const btn = document.getElementById('btn-refresh-reports'); if(btn) btn.addEventListener('click', renderReports); }catch(e){}
    try{ const btnRun = document.getElementById('btn-run-analysis'); if(btnRun) btnRun.addEventListener('click', runAnalysis); }catch(e){}
});