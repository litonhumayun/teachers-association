import { institutes } from "@/lib/institutes";

interface Props {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function InstituteSelect({ value, onChange, className }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className || "w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"}
    >
      <option value="">Select Institute</option>
      {institutes.map((inst) => (
        <option key={inst.id} value={inst.name}>
          {inst.name}
        </option>
      ))}
    </select>
  );
}