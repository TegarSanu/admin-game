import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
}

export function PageHeader({ title, description, icon: Icon }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center text-foreground shrink-0">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1 font-medium">{description}</p>
        )}
      </div>
    </div>
  );
}
