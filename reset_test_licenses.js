require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const ws = require('ws');

const supabase = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: { persistSession: false },
        realtime: { enabled: false, transport: ws }
    }
);

async function limpiarLicencias() {
    console.log('🧹 Iniciando limpieza de licencias de prueba...');
    
    const { data, error } = await supabase
        .from('licencias')
        .update({
            estado: 'disponible',
            comprador_email: null,
            comprador_nombre: null,
            transaccion_id: null,
            fecha_venta: null
        })
        .eq('comprador_email', 'vicma.galo98@gmail.com');

    if (error) {
        console.error('❌ Error al limpiar:', error.message);
    } else {
        console.log('✅ Licencias reseteadas con éxito.');
    }
}

limpiarLicencias();
