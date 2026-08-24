type EntityFilterProps = {
  entities: string[];
  selectedEntity: string;
};

export function EntityFilter({ entities, selectedEntity }: EntityFilterProps) {
  return (
    <form method="get" className="flex items-center gap-2 text-sm text-slate-600">
      <label htmlFor="entity-filter">Entity</label>
      <select
        id="entity-filter"
        name="entity"
        defaultValue={selectedEntity}
        className="rounded-full border border-slate-300 bg-white px-3 py-2 text-slate-700"
      >
        <option value="">Select an entity</option>
        <option value="all">All entities</option>
        {entities.map((entity) => (
          <option key={entity} value={entity}>{entity}</option>
        ))}
      </select>
      <button type="submit" className="rounded-full bg-slate-900 px-3 py-2 text-white">
        Apply
      </button>
    </form>
  );
}