/* eslint-disable */
import React, { useState, createContext, useContext, useEffect } from 'react';

/**
 * LanguageManager - Global language/translation system
 * - Users can add their own language translations
 * - Community-driven translations
 * - Auto-detects browser language
 * - Tutorial in multiple languages explaining how to contribute translations
 */

// Language Context
export const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

// Built-in translations
const DEFAULT_TRANSLATIONS = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    translations: {
      // Navigation
      'nav.overview': 'Overview',
      'nav.photos': 'Photo Tools',
      'nav.planner': 'Content Planner',
      'nav.arvr': 'AR/VR Studio',
      'nav.influencer': 'Influencer',
      'nav.donate': 'Donate',
      'nav.language': 'Language',

      // Common
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.upload': 'Upload',
      'common.download': 'Download',
      'common.close': 'Close',
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',

      // Photo Tools
      'photos.title': 'Professional Photo Tools',
      'photos.enhance': 'Enhance',
      'photos.filters': 'Filters',
      'photos.crop': 'Auto-Crop',
      'photos.batch': 'Batch Process',
      'photos.duplicates': 'Find Duplicates',

      // Tiers
      'tier.free': 'Free Tier',
      'tier.creator': 'Creator Pro',
      'tier.superadmin': 'Mystery Tier',

      // Language Manager
      'lang.title': 'Language Settings',
      'lang.current': 'Current Language',
      'lang.contribute': 'Contribute Translation',
      'lang.tutorial': 'How to Add Your Language',
      'lang.community': 'Community Translations'
    }
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    translations: {
      'nav.overview': 'Resumen',
      'nav.photos': 'Herramientas de Fotos',
      'nav.planner': 'Planificador de Contenido',
      'nav.arvr': 'Estudio AR/VR',
      'nav.influencer': 'Influencer',
      'nav.donate': 'Donar',
      'nav.language': 'Idioma',
      'common.save': 'Guardar',
      'common.cancel': 'Cancelar',
      'common.delete': 'Eliminar',
      'common.upload': 'Subir',
      'common.download': 'Descargar',
      'photos.title': 'Herramientas Profesionales de Fotos',
      'lang.title': 'Configuración de Idioma',
      'lang.contribute': 'Contribuir Traducción'
    }
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    translations: {
      'nav.overview': '概要',
      'nav.photos': '写真ツール',
      'nav.planner': 'コンテンツプランナー',
      'nav.arvr': 'AR/VRスタジオ',
      'nav.influencer': 'インフルエンサー',
      'nav.donate': '寄付',
      'nav.language': '言語',
      'common.save': '保存',
      'common.cancel': 'キャンセル',
      'common.delete': '削除',
      'photos.title': 'プロフェッショナル写真ツール',
      'lang.title': '言語設定'
    }
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    translations: {
      'nav.overview': 'Aperçu',
      'nav.photos': 'Outils Photo',
      'nav.planner': 'Planificateur de Contenu',
      'nav.arvr': 'Studio AR/VR',
      'photos.title': 'Outils Photo Professionnels',
      'lang.title': 'Paramètres de Langue'
    }
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    translations: {
      'nav.photos': 'Foto-Tools',
      'photos.title': 'Professionelle Foto-Tools',
      'lang.title': 'Spracheinstellungen'
    }
  }
};

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [customTranslations, setCustomTranslations] = useState({});

  useEffect(() => {
    // Auto-detect browser language
    const browserLang = navigator.language.split('-')[0];
    const savedLang = localStorage.getItem('preferredLanguage');

    if (savedLang && DEFAULT_TRANSLATIONS[savedLang]) {
      setCurrentLanguage(savedLang);
    } else if (DEFAULT_TRANSLATIONS[browserLang]) {
      setCurrentLanguage(browserLang);
    }

    // Load custom translations from localStorage
    const saved = localStorage.getItem('customTranslations');
    if (saved) {
      try {
        setCustomTranslations(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load custom translations:', e);
      }
    }
  }, []);

  const changeLanguage = (langCode) => {
    setCurrentLanguage(langCode);
    localStorage.setItem('preferredLanguage', langCode);
  };

  const t = (key, fallback = key) => {
    const lang = customTranslations[currentLanguage] || DEFAULT_TRANSLATIONS[currentLanguage];
    return lang?.translations?.[key] || DEFAULT_TRANSLATIONS.en.translations[key] || fallback;
  };

  const addCustomTranslation = (langCode, langName, nativeName, flag, translations) => {
    const newCustom = {
      ...customTranslations,
      [langCode]: {
        code: langCode,
        name: langName,
        nativeName,
        flag,
        translations,
        isCustom: true
      }
    };
    setCustomTranslations(newCustom);
    localStorage.setItem('customTranslations', JSON.stringify(newCustom));
  };

  const getAllLanguages = () => {
    return { ...DEFAULT_TRANSLATIONS, ...customTranslations };
  };

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      changeLanguage,
      t,
      addCustomTranslation,
      getAllLanguages,
      languages: getAllLanguages()
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Language Settings Component
export function LanguageSettings({ userId }) {
  const { currentLanguage, changeLanguage, languages, addCustomTranslation, t } = useLanguage();
  const [showContribute, setShowContribute] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [newLang, setNewLang] = useState({
    code: '',
    name: '',
    nativeName: '',
    flag: '',
    translations: {}
  });

  const handleAddLanguage = () => {
    if (!newLang.code || !newLang.name) {
      alert('Please fill in language code and name');
      return;
    }
    addCustomTranslation(newLang.code, newLang.name, newLang.nativeName, newLang.flag, newLang.translations);
    alert(`${newLang.name} added successfully!`);
    setShowContribute(false);
    setNewLang({ code: '', name: '', nativeName: '', flag: '', translations: {} });
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '40px 20px',
      color: 'white'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '48px', marginBottom: '10px' }}>🌍 {t('lang.title', 'Language Settings')}</h1>
          <p style={{ fontSize: '18px', opacity: 0.9 }}>
            Choose your language or contribute your own translation
          </p>
        </div>

        {/* Current Language */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px'
        }}>
          <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>{t('lang.current', 'Current Language')}</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            {Object.values(languages).map(lang => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                style={{
                  background: currentLanguage === lang.code ? 'white' : 'rgba(255,255,255,0.2)',
                  color: currentLanguage === lang.code ? '#667eea' : 'white',
                  border: currentLanguage === lang.code ? '3px solid #FFD700' : '2px solid rgba(255,255,255,0.2)',
                  padding: '20px',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>{lang.flag}</div>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{lang.nativeName}</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>{lang.name}</div>
                {lang.isCustom && (
                  <div style={{ fontSize: '11px', marginTop: '5px', color: '#FFD700' }}>
                    ⭐ Community
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setShowTutorial(!showTutorial)}
            style={actionButtonStyle}
          >
            📖 {t('lang.tutorial', 'How to Add Your Language')}
          </button>
          <button
            onClick={() => setShowContribute(!showContribute)}
            style={{...actionButtonStyle, background: '#4CAF50'}}
          >
            ➕ {t('lang.contribute', 'Contribute Translation')}
          </button>
        </div>

        {/* Tutorial Section */}
        {showTutorial && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '30px',
            marginBottom: '30px'
          }}>
            <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>📖 How to Add Your Language</h3>

            {/* Multi-language tutorial */}
            <LanguageTutorial currentLang={currentLanguage} />
          </div>
        )}

        {/* Contribute Form */}
        {showContribute && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '30px',
            marginBottom: '30px'
          }}>
            <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>➕ Add Your Language</h3>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Language Code (e.g., "ko" for Korean)</label>
              <input
                type="text"
                value={newLang.code}
                onChange={(e) => setNewLang({...newLang, code: e.target.value})}
                style={inputStyle}
                placeholder="ko"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Language Name (in English)</label>
              <input
                type="text"
                value={newLang.name}
                onChange={(e) => setNewLang({...newLang, name: e.target.value})}
                style={inputStyle}
                placeholder="Korean"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Native Name (in your language)</label>
              <input
                type="text"
                value={newLang.nativeName}
                onChange={(e) => setNewLang({...newLang, nativeName: e.target.value})}
                style={inputStyle}
                placeholder="한국어"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Flag Emoji</label>
              <input
                type="text"
                value={newLang.flag}
                onChange={(e) => setNewLang({...newLang, flag: e.target.value})}
                style={inputStyle}
                placeholder="🇰🇷"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Translations (JSON format)</label>
              <textarea
                value={JSON.stringify(newLang.translations, null, 2)}
                onChange={(e) => {
                  try {
                    setNewLang({...newLang, translations: JSON.parse(e.target.value)});
                  } catch (err) {
                    // Invalid JSON, ignore
                  }
                }}
                style={{...inputStyle, minHeight: '200px', fontFamily: 'monospace'}}
                placeholder='{\n  "nav.overview": "개요",\n  "nav.photos": "사진 도구"\n}'
              />
            </div>

            <button onClick={handleAddLanguage} style={{...actionButtonStyle, width: '100%'}}>
              ✅ Add Language
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Tutorial Component with multi-language support
function LanguageTutorial({ currentLang }) {
  const tutorials = {
    en: {
      title: 'How to Contribute Translations',
      steps: [
        'Click "Contribute Translation" button above',
        'Enter your language code (2 letters, e.g., "ko" for Korean)',
        'Enter the English name of your language',
        'Enter the native name (how it\'s written in your language)',
        'Add a flag emoji for your language',
        'Translate the key phrases in JSON format',
        'Click "Add Language" to save',
        'Your language will be available immediately!'
      ],
      example: '{\n  "nav.photos": "사진 도구",\n  "common.save": "저장"\n}',
      note: 'Your translations are stored locally and will be available every time you visit!'
    },
    es: {
      title: 'Cómo Contribuir Traducciones',
      steps: [
        'Haz clic en el botón "Contribuir Traducción"',
        'Ingresa el código de tu idioma (2 letras)',
        'Ingresa el nombre en inglés de tu idioma',
        'Ingresa el nombre nativo',
        'Agrega un emoji de bandera',
        'Traduce las frases clave en formato JSON',
        'Haz clic en "Agregar Idioma"',
        '¡Tu idioma estará disponible inmediatamente!'
      ]
    },
    ja: {
      title: '翻訳の貢献方法',
      steps: [
        '上の「翻訳を貢献」ボタンをクリック',
        '言語コードを入力（2文字、例：「ko」は韓国語）',
        '言語の英語名を入力',
        'ネイティブ名を入力',
        '旗の絵文字を追加',
        'JSON形式でキーフレーズを翻訳',
        '「言語を追加」をクリック',
        '翻訳はすぐに利用可能になります！'
      ]
    }
  };

  const tutorial = tutorials[currentLang] || tutorials.en;

  return (
    <div>
      <h4 style={{ fontSize: '20px', marginBottom: '15px' }}>{tutorial.title}</h4>
      <ol style={{ paddingLeft: '20px', lineHeight: '2' }}>
        {tutorial.steps.map((step, i) => (
          <li key={i} style={{ marginBottom: '10px' }}>{step}</li>
        ))}
      </ol>
      {tutorial.example && (
        <div style={{ marginTop: '20px' }}>
          <h5 style={{ marginBottom: '10px' }}>Example:</h5>
          <pre style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '15px',
            borderRadius: '10px',
            overflow: 'auto'
          }}>
            {tutorial.example}
          </pre>
        </div>
      )}
      {tutorial.note && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: 'rgba(76, 175, 80, 0.2)',
          border: '2px solid #4CAF50',
          borderRadius: '10px'
        }}>
          📝 {tutorial.note}
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: 'bold',
  fontSize: '14px'
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: 'none',
  fontSize: '16px',
  color: '#333'
};

const actionButtonStyle = {
  background: 'white',
  color: '#667eea',
  border: 'none',
  padding: '15px 30px',
  borderRadius: '25px',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.3s'
};
