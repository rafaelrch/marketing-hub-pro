import { useState, useMemo, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  PlusIcon,
  ClockIcon,
  MapPinIcon,
  VideoCameraIcon,
  LinkIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  TrashIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCaptations, Captation, CaptationItem, CaptationReference, CaptationTake } from '@/hooks/useSupabaseData';

interface CaptationsPageProps {
  searchQuery: string;
}

// Tipos locais para formulário
interface FormItem {
  name: string;
  quantity: number;
}

interface FormReference {
  type: 'link' | 'file';
  url: string;
  name: string;
}

interface FormTake {
  id: string;
  description: string;
  completed: boolean;
}

// Componente do Card de Captação no Calendário
function CaptationCard({ 
  captation, 
  onClick 
}: { 
  captation: Captation; 
  onClick: () => void;
}) {
  const statusColors = {
    scheduled: 'bg-blue-500/10 border-blue-500/30 text-blue-600',
    in_progress: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600',
    completed: 'bg-green-500/10 border-green-500/30 text-green-600',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-1.5 rounded-lg border transition-all hover:shadow-md",
        statusColors[captation.status]
      )}
    >
      <div className="flex items-center gap-1">
        <ClockIcon className="w-3 h-3 flex-shrink-0" />
        <span className="text-xs font-medium">{captation.time}</span>
      </div>
      <p className="text-xs font-semibold truncate mt-0.5">{captation.title}</p>
    </button>
  );
}

// Modal de Detalhes da Captação
function CaptationDetailModal({
  captation,
  isOpen,
  onClose,
  onOpenScripts,
  onMarkCompleted,
  onEdit,
}: {
  captation: Captation | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenScripts: () => void;
  onMarkCompleted: (captationId: string) => void;
  onEdit: () => void;
}) {
  if (!captation) return null;

  const formattedDate = format(new Date(captation.date + 'T12:00:00'), "EEEE, dd 'de' MMMM", { locale: ptBR });
  const isCompleted = captation.status === 'completed';
  const items = captation.items || [];
  const creativeRefs = captation.creative_references || [];
  const refs = captation.references || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="full">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 -mx-6 -mt-6 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground capitalize">{formattedDate}</h2>
              <div className="flex items-center gap-4 mt-1 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  {captation.time}
                </span>
                {captation.location && (
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    {captation.location}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2 mb-1">
                <p className="text-lg font-semibold">{captation.title}</p>
                {isCompleted && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-500/10 text-green-600 rounded-full">
                    Concluído
                  </span>
                )}
              </div>
              {captation.client_name && (
                <p className="text-sm text-muted-foreground">{captation.client_name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Content - Two Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Items */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  📦
                </span>
                Itens para Composição
              </h3>
              <div className="bg-muted/30 rounded-lg p-4">
                {items.length > 0 ? (
                  <ul className="space-y-2">
                    {items.map((item, idx) => (
                      <li key={idx} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          x{item.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Nenhum item adicionado</p>
                )}
              </div>
            </div>

            {/* Creative References */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center">
                  🎨
                </span>
                Referência Criativa
              </h3>
              <div className="space-y-2">
                {creativeRefs.length > 0 ? (
                  creativeRefs.map((ref, idx) => (
                    <a
                      key={idx}
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      {ref.type === 'link' ? (
                        <LinkIcon className="w-4 h-4 text-purple-500" />
                      ) : (
                        <VideoCameraIcon className="w-4 h-4 text-purple-500" />
                      )}
                      <span className="text-sm flex-1 truncate group-hover:text-primary transition-colors">
                        {ref.name}
                      </span>
                    </a>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">Nenhuma referência adicionada</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Synopsis */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                  📝
                </span>
                Sinopse
              </h3>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm leading-relaxed">{captation.synopsis || 'Nenhuma sinopse adicionada'}</p>
              </div>
            </div>

            {/* References */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                  📎
                </span>
                Referências
              </h3>
              <div className="space-y-2">
                {refs.length > 0 ? (
                  refs.map((ref, idx) => (
                    <a
                      key={idx}
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      {ref.type === 'link' ? (
                        <LinkIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <DocumentTextIcon className="w-4 h-4 text-green-500" />
                      )}
                      <span className="text-sm flex-1 truncate group-hover:text-primary transition-colors">
                        {ref.name}
                      </span>
                    </a>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">Nenhuma referência adicionada</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-center gap-3 pt-4 border-t">
          <Button onClick={onEdit} variant="outline" className="gap-2">
            <PencilIcon className="w-5 h-5" />
            Editar
          </Button>
          <Button onClick={onOpenScripts} variant="outline" className="gap-2">
            <PlayCircleIcon className="w-5 h-5" />
            Textos e Roteiros
          </Button>
          {!isCompleted ? (
            <Button 
              onClick={() => onMarkCompleted(captation.id)} 
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircleIcon className="w-5 h-5" />
              Marcar como Concluído
            </Button>
          ) : (
            <Button 
              onClick={() => onMarkCompleted(captation.id)} 
              variant="outline"
              className="gap-2 text-yellow-600 border-yellow-600 hover:bg-yellow-50"
            >
              <ClockIcon className="w-5 h-5" />
              Reabrir Captação
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

// Modal de Takes e Roteiros
function ScriptsModal({
  captation,
  isOpen,
  onClose,
  onUpdateTake,
}: {
  captation: Captation | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTake: (takeId: string, completed: boolean) => void;
}) {
  const [localTakes, setLocalTakes] = useState<CaptationTake[]>([]);

  useEffect(() => {
    if (captation?.takes) {
      setLocalTakes(captation.takes);
    }
  }, [captation]);

  if (!captation) return null;

  const toggleTake = (takeId: string) => {
    const take = localTakes.find(t => t.id === takeId);
    if (take) {
      const newCompleted = !take.completed;
      setLocalTakes(prev => prev.map(t => 
        t.id === takeId ? { ...t, completed: newCompleted } : t
      ));
      onUpdateTake(takeId, newCompleted);
    }
  };

  const completedCount = localTakes.filter(t => t.completed).length;
  const totalCount = localTakes.length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="full">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 -mx-6 -mt-6 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Textos e Roteiros</h2>
              <p className="text-sm text-muted-foreground">{captation.title}</p>
            </div>
            <div className="flex items-center gap-2 bg-background/80 px-3 py-1.5 rounded-full">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">
                {completedCount}/{totalCount} takes
              </span>
            </div>
          </div>
        </div>

        {/* Content - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Takes Checklist */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                🎬
              </span>
              Checklist de Takes
            </h3>
            <div className="bg-muted/30 rounded-lg p-4 max-h-[400px] overflow-y-auto">
              {localTakes.length > 0 ? (
                <ul className="space-y-3">
                  {localTakes.map((take) => (
                    <li 
                      key={take.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                        take.completed 
                          ? "bg-green-500/5 border-green-500/30" 
                          : "bg-background border-border hover:border-primary/30"
                      )}
                      onClick={() => toggleTake(take.id)}
                    >
                      <Checkbox 
                        checked={take.completed} 
                        onCheckedChange={() => toggleTake(take.id)}
                        className="mt-0.5"
                      />
                      <span className={cn(
                        "text-sm flex-1",
                        take.completed && "line-through text-muted-foreground"
                      )}>
                        {take.description}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">Nenhum take adicionado</p>
              )}
            </div>
          </div>

          {/* Right Column - Script */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                📜
              </span>
              Roteiro
            </h3>
            <div className="bg-muted/30 rounded-lg p-4 max-h-[400px] overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
                {captation.script || 'Nenhum roteiro adicionado'}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Modal de Nova/Editar Captação
function CaptationFormModal({
  isOpen,
  onClose,
  onSave,
  editingCaptation,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    captation: Partial<Captation>,
    items: FormItem[],
    creativeRefs: FormReference[],
    refs: FormReference[],
    takes: FormTake[]
  ) => void;
  editingCaptation?: Captation | null;
}) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [clientName, setClientName] = useState('');
  const [items, setItems] = useState<FormItem[]>([{ name: '', quantity: 1 }]);
  const [creativeReferences, setCreativeReferences] = useState<FormReference[]>([]);
  const [newCreativeRefUrl, setNewCreativeRefUrl] = useState('');
  const [newCreativeRefName, setNewCreativeRefName] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [references, setReferences] = useState<FormReference[]>([]);
  const [newRefUrl, setNewRefUrl] = useState('');
  const [newRefName, setNewRefName] = useState('');
  const [takes, setTakes] = useState<FormTake[]>([{ id: '1', description: '', completed: false }]);
  const [script, setScript] = useState('');
  const [saving, setSaving] = useState(false);

  // Preencher formulário quando editando
  useEffect(() => {
    if (editingCaptation) {
      setTitle(editingCaptation.title);
      setDate(editingCaptation.date);
      setTime(editingCaptation.time);
      setLocation(editingCaptation.location || '');
      setClientName(editingCaptation.client_name || '');
      setItems(editingCaptation.items?.map(i => ({ name: i.name, quantity: i.quantity })) || [{ name: '', quantity: 1 }]);
      setCreativeReferences(editingCaptation.creative_references?.map(r => ({ type: r.type, url: r.url, name: r.name })) || []);
      setSynopsis(editingCaptation.synopsis || '');
      setReferences(editingCaptation.references?.map(r => ({ type: r.type, url: r.url, name: r.name })) || []);
      setTakes(editingCaptation.takes?.map(t => ({ id: t.id, description: t.description, completed: t.completed })) || [{ id: '1', description: '', completed: false }]);
      setScript(editingCaptation.script || '');
    } else {
      resetForm();
    }
  }, [editingCaptation, isOpen]);

  const resetForm = () => {
    setTitle('');
    setDate('');
    setTime('');
    setLocation('');
    setClientName('');
    setItems([{ name: '', quantity: 1 }]);
    setCreativeReferences([]);
    setNewCreativeRefUrl('');
    setNewCreativeRefName('');
    setSynopsis('');
    setReferences([]);
    setNewRefUrl('');
    setNewRefName('');
    setTakes([{ id: '1', description: '', completed: false }]);
    setScript('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'name' | 'quantity', value: string | number) => {
    const newItems = [...items];
    if (field === 'name') {
      newItems[index].name = value as string;
    } else {
      newItems[index].quantity = Number(value) || 1;
    }
    setItems(newItems);
  };

  const handleAddCreativeRef = () => {
    if (newCreativeRefUrl && newCreativeRefName) {
      setCreativeReferences([...creativeReferences, { type: 'link', url: newCreativeRefUrl, name: newCreativeRefName }]);
      setNewCreativeRefUrl('');
      setNewCreativeRefName('');
    }
  };

  const handleRemoveCreativeRef = (index: number) => {
    setCreativeReferences(creativeReferences.filter((_, i) => i !== index));
  };

  const handleAddRef = () => {
    if (newRefUrl && newRefName) {
      setReferences([...references, { type: 'link', url: newRefUrl, name: newRefName }]);
      setNewRefUrl('');
      setNewRefName('');
    }
  };

  const handleRemoveRef = (index: number) => {
    setReferences(references.filter((_, i) => i !== index));
  };

  const handleAddTake = () => {
    setTakes([...takes, { id: String(Date.now()), description: '', completed: false }]);
  };

  const handleRemoveTake = (index: number) => {
    setTakes(takes.filter((_, i) => i !== index));
  };

  const handleTakeChange = (index: number, value: string) => {
    const newTakes = [...takes];
    newTakes[index].description = value;
    setTakes(newTakes);
  };

  const handleSave = async () => {
    if (!title || !date || !time) {
      alert('Preencha os campos obrigatórios: Título, Data e Horário');
      return;
    }

    setSaving(true);
    try {
      const captationData: Partial<Captation> = {
        title,
        date,
        time,
        location: location || undefined,
        client_name: clientName || undefined,
        synopsis: synopsis || undefined,
        script: script || undefined,
        status: editingCaptation?.status || 'scheduled',
      };

      if (editingCaptation) {
        captationData.id = editingCaptation.id;
      }

      await onSave(
        captationData,
        items.filter(i => i.name.trim()),
        creativeReferences,
        references,
        takes.filter(t => t.description.trim())
      );

      handleClose();
    } catch (err: unknown) {
      console.error('Erro ao salvar captação:', err);
      const errorMessage = err instanceof Error ? err.message : 
        (typeof err === 'object' && err !== null && 'message' in err) ? String((err as {message: unknown}).message) : 
        'Erro desconhecido';
      alert(`Erro ao salvar captação: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const isEditing = !!editingCaptation;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="" size="full">
      <div className="flex flex-col h-full max-h-[80vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 -mx-6 -mt-6 px-6 py-4 border-b flex-shrink-0">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <VideoCameraIcon className="w-6 h-6 text-primary" />
            {isEditing ? 'Editar Captação' : 'Nova Captação'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditing ? 'Altere as informações da gravação' : 'Preencha as informações da gravação'}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Gravação Comercial Verão"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="time">Horário *</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Estúdio Central"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="client">Cliente</Label>
              <Input
                id="client"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: Marca XYZ"
                className="mt-1"
              />
            </div>
          </div>

          {/* Two Columns Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs">📦</span>
                    Itens para Composição
                  </Label>
                  <Button type="button" variant="ghost" size="sm" onClick={handleAddItem}>
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
                <div className="space-y-2 bg-muted/30 rounded-lg p-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={item.name}
                        onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                        placeholder="Nome do item"
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-20"
                      />
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-red-500 hover:text-red-600"
                          onClick={() => handleRemoveItem(idx)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Creative References */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500/10 flex items-center justify-center text-xs">🎨</span>
                  Referências Criativas
                </Label>
                <div className="space-y-2 bg-muted/30 rounded-lg p-3">
                  {creativeReferences.map((ref, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-background rounded border">
                      <LinkIcon className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <span className="text-sm flex-1 truncate">{ref.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600"
                        onClick={() => handleRemoveCreativeRef(idx)}
                      >
                        <TrashIcon className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Input
                      value={newCreativeRefName}
                      onChange={(e) => setNewCreativeRefName(e.target.value)}
                      placeholder="Nome da referência"
                      className="flex-1"
                    />
                    <Input
                      value={newCreativeRefUrl}
                      onChange={(e) => setNewCreativeRefUrl(e.target.value)}
                      placeholder="URL"
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={handleAddCreativeRef}>
                      <PlusIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Takes Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center text-xs">🎬</span>
                    Checklist de Takes
                  </Label>
                  <Button type="button" variant="ghost" size="sm" onClick={handleAddTake}>
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
                <div className="space-y-2 bg-muted/30 rounded-lg p-3">
                  {takes.map((take, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-6">{idx + 1}.</span>
                      <Input
                        value={take.description}
                        onChange={(e) => handleTakeChange(idx, e.target.value)}
                        placeholder="Ex: Close-up - Produto sendo usado"
                        className="flex-1"
                      />
                      {takes.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-red-500 hover:text-red-600"
                          onClick={() => handleRemoveTake(idx)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Synopsis */}
              <div>
                <Label htmlFor="synopsis" className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center text-xs">📝</span>
                  Sinopse
                </Label>
                <Textarea
                  id="synopsis"
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  placeholder="Descreva o contexto, objetivo e detalhes da gravação..."
                  className="min-h-[100px]"
                />
              </div>

              {/* References */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center text-xs">📎</span>
                  Referências
                </Label>
                <div className="space-y-2 bg-muted/30 rounded-lg p-3">
                  {references.map((ref, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-background rounded border">
                      <LinkIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm flex-1 truncate">{ref.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600"
                        onClick={() => handleRemoveRef(idx)}
                      >
                        <TrashIcon className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Input
                      value={newRefName}
                      onChange={(e) => setNewRefName(e.target.value)}
                      placeholder="Nome da referência"
                      className="flex-1"
                    />
                    <Input
                      value={newRefUrl}
                      onChange={(e) => setNewRefUrl(e.target.value)}
                      placeholder="URL"
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={handleAddRef}>
                      <PlusIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Script */}
              <div>
                <Label htmlFor="script" className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-orange-500/10 flex items-center justify-center text-xs">📜</span>
                  Roteiro
                </Label>
                <Textarea
                  id="script"
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Digite o roteiro completo da gravação..."
                  className="min-h-[150px] font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <>Salvando...</>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                {isEditing ? 'Salvar Alterações' : 'Salvar Captação'}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Componente Principal
export function CaptationsPage({ searchQuery }: CaptationsPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCaptation, setSelectedCaptation] = useState<Captation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isScriptsModalOpen, setIsScriptsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCaptation, setEditingCaptation] = useState<Captation | null>(null);

  const { data: captations, loading, create, update, updateTakeStatus, updateStatus, refetch } = useCaptations();

  // Filtrar captações pela busca
  const filteredCaptations = useMemo(() => {
    if (!searchQuery) return captations;
    const query = searchQuery.toLowerCase();
    return captations.filter(c => 
      c.title.toLowerCase().includes(query) ||
      c.client_name?.toLowerCase().includes(query) ||
      c.location?.toLowerCase().includes(query)
    );
  }, [searchQuery, captations]);

  // Gerar dias do calendário
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Agrupar captações por data
  const captationsByDate = useMemo(() => {
    const map: Record<string, Captation[]> = {};
    filteredCaptations.forEach(c => {
      const dateKey = c.date;
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(c);
    });
    Object.keys(map).forEach(key => {
      map[key].sort((a, b) => a.time.localeCompare(b.time));
    });
    return map;
  }, [filteredCaptations]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleCaptationClick = (captation: Captation) => {
    setSelectedCaptation(captation);
    setIsDetailModalOpen(true);
  };

  const handleOpenScripts = () => {
    setIsDetailModalOpen(false);
    setIsScriptsModalOpen(true);
  };

  const handleCloseScripts = () => {
    setIsScriptsModalOpen(false);
    setIsDetailModalOpen(true);
  };

  const handleMarkCompleted = async (captationId: string) => {
    const captation = captations.find(c => c.id === captationId);
    if (captation) {
      const newStatus = captation.status === 'completed' ? 'scheduled' : 'completed';
      await updateStatus(captationId, newStatus);
      // Atualizar a captação selecionada
      if (selectedCaptation?.id === captationId) {
        setSelectedCaptation(prev => prev ? { ...prev, status: newStatus } : null);
      }
    }
  };

  const handleUpdateTake = async (takeId: string, completed: boolean) => {
    await updateTakeStatus(takeId, completed);
  };

  const handleOpenNewModal = () => {
    setEditingCaptation(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = () => {
    setEditingCaptation(selectedCaptation);
    setIsDetailModalOpen(false);
    setIsFormModalOpen(true);
  };

  const handleSaveCaptation = async (
    captationData: Partial<Captation>,
    items: FormItem[],
    creativeRefs: FormReference[],
    refs: FormReference[],
    takes: FormTake[]
  ) => {
    if (editingCaptation) {
      // Atualizar
      await update(
        editingCaptation.id,
        {
          title: captationData.title,
          date: captationData.date,
          time: captationData.time,
          location: captationData.location,
          client_name: captationData.client_name,
          synopsis: captationData.synopsis,
          script: captationData.script,
        },
        items,
        creativeRefs,
        refs,
        takes.map((t, idx) => ({ description: t.description, completed: t.completed, order_index: idx }))
      );
    } else {
      // Criar
      await create(
        {
          title: captationData.title!,
          date: captationData.date!,
          time: captationData.time!,
          location: captationData.location,
          client_name: captationData.client_name,
          synopsis: captationData.synopsis,
          script: captationData.script,
          status: 'scheduled',
        },
        items,
        creativeRefs,
        refs,
        takes.map((t, idx) => ({ description: t.description, completed: t.completed, order_index: idx }))
      );
    }
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando captações...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <VideoCameraIcon className="w-7 h-7 text-primary" />
            Captações
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas gravações e produções audiovisuais
          </p>
        </div>
        <Button className="gap-2" onClick={handleOpenNewModal}>
          <PlusIcon className="w-5 h-5" />
          Nova Captação
        </Button>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="capitalize">
              {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                <ChevronLeftIcon className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Hoje
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayCaptations = captationsByDate[dateKey] || [];
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={idx}
                  className={cn(
                    "min-h-[120px] p-2 border rounded-lg transition-colors",
                    isCurrentMonth ? "bg-background" : "bg-muted/30",
                    isCurrentDay && "ring-2 ring-primary"
                  )}
                >
                  <div className={cn(
                    "text-sm font-medium mb-2",
                    !isCurrentMonth && "text-muted-foreground",
                    isCurrentDay && "text-primary"
                  )}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayCaptations.slice(0, 2).map(captation => (
                      <CaptationCard
                        key={captation.id}
                        captation={captation}
                        onClick={() => handleCaptationClick(captation)}
                      />
                    ))}
                    {dayCaptations.length > 2 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{dayCaptations.length - 2} mais
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-6 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">Agendado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-muted-foreground">Em Andamento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-muted-foreground">Concluído</span>
        </div>
      </div>

      {/* Modals */}
      <CaptationDetailModal
        captation={selectedCaptation}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onOpenScripts={handleOpenScripts}
        onMarkCompleted={handleMarkCompleted}
        onEdit={handleOpenEditModal}
      />

      <ScriptsModal
        captation={selectedCaptation}
        isOpen={isScriptsModalOpen}
        onClose={handleCloseScripts}
        onUpdateTake={handleUpdateTake}
      />

      <CaptationFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingCaptation(null);
        }}
        onSave={handleSaveCaptation}
        editingCaptation={editingCaptation}
      />
    </div>
  );
}
