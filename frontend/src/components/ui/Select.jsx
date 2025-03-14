function Select({ options }) {
  return (
    <select className="w-full rounded-md border border-primary bg-neutral-700 p-2">
      <option value="" disabled selected className="text-gray-700">
        -- Qui ? --
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default Select;
