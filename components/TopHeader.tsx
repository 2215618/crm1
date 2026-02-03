"use client";

import React from 'react';

interface TopHeaderProps {
  title: string;
  showSearch?: boolean;
  onNewClick?: () => void;
  newLabel?: string;
}

export default function TopHeader({ title, showSearch = true, onNewClick, newLabel = "Nuevo" }: TopHeaderProps) {
  return (
    <header className="h-16 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark flex items-center justify-between px-8 shrink-0 z-20 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
      </div>
      <div className="flex items-center gap-4 flex-1 justify-end">
        {showSearch && (
          <div className="relative hidden lg:flex items-center w-full max-w-sm group">
            <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[20px] group-focus-within:text-primary transition-colors">search</span>
            <input className="w-full pl-10 pr-12 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white placeholder-slate-400 h-10 transition-all" placeholder="Buscar..." type="text"/>
          </div>
        )}
        <button className="relative p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full border-2 border-surface-light dark:border-surface-dark"></span>
        </button>
        {onNewClick && (
            <button 
                onClick={onNewClick}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white pl-3 pr-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 group"
            >
                <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform">add</span>
                <span className="text-sm font-bold">{newLabel}</span>
            </button>
        )}
      </div>
    </header>
  );
}