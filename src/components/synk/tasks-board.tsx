'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
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
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTasks, columns, Task, TaskStatus } from '@/hooks/use-tasks';
import { TaskCard } from './task-card';
import { AddTaskDialog } from './add-task-dialog';
import { useAuth } from '@/hooks/use-auth';

function ColumnContainer({ 
  column, 
  tasks, 
  addTaskAction, 
  updateTaskAction, 
  deleteTaskAction 
}: { 
  column: { id: TaskStatus; title: string }; 
  tasks: Task[];
  addTaskAction: (content: string, priority: any, status?: TaskStatus) => void;
  updateTaskAction: (taskId: string, updates: Partial<Task>) => void;
  deleteTaskAction: (taskId: string) => void;
}) {
  const { setNodeRef } = useSortable({ 
    id: column.id, 
    data: { type: 'Column', column } 
  });
  
  const taskIds = tasks.map(t => t.id);

  return (
    <Card ref={setNodeRef} className="w-full md:w-80 flex-shrink-0 h-fit group">
      <CardHeader className="p-4 flex flex-row items-center justify-between border-b">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          {column.title}
          <Badge variant="secondary" className="text-xs">
            {tasks.length}
          </Badge>
        </CardTitle>
        <AddTaskDialog 
          addTaskAction={addTaskAction} 
          defaultStatus={column.id}
        />
      </CardHeader>
      <CardContent className="p-2 space-y-2 min-h-[200px]">
        <SortableContext items={taskIds} strategy={rectSortingStrategy}>
          {tasks.map(task => (
            <div key={task.id} className="group">
              <TaskCard 
                task={task} 
                updateTaskAction={updateTaskAction}
                deleteTaskAction={deleteTaskAction}
              />
            </div>
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            No tasks yet. Click + to add one!
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TasksBoard() {
  const params = useParams();
  const roomId = params.roomId as string;
  const { user } = useAuth();
  const { tasks, loading, error, addTask, updateTask, deleteTask, moveTask } = useTasks(roomId);
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
    if (!activeTask) return;

    // Check if dropped on a column
    if (over.data.current?.type === "Column") {
      const newStatus = over.id as TaskStatus;
      if (activeTask.status !== newStatus) {
        moveTask(activeTask.id, newStatus);
      }
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverAColumn = over.data.current?.type === "Column";

    if (isActiveATask && isOverAColumn) {
      const activeTask = tasks.find(t => t.id === active.id);
      if (activeTask && activeTask.status !== over.id) {
        // We'll handle the actual move in onDragEnd to avoid too many updates
      }
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert>
          <AlertDescription>
            Please sign in to access the tasks board.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(column => (
          <Card key={column.id} className="w-full md:w-80 flex-shrink-0">
            <CardHeader className="p-4 border-b">
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="p-2 space-y-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
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
              tasks={tasks.filter(task => task.status === col.id)}
              addTaskAction={addTask}
              updateTaskAction={updateTask}
              deleteTaskAction={deleteTask}
            />
          ))}
        </SortableContext>
      </div>
      <DragOverlay>
        {activeTask && (
          <TaskCard 
            task={activeTask} 
            updateTaskAction={updateTask}
            deleteTaskAction={deleteTask}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
