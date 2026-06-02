require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const dns = require('dns');

// Forzar IPv4 para evitar errores de red en Render (ENETUNREACH IPv6)
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Ruta explícita para servir la Landing Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


const port = process.env.PORT || 5000;

// Configuración de Supabase
const supabase = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: { persistSession: false }
    }
);

// Configuración de Resend (Email API)
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Plantilla de Email HTML Premium (Diseño Lumatek Vibrante)
 */
const getEmailHTML = (nombre, clave) => `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;">
    <!-- Encabezado con Logo e Imagen -->
    <div style="background: linear-gradient(135deg, #004aad 0%, #cb6ce6 50%, #ff914d 100%); padding: 40px 20px; text-align: center;">
        <img src="https://i.imgur.com/BOrNfV5.png" alt="Lumatek Logo" style="max-width: 250px; margin-bottom: 20px;">
        <h1 style="margin: 0; color: white; font-size: 22px; text-transform: uppercase; letter-spacing: 3px; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">¡Bienvenido a la Familia!</h1>
    </div>

    <div style="padding: 40px; background-color: #ffffff; color: #444;">
        <h2 style="color: #004aad; margin-top: 0;">Hola, <span style="color: #cb6ce6;">${nombre}</span></h2>
        <p style="font-size: 16px; line-height: 1.6;">Gracias por confiar en <strong>Lumatek</strong>. Has adquirido la herramienta líder en automatización de constancias digitales.</p>
        
        <!-- Tarjeta de Licencia -->
        <div style="background: #f8f9fa; border: 2px dashed #cb6ce6; border-radius: 10px; padding: 25px; margin: 30px 0; text-align: center;">
            <p style="margin: 0; color: #888; font-size: 11px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Tu Clave de Licencia Unica:</p>
            <div style="margin: 15px 0; padding: 10px; background: white; border-radius: 5px; border: 1px solid #ddd; display: inline-block;">
                <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 32px; color: #004aad; font-weight: bold; letter-spacing: 5px;">${clave}</p>
            </div>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 13px;">Copia la licencia incluyendo el guion y pégala en el programa de instalación.</p>
            <p style="margin: 10px 0 0 0; color: #ff914d; font-size: 12px; font-weight: bold;">⚠️ No compartas esta clave con nadie.</p>
        </div>

        <p style="font-size: 15px;">Para comenzar a trabajar, descarga e instala el software haciendo clic en el botón de abajo:</p>
        
        <!-- Botón de Descarga -->
        <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.DOWNLOAD_URL}" style="background: linear-gradient(90deg, #004aad 0%, #cb6ce6 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 18px; display: inline-block; box-shadow: 0 5px 15px rgba(203, 108, 230, 0.4);">🚀 DESCARGAR PROGRAMA</a>
        </div>

        <div style="background-color: #fff4ec; border-radius: 8px; padding: 15px; font-size: 13px; color: #666; border-left: 4px solid #ff914d;">
            <strong>Próximos pasos:</strong><br>
            1. Ejecuta el instalador.<br>
            2. Ingresa tu clave cuando el programa lo solicite.<br>
            3. ¡Disfruta de tu productividad!
        </div>

        <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 30px 0;">
        <p style="font-size: 12px; color: #aaa; text-align: center;">Esta licencia tiene una vigencia de 365 días a partir de su activación inicial.</p>
    </div>

    <!-- Pie de página -->
    <div style="background: #222; padding: 30px; text-align: center; color: #888; font-size: 12px;">
        <p style="margin: 0;">Lumatek | Puente hacia una Educación Integral Digital</p>
        <p style="margin: 5px 0;">info@lumatek-validador.lat</p>
        <div style="margin-top: 20px; font-size: 10px;">
            © ${new Date().getFullYear()} Lumatek. Todos los derechos reservados.
        </div>
    </div>
</div>
`;

/**
 * NUEVO: Plantilla de Email HTML para PDF Tool Pro (Diseño Indigo/Púrpura/Rosa)
 */
const getEmailHTMLPdfTool = (nombre, clave) => `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;">
    <div style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%); padding: 40px 20px; text-align: center;">
        <img src="https://i.imgur.com/BOrNfV5.png" alt="Lumatek Logo" style="max-width: 200px; margin-bottom: 15px;">
        <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 800; letter-spacing: 2px;">PDF Tool Pro</h1>
        <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Convertidor y Editor de PDF Profesional</p>
    </div>
    <div style="padding: 40px; background-color: #ffffff; color: #444;">
        <h2 style="color: #6366f1; margin-top: 0;">Hola, <span style="color: #a855f7;">${nombre}</span></h2>
        <p style="font-size: 16px; line-height: 1.6;">Gracias por adquirir <strong>PDF Tool Pro</strong> de Lumatek. Has obtenido la herramienta profesional para convertir, unir y organizar archivos PDF.</p>
        <div style="background: #f8f9fa; border: 2px dashed #a855f7; border-radius: 10px; padding: 25px; margin: 30px 0; text-align: center;">
            <p style="margin: 0; color: #888; font-size: 11px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Tu Clave de Licencia Única:</p>
            <div style="margin: 15px 0; padding: 10px; background: white; border-radius: 5px; border: 1px solid #ddd; display: inline-block;">
                <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 32px; color: #6366f1; font-weight: bold; letter-spacing: 5px;">${clave}</p>
            </div>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 13px;">Copia la licencia incluyendo el guion y pégala en el panel de administración.</p>
            <p style="margin: 10px 0 0 0; color: #ec4899; font-size: 12px; font-weight: bold;">⚠️ No compartas esta clave con nadie.</p>
        </div>
        <p style="font-size: 15px;">Para comenzar, descarga e instala el software:</p>
        <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.DOWNLOAD_URL_PDFTOOL || process.env.DOWNLOAD_URL}" style="background: linear-gradient(90deg, #6366f1 0%, #a855f7 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 18px; display: inline-block; box-shadow: 0 5px 15px rgba(99, 102, 241, 0.4);">📄 DESCARGAR PDF TOOL PRO</a>
        </div>
        <div style="background-color: #f0f0ff; border-radius: 8px; padding: 15px; font-size: 13px; color: #666; border-left: 4px solid #6366f1;">
            <strong>Próximos pasos:</strong><br>
            1. Ejecuta el instalador o descomprime el programa.<br>
            2. Abre el Panel de Administración (Panel_Lumatek.hta).<br>
            3. Ve a la sección "Licencia" e ingresa tu clave.<br>
            4. ¡Comienza a convertir y unir PDFs!
        </div>
        <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 30px 0;">
        <p style="font-size: 12px; color: #aaa; text-align: center;">Esta licencia tiene una vigencia de 365 días a partir de su activación inicial.</p>
    </div>
    <div style="background: #222; padding: 30px; text-align: center; color: #888; font-size: 12px;">
        <p style="margin: 0;">Lumatek | Herramientas Profesionales de Software</p>
        <p style="margin: 5px 0;">info@lumatek-validador.lat</p>
        <div style="margin-top: 20px; font-size: 10px;">© ${new Date().getFullYear()} Lumatek. Todos los derechos reservados.</div>
    </div>
</div>
`;

/**
 * Webhook de PayPal: Compra de Lumatek Constancias ($499)
 */
app.post('/api/nueva-venta', async (req, res) => {
    const event = req.body;

    console.log(`📩 Nuevo Webhook de Venta recibido: ${event.event_type}`);

    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED' || event.event_type === 'MOCK_TEST') {
        const resource = event.resource;
        const buyer = resource.payer;
        const email = buyer.email_address;
        const nombre = (buyer.name.given_name + ' ' + buyer.name.surname).toUpperCase();
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
                from: 'Lumatek | Software 🛡️ <info@lumatek-validador.lat>',
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

/**
 * NUEVO: Webhook de PayPal para ventas de PDF Tool Pro ($499)
 * Mismo flujo que /api/nueva-venta pero con RPC y plantilla de email específicos
 */
app.post('/api/nueva-venta-pdftool', async (req, res) => {
    const event = req.body;

    console.log(`📩 [PDF Tool Pro] Nuevo Webhook de Venta recibido: ${event.event_type}`);

    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED' || event.event_type === 'MOCK_TEST') {
        const resource = event.resource;
        const buyer = resource.payer;
        const email = buyer.email_address;
        const nombre = (buyer.name.given_name + ' ' + buyer.name.surname).toUpperCase();
        const transaccionId = resource.id;

        console.log(`🛒 [PDF Tool Pro] Venta detectada: ${nombre} (${email})`);

        try {
            // --- LLAMADA A LA FUNCIÓN RPC ESPECÍFICA PARA PDF TOOL PRO ---
            const { data: clave, error } = await supabase.rpc('asignar_licencia_pdftool_segura', {
                p_email: email,
                p_nombre: nombre,
                p_transaccion: transaccionId
            });

            if (error) {
                console.error('❌ [PDF Tool Pro] Error al asignar licencia:', error.message);
                return res.status(500).send('Error asignando licencia PDF Tool Pro');
            }

            console.log(`🔑 [PDF Tool Pro] Licencia asignada correctamente: ${clave}`);

            // --- ENVÍO DE EMAIL CON PLANTILLA PDF TOOL PRO ---
            const { data, error: mailError } = await resend.emails.send({
                from: 'PDF Tool Pro | Lumatek 🛡️ <info@lumatek-validador.lat>',
                to: [email],
                subject: '🚀 Tu Licencia PDF Tool Pro está lista',
                html: getEmailHTMLPdfTool(nombre, clave)
            });

            if (mailError) {
                console.error('❌ [PDF Tool Pro] Error de Resend:', mailError);
                return res.status(500).send('Error enviando correo PDF Tool Pro');
            }

            console.log(`📧 [PDF Tool Pro] Correo enviado con éxito (ID: ${data.id})`);
            res.status(200).send('Venta PDF Tool Pro procesada con éxito');

        } catch (err) {
            console.error('❌ [PDF Tool Pro] Error crítico en el proceso de venta:', err);
            res.status(500).send('Error interno');
        }
    } else {
        res.status(200).send('Evento ignorado');
    }
});

app.get('/health', (req, res) => res.send('Tienda Lumatek Multi-Producto Operativa 🚀'));

app.listen(port, () => {
    console.log(`🚀 Store Server Multi-Producto escuchando en puerto ${port} (Resend Edition)`);
});
