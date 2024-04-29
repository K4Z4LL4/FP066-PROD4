"use strict";

/*
 *******************************CONSTANTES & GLOBALES*****************************
 */

const BACKLOG = 0;
const DOING = 1;
const TEST = 2;
const DONE = 3;

let socket, timeOutId;

/*
 ***Funciones clase d-none. Mostrar y ocultar los elementos del DOM***
 */

function showMe(...elems) { elems.forEach(e => e.classList.remove('d-none')); }

function hideMe(...elems) { elems.forEach(e => e.classList.add('d-none')); }


function messageFlash(msg, kind = "success") {
    flashMsg.innerHTML = msg;
    flash.classList.remove('d-none');
    flash.classList.add(`alert-${kind}`);

    clearTimeout(timeOutId);

    timeOutId = setTimeout(() => {
        flash.classList.add('d-none');
        flash.classList.remove(`alert-${kind}`);
    }, 2000);
}

function broadcast(msg) {
    socket.emit('textit', {
        status: "ok", text: `<strong>${socket.id}</strong>:<br>${msg}`
    });
}


////////////////////////// CRUD //////////////////////////////////////////
async function connDB(body) {
    try {
        const responseRaw = await fetch('/app', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const responseJson = await responseRaw.json();
        console.log("From DB", responseJson);
        messageFlash("Conectado con la base de datos", "success");
        return responseJson.data;

    } catch (error) {
        console.error(error);
        messageFlash("Error de conexión con la base de datos", "danger")
        return null;
    }
}

/////////////////////////////Queries///////////////////////////////////

//Panels//
async function getPanelsDB() {
    const body = {
        query: `{
            panels {
                id
                name
                descrip
                color
            }
        }`
    };
    const data = await connDB(body)
    if (data) { return data.panels; }
    return [];
}


async function getPanelByIdDB(id) {
    const body = {
        query: `{
            getPanelById(id: "${id}") {
                id
                name           
                dat
                descrip
                color
            }
        }`
    };
    const data = await connDB(body);
    if (data) { return data.getPanelById; }
    return {};
}


//Tasks//
async function getTasksByPanelIdDB(panId) {
    const body = {
        query: `{
            getTasksByPanelId(panId: "${panId}") {
                id
                panId
                dat
                descrip
                member
                status
                
            }
        }`
    };
    const data = await connDB(body);
    if (data) {
        return data.getTasksByPanelId;
    }
    return [];
}

async function getTaskByIdDB(id) {
    const body = {
        query: `{
            getTaskById(id: "${id}") {
                id
                panId
                name
                descrip
                member
                dat
                status
                file
            }
        }`
    };
    const data = await connDB(body);
    if (data) { return data.getTaskById; }
    return {};
}

////////////////////////////////////////////////////////////////////////////////
// Mutations
async function addPanelDB(pan) {
    const body = {
        query: `mutation {
            addPanel(
                name: "${pan.name}",
                dat: "${pan.dat}",                
                descrip: "${pan.descrip}",
                color: "${pan.color}"
            ) {
                id
            }
        }`
    };
    const data = await connDB(body);
    if (data) { return data.addPanel; }
    return null;
}

async function updatePanelDB(pan) {
    const body = {
        query: `mutation {
            updatePanel(
                id: "${pan.id}",
                name: "${pan.name}",               
                dat: "${pan.dat}",
                descrip: "${pan.descrip}",
                color: "${pan.color}"             
            ) {
                id
            }
        }`
    };
    const data = await connDB(body);
    if (data) { return data.updatePanel; }
    return {};
}

async function deletePanelDB(id) {
    const body = {
        query: `mutation {
            deletePanel(id: "${id}") {
                id
            }
        }`
    };
    const data = await connDB(body);
    if (data) { return data.deletePanel; }
    return null;
}

async function addTaskDB(tsk) {
    const body = {
        query: `mutation {
            addTask(
                panId: "${tsk.panId}",
                name: "${tsk.name}",
                descrip: "${tsk.descrip}",
                status: ${tsk.status},
                member: "${tsk.member}",
                dat: "${tsk.dat}"
                file: "${tsk.file}"
            ) {
                id
            }
        }`
    };
    const data = await connDB(body);
    if (data) { return data.addTask; }
    return null;
}

async function updateTaskDB(tsk) {
    const body = {
        query: `mutation {
            updateTask(
                id: "${tsk.id}",
                name: "${tsk.name}",
                descrip: "${tsk.descrip}",
                status: ${tsk.status},
                member: "${tsk.member}",
                dat: "${tsk.dat}"
                file: "${tsk.file}"             
            ) {
                id
            }
        }`
    };
    const data = await connDB(body);
    if (data) { return data.updateTask; }
    return {};
}

async function updateTaskStatusDB(id, status) {
    const body = {
        query: `mutation {
            updateTaskStatus(
                id: "${id}",
                status: ${status}
            ) {
                id
            }
        }`
    };
    const data = await connDB(body);
    if (data) { return data.updateTaskStatus; }
    return {};
}

async function deleteTaskDB(id) {
    const body = {
        query: `mutation {
            deleteTask(id: "${id}") {
                id
            }
        }`
    };
    const data = await connDB(body);
    if (data) {
        return data.deleteTask;
    }
    return null;
}

//Confirmación de borrado de tarea
async function deletePan(id) {

    const pan = await getPanelByIdDB(id);

    if (pan) {
        const thingName = document.getElementById("toDeleteName");
        thingName.innerHTML = `el panel ${pan.name}`;
        thingName.dataset.what = "panel";  // Borrar un tablero
        thingName.dataset.id = id;
        confirmDelete.show();
    }

    broadcast("Se va a eliminar un tablero.");
}

async function deleteTask(id) {

    const tsk = await getTaskByIdDB(id);

    if (tsk) {
        const thingName = document.getElementById("toDeleteName");
        thingName.innerHTML = `la tarea ${tsk.name}`;
        thingName.dataset.what = "task";
        thingName.dataset.id = id;
        confirmDelete.show();
    }

    broadcast("Se va a eliminar una tarea");
}

//Borra el elemento confirmado
async function deleteConfirmed() {
    const thingName = document.getElementById("toDeleteName");
    const what = thingName.dataset.what;
    const id = thingName.dataset.id;
    confirmDelete.hide();

    if (what === "panel") {
        await deletePanelDB(id);
        refreshPanels();

        broadcast(`Tablero eliminado<br>(id: ${id})`);

    } else if (what === "task") {
        await deleteTaskDB(id);
        const panId = panelPage.dataset.id;
        const pan = await getPanelByIdDB(panId);
        refreshTasks(pan);
    }

    broadcast(`Tarea eliminada<br>(id: ${id})`);
}

/*
 *******************************CARDS********************************************
 */

//Crear Card Tablero
function createPanCard(pan) {
    let descrip = pan.descrip;
    // Trim description to 30 chars if needed
    if (descrip.length > 30) { descrip = descrip.slice(0, 27) + '...'; }

    return `<div id="panel${pan.id}" class="card mb-3 panel-card" data-id="${pan.id}">
    <button class="btn-close btn-close2" onclick="deletePan('${pan.id}')"></button>
    <h3 class="card-header" style="background-color:${pan.color}">
    ${pan.name}
    </h3>
    <div class="container">
    <div class="d-flex justify-content-center">
    <div class="card mb-3 panel-card">
        <p class="card-text fs-5">${descrip}</p>
    </div>
    </div>
    </div>
    <div class="card-footer d-flex justify-content-around" style="background-color:${pan.color}">
    <button class="btn btn-lg" onclick="openPanForm('${pan.id}')"><i class="bi bi-pencil-fill"></i></button>
    <button class="btn btn-lg" onclick="openPan('${pan.id}')"><i class="bi bi-arrow-down-right-square-fill"></i></button>
    </div>
</div>`;
}

//Crear Card Tarea
function createTaskCard(tsk) {
    let member = tsk.member;
    let dat = tsk.dat;
    let descrip = tsk.descrip;
    // Trim description to 30 chars if needed
    if (descrip.length > 60) { descrip = descrip.slice(0, 57) + '...'; }

    return `<div class="card parrafo" draggable="true" id="task${tsk.id}" data-id="${tsk.id}">
    <div class="card-body">
        <button class="btn-close" onclick="deleteTask('${tsk.id}')"></button>
        <p class="card-text fs-5">${descrip}</p>
        <hr>
        <p class="card-text fw-bold">${member}</p>
        <p class="card-text bg-danger-subtle fw-bold">${dat}</p>
        <button class="btn btn-secondary" onclick="openTaskForm(null,'${tsk.id}')"><i class="bi bi-pencil-fill"></i></button>
    </div>
</div>`;
}

/*
 *************** Gestión de eventos - Handlers*****************+
 */

//Eventos en la edición/creación de tablero
async function handlePanForm(ev, form) {
    ev.preventDefault();

    const pan = {
        id: String(form.panId.value),
        name: form.panName.value,
        dat: form.panDat.value,
        descrip: form.panDescrip.value,
        color: form.panColor.value,
        tasks: [],
    };

    panelModal.hide();
    form.reset();

    if (pan.id) {
        await updatePanelDB(pan);

        broadcast("Tablero actualizado.");

    } else {
        await addPanelDB(pan);

        broadcast("Tablero creado.");
    }

    refreshPanels();
    return false;
}

//Eventos en la edición/creación de tareas
async function handleTaskForm(ev, form) {
    ev.preventDefault();

    // Ruta del archivo adjunto, si lo había (si no, será una string vacía)
    let file = taskFileOld.href;
    // Si hay un archivo que subir, subirlo
    if (form.taskFile.value) {
        file = await handleFileUpload(form);
    }

    const tsk = {
        id: String(form.tskId.value),
        panId: String(form.tskPanId.value),
        name: form.taskName.value,
        descrip: form.taskDescrip.value,
        dat: form.taskDat.value,
        member: form.taskMember.value,
        status: Number(form.tskStatus.value),
        file,
    };

    taskModal.hide();
    form.reset();

    if (tsk.id) {

        await updateTaskDB(tsk);

        broadcast("Tarea actualizada.");
    } else {

        await addTaskDB(tsk);

        broadcast("Tarea creada.");
    }

    const pan = await getPanelByIdDB(tsk.panId);
    refreshTasks(pan);
    return false;
}

async function handleFileUpload(form) {

    const formData = new FormData(form);
    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });
    const data = await response.json();
    console.log(data);
    return data.path;
}

/*
*************Funciones que gestionan el drag & drop**********+
 */

function dragover(ev) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "move";
}

function dragenter(ev) {
    ev.preventDefault();

    zones.forEach(zone => zone.classList.remove('dragover'));
    this.classList.add('dragover');
}

function dragleave(ev) {
    ev.preventDefault();
}

async function dragdrop(ev) {
    ev.preventDefault();
    const column = ev.currentTarget;
    this.classList.remove('dragover');
    const tskId = ev.dataTransfer.getData('text/plain');
    const card = document.getElementById(tskId);
    const id = card.dataset.id;
    const status = column.dataset.status;

    await updateTaskStatusDB(String(id), Number(status));

    column.querySelector("div").appendChild(card);

    broadcast(`Se ha cambiado una tarea de estado`);
}

function dragstart(ev) {
    ev.dataTransfer.setData('text/plain', this.id);
}

function dragend(ev) {
    // Remove dragover class from all zones
    zones.forEach(zone => zone.classList.remove('dragover'));
}

function applyListeners() {

    zones.forEach(zone => {
        zone.addEventListener('dragover', dragover);
        zone.addEventListener('dragenter', dragenter);
        zone.addEventListener('dragleave', dragleave);
        zone.addEventListener('drop', dragdrop);
    });
}


function initializeSocket() {
    socket = io();

    // Muestra los mensajes recibidos
    socket.on('textit', (msg) => {
        console.log("Recibido:", msg);
        messageFlash(msg.text, "info");
    });
}

/*
 *******************************UI********************************************
 */

//Cambia  interfaz 1 - 3
function goPansList() {
    hideMe(panHeader, panelPage);
    showMe(dashboardHeader, panelsList);
}

//Actualización de tableros al crear
async function refreshPanels() {

    const panels = await getPanelsDB();

    panelsList.innerHTML = '';
    panels.forEach(pan => {
        panelsList.innerHTML += createPanCard(pan);
    });
}

//Oculta los tableros y muestra las tareas del seleccionado
async function openPan(id) {
    id = String(id);
    console.log('Opening pan', id);

    hideMe(dashboardHeader, panelsList);
    const pan = await getPanelByIdDB(id);
    panelPage.dataset.id = id;
    refreshTasks(pan);
    showMe(panHeader, panelPage);

    broadcast("ha abierto el tablero " + pan.name);
}

//Mostrar formulario tableros
async function openPanForm(id=null) {
    if (id) {

        panModalTitle.innerHTML = 'Editar panel';
        const pan = await getPanelByIdDB(id);

        panFormFields.id.value = id;
        panFormFields.name.value = pan.name;
        panFormFields.dat.value = pan.dat.slice(0, 10);
        panFormFields.descrip.value = pan.descrip;
        panFormFields.color.value = pan.color;

    } else {

        panModalTitle.innerHTML = 'Nuevo panel';
        panFormFields.id.value = '';
        panFormFields.name.value = '';
        panFormFields.dat.value = '';
        panFormFields.descrip.value = '';
        panFormFields.color.value = '#ffcc3c';

    }
    panelModal.show();

    broadcast("Se ha abierto el formulario de TABLERO.");
}

//Actualización de tareas al crear
async function refreshTasks(pan) {

    const tasks = await getTasksByPanelIdDB(pan.id);

    backlogsList.innerHTML = '';
    doingsList.innerHTML = '';
    testsList.innerHTML = '';
    donesList.innerHTML = '';

    if (pan) {

        tasks.forEach(tsk => {
            const tskCard = createTaskCard(tsk);
            switch (tsk.status) {
                case BACKLOG:
                    backlogsList.innerHTML += tskCard;
                    break;
                case DOING:
                    doingsList.innerHTML += tskCard;
                    break;
                case TEST:
                    testsList.innerHTML += tskCard;
                    break;
                case DONE:
                    donesList.innerHTML += tskCard;
                    break;
            }
        });

        //Añade los listeners del drag a las cards de tareas
        document.querySelectorAll('.parrafo').forEach(card => {
            card.addEventListener('dragstart', dragstart);
            card.addEventListener('dragend', dragend);
        });
    }
}

//Mostrar formulario de tareas
async function openTaskForm(status, id = null) {
    // Set hidden values in form
    tskFormFields.panId.value = panelPage.dataset.id;
    taskFileOld.href = '';
    hideMe(taskFileOld);

    if (id) {
        id = String(id);
        tskModalTitle.innerHTML = 'Editar tarea';
        const tsk = await getTaskByIdDB(id);

        tskFormFields.status.value = tsk.status;
        tskFormFields.id.value = id;
        tskFormFields.name.value = tsk.name;
        tskFormFields.descrip.value = tsk.descrip;
        tskFormFields.dat.value = tsk.dat;
        tskFormFields.member.value = tsk.member;
        // Si existe una ruta de archivo, mostrar el enlace
        if (tsk.file) {
            taskFileOld.href = tsk.file;
            showMe(taskFileOld);
        }

    } else {

        tskModalTitle.innerHTML = 'Nueva tarea';
        tskFormFields.status.value = status;
        tskFormFields.id.value = '';
        tskFormFields.name.value = '';
        tskFormFields.descrip.value = '';
        tskFormFields.dat.value = '';
        tskFormFields.member.value = '';
    }
    taskModal.show();

    broadcast("Se ha abierto el formulario de TAREA.");
}


/*
 *******************************GLOBALS********************************************
 */

const dashboardHeader = document.getElementById('dashboardHeader');
const panHeader = document.getElementById('panHeader');
const panelsList = document.getElementById('panelsList');
const panelPage = document.getElementById('panelPage');
const panelModal = new bootstrap.Modal('#panelModal');
const panModalTitle = document.getElementById('panModalTitle');
const taskModal = new bootstrap.Modal('#taskModal');
const tskModalTitle = document.getElementById('tskModalTitle');
const taskForm = document.getElementById('taskForm');
const confirmDelete = new bootstrap.Modal('#confirmDelete');
const backlogsColumn = document.getElementById('backlogs-column');
const backlogsList = document.getElementById('backlogsList');
const doingsColumn = document.getElementById('doings-column');
const doingsList = document.getElementById('doingsList');
const testsColumn = document.getElementById('tests-column');
const testsList = document.getElementById('testsList');
const donesColumn = document.getElementById('dones-column');
const donesList = document.getElementById('donesList');
const flash = document.getElementById('flash');
const flashMsg = document.getElementById('flashMsg');

// Campos de los formularios
const panFormFields = {
    id: document.getElementById('panId'),
    name: document.getElementById('panName'),
    dat: document.getElementById('panDat'),
    descrip: document.getElementById('panDescrip'),
    color: document.getElementById('panColor'),
};
const tskFormFields = {
    id: document.getElementById('tskId'),
    status: document.getElementById('tskStatus'),
    panId: document.getElementById('tskPanId'),
    name: document.getElementById('taskName'),
    descrip: document.getElementById('taskDescrip'),
    dat: document.getElementById('taskDat'),
    member: document.getElementById('taskMember'),
};
const zones = [backlogsColumn, doingsColumn, testsColumn,
    donesColumn];

async function init() {
    initializeSocket();
    applyListeners();
    refreshPanels();
}

init();
