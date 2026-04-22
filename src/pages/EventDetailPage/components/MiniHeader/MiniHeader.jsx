import "./MiniHeader.css"
export function MiniHeader({ title }) {
  return (
    <h3 className="text-xl font-bold text-gray-900 border-l-4 border-red-600 pl-3 mb-4">
      {title}
    </h3>
  );
}