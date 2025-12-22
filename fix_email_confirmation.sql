-- ALERTA DE SEGURIDAD: Solo ejecuta esto si sabes lo que haces y es un entorno seguro/dev.
-- Este script confirma automáticamente el email de TODOS los usuarios registrados.

UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;

-- Opcional: Para evitar problemas futuros, también puedes configurar 
-- que la confirmación de email esté desactivada en el Dashboard de Supabase:
-- Authentication -> Providers -> Email -> Desmarcar "Confirm email"
