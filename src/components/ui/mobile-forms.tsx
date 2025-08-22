'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Search, X, Check, AlertCircle, Upload, FileText, Image as ImageIcon } from 'lucide-react';
import { Input } from './input';
import { Textarea } from './textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { TouchButton } from './touch-button';
import { Badge } from './badge';
import { useIsMobile } from './use-mobile';
import { cn } from './utils';

// ============================================================================
// 1. MOBILE INPUT COMPONENT
// ============================================================================

interface MobileInputProps extends React.ComponentProps<typeof Input> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'search' | 'password';
  onClear?: () => void;
  onSearch?: (value: string) => void;
}

export function MobileInput({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  onClear,
  onSearch,
  className,
  ...props
}: MobileInputProps) {
  const isMobile = useIsMobile();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = variant === 'password' && !showPassword ? 'password' : 'text';

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (props.onChange) {
      const event = {
        target: { value: '' }
      } as React.ChangeEvent<HTMLInputElement>;
      props.onChange(event);
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(e.currentTarget.value);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            {leftIcon}
          </div>
        )}

        {/* Input */}
        <Input
          {...props}
          type={inputType}
          className={cn(
            'transition-all duration-200',
            isMobile && 'touch-target text-base',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            variant === 'search' && 'rounded-full',
            isFocused && 'ring-2 ring-primary/20 border-primary',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          style={{
            minHeight: isMobile ? '48px' : '36px',
            paddingLeft: leftIcon ? '2.5rem' : undefined,
            paddingRight: rightIcon ? '2.5rem' : undefined
          }}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          onKeyDown={variant === 'search' ? handleSearch : props.onKeyDown}
        />

        {/* Right Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {variant === 'password' && (
            <TouchButton
              variant="ghost"
              size="sm"
              icon={showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              onClick={() => setShowPassword(!showPassword)}
              className="p-1"
              touchTarget="default"
            />
          )}

          {variant === 'search' && props.value && (
            <TouchButton
              variant="ghost"
              size="sm"
              icon={<X className="w-4 h-4" />}
              onClick={handleClear}
              className="p-1"
              touchTarget="default"
            />
          )}

          {rightIcon && !variant && (
            <div className="text-gray-400 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
      </div>

      {/* Error or Helper Text */}
      {(error || helperText) && (
        <div className="flex items-center gap-2 text-sm">
          {error ? (
            <>
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-red-600">{error}</span>
            </>
          ) : (
            <span className="text-gray-500">{helperText}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 2. MOBILE TEXTAREA COMPONENT
// ============================================================================

interface MobileTextareaProps extends React.ComponentProps<typeof Textarea> {
  label?: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCharacterCount?: boolean;
}

export function MobileTextarea({
  label,
  error,
  helperText,
  maxLength,
  showCharacterCount = true,
  className,
  ...props
}: MobileTextareaProps) {
  const isMobile = useIsMobile();
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length);
    props.onChange?.(e);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        <Textarea
          {...props}
          onChange={handleChange}
          className={cn(
            'transition-all duration-200 resize-none',
            isMobile && 'touch-target text-base',
            isFocused && 'ring-2 ring-primary/20 border-primary',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          style={{
            minHeight: isMobile ? '120px' : '80px'
          }}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />

        {/* Character Count */}
        {maxLength && showCharacterCount && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {charCount}/{maxLength}
          </div>
        )}
      </div>

      {/* Error or Helper Text */}
      {(error || helperText) && (
        <div className="flex items-center gap-2 text-sm">
          {error ? (
            <>
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-red-600">{error}</span>
            </>
          ) : (
            <span className="text-gray-500">{helperText}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 3. MOBILE SELECT COMPONENT
// ============================================================================

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface MobileSelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  className?: string;
}

export function MobileSelect({
  label,
  placeholder = 'Выберите опцию',
  options,
  value,
  onValueChange,
  error,
  helperText,
  disabled,
  searchable = false,
  multiple = false,
  className
}: MobileSelectProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = searchable
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          className={cn(
            'transition-all duration-200',
            isMobile && 'touch-target text-base',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          style={{
            minHeight: isMobile ? '48px' : '36px'
          }}
        >
          <SelectValue placeholder={placeholder}>
            {selectedOption && (
              <div className="flex items-center gap-2">
                {selectedOption.icon}
                <span>{selectedOption.label}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>

        <SelectContent
          className={cn(
            'max-h-60',
            isMobile && 'w-[calc(100vw-2rem)] max-w-none'
          )}
        >
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <MobileInput
                placeholder="Поиск..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                variant="search"
                className="text-sm"
              />
            </div>
          )}

          {filteredOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className={cn(
                'flex items-center gap-2',
                isMobile && 'py-3'
              )}
            >
              {option.icon}
              <span>{option.label}</span>
            </SelectItem>
          ))}

          {filteredOptions.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              Ничего не найдено
            </div>
          )}
        </SelectContent>
      </Select>

      {/* Error or Helper Text */}
      {(error || helperText) && (
        <div className="flex items-center gap-2 text-sm">
          {error ? (
            <>
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-red-600">{error}</span>
            </>
          ) : (
            <span className="text-gray-500">{helperText}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 4. MOBILE FILE UPLOAD COMPONENT
// ============================================================================

interface MobileFileUploadProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  onFilesSelect?: (files: File[]) => void;
  error?: string;
  helperText?: string;
  className?: string;
}

export function MobileFileUpload({
  label,
  accept = '*/*',
  multiple = false,
  maxSize = 10,
  onFilesSelect,
  error,
  helperText,
  className
}: MobileFileUploadProps) {
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      if (maxSize && file.size > maxSize * 1024 * 1024) {
        alert(`Файл ${file.name} слишком большой. Максимальный размер: ${maxSize}MB`);
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);
    onFilesSelect?.(validFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelect?.(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200',
          dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400',
          error && 'border-red-500',
          className
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          minHeight: isMobile ? '120px' : '100px'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-gray-100 rounded-full">
              <Upload className="w-6 h-6 text-gray-600" />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700">
              Перетащите файлы сюда или
            </p>
            <TouchButton
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              touchTarget="default"
            >
              Выберите файлы
            </TouchButton>
          </div>

          <p className="text-xs text-gray-500">
            Максимальный размер файла: {maxSize}MB
          </p>
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Выбранные файлы ({selectedFiles.length})
          </p>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="p-2 bg-white rounded">
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="w-4 h-4 text-gray-600" />
                  ) : (
                    <FileText className="w-4 h-4 text-gray-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <TouchButton
                  variant="ghost"
                  size="sm"
                  icon={<X className="w-4 h-4" />}
                  onClick={() => removeFile(index)}
                  touchTarget="default"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error or Helper Text */}
      {(error || helperText) && (
        <div className="flex items-center gap-2 text-sm">
          {error ? (
            <>
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-red-600">{error}</span>
            </>
          ) : (
            <span className="text-gray-500">{helperText}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 5. MOBILE FORM GROUP COMPONENT
// ============================================================================

interface MobileFormGroupProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function MobileFormGroup({
  children,
  title,
  description,
  className
}: MobileFormGroupProps) {
  const isMobile = useIsMobile();

  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className={cn(
              'font-medium text-gray-900',
              isMobile ? 'text-lg' : 'text-base'
            )}>
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// 6. MOBILE FORM ACTIONS COMPONENT
// ============================================================================

interface MobileFormActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileFormActions({
  children,
  className
}: MobileFormActionsProps) {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      'flex gap-3',
      isMobile ? 'flex-col' : 'flex-row justify-end',
      className
    )}>
      {children}
    </div>
  );
}
