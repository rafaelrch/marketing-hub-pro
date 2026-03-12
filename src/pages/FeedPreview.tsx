import { useState, useRef, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ImageIcon, Trash2Icon, Camera, Grid3X3, Film, UserSquare2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FeedPreviewPageProps {
  searchQuery: string;
}

interface FeedItem {
  id: string;
  url: string;
  name: string;
}

/* ── Editable Text (click-to-edit) ── */
function EditableText({
  value,
  onChange,
  className,
  inputClassName,
  as = 'input',
  placeholder = 'Editar...',
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  inputClassName?: string;
  as?: 'input' | 'textarea';
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      ref.current.select();
    }
  }, [editing]);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const commit = () => {
    setEditing(false);
    if (draft.trim() !== value) onChange(draft.trim());
  };

  if (!editing) {
    return (
      <span
        onClick={() => setEditing(true)}
        className={cn('cursor-pointer hover:bg-black/5 rounded px-0.5 -mx-0.5 transition-colors', className)}
        title="Clique para editar"
      >
        {value || placeholder}
      </span>
    );
  }

  if (as === 'textarea') {
    return (
      <textarea
        ref={ref as React.RefObject<HTMLTextAreaElement>}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
        rows={2}
        className={cn(
          'bg-transparent outline-none border-none resize-none w-full text-inherit leading-tight p-0 m-0',
          'focus:ring-1 focus:ring-blue-400 rounded px-1 -mx-1',
          inputClassName
        )}
      />
    );
  }

  return (
    <input
      ref={ref as React.RefObject<HTMLInputElement>}
      type="text"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') { setDraft(value); setEditing(false); }
      }}
      className={cn(
        'bg-transparent outline-none border-none w-full text-inherit leading-tight p-0 m-0',
        'focus:ring-1 focus:ring-blue-400 rounded px-1 -mx-1',
        inputClassName
      )}
    />
  );
}

/* ── Editable Stat ── */
function EditableStat({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col items-center">
      <EditableText
        value={value}
        onChange={onChange}
        className="text-[15px] font-bold text-neutral-900 leading-none"
      />
      <span className="text-[11px] text-neutral-500 mt-0.5">{label}</span>
    </div>
  );
}

/* ── Sortable Feed Item ── */
function SortableFeedItem({ item }: { item: FeedItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'relative overflow-hidden aspect-square',
        isDragging && 'z-10 ring-2 ring-blue-500 scale-[1.03] shadow-lg'
      )}
    >
      <img
        src={item.url}
        alt={item.name}
        className="h-full w-full object-cover"
      />
    </button>
  );
}

/* ── Main Page ── */
export function FeedPreviewPage({ searchQuery }: FeedPreviewPageProps) {
  const [items, setItems] = useState<FeedItem[]>([]);

  // Profile state
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [username, setUsername] = useState('seuinstagram');
  const [displayName, setDisplayName] = useState('Seu Nome');
  const [bio, setBio] = useState('Sua bio aqui ✨');
  const [followers, setFollowers] = useState('1.2K');
  const [following, setFollowing] = useState('320');

  const profileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleAddFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: FeedItem[] = [];
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      newItems.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        url,
        name: file.name,
      });
    });

    if (!newItems.length) return;
    setItems((prev) => [...newItems, ...prev]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === active.id);
      const newIndex = prev.findIndex((i) => i.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUseExamples = () => {
    const urls = [
      'https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/2404370/pexels-photo-2404370.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/533923/pexels-photo-533923.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/210205/pexels-photo-210205.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/210186/pexels-photo-210186.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=400',
    ];

    setItems(
      urls.map((url, index) => ({
        id: `example-${index}-${Date.now()}`,
        url,
        name: `Exemplo ${index + 1}`,
      }))
    );
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setProfilePhoto(url);
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
      {/* Coluna esquerda - seleção de imagens */}
      <div className="w-full space-y-4 lg:w-[320px]">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <ImageIcon className="h-6 w-6 text-primary" />
            Preview de Feed
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monte a grade do Instagram e veja como o feed ficará antes de publicar.
          </p>
        </div>

        <div className="rounded-2xl border bg-card/60 p-4 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium">Selecionar imagens</p>
              <p className="text-xs text-muted-foreground">
                Faça upload das capas dos posts ou use imagens de exemplo.
              </p>
            </div>
            <Button variant="outline" size="sm" type="button" onClick={handleUseExamples}>
              Usar exemplos
            </Button>
          </div>

          <label
            htmlFor="feed-upload"
            className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-6 text-center text-xs text-muted-foreground transition hover:border-primary/60 hover:bg-muted"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">
                Clique para selecionar imagens
              </p>
              <p>PNG, JPG ou WEBP</p>
            </div>
            <input
              id="feed-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleAddFiles(e.target.files)}
            />
          </label>

          {filteredItems.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Imagens ({filteredItems.length})
              </p>
              <div className="max-h-52 space-y-1.5 overflow-y-auto pr-1">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded-lg border bg-background px-2 py-1.5 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-md border bg-muted">
                        <img
                          src={item.url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="max-w-[140px] truncate">{item.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2Icon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Coluna direita - mockup de celular estilo Instagram */}
      <div className="flex flex-1 items-center justify-center">
        <div className="relative h-[780px] w-[370px] rounded-[48px] border-[10px] border-neutral-900 bg-neutral-900 shadow-2xl">
          {/* notch topo */}
          <div className="absolute inset-x-16 top-0 z-10 h-6 rounded-b-3xl bg-neutral-900" />

          {/* conteúdo do "app" dentro do celular */}
          <div className="relative m-[10px] flex h-[calc(100%-20px)] flex-col overflow-hidden rounded-[32px] bg-white">
            {/* ── Top Bar ── */}
            <div className="flex items-center justify-between px-4 pt-8 pb-1">
              <div className="flex items-center gap-1">
                <span className="text-[15px] font-bold text-neutral-900">
                  <EditableText value={username} onChange={setUsername} className="text-[15px] font-bold text-neutral-900" />
                </span>
                <svg className="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
              <div className="flex items-center gap-4">
                <svg className="w-5 h-5 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                <svg className="w-5 h-5 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* ── Profile Section ── */}
              <div className="px-4 pt-3 pb-2">
                {/* Avatar + Stats Row */}
                <div className="flex items-center gap-4">
                  {/* Profile Photo */}
                  <button
                    type="button"
                    onClick={() => profileInputRef.current?.click()}
                    className="relative h-[72px] w-[72px] flex-shrink-0 rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 p-[3px] hover:opacity-90 transition-opacity group"
                    title="Clique para trocar a foto"
                  >
                    <div className="h-full w-full rounded-full bg-white p-[2px] overflow-hidden">
                      {profilePhoto ? (
                        <img src={profilePhoto} alt="Perfil" className="h-full w-full rounded-full object-cover" />
                      ) : (
                        <div className="h-full w-full rounded-full bg-neutral-200 flex items-center justify-center">
                          <Camera className="w-5 h-5 text-neutral-400" />
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <Camera className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                    </div>
                    <input
                      ref={profileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePhotoChange}
                    />
                  </button>

                  {/* Stats */}
                  <div className="flex flex-1 justify-around">
                    <div className="flex flex-col items-center">
                      <span className="text-[15px] font-bold text-neutral-900 leading-none">{filteredItems.length}</span>
                      <span className="text-[11px] text-neutral-500 mt-0.5">posts</span>
                    </div>
                    <EditableStat label="seguidores" value={followers} onChange={setFollowers} />
                    <EditableStat label="seguindo" value={following} onChange={setFollowing} />
                  </div>
                </div>

                {/* Name + Bio */}
                <div className="mt-3 space-y-0.5">
                  <EditableText
                    value={displayName}
                    onChange={setDisplayName}
                    className="text-[13px] font-semibold text-neutral-900 block leading-tight"
                  />
                  <EditableText
                    value={bio}
                    onChange={setBio}
                    as="textarea"
                    className="text-[13px] text-neutral-700 block leading-snug"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1.5 mt-3">
                  <div className="flex-1 bg-neutral-100 rounded-lg text-center py-1.5 text-[12px] font-semibold text-neutral-900">
                    Seguir
                  </div>
                  <div className="flex-1 bg-neutral-100 rounded-lg text-center py-1.5 text-[12px] font-semibold text-neutral-900">
                    Mensagem
                  </div>
                  <div className="bg-neutral-100 rounded-lg px-2.5 py-1.5 flex items-center justify-center">
                    <svg className="w-3 h-3 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              {/* ── Tabs (Posts / Reels / Tagged) ── */}
              <div className="flex items-center border-b border-neutral-200 mt-1">
                <button className="flex-1 flex items-center justify-center py-2.5 border-b-[1.5px] border-neutral-900">
                  <Grid3X3 className="w-5 h-5 text-neutral-900" />
                </button>
                <button className="flex-1 flex items-center justify-center py-2.5 border-b-[1.5px] border-transparent">
                  <Film className="w-5 h-5 text-neutral-400" />
                </button>
                <button className="flex-1 flex items-center justify-center py-2.5 border-b-[1.5px] border-transparent">
                  <UserSquare2 className="w-5 h-5 text-neutral-400" />
                </button>
              </div>

              {/* ── Feed Grid 3xN ── */}
              <div className="bg-white">
                {filteredItems.length === 0 ? (
                  <div className="flex h-48 flex-col items-center justify-center gap-2 px-8 text-center text-xs text-neutral-400">
                    <Grid3X3 className="h-7 w-7" />
                    <p>
                      Adicione imagens à esquerda para visualizar o preview do feed.
                    </p>
                  </div>
                ) : (
                  <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <SortableContext
                      items={filteredItems.map((i) => i.id)}
                      strategy={rectSortingStrategy}
                    >
                      <div className="grid w-full grid-cols-3 gap-[1px] bg-white">
                        {filteredItems.map((item) => (
                          <SortableFeedItem key={item.id} item={item} />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>

            {/* ── Bottom Nav Bar ── */}
            <div className="flex items-center justify-around border-t border-neutral-200 py-2 bg-white">
              <svg className="w-5 h-5 text-neutral-900" fill="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              <div className="w-5 h-5 rounded-full bg-neutral-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
