// ============================================================================
// FACTORY CONTACT PROTECTED COMPONENT
// ============================================================================
// Защищенный компонент для отображения контактов фабрики с проверкой лимитов
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Lock, 
  Unlock,
  Crown,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Factory,
  Star,
  Users
} from 'lucide-react';
import { useLimitsEnforcement } from '@/hooks/useLimitsEnforcement';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';

// ============================================================================
// 1. FACTORY CONTACT PROTECTED PROPS
// ============================================================================

interface FactoryContactProtectedProps {
  factory: {
    id: string;
    name: string;
    location?: string;
    rating?: number;
    verified?: boolean;
    contact?: {
      email?: string;
      phone?: string;
      website?: string;
      address?: string;
      whatsapp?: string;
      telegram?: string;
    };
    specialization?: string[];
    certifications?: string[];
    min_order?: number;
    lead_time?: string;
  };
  className?: string;
  onAccessGranted?: (factory: any) => void;
  showPreview?: boolean;
}

// ============================================================================
// 2. FACTORY CONTACT PROTECTED COMPONENT
// ============================================================================

export const FactoryContactProtected: React.FC<FactoryContactProtectedProps> = ({
  factory,
  className = '',
  onAccessGranted,
  showPreview = true
}) => {
  const { 
    checkFactoryAccess, 
    enforceFactoryAccess, 
    getProcessingStatus,
    limits,
    isActive 
  } = useLimitsEnforcement();
  
  const { subscription } = useSubscriptionContext();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [accessResult, setAccessResult] = useState<any>(null);

  const isProcessing = getProcessingStatus(`factory_${factory.id}`);

  // ============================================================================
  // 3. CHECK ACCESS ON MOUNT
  // ============================================================================

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await fetch(`/api/limits/factory-access?factory_id=${factory.id}`);
        const data = await response.json();
        
        if (data.success) {
          setHasAccess(data.data.has_access);
        }
      } catch (error) {
        console.error('Error checking factory access:', error);
      }
    };

    if (isActive) {
      checkAccess();
    }
  }, [factory.id, isActive]);

  // ============================================================================
  // 4. HANDLE ACCESS REQUEST
  // ============================================================================

  const handleAccessRequest = async () => {
    try {
      setAccessError(null);
      
      // Проверяем лимиты
      const checkResult = await checkFactoryAccess({
        factoryId: factory.id,
        factoryName: factory.name
      });

      if (!checkResult.canProceed) {
        if (checkResult.suggestedAction === 'upgrade') {
          setShowUpgradeModal(true);
        } else {
          setAccessError(checkResult.reason || 'Доступ запрещен');
        }
        return;
      }

      // Применяем доступ
      const result = await enforceFactoryAccess({
        factoryId: factory.id,
        factoryName: factory.name
      });

      if (result.success) {
        setHasAccess(true);
        setAccessResult(result.data);
        onAccessGranted?.(factory);
        
        // Логируем успешный доступ
        await fetch('/api/limits/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'factory_access_granted',
            resource_type: 'factory',
            resource_id: factory.id,
            metadata: {
              factory_name: factory.name,
              factory_location: factory.location,
              access_method: 'direct_request'
            }
          })
        });
      } else {
        if (result.data?.suggested_action === 'upgrade') {
          setShowUpgradeModal(true);
        } else {
          setAccessError(result.error || 'Не удалось получить доступ');
        }
      }
    } catch (error) {
      console.error('Error requesting factory access:', error);
      setAccessError('Произошла ошибка при запросе доступа');
    }
  };

  // ============================================================================
  // 5. RENDER CONTACT INFO
  // ============================================================================

  const renderContactInfo = () => {
    if (!factory.contact) {
      return (
        <div className="text-center py-4 text-gray-500">
          <Mail className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p>Контактная информация не указана</p>
        </div>
      );
    }

    const { contact } = factory;

    return (
      <div className="space-y-3">
        {contact.email && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="h-4 w-4 text-blue-600" />
            <div className="flex-1">
              <div className="text-sm font-medium">Email</div>
              <a 
                href={`mailto:${contact.email}`}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {contact.email}
              </a>
            </div>
            <ExternalLink className="h-3 w-3 text-gray-400" />
          </div>
        )}

        {contact.phone && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Phone className="h-4 w-4 text-green-600" />
            <div className="flex-1">
              <div className="text-sm font-medium">Телефон</div>
              <a 
                href={`tel:${contact.phone}`}
                className="text-green-600 hover:text-green-800 text-sm"
              >
                {contact.phone}
              </a>
            </div>
            <ExternalLink className="h-3 w-3 text-gray-400" />
          </div>
        )}

        {contact.website && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Globe className="h-4 w-4 text-purple-600" />
            <div className="flex-1">
              <div className="text-sm font-medium">Сайт</div>
              <a 
                href={contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 text-sm"
              >
                {contact.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
            <ExternalLink className="h-3 w-3 text-gray-400" />
          </div>
        )}

        {contact.address && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <MapPin className="h-4 w-4 text-red-600" />
            <div className="flex-1">
              <div className="text-sm font-medium">Адрес</div>
              <div className="text-sm text-gray-600">{contact.address}</div>
            </div>
          </div>
        )}

        {(contact.whatsapp || contact.telegram) && (
          <div className="flex gap-2 pt-2">
            {contact.whatsapp && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                onClick={() => window.open(`https://wa.me/${contact.whatsapp}`, '_blank')}
              >
                WhatsApp
              </Button>
            )}
            {contact.telegram && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={() => window.open(`https://t.me/${contact.telegram}`, '_blank')}
              >
                Telegram
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // 6. RENDER PREVIEW
  // ============================================================================

  const renderPreview = () => {
    if (!showPreview) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg blur-sm">
          <Mail className="h-4 w-4 text-gray-400" />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-400">Email</div>
            <div className="text-sm text-gray-400">contact@••••••••.com</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg blur-sm">
          <Phone className="h-4 w-4 text-gray-400" />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-400">Телефон</div>
            <div className="text-sm text-gray-400">+86 ••• ••• ••••</div>
          </div>
        </div>

        <div className="text-center py-2">
          <div className="text-xs text-gray-500">
            Получите доступ для просмотра полной контактной информации
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // 7. MAIN RENDER
  // ============================================================================

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5 text-blue-600" />
              Контактная информация
              {factory.verified && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Проверено
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {factory.rating && (
                <Badge variant="outline" className="text-xs">
                  <Star className="h-3 w-3 mr-1 text-yellow-500" />
                  {factory.rating}
                </Badge>
              )}
              
              {hasAccess ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Unlock className="h-3 w-3 mr-1" />
                  Доступен
                </Badge>
              ) : (
                <Badge variant="outline" className="text-orange-700 border-orange-300">
                  <Lock className="h-3 w-3 mr-1" />
                  Ограничен
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Factory Info */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg">
            <div>
              <div className="text-xs text-gray-600">Специализация</div>
              <div className="text-sm font-medium">
                {factory.specialization?.join(', ') || 'Не указана'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Мин. заказ</div>
              <div className="text-sm font-medium">
                {factory.min_order ? `${factory.min_order} шт.` : 'Не указан'}
              </div>
            </div>
          </div>

          {/* Access Status */}
          {!isActive && (
            <Alert className="border-purple-200 bg-purple-50">
              <Crown className="h-4 w-4" />
              <AlertDescription className="text-purple-800">
                Требуется подписка для доступа к контактной информации фабрик
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {accessError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                {accessError}
              </AlertDescription>
            </Alert>
          )}

          {/* Limits Info */}
          {isActive && limits && (
            <div className="flex items-center justify-between text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
              <span>Доступ к фабрикам:</span>
              <span className="font-medium">
                {limits.factoriesUsed} / {limits.factoriesLimit || '∞'} использовано
              </span>
            </div>
          )}

          {/* Contact Information */}
          {hasAccess ? renderContactInfo() : renderPreview()}

          {/* Access Button */}
          {!hasAccess && isActive && (
            <Button
              onClick={handleAccessRequest}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Получение доступа...
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4 mr-2" />
                  Получить доступ к контактам
                </>
              )}
            </Button>
          )}

          {!isActive && (
            <Button
              onClick={() => setShowUpgradeModal(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
            >
              <Crown className="h-4 w-4 mr-2" />
              Получить подписку
            </Button>
          )}

          {/* Success Message */}
          {accessResult && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-800">
                Доступ получен! Осталось обращений: {accessResult.factories_remaining || 'безлимит'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        factoryName={factory.name}
        currentLimits={limits}
      />
    </>
  );
};

// ============================================================================
// 8. UPGRADE MODAL COMPONENT
// ============================================================================

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  factoryName: string;
  currentLimits: any;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  factoryName,
  currentLimits
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-purple-600" />
            Требуется обновление плана
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Для получения доступа к контактам фабрики <strong>"{factoryName}"</strong> необходимо обновить ваш план подписки.
          </p>
          
          {currentLimits && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Текущие лимиты:</h4>
              <div className="text-sm text-gray-600">
                <div>Фабрики: {currentLimits.factoriesUsed} / {currentLimits.factoriesLimit || '∞'}</div>
                <div>RFQ: {currentLimits.rfqUsed} / {currentLimits.rfqLimit || '∞'}</div>
              </div>
            </div>
          )}
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">
              💡 Преимущества обновления:
            </h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Больше доступов к фабрикам</li>
              <li>• Безлимитные RFQ запросы</li>
              <li>• Приоритетная поддержка</li>
              <li>• Эксклюзивные фабрики</li>
            </ul>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => {
                onClose();
                window.location.href = '/pricing';
              }}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
            >
              <Crown className="h-4 w-4 mr-2" />
              Обновить план
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Позже
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// 9. EXPORT
// ============================================================================

export default FactoryContactProtected;
