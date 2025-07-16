// Configuración de APIs por plataforma
export const API_CONFIG = {
  lefty: {
    url: 'http://api3.prismgrp.com/', // API diferente para lefty
    // url: 'http://127.0.0.1:5001', // Descomenta para usar local
    // Si quieres que lefty use la misma API que las demás, solo cambia a null
    useDefaultApi: false
  },
  traackr: {
    useDefaultApi: true
  },
  talkwalker: {
    useDefaultApi: true
  }
};

export const DEFAULT_API_URL = 'http://apist2.prismgrp.com';
