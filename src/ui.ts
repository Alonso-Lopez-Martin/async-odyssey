// src/ui.ts
import type { MarsPhoto } from './api';

const gallery = document.getElementById("gallery") as HTMLDivElement;

export function renderLoading(): void {
  // 1. Estado visual de carga[cite: 112]
  gallery.innerHTML = '<p class="estado-mensaje">⏳ Estableciendo conexión con el Rover Curiosity...</p>';
}

export function renderError(message: string): void {
  // 2. Estado visual de error[cite: 112]
  gallery.innerHTML = `<p class="error-mensaje">⚠ ${message}</p>`;
}

export function renderPhotos(photos: MarsPhoto[]): void {
  // 3. Robustez: control de respuestas vacías (el Rover no hizo fotos ese día)[cite: 112]
  if (photos.length === 0) {
    gallery.innerHTML = '<p class="estado-mensaje">El Rover no capturó imágenes con esta cámara en este Sol marciano. Prueba otra combinación.</p>';
    return;
  }

  // TRANSFORMACIÓN DE DATOS (15 pts)[cite: 93]
  // Limitamos a un máximo de 12 fotos con .slice y transformamos los objetos a HTML con .map sin usar bucles innecesarios[cite: 93]
  const html = photos
    .slice(0, 12)
    .map((photo) => {
      return `
        <div class="photo-card">
          <img src="${photo.img_src}" alt="Foto de Marte ID ${photo.id}" loading="lazy" />
          <p>Fecha Terrestre: ${photo.earth_date}</p>
        </div>
      `;
    })
    .join(""); // .join() convierte el array resultante en un único string HTML[cite: 113]

  gallery.innerHTML = html;
}