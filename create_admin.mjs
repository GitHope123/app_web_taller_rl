import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

// Configuración de Supabase
const supabaseUrl = 'https://puqyhmrkgmtvhowssyry.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1cXlobXJrZ210dmhvd3NzeXJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NDUyMzQsImV4cCI6MjA3MTIyMTIzNH0.8AOypG2-h7aABT0-GniUAwcMkLkXnKy0Ns2B4B8KVMw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const askQuestion = (query) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => rl.question(query, (ans) => {
        rl.close();
        resolve(ans);
    }));
};

async function createAdmin() {
    console.log('\n--- CONFIGURACIÓN DE PERFIL ADMIN (USUARIO EXISTENTE) ---\n');
    console.log('Usa esto si ya creaste el usuario en Supabase Auth y necesitas configurar su perfil público.\n');

    try {
        // 1. Autenticación
        const email = await askQuestion('Email del usuario ya creado: ');
        if (!email) throw new Error('El email es requerido');

        const password = await askQuestion('Contraseña: ');
        if (!password) throw new Error('La contraseña es requerida');

        console.log('\nAutenticando...');

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (authError) throw new Error(`Error de autenticación: ${authError.message}`);

        const userId = authData.user.id;
        console.log(`✅ Autenticado correctamente. ID: ${userId}`);

        // 2. Datos del Perfil
        console.log('\n--- DATOS DEL PERFIL PÚBLICO ---\n');

        const nombre = await askQuestion('Nombre: ');
        if (!nombre) throw new Error('El nombre es requerido');

        const apellidos = await askQuestion('Apellidos: ');
        if (!apellidos) throw new Error('Los apellidos son requeridos');

        const dni = await askQuestion('DNI (8 dígitos): ');
        if (!dni || dni.length !== 8) throw new Error('El DNI debe tener 8 dígitos');

        const celular = await askQuestion('Celular (9 dígitos): ');
        if (celular && celular.length !== 9) throw new Error('El celular debe tener 9 dígitos');

        // 3. Insertar/Actualizar en tabla pública
        console.log('\nGuardando perfil en la base de datos...');

        const { error: dbError } = await supabase
            .from('usuario')
            .upsert([
                {
                    id_usuario: userId,
                    nombre,
                    apellidos,
                    dni,
                    celular,
                    rol: 'admin',
                    fecha_creacion: new Date()
                }
            ], { onConflict: 'id_usuario' });

        if (dbError) {
            console.error('❌ Error guardando datos:', dbError.message);
            console.log('Asegúrate de haber ejecutado el script SQL de políticas RLS.');
        } else {
            console.log('\n✅ ¡Perfil Admin configurado exitosamente!');
            console.log(`Ahora puedes iniciar sesión en la web con tu DNI (${dni}) y la contraseña.`);
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

createAdmin();
