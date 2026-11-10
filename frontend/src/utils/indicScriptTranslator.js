// Indic Script Translator & Explainer for Aapan AI Frontend
// Ensures Punjabi Gurmukhi is converted to Hindi Devanagari, English Roman script,
// and English-only explanations.

const GURMUKHI_TO_DEVANAGARI_MAP = {
  'ਅ': 'अ', 'ਆ': 'आ', 'ਇ': 'इ', 'ਈ': 'ई', 'ਉ': 'उ', 'ਊ': 'ऊ', 'ਏ': 'ए', 'ਐ': 'ऐ', 'ਓ': 'ओ', 'ਔ': 'औ',
  'ਕ': 'क', 'ਖ': 'ख', 'ਗ': 'ग', 'ਘ': 'घ', 'ਙ': 'ङ',
  'ਚ': 'च', 'ਛ': 'छ', 'ਜ': 'ज', 'ਝ': 'झ', 'ਞ': 'ञ',
  'ਟ': 'ट', 'ਠ': 'ठ', 'ਡ': 'ड', 'ਢ': 'ढ', 'ਣ': 'ण',
  'ਤ': 'त', 'ਥ': 'थ', 'ਦ': 'द', 'ਧ': 'ध', 'ਨ': 'न',
  'ਪ': 'प', 'ਫ': 'फ', 'ਬ': 'ब', 'ਭ': 'भ', 'ਮ': 'म',
  'ਯ': 'य', 'ਰ': 'र', 'ਲ': 'ल', 'ਵ': 'व', 'ਸ': 'स', 'ਹ': 'ह',
  'ਖ਼': 'ख़', 'ਗ਼': 'ग़', 'ਜ਼': 'ज़', 'ਫ਼': 'फ़', 'ਲ਼': 'ल़', 'ੜ': 'ड़',
  'ਾ': 'ा', 'ਿ': 'ि', 'ੀ': 'ी', 'ੁ': 'ु', 'ੂ': 'ू',
  'ੇ': 'े', 'ੈ': 'ै', 'ੋ': 'ो', 'ੌ': 'ौ', '੍': '्',
  'ਂ': 'ं', 'ੰ': 'ं', 'ੱ': '्'
};

const PUNJABI_DEV_OVERRIDES = {
  'ਮੈਂ': 'मैं', 'ਤੈਨੂੰ': 'तैनूं', 'ਮੈਨੂੰ': 'मैनूं', 'ਸਮਝਾਵਾਂ': 'समझावां', 'ਕੀ': 'की',
  'ਨਾ': 'ना', 'ਤੇਰੇ': 'तेरे', 'ਮੇਰੇ': 'मेरे', 'ਬਾਝੋਂ': 'बाझों', 'ਲੱਗਦਾ': 'लगदा', 'ਜੀ': 'जी',
  'ਕੋਕਾ': 'कोका', 'ਤੇਰਾ': 'तेरा', 'ਕੁੱਝ': 'कुछ', 'ਕਹਿੰਦਾ': 'कहंदा', 'ਨੀ': 'नी',
  'ਸੋਹਣੀ': 'सोहणी', 'ਕੁੜੀ': 'कुड़ी', 'ਤੂੰ': 'तू', 'ਲੱਗਦੀ': 'लगदी', 'ਕਮਾਲ': 'कमाल',
  'ਮੁੰਡਾ': 'मुंडा', 'ਅੱਖੀਆਂ': 'अखियां', 'ਦਿਲ': 'दिल', 'ਇਸ਼ਕ': 'इश्क', 'ਪਿਆਰ': 'प्यार',
  'ਜਿੰਦ': 'जिंद', 'ਜਾਨ': 'जान', 'ਯਾਰ': 'यार', 'ਵੇ': 'वे', 'ਨਾਲ': 'नाल', 'ਸਾਡੇ': 'साडे'
};

const PUNJABI_ROMAN_MAP = {
  'ਮੈਂ': 'Main', 'ਤੈਨੂੰ': 'tainu', 'ਮੈਨੂੰ': 'mainu', 'ਸਮਝਾਵਾਂ': 'samjhawan', 'ਕੀ': 'ki',
  'ਨਾ': 'na', 'ਤੇਰੇ': 'tere', 'ਮੇਰੇ': 'mere', 'ਬਾਝੋਂ': 'baajhon', 'ਲੱਗਦਾ': 'lagda', 'ਜੀ': 'jee',
  'ਕੋਕਾ': 'koka', 'ਤੇਰਾ': 'tera', 'ਕੁੱਝ': 'kujh', 'ਕਹਿੰਦਾ': 'kehnda', 'ਨੀ': 'nee',
  'ਸੋਹਣੀ': 'sohni', 'ਕੁੜੀ': 'kudi', 'ਤੂੰ': 'tu', 'ਲੱਗਦੀ': 'lagdi', 'ਕਮਾਲ': 'kamaal',
  'ਮੁੰਡਾ': 'munda', 'ਅੱਖੀਆਂ': 'akhiyan', 'ਦਿਲ': 'dil', 'ਇਸ਼ਕ': 'ishq', 'ਪਿਆਰ': 'pyaar',
  'ਜਿੰਦ': 'jind', 'ਜਾਨ': 'jaan', 'ਯਾਰ': 'yaar', 'ਵੇ': 've', 'ਨਾਲ': 'naal', 'ਸਾਡੇ': 'saade',
  // Hindi keys
  'मैं': 'Main', 'तैनूं': 'tainu', 'मैनूं': 'mainu', 'समझावां': 'samjhawan', 'की': 'ki',
  'ना': 'na', 'तेरे': 'tere', 'मेरे': 'mere', 'बाझों': 'baajhon', 'लगदा': 'lagda', 'जी': 'jee',
  'कोका': 'koka', 'तेरा': 'tera', 'कुछ': 'kuch', 'कहंदा': 'kehnda',
  'नी': 'nee', 'सोहणी': 'sohni', 'कुड़ी': 'kudi', 'तू': 'tu', 'लगदी': 'lagdi', 'कमाल': 'kamaal',
  'मुंडा': 'munda', 'अखियां': 'akhiyan', 'दिल': 'dil', 'इश्क': 'ishq', 'प्यार': 'pyaar',
  'जिंद': 'jind', 'जान': 'jaan', 'यार': 'yaar', 'वे': 've', 'नाल': 'naal'
};

export function containsGurmukhi(text) {
  if (!text) return false;
  return /[\u0A00-\u0A7F]/.test(text);
}

export function convertGurmukhiToHindi(text) {
  if (!text) return '';
  if (!containsGurmukhi(text)) return text;

  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === 'ੱ') {
      const nextCh = text[i + 1];
      if (nextCh && GURMUKHI_TO_DEVANAGARI_MAP[nextCh]) {
        out += GURMUKHI_TO_DEVANAGARI_MAP[nextCh] + '्';
      }
    } else if (GURMUKHI_TO_DEVANAGARI_MAP[ch] !== undefined) {
      out += GURMUKHI_TO_DEVANAGARI_MAP[ch];
    } else {
      out += ch;
    }
  }

  let words = out.split(' ');
  words = words.map((w) => PUNJABI_DEV_OVERRIDES[w] || w);
  return words.join(' ');
}

export function convertToEnglishRoman(text) {
  if (!text) return '';
  const words = text.split(/\s+/);
  return words.map((word) => {
    const clean = word.replace(/[,.?!:;।]/g, '');
    const punct = word.replace(/[^,.?!:;।]/g, '');
    if (PUNJABI_ROMAN_MAP[clean]) {
      return PUNJABI_ROMAN_MAP[clean] + punct;
    }

    const dev = convertGurmukhiToHindi(clean);
    return dev + punct;
  }).join(' ');
}

export function cleanEnglishLyrics(text) {
  if (!text) return '';
  const match = text.match(/"([^"]+)"/);
  if (match) return match[1];
  return text.replace(/^(Romantic Expression|Affectionate Gaze|Praise & Admiration|Companionship|English Meaning):\s*/i, '');
}

export function explainLyricsInEnglishOnly(text) {
  if (!text) return 'Meaning in English: Emotional vocal melody.';
  const roman = convertToEnglishRoman(text);

  if (/प्यार|ਇਸ਼ਕ|इश्क|दिल|ਦਿਲ|ਲਵ|love|तैनूं|ਤੈਨੂੰ/i.test(text)) {
    return `Romantic Expression: Deep emotional affection and yearning: "${roman}"`;
  }
  if (/ਅੱਖੀਆਂ|अखियां|ਨੈਣ|नैन/i.test(text)) {
    return `Affectionate Gaze: Expressing love through deep, expressive eyes: "${roman}"`;
  }
  if (/ਕੁੜੀ|कुड़ी|सोहणी|ਸੋਹਣੀ|कमाल/i.test(text)) {
    return `Praise & Admiration: Complimenting graceful beauty and captivating charm: "${roman}"`;
  }
  if (/नाल|ਨਾਲ|ਯਾਰ|यार|ਸਾਡੇ/i.test(text)) {
    return `Companionship: Cherishing timeless togetherness and loyalty: "${roman}"`;
  }
  return `English Meaning: "${roman}" conveys profound heartfelt emotions and rhythm.`;
}

