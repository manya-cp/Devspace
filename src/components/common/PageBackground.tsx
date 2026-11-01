import React, { useState } from 'react';

export type BackgroundTheme = 
  | 'landing' 
  | 'auth' 
  | 'feed'
  | 'reader'
  | 'workspace' 
  | 'nodes' 
  | 'editor'
  | 'profile'
  | 'tags'
  | 'settings';

const THEME_IMAGES: Record<BackgroundTheme, string> = {
  landing: '/src/assets/images/bg_landing_tech_1793504993992.jpg',
  auth: '/src/assets/images/bg_auth_mesh_1793505007422.jpg',
  feed: '/src/assets/images/bg_workspace_dark_1793505024814.jpg',
  reader: '/src/assets/images/bg_reader_sanctuary_1793505789951.jpg',
  workspace: '/src/assets/images/bg_workspace_dark_1793505024814.jpg',
  nodes: '/src/assets/images/bg_nodes_mesh_1793505041099.jpg',
  editor: '/src/assets/images/bg_editor_focus_1793505820782.jpg',
  profile: '/src/assets/images/bg_profile_identity_1793505805767.jpg',
  tags: '/src/assets/images/bg_tags_constellation_1793505836681.jpg',
  settings: '/src/assets/images/bg_profile_identity_1793505805767.jpg',
};

const THEME_FALLBACK_GRADIENTS: Record<BackgroundTheme, string> = {
  landing: 'from-slate-950 via-[#060e1d] to-slate-950',
  auth: 'from-slate-950 via-[#0d0d1e] to-slate-950',
  feed: 'from-slate-950 via-[#08101e] to-slate-950',
  reader: 'from-slate-950 via-[#0a0f16] to-slate-950',
  workspace: 'from-slate-950 via-[#08101e] to-slate-950',
  nodes: 'from-slate-950 via-[#071324] to-slate-950',
  editor: 'from-slate-950 via-[#09101c] to-slate-950',
  profile: 'from-slate-950 via-[#07111f] to-slate-950',
  tags: 'from-slate-950 via-[#061226] to-slate-950',
  settings: 'from-slate-950 via-[#08101e] to-slate-950',
};

interface PageBackgroundProps {
  theme?: BackgroundTheme;
  customImage?: string;
  overlayOpacity?: string;
}

export const PageBackground: React.FC<PageBackgroundProps> = ({
  theme = 'landing',
  customImage,
  overlayOpacity = 'bg-slate-950/85',
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageSrc = customImage || THEME_IMAGES[theme] || THEME_IMAGES.landing;
  const gradientClass = THEME_FALLBACK_GRADIENTS[theme] || THEME_FALLBACK_GRADIENTS.landing;

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
      {/* High-fidelity CSS fallback gradient always present */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`} />
      
      {/* Subtle radial ambient highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(6,182,212,0.12),transparent_70%)]" />

      {/* Thematic Background image */}
      {!imageError && (
        <img
          src={imageSrc}
          alt=""
          role="presentation"
          referrerPolicy="no-referrer"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
            imageLoaded ? 'opacity-30' : 'opacity-0'
          }`}
        />
      )}

      {/* Contrast scrim and vignette overlays ensuring WCAG AA readability */}
      <div className={`absolute inset-0 ${overlayOpacity} backdrop-blur-[1px]`} />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/70" />
    </div>
  );
};

export default PageBackground;
