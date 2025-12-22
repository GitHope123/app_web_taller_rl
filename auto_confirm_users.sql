-- SOLUCIÓN DEFINITIVA PARA "EMAIL NOT CONFIRMED"
-- Este script crea un "Trigger" (disparador) en la base de datos.
-- Cada vez que se registre un usuario nuevo, este código se ejecutará automáticamente
-- y marcará el email como CONFIRMADO al instante.

-- 1. Crear la función que confirma el usuario
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
    NEW.email_confirmed_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Crear el trigger que se activa ANTES de insertar un usuario en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;

CREATE TRIGGER on_auth_user_created_auto_confirm
BEFORE INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.auto_confirm_user();

-- 3. Confirmar también todos los usuarios ya existentes por si acaso
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;
