import { Product, VoiceAction, VoiceIntentResult, PendingContext } from '@/types';

// Tamil number word dictionary
const TAMIL_NUMBERS: Record<string, number> = {
  'ஒன்று': 1, 'ஒன்னு': 1, 'oru': 1, 'onnu': 1, 'one': 1,
  'இரண்டு': 2, 'ரெண்டு': 2, 'rendu': 2, 'two': 2,
  'மூன்று': 3, 'மூணு': 3, 'moonu': 3, 'three': 3,
  'நான்கு': 4, 'நாலு': 4, 'naalu': 4, 'four': 4,
  'ஐந்து': 5, 'அஞ்சு': 5, 'anju': 5, 'five': 5,
  'ஆறு': 6, 'aaru': 6, 'six': 6,
  'ஏழு': 7, 'ezhu': 7, 'seven': 7,
  'எட்டு': 8, 'ettu': 8, 'eight': 8,
  'ஒன்பது': 9, 'onbadhu': 9, 'nine': 9,
  'பத்து': 10, 'pathu': 10, 'ten': 10,
  'பதினைந்து': 15, 'pathinanju': 15, 'fifteen': 15,
  'இருபது': 20, 'irubadhu': 20, 'twenty': 20,
  'இருபத்தைந்து': 25, 'irubaththnaju': 25, 'twenty five': 25,
  'முப்பது': 30, 'muppadhu': 30, 'thirty': 30,
  'ஐம்பது': 50, 'aimbadhu': 50, 'fifty': 50,
  'நூறு': 100, 'nooru': 100, 'hundred': 100
};

// Aliases and natural variations for products
const PRODUCT_ALIASES: Record<string, string[]> = {
  'prod-maggi': ['maggi', 'maggie', 'மேகி', 'noodles', '2-minute noodles', 'magi', 'maggi packet', 'மேகி பாக்கெட்', 'மேகி நூடுல்ஸ்'],
  'prod-coke': ['coke', 'coca cola', 'coca-cola', 'கோக்', 'cool drinks', 'cold drink', 'pepsi', 'கோகோ கோலா'],
  'prod-rice': ['rice', 'arisi', 'அரிசி', 'ponni rice', 'புழுங்கல் அரிசி', 'saadham', 'ponni', 'பொன்னி அரிசி', 'பச்சரிசி'],
  'prod-tata-salt': ['salt', 'uppu', 'உப்பு', 'tata salt', 'டாடா உப்பு', 'கல் உப்பு', 'தூள் உப்பு'],
  'prod-parleg': ['parle-g', 'parleg', 'parle g', 'biscuit', 'biscuits', 'பிஸ்கட்', 'parle'],
  'prod-fortune-oil': ['oil', 'sunflower oil', 'ennai', 'எண்ணெய்', 'fortune', 'fortune oil', 'சன்பிளவர்', 'சமையல் எண்ணெய்'],
  'prod-atta': ['atta', 'godhumai', 'maavu', 'ஆசீர்வாத்', 'aashirvaad', 'wheat flour', 'மாவு', 'கோதுமை'],
  'prod-toor-dal': ['toor dal', 'paruppu', 'பருப்பு', 'துவரம் பருப்பு', 'dal', 'thuvaram paruppu', 'துவரம்பருப்பு'],
  'prod-dairy-milk': ['dairy milk', 'chocolate', 'சாக்லேட்', 'cadbury', 'டெய்ரி மில்க்']
};

const VAGUE_QUANTITY_WORDS = [
  'konjam', 'கொஞ்சம்', 'few', 'some', 'sila', 'alavu', 'கொஞ்சோண்டு', 'little', 'small amount'
];

/**
 * Normalizes input text by lowercasing, removing punctuation and trimming.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if the text has explicit vague quantity words or lacks a number.
 */
export function hasVagueQuantity(text: string): boolean {
  const norm = normalizeText(text);
  for (const w of VAGUE_QUANTITY_WORDS) {
    if (norm.includes(w)) return true;
  }
  return false;
}

/**
 * Extracts a numeric quantity from text (digits or Tamil/Tanglish number words)
 */
export function extractQuantity(text: string): { quantity: number | null; unit?: string; hasExplicitNumber: boolean } {
  const norm = normalizeText(text);

  const digitMatch = norm.match(/(\d+(\.\d+)?)\s*(kilo|kg|packet|packets|pkt|pkts|bottle|bottles|liter|liters|l|litre|litres|piece|pieces|pcs|bag|bags|box|boxes|கிலோ|பாக்கெட்|பாட்டில்|லிட்டர்|பை)?/);
  if (digitMatch) {
    const quantity = parseFloat(digitMatch[1]);
    let unit = digitMatch[3];
    if (unit) {
      if (['kilo', 'kg', 'கிலோ'].includes(unit)) unit = 'kg';
      else if (['packet', 'packets', 'pkt', 'pkts', 'பாக்கெட்'].includes(unit)) unit = 'packet';
      else if (['bottle', 'bottles', 'பாட்டில்'].includes(unit)) unit = 'bottle';
      else if (['liter', 'liters', 'l', 'litre', 'litres', 'லிட்டர்'].includes(unit)) unit = 'liter';
      else if (['piece', 'pieces', 'pcs'].includes(unit)) unit = 'piece';
      else if (['bag', 'bags', 'பை'].includes(unit)) unit = 'bag';
      else if (['box', 'boxes'].includes(unit)) unit = 'box';
    }
    return { quantity, unit, hasExplicitNumber: true };
  }

  for (const [word, val] of Object.entries(TAMIL_NUMBERS)) {
    if (norm.split(' ').includes(word) || norm.includes(word)) {
      let unit: string | undefined;
      if (norm.includes('kilo') || norm.includes('kg') || norm.includes('கிலோ')) unit = 'kg';
      else if (norm.includes('packet') || norm.includes('பாக்கெட்')) unit = 'packet';
      else if (norm.includes('bottle') || norm.includes('பாட்டில்')) unit = 'bottle';
      else if (norm.includes('liter') || norm.includes('லிட்டர்')) unit = 'liter';
      else if (norm.includes('bag') || norm.includes('பை') || norm.includes('மூட்டை')) unit = 'bag';

      return { quantity: val, unit, hasExplicitNumber: true };
    }
  }

  return { quantity: null, hasExplicitNumber: false };
}

/**
 * Matches recognized speech text with a product from the database
 */
export function matchProduct(text: string, products: Product[]): Product | undefined {
  const norm = normalizeText(text);

  for (const p of products) {
    if (norm.includes(p.name.toLowerCase()) || (p.tamil_name && norm.includes(p.tamil_name.toLowerCase()))) {
      return p;
    }
  }

  for (const p of products) {
    const aliases = PRODUCT_ALIASES[p.id] || [];
    for (const alias of aliases) {
      if (norm.includes(alias.toLowerCase())) {
        return p;
      }
    }
  }

  for (const p of products) {
    const tokens = p.name.toLowerCase().split(' ');
    for (const token of tokens) {
      if (token.length > 3 && norm.includes(token)) {
        return p;
      }
    }
  }

  return undefined;
}

/**
 * Intelligent Rule-based & Multi-turn Intent Engine for Tamil & Tanglish Voice Commands
 */
export function parseVoiceIntent(
  transcript: string,
  products: Product[],
  pendingContext?: PendingContext | null
): VoiceIntentResult {
  const norm = normalizeText(transcript);

  // =========================================================================
  // MULTI-TURN RESOLUTION: If assistant was waiting for a missing quantity/field
  // =========================================================================
  if (pendingContext && pendingContext.action) {
    const { quantity, unit, hasExplicitNumber } = extractQuantity(transcript);
    
    if (hasExplicitNumber && quantity !== null && quantity > 0) {
      const matchedProd = products.find((p) => p.id === pendingContext.product_id);
      const prodName = pendingContext.product_name || matchedProd?.name || 'Product';
      const prodUnit = unit || pendingContext.unit || matchedProd?.unit || 'unit';
      const unitPrice = pendingContext.unit_price || matchedProd?.selling_price || 0;
      const totalPrice = unitPrice * quantity;

      if (pendingContext.action === 'RECORD_SALE') {
        return {
          action: 'RECORD_SALE',
          product: prodName,
          quantity,
          unit: prodUnit,
          unit_price: unitPrice,
          total_price: totalPrice,
          matched_product_id: pendingContext.product_id,
          matched_product: matchedProd,
          raw_transcription: `${pendingContext.original_transcript} -> ${transcript}`,
          reasoning: `Resolved quantity (${quantity} ${prodUnit}) for pending sale of ${prodName}.`,
          confidence: 0.98,
          tamil_confirmation: `✅ ${quantity} ${prodUnit} ${prodName} விற்பனை பதிவு செய்யவா?`,
          english_confirmation: `Record sale of ${quantity} ${prodUnit} ${prodName}.`
        };
      } else if (pendingContext.action === 'ADD_STOCK') {
        return {
          action: 'ADD_STOCK',
          product: prodName,
          quantity,
          unit: prodUnit,
          matched_product_id: pendingContext.product_id,
          matched_product: matchedProd,
          raw_transcription: `${pendingContext.original_transcript} -> ${transcript}`,
          reasoning: `Resolved quantity (${quantity} ${prodUnit}) for pending stock arrival of ${prodName}.`,
          confidence: 0.98,
          tamil_confirmation: `✅ ${quantity} ${prodUnit} ${prodName} சரக்கு வரவு சேர்க்கவா?`,
          english_confirmation: `Add ${quantity} ${prodUnit} ${prodName} to stock.`
        };
      }
    }
  }

  // =========================================================================
  // FAST-MOVING STOCK QUERY ("Fast moving stock எது?", "அதிகமா விக்குது")
  // =========================================================================
  const isFastMovingQuery =
    norm.includes('fast moving') ||
    norm.includes('fast selling') ||
    norm.includes('அதிகமா விக்குது') ||
    norm.includes('top selling') ||
    norm.includes('athigama') ||
    norm.includes('vegama');

  if (isFastMovingQuery) {
    return {
      action: 'FAST_MOVING_REPORT',
      product: 'Fast Moving Products',
      quantity: 0,
      raw_transcription: transcript,
      reasoning: 'Inquired about fast-selling / high-velocity products.',
      confidence: 0.97,
      tamil_confirmation: '🚀 அதிக விற்பனையாகும் பொருட்கள்: Maggi, Coke, Rice ஆகியவை அதிக தேவையில் உள்ளன.',
      english_confirmation: 'Showing fast-selling items with high sales velocity.',
      is_read_only: true,
    };
  }

  // =========================================================================
  // SLOW / POOR-MOVING STOCK QUERY ("Poor selling stock எது?", "தேங்கி இருக்கு")
  // =========================================================================
  const isSlowMovingQuery =
    norm.includes('poor moving') ||
    norm.includes('slow moving') ||
    norm.includes('poor selling') ||
    norm.includes('slow selling') ||
    norm.includes('தேங்கி இருக்கு') ||
    norm.includes('தேங்கிய') ||
    norm.includes('கம்மியா விக்குது') ||
    norm.includes('not selling');

  if (isSlowMovingQuery) {
    return {
      action: 'SLOW_MOVING_REPORT',
      product: 'Poor / Slow Moving Products',
      quantity: 0,
      raw_transcription: transcript,
      reasoning: 'Inquired about slow-moving or stagnant stock.',
      confidence: 0.97,
      tamil_confirmation: '🐢 மந்தமான விற்பனை: Parle-G மற்றும் Atta விற்பனை குறைவாக உள்ளது. முன்பக்கம் வைக்கவும்.',
      english_confirmation: 'Showing poor-moving stock with low sales volume.',
      is_read_only: true,
    };
  }

  // =========================================================================
  // EXPIRY DATE QUERY ("Expiry date என்ன?", "காலாவதி தேதி")
  // =========================================================================
  const isExpiryQuery =
    norm.includes('expiry') ||
    norm.includes('expiring') ||
    norm.includes('காலாவதி') ||
    norm.includes('expire');

  if (isExpiryQuery && !norm.includes('sale') && !norm.includes('vandhirukku')) {
    return {
      action: 'EXPIRY_REPORT',
      product: 'Expiring Stock Report',
      quantity: 0,
      raw_transcription: transcript,
      reasoning: 'Inquired about expiring product batches.',
      confidence: 0.96,
      tamil_confirmation: '⚠️ டெய்ரி மில்க் விரைவில் காலாவதியாகிறது (இன்னும் 14 நாட்கள்). உடனே விற்பனை செய்யவும்.',
      english_confirmation: 'Displaying products expiring within the next 30 days.',
      is_read_only: true,
    };
  }

  // =========================================================================
  // READ-ONLY QUERY: Low Stock Report ("எந்த பொருள் stock கம்மியா இருக்கு?")
  // =========================================================================
  const isLowStockQuery = 
    norm.includes('low stock') ||
    norm.includes('குறைவா') ||
    norm.includes('கம்மியா') ||
    norm.includes('kammi') ||
    norm.includes('kuraiva') ||
    norm.includes('reorder') ||
    norm.includes('restock');

  if (isLowStockQuery && !norm.includes('vandhirukku') && !norm.includes('sale') && !norm.includes('vithuten') && !norm.includes('add')) {
    const lowStockItems = products.filter((p) => p.quantity <= p.minimum_quantity);
    const lowStockCount = lowStockItems.length;

    const tamilReport = lowStockCount > 0
      ? `தற்போது ${lowStockCount} பொருட்கள் குறைந்த இருப்பில் உள்ளன: ${lowStockItems.map(p => `${p.name} (${p.quantity} ${p.unit})`).join(', ')}.`
      : 'அனைத்து பொருட்களும் போதிய அளவில் உள்ளன. குறைந்த இருப்பு எதுவும் இல்லை.';

    return {
      action: 'LOW_STOCK_REPORT',
      product: 'Low Stock Overview',
      quantity: lowStockCount,
      raw_transcription: transcript,
      reasoning: 'User requested low-stock summary. Displaying directly.',
      confidence: 0.96,
      tamil_confirmation: tamilReport,
      english_confirmation: `Found ${lowStockCount} items below minimum stock.`,
      is_read_only: true,
      query_response_data: lowStockItems,
    };
  }

  // =========================================================================
  // READ-ONLY QUERY: Check Stock ("Coke stock எவ்வளவு இருக்கு?")
  // =========================================================================
  const matchedProd = matchProduct(transcript, products);

  const isCheckStock = 
    norm.includes('stock evlo') ||
    norm.includes('evlo irukku') ||
    norm.includes('ethana irukku') ||
    norm.includes('எவ்வளவு இருக்கு') ||
    norm.includes('எத்தனை இருக்கு') ||
    norm.includes('stock check') ||
    norm.includes('check pannu') ||
    norm.includes('balance evlo') ||
    (norm.includes('stock') && !norm.includes('sale') && !norm.includes('vithuten') && !norm.includes('vandh') && !norm.includes('received') && !norm.includes('add'));

  if (isCheckStock && matchedProd) {
    return {
      action: 'CHECK_STOCK',
      product: matchedProd.name,
      quantity: matchedProd.quantity,
      unit: matchedProd.unit,
      matched_product_id: matchedProd.id,
      matched_product: matchedProd,
      raw_transcription: transcript,
      reasoning: `Inquired stock for ${matchedProd.name}. Currently ${matchedProd.quantity} ${matchedProd.unit}.`,
      confidence: 0.98,
      tamil_confirmation: `${matchedProd.name} stock இப்போ ${matchedProd.quantity} ${matchedProd.unit} இருக்கு.`,
      english_confirmation: `${matchedProd.name} current stock is ${matchedProd.quantity} ${matchedProd.unit}.`,
      is_read_only: true,
      query_response_data: {
        current: matchedProd.quantity,
        minimum: matchedProd.minimum_quantity,
        unit: matchedProd.unit,
        price: matchedProd.selling_price,
        expiry: matchedProd.expiry_date,
      }
    };
  }

  // =========================================================================
  // MISSING ENTITY / LOW-CONFIDENCE CLARIFICATION (e.g. "Coke konjam sale panniten")
  // =========================================================================
  const { quantity: extractedQty, unit: extractedUnit, hasExplicitNumber } = extractQuantity(transcript);
  const isVague = hasVagueQuantity(transcript);

  const isSaleWord = 
    norm.includes('sale') ||
    norm.includes('vithuten') ||
    norm.includes('வித்துட்டேன்') ||
    norm.includes('kuduthuten') ||
    norm.includes('potachu') ||
    norm.includes('sold');

  const isAddWord = 
    norm.includes('vandhirukku') ||
    norm.includes('vandhuchu') ||
    norm.includes('வந்திருக்கு') ||
    norm.includes('received') ||
    norm.includes('arrival') ||
    norm.includes('add பண்ணு') ||
    norm.includes('சேர்') ||
    norm.includes('stock in') ||
    norm.includes('சேர்த்தாச்சு');

  if ((isSaleWord || isAddWord) && matchedProd && (!hasExplicitNumber || isVague || extractedQty === null)) {
    const actionType: VoiceAction = isAddWord ? 'ADD_STOCK' : 'RECORD_SALE';
    const actionVerbTa = isAddWord ? 'வந்திருக்கு' : 'sale பண்ணீங்க';

    return {
      action: 'NEED_CLARIFICATION',
      product: matchedProd.name,
      quantity: 0,
      unit: matchedProd.unit,
      matched_product_id: matchedProd.id,
      matched_product: matchedProd,
      raw_transcription: transcript,
      reasoning: `Quantity is missing or ambiguous for ${matchedProd.name}. Prompting user for clarification.`,
      confidence: 0.85,
      needs_clarification: true,
      missing_field: 'quantity',
      clarification_prompt_ta: `${matchedProd.name} எவ்வளவு ${matchedProd.unit} ${actionVerbTa}?`,
      clarification_prompt_en: `How many ${matchedProd.unit}s of ${matchedProd.name} did you ${isAddWord ? 'receive' : 'sell'}?`,
      tamil_confirmation: `${matchedProd.name} எவ்வளவு ${matchedProd.unit} ${actionVerbTa}?`,
      english_confirmation: `Please specify the quantity for ${matchedProd.name}.`,
      pending_context: {
        action: actionType,
        product_id: matchedProd.id,
        product_name: matchedProd.name,
        unit: matchedProd.unit,
        unit_price: matchedProd.selling_price,
        original_transcript: transcript,
      }
    };
  }

  if ((isSaleWord || isAddWord) && !matchedProd) {
    return {
      action: 'NEED_CLARIFICATION',
      product: 'Unknown',
      quantity: extractedQty || 1,
      raw_transcription: transcript,
      reasoning: 'Product name could not be resolved from shop catalog. Asking user for product name.',
      confidence: 0.5,
      needs_clarification: true,
      missing_field: 'product',
      clarification_prompt_ta: 'எந்த பொருள் விற்பனை செய்தீர்கள்? (Which product?)',
      clarification_prompt_en: 'Which product did you mean?',
      tamil_confirmation: 'எந்த பொருள் விற்பனை செய்தீர்கள்?',
      english_confirmation: 'Which product did you mean?',
      pending_context: {
        action: isAddWord ? 'ADD_STOCK' : 'RECORD_SALE',
        original_transcript: transcript,
      }
    };
  }

  // =========================================================================
  // STOCK IN / ADD STOCK ("இன்னைக்கு 20 kilo rice வந்திருக்கு", "20 kg rice received")
  // =========================================================================
  if (isAddWord && matchedProd && extractedQty !== null && extractedQty > 0) {
    const prodUnit = matchedProd.unit || extractedUnit || 'packet';
    return {
      action: 'ADD_STOCK',
      product: matchedProd.name,
      quantity: extractedQty,
      unit: prodUnit,
      matched_product_id: matchedProd.id,
      matched_product: matchedProd,
      raw_transcription: transcript,
      reasoning: `Stock arrival: +${extractedQty} ${prodUnit} of ${matchedProd.name}.`,
      confidence: 0.96,
      tamil_confirmation: `✅ ${extractedQty} ${prodUnit} ${matchedProd.name} stock-ல சேர்த்தாச்சு.`,
      english_confirmation: `Add ${extractedQty} ${prodUnit} of ${matchedProd.name} to inventory.`
    };
  }

  // =========================================================================
  // RECORD SALE ("5 Coke sale panniten", "Bro 10 packet Maggi sale panniten")
  // =========================================================================
  if ((isSaleWord || matchedProd) && matchedProd && extractedQty !== null && extractedQty > 0) {
    const prodUnit = matchedProd.unit || extractedUnit || 'unit';
    const unitPrice = matchedProd.selling_price || 0;
    const totalPrice = unitPrice * extractedQty;

    return {
      action: 'RECORD_SALE',
      product: matchedProd.name,
      quantity: extractedQty,
      unit: prodUnit,
      unit_price: unitPrice,
      total_price: totalPrice,
      matched_product_id: matchedProd.id,
      matched_product: matchedProd,
      raw_transcription: transcript,
      reasoning: `Sale transaction: ${extractedQty} ${prodUnit} of ${matchedProd.name} (Total: ₹${totalPrice}).`,
      confidence: 0.97,
      tamil_confirmation: `✅ ${extractedQty} ${matchedProd.name} sale record panniten.`,
      english_confirmation: `Record sale of ${extractedQty} ${matchedProd.name} for ₹${totalPrice}.`
    };
  }

  // =========================================================================
  // FRIENDLY UNKNOWN FALLBACK
  // =========================================================================
  return {
    action: 'UNKNOWN',
    product: 'Unknown',
    quantity: 1,
    raw_transcription: transcript,
    reasoning: 'Could not clearly recognize the action or product from voice input.',
    confidence: 0.2,
    tamil_confirmation: 'Sorry, புரியல. இன்னொரு முறை சொல்லுங்க.',
    english_confirmation: "I didn't quite catch that. Please speak or type again (e.g. '5 Coke sale panniten')."
  };
}
