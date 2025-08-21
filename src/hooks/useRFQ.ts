import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { RFQ, RFQAttachment, RFQSentFactory, RFQEmailTemplate, FactorySelection } from '@/types/rfq';
import { useAuthContext } from '@/contexts/AuthContext';

export const useRFQ = () => {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  // Получить все RFQ пользователя
  const fetchRFQs = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('rfqs')
        .select(`
          *,
          category:categories(id, name, slug),
          sent_factories:rfq_sent_factories(
            id,
            factory_id,
            sent_at,
            status,
            email,
            error_message,
            factory:factories(
              id,
              legal_name_cn,
              legal_name_en,
              city,
              segment,
              email,
              contact_person
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRfqs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке RFQ');
    } finally {
      setLoading(false);
    }
  };

  // Создать новый RFQ
  const createRFQ = async (rfqData: {
    category_id: string;
    title: string;
    description: string;
    quantity: number;
    deadline: string;
    priority: 'low' | 'medium' | 'high';
    status?: 'draft' | 'sent';
  }) => {
    if (!user) throw new Error('Пользователь не авторизован');
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('rfqs')
        .insert({
          ...rfqData,
          user_id: user.id,
          status: rfqData.status || 'draft'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Обновляем список RFQ
      await fetchRFQs();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании RFQ');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Обновить RFQ
  const updateRFQ = async (id: string, updates: Partial<RFQ>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('rfqs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Обновляем список RFQ
      await fetchRFQs();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при обновлении RFQ');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Удалить RFQ
  const deleteRFQ = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('rfqs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Обновляем список RFQ
      await fetchRFQs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при удалении RFQ');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Загрузить файл для RFQ
  const uploadAttachment = async (rfqId: string, file: File): Promise<RFQAttachment> => {
    if (!user) throw new Error('Пользователь не авторизован');
    
    try {
      // Загружаем файл в Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${rfqId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('rfq-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Получаем публичную ссылку
      const { data: urlData } = supabase.storage
        .from('rfq-attachments')
        .getPublicUrl(fileName);

      // Сохраняем информацию о файле в базе данных
      const { data, error } = await supabase
        .from('rfq_attachments')
        .insert({
          rfq_id: rfqId,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_size: file.size,
          file_type: file.type
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Ошибка при загрузке файла');
    }
  };

  // Получить вложения RFQ
  const getAttachments = async (rfqId: string): Promise<RFQAttachment[]> => {
    try {
      const { data, error } = await supabase
        .from('rfq_attachments')
        .select('*')
        .eq('rfq_id', rfqId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Ошибка при получении вложений');
    }
  };

  // Удалить вложение
  const deleteAttachment = async (attachmentId: string, fileUrl: string) => {
    try {
      // Удаляем файл из Storage
      const fileName = fileUrl.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('rfq-attachments')
          .remove([fileName]);
      }

      // Удаляем запись из базы данных
      const { error } = await supabase
        .from('rfq_attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Ошибка при удалении вложения');
    }
  };

  // Получить фабрики для выбора
  const getFactoriesForSelection = async (categoryId?: string): Promise<FactorySelection[]> => {
    try {
      let query = supabase
        .from('factories')
        .select(`
          id,
          legal_name_cn,
          legal_name_en,
          city,
          segment,
          email,
          contact_person,
          categories
        `)
        .not('email', 'is', null);

      if (categoryId) {
        query = query.contains('categories', [categoryId]);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return (data || []).map(factory => ({
        factory_id: factory.id,
        selected: false,
        factory: {
          ...factory,
          categories: factory.categories || []
        }
      }));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Ошибка при получении фабрик');
    }
  };

  // Получить шаблоны писем
  const getEmailTemplates = async (): Promise<RFQEmailTemplate[]> => {
    if (!user) throw new Error('Пользователь не авторизован');
    
    try {
      const { data, error } = await supabase
        .from('rfq_email_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Ошибка при получении шаблонов');
    }
  };

  // Создать шаблон письма
  const createEmailTemplate = async (template: {
    name: string;
    subject: string;
    body: string;
    is_default?: boolean;
  }): Promise<RFQEmailTemplate> => {
    if (!user) throw new Error('Пользователь не авторизован');
    
    try {
      // Если это дефолтный шаблон, сбрасываем другие дефолтные
      if (template.is_default) {
        await supabase
          .from('rfq_email_templates')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('is_default', true);
      }

      const { data, error } = await supabase
        .from('rfq_email_templates')
        .insert({
          ...template,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Ошибка при создании шаблона');
    }
  };

  // Отправить RFQ фабрикам
  const sendRFQToFactories = async (
    rfqId: string, 
    factoryIds: string[], 
    templateId?: string
  ): Promise<RFQSentFactory[]> => {
    if (!user) throw new Error('Пользователь не авторизован');
    
    try {
      // Получаем данные RFQ
      const { data: rfqData, error: rfqError } = await supabase
        .from('rfqs')
        .select(`
          *,
          category:categories(name),
          attachments:rfq_attachments(*)
        `)
        .eq('id', rfqId)
        .single();

      if (rfqError) throw rfqError;

      // Получаем фабрики
      const { data: factoriesData, error: factoriesError } = await supabase
        .from('factories')
        .select('id, legal_name_cn, legal_name_en, email, contact_person')
        .in('id', factoryIds);

      if (factoriesError) throw factoriesError;

      // Получаем шаблон письма
      let template = null;
      if (templateId) {
        const { data: templateData, error: templateError } = await supabase
          .from('rfq_email_templates')
          .select('*')
          .eq('id', templateId)
          .single();

        if (!templateError) {
          template = templateData;
        }
      }

      // Если шаблон не найден, используем дефолтный
      if (!template) {
        const { data: defaultTemplate, error: defaultError } = await supabase
          .from('rfq_email_templates')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .single();

        if (!defaultError) {
          template = defaultTemplate;
        }
      }

      // Создаем записи об отправке
      const sentFactories = [];
      for (const factory of factoriesData || []) {
        try {
          // Здесь должна быть логика отправки email
          // Пока просто создаем запись в базе
          const { data: sentData, error: sentError } = await supabase
            .from('rfq_sent_factories')
            .insert({
              rfq_id: rfqId,
              factory_id: factory.id,
              email: factory.email,
              status: 'sent'
            })
            .select()
            .single();

          if (!sentError) {
            sentFactories.push(sentData);
          }
        } catch (err) {
          console.error(`Ошибка отправки фабрике ${factory.id}:`, err);
        }
      }

      // Обновляем статус RFQ на "sent"
      await updateRFQ(rfqId, { status: 'sent' });

      return sentFactories;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Ошибка при отправке RFQ');
    }
  };

  // Получить статус отправки RFQ
  const getRFQSentStatus = async (rfqId: string): Promise<RFQSentFactory[]> => {
    try {
      const { data, error } = await supabase
        .from('rfq_sent_factories')
        .select(`
          *,
          factory:factories(
            id,
            legal_name_cn,
            legal_name_en,
            city,
            segment,
            email,
            contact_person
          )
        `)
        .eq('rfq_id', rfqId)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Ошибка при получении статуса отправки');
    }
  };

  // Получить предложения для RFQ
  const getRFQQuotes = async (rfqId: string): Promise<RFQQuote[]> => {
    try {
      const { data, error } = await supabase
        .from('rfq_quotes')
        .select(`
          *,
          factory:factories(
            id,
            legal_name_cn,
            legal_name_en,
            city,
            segment,
            email,
            contact_person
          )
        `)
        .eq('rfq_id', rfqId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Ошибка при получении предложений');
    }
  };

  // Создать предложение (для фабрик)
  const createQuote = async (quoteData: {
    rfq_id: string;
    factory_id: string;
    price: number;
    currency: string;
    lead_time_days: number;
    moq_units: number;
    description: string;
    terms_conditions?: string;
  }): Promise<RFQQuote> => {
    try {
      const { data, error } = await supabase
        .from('rfq_quotes')
        .insert(quoteData)
        .select(`
          *,
          factory:factories(
            id,
            legal_name_cn,
            legal_name_en,
            city,
            segment,
            email,
            contact_person
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Ошибка при создании предложения');
    }
  };

  // Обновить статус предложения
  const updateQuoteStatus = async (quoteId: string, status: 'accepted' | 'rejected'): Promise<RFQQuote> => {
    try {
      const { data, error } = await supabase
        .from('rfq_quotes')
        .update({ status })
        .eq('id', quoteId)
        .select(`
          *,
          factory:factories(
            id,
            legal_name_cn,
            legal_name_en,
            city,
            segment,
            email,
            contact_person
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Ошибка при обновлении статуса предложения');
    }
  };

  // Удалить предложение
  const deleteQuote = async (quoteId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('rfq_quotes')
        .delete()
        .eq('id', quoteId);

      if (error) throw error;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Ошибка при удалении предложения');
    }
  };

  useEffect(() => {
    if (user) {
      fetchRFQs();
    }
  }, [user]);

  return {
    rfqs,
    loading,
    error,
    createRFQ,
    updateRFQ,
    deleteRFQ,
    uploadAttachment,
    getAttachments,
    deleteAttachment,
    fetchRFQs,
    getFactoriesForSelection,
    getEmailTemplates,
    createEmailTemplate,
    sendRFQToFactories,
    getRFQSentStatus,
    getRFQQuotes,
    createQuote,
    updateQuoteStatus,
    deleteQuote
  };
};
