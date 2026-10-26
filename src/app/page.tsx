import Link from 'next/link';
import { ApiError, getCharacters } from '@/lib/api';
import { parsePageParam } from '@/lib/utils';
import CharacterCard from '@/components/CharacterCard';
import Pagination from '@/components/Pagination';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const page = parsePageParam(resolvedSearchParams.page);
  // La API responde 404 cuando la página no existe (por ejemplo ?page=999):
  // se muestra un estado vacío. Cualquier otro error llega a error.tsx.
  const data = await getCharacters(page).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-orange-500 drop-shadow-lg">
        Rick and Morty Characters
      </h1>

      {!data || data.results.length === 0 ? (
        <div role="status" className="text-center text-gray-300 py-16">
          <p className="text-xl mb-4">No characters found on page {page}.</p>
          <Link href="/" className="text-orange-500 hover:text-orange-400 font-semibold transition-colors">
            Go to the first page
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.results.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>

          <Pagination currentPage={page} totalPages={data.info.pages} />
        </>
      )}
    </main>
  );
}
