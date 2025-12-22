import React, { useState } from 'react';
import AIAssistant3D from './AIAssistant3D';

const AIAssistantCustomizer = () => {
  const [gender, setGender] = useState('female');
  const [bodyType, setBodyType] = useState('athletic');

  // Body customization
  const [height, setHeight] = useState(170); // cm
  const [weight, setWeight] = useState(60); // kg
  const [breastSize, setBreastSize] = useState(5); // 1-10
  const [breastFirmness, setBreastFirmness] = useState(7);
  const [nippleSize, setNippleSize] = useState(5);
  const [areolaDiameter, setAreolaDiameter] = useState(5);
  const [vaginaDepth, setVaginaDepth] = useState(5);
  const [labiaSizeinner, setLabiaSizeInner] = useState(5);
  const [labiaSizeOuter, setLabiaSizeOuter] = useState(5);
  const [clitorisSize, setClitorisSize] = useState(5);
  const [anusColor, setAnusColor] = useState('#f5c7b8');
  const [anusTightness, setAnusTightness] = useState(7);

  // Face customization
  const [eyeShape, setEyeShape] = useState('almond');
  const [eyeColor, setEyeColor] = useState('#4a90e2');
  const [lipSize, setLipSize] = useState(5);
  const [noseSize, setNoseSize] = useState(5);
  const [earShape, setEarShape] = useState('normal');
  const [eyebrowThickness, setEyebrowThickness] = useState(5);
  const [facialStructure, setFacialStructure] = useState('oval');

  // Skin
  const [skinTone, setSkinTone] = useState('#f5d0c0');
  const [freckles, setFreckles] = useState(0);
  const [tanLines, setTanLines] = useState(false);

  // Hair
  const [hairStyle, setHairStyle] = useState('long');
  const [hairColor, setHairColor] = useState('#2c1810');
  const [pubesStyle, setPubesStyle] = useState('trimmed');

  const presets = {
    petite: { height: 155, weight: 45, breastSize: 2, bodyType: 'petite' },
    athletic: { height: 170, weight: 60, breastSize: 5, bodyType: 'athletic' },
    curvy: { height: 165, weight: 70, breastSize: 8, bodyType: 'curvy' },
    bbw: { height: 168, weight: 95, breastSize: 10, bodyType: 'bbw' },
    tall: { height: 185, weight: 65, breastSize: 6, bodyType: 'tall' },
    slim: { height: 175, weight: 52, breastSize: 3, bodyType: 'slim' },
  };

  const applyPreset = (presetName) => {
    const preset = presets[presetName];
    setHeight(preset.height);
    setWeight(preset.weight);
    setBreastSize(preset.breastSize);
    setBodyType(preset.bodyType);
  };

  // Prepare customization object for 3D model
  const customization = {
    gender,
    height,
    weight,
    skinColor: skinTone,
    breastSize,
    breastFirmness,
    nippleSize,
    nippleColor: '#e8a598',
    vaginaDepth,
    labiaSizeInner: labiaSizeinner,
    labiaSizeOuter,
    clitorisSize,
    penisLength: 5,
    penisGirth: 5,
    anusColor,
    anusTightness,
    eyeShape,
    eyeColor,
    lipSize,
    lipColor: '#d4757d',
    noseSize,
    hairStyle,
    hairColor,
    hairLength: hairStyle === 'long' ? 10 : 5,
    muscleTone: 5,
    bodyFat: weight / 20,
    shoulderWidth: 5,
    hipWidth: 5,
    legLength: 5,
    toenailColor: '#ffb3c6',
    fingernailColor: '#ffb3c6',
    pubicHairStyle: pubesStyle,
    pubicHairColor: hairColor,
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎨 AI Assistant Customizer</h1>
      <p style={styles.subtitle}>Create your perfect companion - fully customizable</p>

      {/* 3D Preview */}
      <div style={styles.section}>
        <h2>Live Preview</h2>
        <AIAssistant3D customization={customization} />
      </div>

      {/* Gender Selection */}
      <div style={styles.section}>
        <h2>Gender</h2>
        <div style={styles.buttonGroup}>
          <button
            onClick={() => setGender('female')}
            style={{...styles.genderBtn, ...(gender === 'female' ? styles.active : {})}}
          >
            ♀️ Female
          </button>
          <button
            onClick={() => setGender('male')}
            style={{...styles.genderBtn, ...(gender === 'male' ? styles.active : {})}}
          >
            ♂️ Male
          </button>
          <button
            onClick={() => setGender('both')}
            style={{...styles.genderBtn, ...(gender === 'both' ? styles.active : {})}}
          >
            ⚧ Both (Futa)
          </button>
        </div>
      </div>

      {/* Body Presets */}
      <div style={styles.section}>
        <h2>Quick Presets</h2>
        <div style={styles.presetGrid}>
          {Object.keys(presets).map(presetName => (
            <button
              key={presetName}
              onClick={() => applyPreset(presetName)}
              style={styles.presetBtn}
            >
              {presetName.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Body Measurements */}
      <div style={styles.section}>
        <h2>Body Measurements</h2>

        <div style={styles.slider}>
          <label>Height: {height} cm</label>
          <input
            type="range"
            min="140"
            max="200"
            value={height}
            onChange={(e) => setHeight(parseInt(e.target.value))}
            style={styles.rangeInput}
          />
        </div>

        <div style={styles.slider}>
          <label>Weight: {weight} kg</label>
          <input
            type="range"
            min="40"
            max="120"
            value={weight}
            onChange={(e) => setWeight(parseInt(e.target.value))}
            style={styles.rangeInput}
          />
        </div>
      </div>

      {/* Breast Customization (Female/Both only) */}
      {(gender === 'female' || gender === 'both') && (
        <div style={styles.section}>
          <h2>Breast Customization</h2>

          <div style={styles.slider}>
            <label>Breast Size: {breastSize}/10</label>
            <input type="range" min="1" max="10" value={breastSize} onChange={(e) => setBreastSize(parseInt(e.target.value))} style={styles.rangeInput} />
          </div>

          <div style={styles.slider}>
            <label>Firmness: {breastFirmness}/10</label>
            <input type="range" min="1" max="10" value={breastFirmness} onChange={(e) => setBreastFirmness(parseInt(e.target.value))} style={styles.rangeInput} />
          </div>

          <div style={styles.slider}>
            <label>Nipple Size: {nippleSize}/10</label>
            <input type="range" min="1" max="10" value={nippleSize} onChange={(e) => setNippleSize(parseInt(e.target.value))} style={styles.rangeInput} />
          </div>

          <div style={styles.slider}>
            <label>Areola Diameter: {areolaDiameter}/10</label>
            <input type="range" min="1" max="10" value={areolaDiameter} onChange={(e) => setAreolaDiameter(parseInt(e.target.value))} style={styles.rangeInput} />
          </div>
        </div>
      )}

      {/* Genital Customization (Female/Both only) */}
      {(gender === 'female' || gender === 'both') && (
        <div style={styles.section}>
          <h2>Genital Customization (18+)</h2>

          <div style={styles.slider}>
            <label>Vagina Depth: {vaginaDepth}/10</label>
            <input type="range" min="1" max="10" value={vaginaDepth} onChange={(e) => setVaginaDepth(parseInt(e.target.value))} style={styles.rangeInput} />
          </div>

          <div style={styles.slider}>
            <label>Inner Labia Size: {labiaSizeinner}/10</label>
            <input type="range" min="1" max="10" value={labiaSizeinner} onChange={(e) => setLabiaSizeInner(parseInt(e.target.value))} style={styles.rangeInput} />
          </div>

          <div style={styles.slider}>
            <label>Outer Labia Size: {labiaSizeOuter}/10</label>
            <input type="range" min="1" max="10" value={labiaSizeOuter} onChange={(e) => setLabiaSizeOuter(parseInt(e.target.value))} style={styles.rangeInput} />
          </div>

          <div style={styles.slider}>
            <label>Clitoris Size: {clitorisSize}/10</label>
            <input type="range" min="1" max="10" value={clitorisSize} onChange={(e) => setClitorisSize(parseInt(e.target.value))} style={styles.rangeInput} />
          </div>
        </div>
      )}

      {/* Anus Customization */}
      <div style={styles.section}>
        <h2>Anus Customization</h2>

        <div style={styles.slider}>
          <label>Tightness: {anusTightness}/10</label>
          <input type="range" min="1" max="10" value={anusTightness} onChange={(e) => setAnusTightness(parseInt(e.target.value))} style={styles.rangeInput} />
        </div>

        <div style={styles.slider}>
          <label>Color</label>
          <input type="color" value={anusColor} onChange={(e) => setAnusColor(e.target.value)} style={styles.colorPicker} />
        </div>
      </div>

      {/* Face Customization */}
      <div style={styles.section}>
        <h2>Face Customization</h2>

        <div style={styles.slider}>
          <label>Eye Shape</label>
          <select value={eyeShape} onChange={(e) => setEyeShape(e.target.value)} style={styles.select}>
            <option value="almond">Almond</option>
            <option value="round">Round</option>
            <option value="cat">Cat Eyes</option>
            <option value="hooded">Hooded</option>
          </select>
        </div>

        <div style={styles.slider}>
          <label>Eye Color</label>
          <input type="color" value={eyeColor} onChange={(e) => setEyeColor(e.target.value)} style={styles.colorPicker} />
        </div>

        <div style={styles.slider}>
          <label>Lip Size: {lipSize}/10</label>
          <input type="range" min="1" max="10" value={lipSize} onChange={(e) => setLipSize(parseInt(e.target.value))} style={styles.rangeInput} />
        </div>

        <div style={styles.slider}>
          <label>Nose Size: {noseSize}/10</label>
          <input type="range" min="1" max="10" value={noseSize} onChange={(e) => setNoseSize(parseInt(e.target.value))} style={styles.rangeInput} />
        </div>

        <div style={styles.slider}>
          <label>Eyebrow Thickness: {eyebrowThickness}/10</label>
          <input type="range" min="1" max="10" value={eyebrowThickness} onChange={(e) => setEyebrowThickness(parseInt(e.target.value))} style={styles.rangeInput} />
        </div>
      </div>

      {/* Skin */}
      <div style={styles.section}>
        <h2>Skin</h2>

        <div style={styles.slider}>
          <label>Skin Tone</label>
          <input type="color" value={skinTone} onChange={(e) => setSkinTone(e.target.value)} style={styles.colorPicker} />
        </div>

        <div style={styles.slider}>
          <label>Freckles: {freckles}/10</label>
          <input type="range" min="0" max="10" value={freckles} onChange={(e) => setFreckles(parseInt(e.target.value))} style={styles.rangeInput} />
        </div>

        <div style={styles.checkbox}>
          <label>
            <input type="checkbox" checked={tanLines} onChange={(e) => setTanLines(e.target.checked)} />
            Tan Lines
          </label>
        </div>
      </div>

      {/* Hair */}
      <div style={styles.section}>
        <h2>Hair</h2>

        <div style={styles.slider}>
          <label>Hair Style</label>
          <select value={hairStyle} onChange={(e) => setHairStyle(e.target.value)} style={styles.select}>
            <option value="long">Long</option>
            <option value="short">Short (Pixie)</option>
            <option value="ponytail">Ponytail</option>
            <option value="bun">Bun</option>
            <option value="braids">Braids</option>
            <option value="mohawk">Mohawk</option>
          </select>
        </div>

        <div style={styles.slider}>
          <label>Hair Color</label>
          <input type="color" value={hairColor} onChange={(e) => setHairColor(e.target.value)} style={styles.colorPicker} />
        </div>

        <div style={styles.slider}>
          <label>Pubic Hair Style</label>
          <select value={pubesStyle} onChange={(e) => setPubesStyle(e.target.value)} style={styles.select}>
            <option value="none">None (Shaved)</option>
            <option value="trimmed">Trimmed</option>
            <option value="landing-strip">Landing Strip</option>
            <option value="full">Full Bush</option>
          </select>
        </div>
      </div>

      <button style={styles.saveBtn}>
        💾 Save Customization ($0 for VIP, $2.99 for others)
      </button>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '900px',
    margin: '0 auto',
    background: '#1a1a2e',
    color: 'white',
    minHeight: '100vh',
  },
  title: {
    fontSize: '2.5rem',
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  subtitle: {
    textAlign: 'center',
    color: '#aaa',
    marginBottom: '3rem',
  },
  section: {
    background: 'rgba(255,255,255,0.05)',
    padding: '2rem',
    borderRadius: '12px',
    marginBottom: '2rem',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  genderBtn: {
    flex: 1,
    padding: '1rem',
    fontSize: '1.1rem',
    border: '2px solid #667eea',
    background: 'transparent',
    color: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  active: {
    background: '#667eea',
  },
  presetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '1rem',
  },
  presetBtn: {
    padding: '1rem',
    border: '2px solid #10b981',
    background: 'transparent',
    color: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s',
  },
  slider: {
    marginBottom: '1.5rem',
  },
  rangeInput: {
    width: '100%',
    marginTop: '0.5rem',
  },
  colorPicker: {
    width: '100%',
    height: '50px',
    marginTop: '0.5rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    marginTop: '0.5rem',
    background: '#2d2d44',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
  },
  checkbox: {
    marginTop: '1rem',
  },
  saveBtn: {
    width: '100%',
    padding: '1.5rem',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    marginTop: '2rem',
  },
};

export default AIAssistantCustomizer;
