/* ============================================================
   MKConfigure — Módulo: Interfaces & Portas
   ============================================================ */

window.MKConfigure = window.MKConfigure || {};
window.MKConfigure.modules = window.MKConfigure.modules || {};

window.MKConfigure.modules.interfaces = {
  id: 'interfaces',
  title: 'Interfaces & Portas',
  description: 'Seleção de modelo, quantidade de portas e definição de uplink',
  icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="6" y1="12" x2="6" y2="12.01"/><line x1="10" y1="12" x2="10" y2="12.01"/><line x1="14" y1="12" x2="14" y2="12.01"/><line x1="18" y1="12" x2="18" y2="12.01"/></svg>',

  renderForm: function(state) {
    var s = state.interfaces || {};
    var presets = window.MKConfigure.presets;

    // Preset cards
    var presetCards = '';
    var categories = { manual: 'Manual', home: 'Home / WiFi', router: 'Roteadores', core: 'Core / Carrier', switch: 'Switches' };
    var catOrder = ['manual', 'home', 'router', 'core', 'switch'];

    for (var ci = 0; ci < catOrder.length; ci++) {
      var cat = catOrder[ci];
      var catCards = '';
      for (var key in presets) {
        if (presets[key].category === cat) {
          var p = presets[key];
          var isSelected = (s.preset || 'manual') === key;
          var totalPorts = p.etherPorts + p.sfpPorts + p.sfpPlusPorts;
          catCards +=
            '<div class="preset-card' + (isSelected ? ' selected' : '') + '" data-preset="' + key + '">' +
              '<div class="preset-card-name">' + p.label + '</div>' +
              '<div class="preset-card-info">' + p.description + '</div>' +
              '<span class="preset-card-badge">' + totalPorts + ' portas' + (p.wifi ? ' + WiFi' : '') + '</span>' +
            '</div>';
        }
      }
      if (catCards) {
        presetCards +=
          '<div class="sidebar-section-label mt-4 mb-2">' + categories[cat] + '</div>' +
          '<div class="preset-grid">' + catCards + '</div>';
      }
    }

    // Manual port count
    var manualSection = '';
    if ((s.preset || 'manual') === 'manual') {
      manualSection =
        '<div class="form-card mt-4" id="if-manual-section">' +
          '<div class="form-card-title">Configuração Manual de Portas</div>' +
          '<div class="form-grid">' +
            '<div class="form-group">' +
              '<label class="form-label">Portas Ethernet</label>' +
              '<input type="number" class="form-input" id="if-ether-count" value="' + (s.etherCount || 5) + '" min="1" max="48">' +
            '</div>' +
            '<div class="form-group">' +
              '<label class="form-label">Portas SFP</label>' +
              '<input type="number" class="form-input" id="if-sfp-count" value="' + (s.sfpCount || 0) + '" min="0" max="12">' +
            '</div>' +
            '<div class="form-group">' +
              '<label class="form-label">Portas SFP+</label>' +
              '<input type="number" class="form-input" id="if-sfpplus-count" value="' + (s.sfpPlusCount || 0) + '" min="0" max="16">' +
            '</div>' +
          '</div>' +
        '</div>';
    }

    // Port assignment (WAN / Bridge)
    var ifNames = this._getInterfaces(state);
    var wanPorts = s.wanPorts || ['ether1'];
    var portChips = '';
    for (var i = 0; i < ifNames.all.length; i++) {
      var pName = ifNames.all[i];
      var isWan = wanPorts.indexOf(pName) !== -1;
      var isSfp = pName.indexOf('sfp') === 0;
      var cls = isWan ? 'wan' : (isSfp ? 'sfp' : 'bridge');
      portChips +=
        '<div class="port-chip ' + cls + '" data-port="' + pName + '" data-role="' + (isWan ? 'wan' : 'bridge') + '">' +
          pName +
        '</div>';
    }

    return '' +
      '<div class="form-card">' +
        '<div class="form-card-title">Modelo do Equipamento</div>' +
        '<p class="text-xs text-muted mb-3">Selecione o modelo do seu MikroTik ou configure manualmente</p>' +
        presetCards +
      '</div>' +

      manualSection +

      '<div class="form-card mt-4">' +
        '<div class="form-card-title">Definição de Portas — Clique para alternar WAN/Bridge</div>' +
        '<p class="text-xs text-muted mb-3">Clique em uma porta para alternar entre WAN (laranja) e Bridge (verde). SFP (azul) pode ser WAN.</p>' +
        '<div class="port-grid" id="if-port-grid">' +
          portChips +
        '</div>' +
        '<div class="port-legend mt-3">' +
          '<div class="port-legend-item"><div class="port-legend-dot wan"></div> WAN (Uplink)</div>' +
          '<div class="port-legend-item"><div class="port-legend-dot bridge"></div> Bridge (LAN)</div>' +
          '<div class="port-legend-item"><div class="port-legend-dot sfp"></div> SFP (não atribuída)</div>' +
        '</div>' +
      '</div>';
  },

  bindEvents: function() {
    var self = this;

    // Preset selection
    document.querySelectorAll('.preset-card').forEach(function(card) {
      card.addEventListener('click', function() {
        document.querySelectorAll('.preset-card').forEach(function(c) { c.classList.remove('selected'); });
        this.classList.add('selected');
        var presetId = this.getAttribute('data-preset');
        window.MKConfigure.state.interfaces = window.MKConfigure.state.interfaces || {};
        window.MKConfigure.state.interfaces.preset = presetId;
        // Re-render this module
        window.MKConfigure.app.renderCurrentModule();
      });
    });

    // Manual port counts
    ['if-ether-count', 'if-sfp-count', 'if-sfpplus-count'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', function() {
          self.readForm();
          window.MKConfigure.app.renderCurrentModule();
        });
      }
    });

    // Port click to toggle WAN/Bridge
    document.querySelectorAll('#if-port-grid .port-chip').forEach(function(chip) {
      chip.addEventListener('click', function() {
        var role = this.getAttribute('data-role');
        if (role === 'wan') {
          this.setAttribute('data-role', 'bridge');
          this.classList.remove('wan', 'sfp');
          this.classList.add('bridge');
        } else {
          this.setAttribute('data-role', 'wan');
          this.classList.remove('bridge', 'sfp');
          this.classList.add('wan');
        }
        self.readForm();
      });
    });
  },

  readForm: function() {
    var state = window.MKConfigure.state.interfaces || {};
    state.preset = state.preset || 'manual';

    if (state.preset === 'manual') {
      state.etherCount = parseInt((document.getElementById('if-ether-count') || {}).value) || 5;
      state.sfpCount = parseInt((document.getElementById('if-sfp-count') || {}).value) || 0;
      state.sfpPlusCount = parseInt((document.getElementById('if-sfpplus-count') || {}).value) || 0;
    }

    // Read port roles
    var wanPorts = [];
    document.querySelectorAll('#if-port-grid .port-chip').forEach(function(chip) {
      if (chip.getAttribute('data-role') === 'wan') {
        wanPorts.push(chip.getAttribute('data-port'));
      }
    });
    state.wanPorts = wanPorts.length > 0 ? wanPorts : ['ether1'];

    window.MKConfigure.state.interfaces = state;
    return state;
  },

  generateScript: function(state) {
    var s = state.interfaces || {};
    var lines = [];
    lines.push('#');
    lines.push('# ── Interfaces ───────────────────────────────────');
    lines.push('#');

    var ifNames = this._getInterfaces(state);

    // Comment interfaces
    var wanPorts = s.wanPorts || ['ether1'];
    for (var i = 0; i < ifNames.all.length; i++) {
      var name = ifNames.all[i];
      var isWan = wanPorts.indexOf(name) !== -1;
      lines.push('/interface ethernet set [find default-name=' + name + '] comment="' + (isWan ? 'WAN' : 'LAN') + '"');
    }
    lines.push('');

    // Interface Lists
    lines.push('/interface list add name=WAN comment="WAN interfaces"');
    lines.push('/interface list add name=LAN comment="LAN interfaces"');
    lines.push('');

    return lines.join('\n');
  },

  _getInterfaces: function(state) {
    var s = state.interfaces || {};
    var preset = s.preset || 'manual';
    if (preset === 'manual') {
      return window.MKConfigure.getInterfaceNames('manual', s.etherCount || 5);
    }
    return window.MKConfigure.getInterfaceNames(preset);
  }
};
