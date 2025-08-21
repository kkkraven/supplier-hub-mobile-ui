'use client';

import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, FileText, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { RFQEmailTemplate } from '@/types/rfq';

interface EmailTemplateEditorProps {
  templates: RFQEmailTemplate[];
  selectedTemplateId?: string;
  onTemplateSelect: (templateId: string) => void;
  onTemplateSave: (template: Partial<RFQEmailTemplate>) => Promise<void>;
  onTemplateDelete: (templateId: string) => Promise<void>;
}

export const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({
  templates,
  selectedTemplateId,
  onTemplateSelect,
  onTemplateSave,
  onTemplateDelete
}) => {
  const { toast } = useToast();
  const [currentTemplate, setCurrentTemplate] = useState<Partial<RFQEmailTemplate>>({
    name: '',
    subject: '',
    body: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isNewTemplate, setIsNewTemplate] = useState(false);

  // Загружаем выбранный шаблон
  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        setCurrentTemplate(template);
        setIsEditing(false);
        setIsNewTemplate(false);
      }
    }
  }, [selectedTemplateId, templates]);

  // Создание нового шаблона
  const createNewTemplate = () => {
    setCurrentTemplate({
      name: '',
      subject: '',
      body: getDefaultTemplateBody()
    });
    setIsNewTemplate(true);
    setIsEditing(true);
  };

  // Получение дефолтного содержимого шаблона
  const getDefaultTemplateBody = () => {
    return `Уважаемый партнер,

Мы обращаемся к вам с запросом на предложение по следующему проекту:

**Название RFQ:** {{rfq_title}}
**Категория:** {{rfq_category}}
**Количество:** {{rfq_quantity}} шт.
**Дедлайн:** {{rfq_deadline}}

**Описание:**
{{rfq_description}}

**Технические требования:**
{{rfq_attachments}}

Пожалуйста, предоставьте ваше предложение, включая:
- Цену за единицу
- Сроки поставки
- Минимальный объем заказа
- Условия оплаты
- Дополнительную информацию

С уважением,
{{user_name}}
{{company_name}}`;
  };

  // Сохранение шаблона
  const handleSave = async () => {
    try {
      if (!currentTemplate.name?.trim()) {
        toast({
          title: 'Ошибка',
          description: 'Введите название шаблона',
          variant: 'destructive'
        });
        return;
      }

      if (!currentTemplate.subject?.trim()) {
        toast({
          title: 'Ошибка',
          description: 'Введите тему письма',
          variant: 'destructive'
        });
        return;
      }

      if (!currentTemplate.body?.trim()) {
        toast({
          title: 'Ошибка',
          description: 'Введите содержимое письма',
          variant: 'destructive'
        });
        return;
      }

      await onTemplateSave(currentTemplate);
      
      toast({
        title: 'Шаблон сохранен',
        description: 'Шаблон письма успешно сохранен'
      });

      setIsEditing(false);
      setIsNewTemplate(false);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить шаблон',
        variant: 'destructive'
      });
    }
  };

  // Удаление шаблона
  const handleDelete = async (templateId: string) => {
    try {
      await onTemplateDelete(templateId);
      toast({
        title: 'Шаблон удален',
        description: 'Шаблон письма успешно удален'
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить шаблон',
        variant: 'destructive'
      });
    }
  };

  // Вставка переменной в шаблон
  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('template-body') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = currentTemplate.body || '';
      const newText = text.substring(0, start) + variable + text.substring(end);
      
      setCurrentTemplate(prev => ({
        ...prev,
        body: newText
      }));

      // Устанавливаем курсор после вставленной переменной
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const variables = [
    { key: '{{rfq_title}}', label: 'Название RFQ' },
    { key: '{{rfq_category}}', label: 'Категория' },
    { key: '{{rfq_quantity}}', label: 'Количество' },
    { key: '{{rfq_deadline}}', label: 'Дедлайн' },
    { key: '{{rfq_description}}', label: 'Описание' },
    { key: '{{rfq_attachments}}', label: 'Вложения' },
    { key: '{{user_name}}', label: 'Имя пользователя' },
    { key: '{{company_name}}', label: 'Название компании' }
  ];

  return (
    <div className="space-y-6">
      {/* Список шаблонов */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Шаблоны писем
              </CardTitle>
              <CardDescription>
                Управляйте шаблонами писем для отправки RFQ
              </CardDescription>
            </div>
            <Button onClick={createNewTemplate} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Новый шаблон
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {templates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                <p>Шаблоны не найдены</p>
                <p className="text-sm">Создайте первый шаблон для отправки RFQ</p>
              </div>
            ) : (
              templates.map((template) => (
                <div
                  key={template.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTemplateId === template.id
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onTemplateSelect(template.id)}
                >
                  <div className="flex items-center gap-3">
                    {template.is_default && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-600">{template.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {template.is_default && (
                      <Badge variant="secondary" className="text-xs">
                        По умолчанию
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(template.id);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Редактор шаблона */}
      {(selectedTemplateId || isNewTemplate) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isNewTemplate ? 'Новый шаблон' : 'Редактирование шаблона'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Основные поля */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Название шаблона *</Label>
                <Input
                  id="template-name"
                  value={currentTemplate.name || ''}
                  onChange={(e) => setCurrentTemplate(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  placeholder="Введите название шаблона"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template-default">По умолчанию</Label>
                <Select
                  value={currentTemplate.is_default ? 'true' : 'false'}
                  onValueChange={(value) => setCurrentTemplate(prev => ({
                    ...prev,
                    is_default: value === 'true'
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Нет</SelectItem>
                    <SelectItem value="true">Да</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-subject">Тема письма *</Label>
              <Input
                id="template-subject"
                value={currentTemplate.subject || ''}
                onChange={(e) => setCurrentTemplate(prev => ({
                  ...prev,
                  subject: e.target.value
                }))}
                placeholder="Введите тему письма"
              />
            </div>

            {/* Переменные */}
            <div className="space-y-2">
              <Label>Доступные переменные</Label>
              <div className="flex flex-wrap gap-2">
                {variables.map((variable) => (
                  <Button
                    key={variable.key}
                    variant="outline"
                    size="sm"
                    onClick={() => insertVariable(variable.key)}
                    className="text-xs"
                  >
                    {variable.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Содержимое письма */}
            <div className="space-y-2">
              <Label htmlFor="template-body">Содержимое письма *</Label>
              <Textarea
                id="template-body"
                value={currentTemplate.body || ''}
                onChange={(e) => setCurrentTemplate(prev => ({
                  ...prev,
                  body: e.target.value
                }))}
                placeholder="Введите содержимое письма"
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            {/* Кнопки действий */}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                {isNewTemplate ? 'Создать' : 'Сохранить'}
              </Button>
              
              {!isNewTemplate && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Отменить' : 'Редактировать'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
