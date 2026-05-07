// components/IconResolver.tsx
'use client';

import React from 'react';
import { LucideProps } from 'lucide-react';
import { Plus, File, Folder, ChevronDown, Table } from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  plus: Plus,
  file: File,
  folder: Folder,
  table: Table,
  chevrondown: ChevronDown,
};

interface IconResolverProps extends LucideProps {
  name: string;
}

export function IconResolver({ name, ...props }: IconResolverProps) {
  const key = name.replace(/Icon$/, '').toLowerCase();
  const IconComponent = ICON_MAP[key];

  if (!IconComponent) {
    console.warn(
      `IconResolver: no mapping for "${name}", using File as fallback.`,
    );
    return <File {...props} />;
  }

  return <IconComponent {...props} />;
}
