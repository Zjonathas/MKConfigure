/* ============================================================
   MKConfigure — Módulo: LAN & DHCP
   ============================================================ */

window.MKConfigure = window.MKConfigure || {};
window.MKConfigure.modules = window.MKConfigure.modules || {};

window.MKConfigure.modules.lan = {
  id: 'lan',
  title: 'LAN & DHCP',
  description: 'Endereço IP da bridge, DHCP Server, pool e lease time',
  icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',

  renderForm: function(state) {
    var s = state.lan || {};
    var bridgeName = (state.bridge || {}).bridgeName || 'bridge';
    var ip = s.ip || '192.168.88.1';
    var mask = s.mask || '24';
    var v = window.MKConfigure.validator;
    var range = v.defaultDHCPRange(ip, mask);

    return '' +
      '<div class="form-card">' +
        '<div class="form-card-title">Endereço IP da LAN</div>' +
        '<div class="form-grid">' +
          '<div class="form-group">' +
            '<label class="form-label">Endereço IP <span class="required">*</span></label>' +
            '<input type="text" class="form-input" id="lan-ip" value="' + ip + '" placeholder="192.168.88.1">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">Máscara (CIDR) <span class="required">*</span></label>' +
            '<input type="text" class="form-input" id="lan-mask" value="' + mask + '" placeholder="24">' +
            '<span class="form-help">Máscara: ' + v.prefixToMask(mask) + '</span>' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">Interface</label>' +
            '<input type="text" class="form-input" id="lan-iface" value="' + (s.iface || bridgeName) + '" readonly>' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">Rede</label>' +
            '<input type="text" class="form-input" value="' + v.networkAddress(ip, mask) + '" readonly style="opacity:0.6">' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="form-card mt-4">' +
        '<div class="form-card-title">DHCP Server</div>' +
        '<div class="toggle-row">' +
          '<div class="toggle-label">' +
            '<span>Habilitar DHCP Server</span>' +
            '<span class="toggle-desc">Distribui IPs automaticamente para dispositivos na LAN</span>' +
          '</div>' +
          '<label class="toggle-switch">' +
            '<input type="checkbox" id="lan-dhcp-enabled" ' + (s.dhcpEnabled !== false ? 'checked' : '') + '>' +
            '<span class="toggle-slider"></span>' +
          '</label>' +
        '</div>' +
        '<div id="lan-dhcp-section" style="' + (s.dhcpEnabled === false ? 'display:none' : '') + '">' +
          '<div class="form-grid mt-3">' +
            '<div class="form-group">' +
              '<label class="form-label">Pool Name</label>' +
              '<input type="text" class="form-input" id="lan-pool-name" value="' + (s.poolName || 'dhcp-pool') + '">' +
            '</div>' +
            '<div class="form-group">' +
              '<label class="form-label">Range Início</label>' +
              '<input type="text" class="form-input" id="lan-pool-start" value="' + (s.poolStart || range.start) + '" placeholder="' + range.start + '">' +
            '</div>' +
            '<div class="form-group">' +
              '<label class="form-label">Range Fim</label>' +
              '<input type="text" class="form-input" id="lan-pool-end" value="' + (s.poolEnd || range.end) + '" placeholder="' + range.end + '">' +
            '</div>' +
            '<div class="form-group">' +
              '<label class="form-label">Lease Time</label>' +
              '<select class="form-select" id="lan-lease-time">' +
                '<option value="00:30:00"' + (s.leaseTime === '00:30:00' ? ' selected' : '') + '>30 minutos</option>' +
                '<option value="01:00:00"' + (s.leaseTime === '01:00:00' ? ' selected' : '') + '>1 hora</option>' +
                '<option value="08:00:00"' + (s.leaseTime === '08:00:00' ? ' selected' : '') + '>8 horas</option>' +
                '<option value="1d 00:00:00"' + ((s.leaseTime || '1d 00:00:00') === '1d 00:00:00' ? ' selected' : '') + '>1 dia</option>' +
                '<option value="3d 00:00:00"' + (s.leaseTime === '3d 00:00:00' ? ' selected' : '') + '>3 dias</option>' +
                '<option value="7d 00:00:00"' + (s.leaseTime === '7d 00:00:00' ? ' selected' : '') + '>7 dias</option>' +
              '</select>' +
            '</div>' +
            '<div class="form-group">' +
              '<label class="form-label">Gateway (DHCP Option)</label>' +
              '<input type="text" class="form-input" id="lan-dhcp-gw" value="' + (s.dhcpGw || ip) + '" placeholder="' + ip + '">' +
            '</div>' +
            '<div class="form-group">' +
              '<label class="form-label">DNS (DHCP Option)</label>' +
              '<input type="text" class="form-input" id="lan-dhcp-dns" value="' + (s.dhcpDns || ip) + '" placeholder="' + ip + '">' +
              '<span class="form-help">Separar múltiplos com vírgula</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  },

  bindEvents: function() {
    var self = this;
    var dhcpCheck = document.getElementById('lan-dhcp-enabled');
    var dhcpSection = document.getElementById('lan-dhcp-section');
    if (dhcpCheck && dhcpSection) {
      dhcpCheck.addEventListener('change', function() {
        dhcpSection.style.display = this.checked ? '' : 'none';
        self.readForm();
      });
    }

    // Auto-update range when IP/mask changes
    var ipInput = document.getElementById('lan-ip');
    var maskInput = document.getElementById('lan-mask');
    if (ipInput) {
      ipInput.addEventListener('input', function() { self._autoUpdateRange(); self.readForm(); });
    }
    if (maskInput) {
      maskInput.addEventListener('input', function() { self._autoUpdateRange(); self.readForm(); });
    }
  },

  _autoUpdateRange: function() {
    var ip = (document.getElementById('lan-ip') || {}).value || '';
    var mask = (document.getElementById('lan-mask') || {}).value || '24';
    var v = window.MKConfigure.validator;
    if (v.isValidIPv4(ip)) {
      var range = v.defaultDHCPRange(ip, mask);
      var startEl = document.getElementById('lan-pool-start');
      var endEl = document.getElementById('lan-pool-end');
      if (startEl && !startEl._userModified) startEl.value = range.start;
      if (endEl && !endEl._userModified) endEl.value = range.end;
      var gwEl = document.getElementById('lan-dhcp-gw');
      var dnsEl = document.getElementById('lan-dhcp-dns');
      if (gwEl && !gwEl._userModified) gwEl.value = ip;
      if (dnsEl && !dnsEl._userModified) dnsEl.value = ip;
    }
  },

  readForm: function() {
    var state = {
      ip: (document.getElementById('lan-ip') || {}).value || '192.168.88.1',
      mask: (document.getElementById('lan-mask') || {}).value || '24',
      iface: (document.getElementById('lan-iface') || {}).value || 'bridge',
      dhcpEnabled: (document.getElementById('lan-dhcp-enabled') || {}).checked !== false,
      poolName: (document.getElementById('lan-pool-name') || {}).value || 'dhcp-pool',
      poolStart: (document.getElementById('lan-pool-start') || {}).value || '',
      poolEnd: (document.getElementById('lan-pool-end') || {}).value || '',
      leaseTime: (document.getElementById('lan-lease-time') || {}).value || '1d 00:00:00',
      dhcpGw: (document.getElementById('lan-dhcp-gw') || {}).value || '',
      dhcpDns: (document.getElementById('lan-dhcp-dns') || {}).value || ''
    };
    window.MKConfigure.state.lan = state;
    return state;
  },

  generateScript: function(state) {
    var s = state.lan || {};
    var bridgeName = (state.bridge || {}).bridgeName || 'bridge';
    var ip = s.ip || '192.168.88.1';
    var mask = s.mask || '24';
    var v = window.MKConfigure.validator;
    var network = v.networkAddress(ip, mask);

    var lines = [];
    lines.push('#');
    lines.push('# ── LAN & DHCP ───────────────────────────────────');
    lines.push('#');

    // IP Address
    lines.push('/ip address add address=' + ip + '/' + mask + ' interface=' + (s.iface || bridgeName) + ' comment="LAN IP"');
    lines.push('');

    // DHCP
    if (s.dhcpEnabled !== false) {
      var range = v.defaultDHCPRange(ip, mask);
      var poolStart = s.poolStart || range.start;
      var poolEnd = s.poolEnd || range.end;
      var poolName = s.poolName || 'dhcp-pool';

      lines.push('/ip pool add name=' + poolName + ' ranges=' + poolStart + '-' + poolEnd);
      lines.push('');

      lines.push('/ip dhcp-server');
      lines.push('add name=dhcp-lan interface=' + (s.iface || bridgeName) + ' address-pool=' + poolName + ' lease-time=' + (s.leaseTime || '1d 00:00:00') + ' disabled=no');
      lines.push('');

      lines.push('/ip dhcp-server network');
      lines.push('add address=' + network + '/' + mask +
        ' gateway=' + (s.dhcpGw || ip) +
        ' dns-server=' + (s.dhcpDns || ip) +
        ' comment="LAN DHCP Network"');
      lines.push('');
    }

    return lines.join('\n');
  }
};
