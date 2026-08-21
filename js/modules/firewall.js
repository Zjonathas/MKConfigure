/* ============================================================
   MKConfigure — Módulo: Firewall IPv4
   ============================================================ */

window.MKConfigure = window.MKConfigure || {};
window.MKConfigure.modules = window.MKConfigure.modules || {};

window.MKConfigure.modules.firewall = {
  id: 'firewall',
  title: 'Firewall IPv4',
  description: 'Filter Input/Forward, FastTrack, RAW e proteção brute-force',
  icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',

  renderForm: function(state) {
    var s = state.firewall || {};

    return '' +
      '<div class="form-card">' +
        '<div class="form-card-title">Regras de Filtro</div>' +
        '<p class="text-xs text-muted mb-3">Firewall stateful com best practices MikroTik. Marque as regras desejadas.</p>' +

        '<div class="sidebar-section-label mt-2 mb-2">Chain: Input (tráfego para o roteador)</div>' +
        this._checkbox('fw-input-established', 'Accept established, related, untracked', s.inputEstablished !== false) +
        this._checkbox('fw-input-drop-invalid', 'Drop invalid', s.inputDropInvalid !== false) +
        this._checkbox('fw-input-icmp', 'Accept ICMP (ping)', s.inputIcmp !== false) +
        this._checkbox('fw-input-loopback', 'Accept loopback (127.0.0.1)', s.inputLoopback !== false) +
        this._checkbox('fw-input-drop-wan', 'Drop all not from LAN', s.inputDropWan !== false) +

        '<div class="divider"></div>' +

        '<div class="sidebar-section-label mt-2 mb-2">Chain: Forward (tráfego através do roteador)</div>' +
        this._checkbox('fw-fwd-fasttrack', 'FastTrack (established, related)', s.fwdFasttrack !== false) +
        this._checkbox('fw-fwd-established', 'Accept established, related, untracked', s.fwdEstablished !== false) +
        this._checkbox('fw-fwd-drop-invalid', 'Drop invalid', s.fwdDropInvalid !== false) +
        this._checkbox('fw-fwd-drop-wan', 'Drop new from WAN (not DSTNATed)', s.fwdDropWan !== false) +
        this._checkbox('fw-fwd-ipsec-in', 'Accept IPsec in', s.fwdIpsecIn !== false) +
        this._checkbox('fw-fwd-ipsec-out', 'Accept IPsec out', s.fwdIpsecOut !== false) +
      '</div>' +

      '<div class="form-card mt-4">' +
        '<div class="form-card-title">Proteções Extras</div>' +

        '<div class="toggle-row">' +
          '<div class="toggle-label">' +
            '<span>Proteção contra Brute-Force SSH/Winbox</span>' +
            '<span class="toggle-desc">Bloqueia IPs com muitas tentativas de conexão</span>' +
          '</div>' +
          '<label class="toggle-switch">' +
            '<input type="checkbox" id="fw-brute-force" ' + (s.bruteForce ? 'checked' : '') + '>' +
            '<span class="toggle-slider"></span>' +
          '</label>' +
        '</div>' +

        '<div class="toggle-row">' +
          '<div class="toggle-label">' +
            '<span>RAW Rules (drop early)</span>' +
            '<span class="toggle-desc">Descarta pacotes antes do connection tracking (menor uso de CPU)</span>' +
          '</div>' +
          '<label class="toggle-switch">' +
            '<input type="checkbox" id="fw-raw-rules" ' + (s.rawRules ? 'checked' : '') + '>' +
            '<span class="toggle-slider"></span>' +
          '</label>' +
        '</div>' +

        '<div class="toggle-row">' +
          '<div class="toggle-label">' +
            '<span>Bloquear Bogons (IPs privados na WAN)</span>' +
            '<span class="toggle-desc">Descarta pacotes com IPs reservados (RFC 1918) entrando pela WAN</span>' +
          '</div>' +
          '<label class="toggle-switch">' +
            '<input type="checkbox" id="fw-bogon" ' + (s.blockBogons ? 'checked' : '') + '>' +
            '<span class="toggle-slider"></span>' +
          '</label>' +
        '</div>' +

        '<div class="toggle-row">' +
          '<div class="toggle-label">' +
            '<span>Limitar ICMP (anti-flood)</span>' +
            '<span class="toggle-desc">Limita ping a 50 pacotes/segundo</span>' +
          '</div>' +
          '<label class="toggle-switch">' +
            '<input type="checkbox" id="fw-icmp-limit" ' + (s.icmpLimit ? 'checked' : '') + '>' +
            '<span class="toggle-slider"></span>' +
          '</label>' +
        '</div>' +
      '</div>';
  },

  bindEvents: function() {
    // No special event binding needed — toggles read on generate
  },

  readForm: function() {
    var state = {
      inputEstablished: this._isChecked('fw-input-established'),
      inputDropInvalid: this._isChecked('fw-input-drop-invalid'),
      inputIcmp: this._isChecked('fw-input-icmp'),
      inputLoopback: this._isChecked('fw-input-loopback'),
      inputDropWan: this._isChecked('fw-input-drop-wan'),
      fwdFasttrack: this._isChecked('fw-fwd-fasttrack'),
      fwdEstablished: this._isChecked('fw-fwd-established'),
      fwdDropInvalid: this._isChecked('fw-fwd-drop-invalid'),
      fwdDropWan: this._isChecked('fw-fwd-drop-wan'),
      fwdIpsecIn: this._isChecked('fw-fwd-ipsec-in'),
      fwdIpsecOut: this._isChecked('fw-fwd-ipsec-out'),
      bruteForce: this._isChecked('fw-brute-force'),
      rawRules: this._isChecked('fw-raw-rules'),
      blockBogons: this._isChecked('fw-bogon'),
      icmpLimit: this._isChecked('fw-icmp-limit')
    };
    window.MKConfigure.state.firewall = state;
    return state;
  },

  generateScript: function(state) {
    var s = state.firewall || {};
    var lines = [];

    lines.push('#');
    lines.push('# ── Firewall IPv4 ────────────────────────────────');
    lines.push('#');

    // RAW Rules
    if (s.rawRules) {
      lines.push('/ip firewall raw');
      lines.push('add chain=prerouting action=accept connection-state=established,related,untracked comment="raw: accept established"');
      lines.push('add chain=prerouting action=drop connection-state=invalid comment="raw: drop invalid"');
      lines.push('');
    }

    lines.push('/ip firewall filter');
    lines.push('');

    // Input chain
    lines.push('# ── Input Chain ──');
    if (s.inputEstablished !== false) {
      lines.push('add chain=input action=accept connection-state=established,related,untracked comment="accept established,related,untracked"');
    }
    if (s.inputDropInvalid !== false) {
      lines.push('add chain=input action=drop connection-state=invalid comment="drop invalid"');
    }
    if (s.icmpLimit) {
      lines.push('add chain=input action=accept protocol=icmp limit=50,5:packet comment="accept ICMP limited"');
      lines.push('add chain=input action=drop protocol=icmp comment="drop excess ICMP"');
    } else if (s.inputIcmp !== false) {
      lines.push('add chain=input action=accept protocol=icmp comment="accept ICMP"');
    }
    if (s.inputLoopback !== false) {
      lines.push('add chain=input action=accept dst-address=127.0.0.1 comment="accept loopback"');
    }

    // Brute-force protection
    if (s.bruteForce) {
      lines.push('');
      lines.push('# ── Brute-Force Protection ──');
      lines.push('add chain=input action=drop src-address-list=bruteforce_blacklist comment="drop brute-force blacklisted"');
      lines.push('add chain=input action=add-src-to-address-list protocol=tcp dst-port=22,8291 connection-state=new address-list=bruteforce_stage1 address-list-timeout=1m comment="brute-force stage1"');
      lines.push('add chain=input action=add-src-to-address-list protocol=tcp dst-port=22,8291 connection-state=new src-address-list=bruteforce_stage1 address-list=bruteforce_stage2 address-list-timeout=1m comment="brute-force stage2"');
      lines.push('add chain=input action=add-src-to-address-list protocol=tcp dst-port=22,8291 connection-state=new src-address-list=bruteforce_stage2 address-list=bruteforce_blacklist address-list-timeout=1d comment="brute-force blacklist"');
    }

    if (s.inputDropWan !== false) {
      lines.push('add chain=input action=drop in-interface-list=!LAN comment="drop all not from LAN"');
    }

    lines.push('');

    // Forward chain
    lines.push('# ── Forward Chain ──');
    if (s.fwdIpsecIn !== false) {
      lines.push('add chain=forward action=accept ipsec-policy=in,ipsec comment="accept in ipsec"');
    }
    if (s.fwdIpsecOut !== false) {
      lines.push('add chain=forward action=accept ipsec-policy=out,ipsec comment="accept out ipsec"');
    }
    if (s.fwdFasttrack !== false) {
      lines.push('add chain=forward action=fasttrack-connection connection-state=established,related hw-offload=yes comment="fasttrack"');
    }
    if (s.fwdEstablished !== false) {
      lines.push('add chain=forward action=accept connection-state=established,related,untracked comment="accept established,related,untracked"');
    }
    if (s.fwdDropInvalid !== false) {
      lines.push('add chain=forward action=drop connection-state=invalid comment="drop invalid"');
    }
    if (s.fwdDropWan !== false) {
      lines.push('add chain=forward action=drop connection-state=new connection-nat-state=!dstnat in-interface-list=WAN comment="drop from WAN not DSTNATed"');
    }
    lines.push('');

    // Bogon blocking
    if (s.blockBogons) {
      lines.push('# ── Bogon Blocking ──');
      lines.push('/ip firewall address-list');
      lines.push('add address=0.0.0.0/8 list=bogons comment="RFC 1122"');
      lines.push('add address=10.0.0.0/8 list=bogons comment="RFC 1918"');
      lines.push('add address=100.64.0.0/10 list=bogons comment="RFC 6598 (CGNAT)"');
      lines.push('add address=127.0.0.0/8 list=bogons comment="Loopback"');
      lines.push('add address=169.254.0.0/16 list=bogons comment="Link-local"');
      lines.push('add address=172.16.0.0/12 list=bogons comment="RFC 1918"');
      lines.push('add address=192.0.0.0/24 list=bogons comment="RFC 6890"');
      lines.push('add address=192.0.2.0/24 list=bogons comment="TEST-NET-1"');
      lines.push('add address=192.168.0.0/16 list=bogons comment="RFC 1918"');
      lines.push('add address=198.18.0.0/15 list=bogons comment="Benchmark"');
      lines.push('add address=198.51.100.0/24 list=bogons comment="TEST-NET-2"');
      lines.push('add address=203.0.113.0/24 list=bogons comment="TEST-NET-3"');
      lines.push('add address=224.0.0.0/4 list=bogons comment="Multicast"');
      lines.push('add address=240.0.0.0/4 list=bogons comment="Reserved"');
      lines.push('');
      lines.push('/ip firewall filter');
      lines.push('add chain=forward action=drop src-address-list=bogons in-interface-list=WAN comment="drop bogons from WAN"');
      lines.push('');
    }

    return lines.join('\n');
  },

  _checkbox: function(id, label, checked) {
    return '' +
      '<label class="checkbox-row">' +
        '<input type="checkbox" id="' + id + '"' + (checked ? ' checked' : '') + '>' +
        '<label for="' + id + '">' + label + '</label>' +
      '</label>';
  },

  _isChecked: function(id) {
    var el = document.getElementById(id);
    return el ? el.checked : false;
  }
};
