import { useState, useEffect } from "react";
// Determine provider synchronously from env; script loading is handled elsewhere
export const useMapsApi = () => {
  const forceOlaEnv = (process.env.REACT_APP_FORCE_OLA || '').toLowerCase();
  const forceOla = forceOlaEnv === '1' || forceOlaEnv === 'true' || forceOlaEnv === 'yes';

  const googleKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  const olaKey = process.env.REACT_APP_OLA_MAPS_API_KEY || '6892e43ddb979dd4fb138b36';

  const [googleFatalError, setGoogleFatalError] = useState(false);

  // Detect runtime Google fatal errors (billing/auth/denied) and force Ola fallback
  useEffect(() => {
    function markFatal() {
      setGoogleFatalError(true);
    }
    function onError(evt) {
      try {
        const msg = (evt && (evt.message || evt.reason?.message || String(evt.reason))) || '';
        if (
          msg.includes('Google Maps JavaScript API error') ||
          msg.includes('ProjectDeniedMapError') ||
          msg.includes('BillingNotEnabledMapError') ||
          msg.includes('ApiNotActivatedMapError') ||
          msg.includes('RefererNotAllowedMapError') ||
          msg.includes('InvalidKeyMapError')
        ) {
          markFatal();
        }
      } catch (_) {}
    }

    // Global auth failure hook
    const prevAuthFailure = window.gm_authFailure;
    window.gm_authFailure = () => {
      markFatal();
      if (typeof prevAuthFailure === 'function') prevAuthFailure();
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onError);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onError);
      // do not restore gm_authFailure to avoid surprises
    };
  }, []);

  const wantsGoogle = !forceOla && !!googleKey && !googleFatalError;
  const apiType = wantsGoogle ? 'google' : 'ola';
  const apiKey = wantsGoogle ? googleKey : olaKey;

  return {
    isLoaded: true,
    loadError: null,
    apiType,
    apiKey,
    googleFatalError,
  };
};