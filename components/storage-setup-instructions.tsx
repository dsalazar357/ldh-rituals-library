"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function StorageSetupInstructions() {
  const [showInstructions, setShowInstructions] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Almacenamiento</CardTitle>
        <CardDescription>Instrucciones para configurar el almacenamiento de archivos en Supabase</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuración necesaria</AlertTitle>
          <AlertDescription>
            Para poder subir archivos, necesitas configurar el almacenamiento en Supabase.
          </AlertDescription>
        </Alert>

        <Button onClick={() => setShowInstructions(!showInstructions)}>
          {showInstructions ? "Ocultar instrucciones" : "Mostrar instrucciones"}
        </Button>

        {showInstructions && (
          <div className="mt-4 space-y-4">
            <h3 className="text-lg font-medium">Pasos para configurar Supabase Storage:</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Inicia sesión en tu panel de control de Supabase.</li>
              <li>Ve a la sección "Storage" en el menú lateral.</li>
              <li>Crea un nuevo bucket llamado "rituals" y marca la opción "Public".</li>
              <li>
                Ve a la sección "SQL Editor" y ejecuta el siguiente script:
                <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-md overflow-x-auto text-xs">
                  {`-- Crear un bucket para almacenar los rituales
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
  );`}
                </pre>
              </li>
              <li>Después de ejecutar el script, recarga la página de Storage para ver el bucket creado.</li>
              <li>Ahora deberías poder subir archivos a través de la aplicación.</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
