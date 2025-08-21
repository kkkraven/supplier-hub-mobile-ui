'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useRFQ } from '@/hooks/useRFQ';
import { FactorySelector } from '@/components/rfq/factory-selector';
import { EmailTemplateEditor } from '@/components/rfq/email-template-editor';
import { RFQSentStatus } from '@/components/rfq/rfq-sent-status';
import { RFQ, RFQEmailTemplate, RFQSentFactory } from '@/types/rfq';

export default function SendRFQPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { 
    getFactoriesForSelection, 
    getEmailTemplates, 
    createEmailTemplate, 
    sendRFQToFactories,
    getRFQSentStatus
  } = useRFQ();

  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFactoryIds, setSelectedFactoryIds] = useState<string[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [templates, setTemplates] = useState<RFQEmailTemplate[]>([]);
  const [sentFactories, setSentFactories] = useState<RFQSentFactory[]>([]);
  const [activeTab, setActiveTab] = useState('factories');

  // Загружаем данные RFQ
  useEffect(() => {
    const loadRFQ = async () => {
      if (!params.id) return;

      try {
        setLoading(true);
        // Здесь должен быть вызов API для получения RFQ
        // Пока используем моковые данные
        const mockRFQ: RFQ = {
          id: params.id as string,
          user_id: 'user-1',
          category_id: 'cat-1',
          title: 'Запрос на поставку электронных компонентов',
          description: 'Требуется поставка высококачественных электронных компонентов для промышленного оборудования',
          quantity: 1000,
          deadline: '2024-12-31T23:59:59Z',
          status: 'draft',
          priority: 'high',
          created_at: '2024-08-18T10:00:00Z',
          updated_at: '2024-08-18T10:00:00Z',
          category: {
            id: 'cat-1',
            name: 'Электроника',
            slug: 'electronics'
          }
        };

        setRfq(mockRFQ);
      } catch (error) {
        console.error('Ошибка при загрузке RFQ:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить RFQ',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadRFQ();
  }, [params.id, toast]);

  // Загружаем шаблоны писем
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templatesData = await getEmailTemplates();
        setTemplates(templatesData);
        
        // Выбираем дефолтный шаблон
        const defaultTemplate = templatesData.find(t => t.is_default);
        if (defaultTemplate) {
          setSelectedTemplateId(defaultTemplate.id);
        }
      } catch (error) {
        console.error('Ошибка при загрузке шаблонов:', error);
      }
    };

    loadTemplates();
  }, [getEmailTemplates]);

  // Загружаем статус отправки
  useEffect(() => {
    const loadSentStatus = async () => {
      if (!params.id) return;

      try {
        const sentData = await getRFQSentStatus(params.id as string);
        setSentFactories(sentData);
      } catch (error) {
        console.error('Ошибка при загрузке статуса отправки:', error);
      }
    };

    loadSentStatus();
  }, [params.id, getRFQSentStatus]);

  // Обработка выбора фабрик
  const handleFactoriesSelected = (factoryIds: string[]) => {
    setSelectedFactoryIds(factoryIds);
  };

  // Обработка выбора шаблона
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  // Сохранение шаблона
  const handleTemplateSave = async (template: Partial<RFQEmailTemplate>) => {
    try {
      const savedTemplate = await createEmailTemplate(template);
      
      // Обновляем список шаблонов
      const updatedTemplates = templates.map(t => 
        t.id === savedTemplate.id ? savedTemplate : t
      );
      setTemplates(updatedTemplates);
      
      // Если это новый шаблон, выбираем его
      if (!template.id) {
        setSelectedTemplateId(savedTemplate.id);
      }
    } catch (error) {
      throw error;
    }
  };

  // Удаление шаблона
  const handleTemplateDelete = async (templateId: string) => {
    try {
      // Здесь должен быть вызов API для удаления шаблона
      const updatedTemplates = templates.filter(t => t.id !== templateId);
      setTemplates(updatedTemplates);
      
      // Если удаляемый шаблон был выбран, сбрасываем выбор
      if (selectedTemplateId === templateId) {
        const defaultTemplate = updatedTemplates.find(t => t.is_default);
        setSelectedTemplateId(defaultTemplate?.id || '');
      }
    } catch (error) {
      throw error;
    }
  };

  // Отправка RFQ
  const handleSendRFQ = async () => {
    if (!rfq || selectedFactoryIds.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Выберите фабрики для отправки',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSending(true);
      
      const sentData = await sendRFQToFactories(
        rfq.id,
        selectedFactoryIds,
        selectedTemplateId
      );
      
      setSentFactories(sentData);
      
      toast({
        title: 'RFQ отправлен',
        description: `Запрос отправлен ${selectedFactoryIds.length} фабрикам`
      });
      
      // Переключаемся на вкладку статуса
      setActiveTab('status');
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить RFQ',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  // Обновление статуса отправки
  const handleRefreshStatus = async () => {
    if (!params.id) return;

    try {
      const sentData = await getRFQSentStatus(params.id as string);
      setSentFactories(sentData);
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">RFQ не найден</h1>
          <p className="text-gray-600 mb-6">Запрашиваемый RFQ не существует</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Отправка RFQ</h1>
              <p className="text-gray-600">{rfq.title}</p>
            </div>
          </div>
          
          {selectedFactoryIds.length > 0 && (
            <Button 
              onClick={handleSendRFQ} 
              disabled={sending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {sending ? 'Отправка...' : `Отправить (${selectedFactoryIds.length})`}
            </Button>
          )}
        </div>

        {/* Основной контент */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="factories">Выбор фабрик</TabsTrigger>
            <TabsTrigger value="templates">Шаблоны писем</TabsTrigger>
            <TabsTrigger value="status">Статус отправки</TabsTrigger>
          </TabsList>

          <TabsContent value="factories" className="space-y-6">
            <FactorySelector
              categoryId={rfq.category_id}
              onFactoriesSelected={handleFactoriesSelected}
              selectedFactoryIds={selectedFactoryIds}
            />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <EmailTemplateEditor
              templates={templates}
              selectedTemplateId={selectedTemplateId}
              onTemplateSelect={handleTemplateSelect}
              onTemplateSave={handleTemplateSave}
              onTemplateDelete={handleTemplateDelete}
            />
          </TabsContent>

          <TabsContent value="status" className="space-y-6">
            <RFQSentStatus
              rfqId={rfq.id}
              sentFactories={sentFactories}
              onRefresh={handleRefreshStatus}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
