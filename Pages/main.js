// main.js - initialize app features
document.addEventListener('DOMContentLoaded', function(){
    // icons
    initFeather();
    // sidebar
    setActiveSidebar();
    addPrimaryButtonInteractions();
    // charts (if present)
    if(typeof initCharts === 'function') initCharts();
    // settings nav
    try{ if(typeof initSettingsNav === 'function') initSettingsNav(); }catch(e){}
    // modals
    try{ initModals(); }catch(e){}
    // renderers
    try{ if(typeof renderEmployees === 'function') renderEmployees(); }catch(e){}
    try{ if(typeof renderTasks === 'function') renderTasks(); }catch(e){}
    try{ if(typeof renderRecentTasks === 'function') renderRecentTasks(); }catch(e){}
    try{ if(typeof refreshDashboardMetrics === 'function') refreshDashboardMetrics(); }catch(e){}
    try{ if(typeof renderReports === 'function') renderReports(); }catch(e){}
    // schedule
    try{ if(typeof renderSchedule === 'function') renderSchedule(); }catch(e){}
    try{ if(typeof initCalendarNavigation === 'function') initCalendarNavigation(); }catch(e){}
    try{ if(typeof initYearSelector === 'function') initYearSelector(); }catch(e){}

    // analysis wiring
    try{ const btn = document.getElementById('btn-refresh-reports'); if(btn) btn.addEventListener('click', renderReports); }catch(e){}
    try{ const btnRun = document.getElementById('btn-run-analysis'); if(btnRun) btnRun.addEventListener('click', runAnalysis); }catch(e){}
    try{ const btnGen = document.getElementById('btn-generate-from-analysis'); if(btnGen) btnGen.addEventListener('click', ()=> openAnalysisGenerateModal()); }catch(e){}
    try{ runAnalysis(); window.__analysisInterval = setInterval(runAnalysis, 60 * 1000); }catch(e){}

    // global search wiring
    try{ document.querySelectorAll('.app-search').forEach(inp=>{ const handler = debounce(function(){ runGlobalSearch(inp); }, 300); inp.addEventListener('input', handler); }); }catch(e){}
});
