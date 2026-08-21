/* ============================================================
   MKConfigure — Módulo: Identidade & Sistema
   ============================================================ */

window.MKConfigure = window.MKConfigure || {};
window.MKConfigure.modules = window.MKConfigure.modules || {};

window.MKConfigure.modules.identity = {
  id: 'identity',
  title: 'Identidade & Sistema',
  description: 'System Identity, Timezone, NTP, serviços e segurança',
  icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',

  renderForm: function(state) {
    var s = state.identity || {};
    return '' +
      '<div class="form-card">' +
        '<div class="form-card-title">Identificação do Roteador</div>' +
        '<div class="form-grid">' +
          '<div class="form-group">' +
            '<label class="form-label">System Identity <span class="required">*</span></label>' +
            '<input type="text" class="form-input" id="id-identity" value="' + (s.name || 'MikroTik') + '" placeholder="Ex: MK-Escritorio">' +
            '<span class="form-help">Nome que aparece no Winbox e CLI</span>' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">Timezone</label>' +
            '<select class="form-select" id="id-timezone">' +
              this._timezoneOptions(s.timezone || 'America/Sao_Paulo') +
            '</select>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="form-card mt-4">' +
        '<div class="form-card-title">NTP (Sincronização de Horário)</div>' +
        '<div class="toggle-row">' +
          '<div class="toggle-label">' +
            '<span>Habilitar NTP Client</span>' +
            '<span class="toggle-desc">Sincroniza o relógio com servidores NTP</span>' +
          '</div>' +
          '<label class="toggle-switch">' +
            '<input type="checkbox" id="id-ntp-enabled" ' + (s.ntpEnabled !== false ? 'checked' : '') + '>' +
            '<span class="toggle-slider"></span>' +
          '</label>' +
        '</div>' +
        '<div class="form-grid mt-3" id="id-ntp-servers" style="' + (s.ntpEnabled === false ? 'display:none' : '') + '">' +
          '<div class="form-group">' +
            '<label class="form-label">NTP Server Primário</label>' +
            '<input type="text" class="form-input" id="id-ntp1" value="' + (s.ntpServer1 || 'a.ntp.br') + '" placeholder="a.ntp.br">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">NTP Server Secundário</label>' +
            '<input type="text" class="form-input" id="id-ntp2" value="' + (s.ntpServer2 || 'b.ntp.br') + '" placeholder="b.ntp.br">' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="form-card mt-4">' +
        '<div class="form-card-title">Segurança — Desabilitar Serviços</div>' +
        '<p class="text-xs text-muted mb-3">Desabilite serviços desnecessários para reduzir superfície de ataque</p>' +
        '<div class="form-grid">' +
          this._serviceCheckbox('id-svc-telnet', 'Telnet', s.disableTelnet !== false) +
          this._serviceCheckbox('id-svc-ftp', 'FTP', s.disableFtp !== false) +
          this._serviceCheckbox('id-svc-www', 'WWW (HTTP)', s.disableWww !== false) +
          this._serviceCheckbox('id-svc-www-ssl', 'WWW-SSL (HTTPS)', s.disableWwwSsl !== false) +
          this._serviceCheckbox('id-svc-api', 'API', s.disableApi !== false) +
          this._serviceCheckbox('id-svc-api-ssl', 'API-SSL', s.disableApiSsl !== false) +
          this._serviceCheckbox('id-svc-bandwidth', 'Bandwidth Test', s.disableBandwidth !== false) +
        '</div>' +
      '</div>' +

      '<div class="form-card mt-4">' +
        '<div class="form-card-title">Segurança — Conta Admin</div>' +
        '<div class="toggle-row">' +
          '<div class="toggle-label">' +
            '<span>Definir senha para o admin</span>' +
            '<span class="toggle-desc">Recomendado: nunca deixe sem senha</span>' +
          '</div>' +
          '<label class="toggle-switch">' +
            '<input type="checkbox" id="id-admin-pass-enabled" ' + (s.adminPassEnabled ? 'checked' : '') + '>' +
            '<span class="toggle-slider"></span>' +
          '</label>' +
        '</div>' +
        '<div class="form-grid mt-3" id="id-admin-pass-section" style="' + (s.adminPassEnabled ? '' : 'display:none') + '">' +
          '<div class="form-group">' +
            '<label class="form-label">Senha do Admin</label>' +
            '<input type="password" class="form-input" id="id-admin-pass" value="' + (s.adminPass || '') + '" placeholder="Digite uma senha forte">' +
          '</div>' +
        '</div>' +
      '</div>';
  },

  bindEvents: function() {
    var self = this;
    var ntpCheckbox = document.getElementById('id-ntp-enabled');
    var ntpServers = document.getElementById('id-ntp-servers');
    if (ntpCheckbox && ntpServers) {
      ntpCheckbox.addEventListener('change', function() {
        ntpServers.style.display = this.checked ? '' : 'none';
        self.readForm();
      });
    }

    var adminPassCheckbox = document.getElementById('id-admin-pass-enabled');
    var adminPassSection = document.getElementById('id-admin-pass-section');
    if (adminPassCheckbox && adminPassSection) {
      adminPassCheckbox.addEventListener('change', function() {
        adminPassSection.style.display = this.checked ? '' : 'none';
        self.readForm();
      });
    }
  },

  readForm: function() {
    var state = {
      name: (document.getElementById('id-identity') || {}).value || 'MikroTik',
      timezone: (document.getElementById('id-timezone') || {}).value || 'America/Sao_Paulo',
      ntpEnabled: (document.getElementById('id-ntp-enabled') || {}).checked !== false,
      ntpServer1: (document.getElementById('id-ntp1') || {}).value || 'a.ntp.br',
      ntpServer2: (document.getElementById('id-ntp2') || {}).value || 'b.ntp.br',
      disableTelnet: (document.getElementById('id-svc-telnet') || {}).checked !== false,
      disableFtp: (document.getElementById('id-svc-ftp') || {}).checked !== false,
      disableWww: (document.getElementById('id-svc-www') || {}).checked !== false,
      disableWwwSsl: (document.getElementById('id-svc-www-ssl') || {}).checked !== false,
      disableApi: (document.getElementById('id-svc-api') || {}).checked !== false,
      disableApiSsl: (document.getElementById('id-svc-api-ssl') || {}).checked !== false,
      disableBandwidth: (document.getElementById('id-svc-bandwidth') || {}).checked !== false,
      adminPassEnabled: (document.getElementById('id-admin-pass-enabled') || {}).checked === true,
      adminPass: (document.getElementById('id-admin-pass') || {}).value || ''
    };
    window.MKConfigure.state.identity = state;
    return state;
  },

  generateScript: function(state) {
    var s = state.identity || {};
    var lines = [];

    lines.push('#');
    lines.push('# ── Identidade & Sistema ──────────────────────────');
    lines.push('#');

    // Identity
    lines.push('/system identity set name=' + (s.name || 'MikroTik'));
    lines.push('');

    // Timezone
    lines.push('/system clock set time-zone-name=' + (s.timezone || 'America/Sao_Paulo'));
    lines.push('');

    // NTP
    if (s.ntpEnabled !== false) {
      lines.push('/system ntp client set enabled=yes');
      lines.push('/system ntp client servers');
      if (s.ntpServer1) lines.push('add address=' + s.ntpServer1);
      if (s.ntpServer2) lines.push('add address=' + s.ntpServer2);
      lines.push('');
    }

    // Disable services
    var disabledServices = [];
    if (s.disableTelnet !== false) disabledServices.push('telnet');
    if (s.disableFtp !== false) disabledServices.push('ftp');
    if (s.disableWww !== false) disabledServices.push('www');
    if (s.disableWwwSsl !== false) disabledServices.push('www-ssl');
    if (s.disableApi !== false) disabledServices.push('api');
    if (s.disableApiSsl !== false) disabledServices.push('api-ssl');
    if (s.disableBandwidth !== false) disabledServices.push('btest');

    if (disabledServices.length > 0) {
      lines.push('/ip service');
      for (var i = 0; i < disabledServices.length; i++) {
        lines.push('set ' + disabledServices[i] + ' disabled=yes');
      }
      lines.push('');
    }

    // Disable MAC-based access
    lines.push('/tool mac-server set allowed-interface-list=LAN');
    lines.push('/tool mac-server mac-winbox set allowed-interface-list=LAN');
    lines.push('/tool mac-server ping set enabled=no');
    lines.push('');

    // Disable neighbor discovery on WAN
    lines.push('/ip neighbor discovery-settings set discover-interface-list=LAN');
    lines.push('');

    // Admin password
    if (s.adminPassEnabled && s.adminPass) {
      lines.push('/user set [find name=admin] password="' + s.adminPass + '"');
      lines.push('');
    }

    return lines.join('\n');
  },

  _timezoneOptions: function(selected) {
    var zones = [
      'America/Sao_Paulo', 'America/Fortaleza', 'America/Manaus', 'America/Belem',
      'America/Cuiaba', 'America/Recife', 'America/Porto_Velho', 'America/Rio_Branco',
      'America/Noronha', 'America/New_York', 'America/Chicago', 'America/Denver',
      'America/Los_Angeles', 'America/Buenos_Aires', 'America/Santiago',
      'America/Bogota', 'America/Lima', 'America/Mexico_City',
      'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Lisbon',
      'Europe/Madrid', 'Europe/Rome', 'Europe/Moscow',
      'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Dubai', 'Asia/Kolkata',
      'Australia/Sydney', 'Pacific/Auckland', 'UTC'
    ];
    var html = '';
    for (var i = 0; i < zones.length; i++) {
      html += '<option value="' + zones[i] + '"' + (zones[i] === selected ? ' selected' : '') + '>' + zones[i] + '</option>';
    }
    return html;
  },

  _serviceCheckbox: function(id, label, checked) {
    return '<label class="checkbox-row">' +
      '<input type="checkbox" id="' + id + '"' + (checked ? ' checked' : '') + '>' +
      '<label for="' + id + '">Desabilitar ' + label + '</label>' +
    '</label>';
  }
};
