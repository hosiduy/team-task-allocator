

interface StatusBadgeProps {
  status: 'TỰ QUYẾT' | 'CẦN REVIEW';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'TỰ QUYẾT') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
        {status}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-600">
      {status}
    </span>
  );
}
