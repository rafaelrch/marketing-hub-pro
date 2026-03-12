import { useState } from 'react';
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
import { ImageIcon, Trash2Icon } from 'lucide-react';
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

interface SortableFeedItemProps {
  item: FeedItem;
}

function SortableFeedItem({ item }: SortableFeedItemProps) {
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
        'relative overflow-hidden aspect-[4/5]',
        // sem borda / radius para não criar linhas entre as imagens
        isDragging && 'z-10 ring-2 ring-primary scale-[1.03] shadow-lg'
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

export function FeedPreviewPage({ searchQuery }: FeedPreviewPageProps) {
  const [items, setItems] = useState<FeedItem[]>([]);

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

      {/* Coluna direita - mockup de celular com grid 3xN */}
      <div className="flex flex-1 items-center justify-center">
        <div className="relative h-[700px] w-[340px] rounded-[48px] border-[10px] border-neutral-900 bg-neutral-900 shadow-2xl">
          {/* notch topo */}
          <div className="absolute inset-x-16 top-0 z-10 h-6 rounded-b-3xl bg-neutral-900" />

          {/* conteúdo do \"app\" dentro do celular */}
          <div className="relative m-[10px] flex h-[calc(100%-20px)] flex-col overflow-hidden rounded-[32px] bg-white">
            {/* header instagram fake */}
            <div className="flex items-center justify-between border-b px-4 pb-2 pt-4">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-neutral-200" />
                <div>
                  <p className="text-sm font-semibold">Seu Instagram</p>
                  <p className="text-[10px] text-neutral-500">
                    {filteredItems.length} posts
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-7 rounded-full bg-neutral-900 px-3 text-[11px] font-semibold leading-7 text-white">
                  Follow
                </div>
                <div className="h-7 rounded-full border px-3 text-[11px] font-semibold leading-7 text-neutral-900">
                  Contact
                </div>
              </div>
            </div>

            {/* abas */}
            <div className="flex items-center justify-around border-b px-4 py-2 text-[10px] font-medium text-neutral-500">
              <button className="border-b-2 border-neutral-900 pb-1 text-neutral-900">
                POSTS
              </button>
              <button>REELS</button>
              <button>TAGGED</button>
            </div>

            {/* grid 3xN */}
            <div className="flex-1 bg-neutral-50">
              {filteredItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-8 text-center text-xs text-neutral-400">
                  <ImageIcon className="h-7 w-7" />
                  <p>
                    Adicione imagens à esquerda para visualizar o preview do feed
                    em uma grade 3x3, como no Instagram.
                  </p>
                </div>
              ) : (
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                  <SortableContext
                    items={filteredItems.map((i) => i.id)}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid w-full grid-cols-3 gap-0 bg-white">
                      {filteredItems.map((item) => (
                        <SortableFeedItem key={item.id} item={item} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

