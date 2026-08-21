/* ============================================================
   MKConfigure — Script Builder
   Concatena todos os módulos em um script RouterOS final
   ============================================================ */

window.MKConfigure = window.MKConfigure || {};

window.MKConfigure.scriptBuilder = (function() {
  'use strict';

  var moduleOrder = [
    'identity',
    'interfaces',
    'bridge',
    'wan',
    'lan',
    'dns',
    'firewall',
    'nat',
    'ipv6',
    'extras'
  ];

  /**
   * Gera o script completo concatenando todos os módulos
   */
  function buildFullScript() {
    var state = window.MKConfigure.state || {};
    var modules = window.MKConfigure.modules || {};
    var parts = [];

    // Header
    parts.push('#################################################################');
    parts.push('# MKConfigure — Script de Configuração RouterOS v7');
    parts.push('# Gerado em: ' + new Date().toLocaleString('pt-BR'));
    parts.push('# Equipamento: ' + getPresetLabel(state));
    parts.push('#################################################################');
    parts.push('');

    // Each module
    for (var i = 0; i < moduleOrder.length; i++) {
      var modId = moduleOrder[i];
      var mod = modules[modId];
      if (mod && typeof mod.generateScript === 'function') {
        var script = mod.generateScript(state);
        if (script && script.trim()) {
          parts.push(script);
        }
      }
    }

    // Footer
    parts.push('#');
    parts.push('# ── Fim da Configuração ──────────────────────────');
    parts.push('#');
    parts.push('');

    return parts.join('\n');
  }

  /**
   * Gera apenas o script do módulo ativo
   */
  function buildModuleScript(moduleId) {
    var state = window.MKConfigure.state || {};
    var mod = (window.MKConfigure.modules || {})[moduleId];
    if (mod && typeof mod.generateScript === 'function') {
      return mod.generateScript(state);
    }
    return '';
  }

  /**
   * Aplica syntax highlighting ao script
   */
  function highlight(script) {
    if (!script) return '';
    var lines = script.split('\n');
    var result = [];

    for (var i = 0; i < lines.length; i++) {
      result.push(highlightLine(lines[i]));
    }

    return result.join('\n');
  }

  function highlightLine(line) {
    // Comments
    if (/^\s*#/.test(line)) {
      return '<span class="syn-comment">' + escapeHtml(line) + '</span>';
    }

    // Empty lines
    if (!line.trim()) return '';

    var escaped = escapeHtml(line);

    // Section headers (lines starting with /)
    escaped = escaped.replace(
      /^(\/[a-z][a-z0-9\/ -]*)/,
      '<span class="syn-command">$1</span>'
    );

    // Keywords: add, set, find, remove
    escaped = escaped.replace(
      /\b(add|set|find|remove|print|enable|disable)\b/g,
      '<span class="syn-keyword">$1</span>'
    );

    // Parameters: word=
    escaped = escaped.replace(
      /\b([a-z][a-z0-9-]*)=/g,
      '<span class="syn-param">$1</span>='
    );

    // Quoted strings
    escaped = escaped.replace(
      /&quot;([^&]*)&quot;/g,
      '<span class="syn-string">&quot;$1&quot;</span>'
    );

    // IP addresses
    escaped = escaped.replace(
      /\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,2})?)\b/g,
      '<span class="syn-number">$1</span>'
    );

    // Boolean values
    escaped = escaped.replace(
      /=(yes|no|true|false)\b/g,
      '=<span class="syn-string">$1</span>'
    );

    return escaped;
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * Copia texto para o clipboard
   */
  function copyToClipboard(text, callback) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        if (callback) callback(true);
      }).catch(function() {
        fallbackCopy(text, callback);
      });
    } else {
      fallbackCopy(text, callback);
    }
  }

  function fallbackCopy(text, callback) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      if (callback) callback(true);
    } catch (e) {
      if (callback) callback(false);
    }
    document.body.removeChild(textarea);
  }

  /**
   * Download como arquivo .rsc
   */
  function downloadScript(text, filename) {
    filename = filename || 'mikrotik-config.rsc';
    var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  function getPresetLabel(state) {
    var preset = ((state.interfaces || {}).preset) || 'manual';
    var presetData = (window.MKConfigure.presets || {})[preset];
    return presetData ? presetData.label : 'Manual';
  }

  return {
    buildFullScript: buildFullScript,
    buildModuleScript: buildModuleScript,
    highlight: highlight,
    copyToClipboard: copyToClipboard,
    downloadScript: downloadScript
  };
})();
