'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { VoiceMicHero } from '@/components/voice/VoiceMicHero';
import { useNammaKadai } from '@/lib/store';

export function VoiceModal() {
  const { isVoiceModalOpen, setVoiceModalOpen, language } = useNammaKadai();

  return (
    <Modal
      isOpen={isVoiceModalOpen}
      onClose={() => setVoiceModalOpen(false)}
      title={language === 'ta' ? 'நம்ம கடை குரல் உதவியாளர்' : 'Namma Kadai Voice Assistant'}
      subtitle={language === 'ta' ? 'தமிழ் அல்லது Tanglish-ல் பேசவும்' : 'Speak naturally in Tamil or Tanglish'}
      maxWidth="lg"
    >
      <div className="pt-2">
        <VoiceMicHero onSuccessAction={() => setVoiceModalOpen(false)} />
      </div>
    </Modal>
  );
}
