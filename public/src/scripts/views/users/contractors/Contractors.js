// @filename: Contractors.ts
import { deleteEntity, getEntitiesData, getEntityData, registerEntity, setPassword, setUserRole, updateEntity, getUserInfo } from "../../../endpoints.js";
import { drawTagsIntoTables, inputObserver, inputSelect, CloseDialog } from "../../../tools.js";
import { Config } from "../../../Configs.js";
import { tableLayout } from "./Layout.js";
import { tableLayoutTemplate } from "./Templates.js";
const tableRows = Config.tableRows;
const currentPage = Config.currentPage;
const currentUser = await getUserInfo();
const currentCustomer = await getEntityData('User', `${currentUser.attributes.id}`);
const getUsers = async () => {
    const users = await getEntitiesData('User');
    const FSuper = users.filter((data) => data.isSuper === false);
    const FCustomer = FSuper.filter((data) => data.customer.id === `${currentCustomer.customer.id}`);
    const data = FSuper.filter((data) => `${data.userType}`.includes('CONTRACTOR'));
    return data;
};
export class Contractors {
    constructor() {
        this.dialogContainer = document.getElementById('app-dialogs');
        this.entityDialogContainer = document.getElementById('entity-editor-container');
        this.content = document.getElementById('datatable-container');
        this.searchEntity = async (tableBody, data) => {
            const search = document.getElementById('search');
            await search.addEventListener('keyup', () => {
                const arrayData = data.filter((user) => `${user.firstName}
                 ${user.lastName}
                 ${user.username}
                 ${user.dni}`
                    .toLowerCase()
                    .includes(search.value.toLowerCase()));
                let filteredResult = arrayData.length;
                let result = arrayData;
                if (filteredResult >= tableRows)
                    filteredResult = tableRows;
                this.load(tableBody, currentPage, result);
            });
        };
        this.generateContractorName = async () => {
            let firstName;
            let lastName;
            let secondLastName;
            let contractorName;
            let userName;
            firstName = document.getElementById('entity-firstname');
            lastName = document.getElementById('entity-lastname');
            secondLastName = document.getElementById('entity-secondlastname');
            contractorName = document.getElementById('entity-customer');
            userName = document.getElementById('entity-username');
            let _fragmentOne;
            let _fragmentTwo;
            let _fragmentThree;
            _fragmentOne = '';
            _fragmentTwo = '';
            _fragmentThree = '';
            firstName.addEventListener('keyup', (e) => {
                _fragmentOne = firstName.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                userName.setAttribute('value', `${_fragmentOne.trim()}.${_fragmentTwo}${_fragmentThree}`);
            });
            lastName.addEventListener('keyup', (e) => {
                _fragmentTwo = lastName.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                userName.setAttribute('value', `${_fragmentOne.trim()}.${_fragmentTwo}${_fragmentThree}`);
            });
            secondLastName.addEventListener('keyup', (e) => {
                _fragmentThree = secondLastName.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                if (secondLastName.value.length > 0) {
                    _fragmentOne[0];
                    userName.setAttribute('value', `${_fragmentOne}.${_fragmentTwo}${_fragmentThree[0]}`);
                }
                else {
                    userName.setAttribute('value', `${_fragmentOne}.${_fragmentTwo}${_fragmentThree}`);
                }
            });
        };
    }
    async render() {
        let data = await getUsers();
        this.content.innerHTML = '';
        this.content.innerHTML = tableLayout;
        const tableBody = document.getElementById('datatable-body');
        tableBody.innerHTML = tableLayoutTemplate.repeat(tableRows);
        this.load(tableBody, currentPage, data);
        this.searchEntity(tableBody, data);
        this.pagination(data, tableRows, currentPage);
    }
    load(table, currentPage, data) {
        setUserPassword();
        setRole();
        table.innerHTML = '';
        currentPage--;
        let start = tableRows * currentPage;
        let end = start + tableRows;
        let paginatedItems = data.slice(start, end);
        if (data.length === 0) {
            let row = document.createElement('tr');
            row.innerHTML = `
        <td>los datos no coinciden con su búsqueda</td>
        <td></td>
        <td></td>
      `;
            table.appendChild(row);
        }
        else {
            for (let i = 0; i < paginatedItems.length; i++) {
                let contractor = paginatedItems[i];
                let row = document.createElement('tr');
                row.innerHTML += `
          <td>${contractor.firstName} ${contractor.lastName}</dt>
          <td>${contractor.dni}</dt>
          <td>${contractor.username}</dt>
          <td class="key"><button class="button" id="change-user-password" data-userid="${contractor.id}"><i class="fa-regular fa-key"></i></button></td>
          <td class="tag"><span>${contractor.state.name}</span></td>
          <td class="entity_options">
            <button class="button" id="edit-entity" data-entityId="${contractor.id}">
              <i class="fa-solid fa-pen"></i>
            </button>

            <button class="button" id="remove-entity" data-entityId="${contractor.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </dt>
        `;
                table.appendChild(row);
                drawTagsIntoTables();
            }
        }
        this.register();
        this.import();
        this.edit(this.entityDialogContainer, data);
        this.remove();
        this.changeUserPassword();
    }
    changeUserPassword() {
        const changeUserPasswordKeys = document.querySelectorAll('#change-user-password');
        changeUserPasswordKeys.forEach((buttonKey) => {
            buttonKey.addEventListener('click', async () => {
                let userId = buttonKey.dataset.userid;
                this.dialogContainer.style.display = 'block';
                this.dialogContainer.innerHTML = `
                    <div class="dialog_content" id="dialog-content">
                        <div class="dialog">
                            <div class="dialog_container padding_8">
                                <div class="dialog_header">
                                    <h2>Actualizar contraseña</h2>
                                </div>

                                <div class="dialog_message padding_8">
                                    <div class="material_input">
                                        <input type="password" id="password" autocomplete="none">
                                        <label for="entity-lastname"><i class="fa-solid fa-lock"></i> Nueva contraseña</label>
                                    </div>

                                    <div class="material_input">
                                        <input type="password" id="re-password" autocomplete="none">
                                        <label for="entity-lastname"><i class="fa-solid fa-lock"></i> Repetir contraseña</label>
                                    </div>
                                </div>

                                <div class="dialog_footer">
                                    <button class="btn btn_primary" id="cancel">Cancelar</button>
                                    <button class="btn btn_danger" id="update-password">Actualizar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                inputObserver();
                const _password = document.getElementById('password');
                const _repassword = document.getElementById('re-password');
                const _updatePasswordButton = document.getElementById('update-password');
                const _closeButton = document.getElementById('cancel');
                const _dialog = document.getElementById('dialog-content');
                _updatePasswordButton.addEventListener('click', () => {
                    if (_password.value === '') {
                        alert('El campo "Contraseña" no puede estar vacío.');
                    }
                    else if (_repassword.value === ' ') {
                        alert('Debe repetir la contraseña para continuar');
                    }
                    else if (_password.value === _repassword.value) {
                        let raw = JSON.stringify({
                            "id": `${userId}`,
                            "newPassword": `${_password.value}`
                        });
                        setPassword(raw)
                            .then(() => {
                            setTimeout(() => {
                                alert('Se ha cambiado la contraseña');
                                new CloseDialog().x(_dialog);
                            }, 1000);
                        });
                    }
                    else {
                        console.log('Las contraseñas no coinciden');
                    }
                });
                _closeButton.onclick = () => {
                    new CloseDialog().x(_dialog);
                };
            });
        });
    }
    register() {
        // register entity
        const openEditor = document.getElementById('new-entity');
        openEditor.addEventListener('click', () => {
            renderInterface('User');
        });
        const renderInterface = async (entities) => {
            this.entityDialogContainer.innerHTML = '';
            this.entityDialogContainer.style.display = 'flex';
            this.entityDialogContainer.innerHTML = `
        <div class="entity_editor" id="entity-editor">
          <div class="entity_editor_header">
            <div class="user_info">
              <div class="avatar"><i class="fa-regular fa-user"></i></div>
              <h1 class="entity_editor_title">Registrar <br><small>Contratista</small></h1>
            </div>

            <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
          </div>

          <!-- EDITOR BODY -->
          <div class="entity_editor_body">
            <div class="material_input">
              <input type="text" id="entity-firstname" autocomplete="none">
              <label for="entity-firstname">Nombre</label>
            </div>

            <div class="material_input">
              <input type="text" id="entity-lastname" autocomplete="none">
              <label for="entity-lastname">Apellido</label>
            </div>

            <div class="material_input">
              <input type="text" id="entity-secondlastname" autocomplete="none">
              <label for="entity-secondlastname">2do Apellido</label>
            </div>

            <div class="material_input">
              <input type="text"
                id="entity-dni"
                maxlength="10" autocomplete="none">
              <label for="entity-dni">Cédula</label>
            </div>

            <div class="material_input">
              <input type="text"
                id="entity-phone"
                maxlength="10" autocomplete="none">
              <label for="entity-phone">Teléfono</label>
            </div>

            <div class="material_input">
              <input type="text" id="entity-username" class="input_filled" placeholder="john.doe@ejemplo.com" readonly>
              <label for="entity-username"><i class="input_locked fa-solid fa-lock"></i> Nombre de usuario</label>
            </div>

            <div class="material_input_select">
              <label for="entity-state">Estado</label>
              <input type="text" id="entity-state" class="input_select" readonly placeholder="cargando..." autocomplete="none">
              <div id="input-options" class="input_options">
              </div>
            </div>

            <div class="material_input_select" style="display: none">
              <label for="entity-business">Empresa</label>
              <input type="text" id="entity-business" class="input_select" readonly placeholder="cargando..." autocomplete="none">
              <div id="input-options" class="input_options">
              </div>
            </div>

            <div class="material_input_select" style="display: none">
              <label for="entity-citadel">Ciudadela</label>
              <input type="text" id="entity-citadel" class="input_select" readonly placeholder="cargando...">
              <div id="input-options" class="input_options">
              </div>
            </div>

            <div class="material_input_select" style="display: none">
              <label for="entity-customer">Cliente</label>
              <input type="text" id="entity-customer" class="input_select" readonly placeholder="cargando...">
              <div id="input-options" class="input_options">
              </div>
            </div>

            <div class="material_input_select" style="display: none">
              <label for="entity-department">Departamento</label>
              <input type="text" id="entity-department" class="input_select" readonly placeholder="cargando...">
              <div id="input-options" class="input_options">
              </div>
            </div>

            <div class="form_group">
                <div class="form_input">
                    <label class="form_label" for="start-time">Entrada:</label>
                    <input type="time" class="input_time input_time-start" id="start-time" name="start-time">
                </div>

                <div class="form_input">
                    <label class="form_label" for="end-time">Salida:</label>
                    <input type="time" class="input_time input_time-end" id="end-time" name="end-time">
                </div>
            </div>

            <br>
            <div class="material_input">
              <input type="password" id="tempPass" autocomplete="false">
              <label for="tempPass">Contraseña</label>
            </div>

          </div>
          <!-- END EDITOR BODY -->

          <div class="entity_editor_footer">
            <button class="btn btn_primary btn_widder" id="register-entity">Guardar</button>
          </div>
        </div>
      `;
            // @ts-ignore
            inputObserver();
            inputSelect('Citadel', 'entity-citadel');
            inputSelect('Customer', 'entity-customer');
            inputSelect('State', 'entity-state');
            inputSelect('Department', 'entity-department');
            inputSelect('Business', 'entity-business');
            this.close();
            this.generateContractorName();
            const registerButton = document.getElementById('register-entity');
            registerButton.addEventListener('click', () => {
                let _values;
                _values = {
                    firstName: document.getElementById('entity-firstname'),
                    lastName: document.getElementById('entity-lastname'),
                    secondLastName: document.getElementById('entity-secondlastname'),
                    dni: document.getElementById('entity-dni'),
                    phoneNumer: document.getElementById('entity-phone'),
                    state: document.getElementById('entity-state'),
                    customer: document.getElementById('entity-customer'),
                    username: document.getElementById('entity-username'),
                    citadel: document.getElementById('entity-citadel'),
                    temporalPass: document.getElementById('tempPass'),
                    ingressHour: document.getElementById('start-time'),
                    turnChange: document.getElementById('end-time'),
                    departments: document.getElementById('entity-department')
                };
                const contractorRaw = JSON.stringify({
                    "lastName": `${_values.lastName.value}`,
                    "secondLastName": `${_values.secondLastName.value}`,
                    "isSuper": false,
                    "email": "",
                    "temp": `${_values.temporalPass.value}`,
                    "isWebUser": false,
                    "active": true,
                    "firstName": `${_values.firstName.value}`,
                    "ingressHour": `${_values.ingressHour.value}`,
                    "turnChange": `${_values.turnChange.value}`,
                    "state": {
                        "id": `${_values.state.dataset.optionid}`
                    },
                    "contractor": {
                        "id": "06b476c4-d151-d7dc-cf0e-2a1e19295a00",
                    },
                    "customer": {
                        "id": `${_values.customer.dataset.optionid}`
                    },
                    "citadel": {
                        "id": `${_values.citadel.dataset.optionid}`
                    },
                    "department": {
                        "id": `${_values.departments.dataset.optionid}`
                    },
                    "phone": `${_values.phoneNumer.value}`,
                    "dni": `${_values.dni.value}`,
                    "userType": "CONTRACTOR",
                    "username": `${_values.username.value}@${_values.customer.value.toLowerCase()}.com`,
                });
                reg(contractorRaw);
            });
        };
        const reg = async (raw) => {
            registerEntity(raw, 'User')
                .then((res) => {
                setTimeout(async () => {
                    let data = await getUsers();
                    const tableBody = document.getElementById('datatable-body');
                    const container = document.getElementById('entity-editor-container');
                    new CloseDialog().x(container);
                    this.load(tableBody, currentPage, data);
                }, 1000);
            });
        };
    }
    import() {
        const _importContractors = document.getElementById('import-entities');
        _importContractors.addEventListener('click', () => {
            this.entityDialogContainer.innerHTML = '';
            this.entityDialogContainer.style.display = 'flex';
            this.entityDialogContainer.innerHTML = `
                    <div class="entity_editor id="entity-editor">
                        <div class="entity_editor_header">
                            <div class="user_info">
                                <div class="avatar">
                                    <i class="fa-regular fa-up-from-line"></i>
                                </div>
                                <h1 class="entity_editor_title">Importar <br> <small>Empleados</small></h1>
                            </div>
                            <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
                        </div>
                        <!--EDITOR BODY -->
                        <div class="entity_editor_body padding_t_8_important">
                            <div class="sidebar_section">
                                <div class="file_template">
                                    <i class="fa-solid fa-file-csv"></i>
                                    <div class="description">
                                        <p class="filename">Plantilla de Contratistas</p>
                                        <a href="./public/src/templates/NetvisitorsEmpleados.csv" download="./public/src/templates/NetvisitorsContractors.csv" rel="noopener" target="_self" class="filelink">Descargar</a>
                                    </div>
                                </div>
                            </div>
                            <div class="sidebar_section">
                                <input type="file" id="file-handler">
                            </div>
                        </div>
                        <div class="entity_editor_footer">
                            <button class="btn btn_primary btn_widder" id="button-import">Importar<button>
                        </div>
                    </div>
                `;
            this.close();
            const _fileHandler = document.getElementById('file-handler');
            _fileHandler.addEventListener('change', () => {
                readFile(_fileHandler.files[0]);
            });
            async function readFile(file) {
                const customer = await getEntitiesData('Customer');
                const citadel = await getEntitiesData('Citadel');
                const department = await getEntitiesData('Department');
                const contractor = await getEntitiesData('Contractor');
                const fileReader = new FileReader();
                fileReader.readAsText(file);
                fileReader.addEventListener('load', (e) => {
                    let result = e.srcElement.result;
                    let resultSplit = result.split('\r');
                    let rawFile;
                    let stageUsers = [];
                    for (let i = 1; i < resultSplit.length; i++) {
                        let contractorData = resultSplit[i].split(';');
                        rawFile = JSON.stringify({
                            "lastName": `${contractorData[1].replace(/\n/g, '')}`,
                            "secondLastName": `${contractorData[2].replace(/\n/g, '')}`,
                            "isSuper": false,
                            "email": "",
                            "temp": `${contractorData[5].replace(/\n/g, '')}`,
                            "isWebUser": false,
                            "isActive": true,
                            "newUser": true,
                            "firstName": `${contractorData[0].replace(/\n/g, '')}`,
                            "ingressHour": `${contractorData[6].replace(/\n/g, '')}`,
                            "turnChange": `${contractorData[7].replace(/\n/g, '')}`,
                            "state": {
                                "id": "60885987-1b61-4247-94c7-dff348347f93"
                            },
                            "contractor": {
                                "id": `${contractor[0].id}`,
                            },
                            "customer": {
                                "id": `${customer[0].id}`
                            },
                            "citadel": {
                                "id": `${citadel[0].id}`
                            },
                            "department": {
                                "id": `${department[0].id}`
                            },
                            "phone": `${contractorData[3].replace(/\n/g, '')}`,
                            "dni": `${contractorData[4].replace(/\n/g, '')}`,
                            "userType": "CONTRACTOR",
                            "username": `${contractorData[0].toLowerCase().replace(/\n/g, '')}.${contractorData[1].toLowerCase().replace(/\n/g, '')}@${customer[0].name.toLowerCase()}.com`,
                            "createVisit": false,
                        });
                        stageUsers.push(rawFile);
                    }
                    const _import = document.getElementById('button-import');
                    _import.addEventListener('click', () => {
                        stageUsers.forEach((user) => {
                            registerEntity(user, 'User')
                                .then((res) => {
                                setTimeout(async () => {
                                    let data = await getUsers();
                                    const tableBody = document.getElementById('datatable-body');
                                    const container = document.getElementById('entity-editor-container');
                                    new CloseDialog().x(container);
                                    new Contractors().load(tableBody, currentPage, data);
                                }, 1000);
                            });
                        });
                    });
                });
            }
        });
    }
    edit(container, data) {
        // Edit entity
        const edit = document.querySelectorAll('#edit-entity');
        edit.forEach((edit) => {
            const entityId = edit.dataset.entityid;
            edit.addEventListener('click', () => {
                RInterface('User', entityId);
            });
        });
        const RInterface = async (entities, entityID) => {
            const data = await getEntityData(entities, entityID);
            this.entityDialogContainer.innerHTML = '';
            this.entityDialogContainer.style.display = 'flex';
            this.entityDialogContainer.innerHTML = `
                <div class="entity_editor" id="entity-editor">
                <div class="entity_editor_header">
                    <div class="user_info">
                    <div class="avatar"><i class="fa-regular fa-user"></i></div>
                    <h1 class="entity_editor_title">Editar <br><small>${data.firstName} ${data.lastName}</small></h1>
                    </div>

                    <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
                </div>

                <!-- EDITOR BODY -->
                <div class="entity_editor_body">
                    <div class="material_input">
                    <input type="text" id="entity-firstname" class="input_filled" value="${data.firstName}" readonly>
                    <label for="entity-firstname">Nombre</label>
                    </div>

                    <div class="material_input">
                    <input type="text" id="entity-lastname" class="input_filled" value="${data.lastName}" reandonly>
                    <label for="entity-lastname">Apellido</label>
                    </div>

                    <div class="material_input">
                    <input type="text" id="entity-secondlastname" class="input_filled" value="${data.secondLastName}" readonly>
                    <label for="entity-secondlastname">2do Apellido</label>
                    </div>

                    <div class="material_input">
                    <input type="text"
                        id="entity-dni"
                        class="input_filled"
                        maxlength="10"
                        value="${data.dni}">
                    <label for="entity-dni">Cédula</label>
                    </div>

                    <div class="material_input">
                    <input type="text"
                        id="entity-phone"
                        class="input_filled"
                        maxlength="10"
                        value="${data.phone}">
                    <label for="entity-phone">Teléfono</label>
                    </div>

                    <div class="material_input">
                    <input type="text" id="entity-username" class="input_filled" value="${data.username}" readonly>
                    <label for="entity-username">Nombre de usuario</label>
                    </div>

                    <div class="material_input_select">
                    <label for="entity-state">Estado</label>
                    <input type="text" id="entity-state" class="input_select" readonly placeholder="cargando...">
                    <div id="input-options" class="input_options">
                    </div>
                    </div>

                    <div class="material_input_select" style="display: none">
                    <label for="entity-business">Empresa</label>
                    <input type="text" id="entity-business" class="input_select" readonly placeholder="cargando...">
                    <div id="input-options" class="input_options">
                    </div>
                    </div>

                    <div class="material_input_select" style="display: none">
                    <label for="entity-citadel">Ciudadela</label>
                    <input type="text" id="entity-citadel" class="input_select" readonly placeholder="cargando...">
                    <div id="input-options" class="input_options">
                    </div>
                    </div>

                    <div class="material_input_select" style="display: none">
                    <label for="entity-customer">Cliente</label>
                    <input type="text" id="entity-customer" class="input_select" readonly placeholder="cargando...">
                    <div id="input-options" class="input_options">
                    </div>
                    </div>

                    <div class="material_input_select">
                    <label for="entity-contractor">Contratista</label>
                    <input type="text" id="entity-contractor" class="input_select" readonly placeholder="cargando...">
                    <div id="input-options" class="input_options">
                    </div>
                    </div>

                    <div class="form_group">
                        <div class="form_input">
                            <label class="form_label" for="start-time">Entrada:</label>
                            <input type="time" class="input_time input_time-start" id="start-time" name="start-time" value="${data.ingressHour}">
                        </div>

                        <div class="form_input">
                            <label class="form_label" for="end-time">Salida:</label>
                            <input type="time" class="input_time input_time-end" id="end-time" name="end-time" value="${data.turnChange}">
                        </div>
                    </div>

                    <br>
                    <div class="material_input">
                    <input type="password" id="tempPass" >
                    <label for="tempPass">Contraseña:</label>
                    </div>

                </div>
                <!-- END EDITOR BODY -->

                <div class="entity_editor_footer">
                    <button class="btn btn_primary btn_widder" id="update-changes">Guardar</button>
                </div>
                </div>
            `;
            inputObserver();
            inputSelect('Business', 'entity-citadel');
            inputSelect('Customer', 'entity-customer');
            inputSelect('State', 'entity-state', data.state.name);
            inputSelect('Business', 'entity-business');
            inputSelect('Contractor', 'entity-contractor');
            this.close();
            updatecontractor(entityID);
        };
        const updatecontractor = async (contractorId) => {
            let updateButton;
            updateButton = document.getElementById('update-changes');
            const _values = {
                firstName: document.getElementById('entity-firstname'),
                lastName: document.getElementById('entity-lastname'),
                secondLastName: document.getElementById('entity-secondlastname'),
                phone: document.getElementById('entity-phone'),
                dni: document.getElementById('entity-dni'),
                status: document.getElementById('entity-state'),
                ingressHour: document.getElementById('start-time'),
                turnChange: document.getElementById('end-time'),
                contractor: document.getElementById('entity-contractor'),
            };
            updateButton.addEventListener('click', () => {
                let contractorRaw = JSON.stringify({
                    "lastName": `${_values.lastName.value}`,
                    "secondLastName": `${_values.secondLastName.value}`,
                    "active": true,
                    "firstName": `${_values.firstName.value}`,
                    "state": {
                        "id": `${_values.status.dataset.optionid}`
                    },
                    "ingressHour": `${_values.ingressHour.value}`,
                    "turnChange": `${_values.turnChange.value}`,
                    "phone": `${_values.phone.value}`,
                    "dni": `${_values.dni.value}`,
                    "contractor": {
                        "id": `${_values.contractor.optionid}`
                    }
                });
                update(contractorRaw);
            });
            /**
             * Update entity and execute functions to finish defying user
             * @param raw
             */
            const update = (raw) => {
                updateEntity('User', contractorId, raw)
                    .then((res) => {
                    setTimeout(async () => {
                        let tableBody;
                        let container;
                        let data;
                        tableBody = document.getElementById('datatable-body');
                        container = document.getElementById('entity-editor-container');
                        data = await getUsers();
                        new CloseDialog().x(container);
                        this.load(tableBody, currentPage, data);
                    }, 100);
                });
            };
        };
    }
    remove() {
        const remove = document.querySelectorAll('#remove-entity');
        remove.forEach((remove) => {
            const entityId = remove.dataset.entityid;
            remove.addEventListener('click', () => {
                this.dialogContainer.style.display = 'block';
                this.dialogContainer.innerHTML = `
          <div class="dialog_content" id="dialog-content">
            <div class="dialog dialog_danger">
              <div class="dialog_container">
                <div class="dialog_header">
                  <h2>¿Deseas eliminar este contratista?</h2>
                </div>

                <div class="dialog_message">
                  <p>Esta acción no se puede revertir</p>
                </div>

                <div class="dialog_footer">
                  <button class="btn btn_primary" id="cancel">Cancelar</button>
                  <button class="btn btn_danger" id="delete">Eliminar</button>
                </div>
              </div>
            </div>
          </div>
        `;
                // delete button
                // cancel button
                // dialog content
                const deleteButton = document.getElementById('delete');
                const cancelButton = document.getElementById('cancel');
                const dialogContent = document.getElementById('dialog-content');
                deleteButton.onclick = () => {
                    deleteEntity('User', entityId);
                    new CloseDialog().x(dialogContent);
                    this.render();
                };
                cancelButton.onclick = () => {
                    new CloseDialog().x(dialogContent);
                    this.render();
                };
            });
        });
    }
    pagination(items, limitRows, currentPage) {
        const tableBody = document.getElementById('datatable-body');
        const paginationWrapper = document.getElementById('pagination-container');
        paginationWrapper.innerHTML = '';
        let pageCount;
        pageCount = Math.ceil(items.length / limitRows);
        let button;
        for (let i = 1; i < pageCount + 1; i++) {
            button = setupButtons(i, items, currentPage, tableBody, limitRows);
            paginationWrapper.appendChild(button);
        }
        function setupButtons(page, items, currentPage, tableBody, limitRows) {
            const button = document.createElement('button');
            button.classList.add('pagination_button');
            button.innerText = page;
            button.addEventListener('click', () => {
                currentPage = page;
                new Contractors().load(tableBody, page, items);
            });
            return button;
        }
    }
    close() {
        const closeButton = document.getElementById('close');
        const editor = document.getElementById('entity-editor-container');
        closeButton.addEventListener('click', () => {
            console.log('close');
            new CloseDialog().x(editor);
        });
    }
}
export async function setUserPassword() {
    const users = await getEntitiesData('User');
    const filterBySuperUsers = users.filter((data) => data.isSuper === false);
    const filterByUserType = filterBySuperUsers.filter((data) => `${data.userType}`.includes('CONTRACTOR'));
    const data = filterByUserType;
    data.forEach((newUser) => {
        let raw = JSON.stringify({
            "id": `${newUser.id}`,
            "newPassword": `${newUser.temp}`
        });
        if (newUser.newUser === true && newUser.temp !== undefined)
            setPassword(raw);
    });
}
export async function setRole() {
    const users = await getEntitiesData('User');
    const filterByNewUsers = users.filter((data) => data.newUser == true);
    const filterByUserType = filterByNewUsers.filter((data) => `${data.userType}`.includes('CONTRACTOR'));
    const data = filterByUserType;
    data.forEach((newUser) => {
        let raw = JSON.stringify({
            "id": `${newUser.id}`,
            "roleCode": 'app_clientes'
        });
        let updateNewUser = JSON.stringify({
            "newUser": false
        });
        if (newUser.newUser == true) {
            setUserRole(raw);
            setTimeout(() => {
                updateEntity('User', newUser.id, updateNewUser);
            }, 1000);
        }
    });
}
