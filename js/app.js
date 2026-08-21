/* ============================================================
   MKConfigure — App Controller
   Navegação entre módulos, estado global, atualização do preview
   ============================================================ */

window.MKConfigure = window.MKConfigure || {};
window.MKConfigure.state = window.MKConfigure.state || {};

window.MKConfigure.app = (function() {
  'use strict';

  var currentModule = 'identity';
  var previewMode = 'module'; // 'module' or 'full'

  var moduleOrder = [
    'identity', 'interfaces', 'bridge', 'wan', 'lan',
    'dns', 'firewall', 'nat', 'ipv6', 'extras'
  ];

  /**
   * Inicializa o app
   */
  function init() {
    // Set default state
    if (!window.MKConfigure.state.interfaces) {
      window.MKConfigure.state.interfaces = { preset: 'manual', wanPorts: ['ether1'] };
    }

    // Render initial module
    renderModule(currentModule);

    // Bind navigation
    bindNavigation();

    // Bind header actions
    bindHeaderActions();

    // Bind sidebar actions
    bindSidebarActions();

    // Initialize theme UI
    initTheme();

    // Bind preview tabs
    bindPreviewTabs();

    // Update preview
    updatePreview();
  }

  /**
   * Renderiza o módulo especificado no painel principal
   */
  function renderModule(moduleId) {
    var mod = window.MKConfigure.modules[moduleId];
    if (!mod) return;

    currentModule = moduleId;

    // Update nav
    document.querySelectorAll('.nav-item').forEach(function(item) {
      item.classList.toggle('active', item.getAttribute('data-module') === moduleId);
    });

    // Render form
    var container = document.getElementById('module-content');
    if (container) {
      container.innerHTML =
        '<div class="module-content">' +
          '<div class="module-header">' +
            '<div class="module-header-icon">' + mod.icon + '</div>' +
            '<div>' +
              '<h2 class="module-title">' + mod.title + '</h2>' +
              '<p class="module-description">' + mod.description + '</p>' +
            '</div>' +
          '</div>' +
          '<div class="mt-6">' +
            mod.renderForm(window.MKConfigure.state) +
          '</div>' +
        '</div>';

      // Bind module events
      if (typeof mod.bindEvents === 'function') {
        mod.bindEvents();
      }

      // Add global input listener for live preview
      container.addEventListener('input', debounce(function() {
        if (typeof mod.readForm === 'function') {
          mod.readForm();
        }
        updatePreview();
      }, 300));

      container.addEventListener('change', function() {
        if (typeof mod.readForm === 'function') {
          mod.readForm();
        }
        updatePreview();
      });
    }

    // Update preview
    updatePreview();

    // Close mobile sidebar
    closeSidebar();
  }

  /**
   * Render the current module (useful after state changes)
   */
  function renderCurrentModule() {
    renderModule(currentModule);
  }

  /**
   * Atualiza o painel de preview
   */
  function updatePreview() {
    var previewBody = document.getElementById('preview-body');
    if (!previewBody) return;

    var sb = window.MKConfigure.scriptBuilder;
    var script;

    if (previewMode === 'full') {
      // Read all forms before generating
      readAllForms();
      script = sb.buildFullScript();
    } else {
      script = sb.buildModuleScript(currentModule);
    }

    if (script && script.trim()) {
      previewBody.innerHTML = '<pre>' + sb.highlight(script) + '</pre>';
    } else {
      previewBody.innerHTML =
        '<div class="preview-empty">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>' +
          '<span>Configure o módulo para ver o preview</span>' +
        '</div>';
    }

    // Update line count
    var lineCount = document.getElementById('preview-line-count');
    if (lineCount && script) {
      var lines = script.split('\n').filter(function(l) { return l.trim(); }).length;
      lineCount.textContent = lines + ' linhas';
    }
  }

  /**
   * Lê todos os formulários visíveis
   */
  function readAllForms() {
    var mod = window.MKConfigure.modules[currentModule];
    if (mod && typeof mod.readForm === 'function') {
      mod.readForm();
    }
  }

  /**
   * Bind sidebar navigation
   */
  function bindNavigation() {
    document.querySelectorAll('.nav-item').forEach(function(item) {
      item.addEventListener('click', function() {
        // Save current form state first
        readAllForms();
        var modId = this.getAttribute('data-module');
        if (modId) renderModule(modId);
      });
    });
  }

  /**
   * Bind header action buttons
   */
  function bindHeaderActions() {
    // Menu toggle
    var menuBtn = document.getElementById('menu-toggle');
    if (menuBtn) {
      menuBtn.addEventListener('click', toggleSidebar);
    }

    // Overlay click
    var overlay = document.getElementById('sidebar-overlay');
    if (overlay) {
      overlay.addEventListener('click', closeSidebar);
    }

    // Theme toggle
    var themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', toggleTheme);
    }
  }

  /**
   * Inicializa o tema (Dark ou Light) a partir do localStorage
   */
  function initTheme() {
    var isLight = document.documentElement.getAttribute('data-theme') === 'light' ||
                  localStorage.getItem('mkconfigure_theme') === 'light';
    if (isLight) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    updateThemeToggleUI(isLight);
  }

  /**
   * Atualiza textos e atributos de acessibilidade do botão de tema
   */
  function updateThemeToggleUI(isLight) {
    var label = document.getElementById('theme-toggle-text');
    if (label) {
      label.textContent = isLight ? 'Modo Escuro' : 'Modo Claro';
    }
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.title = isLight ? 'Alternar para Modo Escuro' : 'Alternar para Modo Claro';
    }
  }

  /**
   * Alterna entre Modo Claro e Modo Escuro
   */
  function toggleTheme() {
    var isLight = document.documentElement.getAttribute('data-theme') === 'light';
    var nextIsLight = !isLight;
    if (nextIsLight) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('mkconfigure_theme', 'light');
      showToast('Modo Claro ativado');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('mkconfigure_theme', 'dark');
      showToast('Modo Escuro ativado');
    }
    updateThemeToggleUI(nextIsLight);
  }

  /**
   * Bind sidebar action buttons
   */
  function bindSidebarActions() {
    // Copy button
    var copyBtn = document.getElementById('btn-copy');
    if (copyBtn) {
      copyBtn.addEventListener('click', function() {
        readAllForms();
        var script = window.MKConfigure.scriptBuilder.buildFullScript();
        window.MKConfigure.scriptBuilder.copyToClipboard(script, function(ok) {
          showToast(ok ? 'Script copiado!' : 'Erro ao copiar');
        });
      });
    }

    // Download button
    var dlBtn = document.getElementById('btn-download');
    if (dlBtn) {
      dlBtn.addEventListener('click', function() {
        readAllForms();
        var script = window.MKConfigure.scriptBuilder.buildFullScript();
        var name = (window.MKConfigure.state.identity || {}).name || 'mikrotik';
        window.MKConfigure.scriptBuilder.downloadScript(script, name + '-config.rsc');
      });
    }

    // Preview copy button
    var prevCopy = document.getElementById('btn-preview-copy');
    if (prevCopy) {
      prevCopy.addEventListener('click', function() {
        readAllForms();
        var sb = window.MKConfigure.scriptBuilder;
        var script = previewMode === 'full' ? sb.buildFullScript() : sb.buildModuleScript(currentModule);
        sb.copyToClipboard(script, function(ok) {
          showToast(ok ? 'Script copiado!' : 'Erro ao copiar');
        });
      });
    }
  }

  /**
   * Bind preview mode tabs
   */
  function bindPreviewTabs() {
    document.querySelectorAll('.preview-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        document.querySelectorAll('.preview-tab').forEach(function(t) { t.classList.remove('active'); });
        this.classList.add('active');
        previewMode = this.getAttribute('data-mode');
        updatePreview();
      });
    });
  }

  /**
   * Toggle sidebar on mobile
   */
  function toggleSidebar() {
    var sidebar = document.querySelector('.app-sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('visible');
  }

  function closeSidebar() {
    var sidebar = document.querySelector('.app-sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('visible');
  }

  /**
   * Show toast notification
   */
  function showToast(message) {
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'toast success';
    toast.innerHTML =
      '<span class="toast-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></span>' +
      '<span>' + message + '</span>';
    document.body.appendChild(toast);

    setTimeout(function() {
      toast.classList.add('hidden');
      setTimeout(function() { toast.remove(); }, 300);
    }, 2500);
  }

  /**
   * Debounce utility
   */
  function debounce(fn, delay) {
    var timer;
    return function() {
      var ctx = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function() { fn.apply(ctx, args); }, delay);
    };
  }

  return {
    init: init,
    renderModule: renderModule,
    renderCurrentModule: renderCurrentModule,
    updatePreview: updatePreview,
    showToast: showToast
  };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.MKConfigure.app.init();
});
