/* ============================================================
   MKConfigure — Validator
   Utilitários de validação para IPs, CIDR, portas, etc.
   ============================================================ */

window.MKConfigure = window.MKConfigure || {};

window.MKConfigure.validator = (function() {
  'use strict';

  /**
   * Valida um endereço IPv4
   */
  function isValidIPv4(ip) {
    if (!ip || typeof ip !== 'string') return false;
    var parts = ip.trim().split('.');
    if (parts.length !== 4) return false;
    for (var i = 0; i < 4; i++) {
      var num = parseInt(parts[i], 10);
      if (isNaN(num) || num < 0 || num > 255) return false;
      if (parts[i] !== String(num)) return false;
    }
    return true;
  }

  /**
   * Valida CIDR (ex: 192.168.88.1/24)
   */
  function isValidCIDR(cidr) {
    if (!cidr || typeof cidr !== 'string') return false;
    var parts = cidr.trim().split('/');
    if (parts.length !== 2) return false;
    if (!isValidIPv4(parts[0])) return false;
    var prefix = parseInt(parts[1], 10);
    return !isNaN(prefix) && prefix >= 0 && prefix <= 32;
  }

  /**
   * Valida máscara de sub-rede
   */
  function isValidSubnetMask(mask) {
    if (!isValidIPv4(mask)) return false;
    var parts = mask.split('.').map(function(p) { return parseInt(p, 10); });
    var binary = '';
    for (var i = 0; i < 4; i++) {
      binary += ('00000000' + parts[i].toString(2)).slice(-8);
    }
    return /^1*0*$/.test(binary);
  }

  /**
   * Converte prefixo (/24) para máscara
   */
  function prefixToMask(prefix) {
    prefix = parseInt(prefix, 10);
    if (isNaN(prefix) || prefix < 0 || prefix > 32) return '';
    var mask = [];
    for (var i = 0; i < 4; i++) {
      var bits = Math.min(8, Math.max(0, prefix - i * 8));
      mask.push(256 - Math.pow(2, 8 - bits));
    }
    return mask.join('.');
  }

  /**
   * Converte máscara para prefixo
   */
  function maskToPrefix(mask) {
    if (!isValidSubnetMask(mask)) return -1;
    var parts = mask.split('.').map(function(p) { return parseInt(p, 10); });
    var count = 0;
    for (var i = 0; i < 4; i++) {
      var b = parts[i];
      while (b > 0) {
        count += b & 1;
        b >>= 1;
      }
    }
    return count;
  }

  /**
   * Valida endereço IPv6
   */
  function isValidIPv6(ip) {
    if (!ip || typeof ip !== 'string') return false;
    ip = ip.trim();
    // Padrão simplificado
    var pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$|^::$|^::1$|^fe80::/i;
    return pattern.test(ip);
  }

  /**
   * Valida prefixo IPv6 (ex: 64)
   */
  function isValidIPv6Prefix(prefix) {
    var num = parseInt(prefix, 10);
    return !isNaN(num) && num >= 1 && num <= 128;
  }

  /**
   * Valida número de porta TCP/UDP
   */
  function isValidPort(port) {
    var num = parseInt(port, 10);
    return !isNaN(num) && num >= 1 && num <= 65535;
  }

  /**
   * Valida range de portas (ex: 80-443)
   */
  function isValidPortRange(range) {
    if (!range || typeof range !== 'string') return false;
    if (range.indexOf('-') === -1) return isValidPort(range);
    var parts = range.split('-');
    if (parts.length !== 2) return false;
    var start = parseInt(parts[0], 10);
    var end = parseInt(parts[1], 10);
    return isValidPort(start) && isValidPort(end) && start <= end;
  }

  /**
   * Valida nome de interface MikroTik
   */
  function isValidInterfaceName(name) {
    if (!name || typeof name !== 'string') return false;
    return /^[a-zA-Z][a-zA-Z0-9._-]{0,31}$/.test(name.trim());
  }

  /**
   * Valida System Identity
   */
  function isValidIdentity(name) {
    if (!name || typeof name !== 'string') return false;
    var trimmed = name.trim();
    return trimmed.length >= 1 && trimmed.length <= 64 && /^[a-zA-Z0-9._-]+$/.test(trimmed);
  }

  /**
   * Valida endereço MAC
   */
  function isValidMAC(mac) {
    if (!mac || typeof mac !== 'string') return false;
    return /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(mac.trim());
  }

  /**
   * Calcula endereço de rede a partir de IP e prefixo
   */
  function networkAddress(ip, prefix) {
    if (!isValidIPv4(ip)) return '';
    prefix = parseInt(prefix, 10);
    if (isNaN(prefix) || prefix < 0 || prefix > 32) return '';
    var parts = ip.split('.').map(function(p) { return parseInt(p, 10); });
    var ipNum = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
    var maskNum = prefix === 0 ? 0 : (-1 << (32 - prefix));
    var netNum = (ipNum & maskNum) >>> 0;
    return [
      (netNum >>> 24) & 0xFF,
      (netNum >>> 16) & 0xFF,
      (netNum >>> 8) & 0xFF,
      netNum & 0xFF
    ].join('.');
  }

  /**
   * Calcula broadcast a partir de IP e prefixo
   */
  function broadcastAddress(ip, prefix) {
    if (!isValidIPv4(ip)) return '';
    prefix = parseInt(prefix, 10);
    if (isNaN(prefix) || prefix < 0 || prefix > 32) return '';
    var parts = ip.split('.').map(function(p) { return parseInt(p, 10); });
    var ipNum = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
    var hostBits = 32 - prefix;
    var maskNum = prefix === 0 ? 0 : (-1 << hostBits);
    var bcastNum = ((ipNum & maskNum) | (~maskNum & 0xFFFFFFFF)) >>> 0;
    return [
      (bcastNum >>> 24) & 0xFF,
      (bcastNum >>> 16) & 0xFF,
      (bcastNum >>> 8) & 0xFF,
      bcastNum & 0xFF
    ].join('.');
  }

  /**
   * Calcula range de DHCP padrão (segundo IP até penúltimo)
   */
  function defaultDHCPRange(ip, prefix) {
    var net = networkAddress(ip, prefix);
    var bcast = broadcastAddress(ip, prefix);
    if (!net || !bcast) return { start: '', end: '' };

    var netParts = net.split('.').map(Number);
    var bcastParts = bcast.split('.').map(Number);

    // Start: network + 2
    var startNum = ((netParts[0] << 24) | (netParts[1] << 16) | (netParts[2] << 8) | netParts[3]) + 2;
    // End: broadcast - 1
    var endNum = ((bcastParts[0] << 24) | (bcastParts[1] << 16) | (bcastParts[2] << 8) | bcastParts[3]) - 1;

    if (startNum >= endNum) return { start: '', end: '' };

    startNum = startNum >>> 0;
    endNum = endNum >>> 0;

    return {
      start: [(startNum >>> 24) & 0xFF, (startNum >>> 16) & 0xFF, (startNum >>> 8) & 0xFF, startNum & 0xFF].join('.'),
      end: [(endNum >>> 24) & 0xFF, (endNum >>> 16) & 0xFF, (endNum >>> 8) & 0xFF, endNum & 0xFF].join('.')
    };
  }

  /**
   * Aplica validação visual a um campo input
   */
  function validateField(inputEl, isValid) {
    inputEl.classList.remove('error', 'success');
    if (inputEl.value.trim() === '') return;
    inputEl.classList.add(isValid ? 'success' : 'error');
  }

  return {
    isValidIPv4: isValidIPv4,
    isValidCIDR: isValidCIDR,
    isValidSubnetMask: isValidSubnetMask,
    prefixToMask: prefixToMask,
    maskToPrefix: maskToPrefix,
    isValidIPv6: isValidIPv6,
    isValidIPv6Prefix: isValidIPv6Prefix,
    isValidPort: isValidPort,
    isValidPortRange: isValidPortRange,
    isValidInterfaceName: isValidInterfaceName,
    isValidIdentity: isValidIdentity,
    isValidMAC: isValidMAC,
    networkAddress: networkAddress,
    broadcastAddress: broadcastAddress,
    defaultDHCPRange: defaultDHCPRange,
    validateField: validateField
  };
})();
