interface RecentProjectItemProps {
  name: string;
  path: string;
  modified: string;
  onClick?: () => void;
}

export default function RecentProjectItem({ name, path, modified, onClick }: RecentProjectItemProps) {
  return (
    <li
      className="group flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-card-dark cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col">
        <span className="text-base font-medium text-text-light">{name}</span>
        <span className="text-sm text-text-muted">{path}</span>
      </div>
      <span className="text-sm text-text-muted">Modified: {modified}</span>
    </li>
  );
}
