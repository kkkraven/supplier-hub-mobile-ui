import React from 'react';
import { Phone, Mail, Globe, MessageCircle, MapPin, ExternalLink, Copy } from 'lucide-react';
import { Button } from './button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

interface ContactInfoProps {
  wechatId: string;
  phone: string;
  email?: string;
  website?: string;
  address: string;
  className?: string;
  showCopyButtons?: boolean;
  compact?: boolean;
}

export function ContactInfo({
  wechatId,
  phone,
  email,
  website,
  address,
  className = "",
  showCopyButtons = false,
  compact = false
}: ContactInfoProps) {
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    // Здесь можно добавить toast уведомление
  };

  const ContactItem = ({ 
    icon: Icon, 
    label, 
    value, 
    color, 
    href, 
    copyValue 
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    color: string;
    href?: string;
    copyValue?: string;
  }) => (
    <div className={`flex items-center gap-3 ${compact ? 'text-sm' : 'text-base'}`}>
      <div className={`flex-shrink-0 w-5 h-5 ${color}`}>
        <Icon className="w-full h-full" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-gray-600 font-medium">{label}</div>
        <div className="font-mono text-gray-900 truncate">
          {href ? (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              {value}
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            value
          )}
        </div>
      </div>
      
      {showCopyButtons && copyValue && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex-shrink-0 w-8 h-8 p-0"
                onClick={() => copyToClipboard(copyValue, label)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Скопировать {label.toLowerCase()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );

  return (
    <div className={`space-y-3 ${className}`}>
      {/* WeChat ID */}
      <ContactItem
        icon={MessageCircle}
        label="WeChat ID"
        value={wechatId}
        color="text-green-500"
        copyValue={wechatId}
      />

      {/* Phone */}
      <ContactItem
        icon={Phone}
        label="Телефон"
        value={phone}
        color="text-blue-500"
        href={`tel:${phone}`}
        copyValue={phone}
      />

      {/* Email */}
      {email && (
        <ContactItem
          icon={Mail}
          label="Email"
          value={email}
          color="text-red-500"
          href={`mailto:${email}`}
          copyValue={email}
        />
      )}

      {/* Website */}
      {website && (
        <ContactItem
          icon={Globe}
          label="Веб-сайт"
          value={website}
          color="text-purple-500"
          href={website.startsWith('http') ? website : `https://${website}`}
          copyValue={website}
        />
      )}

      {/* Address */}
      <ContactItem
        icon={MapPin}
        label="Адрес"
        value={address}
        color="text-gray-500"
        copyValue={address}
      />
    </div>
  );
}
