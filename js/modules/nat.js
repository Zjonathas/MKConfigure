/* ============================================================
   MKConfigure — Módulo: NAT
   ============================================================ */

window.MKConfigure = window.MKConfigure || {};
window.MKConfigure.modules = window.MKConfigure.modules || {};

window.MKConfigure.modules.nat = {
  id: 'nat',
  title: 'NAT',
  description: 'Masquerade, src-nat e port forwarding (dst-nat)',
  icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',

  renderForm: function(state) {
    var s = state.nat || {};
    var masqType = s.masqType || 'masquerade';

    // Port forwarding rules
    var fwdRules = s.portForward || [];
    var fwdRows = '';
    for (var i = 0; i < fwdRules.length; i++) {
      var r = fwdRules[i];
      fwdRows +=
        '<div class="dynamic-list-item" data-fwd-idx="' + i + '">' +
          '<div class="form-group">' +
            '<label class="form-label">Protocolo</label>' +
            '<select class="form-select fwd-proto">' +
              '<option value="tcp"' + (r.proto === 'tcp' ? ' selected' : '') + '>TCP</option>' +
              '<option value="udp"' + (r.proto === 'udp' ? ' selected' : '') + '>UDP</option>' +
              '<option value="tcp,udp"' + (r.proto === 'tcp,udp' ? ' selected' : '') + '>TCP+UDP</option>' +
            '</select>' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">Porta Externa</label>' +
            '<input type="text" class="form-input fwd-ext-port" value="' + (r.extPort || '') + '" placeholder="Ex: 8080">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">IP Destino</label>' +
            '<input type="text" class="form-input fwd-dst-ip" value="' + (r.dstIp || '') + '" placeholder="Ex: 192.168.88.100">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">Porta Interna</label>' +
            '<input type="text" class="form-input fwd-int-port" value="' + (r.intPort || '') + '" placeholder="Ex: 80">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">Comentário</label>' +
            '<input type="text" class="form-input fwd-comment" value="' + (r.comment || '') + '" placeholder="Ex: Web Server">' +
          '</div>' +
          '<button type="button" class="btn btn-danger btn-icon btn-remove fwd-remove" title="Remover">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
        '</div>';
    }

    return '' +
      '<div class="form-card">' +
        '<div class="form-card-title">Source NAT</div>' +
        '<p class="text-xs text-muted mb-3">Permite que dispositivos na LAN acessem a internet</p>' +
        '<div class="form-group">' +
          '<label class="form-label">Tipo de NAT</label>' +
          '<div class="radio-group">' +
            '<div class="radio-option">' +
              '<input type="radio" name="nat-type" id="nat-masquerade" value="masquerade"' + (masqType === 'masquerade' ? ' checked' : '') + '>' +
              '<label class="radio-label" for="nat-masquerade">' +
                '<span class="radio-title">Masquerade</span>' +
                '<span class="radio-desc">IP WAN dinâmico (DHCP/PPPoE)</span>' +
              '</label>' +
            '</div>' +
            '<div class="radio-option">' +
              '<input type="radio" name="nat-type" id="nat-srcnat" value="srcnat"' + (masqType === 'srcnat' ? ' checked' : '') + '>' +
              '<label class="radio-label" for="nat-srcnat">' +
                '<span class="radio-title">src-nat</span>' +
                '<span class="radio-desc">IP WAN fixo/estático</span>' +
              '</label>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div id="nat-srcnat-ip-section" style="' + (masqType === 'srcnat' ? '' : 'display:none') + '">' +
          '<div class="form-group mt-3">' +
            '<label class="form-label">IP de Origem (to-addresses)</label>' +
            '<input type="text" class="form-input" id="nat-srcnat-ip" value="' + (s.srcNatIp || '') + '" placeholder="Ex: 200.100.50.10">' +
          '</div>' +
        '</div>' +
        '<div class="toggle-row mt-3">' +
          '<div class="toggle-label">' +
            '<span>Excluir tráfego IPsec do NAT</span>' +
            '<span class="toggle-desc">ipsec-policy=out,none — evita conflito com túneis VPN</span>' +
          '</div>' +
          '<label class="toggle-switch">' +
            '<input type="checkbox" id="nat-ipsec-exclude" ' + (s.ipsecExclude !== false ? 'checked' : '') + '>' +
            '<span class="toggle-slider"></span>' +
          '</label>' +
        '</div>' +
      '</div>' +

      '<div class="form-card mt-4">' +
        '<div class="form-card-title">Port Forwarding (dst-nat) <span class="badge">Opcional</span></div>' +
        '<p class="text-xs text-muted mb-3">Redireciona portas externas para dispositivos internos</p>' +
        '<div class="dynamic-list" id="nat-fwd-list">' +
          fwdRows +
        '</div>' +
        '<div class="dynamic-list-add mt-3" id="nat-fwd-add">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
          'Adicionar Port Forward' +
        '</div>' +
      '</div>';
  },

  bindEvents: function() {
    var self = this;

    // NAT type change
    document.querySelectorAll('input[name="nat-type"]').forEach(function(r) {
      r.addEventListener('change', function() {
        var section = document.getElementById('nat-srcnat-ip-section');
        if (section) section.style.display = this.value === 'srcnat' ? '' : 'none';
        self.readForm();
      });
    });

    // Add port forward
    var addBtn = document.getElementById('nat-fwd-add');
    if (addBtn) {
      addBtn.addEventListener('click', function() {
        var s = window.MKConfigure.state.nat || {};
        s.portForward = s.portForward || [];
        s.portForward.push({ proto: 'tcp', extPort: '', dstIp: '', intPort: '', comment: '' });
        window.MKConfigure.state.nat = s;
        window.MKConfigure.app.renderCurrentModule();
      });
    }

    // Remove port forward
    document.querySelectorAll('.fwd-remove').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var idx = parseInt(this.closest('.dynamic-list-item').getAttribute('data-fwd-idx'));
        var s = window.MKConfigure.state.nat || {};
        s.portForward = s.portForward || [];
        s.portForward.splice(idx, 1);
        window.MKConfigure.state.nat = s;
        window.MKConfigure.app.renderCurrentModule();
      });
    });
  },

  readForm: function() {
    var masqType = 'masquerade';
    document.querySelectorAll('input[name="nat-type"]').forEach(function(r) {
      if (r.checked) masqType = r.value;
    });

    var portForward = [];
    document.querySelectorAll('#nat-fwd-list .dynamic-list-item').forEach(function(row) {
      portForward.push({
        proto: row.querySelector('.fwd-proto').value || 'tcp',
        extPort: row.querySelector('.fwd-ext-port').value || '',
        dstIp: row.querySelector('.fwd-dst-ip').value || '',
        intPort: row.querySelector('.fwd-int-port').value || '',
        comment: row.querySelector('.fwd-comment').value || ''
      });
    });

    var state = {
      masqType: masqType,
      srcNatIp: (document.getElementById('nat-srcnat-ip') || {}).value || '',
      ipsecExclude: (document.getElementById('nat-ipsec-exclude') || {}).checked !== false,
      portForward: portForward
    };
    window.MKConfigure.state.nat = state;
    return state;
  },

  generateScript: function(state) {
    var s = state.nat || {};
    var wanState = state.wan || {};
    var links = wanState.links || [];
    var lines = [];

    lines.push('#');
    lines.push('# ── NAT ──────────────────────────────────────────');
    lines.push('#');

    lines.push('/ip firewall nat');

    // Source NAT
    var ipsecPolicy = s.ipsecExclude !== false ? ' ipsec-policy=out,none' : '';

    if (s.masqType === 'srcnat' && s.srcNatIp) {
      lines.push('add chain=srcnat action=src-nat to-addresses=' + s.srcNatIp + ' out-interface-list=WAN' + ipsecPolicy + ' comment="Source NAT"');
    } else {
      // For multi-WAN PCC, create masquerade per link
      if (links.length > 1 && wanState.strategy === 'pcc') {
        for (var i = 0; i < links.length; i++) {
          var outIf = links[i].type === 'pppoe' ? 'pppoe-link' + (i + 1) : links[i].iface;
          lines.push('add chain=srcnat action=masquerade out-interface=' + outIf + ipsecPolicy + ' comment="Masquerade WAN' + (i + 1) + '"');
        }
      } else {
        lines.push('add chain=srcnat action=masquerade out-interface-list=WAN' + ipsecPolicy + ' comment="Masquerade"');
      }
    }

    // Port forwarding
    var fwd = s.portForward || [];
    if (fwd.length > 0) {
      lines.push('');
      lines.push('# ── Port Forwarding ──');
      for (var f = 0; f < fwd.length; f++) {
        var r = fwd[f];
        if (r.extPort && r.dstIp) {
          var toPort = r.intPort || r.extPort;
          var comment = r.comment ? ' comment="' + r.comment + '"' : '';
          lines.push('add chain=dstnat action=dst-nat protocol=' + r.proto +
            ' dst-port=' + r.extPort +
            ' in-interface-list=WAN' +
            ' to-addresses=' + r.dstIp +
            ' to-ports=' + toPort +
            comment);
        }
      }
    }
    lines.push('');

    return lines.join('\n');
  }
};
