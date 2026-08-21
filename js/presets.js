/* ============================================================
   MKConfigure — MikroTik Device Presets
   Modelos pré-definidos com portas e interfaces
   ============================================================ */

window.MKConfigure = window.MKConfigure || {};

window.MKConfigure.presets = {
  'manual': {
    label: 'Configuração Manual',
    description: 'Defina manualmente o número de portas',
    etherPorts: 5,
    sfpPorts: 0,
    sfpPlusPorts: 0,
    wifi: false,
    category: 'manual'
  },

  'hap-ax2': {
    label: 'hAP ax²',
    description: '5× GbE, WiFi 6, 1 GHz CPU',
    etherPorts: 5,
    sfpPorts: 0,
    sfpPlusPorts: 0,
    wifi: true,
    category: 'home'
  },

  'hap-ax3': {
    label: 'hAP ax³',
    description: '5× GbE, WiFi 6, 1.8 GHz CPU',
    etherPorts: 5,
    sfpPorts: 0,
    sfpPlusPorts: 0,
    wifi: true,
    category: 'home'
  },

  'hap-ac2': {
    label: 'hAP ac²',
    description: '5× FE, WiFi ac, 716 MHz CPU',
    etherPorts: 5,
    sfpPorts: 0,
    sfpPlusPorts: 0,
    wifi: true,
    category: 'home'
  },

  'hap-ac3': {
    label: 'hAP ac³',
    description: '5× GbE, WiFi ac, 896 MHz CPU',
    etherPorts: 5,
    sfpPorts: 0,
    sfpPlusPorts: 0,
    wifi: true,
    category: 'home'
  },

  'hex-rb750gr3': {
    label: 'hEX (RB750Gr3)',
    description: '5× GbE, 880 MHz CPU, 256 MB RAM',
    etherPorts: 5,
    sfpPorts: 0,
    sfpPlusPorts: 0,
    wifi: false,
    category: 'router'
  },

  'hex-s-rb760igs': {
    label: 'hEX S (RB760iGS)',
    description: '5× GbE + 1× SFP, 880 MHz CPU',
    etherPorts: 5,
    sfpPorts: 1,
    sfpPlusPorts: 0,
    wifi: false,
    category: 'router'
  },

  'hex-poe': {
    label: 'hEX PoE',
    description: '5× GbE (4× PoE out) + 1× SFP',
    etherPorts: 5,
    sfpPorts: 1,
    sfpPlusPorts: 0,
    wifi: false,
    category: 'router'
  },

  'rb4011': {
    label: 'RB4011iGS+',
    description: '10× GbE + 1× SFP+, 1.4 GHz CPU',
    etherPorts: 10,
    sfpPorts: 0,
    sfpPlusPorts: 1,
    wifi: false,
    category: 'router'
  },

  'rb3011': {
    label: 'RB3011UiAS',
    description: '10× GbE + 1× SFP, 1.4 GHz CPU',
    etherPorts: 10,
    sfpPorts: 1,
    sfpPlusPorts: 0,
    wifi: false,
    category: 'router'
  },

  'rb5009': {
    label: 'RB5009UG+S+',
    description: '7× GbE + 1× 2.5GbE + 1× SFP+',
    etherPorts: 8,
    sfpPorts: 0,
    sfpPlusPorts: 1,
    wifi: false,
    category: 'router'
  },

  'ccr2004-1g-12s': {
    label: 'CCR2004-1G-12S+2XS',
    description: '1× GbE + 12× SFP+ + 2× 25GbE SFP28',
    etherPorts: 1,
    sfpPorts: 0,
    sfpPlusPorts: 12,
    wifi: false,
    category: 'core'
  },

  'ccr2116-12g-4s': {
    label: 'CCR2116-12G-4S+',
    description: '12× GbE + 4× SFP+, 2 GHz CPU',
    etherPorts: 12,
    sfpPorts: 0,
    sfpPlusPorts: 4,
    wifi: false,
    category: 'core'
  },

  'crs326-24g-2s': {
    label: 'CRS326-24G-2S+',
    description: '24× GbE + 2× SFP+, Switch/Router',
    etherPorts: 24,
    sfpPorts: 0,
    sfpPlusPorts: 2,
    wifi: false,
    category: 'switch'
  },

  'crs328-24p-4s': {
    label: 'CRS328-24P-4S+',
    description: '24× GbE PoE + 4× SFP+',
    etherPorts: 24,
    sfpPorts: 0,
    sfpPlusPorts: 4,
    wifi: false,
    category: 'switch'
  },

  'crs312-4c-8xg': {
    label: 'CRS312-4C+8XG',
    description: '8× 10GbE + 4× Combo (10GbE/SFP+)',
    etherPorts: 8,
    sfpPorts: 0,
    sfpPlusPorts: 4,
    wifi: false,
    category: 'switch'
  },

  'rb750-r2': {
    label: 'hEX lite (RB750r2)',
    description: '5× FE, 850 MHz CPU, 64 MB RAM',
    etherPorts: 5,
    sfpPorts: 0,
    sfpPlusPorts: 0,
    wifi: false,
    category: 'router'
  },

  'rb951': {
    label: 'RB951Ui-2HnD',
    description: '5× FE, WiFi n, 600 MHz CPU',
    etherPorts: 5,
    sfpPorts: 0,
    sfpPlusPorts: 0,
    wifi: true,
    category: 'home'
  },

  'rb962': {
    label: 'hAP ac (RB962)',
    description: '5× GbE, WiFi ac, 720 MHz CPU',
    etherPorts: 5,
    sfpPorts: 0,
    sfpPlusPorts: 0,
    wifi: true,
    category: 'home'
  }
};

/**
 * Gera a lista de nomes de interface com base no preset selecionado.
 * @param {string} presetId - ID do preset
 * @param {number} [customEther] - Número customizado de portas ethernet (para modo manual)
 * @returns {{ ethers: string[], sfps: string[], sfpPlus: string[] }}
 */
window.MKConfigure.getInterfaceNames = function(presetId, customEther) {
  var preset = window.MKConfigure.presets[presetId];
  if (!preset) preset = window.MKConfigure.presets['manual'];

  var etherCount = presetId === 'manual' && customEther ? customEther : preset.etherPorts;
  var sfpCount = preset.sfpPorts;
  var sfpPlusCount = preset.sfpPlusPorts;

  var ethers = [];
  for (var i = 1; i <= etherCount; i++) {
    ethers.push('ether' + i);
  }

  var sfps = [];
  for (var j = 1; j <= sfpCount; j++) {
    sfps.push('sfp' + j);
  }

  var sfpPlus = [];
  for (var k = 1; k <= sfpPlusCount; k++) {
    sfpPlus.push('sfp-sfpplus' + k);
  }

  return {
    ethers: ethers,
    sfps: sfps,
    sfpPlus: sfpPlus,
    all: ethers.concat(sfps, sfpPlus)
  };
};
