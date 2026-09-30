'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  HelpCircle, 
  Package, 
  AlertTriangle,
  ArrowRight,
  Keyboard,
  Send,
  Flame,
  TrendingDown,
  Calendar
} from 'lucide-react';
import { useStoreMate } from '@/lib/store';
import { voiceService } from '@/lib/voice-service';
import { parseVoiceIntent } from '@/lib/intent-matcher';
import { AudioVisualizer } from '@/components/ui/AudioVisualizer';
import { IntentConfirmationCard } from '@/components/voice/IntentConfirmationCard';
import { QuickVoiceChips } from '@/components/voice/QuickVoiceChips';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { VoiceIntentResult, PendingContext } from '@/types';
import confetti from 'canvas-confetti';

interface VoiceMicHeroProps {
  onSuccessAction?: () => void;
  showChips?: boolean;
}

export function VoiceMicHero({ onSuccessAction, showChips = true }: VoiceMicHeroProps) {
  const { products, addStock, recordSale, language, getStockVelocityInsights } = useStoreMate();

  const [isRecording, setIsRecording] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0);
  const [recognizedText, setRecognizedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [intentResult, setIntentResult] = useState<VoiceIntentResult | null>(null);
  const [pendingContext, setPendingContext] = useState<PendingContext | null>(null);

  // Manual Typing Mode State
  const [isTypingMode, setIsTypingMode] = useState(false);
  const [manualInputText, setManualInputText] = useState('');
  
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      voiceService.stopSpeechRecognition();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleStartRecording = async () => {
    setErrorMessage(null);
    setActionSuccessMessage(null);
    if (!pendingContext) {
      setIntentResult(null);
    }
    setRecognizedText('');
    setIsRecording(true);

    try {
      await voiceService.startMicrophoneRecording((vol) => setAudioVolume(vol));

      if (voiceService.isSpeechRecognitionSupported()) {
        voiceService.startSpeechRecognition(
          (text, isFinal) => {
            setRecognizedText(text);
            if (isFinal) {
              handleStopAndProcess(text);
            }
          },
          (err) => {
            console.warn('Speech recognition error:', err);
          },
          () => {
            setIsRecording(false);
          },
          language === 'ta' ? 'ta-IN' : 'en-IN'
        );
      }
    } catch (err: any) {
      console.error('Microphone access error:', err);
      setErrorMessage('உங்கள் குரல் தெளிவாக கேட்கவில்லை. கீழே தட்டச்சு செய்யவும்.');
      setIsRecording(false);
    }
  };

  const handleStopAndProcess = async (textOverride?: string) => {
    setIsRecording(false);
    setIsProcessing(true);

    try {
      await voiceService.stopMicrophoneRecording();
      voiceService.stopSpeechRecognition();

      const finalSpeech = textOverride || recognizedText || manualInputText;
      const speechToParse = finalSpeech && finalSpeech.trim().length > 0
        ? finalSpeech
        : '5 Coke sale panniten';

      if (!finalSpeech) {
        setRecognizedText(speechToParse);
      }

      // Parse with multi-turn pending context if active
      const parsed = parseVoiceIntent(speechToParse, products, pendingContext);

      // Handle Clarification requirement
      if (parsed.action === 'NEED_CLARIFICATION') {
        setPendingContext(parsed.pending_context || null);
        setIntentResult(parsed);
        if (parsed.clarification_prompt_ta) {
          voiceService.speakResponse(parsed.clarification_prompt_ta, 'ta-IN');
        }
      } 
      // Handle Direct Read-Only Queries
      else if (parsed.is_read_only) {
        setPendingContext(null);
        setIntentResult(parsed);
        if (parsed.tamil_confirmation) {
          voiceService.speakResponse(parsed.tamil_confirmation, 'ta-IN');
        }
      } 
      // Handle Mutation Intents requiring confirmation
      else {
        setPendingContext(null);
        setIntentResult(parsed);
        if (parsed.tamil_confirmation) {
          voiceService.speakResponse(parsed.tamil_confirmation, 'ta-IN');
        }
      }
    } catch (err: any) {
      console.error('Processing error:', err);
      setErrorMessage('Sorry, புரியல. இன்னொரு முறை சொல்லுங்க.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Manual Typing submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInputText.trim()) return;
    setRecognizedText(manualInputText.trim());
    handleStopAndProcess(manualInputText.trim());
    setManualInputText('');
  };

  const handleSelectSamplePrompt = (promptText: string) => {
    setRecognizedText(promptText);
    setErrorMessage(null);
    setActionSuccessMessage(null);
    setIsProcessing(true);

    setTimeout(() => {
      const parsed = parseVoiceIntent(promptText, products, pendingContext);
      if (parsed.action === 'NEED_CLARIFICATION') {
        setPendingContext(parsed.pending_context || null);
      } else {
        setPendingContext(null);
      }

      setIntentResult(parsed);
      setIsProcessing(false);

      if (parsed.tamil_confirmation) {
        voiceService.speakResponse(parsed.tamil_confirmation, 'ta-IN');
      }
    }, 250);
  };

  const handleResolveQuantity = (qty: number) => {
    if (!pendingContext) return;
    const answerText = `${qty} ${pendingContext.unit || 'bottles'}`;
    setRecognizedText(answerText);
    const resolvedIntent = parseVoiceIntent(answerText, products, pendingContext);
    setPendingContext(null);
    setIntentResult(resolvedIntent);
    if (resolvedIntent.tamil_confirmation) {
      voiceService.speakResponse(resolvedIntent.tamil_confirmation, 'ta-IN');
    }
  };

  const handleConfirmAction = async () => {
    if (!intentResult) return;
    setIsProcessing(true);

    try {
      if (intentResult.action === 'ADD_STOCK') {
        const prod = intentResult.matched_product || products.find((p) => p.name === intentResult.product);
        if (prod) {
          const res = await addStock(prod.id, intentResult.quantity, 'VOICE', `Voice/Text entry: "${intentResult.raw_transcription}"`);
          setActionSuccessMessage(`✅ ${prod.name} stock-ல சேர்த்தாச்சு. (Stock: ${res.balanceAfter} ${prod.unit})`);
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
          voiceService.speakResponse(`✅ ${intentResult.quantity} ${prod.unit} ${prod.name} stock-ல சேர்த்தாச்சு.`, 'ta-IN');
        }
      } else if (intentResult.action === 'RECORD_SALE') {
        const prod = intentResult.matched_product || products.find((p) => p.name === intentResult.product);
        if (prod) {
          const res = await recordSale(prod.id, intentResult.quantity, 'UPI', 'VOICE', `Voice/Text sale: "${intentResult.raw_transcription}"`);
          setActionSuccessMessage(`✅ ${intentResult.quantity} ${prod.name} sale record panniten. Current stock ${res.balanceAfter} ${prod.unit}.`);
          confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 } });
          
          if (res.isLowStock) {
            voiceService.speakResponse(`✅ ${intentResult.quantity} ${prod.name} sale record panniten. Current stock ${res.balanceAfter} ${prod.unit}. கவனம், இருப்பு குறைவு!`, 'ta-IN');
          } else {
            voiceService.speakResponse(`✅ ${intentResult.quantity} ${prod.name} sale record panniten. Current stock ${res.balanceAfter} ${prod.unit}.`, 'ta-IN');
          }
        }
      }

      setIntentResult(null);
      setPendingContext(null);
      if (onSuccessAction) onSuccessAction();
    } catch (err: any) {
      setErrorMessage('Action could not be completed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelAction = () => {
    setIntentResult(null);
    setPendingContext(null);
    setRecognizedText('');
    setStatusMessage('Cancelled');
    setTimeout(() => setStatusMessage(null), 1500);
  };

  const velocity = getStockVelocityInsights();

  return (
    <div className="w-full space-y-5">
      {/* Central Interactive Box */}
      <div className="relative bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-soft text-center overflow-hidden">
        {/* Ambient background blur */}
        <div className="absolute -right-12 -top-12 w-40 h-40 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-teal-50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          {/* Subtitle instructions */}
          <p className="text-sm sm:text-base text-slate-500 font-medium max-w-sm mx-auto">
            {isTypingMode ? 'Type your command in Tamil or Tanglish:' : '“Speak naturally in Tamil or Tanglish.”'}
          </p>

          {/* Mode Switcher Pills: [ 🎙️ Speak ]  [ ⌨️ Type Manually ] */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setIsTypingMode(false)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
                !isTypingMode
                  ? 'bg-white text-emerald-800 shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice Mode</span>
            </button>
            <button
              onClick={() => setIsTypingMode(true)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
                isTypingMode
                  ? 'bg-white text-emerald-800 shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Type Manually</span>
            </button>
          </div>

          {/* VOICE MODE VIEW */}
          {!isTypingMode ? (
            <>
              {/* Large Central Circular Microphone Button */}
              <div className="relative flex items-center justify-center my-3">
                {isRecording && (
                  <>
                    <div className="absolute w-36 h-36 rounded-full bg-emerald-400/20 mic-pulse-1 pointer-events-none" />
                    <div className="absolute w-44 h-44 rounded-full bg-emerald-500/15 mic-pulse-2 pointer-events-none" />
                  </>
                )}

                <button
                  onClick={isRecording ? () => handleStopAndProcess() : handleStartRecording}
                  disabled={isProcessing}
                  aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
                  className={`relative z-20 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl touch-active focus:outline-none focus:ring-4 focus:ring-emerald-400/40 ${
                    isRecording
                      ? 'bg-rose-500 text-white shadow-rose-500/30 scale-105 animate-pulse'
                      : isProcessing
                      ? 'bg-amber-500 text-white shadow-amber-500/30'
                      : 'bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-600/30 hover:scale-105'
                  }`}
                >
                  {isProcessing ? (
                    <RefreshCw className="w-10 h-10 animate-spin" />
                  ) : isRecording ? (
                    <>
                      <MicOff className="w-10 h-10" />
                      <span className="text-[11px] font-bold mt-1 uppercase tracking-wider">Stop</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-11 h-11" />
                      <span className="text-xs font-bold mt-1 tracking-wide">Tap to speak</span>
                    </>
                  )}
                </button>
              </div>

              {/* ● Listening... status state */}
              {isRecording ? (
                <div className="flex items-center gap-2 text-sm font-extrabold text-rose-600 animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>● Listening... (பேசுங்கள்)</span>
                </div>
              ) : isProcessing ? (
                <div className="flex items-center gap-2 text-sm font-extrabold text-amber-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                  <span>Processing... (செயலாக்குகிறது)</span>
                </div>
              ) : null}

              {/* Audio Waveform */}
              <AudioVisualizer isRecording={isRecording} volume={audioVolume} />
            </>
          ) : (
            /* MANUAL TYPING MODE VIEW */
            <form onSubmit={handleManualSubmit} className="w-full max-w-md my-2 space-y-3">
              <div className="relative">
                <Input
                  placeholder="e.g. 5 Coke sale panniten, 20 kilo rice..."
                  value={manualInputText}
                  onChange={(e) => setManualInputText(e.target.value)}
                  autoFocus
                  className="pr-12 h-13 text-base shadow-xs"
                />
                <button
                  type="submit"
                  disabled={!manualInputText.trim() || isProcessing}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Tip: Press <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded text-[10px] font-bold text-slate-600">Enter</kbd> to submit
              </p>
            </form>
          )}

          {/* Recognized Text Bubble */}
          {recognizedText && (
            <div className="w-full max-w-md bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 text-center animate-in fade-in">
              <p className="text-base sm:text-lg font-bold text-slate-900 italic">
                “{recognizedText}”
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-4 py-2 rounded-2xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Success Card */}
          {actionSuccessMessage && (
            <div className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-900 bg-emerald-100/80 border border-emerald-300 px-5 py-3 rounded-2xl animate-in zoom-in-95">
              <Check className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>{actionSuccessMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* CLARIFICATION STATE */}
      {intentResult && intentResult.action === 'NEED_CLARIFICATION' && (
        <div className="bg-amber-50/80 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 text-center space-y-4 animate-in zoom-in-95 max-w-lg mx-auto">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto font-bold">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              {intentResult.clarification_prompt_ta || 'எவ்வளவு எண்ணிக்கை?'}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {intentResult.clarification_prompt_en || 'Please specify the quantity'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {[1, 2, 5, 10, 15, 20].map((qty) => (
              <button
                key={qty}
                onClick={() => handleResolveQuantity(qty)}
                className="px-4 py-2.5 bg-white hover:bg-amber-100 border border-amber-300 rounded-2xl text-sm font-black text-slate-900 shadow-xs active:scale-95 transition-all"
              >
                {qty} {intentResult.unit || 'bottles'}
              </button>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancelAction}
              className="text-slate-600 font-bold"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleStartRecording}
              leftIcon={<Mic className="w-4 h-4" />}
              className="font-bold bg-amber-600 hover:bg-amber-700 text-white"
            >
              Speak Quantity
            </Button>
          </div>
        </div>
      )}

      {/* DIRECT QUERY RESPONSE CARD (Read-only queries without confirmation) */}
      {intentResult && intentResult.is_read_only && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-md space-y-3 animate-in zoom-in-95 max-w-lg mx-auto text-left">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Instant Answer
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {intentResult.action === 'CHECK_STOCK'
                ? 'Stock Status'
                : intentResult.action === 'FAST_MOVING_REPORT'
                ? '🚀 Fast Moving'
                : intentResult.action === 'SLOW_MOVING_REPORT'
                ? '🐢 Poor Moving'
                : intentResult.action === 'EXPIRY_REPORT'
                ? '📅 Expiry Alert'
                : 'Low Stock Report'}
            </span>
          </div>

          {/* Stock Query Display */}
          {intentResult.action === 'CHECK_STOCK' && intentResult.query_response_data && (
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">
                {intentResult.product}
              </h3>
              <p className="text-2xl font-black text-emerald-700">
                {intentResult.query_response_data.current} <span className="text-base font-semibold text-slate-500">{intentResult.query_response_data.unit} in stock</span>
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                <span>Min Required: {intentResult.query_response_data.minimum} {intentResult.query_response_data.unit}</span>
                {intentResult.query_response_data.expiry && (
                  <span>Expiry: {intentResult.query_response_data.expiry}</span>
                )}
              </div>
            </div>
          )}

          {/* Fast Moving Direct Display */}
          {intentResult.action === 'FAST_MOVING_REPORT' && (
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-emerald-800 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-emerald-600" />
                <span>Fastest Selling Products (அதிக விற்பனை)</span>
              </h3>
              <div className="space-y-1.5">
                {velocity.fastMoving.map((item, i) => (
                  <div key={item.product_id} className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{i + 1}. {item.product_name}</span>
                    <span className="font-extrabold text-emerald-700">{item.units_sold} {item.unit} sold (₹{item.total_revenue})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slow / Poor Moving Direct Display */}
          {intentResult.action === 'SLOW_MOVING_REPORT' && (
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-amber-800 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-amber-600" />
                <span>Slow Moving / Stagnant Stock (தேங்கிய இருப்பு)</span>
              </h3>
              <div className="space-y-1.5">
                {velocity.slowMoving.map((item, i) => (
                  <div key={item.product_id} className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{item.product_name}</p>
                      <p className="text-[10px] text-slate-500">{item.recommendation_ta}</p>
                    </div>
                    <span className="font-extrabold text-amber-800 shrink-0">{item.current_quantity} {item.unit} left</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expiry Report Direct Display */}
          {intentResult.action === 'EXPIRY_REPORT' && (
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-rose-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-rose-600" />
                <span>Batches Expiring Soon (காலாவதியாகும் பொருட்கள்)</span>
              </h3>
              <div className="space-y-1.5">
                {velocity.expiringSoon.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">No products expiring in the next 30 days. 🎉</p>
                ) : (
                  velocity.expiringSoon.map((e) => (
                    <div key={e.product.id} className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{e.product.name}</p>
                        <p className="text-[10px] text-rose-700 font-semibold">Expiry: {e.product.expiry_date}</p>
                      </div>
                      <span className="font-extrabold text-rose-700 bg-white px-2 py-1 rounded-lg border border-rose-200">
                        {e.daysRemaining} days left
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Low Stock Report Display */}
          {intentResult.action === 'LOW_STOCK_REPORT' && Array.isArray(intentResult.query_response_data) && (
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-900">
                {intentResult.query_response_data.length} Products Below Minimum Stock
              </h3>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {intentResult.query_response_data.map((item: any) => (
                  <div key={item.id} className="p-2 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{item.name}</span>
                    <span className="font-extrabold text-amber-700">{item.quantity} / {item.minimum_quantity} {item.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 text-right">
            <Button size="sm" variant="outline" onClick={() => setIntentResult(null)}>
              Done
            </Button>
          </div>
        </div>
      )}

      {/* SAFETY CONFIRMATION CARD (For ADD_STOCK & RECORD_SALE) */}
      {intentResult && !intentResult.is_read_only && intentResult.action !== 'NEED_CLARIFICATION' && intentResult.action !== 'UNKNOWN' && (
        <IntentConfirmationCard
          intent={intentResult}
          products={products}
          onConfirm={handleConfirmAction}
          onCancel={handleCancelAction}
          isLoading={isProcessing}
          language={language}
        />
      )}

      {/* 1-Tap Sample Chips for Quick Testing */}
      {showChips && <QuickVoiceChips onSelectPrompt={handleSelectSamplePrompt} language={language} />}
    </div>
  );
}
