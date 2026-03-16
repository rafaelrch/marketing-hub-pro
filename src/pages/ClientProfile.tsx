import { useState } from 'react';
import { ArrowLeft, Download, Instagram, Facebook, Linkedin, Video, Palette, Type, LayoutTemplate } from 'lucide-react';
import { useClients } from '@/hooks/useSupabaseData';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';

interface ClientProfileProps {
  clientId: string;
  onBack: () => void;
}

export function ClientProfile({ clientId, onBack }: ClientProfileProps) {
  const { data: clients, loading } = useClients();
  const client = clients.find(c => c.id === clientId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <EmptyState
          icon={LayoutTemplate}
          title="Cliente não encontrado"
          description="O cliente que você está procurando não existe ou foi removido."
        />
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleDownloadLogo = () => {
    if (client.logo_url || client.logo) {
      const link = document.createElement('a');
      link.href = client.logo_url || client.logo;
      link.download = `logo-${client.name.replace(/\s+/g, '-').toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para Clientes
      </button>

      {/* Hero Section */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="h-32 w-full" style={{ backgroundColor: client.color }} />
        <div className="px-6 sm:px-10 pb-8">
          <div className="relative flex flex-col sm:flex-row sm:items-end gap-6 -mt-16">
            <div className="relative group">
              {(client.logo_url || client.logo) ? (
                <img 
                  src={client.logo_url || client.logo} 
                  alt={client.name}
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-card bg-card shadow-lg"
                />
              ) : (
                <div 
                  className="w-32 h-32 rounded-2xl flex items-center justify-center text-4xl font-bold text-white border-4 border-card shadow-lg"
                  style={{ backgroundColor: client.color }}
                >
                  {getInitials(client.name)}
                </div>
              )}
            </div>
            
            <div className="flex-1 pb-2">
              <h1 className="text-3xl font-bold text-foreground mb-1">{client.name}</h1>
              <p className="text-muted-foreground font-medium">{client.segment}</p>
            </div>

            <div className="flex items-center gap-3 pb-2 z-10">
              {(client.logo_url || client.logo) && (
                <button 
                  onClick={handleDownloadLogo}
                  className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium text-sm"
                >
                  <Download className="w-4 h-4" /> Baixar Logo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Detalhes do Contrato</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Início do Contrato</p>
                <p className="font-medium text-foreground">{client.contract_start ? new Date(client.contract_start).toLocaleDateString('pt-BR') : 'Não informado'}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Valor do Contrato</p>
                <p className="font-medium text-foreground">
                  {client.contract_value 
                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.contract_value)
                    : 'Não informado'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Meses de Contrato</p>
                <p className="font-medium text-foreground">{client.contract_months ? `${client.contract_months} meses` : 'Não informado'}</p>
              </div>

              {client.services_sold && client.services_sold.length > 0 && (
                <div className="pt-2 border-t border-border mt-2">
                  <p className="text-sm text-muted-foreground mb-3 mt-2">Serviços Contratados</p>
                  <div className="flex flex-wrap gap-2">
                    {client.services_sold.map((service, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {(client.socials?.instagram || client.socials?.facebook || client.socials?.tiktok || client.socials?.linkedin) && (
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4">Redes Sociais</h2>
              <div className="space-y-3">
                {client.socials?.instagram && (
                  <a href={client.socials.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted transition-all hover:-translate-y-0.5 card-hover">
                    <div className="bg-pink-100 dark:bg-pink-500/10 p-2 rounded-lg">
                        <Instagram className="w-5 h-5 text-pink-500 dark:text-pink-400" />
                    </div>
                    <span className="text-sm font-medium">Instagram</span>
                  </a>
                )}
                {client.socials?.facebook && (
                  <a href={client.socials.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted transition-all hover:-translate-y-0.5 card-hover">
                    <div className="bg-blue-100 dark:bg-blue-500/10 p-2 rounded-lg">
                        <Facebook className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium">Facebook</span>
                  </a>
                )}
                {client.socials?.linkedin && (
                  <a href={client.socials.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted transition-all hover:-translate-y-0.5 card-hover">
                     <div className="bg-blue-100 dark:bg-blue-500/20 p-2 rounded-lg">
                        <Linkedin className="w-5 h-5 text-blue-700 dark:text-blue-500" />
                    </div>
                    <span className="text-sm font-medium">LinkedIn</span>
                  </a>
                )}
                {client.socials?.tiktok && (
                  <a href={client.socials.tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted transition-all hover:-translate-y-0.5 card-hover">
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                        <span className="w-5 h-5 flex items-center justify-center font-bold text-black dark:text-white pb-0.5">TT</span>
                    </div>
                    <span className="text-sm font-medium">TikTok</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Brand Guide */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm h-full">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-primary">
              <Palette className="w-6 h-6" />
              Guia de Marca
            </h2>

            <div className="space-y-10">
              {/* Colors */}
              <div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 border-b border-border pb-2">Paleta de Cores</h3>
                {client.brand_guide?.colors && client.brand_guide.colors.length > 0 ? (
                  <div className="flex flex-wrap gap-6 mt-6">
                    {client.brand_guide.colors.map((color, idx) => (
                      <div key={idx} className="group flex flex-col items-center">
                        <div 
                          className="w-20 h-20 rounded-2xl shadow-sm border border-border mb-3 transition-transform group-hover:scale-105 group-hover:shadow-md" 
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs font-mono font-medium text-foreground bg-muted px-2 py-1 rounded-md uppercase">{color}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center bg-muted/30 rounded-xl border border-dashed border-border mt-4">
                    <p className="text-sm text-muted-foreground">Nenhuma cor definida.</p>
                  </div>
                )}
              </div>

              {/* Typography */}
              <div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 border-b border-border pb-2 flex items-center gap-2">
                  <Type className="w-4 h-4" /> Tipografia
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="p-5 rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-colors">
                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-2">Fonte Principal</p>
                    <p className="font-bold text-2xl text-foreground" style={{ fontFamily: client.brand_guide?.typography?.primary || 'inherit' }}>
                        {client.brand_guide?.typography?.primary || 'Não definida'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 font-mono" style={{ fontFamily: client.brand_guide?.typography?.primary || 'inherit' }}>
                        Aa Bb Cc Dd Ee Ff Gg
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-colors">
                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-2">Fonte Secundária</p>
                    <p className="font-medium text-2xl text-foreground" style={{ fontFamily: client.brand_guide?.typography?.secondary || 'inherit' }}>
                        {client.brand_guide?.typography?.secondary || 'Não definida'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 font-mono" style={{ fontFamily: client.brand_guide?.typography?.secondary || 'inherit' }}>
                        Aa Bb Cc Dd Ee Ff Gg
                    </p>
                  </div>
                </div>
              </div>

              {/* References */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                <div>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 border-b border-border pb-2 flex items-center gap-2">
                    <LayoutTemplate className="w-4 h-4" /> Ref. Design
                  </h3>
                  {client.brand_guide?.design_references && client.brand_guide.design_references.length > 0 ? (
                    <ul className="space-y-3 mt-4">
                      {client.brand_guide.design_references.map((ref, idx) => (
                        <li key={idx}>
                          <a href={ref} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-xl bg-muted/50 hover:bg-muted border border-transparent hover:border-border transition-all text-sm font-medium text-foreground hover:text-primary">
                            <span className="truncate">{ref}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="py-6 text-center bg-muted/30 rounded-xl border border-dashed border-border mt-4">
                        <p className="text-sm text-muted-foreground">Nenhuma referência de design.</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 border-b border-border pb-2 flex items-center gap-2">
                    <Video className="w-4 h-4" /> Ref. Vídeo
                  </h3>
                  {client.brand_guide?.video_references && client.brand_guide.video_references.length > 0 ? (
                    <ul className="space-y-3 mt-4">
                      {client.brand_guide.video_references.map((ref, idx) => (
                        <li key={idx}>
                          <a href={ref} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-xl bg-muted/50 hover:bg-muted border border-transparent hover:border-border transition-all text-sm font-medium text-foreground hover:text-primary">
                            <span className="truncate">{ref}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                     <div className="py-6 text-center bg-muted/30 rounded-xl border border-dashed border-border mt-4">
                        <p className="text-sm text-muted-foreground">Nenhuma referência de vídeo.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
