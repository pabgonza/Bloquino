// Ruta del editor. Siempre en español (`/es/editor`, que es como Velxio activa
// un idioma). Modo profe: el editor completo de Velxio. Modo alumno: la página
// de Bloquino.
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { EditorPage } from '../pages/EditorPage';
import textos from '../i18n/locales/es/bloquino.json';
import { leerModo } from './modo';
import { PaginaAlumno } from './PaginaAlumno';

export function PaginaEditor() {
  const { pathname, search } = useLocation();
  const [modo] = useState(() => leerModo(search));
  // Después de EditorPage, que pone el título de Velxio.
  useEffect(() => {
    document.title = textos.marca;
  });
  if (!pathname.startsWith('/es/')) return <Navigate to={`/es/editor${search}`} replace />;
  return modo === 'profe' ? <EditorPage /> : <PaginaAlumno />;
}
