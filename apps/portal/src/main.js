(() => {
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  const projects = Array.from(document.querySelectorAll('[data-project]'));
  const studyBand = document.querySelector('[data-project-group]');
  const emptyState = document.querySelector('[data-empty-state]');

  const applyFilter = (filter) => {
    filterButtons.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    projects.forEach((project) => {
      project.hidden = filter !== 'all' && project.dataset.category !== filter;
    });

    if (studyBand) {
      studyBand.hidden = filter === 'systems';
    }

    const visibleProjects = projects.filter((project) => !project.hidden && !project.closest('[data-project-group]')?.hidden);
    if (emptyState) {
      emptyState.hidden = visibleProjects.length > 0;
    }
  };

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => applyFilter(button.dataset.filter || 'all'));
  });

  const previewButtons = Array.from(document.querySelectorAll('[data-preview-target]'));
  const previewImages = Array.from(document.querySelectorAll('[data-preview]'));

  previewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.previewTarget;
      previewButtons.forEach((candidate) => {
        const active = candidate === button;
        candidate.classList.toggle('is-active', active);
        candidate.setAttribute('aria-pressed', String(active));
      });
      previewImages.forEach((image) => image.classList.toggle('is-active', image.dataset.preview === target));
    });
  });

  const setRouteStatus = (path, state, label) => {
    document.querySelectorAll('[data-route-status="' + path + '"]').forEach((element) => {
      element.classList.remove('is-checking', 'is-online', 'is-unavailable');
      element.classList.add('is-' + state);
      const text = element.querySelector('span');
      if (text) text.textContent = label;
    });
  };

  const fetchRoute = async (path) => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5500);
    try {
      let response = await fetch(path, {
        method: 'HEAD',
        cache: 'no-store',
        credentials: 'same-origin',
        signal: controller.signal
      });
      if (response.status === 405 || response.status === 501) {
        response = await fetch(path, {
          method: 'GET',
          cache: 'no-store',
          credentials: 'same-origin',
          headers: { Range: 'bytes=0-0' },
          signal: controller.signal
        });
      }
      return response.ok || (response.status >= 300 && response.status < 400);
    } catch {
      return false;
    } finally {
      window.clearTimeout(timeout);
    }
  };

  const checkRoutes = async () => {
    const routes = [...new Set(projects.map((project) => project.dataset.route).filter(Boolean))];
    if (window.location.protocol === 'file:') {
      routes.forEach((path) => setRouteStatus(path, 'checking', 'Build preview'));
      return;
    }
    await Promise.all(routes.map(async (path) => {
      const online = await fetchRoute(path);
      setRouteStatus(path, online ? 'online' : 'unavailable', online ? 'Route online' : 'Check route');
    }));
  };

  applyFilter('all');
  checkRoutes();
})();
