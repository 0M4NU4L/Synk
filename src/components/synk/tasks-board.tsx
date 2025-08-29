'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Id = string | number;
type Column = { id: Id; title: string };
type Task = { id: Id; columnId: Id; content: string; priority: 'low' | 'medium' | 'high' };

const initialColumns: Column[] = [
  { id: 'todo', title: 'Todo' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

const initialTasks: Task[] = [
  { id: 1, columnId: 'todo', content: 'Design the landing page', priority: 'high' },
  { id: 2, columnId: 'todo', content: 'Implement Firebase auth', priority: 'high' },
  { id: 3, columnId: 'in-progress', content: 'Develop Kanban board component', priority: 'medium' },
  { id: 4, columnId: 'in-progress', content: 'Set up LiveKit server', priority: 'medium' },
  { id: 5, columnId: 'done', content: 'Project scaffolding', priority: 'low' },
];

function TaskCard({ task }: { task: Task }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
        data: { type: 'Task', task },
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    const priorityClasses = {
        low: 'bg-accent/20 text-accent border-accent/30',
        medium: 'bg-primary/20 text-primary border-primary/30',
        high: 'bg-destructive/20 text-destructive border-destructive/30',
    };

    if (isDragging) {
        return <div ref={setNodeRef} style={style} className="h-24 w-full rounded-lg bg-card border-2 border-primary" />;
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
            <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                    <p className="text-sm font-medium mb-2">{task.content}</p>
                    <Badge variant="outline" className={`capitalize ${priorityClasses[task.priority]}`}>{task.priority}</Badge>
                </CardContent>
            </Card>
        </div>
    );
}

function ColumnContainer({ column, tasks }: { column: Column; tasks: Task[] }) {
    const { setNodeRef } = useSortable({ id: column.id, data: { type: 'Column', column } });
    const taskIds = tasks.map(t => t.id);

    return (
        <Card ref={setNodeRef} className="w-full md:w-80 flex-shrink-0 h-fit">
            <CardHeader className="p-4 flex flex-row items-center justify-between border-b">
                <CardTitle className="text-base font-bold">{column.title}</CardTitle>
                <Button size="icon" variant="ghost" className="h-6 w-6">
                    <PlusCircle className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="p-2 space-y-2 min-h-[100px]">
                <SortableContext items={taskIds} strategy={rectSortingStrategy}>
                    {tasks.map(task => (<TaskCard key={task.id} task={task} />))}
                </SortableContext>
            </CardContent>
        </Card>
    );
}

export function TasksBoard() {
  const [columns] = useState<Column[]>(initialColumns);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } })
  );

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Task") {
        setActiveTask(event.active.data.current.task);
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    
    const activeTask = tasks.find(t => t.id === active.id);
    const overTask = tasks.find(t => t.id === over.id);

    if (activeTask && overTask && activeTask.columnId !== overTask.columnId) {
        setTasks(currentTasks => {
            const activeIndex = currentTasks.findIndex(t => t.id === active.id);
            currentTasks[activeIndex].columnId = overTask.columnId;
            return arrayMove(currentTasks, activeIndex, currentTasks.findIndex(t => t.id === over.id));
        });
    } else {
         setTasks(currentTasks => {
            const activeIndex = currentTasks.findIndex(t => t.id === active.id);
            const overIndex = currentTasks.findIndex(t => t.id === over.id);
            return arrayMove(currentTasks, activeIndex, overIndex);
        });
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverAColumn = over.data.current?.type === "Column";

    if (isActiveATask && isOverAColumn) {
        setTasks((currentTasks) => {
            const activeIndex = currentTasks.findIndex((t) => t.id === active.id);
            if (currentTasks[activeIndex].columnId !== over.id) {
                currentTasks[activeIndex].columnId = over.id as Id;
                return arrayMove(currentTasks, activeIndex, activeIndex);
            }
            return currentTasks;
        });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      collisionDetection={closestCenter}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        <SortableContext items={columns.map(c => c.id)} strategy={rectSortingStrategy}>
            {columns.map(col => (
                <ColumnContainer
                    key={col.id}
                    column={col}
                    tasks={tasks.filter(task => task.columnId === col.id)}
                />
            ))}
        </SortableContext>
      </div>
      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} />}
      </DragOverlay>
    </DndContext>
  );
}
