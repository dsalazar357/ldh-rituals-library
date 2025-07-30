-- Crear un bucket para almacenar los rituales
INSERT INTO storage.buckets (id, name, public)
VALUES ('rituals', 'Rituales', true)
ON CONFLICT (id) DO NOTHING;

-- Configurar políticas de acceso para el bucket de rituales
-- Permitir acceso público de lectura
CREATE POLICY "Permitir acceso público de lectura" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'rituals');

-- Permitir a los usuarios autenticados subir archivos
CREATE POLICY "Permitir a usuarios autenticados subir archivos" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'rituals' AND
    auth.role() = 'authenticated'
  );

-- Permitir a los usuarios eliminar sus propios archivos
CREATE POLICY "Permitir a usuarios eliminar sus propios archivos" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'rituals' AND
    (auth.uid() = owner OR
     EXISTS (
       SELECT 1 FROM public.users
       WHERE id = auth.uid() AND role = 'admin'
     ))
  );
