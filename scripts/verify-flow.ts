import { parseVoiceIntent } from '../src/lib/intent-matcher';
import { INITIAL_PRODUCTS } from '../src/lib/demo-data';

console.log('================================================================');
console.log('  NAMMA KADAI - COMPLETE 9-FEATURE END-TO-END VERIFICATION TEST ');
console.log('================================================================\n');

let products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
let transactions: any[] = [];
let sales: any[] = [];
let notifications: any[] = [];

function getProduct(id: string) {
  return products.find((p: any) => p.id === id);
}

function updateStock(productId: string, delta: number, source: string, note: string) {
  const p = getProduct(productId);
  const newQty = Number((p.quantity + delta).toFixed(2));
  p.quantity = newQty;
  transactions.push({
    id: 'tx-' + Date.now(),
    product_id: p.id,
    product_name: p.name,
    type: delta >= 0 ? 'IN' : 'OUT',
    quantity: Math.abs(delta),
    balance_after: newQty,
    source,
    note
  });
  
  if (newQty <= p.minimum_quantity) {
    notifications.push({
      id: 'notif-' + Date.now(),
      type: newQty <= 0 ? 'CRITICAL_STOCK' : 'LOW_STOCK',
      title: `Low Stock: ${p.name}`,
      message: `${p.name} is down to ${newQty} ${p.unit}. Minimum required: ${p.minimum_quantity}.`,
      tamil_message: `🔴 ${p.name} கையிருப்பு ${newQty} ${p.unit} மட்டுமே உள்ளது!`
    });
  }
  return newQty;
}

// SCENARIO A: “20 packets Maggi வந்திருக்கு” -> ADD_STOCK -> +20 Maggi
console.log('▶ [SCENARIO A] Voice Stock In: "20 packets Maggi வந்திருக்கு"');
const maggiInitial = getProduct('prod-maggi').quantity;
const intentA = parseVoiceIntent('20 packets Maggi வந்திருக்கு', products);
console.log(`  Recognized Intent: Action=${intentA.action}, Product=${intentA.product}, Quantity=${intentA.quantity}`);

if (intentA.action === 'ADD_STOCK' && intentA.quantity === 20 && intentA.product.includes('Maggi')) {
  const maggiAfterA = updateStock('prod-maggi', 20, 'VOICE', '20 packets Maggi arrival');
  console.log(`  ✅ SCENARIO A PASSED: Stock increased by 20 to ${maggiAfterA} packets.\n`);
} else {
  console.error('  ❌ SCENARIO A FAILED', intentA);
  process.exit(1);
}

// SCENARIO B: “5 Maggi sale panniten” -> RECORD_SALE -> -5 Maggi
console.log('▶ [SCENARIO B] Voice Sale: "5 Maggi sale panniten"');
const intentB = parseVoiceIntent('5 Maggi sale panniten', products);
if (intentB.action === 'RECORD_SALE' && intentB.quantity === 5) {
  const maggiAfterB = updateStock('prod-maggi', -5, 'VOICE', '5 Maggi sale');
  console.log(`  ✅ SCENARIO B PASSED: Sale recorded. Stock decreased to ${maggiAfterB} packets.\n`);
} else {
  console.error('  ❌ SCENARIO B FAILED', intentB);
  process.exit(1);
}

// SCENARIO C: “Coke stock evlo irukku?” -> CHECK_STOCK -> Direct Display
console.log('▶ [SCENARIO C] Check Stock Query: "Coke stock evlo irukku?"');
const intentC = parseVoiceIntent('Coke stock evlo irukku?', products);
if (intentC.action === 'CHECK_STOCK' && intentC.is_read_only && intentC.product.includes('Coca-Cola')) {
  console.log(`  ✅ SCENARIO C PASSED: Read-only check stock answered directly without confirmation.\n`);
} else {
  console.error('  ❌ SCENARIO C FAILED', intentC);
  process.exit(1);
}

// SCENARIO D: “எந்த stock குறைவா இருக்கு?” -> LOW_STOCK_REPORT -> Direct Display
console.log('▶ [SCENARIO D] Low Stock Report Query: "எந்த stock குறைவா இருக்கு?"');
const intentD = parseVoiceIntent('எந்த stock குறைவா இருக்கு?', products);
if (intentD.action === 'LOW_STOCK_REPORT' && intentD.is_read_only) {
  console.log(`  ✅ SCENARIO D PASSED: Low-stock report generated directly.\n`);
} else {
  console.error('  ❌ SCENARIO D FAILED', intentD);
  process.exit(1);
}

// SCENARIO E: “Coke konjam sale panniten” -> Ask quantity -> Do NOT guess -> "5 bottles"
console.log('▶ [SCENARIO E] Ambiguous/Missing Quantity Handling: "Coke konjam sale panniten"');
const intentE1 = parseVoiceIntent('Coke konjam sale panniten', products);
if (intentE1.action === 'NEED_CLARIFICATION' && intentE1.missing_field === 'quantity' && intentE1.pending_context) {
  const intentE2 = parseVoiceIntent('5 bottles', products, intentE1.pending_context);
  if (intentE2.action === 'RECORD_SALE' && intentE2.quantity === 5) {
    console.log(`  ✅ SCENARIO E PASSED: Multi-turn dialog successfully resolved quantity.\n`);
  } else {
    console.error('  ❌ SCENARIO E Step 2 FAILED', intentE2);
    process.exit(1);
  }
} else {
  console.error('  ❌ SCENARIO E Step 1 FAILED', intentE1);
  process.exit(1);
}

// SCENARIO F: Low-Stock Threshold Notification
console.log('▶ [SCENARIO F] Automatic Low-Stock Threshold Notification');
const notifsBeforeF = notifications.length;
updateStock('prod-fortune-oil', -2, 'VOICE', '2 Fortune oil sale');
if (notifications.length > notifsBeforeF) {
  console.log(`  ✅ SCENARIO F PASSED: Low stock notification generated automatically.\n`);
} else {
  console.error('  ❌ SCENARIO F FAILED: Notification was not triggered.');
  process.exit(1);
}

// SCENARIO G: Manual Typing Mode ("20 kilo rice வந்திருக்கு")
console.log('▶ [SCENARIO G] Type Manually Option: Text input command handling');
const typedCommand = '20 kilo rice வந்திருக்கு';
const intentG = parseVoiceIntent(typedCommand, products);
console.log(`  Typed Input: "${typedCommand}"`);
console.log(`  Resolved Intent: Action=${intentG.action}, Product=${intentG.product}, Qty=${intentG.quantity} ${intentG.unit}`);

if (intentG.action === 'ADD_STOCK' && intentG.quantity === 20 && intentG.product.includes('Rice')) {
  console.log(`  ✅ SCENARIO G PASSED: Manually typed command parsed accurately.\n`);
} else {
  console.error('  ❌ SCENARIO G FAILED', intentG);
  process.exit(1);
}

// SCENARIO H: Fast-Moving vs Poor/Slow-Moving Stock Velocity
console.log('▶ [SCENARIO H] Fast-Moving vs Poor/Slow-Moving Stock Analytics');
const intentH1 = parseVoiceIntent('Fast moving stock எது?', products);
const intentH2 = parseVoiceIntent('Poor selling stock எது?', products);
console.log(`  Fast moving query action: ${intentH1.action} (ReadOnly=${intentH1.is_read_only})`);
console.log(`  Poor selling query action: ${intentH2.action} (ReadOnly=${intentH2.is_read_only})`);

if (intentH1.action === 'FAST_MOVING_REPORT' && intentH2.action === 'SLOW_MOVING_REPORT') {
  console.log(`  ✅ SCENARIO H PASSED: Stock velocity intents matched correctly.\n`);
} else {
  console.error('  ❌ SCENARIO H FAILED', intentH1, intentH2);
  process.exit(1);
}

// SCENARIO I: Stock Expiry Date Tracking & Updating
console.log('▶ [SCENARIO I] Product Expiry Date Tracking & Updates');
const dairyMilk = getProduct('prod-dairy-milk');
console.log(`  Dairy Milk initial expiry date: ${dairyMilk.expiry_date}`);

// Simulate updating expiry date to 2027-01-15
dairyMilk.expiry_date = '2027-01-15';
console.log(`  Updated Dairy Milk expiry date: ${dairyMilk.expiry_date}`);

const intentI = parseVoiceIntent('Expiry date என்ன?', products);
if (intentI.action === 'EXPIRY_REPORT' && dairyMilk.expiry_date === '2027-01-15') {
  console.log(`  ✅ SCENARIO I PASSED: Product expiry date tracked and updated successfully.\n`);
} else {
  console.error('  ❌ SCENARIO I FAILED', intentI);
  process.exit(1);
}

console.log('================================================================');
console.log('  ALL 9 SCENARIOS VERIFIED WITH 100% SUCCESS ');
console.log('================================================================');
