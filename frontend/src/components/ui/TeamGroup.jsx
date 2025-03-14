function TeamGroup({ teamName, children }) {
  return (
    <div className="flex w-fit items-center gap-2 rounded-full bg-neutral-700 px-3 py-1">
      {children}
      <h3 className="text-sm">{teamName}</h3>
    </div>
  );
}

export default TeamGroup;
