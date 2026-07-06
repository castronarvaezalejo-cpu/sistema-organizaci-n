type PageHeaderProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export default function PageHeader({
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">

      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800">
          {title}
        </h1>

        <p className="mt-1.5 text-sm text-slate-500">
          {description}
        </p>
      </div>

      {action && (
        <div className="flex justify-start md:justify-end">
          {action}
        </div>
      )}

    </div>
  );
}
