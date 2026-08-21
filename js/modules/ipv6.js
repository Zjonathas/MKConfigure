/* ============================================================
   MKConfigure — Módulo: IPv6
   ============================================================ */

window.MKConfigure = window.MKConfigure || {};
window.MKConfigure.modules = window.MKConfigure.modules || {};

window.MKConfigure.modules.ipv6 = {
  id: 'ipv6',
  title: 'IPv6',
  description: 'DHCPv6 Client, Prefix Delegation, SLAAC, ND e Firewall IPv6',
  icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',

  renderForm: function(state) {
    var s = state.ipv6 || {};
    var wanIface = ((state.interfaces || {}).wanPorts || ['ether1'])[0];
    var bridgeName = (state.bridge || {}).bridgeName || 'bridge';

    return '' +
      '<div class="form-card">' +
        '<div class="form-card-title">Configuração IPv6</div>' +
        '<div class="toggle-row">' +
          '<div class="toggle-label">' +
            '<span>Habilitar IPv6</span>' +
            '<span class="toggle-desc">Configura DHCPv6 Client para Prefix Delegation e SLAAC na LAN</span>' +
          '</div>' +
          '<label class="toggle-switch">' +
            '<input type="checkbox" id="ipv6-enabled" ' + (s.enabled ? 'checked' : '') + '>' +
            '<span class="toggle-slider"></span>' +
          '</label>' +
        '</div>' +
      '</div>' +

      '<div id="ipv6-config-section" style="' + (s.enabled ? '' : 'display:none') + '">' +

        '<div class="form-card mt-4">' +
          '<div class="form-card-title">DHCPv6 Client (WAN)</div>' +
          '<p class="text-xs text-muted mb-3">Solicita Prefix Delegation do seu provedor</p>' +
          '<div class="form-grid">' +
            '<div class="form-group">' +
              '<label class="form-label">Interface WAN</label>' +
              '<input type="text" class="form-input" id="ipv6-wan-iface" value="' + (s.wanIface || wanIface) + '">' +
              '<span class="form-help">Para PPPoE, use o nome da interface PPPoE (ex: pppoe-link1)</span>' +
            '</div>' +
            '<div class="form-group">' +
              '<label class="form-label">Pool Name</label>' +
              '<input type="text" class="form-input" id="ipv6-pool-name" value="' + (s.poolName || 'ipv6-pool') + '">' +
            '</div>' +
            '<div class="form-group">' +
              '<label class="form-label">Pool Prefix Length</label>' +
              '<select class="form-select" id="ipv6-pool-prefix">' +
                '<option value="48"' + (s.poolPrefix === '48' ? ' selected' : '') + '>/48</option>' +
                '<option value="56"' + (s.poolPrefix === '56' ? ' selected' : '') + '>/56</option>' +
                '<option value="60"' + (s.poolPrefix === '60' ? ' selected' : '') + '>/60</option>' +
                '<option value="64"' + ((s.poolPrefix || '64') === '64' ? ' selected' : '') + '>/64</option>' +
              '</select>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="form-card mt-4">' +
          '<div class="form-card-title">Endereço IPv6 na LAN</div>' +
          '<div class="form-grid">' +
            '<div class="form-group">' +
              '<label class="form-label">Interface LAN</label>' +
              '<input type="text" class="form-input" id="ipv6-lan-iface" value="' + (s.lanIface || bridgeName) + '">' +
            '</div>' +
          '</div>' +
          '<div class="toggle-row mt-3">' +
            '<div class="toggle-label">' +
              '<span>Advertise (SLAAC)</span>' +
              '<span class="toggle-desc">Permite que dispositivos auto-configurem endereço IPv6</span>' +
            '</div>' +
            '<label class="toggle-switch">' +
              '<input type="checkbox" id="ipv6-advertise" ' + (s.advertise !== false ? 'checked' : '') + '>' +
              '<span class="toggle-slider"></span>' +
            '</label>' +
          '</div>' +
        '</div>' +

        '<div class="form-card mt-4">' +
          '<div class="form-card-title">Neighbor Discovery</div>' +
          '<div class="toggle-row">' +
            '<div class="toggle-label">' +
              '<span>Advertise DNS (via RA)</span>' +
              '<span class="toggle-desc">Envia DNS via Router Advertisement para clientes</span>' +
            '</div>' +
            '<label class="toggle-switch">' +
              '<input type="checkbox" id="ipv6-nd-dns" ' + (s.ndDns !== false ? 'checked' : '') + '>' +
              '<span class="toggle-slider"></span>' +
            '</label>' +
          '</div>' +
        '</div>' +

        '<div class="form-card mt-4">' +
          '<div class="form-card-title">Firewall IPv6</div>' +
          '<div class="toggle-row">' +
            '<div class="toggle-label">' +
              '<span>Habilitar Firewall IPv6</span>' +
              '<span class="toggle-desc">Regras de segurança equivalentes ao IPv4</span>' +
            '</div>' +
            '<label class="toggle-switch">' +
              '<input type="checkbox" id="ipv6-firewall" ' + (s.firewall !== false ? 'checked' : '') + '>' +
              '<span class="toggle-slider"></span>' +
            '</label>' +
          '</div>' +
        '</div>' +

      '</div>';
  },

  bindEvents: function() {
    var self = this;
    var enabledCheck = document.getElementById('ipv6-enabled');
    var configSection = document.getElementById('ipv6-config-section');
    if (enabledCheck && configSection) {
      enabledCheck.addEventListener('change', function() {
        configSection.style.display = this.checked ? '' : 'none';
        self.readForm();
      });
    }
  },

  readForm: function() {
    var state = {
      enabled: (document.getElementById('ipv6-enabled') || {}).checked === true,
      wanIface: (document.getElementById('ipv6-wan-iface') || {}).value || 'ether1',
      poolName: (document.getElementById('ipv6-pool-name') || {}).value || 'ipv6-pool',
      poolPrefix: (document.getElementById('ipv6-pool-prefix') || {}).value || '64',
      lanIface: (document.getElementById('ipv6-lan-iface') || {}).value || 'bridge',
      advertise: (document.getElementById('ipv6-advertise') || {}).checked !== false,
      ndDns: (document.getElementById('ipv6-nd-dns') || {}).checked !== false,
      firewall: (document.getElementById('ipv6-firewall') || {}).checked !== false
    };
    window.MKConfigure.state.ipv6 = state;
    return state;
  },

  generateScript: function(state) {
    var s = state.ipv6 || {};
    if (!s.enabled) return '';

    var lines = [];
    lines.push('#');
    lines.push('# ── IPv6 ─────────────────────────────────────────');
    lines.push('#');

    // DHCPv6 Client
    lines.push('/ipv6 dhcp-client');
    lines.push('add interface=' + (s.wanIface || 'ether1') +
      ' pool-name=' + (s.poolName || 'ipv6-pool') +
      ' request=prefix pool-prefix-length=' + (s.poolPrefix || '64') +
      ' add-default-route=yes disabled=no comment="DHCPv6 PD Client"');
    lines.push('');

    // IPv6 Address on LAN
    lines.push('/ipv6 address');
    lines.push('add from-pool=' + (s.poolName || 'ipv6-pool') +
      ' interface=' + (s.lanIface || 'bridge') +
      ' advertise=' + (s.advertise !== false ? 'yes' : 'no') +
      ' comment="LAN IPv6 from PD"');
    lines.push('');

    // Neighbor Discovery
    lines.push('/ipv6 nd');
    lines.push('set [find default=yes] advertise-dns=' + (s.ndDns !== false ? 'yes' : 'no'));
    lines.push('');

    // IPv6 Firewall
    if (s.firewall !== false) {
      lines.push('/ipv6 firewall filter');
      lines.push('');
      lines.push('# ── Input Chain (IPv6) ──');
      lines.push('add chain=input action=accept connection-state=established,related,untracked comment="ipv6: accept established"');
      lines.push('add chain=input action=drop connection-state=invalid comment="ipv6: drop invalid"');
      lines.push('add chain=input action=accept protocol=icmpv6 comment="ipv6: accept ICMPv6 (required)"');
      lines.push('add chain=input action=accept dst-address=fe80::/10 comment="ipv6: accept link-local"');
      lines.push('add chain=input action=accept protocol=udp dst-port=546 src-address=fe80::/10 comment="ipv6: accept DHCPv6 replies"');
      lines.push('add chain=input action=drop in-interface-list=!LAN comment="ipv6: drop all not from LAN"');
      lines.push('');
      lines.push('# ── Forward Chain (IPv6) ──');
      lines.push('add chain=forward action=accept connection-state=established,related,untracked comment="ipv6: accept established"');
      lines.push('add chain=forward action=drop connection-state=invalid comment="ipv6: drop invalid"');
      lines.push('add chain=forward action=accept protocol=icmpv6 comment="ipv6: accept ICMPv6 (required for NDP)"');
      lines.push('add chain=forward action=drop in-interface-list=WAN connection-state=new connection-nat-state=!dstnat comment="ipv6: drop new from WAN"');
      lines.push('');
    }

    return lines.join('\n');
  }
};
