import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { toast } from "sonner";

interface CostCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: string) => void;
}

type CalculatorState = 'empty' | 'valid' | 'error';

export function CostCalculator({ isOpen, onClose, onNavigate }: CostCalculatorProps) {
  const [orderAmount, setOrderAmount] = useState('');
  const [selectedOption, setSelectedOption] = useState('hub');
  const [state, setState] = useState<CalculatorState>('empty');
  const [saving, setSaving] = useState(0);

  // Формула расчета согласно техническому заданию:
  // cost_agent = order * 0.05
  // cost_hub = 300 + order * 0.015
  // saving = cost_agent – cost_hub
  const calculateSaving = (amount: number): number => {
    const costAgent = amount * 0.05;
    const costHub = 300 + amount * 0.015;
    return costAgent - costHub;
  };

  const handleInputChange = (value: string) => {
    // Только цифры
    const numericValue = value.replace(/[^0-9]/g, '');
    setOrderAmount(numericValue);

    if (!numericValue) {
      setState('empty');
      setSaving(0);
      return;
    }

    const amount = parseInt(numericValue);
    
    if (amount < 1000) {
      setState('error');
      setSaving(0);
      if (amount > 0) {
        toast.error('Минимум $1,000');
      }
      return;
    }

    setState('valid');
    const calculatedSaving = calculateSaving(amount);
    setSaving(calculatedSaving);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (value: string): string => {
    if (!value) return '';
    return new Intl.NumberFormat('en-US').format(parseInt(value));
  };

  const isCtaEnabled = state === 'valid' && saving > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full lg:max-w-[560px] p-0 border-0 shadow-factura calculator-container">
        <div className="bg-white rounded-xl overflow-hidden calculator-content">
          {/* Header */}
          <DialogHeader className="p-grid-24 pb-grid-16 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-gray-900">
                    Сколько вы экономите с Hub?
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-600 mt-1">
                    Рассчитайте экономию при работе с фабриками через Factura Supplier Hub
                  </DialogDescription>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="w-8 h-8 p-0 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="p-grid-24 space-y-grid-24">
            {/* Input Row */}
            <div className="space-y-grid-8">
              <Label htmlFor="orderAmount" className="text-base font-medium text-gray-900">
                Сумма заказа, $
              </Label>
              <Input
                id="orderAmount"
                type="text"
                placeholder="10,000"
                value={formatNumber(orderAmount)}
                onChange={(e) => handleInputChange(e.target.value)}
                className={`h-12 text-lg ${
                  state === 'error' ? 'border-danger focus:border-danger focus:ring-danger' : ''
                }`}
              />
              <p className="text-sm text-gray-500">
                Средний заказ наших клиентов — $8-12k
              </p>
            </div>

            {/* Compare Toggle */}
            <div className="space-y-grid-8">
              <Label className="text-base font-medium text-gray-900">
                Модель ценообразования
              </Label>
              <RadioGroup 
                value={selectedOption} 
                onValueChange={setSelectedOption}
                className="flex flex-col sm:flex-row gap-grid-8 calculator-grid"
              >
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-grid-16 flex-1 cursor-pointer hover:bg-gray-100 transition-colors">
                  <RadioGroupItem value="hub" id="hub" className="text-primary" />
                  <Label htmlFor="hub" className="cursor-pointer font-medium flex-1">
                    Hub $300 + 1,5%
                  </Label>
                </div>
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-grid-16 flex-1 cursor-pointer hover:bg-gray-100 transition-colors">
                  <RadioGroupItem value="agent" id="agent" className="text-primary" />
                  <Label htmlFor="agent" className="cursor-pointer font-medium flex-1">
                    Агент 5%
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Result Card */}
            <Card className={`border-2 ${state === 'empty' ? 'calculator-blur' : 'border-gray-200'} shadow-factura calculator-result`}>
              <CardContent className="p-grid-24 text-center">
                <div className="space-y-grid-8">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Ваша экономия
                  </h4>
                  <div className="text-4xl font-bold text-success">
                    {state === 'valid' && saving > 0 ? formatCurrency(saving) : '$0'}
                  </div>
                  <p className="text-sm text-gray-600">
                    На первом заказе
                  </p>
                  
                  {state === 'valid' && saving > 0 && (
                    <div className="pt-grid-16 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-grid-16 text-sm">
                        <div>
                          <div className="text-gray-500">Агент 5%</div>
                          <div className="font-semibold text-danger">
                            {formatCurrency(parseInt(orderAmount) * 0.05)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Hub</div>
                          <div className="font-semibold text-primary">
                            {formatCurrency(300 + parseInt(orderAmount) * 0.015)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* CTA Button */}
            <Button
              className={`w-full h-12 text-base font-semibold transition-all duration-200 ${
                isCtaEnabled 
                  ? 'gradient-factura hover:bg-primary-dark btn-primary-hover' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!isCtaEnabled}
              onClick={() => {
                if (isCtaEnabled) {
                  onNavigate?.('pricing');
                  onClose();
                }
              }}
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Разблокировать фабрики
              {state === 'valid' && saving > 0 && (
                <span className="ml-2 opacity-90">
                  • Экономия {formatCurrency(saving)}
                </span>
              )}
            </Button>

            {/* Helper Info */}
            <div className="bg-primary/5 rounded-lg p-grid-16">
              <div className="flex items-start gap-grid-8">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
                <div className="text-sm text-primary-dark">
                  <p className="font-medium mb-1">Как мы считаем экономию?</p>
                  <p className="text-xs opacity-80">
                    Агент берет 5% комиссии с каждого заказа. 
                    Hub — фиксированная подписка $300/мес + 1,5% за транзакции.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}