"use client";

import React, { PropsWithChildren } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path || (path !== '/' && pathname.startsWith(path));

  const navItems = [
    { path: '/', icon: 'dashboard', label: 'Dashboard' },
    { path: '/properties', icon: 'home', label: 'Propiedades' },
    { path: '/gold-list', icon: 'grade', label: 'Lista Dorada' },
    { path: '/appointments', icon: 'calendar_month', label: 'Citas' },
    { path: '/reports', icon: 'description', label: 'Reportes' },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark">
      <aside className="w-64 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark flex flex-col flex-shrink-0 z-30 hidden md:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary/10 size-8 rounded-lg flex items-center justify-center text-primary">
            <span className="material-symbols-outlined font-bold">domain</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-slate-900 dark:text-white text-base font-bold leading-none tracking-tight">LG Inmobiliaria</h1>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] font-medium mt-1 tracking-wide uppercase">CRM Premium</p>
          </div>
        </div>
        
        <nav className="flex-1 px-3 flex flex-col gap-1 overflow-y-auto hide-scrollbar py-2">
          {navItems.map(item => (
            <Link 
              key={item.path}
              href={item.path} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                isActive(item.path) 
                  ? 'bg-primary/10 text-primary border border-primary/10' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${isActive(item.path) ? 'fill' : ''}`}>{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border-light dark:border-border-dark">
          <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors mb-2">
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span className="text-sm font-medium">Configuración</span>
          </button>
          <div className="flex items-center gap-3 px-3 pt-2">
            <div className="size-9 rounded-full bg-gray-200 bg-cover bg-center ring-2 ring-white dark:ring-gray-700 shadow-sm" style={{backgroundImage: 'url("https://ui-avatars.com/api/?name=Alex+Morgan&background=random")'}}></div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Alex Morgan</span>
              <span className="text-[10px] text-slate-500 font-medium">Agent Senior</span>
            </div>
          </div>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}