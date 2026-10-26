import Link from 'next/link';

// Se muestra cuando un personaje no existe (/character/99999), el id no es
// válido (/character/abc) o la ruta no existe. Mismo estilo que error.tsx.
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-white p-4">
      <h2 className="text-2xl font-bold mb-4 text-orange-500">Not found</h2>
      <p className="text-gray-400 mb-6 text-center max-w-md">
        This character or page doesn&apos;t exist in this dimension.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
      >
        Back to Characters
      </Link>
    </div>
  );
}
