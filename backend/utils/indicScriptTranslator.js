// Indic Script Translator & Explainer for Aapan AI
// Converts Punjabi Gurmukhi & Indic dialects to Hindi Devanagari, English Roman script,
// and provides rich English-only meaning explanations.

const GURMUKHI_TO_DEVANAGARI_MAP = {
  // Vowels
  'ਅ': 'अ', 'ਆ': 'आ', 'ਇ': 'इ', 'ਈ': 'ई', 'ਉ': 'उ', 'ਊ': 'ऊ', 'ਏ': 'ए', 'ਐ': 'ऐ', 'ਓ': 'ओ', 'ਔ': 'औ',
  // Consonants
  'ਕ': 'क', 'ਖ': 'ख', 'ਗ': 'ग', 'ਘ': 'घ', 'ਙ': 'ङ',
  'ਚ': 'च', 'ਛ': 'छ', 'ਜ': 'ज', 'ਝ': 'झ', 'ਞ': 'ञ',
  'ਟ': 'ट', 'ਠ': 'ठ', 'ਡ': 'ड', 'ਢ': 'ढ', 'ਣ': 'ण',
  'ਤ': 'त', 'ਥ': 'थ', 'द': 'द', 'ਧ': 'ध', 'ਨ': 'न',
  'ਪ': 'प', 'ਫ': 'फ', 'ਬ': 'ब', 'ਭ': 'भ', 'ਮ': 'म',
  'ਯ': 'य', 'ਰ': 'र', 'ਲ': 'ल', 'ਵ': 'व', 'ਸ': 'स', 'ਹ': 'ह',
  // Nukta consonants
  'ਖ਼': 'ख़', 'ਗ਼': 'ग़', 'ਜ਼': 'ज़', 'ਫ਼': 'फ़', 'ਲ਼': 'ल़', 'ੜ': 'ड़',
  // Vowel signs (Matras)
  'ਾ': 'ा', 'ਿ': 'ि', 'ੀ': 'ी', 'ੁ': 'ु', 'ੂ': 'ू',
  'ੇ': 'े', 'ੈ': 'ै', 'ੋ': 'ो', 'ੌ': 'ौ', '੍': '्',
  // Modifiers
  'ਂ': 'ं', 'ੰ': 'ं', 'ੱ': '्'
};

const PUNJABI_DEV_OVERRIDES = {
  'ਮੈਂ': 'मैं', 'ਤੈਨੂੰ': 'तैनूं', 'ਮੈਨੂੰ': 'मैनूं', 'ਸਮਝਾਵਾਂ': 'समझावां', 'ਕੀ': 'की',
  'ਨਾ': 'ना', 'ਤੇਰੇ': 'तेरे', 'ਮੇਰੇ': 'मेरे', 'ਬਾਝੋਂ': 'बाझों', 'ਲੱਗਦਾ': 'लगदा', 'ਜੀ': 'जी',
  'ਕੋਕਾ': 'कोका', 'ਤੇਰਾ': 'तेरा', 'ਕੁੱਝ': 'कुछ', 'ਕਹਿੰਦਾ': 'कहंदा', 'ਨੀ': 'नी',
  'ਸੋਹਣੀ': 'सोहणी', 'ਕੁੜੀ': 'कुड़ी', 'ਤੂੰ': 'तू', 'ਲੱਗਦੀ': 'लगदी', 'ਕਮਾਲ': 'कमाल',
  'ਮੁੰਡਾ': 'मुंडा', 'ਅੱਖੀਆਂ': 'अखियां', 'ਦਿਲ': 'दिल', 'ਇਸ਼ਕ': 'इश्क', 'ਪਿਆਰ': 'प्यार',
  'ਜਿੰਦ': 'जिंद', 'ਜਾਨ': 'जान', 'ਯਾਰ': 'यार', 'ਵੇ': 'वे', 'ਨਾਲ': 'नाल', 'ਸਾਡੇ': 'साडे',
  'ਤੁਹਾਡੇ': 'तुहाडे', 'ਗੱਲ': 'गल', 'ਬਾਤ': 'बात', 'ਰੱਬ': 'रब', 'ਰੱਬਾ': 'रब्बा', 'ਰਾਂਝਾ': 'रांझा',
  'ਹੀਰ': 'हीर', 'ਮਾਹੀ': 'माही', 'ਢੋਲ': 'ढोल', 'ਨੱਚ': 'नच', 'ਭੰਗੜਾ': 'भंगड़ा', 'ਗਿੱਧਾ': 'गिद्धा'
};

const PUNJABI_ROMAN_MAP = {
  // Gurmukhi to Roman
  'ਮੈਂ': 'Main', 'ਤੈਨੂੰ': 'tainu', 'ਮੈਨੂੰ': 'mainu', 'ਸਮਝਾਵਾਂ': 'samjhawan', 'ਕੀ': 'ki',
  'ਨਾ': 'na', 'ਤੇਰੇ': 'tere', 'ਮੇਰੇ': 'mere', 'ਬਾਝੋਂ': 'baajhon', 'ਲੱਗਦਾ': 'lagda', 'ਜੀ': 'jee',
  'ਕੋਕਾ': 'koka', 'ਤੇਰਾ': 'tera', 'ਕੁੱਝ': 'kujh', 'ਕਹਿੰਦਾ': 'kehnda', 'ਨੀ': 'nee',
  'ਸੋਹਣੀ': 'sohni', 'ਕੁੜੀ': 'kudi', 'ਤੂੰ': 'tu', 'ਲੱਗਦੀ': 'lagdi', 'ਕਮਾਲ': 'kamaal',
  'ਮੁੰਡਾ': 'munda', 'ਅੱਖੀਆਂ': 'akhiyan', 'ਦਿਲ': 'dil', 'ਇਸ਼ਕ': 'ishq', 'ਪਿਆਰ': 'pyaar',
  'ਜਿੰਦ': 'jind', 'ਜਾਨ': 'jaan', 'ਯਾਰ': 'yaar', 'ਵੇ': 've', 'ਨਾਲ': 'naal', 'ਸਾਡੇ': 'saade',
  'ਗੱਲ': 'gall', 'ਰੱਬਾ': 'rabba', 'ਰਾਂਝਾ': 'Ranjha', 'ਹੀਰ': 'Heer', 'ਮਾਹੀ': 'maahi',
  // Hindi to Roman
  'मैं': 'Main', 'तैनूं': 'tainu', 'मैनूं': 'mainu', 'समझावां': 'samjhawan', 'की': 'ki',
  'ना': 'na', 'तेरे': 'tere', 'मेरे': 'mere', 'बाझों': 'baajhon', 'लगदा': 'lagda', 'जी': 'jee',
  'कोका': 'koka', 'तेरा': 'tera', 'कुछ': 'kuch', 'कहंदा': 'kehnda', 'कहता': 'kehta',
  'नी': 'nee', 'सोहणी': 'sohni', 'कुड़ी': 'kudi', 'तू': 'tu', 'लगदी': 'lagdi', 'कमाल': 'kamaal',
  'मुंडा': 'munda', 'अखियां': 'akhiyan', 'दिल': 'dil', 'इश्क': 'ishq', 'प्यार': 'pyaar',
  'जिंद': 'jind', 'जान': 'jaan', 'यार': 'yaar', 'वे': 've', 'नाल': 'naal', 'साडे': 'saade',
  'गल': 'gall', 'रब्बा': 'rabba', 'माही': 'maahi', 'ढोल': 'dhol', 'नच': 'nach',
  'केसरिया': 'Kesariya', 'पिया': 'piya', 'रंग': 'rang', 'हाथ': 'haath', 'लगाऊं': 'lagaun',
  'फिक्र': 'fikr', 'खैर': 'khair', 'मनाऊं': 'manaun', 'कबीरा': 'Kabira', 'फकीरा': 'Fakeera',
  'जय': 'Jai', 'हो': 'Ho', 'आजा': 'aaja', 'शामियाने': 'shaamiyane', 'तले': 'tale'
};

const PUNJABI_ENGLISH_DICTIONARY = [
  { match: /(ਤੈਨੂੰ|तैनूं).*(ਸਮਝਾਵਾਂ|समझावां)/i, exp: "How do I make you understand my feelings and heartfelt love" },
  { match: /(ਬਾਝੋਂ|बाझों).*(ਲੱਗਦਾ|लगदा|ਜੀ|जी)/i, exp: "Without you by my side, my heart finds no peace or sanctuary" },
  { match: /(ਕੋਕਾ|कोका).*(ਕਹਿੰਦਾ|कहंदा|कहता)/i, exp: "Your sparkling golden nose pin whispers playful charm and attraction" },
  { match: /(ਸੋਹਣੀ|सोहणी).*(ਕੁੜੀ|कुड़ी)/i, exp: "You are an extraordinarily gorgeous girl looking absolutely stunning" },
  { match: /(ਅੱਖੀਆਂ|अखियां).*(ਲੜ|लड़|ਵੇਖ|देख)/i, exp: "Our eyes met tenderly, casting a sweet romantic spell" },
  { match: /(ਮੁੰਡਾ|मुंडा).*(ਪਿੱਛੇ|दीवाना)/i, exp: "This young boy is completely charmed and head over heels for you" },
  { match: /(ਜਿੰਦ|जिंद).*(ਜਾਨ|जान)/i, exp: "You are the very life and breath of my entire soul" },
  { match: /(ਤੇਰੇ|तेरे).*(ਨਾਲ਼|ਨਾਲ|नाल)/i, exp: "My heart is tied with you forever in love and devotion" },
  { match: /(ਕੇਸਰੀਆ|केसरिया).*(ਇਸ਼ਕ|इश्क|ਪਿਆ|पिया)/i, exp: "Your love is saffron-hued, beloved; touching it colors my entire spirit" },
  { match: /(ਕਬੀਰਾ|कबीरा).*(ਮਾਨ|मान)/i, exp: "Oh wandering mystic Kabir, listen and come back home to love" },
  { match: /(ਜੈ|जय).*(ਹੋ|हो)/i, exp: "May victory and glorious triumph be yours forever" }
];

/**
 * Checks if text contains Gurmukhi (Punjabi) characters
 */
function containsGurmukhi(text) {
  if (!text) return false;
  return /[\u0A00-\u0A7F]/.test(text);
}

/**
 * Converts Gurmukhi script to Hindi (Devanagari script)
 */
function convertGurmukhiToHindi(text) {
  if (!text) return '';
  if (!containsGurmukhi(text)) return text;

  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === 'ੱ') {
      // Addak in Gurmukhi: doubles the following consonant in Devanagari
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

  // Clean common word endings
  let words = out.split(' ');
  words = words.map(w => PUNJABI_DEV_OVERRIDES[w] || w);
  return words.join(' ');
}

/**
 * Converts Indic (Punjabi Gurmukhi or Devanagari) to clean Roman script (English letters)
 */
function convertToEnglishRoman(text) {
  if (!text) return '';

  const words = text.split(/\s+/);
  return words.map(word => {
    const clean = word.replace(/[,.?!:;।]/g, '');
    const punct = word.replace(/[^,.?!:;।]/g, '');

    if (PUNJABI_ROMAN_MAP[clean]) {
      return PUNJABI_ROMAN_MAP[clean] + punct;
    }

    // Fallback phonetic romanization
    let roman = '';
    const devWord = convertGurmukhiToHindi(clean);
    const romanConsonants = {
      'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh',
      'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n', 'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
      'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm', 'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
      'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h', 'ड़': 'r', 'ज़': 'z', 'फ़': 'f', 'ख़': 'kh'
    };
    const romanMatras = {
      'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
      'ं': 'n', '्': ''
    };
    const romanVowels = {
      'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au'
    };

    for (let j = 0; j < devWord.length; j++) {
      const c = devWord[j];
      const nextC = devWord[j + 1];

      if (romanVowels[c]) {
        roman += romanVowels[c];
      } else if (romanConsonants[c]) {
        roman += romanConsonants[c];
        if (nextC && romanMatras[nextC] !== undefined) {
          roman += romanMatras[nextC];
          j++; // skip matra
        } else if (nextC === '्') {
          j++; // half letter
        } else if (nextC && romanConsonants[nextC]) {
          roman += 'a'; // inherent schwa
        }
      } else if (romanMatras[c]) {
        roman += romanMatras[c];
      } else {
        roman += c;
      }
    }

    return (roman || word) + punct;
  }).join(' ');
}

/**
 * Explains the meaning of Punjabi/Hindi lyrics strictly in English
 */
function explainLyricsInEnglishOnly(text) {
  if (!text) return 'Meaning explained in clear English.';

  // Check dictionary of common Punjabi poetic phrases
  for (const item of PUNJABI_ENGLISH_DICTIONARY) {
    if (item.match.test(text)) {
      return item.exp;
    }
  }

  // Meaningful semantic translation heuristics
  const hindiText = convertGurmukhiToHindi(text);
  const romanText = convertToEnglishRoman(text);

  if (/प्यार|ਇਸ਼ਕ|इश्क|दिल|ਦਿਲ|ਲਵ|love/i.test(text)) {
    return `Expressing passionate devotion and deep emotional love: "${romanText}"`;
  }
  if (/अखियां|ਅੱਖੀਆਂ|ਨੈਣ|नैन/i.test(text)) {
    return `Captivating eyes expressing deep longing and affectionate gaze: "${romanText}"`;
  }
  if (/ਕੁੜੀ|कुड़ी|सोहणी|ਸੋਹਣੀ|कमाल/i.test(text)) {
    return `Admiring the radiant beauty, grace, and charming presence of the beloved: "${romanText}"`;
  }
  if (/नाल|ਨਾਲ|ਯਾਰ|यार|ਸਾਡੇ/i.test(text)) {
    return `Yearning for togetherness and eternal companionship: "${romanText}"`;
  }
  if (/नच|ਨੱਚ|ਭੰਗੜਾ|भंगड़ा|ढोल/i.test(text)) {
    return `Celebration of joy, rhythmic dance, and vibrant musical energy: "${romanText}"`;
  }

  return `Meaning in English: "${romanText}" conveys heartfelt emotion and poetic expression.`;
}

module.exports = {
  containsGurmukhi,
  convertGurmukhiToHindi,
  convertToEnglishRoman,
  explainLyricsInEnglishOnly
};

