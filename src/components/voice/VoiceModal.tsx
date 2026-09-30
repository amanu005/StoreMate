'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { VoiceMicHero } from '@/components/voice/VoiceMicHero';
import { useStoreMate } from '@/lib/store';

export function VoiceModal() {
  const { isVoiceModalOpen, setVoiceModalOpen, language } = useStoreMate();

  return (
    <Modal
      isOpen={isVoiceModalOpen}
      onClose={() => setVoiceModalOpen(false)}
      title={language === 'ta' ? 'StoreMate குரல் உதவியாளர்' : 'StoreMate Voice Assistant'}
      subtitle={language === 'ta' ? 'தமிழ் அல்லது Tanglish-ல் பேசவும்' : 'Speak naturally in Tamil or Tanglish'}
      maxWidth="lg"
    >
      <div className="pt-2">
        <VoiceMicHero onSuccessAction={() => setVoiceModalOpen(false)} />
      </div>
    </Modal>
  );
}
