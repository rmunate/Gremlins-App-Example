/*! KTJ v0.1 | (c) Raul Mauricio Uñate Castro | github.com/rmunate */

document.addEventListener("DOMContentLoaded", function() {

    // Iniciar la escucha de los eventos globales.
    initEventListener()

    // Manejar El Ruteador
    new ktj_router([
        {
            default: true,
            elementId: 'menu_item_singout',
            module: 'auth'
        },
        {
            elementId: 'menu_item_home',
            module: 'home'
        },
        {
            elementId: 'menu_item_products',
            module: 'products'
        },
        {
            elementId: 'menu_item_providers',
            module: 'providers'
        },
        {
            elementId: 'menu_item_customers',
            module: 'customers'
        },
        {
            elementId: 'menu_item_orders',
            module: 'orders'
        },
        {
            elementId: 'menu_item_tracking',
            module: 'tracking'
        }
    ])

});