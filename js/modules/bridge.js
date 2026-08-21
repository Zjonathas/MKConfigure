/* ============================================================
   MKConfigure — Módulo: Bridge & VLANs (Avançado)
   Suporte a Bridge VLAN Filtering 802.1Q, Portas Trunk/Access/Hybrid,
   Tagged/Untagged, Matriz Visual e Inter-VLAN Routing (L3 + DHCP).
   ============================================================ */

window.MKConfigure = window.MKConfigure || {};
window.MKConfigure.modules = window.MKConfigure.modules || {};

window.MKConfigure.modules.bridge = {
  id: 'bridge',
  title: 'Bridge & VLANs',
  description: 'Bridge VLAN Filtering 802.1Q, portas Trunk/Access, Tagged/Untagged e DHCP por VLAN',
  icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>',

  renderForm: function(state) {
    var s = state.bridge || {};
    var bridgeName = s.bridgeName || 'bridge';
    var vlanEnabled = s.vlanEnabled !== false; // Default enabled when configuring VLANs

    // Get LAN ports (those not WAN)
    var ifState = state.interfaces || {};
    var wanPorts = ifState.wanPorts || ['ether1'];
    var allIfs = window.MKConfigure.modules.interfaces._getInterfaces(state);
    var lanPorts = allIfs.all.filter(function(p) { return wanPorts.indexOf(p) === -1; });

    // VLANs list
    var vlans = s.vlans || [
      { id: 10, name: 'VLAN_CORP', ip: '192.168.10.1', mask: '24', dhcpEnabled: true },
      { id: 20, name: 'VLAN_GUEST', ip: '192.168.20.1', mask: '24', dhcpEnabled: true }
    ];

    // Port mappings
    var portConfigs = s.ports || {};
    // Ensure default config for each LAN port if not present
    for (var lp = 0; lp < lanPorts.length; lp++) {
      var pName = lanPorts[lp];
      if (!portConfigs[pName]) {
        if (lp === 0 && lanPorts.length > 1) {
          // First LAN port defaults to Trunk for switch uplink
          portConfigs[pName] = { mode: 'trunk', pvid: 1, taggedVlans: 'all', ingressFiltering: true, frameTypes: 'admit-only-vlan-tagged' };
        } else if (vlans.length > 0 && lp <= vlans.length) {
          // Other ports default to Access for available VLANs
          var assignedVlan = vlans[lp - 1] ? vlans[lp - 1].id : (vlans[0] ? vlans[0].id : 1);
          portConfigs[pName] = { mode: 'access', pvid: assignedVlan, taggedVlans: '', ingressFiltering: true, frameTypes: 'admit-only-untagged-and-priority-tagged' };
        } else {
          portConfigs[pName] = { mode: 'default', pvid: 1, taggedVlans: '', ingressFiltering: false, frameTypes: 'admit-all' };
        }
      }
    }

    // Render LAN Port Chips for Overview
    var portList = '';
    for (var i = 0; i < lanPorts.length; i++) {
      var p = lanPorts[i];
      var pMode = (portConfigs[p] || {}).mode || 'default';
      var modeBadge = pMode === 'trunk' ? 'Trunk' : (pMode === 'access' ? 'Acc (PVID ' + (portConfigs[p].pvid || 1) + ')' : (pMode === 'hybrid' ? 'Hyb' : 'LAN'));
      portList += '<span class="port-chip bridge" title="Modo: ' + pMode + '">' + p + ' <small style="opacity:0.8;font-size:10px">[' + modeBadge + ']</small></span>';
    }

    // Render VLAN Definition Cards
    var vlanCardsHtml = '';
    for (var v = 0; v < vlans.length; v++) {
      var vItem = vlans[v];
      vlanCardsHtml += this._renderVlanCard(v, vItem);
    }

    // Render Port Configuration Table
    var portRowsHtml = '';
    for (var pi = 0; pi < lanPorts.length; pi++) {
      var portName = lanPorts[pi];
      var cfg = portConfigs[portName] || { mode: 'default', pvid: 1, taggedVlans: '', ingressFiltering: false, frameTypes: 'admit-all' };
      portRowsHtml += this._renderPortRow(portName, cfg, vlans);
    }

    // Render Tagging Matrix
    var matrixHtml = this._renderVlanMatrix(bridgeName, lanPorts, vlans, portConfigs);

    return '' +
      '<div class="form-card">' +
        '<div class="form-card-title">Bridge Principal</div>' +
        '<div class="form-grid">' +
          '<div class="form-group">' +
            '<label class="form-label">Nome da Bridge</label>' +
            '<input type="text" class="form-input" id="br-name" value="' + bridgeName + '" placeholder="bridge">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">Protocol Mode (STP)</label>' +
            '<select class="form-select" id="br-proto-mode">' +
              '<option value="rstp"' + ((s.protoMode || 'rstp') === 'rstp' ? ' selected' : '') + '>RSTP (Rapid Spanning Tree - Recomendado)</option>' +
              '<option value="mstp"' + (s.protoMode === 'mstp' ? ' selected' : '') + '>MSTP (Multiple Spanning Tree)</option>' +
              '<option value="stp"' + (s.protoMode === 'stp' ? ' selected' : '') + '>STP (Clássico)</option>' +
              '<option value="none"' + (s.protoMode === 'none' ? ' selected' : '') + '>Nenhum (Desativado)</option>' +
            '</select>' +
          '</div>' +
        '</div>' +
        '<div class="mt-3">' +
          '<label class="form-label mb-2">Portas Membro da Bridge (LAN)</label>' +
          '<div class="port-grid">' + (portList || '<span class="text-xs text-muted">Nenhuma porta LAN disponível</span>') + '</div>' +
        '</div>' +
      '</div>' +

      '<div class="form-card mt-4">' +
        '<div class="form-card-title">Bridge VLAN Filtering (802.1Q)</div>' +
        '<div class="toggle-row">' +
          '<div class="toggle-label">' +
            '<span>Habilitar VLAN Filtering na Bridge</span>' +
            '<span class="toggle-desc">Ativa filtragem 802.1Q de alta performance com Hardware Offloading</span>' +
          '</div>' +
          '<label class="toggle-switch">' +
            '<input type="checkbox" id="br-vlan-enabled" ' + (vlanEnabled ? 'checked' : '') + '>' +
            '<span class="toggle-slider"></span>' +
          '</label>' +
        '</div>' +
      '</div>' +

      '<div id="br-vlan-full-section" style="' + (vlanEnabled ? '' : 'display:none') + '">' +

        '<!-- VLAN Definition Cards -->' +
        '<div class="form-card mt-4">' +
          '<div class="form-card-title">' +
            '<span>Tabela de VLANs</span>' +
            '<span class="badge">' + vlans.length + ' configuradas</span>' +
          '</div>' +
          '<p class="text-xs text-muted mb-3">Defina as VLANs 802.1Q e seus respectivos gateways L3 / servidores DHCP.</p>' +
          '<div id="br-vlan-cards-container">' +
            (vlanCardsHtml || '<p class="text-xs text-muted">Nenhuma VLAN criada ainda. Clique no botão abaixo para adicionar.</p>') +
          '</div>' +
          '<div class="dynamic-list-add mt-3" id="br-add-vlan-btn">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
            'Adicionar Nova VLAN' +
          '</div>' +
        '</div>' +

        '<!-- Port Configuration Table -->' +
        '<div class="form-card mt-4">' +
          '<div class="form-card-title">Configuração das Portas da Bridge (Trunk, Access, PVID)</div>' +
          '<p class="text-xs text-muted mb-3">Defina o papel de cada interface conectada à bridge:</p>' +
          '<div style="overflow-x:auto">' +
            '<table class="port-vlan-table">' +
              '<thead>' +
                '<tr>' +
                  '<th>Interface</th>' +
                  '<th>Modo</th>' +
                  '<th>PVID (Access/Native)</th>' +
                  '<th>VLANs Tagged (Trunk)</th>' +
                  '<th>Frame Types</th>' +
                  '<th>Ingress Filter</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody id="br-port-table-body">' +
                portRowsHtml +
              '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>' +

        '<!-- Visual Matrix -->' +
        '<div class="form-card mt-4">' +
          '<div class="form-card-title">Matriz Visual de Tagging por VLAN</div>' +
          '<p class="text-xs text-muted mb-2">Visão geral do tráfego: <strong class="text-accent">T</strong> = Tagged (marcado) | <strong class="text-success">U</strong> = Untagged (não marcado/PVID)</p>' +
          '<div class="vlan-matrix-container">' +
            matrixHtml +
          '</div>' +
        '</div>' +

      '</div>';
  },

  _renderVlanCard: function(index, vlan) {
    var hasL3 = Boolean(vlan.ip);
    var vId = vlan.id || 10;
    var vName = vlan.name || ('VLAN_' + vId);
    var vIp = vlan.ip || '';
    var vMask = vlan.mask || '24';
    var dhcpOn = vlan.dhcpEnabled !== false && hasL3;

    return '' +
      '<div class="vlan-card" data-vlan-idx="' + index + '">' +
        '<div class="vlan-card-header">' +
          '<div class="flex items-center gap-2">' +
            '<span class="vlan-badge vlan-badge-id">VID ' + vId + '</span>' +
            '<strong class="text-sm">' + vName + '</strong>' +
          '</div>' +
          '<button type="button" class="btn btn-danger btn-sm btn-icon vlan-card-remove" title="Excluir VLAN">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="form-grid">' +
          '<div class="form-group">' +
            '<label class="form-label">VLAN ID (1-4094) <span class="required">*</span></label>' +
            '<input type="number" class="form-input vlan-input-id" value="' + vId + '" min="1" max="4094" placeholder="10">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">Nome da VLAN</label>' +
            '<input type="text" class="form-input vlan-input-name" value="' + vName + '" placeholder="Ex: VLAN_CORP">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">IP Gateway L3 <span class="hint">(Opcional: cria interface no roteador)</span></label>' +
            '<input type="text" class="form-input vlan-input-ip" value="' + vIp + '" placeholder="Ex: 192.168.10.1">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">Máscara (CIDR)</label>' +
            '<input type="text" class="form-input vlan-input-mask" value="' + vMask + '" placeholder="24">' +
          '</div>' +
        '</div>' +
        '<div class="toggle-row mt-3" style="padding-top:4px">' +
          '<div class="toggle-label">' +
            '<span class="text-xs">Servidor DHCP nesta VLAN</span>' +
            '<span class="toggle-desc">Distribui IPs automaticamente para clientes desta VLAN</span>' +
          '</div>' +
          '<label class="toggle-switch">' +
            '<input type="checkbox" class="vlan-input-dhcp" ' + (dhcpOn ? 'checked' : '') + ' ' + (!hasL3 ? 'disabled' : '') + '>' +
            '<span class="toggle-slider"></span>' +
          '</label>' +
        '</div>' +
      '</div>';
  },

  _renderPortRow: function(portName, cfg, vlans) {
    var mode = cfg.mode || 'default';
    var pvid = cfg.pvid || 1;
    var taggedVlans = cfg.taggedVlans || 'all';
    var frameTypes = cfg.frameTypes || 'admit-all';
    var ingressFiltering = cfg.ingressFiltering !== false;

    var modeBadgeCls = 'badge-mode ' + mode;

    // Build PVID options
    var pvidOptions = '<option value="1"' + (pvid === 1 ? ' selected' : '') + '>1 (Padrão/Nativo)</option>';
    for (var v = 0; v < vlans.length; v++) {
      var vId = vlans[v].id;
      pvidOptions += '<option value="' + vId + '"' + (pvid === vId ? ' selected' : '') + '>' + vId + ' (' + (vlans[v].name || ('VLAN_' + vId)) + ')</option>';
    }

    return '' +
      '<tr data-port="' + portName + '">' +
        '<td>' +
          '<strong>' + portName + '</strong><br>' +
          '<span class="' + modeBadgeCls + '">' + mode + '</span>' +
        '</td>' +
        '<td>' +
          '<select class="form-select port-mode-select" style="min-width:130px">' +
            '<option value="trunk"' + (mode === 'trunk' ? ' selected' : '') + '>🔵 Trunk (Tagged)</option>' +
            '<option value="access"' + (mode === 'access' ? ' selected' : '') + '>🟢 Access (Untagged)</option>' +
            '<option value="hybrid"' + (mode === 'hybrid' ? ' selected' : '') + '>🟠 Hybrid (Misto)</option>' +
            '<option value="default"' + (mode === 'default' ? ' selected' : '') + '>⚪ Padrão (Sem Tag)</option>' +
          '</select>' +
        '</td>' +
        '<td>' +
          '<select class="form-select port-pvid-select" style="min-width:120px" ' + (mode === 'default' ? 'disabled' : '') + '>' +
            pvidOptions +
          '</select>' +
        '</td>' +
        '<td>' +
          '<input type="text" class="form-input port-tagged-input" value="' + (mode === 'access' || mode === 'default' ? '-' : taggedVlans) + '" ' +
            (mode === 'access' || mode === 'default' ? 'disabled style="opacity:0.5"' : '') +
            ' placeholder="all ou 10,20" style="min-width:110px">' +
        '</td>' +
        '<td>' +
          '<select class="form-select port-frames-select" style="min-width:170px">' +
            '<option value="admit-all"' + (frameTypes === 'admit-all' ? ' selected' : '') + '>Admit All (Padrão)</option>' +
            '<option value="admit-only-vlan-tagged"' + (frameTypes === 'admit-only-vlan-tagged' ? ' selected' : '') + '>Admit Only Tagged (Trunk Seguro)</option>' +
            '<option value="admit-only-untagged-and-priority-tagged"' + (frameTypes === 'admit-only-untagged-and-priority-tagged' ? ' selected' : '') + '>Admit Only Untagged (Access)</option>' +
          '</select>' +
        '</td>' +
        '<td style="text-align:center">' +
          '<input type="checkbox" class="port-ingress-check" ' + (ingressFiltering ? 'checked' : '') + ' style="width:18px;height:18px;cursor:pointer">' +
        '</td>' +
      '</tr>';
  },

  _renderVlanMatrix: function(bridgeName, lanPorts, vlans, portConfigs) {
    if (!vlans || vlans.length === 0) {
      return '<div class="p-3 text-xs text-muted" style="padding:16px;text-align:center">Nenhuma VLAN definida para exibir na matriz.</div>';
    }

    var thHtml = '<th>VLAN</th><th>Nome</th><th>L3 (Router)</th>';
    for (var p = 0; p < lanPorts.length; p++) {
      thHtml += '<th>' + lanPorts[p] + '</th>';
    }

    var tbodyHtml = '';
    for (var v = 0; v < vlans.length; v++) {
      var vlan = vlans[v];
      var vId = parseInt(vlan.id, 10);
      var row = '<tr>';
      row += '<td><span class="vlan-badge vlan-badge-id">VID ' + vId + '</span></td>';
      row += '<td style="text-align:left;font-weight:600">' + (vlan.name || ('VLAN_' + vId)) + '</td>';
      row += '<td>' + (vlan.ip ? '<span class="tag-badge tagged" title="Gateway na Bridge (Tagged)">T</span>' : '<span class="tag-badge none">–</span>') + '</td>';

      for (var lp = 0; lp < lanPorts.length; lp++) {
        var pName = lanPorts[lp];
        var cfg = portConfigs[pName] || { mode: 'default', pvid: 1, taggedVlans: 'all' };
        var isTagged = false;
        var isUntagged = false;

        if (cfg.mode === 'access') {
          if (parseInt(cfg.pvid, 10) === vId) {
            isUntagged = true;
          }
        } else if (cfg.mode === 'trunk') {
          if (cfg.taggedVlans === 'all' || this._vlanMatchesList(vId, cfg.taggedVlans)) {
            isTagged = true;
          }
        } else if (cfg.mode === 'hybrid') {
          if (parseInt(cfg.pvid, 10) === vId) {
            isUntagged = true;
          } else if (cfg.taggedVlans === 'all' || this._vlanMatchesList(vId, cfg.taggedVlans)) {
            isTagged = true;
          }
        }

        if (isUntagged) {
          row += '<td><span class="tag-badge untagged" title="Untagged / PVID ' + vId + '">U</span></td>';
        } else if (isTagged) {
          row += '<td><span class="tag-badge tagged" title="Tagged">T</span></td>';
        } else {
          row += '<td><span class="tag-badge none">–</span></td>';
        }
      }
      row += '</tr>';
      tbodyHtml += row;
    }

    return '' +
      '<table class="vlan-matrix-table">' +
        '<thead><tr>' + thHtml + '</tr></thead>' +
        '<tbody>' + tbodyHtml + '</tbody>' +
      '</table>';
  },

  _vlanMatchesList: function(vId, listStr) {
    if (!listStr) return false;
    var parts = listStr.split(',');
    for (var i = 0; i < parts.length; i++) {
      var item = parts[i].trim();
      if (item === 'all') return true;
      if (parseInt(item, 10) === vId) return true;
    }
    return false;
  },

  bindEvents: function() {
    var self = this;

    // VLAN Filtering Master Toggle
    var vlanToggle = document.getElementById('br-vlan-enabled');
    var fullSection = document.getElementById('br-vlan-full-section');
    if (vlanToggle && fullSection) {
      vlanToggle.addEventListener('change', function() {
        fullSection.style.display = this.checked ? '' : 'none';
        self.readForm();
      });
    }

    // Add New VLAN Button
    var addVlanBtn = document.getElementById('br-add-vlan-btn');
    if (addVlanBtn) {
      addVlanBtn.addEventListener('click', function() {
        self.readForm();
        var s = window.MKConfigure.state.bridge || {};
        s.vlans = s.vlans || [];
        // Suggest next VID
        var nextId = 10;
        if (s.vlans.length > 0) {
          var maxId = Math.max.apply(null, s.vlans.map(function(v) { return parseInt(v.id, 10) || 0; }));
          nextId = maxId + 10;
        }
        s.vlans.push({
          id: nextId,
          name: 'VLAN_' + nextId,
          ip: '192.168.' + nextId + '.1',
          mask: '24',
          dhcpEnabled: true
        });
        window.MKConfigure.state.bridge = s;
        window.MKConfigure.app.renderCurrentModule();
      });
    }

    // Remove VLAN Button
    document.querySelectorAll('.vlan-card-remove').forEach(function(btn) {
      btn.addEventListener('click', function() {
        self.readForm();
        var card = this.closest('.vlan-card');
        var idx = parseInt(card.getAttribute('data-vlan-idx'), 10);
        var s = window.MKConfigure.state.bridge || {};
        s.vlans = s.vlans || [];
        s.vlans.splice(idx, 1);
        window.MKConfigure.state.bridge = s;
        window.MKConfigure.app.renderCurrentModule();
      });
    });

    // Port Mode Dropdown Change (dynamically adapt PVID & Tagged inputs)
    document.querySelectorAll('.port-mode-select').forEach(function(select) {
      select.addEventListener('change', function() {
        var row = this.closest('tr');
        var mode = this.value;
        var pvidSelect = row.querySelector('.port-pvid-select');
        var taggedInput = row.querySelector('.port-tagged-input');
        var framesSelect = row.querySelector('.port-frames-select');
        var modeBadge = row.querySelector('.badge-mode');

        if (modeBadge) {
          modeBadge.className = 'badge-mode ' + mode;
          modeBadge.textContent = mode;
        }

        if (mode === 'trunk') {
          pvidSelect.disabled = false;
          taggedInput.disabled = false;
          taggedInput.style.opacity = '1';
          if (taggedInput.value === '-' || !taggedInput.value) taggedInput.value = 'all';
          framesSelect.value = 'admit-only-vlan-tagged';
        } else if (mode === 'access') {
          pvidSelect.disabled = false;
          taggedInput.disabled = true;
          taggedInput.style.opacity = '0.5';
          taggedInput.value = '-';
          framesSelect.value = 'admit-only-untagged-and-priority-tagged';
        } else if (mode === 'hybrid') {
          pvidSelect.disabled = false;
          taggedInput.disabled = false;
          taggedInput.style.opacity = '1';
          if (taggedInput.value === '-') taggedInput.value = 'all';
          framesSelect.value = 'admit-all';
        } else {
          pvidSelect.disabled = true;
          pvidSelect.value = '1';
          taggedInput.disabled = true;
          taggedInput.style.opacity = '0.5';
          taggedInput.value = '-';
          framesSelect.value = 'admit-all';
        }

        self.readForm();
        // Re-render matrix without full reload if possible, or update state
      });
    });

    // Auto-toggle DHCP state based on IP entry in VLAN card
    document.querySelectorAll('.vlan-input-ip').forEach(function(input) {
      input.addEventListener('input', function() {
        var card = this.closest('.vlan-card');
        var dhcpToggle = card.querySelector('.vlan-input-dhcp');
        if (dhcpToggle) {
          dhcpToggle.disabled = !this.value.trim();
          if (this.value.trim() && !dhcpToggle.checked) {
            dhcpToggle.checked = true;
          }
        }
      });
    });
  },

  readForm: function() {
    var bridgeName = (document.getElementById('br-name') || {}).value || 'bridge';
    var protoMode = (document.getElementById('br-proto-mode') || {}).value || 'rstp';
    var vlanEnabled = (document.getElementById('br-vlan-enabled') || {}).checked !== false;

    // Read VLAN Cards
    var vlans = [];
    document.querySelectorAll('#br-vlan-cards-container .vlan-card').forEach(function(card) {
      var id = parseInt(card.querySelector('.vlan-input-id').value, 10);
      if (!isNaN(id) && id > 0) {
        vlans.push({
          id: id,
          name: card.querySelector('.vlan-input-name').value || ('VLAN_' + id),
          ip: (card.querySelector('.vlan-input-ip').value || '').trim(),
          mask: (card.querySelector('.vlan-input-mask').value || '24').trim(),
          dhcpEnabled: (card.querySelector('.vlan-input-dhcp') || {}).checked === true
        });
      }
    });

    // Read Port Rows
    var ports = {};
    document.querySelectorAll('#br-port-table-body tr').forEach(function(row) {
      var pName = row.getAttribute('data-port');
      if (pName) {
        var mode = row.querySelector('.port-mode-select').value;
        var pvid = parseInt(row.querySelector('.port-pvid-select').value, 10) || 1;
        var tagged = row.querySelector('.port-tagged-input').value;
        var frameTypes = row.querySelector('.port-frames-select').value;
        var ingressFiltering = row.querySelector('.port-ingress-check').checked;

        ports[pName] = {
          mode: mode,
          pvid: pvid,
          taggedVlans: tagged === '-' ? '' : tagged,
          frameTypes: frameTypes,
          ingressFiltering: ingressFiltering
        };
      }
    });

    var state = {
      bridgeName: bridgeName,
      protoMode: protoMode,
      vlanEnabled: vlanEnabled,
      vlans: vlans,
      ports: ports
    };

    window.MKConfigure.state.bridge = state;
    return state;
  },

  generateScript: function(state) {
    var s = state.bridge || {};
    var ifState = state.interfaces || {};
    var bridgeName = s.bridgeName || 'bridge';
    var protoMode = s.protoMode || 'rstp';
    var vlanEnabled = s.vlanEnabled !== false;
    var wanPorts = ifState.wanPorts || ['ether1'];
    var allIfs = window.MKConfigure.modules.interfaces._getInterfaces(state);
    var lanPorts = allIfs.all.filter(function(p) { return wanPorts.indexOf(p) === -1; });

    var vlans = s.vlans || [];
    var portConfigs = s.ports || {};
    var v = window.MKConfigure.validator;

    var lines = [];
    lines.push('#');
    lines.push('# ── Bridge & VLAN Filtering (802.1Q) ──────────────');
    lines.push('#');

    // Create bridge with vlan-filtering disabled initially (safety practice)
    lines.push('/interface bridge add name=' + bridgeName +
      ' protocol-mode=' + protoMode +
      ' vlan-filtering=no' +
      ' comment="LAN Bridge with 802.1Q"');
    lines.push('');

    // Configure Bridge Ports
    lines.push('# ── Bridge Ports (Trunk & Access) ──');
    lines.push('/interface bridge port');
    for (var i = 0; i < lanPorts.length; i++) {
      var pName = lanPorts[i];
      var cfg = portConfigs[pName] || { mode: 'default', pvid: 1, frameTypes: 'admit-all', ingressFiltering: false };
      var portOpts = ['bridge=' + bridgeName, 'interface=' + pName];

      if (vlanEnabled) {
        if (cfg.mode === 'access') {
          portOpts.push('pvid=' + (cfg.pvid || 1));
          portOpts.push('frame-types=' + (cfg.frameTypes || 'admit-only-untagged-and-priority-tagged'));
          if (cfg.ingressFiltering) portOpts.push('ingress-filtering=yes');
          portOpts.push('comment="Access VLAN ' + (cfg.pvid || 1) + '"');
        } else if (cfg.mode === 'trunk') {
          if (cfg.pvid && cfg.pvid !== 1) portOpts.push('pvid=' + cfg.pvid);
          portOpts.push('frame-types=' + (cfg.frameTypes || 'admit-only-vlan-tagged'));
          if (cfg.ingressFiltering) portOpts.push('ingress-filtering=yes');
          portOpts.push('comment="Trunk Port"');
        } else if (cfg.mode === 'hybrid') {
          portOpts.push('pvid=' + (cfg.pvid || 1));
          portOpts.push('frame-types=' + (cfg.frameTypes || 'admit-all'));
          if (cfg.ingressFiltering) portOpts.push('ingress-filtering=yes');
          portOpts.push('comment="Hybrid Port (PVID ' + (cfg.pvid || 1) + ')"');
        } else {
          portOpts.push('comment="LAN Port"');
        }
      }

      lines.push('add ' + portOpts.join(' '));
    }
    lines.push('');

    // Interface lists membership
    lines.push('/interface list member');
    for (var w = 0; w < wanPorts.length; w++) {
      lines.push('add interface=' + wanPorts[w] + ' list=WAN');
    }
    lines.push('add interface=' + bridgeName + ' list=LAN');

    // If VLAN filtering is enabled and we have VLANs
    if (vlanEnabled && vlans.length > 0) {
      lines.push('');
      lines.push('# ── Bridge VLAN Table ──');
      lines.push('/interface bridge vlan');

      for (var vi = 0; vi < vlans.length; vi++) {
        var vlanItem = vlans[vi];
        var vId = parseInt(vlanItem.id, 10);
        var taggedPorts = [];
        var untaggedPorts = [];

        // If this VLAN has an IP on the router, bridge itself must be in tagged list
        if (vlanItem.ip) {
          taggedPorts.push(bridgeName);
        }

        // Check which ports belong to this VLAN
        for (var lp = 0; lp < lanPorts.length; lp++) {
          var port = lanPorts[lp];
          var pCfg = portConfigs[port] || { mode: 'default', pvid: 1, taggedVlans: 'all' };

          if (pCfg.mode === 'access') {
            if (parseInt(pCfg.pvid, 10) === vId) {
              untaggedPorts.push(port);
            }
          } else if (pCfg.mode === 'trunk') {
            if (pCfg.taggedVlans === 'all' || this._vlanMatchesList(vId, pCfg.taggedVlans)) {
              taggedPorts.push(port);
            }
          } else if (pCfg.mode === 'hybrid') {
            if (parseInt(pCfg.pvid, 10) === vId) {
              untaggedPorts.push(port);
            }
            if (pCfg.taggedVlans === 'all' || this._vlanMatchesList(vId, pCfg.taggedVlans)) {
              if (taggedPorts.indexOf(port) === -1) taggedPorts.push(port);
            }
          }
        }

        var vlanCmd = ['bridge=' + bridgeName, 'vlan-ids=' + vId];
        if (taggedPorts.length > 0) vlanCmd.push('tagged=' + taggedPorts.join(','));
        if (untaggedPorts.length > 0) vlanCmd.push('untagged=' + untaggedPorts.join(','));
        vlanCmd.push('comment="' + (vlanItem.name || ('VLAN ' + vId)) + '"');

        lines.push('add ' + vlanCmd.join(' '));
      }
      lines.push('');

      // L3 Interfaces on the router (Gateways & DHCP)
      var l3Vlans = vlans.filter(function(vl) { return Boolean(vl.ip); });
      if (l3Vlans.length > 0) {
        lines.push('# ── L3 VLAN Interfaces (Router as Gateway) ──');
        lines.push('/interface vlan');
        for (var l = 0; l < l3Vlans.length; l++) {
          var lVlan = l3Vlans[l];
          var ifName = 'vlan' + lVlan.id;
          lines.push('add name=' + ifName + ' vlan-id=' + lVlan.id + ' interface=' + bridgeName + ' comment="' + (lVlan.name || ifName) + ' Gateway"');
        }
        lines.push('');

        // Add L3 VLAN interfaces to LAN interface list
        lines.push('# Adiciona VLANs à lista LAN do Firewall');
        lines.push('/interface list member');
        for (var lm = 0; lm < l3Vlans.length; lm++) {
          lines.push('add interface=vlan' + l3Vlans[lm].id + ' list=LAN');
        }
        lines.push('');

        // IP addresses for VLANs
        lines.push('/ip address');
        for (var ipIdx = 0; ipIdx < l3Vlans.length; ipIdx++) {
          var ipVlan = l3Vlans[ipIdx];
          lines.push('add address=' + ipVlan.ip + '/' + (ipVlan.mask || '24') + ' interface=vlan' + ipVlan.id + ' comment="' + (ipVlan.name || ('VLAN ' + ipVlan.id)) + ' IP"');
        }
        lines.push('');

        // DHCP Server for VLANs
        var dhcpVlans = l3Vlans.filter(function(vl) { return vl.dhcpEnabled !== false; });
        if (dhcpVlans.length > 0) {
          lines.push('# ── DHCP Servers por VLAN ──');
          for (var d = 0; d < dhcpVlans.length; d++) {
            var dVlan = dhcpVlans[d];
            var dNet = v.networkAddress(dVlan.ip, dVlan.mask || '24');
            var dRange = v.defaultDHCPRange(dVlan.ip, dVlan.mask || '24');
            var poolName = 'pool-vlan' + dVlan.id;

            lines.push('/ip pool add name=' + poolName + ' ranges=' + dRange.start + '-' + dRange.end);
            lines.push('/ip dhcp-server add name=dhcp-vlan' + dVlan.id + ' interface=vlan' + dVlan.id + ' address-pool=' + poolName + ' lease-time=1d disabled=no');
            lines.push('/ip dhcp-server network add address=' + dNet + '/' + (dVlan.mask || '24') +
              ' gateway=' + dVlan.ip +
              ' dns-server=' + dVlan.ip +
              ' comment="' + (dVlan.name || ('VLAN ' + dVlan.id)) + ' DHCP"');
          }
          lines.push('');
        }
      }

      // Finally enable VLAN filtering on the bridge
      lines.push('# ── Ativação do VLAN Filtering na Bridge ──');
      lines.push('/interface bridge set [find name=' + bridgeName + '] vlan-filtering=yes');
      lines.push('');
    }

    return lines.join('\n');
  }
};
