import React, { useState } from 'react';
import { ArrowRight, Brain, Camera, Mic, MessageSquare } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: Brain,
      title: "Welcome to Second Brain",
      description: "Your personal AI assistant designed to help you remember everything effortlessly.",
      color: "text-primary-600"
    },
    {
      icon: Mic,
      title: "Capture Any Sense",
      description: "Speak your thoughts, snap a photo, or write a note. We'll organize it for you.",
      color: "text-purple-500"
    },
    {
      icon: MessageSquare,
      title: "Recall Instantly",
      description: "Just ask questions naturally. Your Second Brain connects the dots to find the answer.",
      color: "text-emerald-500"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const CurrentIcon = steps[step].icon;

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      <div className="max-w-md w-full flex flex-col items-center">
        
        {/* Progress Dots */}
        <div className="flex space-x-2 mb-12">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-primary-600' : 'w-2 bg-gray-200'
              }`} 
            />
          ))}
        </div>

        {/* Content */}
        <div className="bg-primary-50 p-8 rounded-full mb-8 shadow-sm">
          <CurrentIcon className={`w-16 h-16 ${steps[step].color}`} />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
          {steps[step].title}
        </h2>
        
        <p className="text-gray-500 text-lg leading-relaxed mb-12">
          {steps[step].description}
        </p>

        {/* Action */}
        <button 
          onClick={handleNext}
          className="w-full bg-gray-900 text-white font-semibold py-4 rounded-xl shadow-lg hover:bg-black transition-all flex items-center justify-center group"
        >
          {step === steps.length - 1 ? "Get Started" : "Continue"}
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default Onboarding;