-- ============================================
-- FUNCIÓN SEGURA PARA ACTUALIZAR USUARIOS (AUTH + PUBLIC)
-- ============================================

-- Habilitar extensión para encriptación de contraseñas
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Función para que un ADMIN actualice datos confidenciales de otro usuario
CREATE OR REPLACE FUNCTION public.actualizar_usuario_completo(
    target_id UUID,
    new_email TEXT DEFAULT NULL,
    new_password TEXT DEFAULT NULL,
    new_nombre TEXT DEFAULT NULL,
    new_apellidos TEXT DEFAULT NULL,
    new_dni TEXT DEFAULT NULL,
    new_celular TEXT DEFAULT NULL,
    new_rol TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  changes_count INT := 0;
BEGIN
  -- 1. Verificar permisos de administrador
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acceso denegado: Solo los administradores pueden actualizar credenciales.';
  END IF;

  -- 2. Actualizar tabla AUTH (Credenciales)
  
  -- Actualizar Email si se proporciona
  IF new_email IS NOT NULL AND new_email <> '' THEN
      UPDATE auth.users 
      SET email = new_email, 
          updated_at = now() 
      WHERE id = target_id;
  END IF;

  -- Actualizar Contraseña si se proporciona
  IF new_password IS NOT NULL AND new_password <> '' THEN
      -- Nota: Auth usa bcrypt. pgcrypto gen_salt('bf') genera un salt compatible.
      UPDATE auth.users 
      SET encrypted_password = crypt(new_password, gen_salt('bf')),
          updated_at = now() 
      WHERE id = target_id;
  END IF;

  -- Actualizar Metadata en Auth (opcional pero recomendado para consistencia)
  IF new_nombre IS NOT NULL OR new_apellidos IS NOT NULL OR new_rol IS NOT NULL THEN
      UPDATE auth.users
      SET raw_user_meta_data = 
          COALESCE(raw_user_meta_data, '{}'::jsonb) || 
          jsonb_strip_nulls(jsonb_build_object(
              'nombre', new_nombre,
              'apellidos', new_apellidos,
              'rol', new_rol
          ))
      WHERE id = target_id;
  END IF;


  -- 3. Actualizar tabla PÚBLICA (Perfil)
  UPDATE public.usuario
  SET 
    nombre = COALESCE(new_nombre, nombre),
    apellidos = COALESCE(new_apellidos, apellidos),
    dni = COALESCE(new_dni, dni),
    celular = COALESCE(new_celular, celular),
    rol = COALESCE(new_rol, rol)
  WHERE id_usuario = target_id;

  result := jsonb_build_object(
    'success', true,
    'message', 'Usuario actualizado correctamente en Auth y Public'
  );

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.actualizar_usuario_completo(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
