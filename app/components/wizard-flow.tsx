'use client';

import { useState, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type WizardStep = {
  title: string;
  description?: string;
  content: ReactNode;
  canProgress: boolean;
};

type WizardFlowProps = {
  steps: WizardStep[];
  onComplete: () => void;
  completionButtonText?: string;
  showProgressBar?: boolean;
  reviewStep?: {
    title: string;
    description: string;
    getPrompt: () => string;
    getSummary: () => Array<{ label: string; value: string; icon?: LucideIcon }>;
  };
};

export function WizardFlow({
  steps,
  onComplete,
  completionButtonText = 'Start Session',
  showProgressBar = true,
  reviewStep
}: WizardFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);

  const totalSteps = reviewStep ? steps.length + 1 : steps.length;
  const isReviewStep = reviewStep && currentStep === steps.length;
  const isLastStep = currentStep === totalSteps - 1;

  const goNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowPrompt(false);
    }
  };

  const currentStepData = !isReviewStep ? steps[currentStep] : null;
  const canGoNext = isReviewStep || (currentStepData?.canProgress ?? false);

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      {showProgressBar && (
        <div className="space-y-4">
          <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider">
            <span>Step {currentStep + 1}/{totalSteps}</span>
            <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, idx) => {
              const isReview = reviewStep && idx === steps.length;
              const stepTitle = isReview ? 'review' : steps[idx]?.title.toLowerCase();

              return (
                <div key={idx} className="flex-1">
                  <div className={`h-2 border-2 ${
                    idx <= currentStep
                      ? 'bg-black dark:bg-white border-black dark:border-white'
                      : 'bg-white dark:bg-black border-black dark:border-white'
                  }`} />
                  <span className={`text-xs font-mono mt-2 block ${
                    idx === currentStep
                      ? 'font-bold'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}>
                    {stepTitle}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="border-2 border-black dark:border-white bg-white dark:bg-black p-6 sm:p-8">
        {isReviewStep && reviewStep ? (
          <>
            <div className="mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                {reviewStep.title}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {reviewStep.description}
              </p>
            </div>

            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="space-y-px">
                {reviewStep.getSummary().map((item, idx) => (
                  <div key={idx} className="border-2 border-black dark:border-white p-4 bg-white dark:bg-black">
                    <div className="font-mono">
                      <div className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                        {item.label}
                      </div>
                      <div className="font-bold">
                        {item.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Prompt Preview */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowPrompt(!showPrompt)}
                  className="font-mono text-sm hover:underline"
                >
                  {showPrompt ? '[-] hide ai instructions' : '[+] view ai instructions'}
                </button>

                {showPrompt && (
                  <div className="border-2 border-black dark:border-white p-4 bg-zinc-50 dark:bg-zinc-950">
                    <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                      {reviewStep.getPrompt()}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : currentStepData ? (
          <>
            <div className="mb-6">
              <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                {currentStepData.title}
              </h3>
              {currentStepData.description && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {currentStepData.description}
                </p>
              )}
            </div>

            <div className="space-y-4">
              {currentStepData.content}
            </div>
          </>
        ) : null}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <button
          onClick={goBack}
          disabled={currentStep === 0}
          className="px-6 py-3 border-2 border-black dark:border-white bg-white dark:bg-black font-mono font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black dark:disabled:hover:bg-black dark:disabled:hover:text-white"
        >
          ← Back
        </button>

        <button
          onClick={goNext}
          disabled={!canGoNext}
          className="flex-1 px-6 py-3 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-mono font-bold hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-white dark:disabled:hover:bg-white dark:disabled:hover:text-black"
        >
          {isLastStep ? completionButtonText : 'Continue →'}
        </button>
      </div>
    </div>
  );
}
