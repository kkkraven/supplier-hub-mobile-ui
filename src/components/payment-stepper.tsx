import React from 'react';
import { Check, CreditCard, FileText, Truck, CheckCircle } from 'lucide-react';
import { cn } from './ui/utils';

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

interface PaymentStepperProps {
  currentStep: number;
  steps?: Step[];
  className?: string;
}

const defaultSteps: Step[] = [
  {
    id: 'details',
    title: 'Детали заказа',
    description: 'Подтверждение спецификации',
    icon: FileText,
  },
  {
    id: 'payment',
    title: 'Оплата',
    description: 'Способ и детали платежа',
    icon: CreditCard,
  },
  {
    id: 'production',
    title: 'Производство',
    description: 'Изготовление продукции',
    icon: Truck,
  },
  {
    id: 'completion',
    title: 'Завершение',
    description: 'Доставка и подтверждение',
    icon: CheckCircle,
  },
];

export function PaymentStepper({
  currentStep,
  steps = defaultSteps,
  className,
}: PaymentStepperProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Mobile Version (Vertical) */}
      <div className="md:hidden space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div key={step.id} className="flex items-start gap-3">
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300',
                  isCompleted && 'bg-success border-success text-white',
                  isCurrent && 'bg-primary border-primary text-white',
                  isUpcoming && 'bg-gray-100 border-gray-300 text-gray-400'
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    'text-sm font-medium',
                    isCompleted && 'text-success',
                    isCurrent && 'text-primary',
                    isUpcoming && 'text-gray-400'
                  )}
                >
                  {step.title}
                </h3>
                <p
                  className={cn(
                    'text-xs mt-1',
                    isCompleted && 'text-gray-600',
                    isCurrent && 'text-gray-700',
                    isUpcoming && 'text-gray-400'
                  )}
                >
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Version (Horizontal) */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isUpcoming = index > currentStep;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 mb-2',
                      isCompleted && 'bg-success border-success text-white',
                      isCurrent && 'bg-primary border-primary text-white',
                      isUpcoming && 'bg-gray-100 border-gray-300 text-gray-400'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="text-center">
                    <h3
                      className={cn(
                        'text-sm font-medium',
                        isCompleted && 'text-success',
                        isCurrent && 'text-primary',
                        isUpcoming && 'text-gray-400'
                      )}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={cn(
                        'text-xs mt-1',
                        isCompleted && 'text-gray-600',
                        isCurrent && 'text-gray-700',
                        isUpcoming && 'text-gray-400'
                      )}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connection Line */}
                {!isLast && (
                  <div className="flex-1 h-0.5 mx-4 mb-8">
                    <div
                      className={cn(
                        'h-full transition-all duration-300',
                        index < currentStep
                          ? 'bg-success'
                          : 'bg-gray-300'
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}