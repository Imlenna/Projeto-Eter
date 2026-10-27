import { CITY_GROUPS, norm, cityLabel } from './cities.js';

export function initCityPicker({ input, list, toggle, onSubmit }) {
  let allItems = [];
  let active = -1;
  const isOpen = () => !list.classList.contains('hidden');

  function buildList() {
    list.replaceChildren();
    allItems = [];
    for (const g of CITY_GROUPS) {
      const head = document.createElement('div');
      head.className = 'combo-group';
      head.textContent = g.country;
      head.setAttribute('role', 'presentation');
      list.append(head);

      for (const c of g.cities) {
        const el = document.createElement('div');
        el.className = 'combo-item';
        el.setAttribute('role', 'option');
        el.textContent = c.name;
        const label = cityLabel(c, g.country);
        el.dataset.label = label;
        el.dataset.search = norm(`${c.name} ${g.country}`);
        list.append(el);
        allItems.push({ el, country: norm(g.country), name: norm(c.name) });
      }
    }
  }

  buildList();

  function setActive(i) {
    const visibleItems = allItems.filter(item => !item.el.classList.contains('hidden-item') && item.el.style.display !== 'none');
    visibleItems[active]?.el.classList.remove('active');
    active = visibleItems.length ? (i + visibleItems.length) % visibleItems.length : -1;
    const target = visibleItems[active];
    if (target) {
      target.el.classList.add('active');
      target.el.scrollIntoView({ block: 'nearest' });
    }
  }

  function filterAndRender(query) {
    const q = norm(query);
    let hasVisible = false;
    let currentGroupEl = null;
    let groupHasVisible = false;

    for (const node of list.children) {
      if (node.classList.contains('combo-group')) {
        if (currentGroupEl) {
          currentGroupEl.style.display = groupHasVisible ? '' : 'none';
        }
        currentGroupEl = node;
        groupHasVisible = false;
      } else if (node.classList.contains('combo-item')) {
        const match = !q || node.dataset.search.includes(q);
        if (match) {
          node.style.display = '';
          groupHasVisible = true;
          hasVisible = true;
        } else {
          node.style.display = 'none';
        }
      }
    }
    if (currentGroupEl) {
      currentGroupEl.style.display = groupHasVisible ? '' : 'none';
    }

    let emptyEl = list.querySelector('.combo-empty');
    if (!hasVisible) {
      if (!emptyEl) {
        emptyEl = document.createElement('div');
        emptyEl.className = 'combo-empty';
        list.append(emptyEl);
      }
      emptyEl.textContent = `Nenhuma sugestão para "${query.trim()}". Ao clicar em "Atualizar céu", essa cidade será buscada na internet.`;
      emptyEl.style.display = '';
    } else if (emptyEl) {
      emptyEl.style.display = 'none';
    }
    active = -1;
  }

  function open(query = '') {
    filterAndRender(query);
    list.classList.remove('hidden');
    input.setAttribute('aria-expanded', 'true');
  }

  function close() {
    list.classList.add('hidden');
    input.setAttribute('aria-expanded', 'false');
    active = -1;
  }

  function choose(el) {
    input.value = el.dataset.label;
    close();
  }

  // Ao clicar no botão toggle, abre a lista exibindo todas as cidades (ignora o texto selecionado)
  toggle.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    if (isOpen()) close();
    else open('');
  });

  // Ao focar ou clicar no input, também abre a lista completa para facilitar a escolha rápida
  input.addEventListener('focus', () => {
    if (!isOpen()) {
      open('');
    }
  });

  input.addEventListener('click', () => {
    if (!isOpen()) {
      open('');
    }
  });

  // Apenas ao digitar ativamente é que o filtro por texto é aplicado
  input.addEventListener('input', () => {
    open(input.value);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen()) open('');
      setActive(active + 1);
    } else if (e.key === 'ArrowUp' && isOpen()) {
      e.preventDefault();
      setActive(active - 1);
    } else if (e.key === 'Escape') {
      close();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const visibleItems = allItems.filter(item => item.el.style.display !== 'none');
      if (isOpen() && active >= 0 && visibleItems[active]) {
        choose(visibleItems[active].el);
      } else {
        close();
        onSubmit?.();
      }
    }
  });

  list.addEventListener('pointerdown', e => e.preventDefault());
  list.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    const el = e.target.closest('.combo-item');
    if (el) choose(el);
  });

  document.addEventListener('click', e => {
    if (isOpen() && !list.contains(e.target) && e.target !== input && e.target !== toggle) {
      close();
    }
  });
}