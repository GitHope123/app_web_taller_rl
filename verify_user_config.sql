-- ============================================
-- SCRIPT PARA VERIFICAR Y CORREGIR LA CONFIGURACIÓN DE USUARIOS
-- ============================================
-- Este script verifica que la configuración de la base de datos
-- permita la creación correcta de usuarios desde la aplicación.

-- 1. Verificar que existe el trigger de auto-confirmación
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created_auto_confirm';

-- 2. Verificar la foreign key constraint
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'usuario'
    AND tc.constraint_name LIKE '%auth%';

-- 3. Verificar las políticas RLS en la tabla usuario
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'usuario'
ORDER BY policyname;

-- 4. OPCIONAL: Si necesitas recrear la política de inserción para admins
-- Descomenta las siguientes líneas si la política no permite inserciones

-- DROP POLICY IF EXISTS "insercion_usuario" ON public.usuario;

-- CREATE POLICY "insercion_usuario" ON public.usuario
-- FOR INSERT TO authenticated
-- WITH CHECK (
--   is_admin() = true
--   OR
--   auth.uid() = id_usuario
-- );

-- 5. Verificar que todos los usuarios de auth.users tienen email confirmado
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN 'NO CONFIRMADO'
        ELSE 'CONFIRMADO'
    END as estado
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 6. OPCIONAL: Confirmar todos los usuarios existentes si es necesario
-- Descomenta la siguiente línea si necesitas confirmar usuarios manualmente

-- UPDATE auth.users
-- SET email_confirmed_at = now()
-- WHERE email_confirmed_at IS NULL;
