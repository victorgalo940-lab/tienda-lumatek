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

async function protegerMasterKey() {
    console.log('🛡️ Protegiendo Master Key...');
    
    // Cambiamos el estado a 'master' para que el sistema de ventas la ignore
    const { data, error } = await supabase
        .from('licencias')
        .update({
            estado: 'master',
            comprador_email: 'ADMIN',
            comprador_nombre: 'LUMATEK MASTER',
            transaccion_id: 'MASTER_KEY'
        })
        .eq('clave', 'V1CM4-G4L01');

    if (error) {
        console.error('❌ Error al proteger:', error.message);
    } else {
        console.log('✅ Master Key (V1CM4-G4L01) protegida y reservada para uso administrativo.');
    }
}

protegerMasterKey();
