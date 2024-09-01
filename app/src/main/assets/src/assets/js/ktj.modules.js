/*! KTJ v0.1 | (c) Raul Mauricio Uñate Castro | github.com/rmunate */

const ktj_modules = {

    // Modulo de Autenticacion.
    auth: {
        template: 'auth',
        onLoad: function(){

            // Garantizar los inputs vacios.
            document.getElementById('username').value = ''
            document.getElementById('password').value = ''

        },
        methods: function(){

            // Metodo para iniciar sesion
            document.getElementById('login_form').addEventListener('submit', function(e){
                e.preventDefault()
                let username = document.getElementById('username').value.trim().toLowerCase()
                let password = document.getElementById('password').value.trim().toLowerCase()
                if (username == 'admin' && password == 'admin'){
                    ktj_render.module('home')
                } else {
                    Alert.error('Credenciales Invalidas.', 'Error!');
                }
            })

        }
    },

    // Modulo de inicio.
    home: {
        template: 'home'
    },

    // Modulo de productos.
    products : {
        template: 'products',
        onLoad: function(){

            // Recargar Modulo
            ktj_modules.products.renders()
            ktj_modules.products.setProviders()

        },
        setProviders: function(){

            // Asignar proveedores a las opciones del select.
            let providers = JSON.parse(localStorage.getItem('proveedores')) || [];

            // Opciones de Creacion.
            options = `
            <option value="" selected hidden disabled>Seleccione...</option>
            <option value="1">Gremlins</option>
            `
            providers.forEach(element => {
                options += `<option value="${element.id}">${element.nombre}</option>`
            })
            document.getElementById('proveedor').innerHTML = options
            document.getElementById('e_proveedor').innerHTML = options

        },
        renders: function(){

            //Renderizar Lista
            let html = ''

            let data = JSON.parse(localStorage.getItem('productos')) || [];
            if (data.length > 0){
                data.forEach(element => {

                    // Convertir a string y formatear con separadores de miles
                    let formatoMoneda = Math.round(element.valor).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

                    let current_provider = 'Gremlins'
                    if (Number(element.proveedor) != 1){
                        let providers = JSON.parse(localStorage.getItem('proveedores')) || [];
                        let provider = providers.find(row => row.id == element.proveedor)
                        current_provider = provider.nombre
                    }

                    html += `
                    <div class="d-flex flex-stack card-items-app mb-2">
                        <div class="d-flex flex-column">
                            <strong class="text-uppercase fs-3 text-color-app">${element.nombre}</strong>
                            <hr>
                            <div class="row col-12">
                                <span class="fs-6 col-6"><strong class="text-dark">SKU: </strong>${element.sku}</span>
                                <span class="fs-6 col-6"><strong class="text-dark">EAN: </strong>${element.ean}</span>
                            </div>
                            <div class="row col-12">
                                <span class="fs-6"><strong class="text-dark">Valor: </strong>$${formatoMoneda}</span>
                                <span class="fs-6"><strong class="text-dark">Proveedor: </strong>${current_provider}</span>
                            </div>
                        </div>
                        <div class="d-flex justify-content-end align-items-center">
                            <button data-sku="${element.sku}" type="button" class="btn btn-icon btn-active-light-primary w-30px h-30px ms-auto me-5 btn-edit" data-bs-toggle="modal" data-bs-target="#modal_edit_products">
                                <i class="ki-outline ki-pencil fs-3"></i>
                            </button>
                            <button data-sku="${element.sku}" type="button" class="btn btn-icon btn-active-light-primary w-30px h-30px ms-auto btn-deleted" id="kt_users_delete_two_step">
                                <i class="ki-outline ki-trash fs-3"></i>
                            </button>
                        </div>
                    </div>
                    `
                });
            } else {
                html = `
                <div class="col-md-12 d-flex justify-content-center pt-20" style="height: 200px">
                    <div class="text-center">
                        <span class="text-muted">Aun no existen registros aquí.</span>
                    </div>
                </div>
                `
            }
            document.getElementById('body_products').innerHTML = html

            buttons = document.getElementsByClassName('btn-deleted')
            buttons.forEach(button_element => {
                button_element.addEventListener('click', function(){

                    // Accion de la modal
                    const modal = document.getElementById('modal_deleted_products');
                    modal.style.display = 'block';

                    // Obtener el SKU
                    let current_sku = this.dataset.sku

                    // Funcion de eliminacion
                    const handleConfirm = function(e) {
                        e.preventDefault()
                        modal.style.display = 'none';

                        // Eliminar el evento.
                        document.getElementById('confirm-yes').removeEventListener('click', handleDeleted)
                    }

                    // Funcion para eliminar.
                    const handleDeleted = function(e) {
                        e.preventDefault()

                        let data = JSON.parse(localStorage.getItem('productos')) || [];

                        data = data.filter(function(element){
                            return Number(element.sku) !== Number(current_sku)
                        })

                        //Sobre Escribir
                        localStorage.setItem('productos', JSON.stringify(data))

                        // Recargar Modulo
                        ktj_modules.products.renders()

                        // Borrado Exitoso
                        Alert.success('Elemento Eliminado Exitosamente', '¡Proceso Exitoso!');

                        modal.style.display = 'none';

                        // Eliminar el evento.
                        document.getElementById('confirm-no').removeEventListener('click', handleConfirm)
                    }

                    // Eventos.
                    document.getElementById('confirm-no').addEventListener('click', handleConfirm)
                    document.getElementById('confirm-yes').addEventListener('click', handleDeleted)

                })
            });

            buttons = document.getElementsByClassName('btn-edit')
            buttons.forEach(button_element => {
                button_element.addEventListener('click', function(){

                    // SKU del elemento a editar.
                    let current_sku = this.dataset.sku
                    const existData = data.find(row => row.sku == current_sku);

                    // Asignar proveedores
                    ktj_modules.products.setProviders()

                    // Agregar valores a la modal.
                    document.getElementById('e_sku').value = existData.sku
                    document.getElementById('e_nombre').value = existData.nombre
                    document.getElementById('e_ean').value = existData.ean
                    document.getElementById('e_valor').value = existData.valor
                    document.getElementById('e_proveedor').value = existData.proveedor
                })
            });

        },
        methods: function(){

            document.getElementById('create_products_form').addEventListener('submit', function(e) {

                e.preventDefault();

                // Crear una instancia de FormData pasando el formulario
                const formData = new FormData(this);

                // Convertir FormData en un objeto para facilitar el acceso a los datos
                const datos = {};
                formData.forEach((value, key) => {
                    datos[key] = value;
                });

                // Obtener datos actuales de la local storage y convertirlos en un array
                let data = JSON.parse(localStorage.getItem('productos')) || [];

                // Ver si existe el elemento
                const existData = data.find(row => row.sku === datos.sku);

                if (existData) {
                    Alert.error('El SKU que intenta crear ya se encuentra registrado', '¡SKU Ya Existe!');
                } else if (Number(datos.valor) <= 0){
                    Alert.error('El valor del producto no puede ser cero', '¡Valor No Permitido!');
                } else if (Number(datos.ean) <= 0){
                    Alert.error('El valor del EAN no puede ser cero', '¡Valor No Permitido!');
                } else if (Number(datos.sku) <= 0){
                    Alert.error('El valor del SKU no puede ser cero', '¡Valor No Permitido!');
                } else {

                    // Agregar los datos
                    data.push(datos);

                    // Crear o actualizar el registro en el local storage
                    localStorage.setItem('productos', JSON.stringify(data));
                    Alert.success('Producto agregado correctamente', '¡Éxito!');

                    //Limpiart Formulario
                    const form = document.getElementById('create_products_form');
                    form.querySelectorAll('input, select').forEach(element => {
                        element.value = '';
                    });

                    //Cerrar Modal
                    document.getElementById('close_modal_create_products').click();

                    // Recargar Modulo
                    ktj_modules.products.renders()

                }
            });

            document.getElementById('edit_products_form').addEventListener('submit', function(e) {

                e.preventDefault();

                // Crear una instancia de FormData pasando el formulario
                const formData = new FormData(this);

                // Convertir FormData en un objeto para facilitar el acceso a los datos
                const datos = {};
                formData.forEach((value, key) => {
                    datos[key.replace('e_','')] = value;
                });

                // Obtener datos actuales de la local storage y convertirlos en un array
                let data = JSON.parse(localStorage.getItem('productos')) || [];

                // Ver si existe el elemento fuera del elemento actual en edicion.
                const newData = data.filter(row => Number(row.sku) !== Number(datos.sku));
                const existData = newData.find(row => Number(row.sku) === Number(datos.sku));

                if (existData) {
                    Alert.error('El SKU que intenta crear ya se encuentra registrado', '¡SKU Ya Existe!');
                } else if (Number(datos.valor) <= 0){
                    Alert.error('El valor del producto no puede ser cero', '¡Valor No Permitido!');
                } else if (Number(datos.ean) <= 0){
                    Alert.error('El valor del EAN no puede ser cero', '¡Valor No Permitido!');
                } else if (Number(datos.sku) <= 0){
                    Alert.error('El valor del SKU no puede ser cero', '¡Valor No Permitido!');
                } else {

                    // Agregar los datos
                    newData.push(datos);

                    // Crear o actualizar el registro en el local storage
                    localStorage.setItem('productos', JSON.stringify(newData));
                    Alert.success('Producto editado correctamente', '¡Éxito!');

                    //Cerrar Modal
                    document.getElementById('close_modal_edit_products').click();

                    // Recargar Modulo
                    ktj_modules.products.renders()

                }
            });
        }
    },

    // Modulo de productos.
    providers : {
        template: 'providers',
        onLoad: function(){

            // Recargar Modulo
            ktj_modules.providers.renders()

        },
        renders: function(){

            //Renderizar Lista
            let html = ''

            let data = JSON.parse(localStorage.getItem('proveedores')) || [];
            if (data.length > 0){
                data.forEach(element => {

                    html += `
                    <div class="d-flex flex-stack card-items-app mb-2">
                        <div class="d-flex flex-column">
                            <strong class="text-uppercase fs-3 text-color-app">${element.nombre}</strong>
                            <hr>
                            <div class="row col-12">
                                <span class="fs-6 col-6"><strong class="text-dark">Id: </strong>${element.id}</span>
                                <span class="fs-6 col-6"><strong class="text-dark">Telefono: </strong>${element.telefono}</span>
                            </div>
                            <div class="row col-12">
                                <span class="fs-6"><strong class="text-dark">Dirección: </strong>${element.direccion}</span>
                                <span class="fs-6"><strong class="text-dark">Pais: </strong>${element.pais}</span>
                            </div>
                        </div>
                        <div class="d-flex justify-content-end align-items-center">
                            <button data-id="${element.id}" type="button" class="btn btn-icon btn-active-light-primary w-30px h-30px ms-auto me-5 btn-edit" data-bs-toggle="modal" data-bs-target="#modal_edit_providers">
                                <i class="ki-outline ki-pencil fs-3"></i>
                            </button>
                            <button data-id="${element.id}" type="button" class="btn btn-icon btn-active-light-primary w-30px h-30px ms-auto btn-deleted" id="kt_users_delete_two_step">
                                <i class="ki-outline ki-trash fs-3"></i>
                            </button>
                        </div>
                    </div>
                    `
                });
            } else {
                html = `
                <div class="col-md-12 d-flex justify-content-center pt-20" style="height: 200px">
                    <div class="text-center">
                        <span class="text-muted">Aun no existen registros aquí.</span>
                    </div>
                </div>
                `
            }
            document.getElementById('body_providers').innerHTML = html

            buttons = document.getElementsByClassName('btn-deleted')
            buttons.forEach(button_element => {
                button_element.addEventListener('click', function(){

                    // Accion de la modal
                    const modal = document.getElementById('modal_deleted_providers');
                    modal.style.display = 'block';

                    // Obtener el SKU
                    let current_id = this.dataset.id

                    // Funcion de eliminacion
                    const handleConfirm = function(e) {
                        e.preventDefault()
                        modal.style.display = 'none';

                        // Eliminar el evento.
                        document.getElementById('confirm-yes').removeEventListener('click', handleDeleted)
                    }

                    // Funcion para eliminar.
                    const handleDeleted = function(e) {
                        e.preventDefault()

                        let data = JSON.parse(localStorage.getItem('proveedores')) || [];
                        let productos = JSON.parse(localStorage.getItem('productos')) || [];

                        const findPivot = productos.find(row => row.proveedor == current_id)
                        if (findPivot){

                            Alert.error(`El proveedor esta asociado al producto: ${findPivot.nombre.toUpperCase()}.`,'Imposible Eliminar')

                        } else {

                            data = data.filter(function(element){
                                return Number(element.id) !== Number(current_id)
                            })

                            //Sobre Escribir
                            localStorage.setItem('proveedores', JSON.stringify(data))

                            // Recargar Modulo
                            ktj_modules.providers.renders()

                            // Borrado Exitoso
                            Alert.success('Elemento Eliminado Exitosamente', '¡Proceso Exitoso!');

                            modal.style.display = 'none';

                            // Eliminar el evento.
                            document.getElementById('confirm-no').removeEventListener('click', handleConfirm)
                        }

                    }

                    // Eventos.
                    document.getElementById('confirm-no').addEventListener('click', handleConfirm)
                    document.getElementById('confirm-yes').addEventListener('click', handleDeleted)

                })
            });

            buttons = document.getElementsByClassName('btn-edit')
            buttons.forEach(button_element => {
                button_element.addEventListener('click', function(){

                    // Id del elemento a editar.
                    let current_id = this.dataset.id

                    // Consultar id del elemento.
                    const currentData = data.find(row => row.id == current_id);

                    // Agregar valores a la modal.
                    document.getElementById('e_id').value = currentData.id
                    document.getElementById('e_nombre').value = currentData.nombre
                    document.getElementById('e_telefono').value = currentData.telefono
                    document.getElementById('e_direccion').value = currentData.direccion
                    document.getElementById('e_pais').value = currentData.pais

                })
            });

        },
        methods: function(){

            document.getElementById('create_providers_form').addEventListener('submit', function(e) {

                e.preventDefault();

                // Crear una instancia de FormData pasando el formulario
                const formData = new FormData(this);

                // Convertir FormData en un objeto para facilitar el acceso a los datos
                const datos = {};
                formData.forEach((value, key) => {
                    datos[key] = value;
                });

                // Obtener datos actuales de la local storage y convertirlos en un array
                let data = JSON.parse(localStorage.getItem('proveedores')) || [];

                // Ver si existe el elemento
                const existData = data.find(row => row.id === datos.id);

                if (existData) {
                    Alert.error('El Id de proveedor que intenta crear ya se encuentra registrado', 'Id Ya Existe!');
                } else {

                    // Agregar los datos
                    data.push(datos);

                    // Crear o actualizar el registro en el local storage
                    localStorage.setItem('proveedores', JSON.stringify(data));
                    Alert.success('Proveedor agregado correctamente', '¡Éxito!');

                    //Limpiart Formulario
                    const form = document.getElementById('create_providers_form');
                    form.querySelectorAll('input').forEach(element => {
                        element.value = '';
                    });

                    //Cerrar Modal
                    document.getElementById('close_modal_create_providers').click();

                    // Recargar Modulo
                    ktj_modules.providers.renders()

                }
            });

            document.getElementById('edit_providers_form').addEventListener('submit', function(e) {

                e.preventDefault();

                // Crear una instancia de FormData pasando el formulario
                const formData = new FormData(this);

                // Convertir FormData en un objeto para facilitar el acceso a los datos
                const datos = {};
                formData.forEach((value, key) => {
                    datos[key.replace('e_','')] = value;
                });

                // Obtener datos actuales de la local storage y convertirlos en un array
                let data = JSON.parse(localStorage.getItem('proveedores')) || [];

                // Ver si existe el elemento fuera del elemento actual en edicion.
                const newData = data.filter(row => Number(row.id) !== Number(datos.id));
                const existData = newData.find(row => Number(row.id) === Number(datos.id));

                if (existData) {
                    Alert.error('El Id del proveedor que intenta crear ya se encuentra registrado', '¡Id Ya Existe!');
                } else {

                    // Agregar los datos
                    newData.push(datos);

                    // Crear o actualizar el registro en el local storage
                    localStorage.setItem('proveedores', JSON.stringify(newData));
                    Alert.success('Proveedor editado correctamente', '¡Éxito!');

                    //Cerrar Modal
                    document.getElementById('close_modal_edit_providers').click();

                    // Recargar Modulo
                    ktj_modules.providers.renders()

                }
            });
        }
    },

    // Modulo de clientes.
    customers : {
        template: 'customers',
        onLoad: function(){

            // Recargar Modulo
            ktj_modules.customers.renders()

        },
        renders: function(){

            //Renderizar Lista
            let html = ''

            let data = JSON.parse(localStorage.getItem('clientes')) || [];
            if (data.length > 0){
                data.forEach(element => {

                    html += `
                    <div class="d-flex flex-stack card-items-app mb-2">
                        <div class="d-flex flex-column">
                            <strong class="text-uppercase fs-3 text-color-app">${element.nombre}</strong>
                            <hr>
                            <div class="row col-12">
                                <span class="fs-6 col-6"><strong class="text-dark">Id: </strong>${element.id}</span>
                                <span class="fs-6 col-6"><strong class="text-dark">Telefono: </strong>${element.telefono}</span>
                            </div>
                            <div class="row col-12">
                                <span class="fs-6"><strong class="text-dark">Dirección: </strong>${element.direccion}</span>
                                <span class="fs-6"><strong class="text-dark">Pais: </strong>${element.pais}</span>
                            </div>
                        </div>
                        <div class="d-flex justify-content-end align-items-center">
                            <button data-id="${element.id}" type="button" class="btn btn-icon btn-active-light-primary w-30px h-30px ms-auto me-5 btn-edit" data-bs-toggle="modal" data-bs-target="#modal_edit_customers">
                                <i class="ki-outline ki-pencil fs-3"></i>
                            </button>
                            <button data-id="${element.id}" type="button" class="btn btn-icon btn-active-light-primary w-30px h-30px ms-auto btn-deleted" id="kt_users_delete_two_step">
                                <i class="ki-outline ki-trash fs-3"></i>
                            </button>
                        </div>
                    </div>
                    `
                });
            } else {
                html = `
                <div class="col-md-12 d-flex justify-content-center pt-20" style="height: 200px">
                    <div class="text-center">
                        <span class="text-muted">Aun no existen registros aquí.</span>
                    </div>
                </div>
                `
            }
            document.getElementById('body_customers').innerHTML = html

            buttons = document.getElementsByClassName('btn-deleted')
            buttons.forEach(button_element => {
                button_element.addEventListener('click', function(){

                    // Accion de la modal
                    const modal = document.getElementById('modal_deleted_customers');
                    modal.style.display = 'block';

                    // Obtener el SKU
                    let current_id = this.dataset.id

                    // Funcion de eliminacion
                    const handleConfirm = function(e) {
                        e.preventDefault()
                        modal.style.display = 'none';

                        // Eliminar el evento.
                        document.getElementById('confirm-yes').removeEventListener('click', handleDeleted)
                    }

                    // Funcion para eliminar.
                    const handleDeleted = function(e) {
                        e.preventDefault()

                        let data = JSON.parse(localStorage.getItem('clientes')) || [];
                        // let productos = JSON.parse(localStorage.getItem('productos')) || [];

                        // const findPivot = productos.find(row => row.proveedor == current_id)
                        // if (findPivot){

                        //     Alert.error(`El proveedor esta asociado al producto: ${findPivot.nombre.toUpperCase()}.`,'Imposible Eliminar')

                        // } else {

                            data = data.filter(function(element){
                                return Number(element.id) !== Number(current_id)
                            })

                            //Sobre Escribir
                            localStorage.setItem('clientes', JSON.stringify(data))

                            // Recargar Modulo
                            ktj_modules.customers.renders()

                            // Borrado Exitoso
                            Alert.success('Cliente Eliminado Exitosamente', '¡Proceso Exitoso!');

                            modal.style.display = 'none';

                            // Eliminar el evento.
                            document.getElementById('confirm-no').removeEventListener('click', handleConfirm)
                        // }

                    }

                    // Eventos.
                    document.getElementById('confirm-no').addEventListener('click', handleConfirm)
                    document.getElementById('confirm-yes').addEventListener('click', handleDeleted)

                })
            });

            buttons = document.getElementsByClassName('btn-edit')
            buttons.forEach(button_element => {
                button_element.addEventListener('click', function(){

                    // Id del elemento a editar.
                    let current_id = this.dataset.id

                    // Consultar id del elemento.
                    const currentData = data.find(row => row.id == current_id);

                    // Agregar valores a la modal.
                    document.getElementById('e_id').value = currentData.id
                    document.getElementById('e_nombre').value = currentData.nombre
                    document.getElementById('e_telefono').value = currentData.telefono
                    document.getElementById('e_direccion').value = currentData.direccion
                    document.getElementById('e_pais').value = currentData.pais

                })
            });

        },
        methods: function(){

            document.getElementById('create_customers_form').addEventListener('submit', function(e) {

                e.preventDefault();

                // Crear una instancia de FormData pasando el formulario
                const formData = new FormData(this);

                // Convertir FormData en un objeto para facilitar el acceso a los datos
                const datos = {};
                formData.forEach((value, key) => {
                    datos[key] = value;
                });

                // Obtener datos actuales de la local storage y convertirlos en un array
                let data = JSON.parse(localStorage.getItem('clientes')) || [];

                // Ver si existe el elemento
                const existData = data.find(row => row.id === datos.id);

                if (existData) {
                    Alert.error('El Id de cliente que intenta crear ya se encuentra registrado', 'Id Ya Existe!');
                } else {

                    // Agregar los datos
                    data.push(datos);

                    // Crear o actualizar el registro en el local storage
                    localStorage.setItem('clientes', JSON.stringify(data));
                    Alert.success('Cliente agregado correctamente', '¡Éxito!');

                    //Limpiart Formulario
                    const form = document.getElementById('create_customers_form');
                    form.querySelectorAll('input').forEach(element => {
                        element.value = '';
                    });

                    //Cerrar Modal
                    document.getElementById('close_modal_create_customers').click();

                    // Recargar Modulo
                    ktj_modules.customers.renders()

                }
            });

            document.getElementById('edit_customers_form').addEventListener('submit', function(e) {

                e.preventDefault();

                // Crear una instancia de FormData pasando el formulario
                const formData = new FormData(this);

                // Convertir FormData en un objeto para facilitar el acceso a los datos
                const datos = {};
                formData.forEach((value, key) => {
                    datos[key.replace('e_','')] = value;
                });

                // Obtener datos actuales de la local storage y convertirlos en un array
                let data = JSON.parse(localStorage.getItem('clientes')) || [];

                // Ver si existe el elemento fuera del elemento actual en edicion.
                const newData = data.filter(row => Number(row.id) !== Number(datos.id));
                const existData = newData.find(row => Number(row.id) === Number(datos.id));

                if (existData) {
                    Alert.error('El Id del cliente que intenta crear ya se encuentra registrado', '¡Id Ya Existe!');
                } else {

                    // Agregar los datos
                    newData.push(datos);

                    // Crear o actualizar el registro en el local storage
                    localStorage.setItem('clientes', JSON.stringify(newData));
                    Alert.success('Cliente editado correctamente', '¡Éxito!');

                    //Cerrar Modal
                    document.getElementById('close_modal_edit_customers').click();

                    // Recargar Modulo
                    ktj_modules.customers.renders()

                }
            });
        }
    },

    // Modulo de Pedidos
    orders : {
        template: 'orders',
        onLoad: function(){

            // Recargar Modulo
            ktj_modules.orders.renders()
            ktj_modules.orders.setCustomer()
            ktj_modules.orders.setProducts()

        },
        setCustomer: function(){

            // Asignar proveedores a las opciones del select.
            let providers = JSON.parse(localStorage.getItem('clientes')) || [];

            // Opciones de Creacion.
            options = `
            <option value="" selected hidden disabled>Seleccione...</option>
            `
            providers.forEach(element => {
                options += `<option value="${element.id}">${element.nombre}</option>`
            })
            document.getElementById('cliente').innerHTML = options
            document.getElementById('e_cliente').innerHTML = options

        },
        setProducts: function(){

            // Asignar proveedores a las opciones del select.
            let providers = JSON.parse(localStorage.getItem('productos')) || [];

            // Opciones de Creacion.
            options = `
            <option value="" selected hidden disabled>Seleccione...</option>
            `
            providers.forEach(element => {
                options += `<option value="${element.sku}">${element.nombre}</option>`
            })
            document.getElementById('producto').innerHTML = options
            document.getElementById('e_producto').innerHTML = options

        },
        renders: function(){

            //Renderizar Lista
            let html = ''

            let data = JSON.parse(localStorage.getItem('pedidos')) || [];
            if (data.length > 0){
                data.forEach(element => {

                    let clientes = JSON.parse(localStorage.getItem('clientes')) || []
                    let productos = JSON.parse(localStorage.getItem('productos')) || []

                    let cliente = clientes.find(row => row.id == element.cliente)
                    let producto = productos.find(row => row.sku == element.producto)
                    let cantidad = element.cantidad + ' UN'
                    let observaciones = element.observaciones.toUpperCase().trim()

                    html += `
                    <div class="d-flex flex-stack card-items-app mb-2">
                        <div class="d-flex flex-column">
                            <strong class="text-uppercase fs-3 text-color-app">${element.id}</strong>
                            <hr>
                            <div class="row col-12">
                                <span class="fs-6 col-6"><strong class="text-dark">Cliente: </strong>${cliente.nombre}</span>
                                <span class="fs-6 col-6"><strong class="text-dark">Producto: </strong>${producto.nombre}</span>
                            </div>
                            <div class="row col-12">
                                <span class="fs-6"><strong class="text-dark">Cantidad: </strong>${cantidad}</span>
                                <span class="fs-6"><strong class="text-dark">Observaciones: </strong>${observaciones}</span>
                            </div>
                        </div>
                    `

                    if (element.estado == 'pendiente'){ // (PENDIENTE / EN PROCESO / ENTREGADO )
                         html += `
                        <div class="d-flex justify-content-end align-items-center">
                            <button data-id="${element.id}" type="button" class="btn btn-icon btn-active-light-primary w-30px h-30px ms-auto me-5 btn-edit" data-bs-toggle="modal" data-bs-target="#modal_edit_customers">
                                <i class="ki-outline ki-pencil fs-3"></i>
                            </button>
                            <button data-id="${element.id}" type="button" class="btn btn-icon btn-active-light-primary w-30px h-30px ms-auto btn-deleted" id="kt_users_delete_two_step">
                                <i class="ki-outline ki-trash fs-3"></i>
                            </button>
                        </div>
                        `
                    }

                    html += `
                    </div>
                    `
                });
            } else {
                html = `
                <div class="col-md-12 d-flex justify-content-center pt-20" style="height: 200px">
                    <div class="text-center">
                        <span class="text-muted">Aun no existen registros aquí.</span>
                    </div>
                </div>
                `
            }
            document.getElementById('body_orders').innerHTML = html

            buttons = document.getElementsByClassName('btn-deleted')
            buttons.forEach(button_element => {
                button_element.addEventListener('click', function(){

                    // Accion de la modal
                    const modal = document.getElementById('modal_deleted_order');
                    modal.style.display = 'block';

                    // Obtener el id del pedido
                    let current_id = this.dataset.id

                    // Funcion de eliminacion
                    const handleConfirm = function(e) {
                        e.preventDefault()
                        modal.style.display = 'none';

                        // Eliminar el evento.
                        document.getElementById('confirm-yes').removeEventListener('click', handleDeleted)
                    }

                    // Funcion para eliminar.
                    const handleDeleted = function(e) {
                        e.preventDefault()

                        // Valores de pedidos en Storage
                        let data = JSON.parse(localStorage.getItem('pedidos')) || [];
                        data = data.filter(function(element){
                            return element.id !== current_id
                        })

                        //Sobre Escribir
                        localStorage.setItem('pedidos', JSON.stringify(data))

                        // Recargar Modulo
                        ktj_modules.orders.renders()

                        // Borrado Exitoso
                        Alert.success('Pedido Eliminado Exitosamente', '¡Proceso Exitoso!');

                        modal.style.display = 'none';

                        // Eliminar el evento.
                        document.getElementById('confirm-no').removeEventListener('click', handleConfirm)
                    }

                    // Eventos.
                    document.getElementById('confirm-no').addEventListener('click', handleConfirm)
                    document.getElementById('confirm-yes').addEventListener('click', handleDeleted)

                })
            });

            buttons = document.getElementsByClassName('btn-edit')
            buttons.forEach(button_element => {
                button_element.addEventListener('click', function(){

                    // Id del elemento a editar.
                    let current_id = this.dataset.id

                    // Consultar id del elemento.
                    const currentData = data.find(row => row.id == current_id);

                    // Agregar valores a la modal.
                    document.getElementById('e_id').value = currentData.id
                    document.getElementById('e_cliente').value = currentData.cliente
                    document.getElementById('e_producto').value = currentData.producto
                    document.getElementById('e_cantidad').value = currentData.cantidad
                    document.getElementById('e_observaciones').value = currentData.observaciones

                })
            });

        },
        methods: function(){

            document.getElementById('create_order_form').addEventListener('submit', function(e) {

                e.preventDefault();

                // Crear una instancia de FormData pasando el formulario
                const formData = new FormData(this);

                // Convertir FormData en un objeto para facilitar el acceso a los datos
                const datos = {};
                formData.forEach((value, key) => {
                    datos[key] = value;
                });

                // Obtener datos actuales de la local storage y convertirlos en un array
                let data = JSON.parse(localStorage.getItem('pedidos')) || [];
                let secuencia = JSON.parse(localStorage.getItem('pedidos_seq')) || 1;

                // Continuar con el ID correspondiente.
                const current_id = 'ORD_' + String(secuencia).padStart(8, "0")
                datos['id'] = current_id;

                // Asignar Estado
                datos['estado'] = 'pendiente';

                // Actualizar Secuencia
                localStorage.setItem('pedidos_seq', Number(secuencia) + 1)

                // Agregar los datos
                data.push(datos);

                // Crear o actualizar el registro en el local storage
                localStorage.setItem('pedidos', JSON.stringify(data));
                Alert.success('Pedido agregado correctamente', '¡Éxito!');

                //Limpiart Formulario
                const form = document.getElementById('create_order_form');
                form.querySelectorAll('input, select').forEach(element => {
                    element.value = '';
                });

                //Cerrar Modal
                document.getElementById('close_modal_create_order').click();

                // Recargar Modulo
                ktj_modules.orders.renders()

            });

            document.getElementById('edit_order_form').addEventListener('submit', function(e) {

                e.preventDefault();

                // Crear una instancia de FormData pasando el formulario
                const formData = new FormData(this);

                // Convertir FormData en un objeto para facilitar el acceso a los datos
                const datos = {};
                formData.forEach((value, key) => {
                    datos[key.replace('e_','')] = value;
                });
                datos['estado'] = 'pendiente';


                // Obtener datos actuales de la local storage y convertirlos en un array
                let data = JSON.parse(localStorage.getItem('pedidos')) || [];

                // Ver si existe el elemento fuera del elemento actual en edicion.
                const newData = data.filter(row => row.id !== datos.id);

                // Agregar los datos
                newData.push(datos);

                // Crear o actualizar el registro en el local storage
                localStorage.setItem('pedidos', JSON.stringify(newData));
                Alert.success('Pedido editado correctamente', '¡Éxito!');

                //Cerrar Modal
                document.getElementById('close_modal_edit_order').click();

                // Recargar Modulo
                ktj_modules.orders.renders()

            });
        }
    },

    // Modulo de Pedidos
    tracking : {
        template: 'tracking',
        onLoad: function(){

            // Recargar Modulo
            ktj_modules.tracking.renders()

        },
        renders: function(){

            //Renderizar Lista
            let html = ''

            let data = JSON.parse(localStorage.getItem('pedidos')) || [];
            if (data.length > 0){
                data.forEach(element => {

                    let clientes = JSON.parse(localStorage.getItem('clientes')) || []
                    let productos = JSON.parse(localStorage.getItem('productos')) || []

                    let cliente = clientes.find(row => row.id == element.cliente)
                    let producto = productos.find(row => row.sku == element.producto)
                    let cantidad = element.cantidad + ' UN'
                    let observaciones = element.observaciones.toUpperCase().trim()
                    let estado = String(element.estado).toUpperCase()

                    const backgroundBadge = function(state){
                        if (state == 'pendiente'){
                            return 'success'
                        } else if (state == 'en proceso'){
                            return 'primary'
                        } else if (state == 'completo'){
                            return 'dark'
                        }
                    }

                    html += `
                    <div class="d-flex flex-stack card-items-app mb-2">
                        <div class="d-flex flex-column ${element.estado == 'completo' ? 'col-12' : ''}">
                            <strong class="text-uppercase fs-3 text-color-app">${element.id}</strong>
                            <span class="fs-6"><strong class="text-dark">Cliente: </strong>${cliente.nombre}</span>
                            <span class="fs-6"><strong class="text-dark">Producto: </strong>${producto.nombre}</span>
                            <span class="fs-6"><strong class="text-dark">Cantidad: </strong>${cantidad}</span>
                            <span class="fs-6"><strong class="text-dark">Observaciones: </strong>${observaciones}</span>
                            <hr>
                            <span class="badge badge-${backgroundBadge(element.estado)} fs-4">${estado}</span>
                        </div>
                    `

                    if (element.estado != 'completo'){
                         html += `
                        <div class="d-flex justify-content-end align-items-center">
                            <button data-id="${element.id}" type="button" class="btn btn-icon btn-active-light-primary w-30px h-30px ms-auto me-5 btn-edit" data-bs-toggle="modal" data-bs-target="#modal_edit_state">
                                <i class="ki-outline ki-courier-express text-primary" style="font-size: 30px"></i>
                            </button>
                        </div>
                        `
                    }

                    html += `
                    </div>
                    `
                });
            } else {
                html = `
                <div class="col-md-12 d-flex justify-content-center pt-20" style="height: 200px">
                    <div class="text-center">
                        <span class="text-muted">Aun no existen registros aquí.</span>
                    </div>
                </div>
                `
            }
            document.getElementById('body_tracking').innerHTML = html

            buttons = document.getElementsByClassName('btn-edit')
            buttons.forEach(button_element => {
                button_element.addEventListener('click', function(){

                    // Id del elemento a editar.
                    let current_id = this.dataset.id

                    // Consultar id del elemento.
                    const currentData = data.find(row => row.id == current_id);

                    // Agregar valores a la modal.
                    document.getElementById('id').value = currentData.id
                    document.getElementById('estado').value = currentData.estado

                })
            });

        },
        methods: function(){

            document.getElementById('edit_state_order_form').addEventListener('submit', function(e) {

                e.preventDefault();

                // Crear una instancia de FormData pasando el formulario
                const formData = new FormData(this);

                // Convertir FormData en un objeto para facilitar el acceso a los datos
                const datos = {};
                formData.forEach((value, key) => {
                    datos[key] = value;
                });

                // Obtener datos actuales de la local storage y convertirlos en un array
                let data = JSON.parse(localStorage.getItem('pedidos')) || [];

                // Ver si existe el elemento fuera del elemento actual en edicion.
                const currentData = data.find(row => row.id === datos.id);
                const otherData = data.filter(row => row.id !== datos.id);

                currentData["estado"] = datos.estado
                otherData.push(currentData)

                // Crear o actualizar el registro en el local storage
                localStorage.setItem('pedidos', JSON.stringify(otherData));
                Alert.success('Estado actualizado correctamente', '¡Éxito!');

                //Cerrar Modal
                document.getElementById('close_modal_edit_state').click();

                // Recargar Modulo
                ktj_modules.tracking.renders()

            });
        }
    },

}