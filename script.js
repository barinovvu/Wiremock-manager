


//Загружаем конфиг
let config;
fetch('config.json')
    .then(response => response.json())
    .then(data => {
        config = data;
        fetchMappings();
        fetchFiles();
    });


const mappingsList = document.getElementById('mappings-list');
const mappingEditor = document.getElementById('mapping-editor');
const saveMapping = document.getElementById('save-mapping');
const filesList = document.getElementById('files-list');
const fileEditor = document.getElementById('file-editor');
const saveFile = document.getElementById('save-file');
const createMapping = document.getElementById('create-mapping');
const createFile = document.getElementById('create-file');
const newFileName = document.getElementById('new-file-name');
const deleteAllMappings = document.getElementById('delete-all-mappings');



//Работа с маппингами
function fetchMappings() {
    fetch(`${config.serverUrl}/__admin/mappings`)
        .then(response => response.json())
        .then(data => {
            mappingsList.innerHTML = '';

            data.mappings.forEach(mapping => {
                const li = document.createElement('li');
                li.innerText = mapping.request.url;

                // Создаем кнопку "удалить"
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'удалить';
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Останавливаем всплытие события, чтобы избежать выбора маппинга
                    deleteMapping(mapping.id);
                });

                li.appendChild(deleteButton);
                li.addEventListener('click', () => fetchMapping(mapping.id));
                mappingsList.appendChild(li);
            });
        });
}


function deleteMapping(id) {
    fetch(`${config.serverUrl}/__admin/mappings/${id}`, {
        method: 'DELETE'
    }).then(() => {
        fetchMappings();
    });
}




let isEditing = false;

function fetchMapping(id) {
    fetch(`${config.serverUrl}/__admin/mappings/${id}`)
        .then(response => response.json())
        .then(data => {
            mappingEditor.value = JSON.stringify(data, null, 2);
            isEditing = true;
        });
}

function createNewMapping() {
    mappingEditor.value = JSON.stringify({
        "request": {
            "url": "/example",
            "method": "ANY"
        },
        "response": {
            "status": 200,
            "bodyFileName": "example.json",
            "headers": {
                "Content-Type": "application/json"
            }
        },
        "persistent": true,
        "metadata": {}
    }, null, 2);

    isEditing = false;
}

createMapping.addEventListener('click', () => {createNewMapping();});

saveMapping.addEventListener('click', () => {
    const mapping = JSON.parse(mappingEditor.value);
    let requestUrl;
    let requestMethod;

    if (isEditing && mapping.id) {
        requestUrl = `${config.serverUrl}/__admin/mappings/${mapping.id}`;
        requestMethod = 'PUT';
    } else {
        requestUrl = `${config.serverUrl}/__admin/mappings`;
        requestMethod = 'POST';
    }

    fetch(requestUrl, {
        method: requestMethod,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(mapping)
    }).then(() => {
        fetchMappings();
    });
});


//Работа с файлами
function fetchFiles() {
    fetch(`${config.serverUrl}/__admin/files`)
        .then(response => response.json())
        .then(data => {
            filesList.innerHTML = '';

            data.forEach(file => {
                const filePathParts = file.split('/');
                const fileName = filePathParts[filePathParts.length - 1];

                const listItem = document.createElement('li');
                listItem.textContent = fileName;

                // Создаем кнопку "удалить"
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'удалить';
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Останавливаем всплытие события, чтобы избежать выбора файла
                    deleteFile(fileName);
                });

                listItem.appendChild(deleteButton);
                listItem.addEventListener('click', () => {
                    fetchFileContent(fileName);
                    fileNameInput.value = fileName;
                });
                filesList.appendChild(listItem);
            });
        });
}

function deleteFile(fileName) {
    fetch(`${config.serverUrl}/__admin/files/${fileName}`, {
        method: 'DELETE'
    }).then(() => {
        fetchFiles();
    });
}




function fetchFileContent(filename) {
    fetch(`${config.serverUrl}/__files/${filename}`)
        .then(response => response.text())
        .then(data => {
            fileEditor.value = data;
            newFileName.value = filename; // Сохраняем имя файла в поле для ввода имени файла
        });
}



saveFile.addEventListener('click', () => {
    const filename = newFileName.value;
    const fileContent = fileEditor.value;

    if (filename === '') {
        alert('Пожалуйста, введите имя файла.');
        return;
    }
    fetch(`${config.serverUrl}/__admin/files/${filename}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: fileContent
    }).then(() => {
        fetchFiles();
    });
});


createFile.addEventListener('click', () => {
    const filename = newFileName.value;
    const fileContent = fileEditor.value;

    if (filename === '') {
        alert('Пожалуйста, введите имя файла.');
        return;
    }

    fetch(`${config.serverUrl}/__admin/files/${filename}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: fileContent
    }).then(() => {
        fetchFiles();
    });
});


deleteAllMappings.addEventListener('click', () => {
    fetch(`${config.serverUrl}/__admin/mappings`, {
        method: 'DELETE'
    }).then(() => {
        fetchMappings();
    });
});


fetchMappings();
fetchFiles();