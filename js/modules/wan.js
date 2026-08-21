/* ============================================================
   MKConfigure — Módulo: WAN (Multi-Link)
   Suporte a failover e load balancing (PCC / ECMP)
   ============================================================ */

window.MKConfigure = window.MKConfigure || {};
window.MKConfigure.modules = window.MKConfigure.modules || {};

window.MKConfigure.modules.wan = {
  id: 'wan',
  title: 'Endereçamento WAN',
  description: 'Tipo de conexão, multi-link com failover ou load balancing',
  icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',

  renderForm: function(state) {
    var s = state.wan || {};
    var wanPorts = (state.interfaces || {}).wanPorts || ['ether1'];
    var links = s.links || [{ iface: wanPorts[0], type: 'dhcp', pppoeUser: '', pppoePass: '', pppoeService: '', staticIp: '', staticGw: '', staticMask: '24' }];
    var multiWan = s.multiWan || 'single';
    var strategy = s.strategy || 'failover';

    // Multi-WAN selector
    var html = '' +
      '<div class="form-card">' +
        '<div class="form-card-title">Quantidade de Links WAN</div>' +
        '<div class="radio-group" id="wan-count-group">' +
          this._radioOption('wan-count', 'single', '1 Link', 'Link único', multiWan === 'single') +
          this._radioOption('wan-count', 'dual', '2 Links', 'Failover ou LB', multiWan === 'dual') +
          this._radioOption('wan-count', 'triple', '3 Links', 'Failover ou LB', multiWan === 'triple') +
          this._radioOption('wan-count', 'quad', '4 Links', 'Failover ou LB', multiWan === 'quad') +
        '</div>' +
      '</div>';

    // Strategy (only if multi-wan)
    var linkCount = this._getLinkCount(multiWan);
    if (linkCount > 1) {
      html +=
        '<div class="form-card mt-4">' +
          '<div class="form-card-title">Estratégia Multi-WAN</div>' +
          '<div class="radio-group" id="wan-strategy-group">' +
            this._radioOption('wan-strategy', 'failover', 'Failover', 'Link backup com prioridade', strategy === 'failover') +
            this._radioOption('wan-strategy', 'ecmp', 'ECMP', 'Balanceamento simples', strategy === 'ecmp') +
            this._radioOption('wan-strategy', 'pcc', 'PCC', 'Per Connection Classifier', strategy === 'pcc') +
          '</div>' +
        '</div>';
    }

    // Link cards
    for (var i = 0; i < linkCount; i++) {
      var link = links[i] || { iface: wanPorts[i] || wanPorts[0], type: 'dhcp', pppoeUser: '', pppoePass: '', pppoeService: '', staticIp: '', staticGw: '', staticMask: '24' };
      html += this._renderLinkCard(i, link, wanPorts, linkCount);
    }

    return html;
  },

  _renderLinkCard: function(index, link, wanPorts, totalLinks) {
    var prefix = 'wan-link-' + index;
    var labels = ['Primário', 'Secundário', 'Terciário', 'Quaternário'];

    // Interface select
    var ifOptions = '';
    for (var i = 0; i < wanPorts.length; i++) {
      ifOptions += '<option value="' + wanPorts[i] + '"' + (link.iface === wanPorts[i] ? ' selected' : '') + '>' + wanPorts[i] + '</option>';
    }
    // Also allow typing a custom interface for PPPoE
    ifOptions += '<option value="custom"' + (wanPorts.indexOf(link.iface) === -1 ? ' selected' : '') + '>Outra...</option>';

    var typeOptions =
      '<option value="dhcp"' + (link.type === 'dhcp' ? ' selected' : '') + '>DHCP Client</option>' +
      '<option value="pppoe"' + (link.type === 'pppoe' ? ' selected' : '') + '>PPPoE</option>' +
      '<option value="static"' + (link.type === 'static' ? ' selected' : '') + '>IP Estático</option>';

    var pppoeSection = link.type === 'pppoe' ?
      '<div class="form-grid mt-3 wan-pppoe-fields">' +
        '<div class="form-group">' +
          '<label class="form-label">Usuário PPPoE</label>' +
          '<input type="text" class="form-input" id="' + prefix + '-pppoe-user" value="' + (link.pppoeUser || '') + '" placeholder="usuario@provedor">' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">Senha PPPoE</label>' +
          '<input type="password" class="form-input" id="' + prefix + '-pppoe-pass" value="' + (link.pppoePass || '') + '" placeholder="Senha">' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">Service Name <span class="hint">(opcional)</span></label>' +
          '<input type="text" class="form-input" id="' + prefix + '-pppoe-service" value="' + (link.pppoeService || '') + '" placeholder="Deixe vazio para auto">' +
        '</div>' +
      '</div>' : '';

    var staticSection = link.type === 'static' ?
      '<div class="form-grid mt-3 wan-static-fields">' +
        '<div class="form-group">' +
          '<label class="form-label">Endereço IP</label>' +
          '<input type="text" class="form-input" id="' + prefix + '-static-ip" value="' + (link.staticIp || '') + '" placeholder="Ex: 200.100.50.10">' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">Máscara (CIDR)</label>' +
          '<input type="text" class="form-input" id="' + prefix + '-static-mask" value="' + (link.staticMask || '24') + '" placeholder="24">' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">Gateway</label>' +
          '<input type="text" class="form-input" id="' + prefix + '-static-gw" value="' + (link.staticGw || '') + '" placeholder="Ex: 200.100.50.1">' +
        '</div>' +
      '</div>' : '';

    return '' +
      '<div class="form-card mt-4 wan-link-card">' +
        '<div class="wan-link-header">' +
          '<div class="form-card-title">Link ' + (index + 1) + (totalLinks > 1 ? ' — ' + labels[index] : '') + '</div>' +
          (totalLinks > 1 ? '<span class="wan-link-badge">Distância: ' + (index + 1) + '</span>' : '') +
        '</div>' +
        '<div class="form-grid">' +
          '<div class="form-group">' +
            '<label class="form-label">Interface</label>' +
            '<select class="form-select wan-link-iface" id="' + prefix + '-iface">' + ifOptions + '</select>' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">Tipo de Conexão</label>' +
            '<select class="form-select wan-link-type" id="' + prefix + '-type">' + typeOptions + '</select>' +
          '</div>' +
        '</div>' +
        pppoeSection +
        staticSection +
      '</div>';
  },

  bindEvents: function() {
    var self = this;

    // Multi-WAN radio
    document.querySelectorAll('input[name="wan-count"]').forEach(function(radio) {
      radio.addEventListener('change', function() {
        self.readForm();
        window.MKConfigure.app.renderCurrentModule();
      });
    });

    // Strategy radio
    document.querySelectorAll('input[name="wan-strategy"]').forEach(function(radio) {
      radio.addEventListener('change', function() {
        self.readForm();
      });
    });

    // Link type change
    document.querySelectorAll('.wan-link-type').forEach(function(sel) {
      sel.addEventListener('change', function() {
        self.readForm();
        window.MKConfigure.app.renderCurrentModule();
      });
    });
  },

  readForm: function() {
    var multiWan = 'single';
    document.querySelectorAll('input[name="wan-count"]').forEach(function(r) {
      if (r.checked) multiWan = r.value;
    });

    var strategy = 'failover';
    document.querySelectorAll('input[name="wan-strategy"]').forEach(function(r) {
      if (r.checked) strategy = r.value;
    });

    var linkCount = this._getLinkCount(multiWan);
    var links = [];
    for (var i = 0; i < linkCount; i++) {
      var prefix = 'wan-link-' + i;
      links.push({
        iface: (document.getElementById(prefix + '-iface') || {}).value || 'ether1',
        type: (document.getElementById(prefix + '-type') || {}).value || 'dhcp',
        pppoeUser: (document.getElementById(prefix + '-pppoe-user') || {}).value || '',
        pppoePass: (document.getElementById(prefix + '-pppoe-pass') || {}).value || '',
        pppoeService: (document.getElementById(prefix + '-pppoe-service') || {}).value || '',
        staticIp: (document.getElementById(prefix + '-static-ip') || {}).value || '',
        staticGw: (document.getElementById(prefix + '-static-gw') || {}).value || '',
        staticMask: (document.getElementById(prefix + '-static-mask') || {}).value || '24'
      });
    }

    var state = { multiWan: multiWan, strategy: strategy, links: links };
    window.MKConfigure.state.wan = state;
    return state;
  },

  generateScript: function(state) {
    var s = state.wan || {};
    var links = s.links || [];
    var strategy = s.strategy || 'failover';
    var lines = [];

    lines.push('#');
    lines.push('# ── WAN — Endereçamento ──────────────────────────');
    lines.push('#');

    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var iface = link.iface || 'ether1';
      var pppoeIface = 'pppoe-link' + (i + 1);

      if (link.type === 'dhcp') {
        lines.push('/ip dhcp-client add interface=' + iface + ' disabled=no add-default-route=' + (links.length > 1 ? 'no' : 'yes') + ' comment="WAN' + (i + 1) + ' DHCP"');
      } else if (link.type === 'pppoe') {
        lines.push('/interface pppoe-client add name=' + pppoeIface + ' interface=' + iface +
          ' user="' + (link.pppoeUser || '') + '" password="' + (link.pppoePass || '') + '"' +
          (link.pppoeService ? ' service-name="' + link.pppoeService + '"' : '') +
          ' disabled=no add-default-route=' + (links.length > 1 ? 'no' : 'yes') +
          ' use-peer-dns=yes comment="WAN' + (i + 1) + ' PPPoE"');
      } else if (link.type === 'static') {
        lines.push('/ip address add address=' + (link.staticIp || '0.0.0.0') + '/' + (link.staticMask || '24') + ' interface=' + iface + ' comment="WAN' + (i + 1) + ' Static"');
        if (links.length <= 1) {
          lines.push('/ip route add dst-address=0.0.0.0/0 gateway=' + (link.staticGw || '0.0.0.0') + ' comment="Default Gateway"');
        }
      }
    }
    lines.push('');

    // Multi-WAN routing
    if (links.length > 1) {
      lines.push('# ── Multi-WAN: ' + strategy.toUpperCase() + ' ──');

      if (strategy === 'failover') {
        lines.push('/ip route');
        for (var f = 0; f < links.length; f++) {
          var gw = this._getGateway(links[f], f);
          lines.push('add dst-address=0.0.0.0/0 gateway=' + gw + ' distance=' + (f + 1) + ' check-gateway=ping comment="WAN' + (f + 1) + ' - distance ' + (f + 1) + '"');
        }
      } else if (strategy === 'ecmp') {
        var gateways = [];
        for (var e = 0; e < links.length; e++) {
          gateways.push(this._getGateway(links[e], e));
        }
        lines.push('/ip route add dst-address=0.0.0.0/0 gateway=' + gateways.join(',') + ' check-gateway=ping comment="ECMP Load Balance"');
      } else if (strategy === 'pcc') {
        lines.push('');
        lines.push('/ip firewall mangle');
        // Mark connections
        for (var p = 0; p < links.length; p++) {
          var bridgeName = (state.bridge || {}).bridgeName || 'bridge';
          lines.push('add chain=prerouting dst-address-type=!local in-interface=' + bridgeName +
            ' per-connection-classifier=both-addresses:' + links.length + '/' + p +
            ' action=mark-connection new-connection-mark=ISP' + (p + 1) + '_conn passthrough=yes comment="PCC mark ISP' + (p + 1) + '"');
        }
        lines.push('');
        // Mark routing
        for (var r = 0; r < links.length; r++) {
          lines.push('add chain=prerouting connection-mark=ISP' + (r + 1) + '_conn action=mark-routing new-routing-mark=to_ISP' + (r + 1) + ' passthrough=no');
        }
        lines.push('');
        // Routes with routing marks
        lines.push('/ip route');
        for (var t = 0; t < links.length; t++) {
          var gwPcc = this._getGateway(links[t], t);
          lines.push('add dst-address=0.0.0.0/0 gateway=' + gwPcc + ' routing-mark=to_ISP' + (t + 1) + ' check-gateway=ping comment="PCC route ISP' + (t + 1) + '"');
        }
        // Fallback routes
        for (var fb = 0; fb < links.length; fb++) {
          var gwFb = this._getGateway(links[fb], fb);
          lines.push('add dst-address=0.0.0.0/0 gateway=' + gwFb + ' distance=' + (fb + 1) + ' check-gateway=ping comment="Fallback ISP' + (fb + 1) + '"');
        }
      }
      lines.push('');
    }

    return lines.join('\n');
  },

  _getGateway: function(link, index) {
    if (link.type === 'pppoe') return 'pppoe-link' + (index + 1);
    if (link.type === 'static') return link.staticGw || '0.0.0.0';
    return link.iface; // DHCP uses interface as gateway reference
  },

  _getLinkCount: function(multiWan) {
    var counts = { single: 1, dual: 2, triple: 3, quad: 4 };
    return counts[multiWan] || 1;
  },

  _radioOption: function(name, value, title, desc, checked) {
    return '' +
      '<div class="radio-option">' +
        '<input type="radio" name="' + name + '" id="' + name + '-' + value + '" value="' + value + '"' + (checked ? ' checked' : '') + '>' +
        '<label class="radio-label" for="' + name + '-' + value + '">' +
          '<span class="radio-title">' + title + '</span>' +
          '<span class="radio-desc">' + desc + '</span>' +
        '</label>' +
      '</div>';
  }
};
