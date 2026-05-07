const https = require('https');

const data = JSON.stringify({
    event_type: 'PAYMENT.CAPTURE.COMPLETED',
    resource: {
        id: 'SIMULADO-' + Date.now(),
        payer: {
            name: {
                given_name: 'Victor',
                surname: 'Prueba'
            },
            email_address: 'vicma.galo98@gmail.com'
        }
    }
});

const options = {
    hostname: 'tienda-lumatek.onrender.com',
    port: 445,
    path: '/api/nueva-venta',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request('https://tienda-lumatek.onrender.com/api/nueva-venta', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
}, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => responseBody += chunk);
    res.on('end', () => {
        console.log('--- RESULTADO DE LA PRUEBA ---');
        console.log('Estado:', res.statusCode);
        console.log('Respuesta:', responseBody);
        if (res.statusCode === 200) {
            console.log('\n✅ ¡Simulación enviada con éxito!');
            console.log('Revisa tu correo vicma.galo98@gmail.com (incluyendo SPAM).');
        } else {
            console.log('\n❌ Hubo un error en la simulación.');
        }
    });
});

req.on('error', (error) => {
    console.error('Error en la petición:', error);
});

req.write(data);
req.end();
