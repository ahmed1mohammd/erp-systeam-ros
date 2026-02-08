
import React from 'react';
import { useApp } from '../context/AppContext';
import { Palette, RefreshCcw, Save, Check } from 'lucide-react';

const Settings: React.FC = () => {
  const { theme, updateTheme } = useApp();

  const presets = [
    { name: 'الافتراضي (غابة)', primary: '#16423C', secondary: '#6A9C89', bg: '#E9EFEC', accent: '#C4DAD2' },
    { name: 'البحري العميق', primary: '#1E3A8A', secondary: '#3B82F6', bg: '#EFF6FF', accent: '#DBEAFE' },
    { name: 'الملكي البنفسجي', primary: '#4C1D95', secondary: '#8B5CF6', bg: '#F5F3FF', accent: '#EDE9FE' },
    { name: 'الرمادي الاحترافي', primary: '#1F2937', secondary: '#4B5563', bg: '#F9FAFB', accent: '#F3F4F6' },
    { name: 'العنابي الدافئ', primary: '#7F1D1D', secondary: '#B91C1C', bg: '#FEF2F2', accent: '#FEE2E2' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500" dir="rtl">
      <div className="bg-white p-8 rounded-[2.5rem] border border-brand-accent/30 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-brand-primary text-white rounded-2xl shadow-lg">
            <Palette size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-brand-primary">إعدادات المظهر والسمة</h2>
            <p className="text-brand-secondary font-bold">خصص ألوان النظام بما يتناسب مع هويتك التجارية</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <h3 className="text-lg font-black text-brand-primary border-r-4 border-brand-secondary pr-4">الألوان المخصصة</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ColorPicker 
                label="اللون الرئيسي" 
                value={theme.primary} 
                onChange={(val) => updateTheme({ primary: val })} 
              />
              <ColorPicker 
                label="اللون الثانوي" 
                value={theme.secondary} 
                onChange={(val) => updateTheme({ secondary: val })} 
              />
              <ColorPicker 
                label="لون الخلفية" 
                value={theme.bg} 
                onChange={(val) => updateTheme({ bg: val })} 
              />
              <ColorPicker 
                label="لون التأكيد (Accent)" 
                value={theme.accent} 
                onChange={(val) => updateTheme({ accent: val })} 
              />
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-lg font-black text-brand-primary border-r-4 border-brand-secondary pr-4">نماذج جاهزة</h3>
            <div className="space-y-4">
              {presets.map((preset) => (
                <button 
                  key={preset.name}
                  onClick={() => updateTheme(preset)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-brand-primary hover:bg-white transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full border-2 border-white" style={{ backgroundColor: preset.primary }}></div>
                      <div className="w-8 h-8 rounded-full border-2 border-white" style={{ backgroundColor: preset.secondary }}></div>
                      <div className="w-8 h-8 rounded-full border-2 border-white" style={{ backgroundColor: preset.bg }}></div>
                    </div>
                    <span className="font-bold text-slate-700 group-hover:text-brand-primary transition-colors">{preset.name}</span>
                  </div>
                  {theme.primary === preset.primary && (
                    <div className="w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center">
                      <Check size={14} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-12 border-4 border-dashed border-brand-accent/30 rounded-[3rem] bg-brand-primary/5">
        <div className="text-center space-y-4">
          <RefreshCcw className="mx-auto text-brand-secondary animate-spin-slow" size={48} />
          <h3 className="text-xl font-black text-brand-primary">معاينة مباشرة</h3>
          <p className="text-slate-500 font-bold max-w-sm">يتم تطبيق التعديلات لحظياً على كافة واجهات النظام. يتم حفظ الإعدادات تلقائياً في متصفحك.</p>
        </div>
      </div>
    </div>
  );
};

const ColorPicker: React.FC<{ label: string, value: string, onChange: (val: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="block text-sm font-black text-brand-primary">{label}</label>
    <div className="flex items-center gap-3 p-3 bg-white border-2 border-brand-accent/30 rounded-2xl shadow-sm focus-within:border-brand-primary transition-all">
      <input 
        type="color" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
      />
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent outline-none font-bold text-brand-primary uppercase text-sm"
      />
    </div>
  </div>
);

export default Settings;
