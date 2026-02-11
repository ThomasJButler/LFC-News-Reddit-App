import React from 'react';
import { Avatar as AvatarRoot, AvatarFallback } from '@/components/ui/avatar';
import { getAvatarData } from '@/utils/colorHash';
import { cn } from '@/lib/utils';

/**
 * Avatar — username-based colored avatar using ShadCN Avatar + colorHash utility.
 * Generates a consistent background color and initial from the Reddit username.
 */
function Avatar({
  username,
  size = 'default',
  className = '',
  showBorder = false,
  borderColor = null,
}) {
  const { backgroundColor, textColor, initial } = getAvatarData(username);

  return (
    <AvatarRoot
      size={size}
      data-testid="avatar"
      className={cn(
        'transition-transform duration-200 hover:scale-105',
        showBorder && 'ring-2 ring-offset-1 ring-offset-transparent',
        className
      )}
      style={showBorder && borderColor ? { '--tw-ring-color': borderColor } : undefined}
    >
      <AvatarFallback
        className="font-bold uppercase tracking-wide"
        style={{ backgroundColor, color: textColor }}
        title={username}
        aria-hidden="true"
      >
        {initial}
      </AvatarFallback>
    </AvatarRoot>
  );
}

export default Avatar;
