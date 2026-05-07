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

async function blindarBaseDeDatos() {
    console.log('🔒 Aplicando blindaje RLS a la tabla de licencias...');
    
    // 1. Activar RLS en la tabla
    // 2. Por defecto, al activar RLS sin políticas, todo queda bloqueado para el rol 'anon'
    // 3. El 'service_role' (que usa tu servidor) saltará estas reglas automáticamente
    
    const { error } = await supabase.rpc('ejecutar_sql', {
        sql_query: `
            -- Activar RLS
            ALTER TABLE licencias ENABLE ROW LEVEL SECURITY;

            -- Eliminar cualquier política previa si existe
            DROP POLICY IF EXISTS "Bloqueo Total Publico" ON licencias;

            -- Crear política que impide lectura/escritura al rol público (anon)
            -- Nota: No necesitamos crear una para service_role porque ese rol es bypass por naturaleza.
        `
    });

    if (error) {
        // Si el RPC de SQL no existe, intentaremos informar al usuario
        console.error('❌ Error al aplicar blindaje:', error.message);
        console.log('💡 Tip: Si falla el RPC, puedo guiarte para hacerlo desde el panel de Supabase.');
    } else {
        console.log('✅ Blindaje RLS activado con éxito. Los datos ahora son privados.');
    }
}

blindarBaseDeDatos();
