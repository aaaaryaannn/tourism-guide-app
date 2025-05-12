/**
 * leaflet-fix.ts
 * 
 * This file contains helper functions to fix common Leaflet map errors
 */

/**
 * This file contains fixes for Leaflet map initialization issues
 * related to SSR, React, and browser compatibility
 */

// Fix for the "_leaflet_pos" issue that can happen in some browsers
const fixLeafletMapErrors = () => {
  // Only run in browser environment
  if (typeof window !== 'undefined') {
    // Fix for prototypes missing in older browsers
    if (!Element.prototype.matches) {
      // @ts-ignore - Properties might not exist in strict TypeScript
      Element.prototype.matches =
        // @ts-ignore
        Element.prototype.msMatchesSelector ||
        // @ts-ignore
        Element.prototype.webkitMatchesSelector;
    }

    // Fix CSS transitions messing up map redraws
    const resizeObserver = new ResizeObserver(() => {
      // Fix for leaflet maps not displaying correctly
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 200);
    });
    
    // Apply resize observer to document body
    if (document.body) {
      resizeObserver.observe(document.body);
    }
    
    // Fix for missing icons when deployed
    const fixLeafletIcon = () => {
      // @ts-ignore
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      
      // @ts-ignore
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });
    };
    
    // Apply Leaflet icon fix if L (Leaflet) is available
    // @ts-ignore
    if (typeof L !== 'undefined') {
      fixLeafletIcon();
    } else {
      // Wait for L to be defined and then fix
      const checkLeaflet = setInterval(() => {
        // @ts-ignore
        if (typeof L !== 'undefined') {
          fixLeafletIcon();
          clearInterval(checkLeaflet);
        }
      }, 100);
      
      // Stop checking after 5 seconds to prevent infinite loop
      setTimeout(() => clearInterval(checkLeaflet), 5000);
    }
  }
};

// Apply fix when module is loaded
if (typeof window !== 'undefined') {
  // Wait for DOM content to be loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixLeafletMapErrors);
  } else {
    // DOM already loaded, run now
    fixLeafletMapErrors();
    
    // Also run when visibility changes (tab becomes visible)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        setTimeout(fixLeafletMapErrors, 100);
      }
    });
  }
}

export default fixLeafletMapErrors; 