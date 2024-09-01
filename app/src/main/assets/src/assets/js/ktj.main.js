/*! KTJ v0.1 | (c) Raul Mauricio Uñate Castro | github.com/rmunate */
const ktj_render = {

    module: function(property_module) {

        // Importar el módulo dinámicamente
        let module = eval(`ktj_modules.${property_module}`);

        // Validar que el módulo tenga la propiedad 'template'
        if (typeof module.template !== 'string') {
            Alert.error('Invalid module object: missing or invalid "template" property.');
            return;
        }

        // Guardar la ruta del módulo en sessionStorage
        sessionStorage.setItem('current_module', property_module);

        // Obtener Tamplate
        const template = document.getElementById(module.template);

        const content = template.content.cloneNode(true);
        document.getElementById('kt_app_root').innerHTML = '';
        document.getElementById('kt_app_root').appendChild(content);

        // Ejecutar la función onLoad si está definida y es una función
        if (typeof module.onLoad === 'function') {
            module.onLoad();
        }

        // Ejecutar los métodos si están definidos y son funciones
        if (typeof module.methods === 'function') {
            module.methods();
        }

        // Cargar el menu en todo lado menos en el Auth.
        if (module.template != 'auth'){
            document.getElementById('kt_app_header').style.display = 'block'
        }

        // Crear el evento personalizado y despacharlo
        const renderEvent = new CustomEvent('renderModule');
        window.dispatchEvent(renderEvent);

    },

    // Método para cargar el módulo desde sessionStorage
    fromSession: function() {
        try {
            // Obtener el módulo guardado en sessionStorage
            const savedModule = sessionStorage.getItem('current_module');
            if (savedModule) {
                // Cargar el módulo
                this.module(savedModule);
                return true;
            }
            return false;
        } catch (error) {
            Alert.error('Error parsing or loading the saved module from sessionStorage: ' + error.message);
            return false;
        }
    }
};

// Ruteador de la aplicacion.
class ktj_router {

    // Mantener elementos de los modulos
    __elements = new Set();

    // Inicializar el ruteador
    constructor(array_onpress) {

        window.addEventListener('renderModule', () => {
            setTimeout(() => {
                array_onpress.forEach(element => {
                    if (!this.__elements.has(element.elementId)) {
                        this.mount(element.elementId, element.module);
                    }
                });
            }, 100);
        });

        const fromSession = ktj_render.fromSession();
        if (!fromSession) {
            array_onpress.forEach(element => {
                if (element.hasOwnProperty('default') && element.default === true && !this.__started) {
                    ktj_render.module(element.module);
                }
            });
        }

    }

    // Cargar el modulo dinamicamente.
    mount(id, module) {

        const element = document.getElementById(id);

        if (element) {
            if (!this.__elements.has(id)) {
                this.__elements.add(id);
                element.addEventListener('click', (e) => {

                    // Detener Evento por defecto.
                    e.preventDefault();

                    // Renderizar modulo
                    ktj_render.module(module);

                });
            }
        }

    }
}

function initEventListener() {

    // Imprimir valor de ocupacion de la memoria.
    getLocalStorageUsage();

    // Finalizar la sesion.
    document.getElementById('logout_app').addEventListener('click', function(e){
        e.preventDefault()
        sessionStorage.clear()
        location.reload()
    })

    // Reiniciar Aplicacion.
    document.getElementById('restart_app').addEventListener('click', function(e){
        e.preventDefault()
        localStorage.clear()
        sessionStorage.clear()
        location.reload()
    })

    // Colapsar el menu
    document.getElementById('parent_menu_app').addEventListener('click', function(){
        document.getElementById('kt_app_header_menu_toggle').click()
    })

    // Activar el menu correcto.
    const items = document.getElementsByClassName('menu-link')
    items.forEach(element => {
        element.addEventListener('click', function(){

            let other_items = document.getElementsByClassName('menu-link')
            other_items.forEach(element => {
                element.classList.remove('active')
            });

            this.classList.add('active')
        })
    });

    // Actualizar cada 5 segundos el estado de la memoria.
    setInterval(() => getLocalStorageUsage(), 5000);
}

// Clase para manejar las alertas de la aplicacion.
class Alert {

    // Configuración global de Toastr
    static toastrOptions = {
        "timeOut": "1000",
        "progressBar": true,
        "newestOnTop": true
    };

    static success(message, title) {
        toastr.remove();
        toastr.options = this.toastrOptions;
        toastr.success(message, title);
    }

    static error(message, title) {
        toastr.remove();
        toastr.options = this.toastrOptions;
        toastr.error(message, title);
    }
}

// Funcion para llevar un control del consumo del Storage Local.
function getLocalStorageUsage() {
    const totalCapacity = 5 * 1024 * 1024;
    let totalUsed = 0;

    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            let keySize = key.length * 2;
            let valueSize = localStorage.getItem(key).length * 2;
            totalUsed += keySize + valueSize;
        }
    }

    for (let key in sessionStorage) {
        if (sessionStorage.hasOwnProperty(key)) {
            let keySize = key.length * 2;
            let valueSize = sessionStorage.getItem(key).length * 2;
            totalUsed += keySize + valueSize;
        }
    }

    let sizeInKB = (totalUsed / 1024).toFixed(2);
    let percentageUsed = ((totalUsed / totalCapacity) * 100).toFixed(2);

    const domElement = document.getElementById('state_local_storage')

    if (percentageUsed < 70){
        domElement.classList = 'text-primary'
    } else if (percentageUsed >= 70 && percentageUsed <= 90){
        domElement.classList = 'text-warning'
    } else {
        domElement.classList = 'text-danger'
    }

    domElement.textContent = `${sizeInKB} KB / 5000 KB (${percentageUsed}%)`;
}