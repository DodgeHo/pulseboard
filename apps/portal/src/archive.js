(() => {
  const search = document.querySelector('[data-project-search]');
  const filters = Array.from(document.querySelectorAll('[data-project-filter]'));
  const sort = document.querySelector('[data-project-sort]');
  const table = document.querySelector('[data-project-table]');
  const count = document.querySelector('[data-result-count]');
  const empty = document.querySelector('[data-empty-results]');
  if (!table) return;

  const rows = Array.from(table.querySelectorAll('[data-project-row]'));
  let activeFilter = 'all';

  const score = (row) => Number(row.dataset.score || 0);
  const date = (row) => Date.parse(row.dataset.updated || '') || 0;
  const name = (row) => row.dataset.name || '';

  const apply = () => {
    const query = (search?.value || '').trim().toLocaleLowerCase();
    const order = sort?.value || 'value';
    const visible = rows.filter((row) => {
      const matchesFilter = activeFilter === 'all' || row.dataset.category === activeFilter || row.dataset.origin === activeFilter || row.dataset.visibility === activeFilter || (activeFilter === 'featured' && row.dataset.featured === 'true');
      const matchesSearch = !query || (row.dataset.search || '').includes(query);
      row.hidden = !(matchesFilter && matchesSearch);
      return matchesFilter && matchesSearch;
    });

    visible.sort((left, right) => {
      if (order === 'name') return name(left).localeCompare(name(right));
      if (order === 'updated') return date(right) - date(left) || score(right) - score(left);
      return score(right) - score(left) || name(left).localeCompare(name(right));
    });
    visible.forEach((row) => table.append(row));
    rows.filter((row) => row.hidden).forEach((row) => table.append(row));
    visible.forEach((row, index) => {
      const marker = row.querySelector('[data-row-index]');
      if (marker) marker.textContent = String(index + 1).padStart(2, '0');
    });
    if (count) count.textContent = count.dataset.template.replace('{count}', String(visible.length));
    if (empty) empty.hidden = visible.length > 0;
  };

  search?.addEventListener('input', apply);
  sort?.addEventListener('change', apply);
  filters.forEach((button) => button.addEventListener('click', () => {
    activeFilter = button.dataset.projectFilter || 'all';
    filters.forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)));
    apply();
  }));
  apply();
})();
