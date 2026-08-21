/* ============================================================
   MKConfigure — Módulo: DNS
   ============================================================ */

window.MKConfigure = window.MKConfigure || {};
window.MKConfigure.modules = window.MKConfigure.modules || {};

window.MKConfigure.modules.dns = {
  id: 'dns',
  title: 'DNS',
  description: 'Servidores DNS, cache local e allow-remote-requests',
  icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>',

  renderForm: function(state) {
    var s = state.dns || {};
    var servers = s.servers || [{ ip: '8.8.8.8' }, { ip: '8.8.4.4' }];

    var serverRows = '';
    for (var i = 0; i < servers.length; i++) {
      serverRows +=
        '<div class="dynamic-list-item" data-dns-idx="' + i + '">' +
          '<div class="form-group" style="flex:2">' +
            '<label class="form-label">Servidor DNS ' + (i + 1) + '</label>' +
            '<input type="text" class="form-input dns-server-ip" value="' + (servers[i].ip || '') + '" placeholder="Ex: 8.8.8.8">' +
          '</div>' +
          '<button type="button" class="btn btn-danger btn-icon btn-remove dns-remove" title="Remover">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
        '</div>';
    }

    return '' +
      '<div class="form-card">' +
        '<div class="form-card-title">Servidores DNS</div>' +
        '<p class="text-xs text-muted mb-3">Defina os servidores DNS que o roteador utilizará para resolver nomes</p>' +
        '<div class="dynamic-list" id="dns-server-list">' +
          serverRows +
        '</div>' +
        '<div class="dynamic-list-add mt-3" id="dns-add-server">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
          'Adicionar servidor DNS' +
        '</div>' +
      '</div>' +

      '<div class="form-card mt-4">' +
        '<div class="form-card-title">Configurações de Cache</div>' +
        '<div class="toggle-row">' +
          '<div class="toggle-label">' +
            '<span>Allow Remote Requests</span>' +
            '<span class="toggle-desc">Permite que dispositivos na LAN usem o roteador como DNS</span>' +
          '</div>' +
          '<label class="toggle-switch">' +
            '<input type="checkbox" id="dns-allow-remote" ' + (s.allowRemote !== false ? 'checked' : '') + '>' +
            '<span class="toggle-slider"></span>' +
          '</label>' +
        '</div>' +
        '<div class="form-grid mt-3">' +
          '<div class="form-group">' +
            '<label class="form-label">Cache Size (KB)</label>' +
            '<input type="number" class="form-input" id="dns-cache-size" value="' + (s.cacheSize || 2048) + '" min="512" max="65536">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">Max Cache TTL</label>' +
            '<select class="form-select" id="dns-max-ttl">' +
              '<option value="1d 00:00:00"' + (s.maxTtl === '1d 00:00:00' ? ' selected' : '') + '>1 dia</option>' +
              '<option value="7d 00:00:00"' + ((s.maxTtl || '7d 00:00:00') === '7d 00:00:00' ? ' selected' : '') + '>7 dias (padrão)</option>' +
              '<option value="1h"' + (s.maxTtl === '1h' ? ' selected' : '') + '>1 hora</option>' +
            '</select>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="form-card mt-4">' +
        '<div class="form-card-title">DNS Populares <span class="badge">Atalhos</span></div>' +
        '<p class="text-xs text-muted mb-3">Clique para preencher automaticamente</p>' +
        '<div class="flex gap-2" style="flex-wrap:wrap">' +
          '<button class="btn btn-secondary btn-sm dns-preset" data-dns="8.8.8.8,8.8.4.4">Google DNS</button>' +
          '<button class="btn btn-secondary btn-sm dns-preset" data-dns="1.1.1.1,1.0.0.1">Cloudflare</button>' +
          '<button class="btn btn-secondary btn-sm dns-preset" data-dns="208.67.222.222,208.67.220.220">OpenDNS</button>' +
          '<button class="btn btn-secondary btn-sm dns-preset" data-dns="9.9.9.9,149.112.112.112">Quad9</button>' +
          '<button class="btn btn-secondary btn-sm dns-preset" data-dns="185.228.168.9,185.228.169.9">CleanBrowsing</button>' +
        '</div>' +
      '</div>';
  },

  bindEvents: function() {
    var self = this;

    // Add DNS server
    var addBtn = document.getElementById('dns-add-server');
    if (addBtn) {
      addBtn.addEventListener('click', function() {
        var s = window.MKConfigure.state.dns || {};
        s.servers = s.servers || [];
        s.servers.push({ ip: '' });
        window.MKConfigure.state.dns = s;
        window.MKConfigure.app.renderCurrentModule();
      });
    }

    // Remove DNS server
    document.querySelectorAll('.dns-remove').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var idx = parseInt(this.closest('.dynamic-list-item').getAttribute('data-dns-idx'));
        var s = window.MKConfigure.state.dns || {};
        s.servers = s.servers || [];
        s.servers.splice(idx, 1);
        window.MKConfigure.state.dns = s;
        window.MKConfigure.app.renderCurrentModule();
      });
    });

    // DNS presets
    document.querySelectorAll('.dns-preset').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var ips = this.getAttribute('data-dns').split(',');
        var s = window.MKConfigure.state.dns || {};
        s.servers = ips.map(function(ip) { return { ip: ip.trim() }; });
        window.MKConfigure.state.dns = s;
        window.MKConfigure.app.renderCurrentModule();
      });
    });
  },

  readForm: function() {
    var servers = [];
    document.querySelectorAll('#dns-server-list .dynamic-list-item').forEach(function(row) {
      var ip = row.querySelector('.dns-server-ip').value;
      if (ip) servers.push({ ip: ip.trim() });
    });

    var state = {
      servers: servers.length > 0 ? servers : [{ ip: '8.8.8.8' }, { ip: '8.8.4.4' }],
      allowRemote: (document.getElementById('dns-allow-remote') || {}).checked !== false,
      cacheSize: parseInt((document.getElementById('dns-cache-size') || {}).value) || 2048,
      maxTtl: (document.getElementById('dns-max-ttl') || {}).value || '7d 00:00:00'
    };
    window.MKConfigure.state.dns = state;
    return state;
  },

  generateScript: function(state) {
    var s = state.dns || {};
    var servers = s.servers || [{ ip: '8.8.8.8' }, { ip: '8.8.4.4' }];
    var lines = [];

    lines.push('#');
    lines.push('# ── DNS ──────────────────────────────────────────');
    lines.push('#');

    var dnsIps = servers.map(function(srv) { return srv.ip; }).filter(Boolean).join(',');
    lines.push('/ip dns set servers=' + (dnsIps || '8.8.8.8,8.8.4.4') +
      ' allow-remote-requests=' + (s.allowRemote !== false ? 'yes' : 'no') +
      ' cache-size=' + (s.cacheSize || 2048) + 'KiB' +
      ' max-udp-packet-size=4096' +
      ' cache-max-ttl=' + (s.maxTtl || '7d 00:00:00'));
    lines.push('');

    return lines.join('\n');
  }
};
