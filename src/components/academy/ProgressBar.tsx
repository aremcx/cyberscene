interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({ progress, label, showPercentage = true, size = 'md' }: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-sm text-gray-400">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-medium text-white">{Math.round(clampedProgress)}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-800 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
