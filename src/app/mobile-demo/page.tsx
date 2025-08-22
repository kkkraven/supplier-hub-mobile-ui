'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MobileInput } from '@/components/ui/mobile-forms';
import { MobileTextarea } from '@/components/ui/mobile-forms';
import { MobileSelect } from '@/components/ui/mobile-forms';
import { MobileFileUpload } from '@/components/ui/mobile-forms';
import { MobileFormGroup } from '@/components/ui/mobile-forms';
import { MobileFormActions } from '@/components/ui/mobile-forms';
import { MobileRating } from '@/components/ui/mobile-interactive';
import { MobileSlider } from '@/components/ui/mobile-interactive';
import { MobileToggle } from '@/components/ui/mobile-interactive';
import { MobileProgressBar } from '@/components/ui/mobile-interactive';
import { MobileInteractionButton } from '@/components/ui/mobile-interactive';
import { MobilePagination } from '@/components/ui/mobile-pagination';
import { MobileInfiniteScroll } from '@/components/ui/mobile-pagination';
import { TouchButton } from '@/components/ui/touch-button';
import { MobileFadeIn, MobileStagger, MobileScale, MobileSlide, MobileBounce, MobileRotate, MobileTyping, MobileProgressiveDisclosure, MobileHoverEffects } from '@/components/ui/mobile-animations';
import { MobilePageTransition, MobileModalTransition, MobileDrawerTransition, MobileListTransition, MobileStateTransition, MobileLoadingTransition, MobileErrorTransition, MobileSuccessTransition } from '@/components/ui/mobile-transitions';
import { Search, Mail, Phone, User, Lock, Star, Heart, MessageCircle, Share2, X } from 'lucide-react';

export default function MobileDemoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    category: '',
    description: '',
    rating: 4,
    sliderValue: 50,
    toggleValue: false,
    progressValue: 75
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentState, setCurrentState] = useState('idle');
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (currentPage >= 5) {
        setHasMore(false);
      } else {
        setCurrentPage(prev => prev + 1);
      }
    }, 1000);
  };

  const handleLoadingDemo = () => {
    setIsLoadingDemo(true);
    setTimeout(() => setIsLoadingDemo(false), 2000);
  };

  const handleErrorDemo = () => {
    setHasError(true);
    setTimeout(() => setHasError(false), 3000);
  };

  const handleSuccessDemo = () => {
    setIsSuccess(true);
  };

  return (
    <MobilePageTransition>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          {/* Header */}
          <MobileFadeIn direction="up" delay={200}>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                <MobileTyping text="Мобильные компоненты" speed={100} />
              </h1>
              <p className="text-lg text-gray-600">
                Демонстрация адаптивных компонентов для мобильных устройств
              </p>
            </div>
          </MobileFadeIn>

          {/* Animations Section */}
          <MobileSlide direction="up" delay={300}>
            <Card>
              <CardHeader>
                <CardTitle>Анимации и эффекты</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <MobileStagger staggerDelay={150}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MobileScale scale={0.9}>
                      <div className="p-4 bg-white border border-gray-200 rounded-lg text-center">
                        <h3 className="font-medium mb-2">Fade In</h3>
                        <p className="text-sm text-gray-600">Плавное появление</p>
                      </div>
                    </MobileScale>

                    <MobileBounce delay={200}>
                      <div className="p-4 bg-white border border-gray-200 rounded-lg text-center">
                        <h3 className="font-medium mb-2">Bounce</h3>
                        <p className="text-sm text-gray-600">Отскок при появлении</p>
                      </div>
                    </MobileBounce>

                    <MobileRotate angle={3}>
                      <div className="p-4 bg-white border border-gray-200 rounded-lg text-center">
                        <h3 className="font-medium mb-2">Rotate</h3>
                        <p className="text-sm text-gray-600">Поворот при появлении</p>
                      </div>
                    </MobileRotate>

                    <MobileHoverEffects effect="lift">
                      <div className="p-4 bg-white border border-gray-200 rounded-lg text-center cursor-pointer">
                        <h3 className="font-medium mb-2">Hover Effects</h3>
                        <p className="text-sm text-gray-600">Эффекты при наведении</p>
                      </div>
                    </MobileHoverEffects>
                  </div>
                </MobileStagger>

                <MobileProgressiveDisclosure steps={4}>
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">Шаг 1: Инициализация</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700">Шаг 2: Загрузка данных</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-700">Шаг 3: Обработка</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-700">Шаг 4: Завершение</p>
                    </div>
                  </div>
                </MobileProgressiveDisclosure>
              </CardContent>
            </Card>
          </MobileSlide>

          {/* Transitions Section */}
          <MobileSlide direction="up" delay={400}>
            <Card>
              <CardHeader>
                <CardTitle>Переходы и состояния</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TouchButton
                    variant="outline"
                    onClick={() => setIsModalOpen(true)}
                    className="w-full"
                  >
                    Открыть модал
                  </TouchButton>

                  <TouchButton
                    variant="outline"
                    onClick={() => setIsDrawerOpen(true)}
                    className="w-full"
                  >
                    Открыть drawer
                  </TouchButton>

                  <TouchButton
                    variant="outline"
                    onClick={handleLoadingDemo}
                    className="w-full"
                  >
                    Демо загрузки
                  </TouchButton>

                  <TouchButton
                    variant="outline"
                    onClick={handleErrorDemo}
                    className="w-full"
                  >
                    Демо ошибки
                  </TouchButton>

                  <TouchButton
                    variant="outline"
                    onClick={handleSuccessDemo}
                    className="w-full"
                  >
                    Демо успеха
                  </TouchButton>

                  <TouchButton
                    variant="outline"
                    onClick={() => setCurrentState(currentState === 'idle' ? 'loading' : 'idle')}
                    className="w-full"
                  >
                    Переключить состояние
                  </TouchButton>
                </div>

                <MobileStateTransition
                  state={currentState}
                  states={{
                    idle: <div className="p-4 bg-gray-50 rounded-lg text-center">Ожидание</div>,
                    loading: <div className="p-4 bg-blue-50 rounded-lg text-center">Загрузка...</div>
                  }}
                />

                <MobileLoadingTransition isLoading={isLoadingDemo}>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    Контент загружен
                  </div>
                </MobileLoadingTransition>

                <MobileErrorTransition hasError={hasError}>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    Обычный контент
                  </div>
                </MobileErrorTransition>

                <MobileSuccessTransition 
                  isSuccess={isSuccess}
                  onSuccessComplete={() => setIsSuccess(false)}
                >
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    Обычный контент
                  </div>
                </MobileSuccessTransition>
              </CardContent>
            </Card>
          </MobileSlide>

          {/* Forms Section */}
          <MobileSlide direction="up" delay={500}>
            <Card>
              <CardHeader>
                <CardTitle>Формы и поля ввода</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <MobileFormGroup title="Основная информация">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MobileInput
                      label="Имя"
                      placeholder="Введите ваше имя"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      leftIcon={<User className="w-4 h-4" />}
                    />

                    <MobileInput
                      label="Email"
                      type="email"
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      leftIcon={<Mail className="w-4 h-4" />}
                    />

                    <MobileInput
                      label="Телефон"
                      type="tel"
                      placeholder="+7 (999) 123-45-67"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      leftIcon={<Phone className="w-4 h-4" />}
                    />

                    <MobileInput
                      label="Пароль"
                      type="password"
                      placeholder="Введите пароль"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      leftIcon={<Lock className="w-4 h-4" />}
                      variant="password"
                    />
                  </div>
                </MobileFormGroup>

                <MobileFormGroup title="Поиск">
                  <MobileInput
                    placeholder="Поиск по сайту..."
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    leftIcon={<Search className="w-4 h-4" />}
                    variant="search"
                    onSearch={(value) => console.log('Search:', value)}
                  />
                </MobileFormGroup>

                <MobileFormGroup title="Выбор категории">
                  <MobileSelect
                    label="Категория"
                    placeholder="Выберите категорию"
                    options={[
                      { value: 'knit', label: 'Трикотаж' },
                      { value: 'woven', label: 'Ткань' },
                      { value: 'denim', label: 'Джинс' },
                      { value: 'activewear', label: 'Спортивная одежда' }
                    ]}
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                    searchable={true}
                  />
                </MobileFormGroup>

                <MobileFormGroup title="Описание">
                  <MobileTextarea
                    label="Описание проекта"
                    placeholder="Подробно опишите ваш проект..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    maxLength={500}
                    showCharacterCount={true}
                  />
                </MobileFormGroup>

                <MobileFormGroup title="Загрузка файлов">
                  <MobileFileUpload
                    label="Технические файлы"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    multiple={true}
                    maxSize={10}
                    onFilesSelect={(files) => console.log('Selected files:', files)}
                    helperText="Максимальный размер файла: 10MB"
                  />
                </MobileFormGroup>

                <MobileFormActions>
                  <TouchButton variant="outline" size="lg">
                    Отмена
                  </TouchButton>
                  <TouchButton variant="primary" size="lg">
                    Сохранить
                  </TouchButton>
                </MobileFormActions>
              </CardContent>
            </Card>
          </MobileSlide>

          {/* Interactive Elements Section */}
          <MobileSlide direction="up" delay={600}>
            <Card>
              <CardHeader>
                <CardTitle>Интерактивные элементы</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <MobileFormGroup title="Рейтинг">
                  <MobileRating
                    value={formData.rating}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, rating: value }))}
                    showValue={true}
                    size="lg"
                  />
                </MobileFormGroup>

                <MobileFormGroup title="Слайдер">
                  <MobileSlider
                    value={formData.sliderValue}
                    min={0}
                    max={100}
                    step={5}
                    showValue={true}
                    showLabels={true}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, sliderValue: value }))}
                  />
                </MobileFormGroup>

                <MobileFormGroup title="Переключатели">
                  <div className="space-y-4">
                    <MobileToggle
                      checked={formData.toggleValue}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, toggleValue: checked }))}
                      label="Уведомления"
                      description="Получать уведомления о новых предложениях"
                    />
                    
                    <MobileToggle
                      checked={!formData.toggleValue}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, toggleValue: !checked }))}
                      label="Автосохранение"
                      description="Автоматически сохранять черновики"
                      size="lg"
                    />
                  </div>
                </MobileFormGroup>

                <MobileFormGroup title="Прогресс">
                  <MobileProgressBar
                    value={formData.progressValue}
                    max={100}
                    showValue={true}
                    animated={true}
                    variant="success"
                  />
                </MobileFormGroup>

                <MobileFormGroup title="Кнопки взаимодействия">
                  <div className="flex flex-wrap gap-4">
                    <MobileInteractionButton
                      type="like"
                      count={42}
                      active={true}
                      onClick={() => console.log('Like clicked')}
                    />
                    <MobileInteractionButton
                      type="heart"
                      count={128}
                      onClick={() => console.log('Heart clicked')}
                    />
                    <MobileInteractionButton
                      type="comment"
                      count={15}
                      onClick={() => console.log('Comment clicked')}
                    />
                    <MobileInteractionButton
                      type="share"
                      onClick={() => console.log('Share clicked')}
                    />
                  </div>
                </MobileFormGroup>
              </CardContent>
            </Card>
          </MobileSlide>

          {/* Pagination Section */}
          <MobileSlide direction="up" delay={700}>
            <Card>
              <CardHeader>
                <CardTitle>Пагинация и загрузка</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <MobileFormGroup title="Пагинация">
                  <MobilePagination
                    currentPage={currentPage}
                    totalPages={10}
                    onPageChange={setCurrentPage}
                    showFirstLast={true}
                    showPageNumbers={true}
                  />
                </MobileFormGroup>

                <MobileFormGroup title="Бесконечная прокрутка">
                  <MobileInfiniteScroll
                    hasMore={hasMore}
                    isLoading={isLoading}
                    onLoadMore={handleLoadMore}
                    loadingText="Загружаем еще..."
                    endText="Больше данных нет"
                  />
                </MobileFormGroup>
              </CardContent>
            </Card>
          </MobileSlide>

          {/* Touch Buttons Section */}
          <MobileSlide direction="up" delay={800}>
            <Card>
              <CardHeader>
                <CardTitle>Touch-оптимизированные кнопки</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <TouchButton variant="default" size="lg" touchTarget="large">
                    Основная
                  </TouchButton>
                  <TouchButton variant="outline" size="lg" touchTarget="large">
                    Вторичная
                  </TouchButton>
                  <TouchButton variant="ghost" size="lg" touchTarget="large">
                    Призрачная
                  </TouchButton>
                  <TouchButton variant="secondary" size="lg" touchTarget="large">
                    Дополнительная
                  </TouchButton>
                </div>

                <div className="flex justify-center gap-4">
                  <TouchButton
                    variant="outline"
                    size="lg"
                    icon={<Star className="w-5 h-5" />}
                    touchTarget="large"
                  >
                    С избранного
                  </TouchButton>
                  <TouchButton
                    variant="primary"
                    size="lg"
                    icon={<Heart className="w-5 h-5" />}
                    touchTarget="large"
                  >
                    Нравится
                  </TouchButton>
                </div>
              </CardContent>
            </Card>
          </MobileSlide>

          {/* Responsive Layout Demo */}
          <MobileSlide direction="up" delay={900}>
            <Card>
              <CardHeader>
                <CardTitle>Адаптивный макет</CardTitle>
              </CardHeader>
              <CardContent>
                <MobileListTransition>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <div
                        key={item}
                        className="p-4 bg-white border border-gray-200 rounded-lg text-center"
                      >
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-primary font-semibold">{item}</span>
                        </div>
                        <p className="text-sm text-gray-600">Элемент {item}</p>
                      </div>
                    ))}
                  </div>
                </MobileListTransition>
              </CardContent>
            </Card>
          </MobileSlide>
        </div>
      </div>

      {/* Modal Demo */}
      <MobileModalTransition
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Модальное окно</h3>
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 mb-4">
            Это демонстрация модального окна с плавными анимациями.
          </p>
          <div className="flex gap-3">
            <TouchButton
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Отмена
            </TouchButton>
            <TouchButton
              variant="primary"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Подтвердить
            </TouchButton>
          </div>
        </div>
      </MobileModalTransition>

      {/* Drawer Demo */}
      <MobileDrawerTransition
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        side="right"
      >
        <div className="bg-white h-full w-80 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Боковая панель</h3>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Пункт меню 1</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Пункт меню 2</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Пункт меню 3</p>
            </div>
          </div>
        </div>
      </MobileDrawerTransition>
    </MobilePageTransition>
  );
}
