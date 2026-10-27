/**
 * ADVANCE Engine - Anti-Crack & Anti-Tamper Security Module
 * Protects frontend code, design assets, and disables DevTools inspection
 */

export function initSecurityProtection() {
  if (typeof window === 'undefined') return;

  // 1. Disable Right-Click Context Menu
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  }, { capture: true });

  // 2. Disable Keyboard Shortcuts for DevTools & Source View
  window.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+I (DevTools), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspect), Ctrl+Shift+K
    if (
      (e.ctrlKey || e.metaKey) &&
      e.shiftKey &&
      (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c' || e.key === 'K' || e.key === 'k')
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+U (View Page Source)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+S (Save Page)
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+P (Print Page)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, { capture: true });

  // 3. Disable Dragging on Images
  document.addEventListener('dragstart', (e) => {
    if (e.target && (e.target as HTMLElement).tagName === 'IMG') {
      e.preventDefault();
      return false;
    }
  });

  // 4. Anti-Debugger / Console Warning
  const warnBanner = () => {
    try {
      console.clear();
      console.log(
        '%c⚠️ ADVANCE SYSTEM SECURITY ACTIVE',
        'color: #00eaf4; background: #0b0f19; font-size: 20px; font-weight: bold; padding: 8px 16px; border-radius: 8px; border: 1px solid #00eaf4;'
      );
      console.log(
        '%cUnauthorized source inspection, scraping, or code cracking is strictly prohibited.',
        'color: #ff4b57; font-size: 12px; font-weight: bold;'
      );
    } catch {}
  };

  warnBanner();
  setInterval(warnBanner, 10000);

  // 5. Detect DevTools Opening via Window Resize / Outer Dimension delta
  let devtoolsDetected = false;
  const checkDevTools = () => {
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth > threshold;
    const heightDiff = window.outerHeight - window.innerHeight > threshold;

    if (widthDiff || heightDiff) {
      if (!devtoolsDetected) {
        devtoolsDetected = true;
        warnBanner();
      }
    } else {
      devtoolsDetected = false;
    }
  };

  window.addEventListener('resize', checkDevTools);
  setInterval(checkDevTools, 2000);
}
