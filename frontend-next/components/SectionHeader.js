export default function SectionHeader({ title, icon }) {
  return (
    <h2 className="text-2xl font-bold mb-4 text-white">
      {icon} {title}
    </h2>
  );
}
