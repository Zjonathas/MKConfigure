# ⚙️ MKConfigure — Gerador Visual de Configuração MikroTik RouterOS v7

<p align="center">
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%230ea5e9'/%3E%3Ctext x='50%25' y='55%25' text-anchor='middle' dominant-baseline='middle' font-family='system-ui' font-weight='700' font-size='14' fill='white'%3EMK%3C/text%3E%3C/svg%3E" width="64" height="64" alt="MKConfigure Logo" />
</p>

<p align="center">
  <strong>Interface web moderna, leve e visual para gerar scripts de configuração completos para roteadores MikroTik (RouterOS v7) seguindo as melhores práticas oficiais da indústria.</strong>
</p>

---

## 🌟 Principais Funcionalidades

- 🖥️ **100% Client-Side:** Roda diretamente no navegador sem necessidade de backend, Node.js ou instalação de servidor. Basta abrir o `index.html`.
- 🖧 **18 Modelos MikroTik Pré-Definidos:** Presets para `hAP ax²`, `hAP ax³`, `hEX (RB750Gr3)`, `RB4011`, `RB5009`, `CCR2004`, `CRS326`, além de modo manual customizável.
- 🔀 **Multi-WAN Avançado:** Suporte para 1 a 4 links de internet (DHCP Client, PPPoE ou IP Estático) com estratégias de **Failover com checagem por ping**, **ECMP** e **PCC (Per Connection Classifier)**.
- 🏷️ **Bridge VLAN Filtering 802.1Q Completo:**
  - Definição individual de portas como **Trunk (Tagged)**, **Access (Untagged)** ou **Hybrid (Misto)**.
  - Tabela dinâmica de VLANs com **Inter-VLAN Routing (Gateways L3 na Bridge)** e servidores DHCP dedicados por VLAN.
  - Matriz visual interativa de portas x VLANs com status Tagged (**T**) e Untagged (**U**).
- 🛡️ **Firewall Stateful Best Practices:**
  - Regras otimizadas `Input` e `Forward` com **FastTrack (HW Offloaded)**.
  - Proteção automática contra ataques **Brute-Force** (SSH/Winbox com blacklist temporária).
  - Bloqueio de **Bogons (RFC 1918)** na WAN e regras RAW de descarte antecipado.
- 🌐 **IPv6 Nativo:**
  - DHCPv6 Client com **Prefix Delegation (PD)**.
  - SLAAC (Stateless Address Autoconfiguration) e Neighbor Discovery (ND).
  - Firewall IPv6 completo com suporte obrigatório a ICMPv6.
- 🌗 **Modo Claro & Escuro (Dark/Light):** Design moderno com glassmorphism, suporte a alternância instantânea de tema e persistência no `localStorage`.
- 📋 **Preview & Exportação:** Syntax highlighting em tempo real, botão de cópia rápida para clipboard e download direto do arquivo de script `.rsc`.

---

## 📁 Estrutura do Projeto

```text
MKConfigure/
├── index.html                  # Interface principal da aplicação
├── .gitignore                  # Arquivo de exclusão do Git
├── README.md                   # Documentação do projeto
├── css/
│   └── index.css               # Design System completo (Dark & Light)
└── js/
    ├── presets.js               # Especificações dos modelos MikroTik
    ├── validator.js             # Validador de IPs, CIDR, portas e sintaxe
    ├── scriptBuilder.js         # Montador do script RouterOS + Syntax Highlighting
    ├── app.js                   # Controlador de estado, navegação e eventos
    └── modules/                 # Módulos de configuração independentes
        ├── identity.js          # Identidade, Timezone, NTP e Segurança
        ├── interfaces.js        # Alocação de portas (WAN/Bridge)
        ├── bridge.js            # Bridge VLAN Filtering (Trunk/Access/VLANs)
        ├── wan.js               # Multi-WAN, Failover, ECMP e PCC
        ├── lan.js               # Endereçamento LAN e Servidor DHCP
        ├── dns.js               # Servidores DNS e Cache
        ├── firewall.js          # Firewall IPv4 (Filtro e RAW)
        ├── nat.js               # Masquerade, src-nat e Port Forwarding
        ├── ipv6.js              # IPv6 PD, SLAAC e Firewall IPv6
        └── extras.js            # Syslog, SNMP, Backup e Simple Queues
```

---

## 🚀 Como Utilizar

1. Clone o repositório ou faça o download dos arquivos:
   ```bash
   git clone https://github.com/SEU_USUARIO/MKConfigure.git
   ```
2. Abra o arquivo `index.html` diretamente em qualquer navegador moderno (Chrome, Edge, Firefox, Safari, Brave).
3. Selecione o modelo do seu MikroTik e preencha as configurações desejadas nas abas laterais.
4. Clique em **"Copiar Script Completo"** ou **"Download .rsc"**.
5. No terminal do MikroTik RouterOS (via Winbox ou SSH), cole os comandos ou importe o arquivo `.rsc` via:
   ```routeros
   /import file-name=mikrotik-config.rsc
   ```

---

## 🔒 Segurança e Privacidade

- Todo o processamento ocorre **localmente no navegador do usuário**.
- Nenhuma informação, IP, credencial ou dado de rede é transmitido para servidores externos.
- Os scripts gerados seguem o princípio de segurança defensiva (*Default Deny* na WAN e proteção de serviços administrativos).

---

## 📄 Licença

Distribuído sob a licença MIT. Consulte `LICENSE` para mais detalhes.
