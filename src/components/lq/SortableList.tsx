import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";

export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
}: {
  items: T[];
  onReorder: (ids: string[]) => void;
  renderItem: (item: T) => ReactNode;
}) {
  const [local, setLocal] = useState(items);
  useEffect(() => setLocal(items), [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldI = local.findIndex((x) => x.id === active.id);
    const newI = local.findIndex((x) => x.id === over.id);
    const next = arrayMove(local, oldI, newI);
    setLocal(next);
    onReorder(next.map((x) => x.id));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={local.map((x) => x.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {local.map((item) => (
            <SortableRow key={item.id} id={item.id}>
              {renderItem(item)}
            </SortableRow>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="flex items-stretch gap-2">
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex items-center px-2 rounded-md bg-muted hover:bg-muted/80 cursor-grab active:cursor-grabbing text-muted-foreground"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1">{children}</div>
    </div>
  );
}