import { Camera, MapPin } from 'lucide-react'
import type { MemoryPhoto } from '../types'

interface FilmstripProps {
  photos: MemoryPhoto[]
}

export function Filmstrip({ photos }: FilmstripProps) {
  if (photos.length === 0) {
    return (
      <section className="filmstrip empty-filmstrip" aria-label="Photo evidence filmstrip">
        <Camera size={18} aria-hidden="true" />
        <span>Load a folder to reveal the photo evidence strip.</span>
      </section>
    )
  }

  return (
    <section className="filmstrip" aria-label="Photo evidence filmstrip">
      {photos.map((photo) => (
        <article className="film-frame" key={photo.id}>
          <img src={photo.previewUrl} alt="" />
          <div className="film-frame-meta">
            <span>{photo.fileName}</span>
            <small>
              <MapPin size={12} aria-hidden="true" />
              {photo.gps ? 'GPS' : 'manual'}
            </small>
          </div>
        </article>
      ))}
    </section>
  )
}
