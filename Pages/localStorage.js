const EmployeeStore = (function () {
  const KEY = "tfp_employees_v1";
  function read() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function write(arr) {
    localStorage.setItem(KEY, JSON.stringify(arr));
  }
  function add(emp) {
    const arr = read();
    emp.id = Date.now().toString();
    emp.createdAt = new Date().toISOString();
    arr.push(emp);
    write(arr);
    return emp;
  }
  function update(id, data) {
    const arr = read();
    const i = arr.findIndex((e) => e.id === id);
    if (i === -1) return null;
    arr[i] = Object.assign({}, arr[i], data);
    write(arr);
    return arr[i];
  }
  function remove(id) {
    let arr = read();
    arr = arr.filter((e) => e.id !== id);
    write(arr);
  }
  function all() {
    return read();
  }
  function clear() {
    write([]);
  }
  return { add, update, remove, all, clear };
})();

const TaskStore = (function () {
  const KEY = "tfp_tasks_v1";
  function read() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function write(arr) {
    localStorage.setItem(KEY, JSON.stringify(arr));
  }
  function add(task) {
    const arr = read();
    task.id = "t_" + Date.now().toString();
    task.createdAt = new Date().toISOString();
    arr.unshift(task);
    write(arr);
    return task;
  }
  function update(id, patch) {
    const arr = read();
    const i = arr.findIndex((t) => t.id === id);
    if (i === -1) return null;
    arr[i] = Object.assign({}, arr[i], patch);
    write(arr);
    return arr[i];
  }
  function remove(id) {
    let arr = read();
    arr = arr.filter((t) => t.id !== id);
    write(arr);
  }
  function all() {
    return read();
  }
  function clear() {
    write([]);
  }
  return { add, update, remove, all, clear };
})();

const ReportStore = (function () {
  const KEY = "tfp_reports_v1";
  function read() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function write(arr) {
    localStorage.setItem(KEY, JSON.stringify(arr));
  }
  function add(r) {
    const arr = read();
    r.id = "r_" + Date.now().toString();
    r.createdAt = new Date().toISOString();
    arr.unshift(r);
    write(arr);
    return r;
  }
  function update(id, patch) {
    const arr = read();
    const i = arr.findIndex((x) => x.id === id);
    if (i === -1) return null;
    arr[i] = Object.assign({}, arr[i], patch);
    write(arr);
    return arr[i];
  }
  function remove(id) {
    let arr = read();
    arr = arr.filter((x) => x.id !== id);
    write(arr);
  }
  function all() {
    return read();
  }
  function clear() {
    write([]);
  }
  return { add, update, remove, all, clear };
})();

const EventStore = (function () {
  const KEY = "tfp_events_v1";
  function read() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function write(arr) {
    localStorage.setItem(KEY, JSON.stringify(arr));
  }
  function add(ev) {
    const arr = read();
    ev.id = "e_" + Date.now().toString();
    ev.createdAt = new Date().toISOString();
    arr.unshift(ev);
    write(arr);
    return ev;
  }
  function update(id, patch) {
    const arr = read();
    const i = arr.findIndex((x) => x.id === id);
    if (i === -1) return null;
    arr[i] = Object.assign({}, arr[i], patch);
    write(arr);
    return arr[i];
  }
  function remove(id) {
    let arr = read();
    arr = arr.filter((x) => x.id !== id);
    write(arr);
  }
  function all() {
    return read();
  }
  function clear() {
    write([]);
  }
  return { add, update, remove, all, clear };
})();

window.EmployeeStore = EmployeeStore;
window.TaskStore = TaskStore;
window.ReportStore = ReportStore;
window.EventStore = EventStore;
