require('dotenv').config();

const PAYPAL_API = process.env.PAYPAL_MODE === 'live' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com';

/**
 * Obtiene el Token de Acceso de PayPal usando OAuth2
 */
async function getAccessToken() {
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: 'POST',
        body: 'grant_type=client_credentials',
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    const data = await response.json();
    if (data.error) {
        console.error('❌ Error de Autenticación PayPal:', data);
        process.exit(1);
    }
    return data.access_token;
}

/**
 * Lista todos los webhooks registrados
 */
async function listWebhooks() {
    const token = await getAccessToken();
    const response = await fetch(`${PAYPAL_API}/v1/notifications/webhooks`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    console.log('\n--- LISTADO DE WEBHOOKS ---');
    console.log(JSON.stringify(data, null, 2));
    return data;
}

/**
 * Crea un nuevo webhook
 * @param {string} url - URL del endpoint (debe ser HTTPS)
 */
async function createWebhook(url) {
    const token = await getAccessToken();
    const response = await fetch(`${PAYPAL_API}/v1/notifications/webhooks`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            url: url,
            event_types: [
                { name: 'PAYMENT.CAPTURE.COMPLETED' },
                { name: 'BILLING.SUBSCRIPTION.ACTIVATED' }
            ]
        })
    });
    const data = await response.json();
    console.log('\n--- WEBHOOK CREADO ---');
    console.log(JSON.stringify(data, null, 2));
    return data;
}

/**
 * Elimina un webhook por ID
 * @param {string} id - ID del webhook
 */
async function deleteWebhook(id) {
    const token = await getAccessToken();
    const response = await fetch(`${PAYPAL_API}/v1/notifications/webhooks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    });
    if (response.status === 204) {
        console.log(`\n✅ Webhook ${id} eliminado correctamente.`);
    } else {
        const data = await response.json();
        console.log('\n❌ Error al eliminar:', data);
    }
}

// Lógica de línea de comandos
const cmd = process.argv[2];
const arg = process.argv[3];

if (cmd === 'list') listWebhooks();
else if (cmd === 'create' && arg) createWebhook(arg);
else if (cmd === 'delete' && arg) deleteWebhook(arg);
else {
    console.log('Uso: node paypal_manager.js [list|create|delete] [url|id]');
    console.log('Ejemplo: node paypal_manager.js create https://mi-servidor.com/api/paypal-webhook');
}
