import { useEffect, useState } from 'react';

const wait = (ms, signal) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);

    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          reject(new DOMException('The operation was aborted.', 'AbortError'));
        },
        { once: true }
      );
    }
  });

const mockSearchUsers = async (query, signal) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  const delayByQuery = {
    ali: 500,
    bob: 120,
    char: 200
  };

  const delay = delayByQuery[normalized] ?? 250;
  await wait(delay, signal);

  const allUsers = [
    { id: 1, name: 'Alice Johnson' },
    { id: 2, name: 'Alicia Smith' },
    { id: 3, name: 'Bob Jones' },
    { id: 4, name: 'Bobby Lee' },
    { id: 5, name: 'Charlie Brown' },
    { id: 6, name: 'Charlotte Davis' }
  ];

  return allUsers.filter((user) => user.name.toLowerCase().includes(normalized));
};

export default function SearchResults() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let isActive = true;
    setLoading(true);

    mockSearchUsers(query, controller.signal)
      .then((data) => {
        if (isActive && !controller.signal.aborted) {
          setResults(data);
        }
      })
      .catch((error) => {
        if (error?.name === 'AbortError' || controller.signal.aborted) {
          return;
        }

        if (isActive) {
          setResults([]);
        }
      })
      .finally(() => {
        if (isActive && !controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [query]);

  return (
    <section>
      <label htmlFor="search-query">Search users</label>
      <input
        id="search-query"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Type to search..."
        aria-label="Search users"
      />

      {loading && <p aria-live="polite">Loading...</p>}

      <ul aria-label="Search results">
        {results.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </section>
  );
}
