-- Agrega la columna 'email' a la tabla 'usuario' si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuario' AND column_name = 'email') THEN
        ALTER TABLE public.usuario ADD COLUMN email TEXT;
    END IF;
END $$;

-- Opcional: Intentar rellenar emails vacíos basados en datos de Auth (requiere permisos elevados o hacerlo manualmente)
-- Por ahora, dejaremos que se rellenen con el uso o manualmente.
