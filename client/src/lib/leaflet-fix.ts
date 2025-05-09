/**
 * leaflet-fix.ts
 * 
 * This file contains helper functions to fix common Leaflet map errors
 */

// Fix for "_leaflet_pos of undefined" error
export const fixLeafletMapErrors = () => {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  // Check if Leaflet is available
  if (!(window as any).L) return;
  
  const L = (window as any).L;
  
  // Find any Leaflet map containers
  const mapElements = document.querySelectorAll('.leaflet-container');
  
  if (mapElements.length > 0) {
    console.log('[Leaflet Fix] Found map elements:', mapElements.length);
    
    // For each map element, try to invalidate size
    mapElements.forEach(element => {
      try {
        // Get the map instance associated with this container
        if (element && (element as any)._leaflet_id) {
          const mapId = (element as any)._leaflet_id;
          const map = L.map._maps ? L.map._maps[mapId] : null;
          
          if (map) {
            console.log('[Leaflet Fix] Invalidating map size for map:', mapId);
            // Force a size recalculation
            setTimeout(() => {
              map.invalidateSize(true);
            }, 100);
          }
        }
      } catch (err) {
        console.error('[Leaflet Fix] Error fixing map:', err);
      }
    });
  }
  
  // Patch Leaflet's DomUtil to handle undefined positions better
  if (L && L.DomUtil) {
    const originalGetPosition = L.DomUtil.getPosition;
    
    // Replace the getPosition method with a safer version
    L.DomUtil.getPosition = function(el) {
      if (!el) {
        console.warn('[Leaflet Fix] getPosition called with null/undefined element');
        return new L.Point(0, 0);
      }
      
      try {
        return originalGetPosition.call(this, el);
      } catch (e) {
        console.warn('[Leaflet Fix] Error in getPosition:', e);
        return new L.Point(0, 0); 
      }
    };
    
    console.log('[Leaflet Fix] Patched L.DomUtil.getPosition for safer handling');
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