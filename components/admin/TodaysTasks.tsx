'use client';

import { useState } from 'react';
import { Check, ClipboardCheck, PartyPopper, SearchCheck, Sparkles } from 'lucide-react';

type TaskCategory = 'housekeeping' | 'inspection' | 'event' | 'review';

type DashboardTask = {
  id: string;
  title: string;
  detail: string;
  category: TaskCategory;
  completed: boolean;
};

const initialTasks: DashboardTask[] = [
  {
    id: 'housekeeping-cabin-04',
    title: 'Cabin 04 turnover',
    detail: 'Housekeeping · Before 1:00 PM',
    category: 'housekeeping',
    completed: false,
  },
  {
    id: 'inspection-rv-18',
    title: 'Inspect RV Site 18',
    detail: 'Arrival inspection · Before 2:00 PM',
    category: 'inspection',
    completed: true,
  },
  {
    id: 'event-pavilion',
    title: 'Prepare pavilion',
    detail: 'Sunset social · Starts at 6:30 PM',
    category: 'event',
    completed: false,
  },
  {
    id: 'review-waitlist',
    title: 'Review weekend waitlist',
    detail: '3 requests need a response',
    category: 'review',
    completed: false,
  },
];

const categoryIcons = {
  housekeeping: Sparkles,
  inspection: SearchCheck,
  event: PartyPopper,
  review: ClipboardCheck,
} satisfies Record<TaskCategory, typeof Sparkles>;

export function TodaysTasks() {
  const [tasks, setTasks] = useState(initialTasks);
  const completedCount = tasks.filter((task) => task.completed).length;

  function toggleTask(taskId: string) {
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)),
    );
  }

  return (
    <section className="admin-card p-5 sm:p-6" aria-labelledby="today-tasks-heading">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="today-tasks-heading" className="text-base font-bold text-forest-900">
            Today&apos;s Tasks
          </h2>
          <p className="mt-1 text-xs text-admin-muted">
            {completedCount} of {tasks.length} complete
          </p>
        </div>
        <span className="rounded-full bg-cream-alt px-3 py-1 text-xs font-semibold text-forest-900">
          {tasks.length - completedCount} remaining
        </span>
      </div>

      <ul className="mt-5 divide-y divide-admin-border">
        {tasks.map((task) => {
          const CategoryIcon = categoryIcons[task.category];
          return (
            <li key={task.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <button
                type="button"
                onClick={() => toggleTask(task.id)}
                aria-label={`${task.completed ? 'Reopen' : 'Complete'} ${task.title}`}
                aria-pressed={task.completed}
                className={`grid size-6 shrink-0 place-items-center rounded border transition-colors ${
                  task.completed
                    ? 'border-admin-success bg-admin-success text-white'
                    : 'border-admin-border bg-white text-transparent hover:border-admin-success'
                }`}
              >
                <Check aria-hidden="true" className="size-4" strokeWidth={2.5} />
              </button>
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-cream-alt text-admin-accent">
                <CategoryIcon aria-hidden="true" className="size-4" />
              </span>
              <div className="min-w-0">
                <p
                  className={`text-sm font-semibold ${
                    task.completed ? 'text-admin-muted line-through' : 'text-forest-900'
                  }`}
                >
                  {task.title}
                </p>
                <p className="mt-0.5 text-xs text-admin-muted">{task.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
