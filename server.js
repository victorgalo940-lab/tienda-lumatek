require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const app = express();
app.use(express.json());

const port = process.env.PORT || 5000;

// Configuración de Supabase
const supabase = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Configuración de Resend (Email API)
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Plantilla de Email HTML Premium
 */
const getEmailHTML = (nombre, clave) => `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
    <div style="background: linear-gradient(90deg, #7b002c 0%, #a0143c 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">¡Bienvenido a Lumatek!</h1>
    </div>
    <div style="padding: 40px; color: #333; line-height: 1.6;">
        <p style="font-size: 18px;">Hola <strong>${nombre}</strong>,</p>
        <p>Gracias por adquirir el <strong>Sistema de Generación de Constancias Automatizado Lumatek</strong>. Estamos emocionados de ayudarte a optimizar tus procesos administrativos.</p>
        
        <div style="background: #f9f9f9; border-left: 5px solid #a0143c; padding: 20px; margin: 30px 0;">
            <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; font-weight: bold;">Tu Clave de Licencia:</p>
            <p style="margin: 10px 0 0 0; font-family: monospace; font-size: 24px; color: #a0143c; font-weight: bold; letter-spacing: 2px;">${clave}</p>
        </div>

        <p>Puedes descargar el instalador del sistema desde el siguiente enlace oficial:</p>
        
        <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.DOWNLOAD_URL}" style="background: #a0143c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">DESCARGAR PROGRAMA</a>
        </div>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #999;">Esta licencia es válida por un año a partir de su activación. Para cualquier duda, responde a este correo o contacta a nuestro equipo de soporte.</p>
    </div>
    <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 11px; color: #777;">
        © ${new Date().getFullYear()} Lumatek Software de Constancias. Todos los derechos reservados.
    </div>
</div>
`;

/**
 * Webhook de PayPal: Compra de Software ($499)
 */
app.post('/api/nueva-venta', async (req, res) => {
    const event = req.body;

    console.log(`📩 Nuevo Webhook de Venta recibido: ${event.event_type}`);

    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED' || event.event_type === 'MOCK_TEST') {
        const resource = event.resource;
        const buyer = resource.payer;
        const email = buyer.email_address;
        const nombre = buyer.name.given_name + ' ' + buyer.name.surname;
        const transaccionId = resource.id;

        console.log(`🛒 Venta detectada: ${nombre} (${email})`);

        try {
            // --- LLAMADA A LA FUNCIÓN RPC DE SUPABASE ---
            const { data: clave, error } = await supabase.rpc('asignar_licencia_segura', {
                p_email: email,
                p_nombre: nombre,
                p_transaccion: transaccionId
            });

            if (error) {
                console.error('❌ Error al asignar licencia:', error.message);
                return res.status(500).send('Error asignando licencia');
            }

            console.log(`🔑 Licencia asignada correctamente: ${clave}`);

            // --- ENVÍO DE EMAIL CON RESEND (API) ---
            const { data, error: mailError } = await resend.emails.send({
                from: process.env.EMAIL_FROM || 'Lumatek Software <onboarding@resend.dev>',
                to: [email],
                subject: '🚀 Tu Licencia Lumatek está lista - Descarga el programa',
                html: getEmailHTML(nombre, clave)
            });

            if (mailError) {
                console.error('❌ Error de Resend:', mailError);
                return res.status(500).send('Error enviando correo');
            }

            console.log(`📧 Correo enviado con éxito (ID: ${data.id})`);
            res.status(200).send('Venta procesada con éxito');

        } catch (err) {
            console.error('❌ Error crítico en el proceso de venta:', err);
            res.status(500).send('Error interno');
        }
    } else {
        res.status(200).send('Evento ignorado');
    }
});

app.get('/health', (req, res) => res.send('Tienda Lumatek Operativa con Resend 🚀'));

app.listen(port, () => {
    console.log(`🚀 Store Server escuchando en puerto ${port} (Resend Edition)`);
});
