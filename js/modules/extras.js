/* ============================================================
   MKConfigure — Módulo: Extras
   ============================================================ */

window.MKConfigure = window.MKConfigure || {};
window.MKConfigure.modules = window.MKConfigure.modules || {};

window.MKConfigure.modules.extras = {
  id: 'extras',
  title: 'Extras',
  description: 'Bandwidth limiter, Logging, SNMP e Backup scheduler',
  icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',

  renderForm: function(state) {
    var s = state.extras || {};

    return '' +
      '<div class="form-card">' +
        '<div class="form-card-title">Logging</div>' +
        '<div class="toggle-row">' +
          '<div class="toggle-label">' +
            '<span>Configurar Logging avançado</span>' +
            '<span class="toggle-desc">Ações de log para memória, disco ou syslog remoto</span>' +
          '</div>' +
          '<label class="toggle-switch">' +
            '<input type="checkbox" id="ext-logging" ' + (s.logging ? 'checked' : '') + '>' +
            '<span class="toggle-slider"></span>' +
          '</label>' +
        '</div>' +
        '<div id="ext-logging-section" style="' + (s.logging ? '' : 'display:none') + '">' +
          '<div class="form-grid mt-3">' +
            '<div class="form-group">' +
              '<label class="form-label">Syslog Server</label>' +
              '<input type="text" class="form-input" id="ext-syslog-ip" value="' + (s.syslogIp || '') + '" placeholder="Ex: 192.168.88.200">' +
            '</div>' +
            '<div class="form-group">' +
              '<label class="form-label">Syslog Port</label>' +
              '<input type="number" class="form-input" id="ext-syslog-port" value="' + (s.syslogPort || 514) + '" min="1" max="65535">' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="form-card mt-4">' +
        '<div class="form-card-title">SNMP</div>' +
        '<div class="toggle-row">' +
          '<div class="toggle-label">' +
            '<span>Habilitar SNMP</span>' +
            '<span class="toggle-desc">Permite monitoramento via Zabbix, PRTG, etc.</span>' +
          '</div>' +
          '<label class="toggle-switch">' +
            '<input type="checkbox" id="ext-snmp" ' + (s.snmp ? 'checked' : '') + '>' +
            '<span class="toggle-slider"></span>' +
          '</label>' +
        '</div>' +
        '<div id="ext-snmp-section" style="' + (s.snmp ? '' : 'display:none') + '">' +
          '<div class="form-grid mt-3">' +
            '<div class="form-group">' +
              '<label class="form-label">Community</label>' +
              '<input type="text" class="form-input" id="ext-snmp-community" value="' + (s.snmpCommunity || 'public') + '">' +
            '</div>' +
            '<div class="form-group">' +
              '<label class="form-label">Location</label>' +
              '<input type="text" class="form-input" id="ext-snmp-location" value="' + (s.snmpLocation || '') + '" placeholder="Ex: Rack 01 - Andar 2">' +
            '</div>' +
            '<div class="form-group">' +
              '<label class="form-label">Contact</label>' +
              '<input type="text" class="form-input" id="ext-snmp-contact" value="' + (s.snmpContact || '') + '" placeholder="Ex: admin@empresa.com">' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="form-card mt-4">' +
        '<div class="form-card-title">Backup Automático</div>' +
        '<div class="toggle-row">' +
          '<div class="toggle-label">' +
            '<span>Backup agendado</span>' +
            '<span class="toggle-desc">Cria backup automático via scheduler</span>' +
          '</div>' +
          '<label class="toggle-switch">' +
            '<input type="checkbox" id="ext-backup" ' + (s.backup ? 'checked' : '') + '>' +
            '<span class="toggle-slider"></span>' +
          '</label>' +
        '</div>' +
        '<div id="ext-backup-section" style="' + (s.backup ? '' : 'display:none') + '">' +
          '<div class="form-grid mt-3">' +
            '<div class="form-group">' +
              '<label class="form-label">Frequência</label>' +
              '<select class="form-select" id="ext-backup-freq">' +
                '<option value="1d"' + ((s.backupFreq || '1d') === '1d' ? ' selected' : '') + '>Diário</option>' +
                '<option value="7d"' + (s.backupFreq === '7d' ? ' selected' : '') + '>Semanal</option>' +
                '<option value="30d"' + (s.backupFreq === '30d' ? ' selected' : '') + '>Mensal</option>' +
              '</select>' +
            '</div>' +
            '<div class="form-group">' +
              '<label class="form-label">Horário</label>' +
              '<input type="text" class="form-input" id="ext-backup-time" value="' + (s.backupTime || '03:00:00') + '" placeholder="03:00:00">' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="form-card mt-4">' +
        '<div class="form-card-title">Bandwidth Limiter (Simple Queues)</div>' +
        '<div class="toggle-row">' +
          '<div class="toggle-label">' +
            '<span>Limite global de banda</span>' +
            '<span class="toggle-desc">Define velocidade máxima de upload/download para toda a rede</span>' +
          '</div>' +
          '<label class="toggle-switch">' +
            '<input type="checkbox" id="ext-bw-limit" ' + (s.bwLimit ? 'checked' : '') + '>' +
            '<span class="toggle-slider"></span>' +
          '</label>' +
        '</div>' +
        '<div id="ext-bw-section" style="' + (s.bwLimit ? '' : 'display:none') + '">' +
          '<div class="form-grid mt-3">' +
            '<div class="form-group">' +
              '<label class="form-label">Download Máximo (Mbps)</label>' +
              '<input type="number" class="form-input" id="ext-bw-down" value="' + (s.bwDown || 100) + '" min="1">' +
            '</div>' +
            '<div class="form-group">' +
              '<label class="form-label">Upload Máximo (Mbps)</label>' +
              '<input type="number" class="form-input" id="ext-bw-up" value="' + (s.bwUp || 50) + '" min="1">' +
            '</div>' +
            '<div class="form-group">' +
              '<label class="form-label">Target</label>' +
              '<input type="text" class="form-input" id="ext-bw-target" value="' + (s.bwTarget || '') + '" placeholder="Ex: 192.168.88.0/24 (vazio = bridge)">' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  },

  bindEvents: function() {
    var self = this;
    var toggleSections = [
      { toggle: 'ext-logging', section: 'ext-logging-section' },
      { toggle: 'ext-snmp', section: 'ext-snmp-section' },
      { toggle: 'ext-backup', section: 'ext-backup-section' },
      { toggle: 'ext-bw-limit', section: 'ext-bw-section' }
    ];

    toggleSections.forEach(function(t) {
      var el = document.getElementById(t.toggle);
      var sec = document.getElementById(t.section);
      if (el && sec) {
        el.addEventListener('change', function() {
          sec.style.display = this.checked ? '' : 'none';
          self.readForm();
        });
      }
    });
  },

  readForm: function() {
    var state = {
      logging: (document.getElementById('ext-logging') || {}).checked === true,
      syslogIp: (document.getElementById('ext-syslog-ip') || {}).value || '',
      syslogPort: parseInt((document.getElementById('ext-syslog-port') || {}).value) || 514,
      snmp: (document.getElementById('ext-snmp') || {}).checked === true,
      snmpCommunity: (document.getElementById('ext-snmp-community') || {}).value || 'public',
      snmpLocation: (document.getElementById('ext-snmp-location') || {}).value || '',
      snmpContact: (document.getElementById('ext-snmp-contact') || {}).value || '',
      backup: (document.getElementById('ext-backup') || {}).checked === true,
      backupFreq: (document.getElementById('ext-backup-freq') || {}).value || '1d',
      backupTime: (document.getElementById('ext-backup-time') || {}).value || '03:00:00',
      bwLimit: (document.getElementById('ext-bw-limit') || {}).checked === true,
      bwDown: parseInt((document.getElementById('ext-bw-down') || {}).value) || 100,
      bwUp: parseInt((document.getElementById('ext-bw-up') || {}).value) || 50,
      bwTarget: (document.getElementById('ext-bw-target') || {}).value || ''
    };
    window.MKConfigure.state.extras = state;
    return state;
  },

  generateScript: function(state) {
    var s = state.extras || {};
    var lines = [];
    var hasContent = s.logging || s.snmp || s.backup || s.bwLimit;

    if (!hasContent) return '';

    lines.push('#');
    lines.push('# ── Extras ───────────────────────────────────────');
    lines.push('#');

    // Logging
    if (s.logging && s.syslogIp) {
      lines.push('/system logging action');
      lines.push('add name=remote target=remote remote=' + s.syslogIp + ':' + (s.syslogPort || 514));
      lines.push('');
      lines.push('/system logging');
      lines.push('add topics=critical action=remote');
      lines.push('add topics=error action=remote');
      lines.push('add topics=warning action=remote');
      lines.push('add topics=info action=remote');
      lines.push('');
    }

    // SNMP
    if (s.snmp) {
      lines.push('/snmp set enabled=yes' +
        (s.snmpLocation ? ' location="' + s.snmpLocation + '"' : '') +
        (s.snmpContact ? ' contact="' + s.snmpContact + '"' : ''));
      lines.push('/snmp community set [find default=yes] name=' + (s.snmpCommunity || 'public') + ' read-access=yes write-access=no');
      lines.push('');
    }

    // Backup scheduler
    if (s.backup) {
      var identityName = (state.identity || {}).name || 'MikroTik';
      lines.push('/system scheduler');
      lines.push('add name=auto-backup interval=' + (s.backupFreq || '1d') + ' start-time=' + (s.backupTime || '03:00:00') +
        ' on-event="/system backup save name=' + identityName + '-auto dont-encrypt=yes" comment="Auto backup"');
      lines.push('add name=auto-export interval=' + (s.backupFreq || '1d') + ' start-time=' + (s.backupTime || '03:00:00') +
        ' on-event="/export file=' + identityName + '-export" comment="Auto export"');
      lines.push('');
    }

    // Bandwidth limiter
    if (s.bwLimit) {
      var bridgeName = (state.bridge || {}).bridgeName || 'bridge';
      var target = s.bwTarget || bridgeName;
      var down = (s.bwDown || 100) + 'M';
      var up = (s.bwUp || 50) + 'M';
      lines.push('/queue simple');
      lines.push('add name=bandwidth-limit target=' + target +
        ' max-limit=' + up + '/' + down +
        ' comment="Global bandwidth limit"');
      lines.push('');
    }

    return lines.join('\n');
  }
};
