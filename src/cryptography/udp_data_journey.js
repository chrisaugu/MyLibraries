import dgram from 'dgram';
import crypto from 'crypto';

class UDPDataJourney {
  constructor() {
    this.messageId = 0;
  }

  // APPLICATION LAYER
  applicationLayer(message) {
    console.log('\n🔵 APPLICATION LAYER (Layer 7)');
    console.log('   Application creates data:');
    console.log(`   Original message: "${message}"`);

    // Convert string to buffer (application data)
    const appData = Buffer.from(message, 'utf8');
    console.log(`   Application data (${appData.length} bytes):`);
    console.log(
      `   Hex: ${appData
        .toString('hex')
        .match(/.{1,2}/g)
        .join(' ')}`
    );
    console.log(`   ASCII: ${appData.toString('ascii')}`);

    return appData;
  }

  // TRANSPORT LAYER - UDP
  udpLayer(data, sourcePort, destPort) {
    console.log('\n🟢 TRANSPORT LAYER (Layer 4) - UDP');
    console.log('   UDP adds its header (8 bytes)');

    // Create UDP header (8 bytes)
    const udpHeader = Buffer.alloc(8);

    // Source Port (2 bytes)
    udpHeader.writeUInt16BE(sourcePort, 0);
    // Destination Port (2 bytes)
    udpHeader.writeUInt16BE(destPort, 2);
    // Length (2 bytes) - UDP header + data
    const udpLength = 8 + data.length;
    udpHeader.writeUInt16BE(udpLength, 4);
    // Checksum (2 bytes) - would be calculated here, set to 0 for simplicity
    udpHeader.writeUInt16BE(0, 6);

    console.log(`   UDP Header (8 bytes):`);
    console.log(`   ┌─────────────────────────────────┐`);
    console.log(
      `   │ Source Port: ${sourcePort} (${sourcePort.toString(16).padStart(4, '0')})          │`
    );
    console.log(
      `   │ Dest Port:   ${destPort} (${destPort.toString(16).padStart(4, '0')})          │`
    );
    console.log(
      `   │ Length:      ${udpLength} (${udpLength.toString(16).padStart(4, '0')})        │`
    );
    console.log(`   │ Checksum:    0x0000              │`);
    console.log(`   └─────────────────────────────────┘`);
    console.log(
      `   Hex: ${udpHeader
        .toString('hex')
        .match(/.{1,2}/g)
        .join(' ')}`
    );

    // Combine UDP header + data
    const udpDatagram = Buffer.concat([udpHeader, data]);
    console.log(`\n   Complete UDP Datagram (${udpDatagram.length} bytes):`);
    console.log(`   [UDP Header (8 bytes)] [Data (${data.length} bytes)]`);
    console.log(
      `   Hex: ${udpDatagram
        .toString('hex')
        .match(/.{1,2}/g)
        .join(' ')}`
    );

    return udpDatagram;
  }

  // INTERNET LAYER - IP
  ipLayer(data, sourceIP, destIP, mtu = 1500) {
    console.log('\n🟡 INTERNET LAYER (Layer 3) - IP');
    console.log('   IP adds its header (20 bytes minimum)');

    const ipTotalLength = 20 + data.length; // 20 bytes IP header + UDP datagram

    // Check if fragmentation is needed
    if (ipTotalLength > mtu) {
      console.log(
        `   ⚠️  Packet size (${ipTotalLength} bytes) exceeds MTU (${mtu} bytes)`
      );
      console.log(`   IP FRAGMENTATION OCCURS!`);
      return this.fragmentIPPacket(data, sourceIP, destIP, mtu);
    }

    // Create IP header (20 bytes minimum, no options)
    const ipHeader = Buffer.alloc(20);

    // Version (4 bits) and IHL (4 bits) - Version 4, header length 5 words (20 bytes)
    ipHeader[0] = 0x45;
    // DSCP and ECN (1 byte)
    ipHeader[1] = 0x00;
    // Total Length (2 bytes) - IP header + UDP datagram
    ipHeader.writeUInt16BE(ipTotalLength, 2);
    // Identification (2 bytes) - for fragmentation
    const identification = this.messageId++;
    ipHeader.writeUInt16BE(identification, 4);
    // Flags (3 bits) and Fragment Offset (13 bits)
    ipHeader.writeUInt16BE(0x4000, 6); // Don't Fragment flag = 0, More Fragments = 0
    // TTL (1 byte)
    ipHeader[8] = 64;
    // Protocol (1 byte) - 17 for UDP
    ipHeader[9] = 17;
    // Header Checksum (2 bytes) - would be calculated
    ipHeader.writeUInt16BE(0, 10);
    // Source IP (4 bytes)
    this.writeIP(ipHeader, sourceIP, 12);
    // Destination IP (4 bytes)
    this.writeIP(ipHeader, destIP, 16);

    console.log(`   IP Header (20 bytes):`);
    console.log(`   ┌─────────────────────────────────────────────────┐`);
    console.log(`   │ Version: 4, IHL: 5 | DSCP: 0 | ECN: 0          │`);
    console.log(
      `   │ Total Length: ${ipTotalLength} (${ipTotalLength.toString(16)})               │`
    );
    console.log(
      `   │ Identification: ${identification} (0x${identification.toString(16).padStart(4, '0')})    │`
    );
    console.log(`   │ Flags: 0x2 (Don't Fragment), Offset: 0          │`);
    console.log(`   │ TTL: 64 | Protocol: UDP (17)                   │`);
    console.log(`   │ Checksum: 0x0000                               │`);
    console.log(`   │ Source IP: ${sourceIP}                         │`);
    console.log(`   │ Dest IP: ${destIP}                             │`);
    console.log(`   └─────────────────────────────────────────────────┘`);

    // Combine IP header + UDP datagram
    const ipPacket = Buffer.concat([ipHeader, data]);
    console.log(`\n   Complete IP Packet (${ipPacket.length} bytes):`);
    console.log(
      `   [IP Header (20 bytes)] [UDP Header (8 bytes)] [Data (${data.length - 8} bytes)]`
    );

    return [ipPacket]; // Return array for consistency (1 packet when no fragmentation)
  }

  // IP FRAGMENTATION
  fragmentIPPacket(udpDatagram, sourceIP, destIP, mtu) {
    const fragments = [];
    const ipHeaderSize = 20;
    const maxFragmentDataSize = Math.floor((mtu - ipHeaderSize) / 8) * 8; // Must be multiple of 8

    console.log(`   Maximum fragment data size: ${maxFragmentDataSize} bytes`);

    let offset = 0;
    const totalDataLength = udpDatagram.length;
    const identification = this.messageId++;

    while (offset < totalDataLength) {
      const isLastFragment = offset + maxFragmentDataSize >= totalDataLength;
      const fragmentDataSize = isLastFragment
        ? totalDataLength - offset
        : maxFragmentDataSize;

      // Create IP header for this fragment
      const ipHeader = Buffer.alloc(20);

      ipHeader[0] = 0x45; // Version 4, IHL 5
      ipHeader[1] = 0x00;

      // Total length (IP header + fragment data)
      const fragmentTotalLength = ipHeaderSize + fragmentDataSize;
      ipHeader.writeUInt16BE(fragmentTotalLength, 2);

      // Identification (same for all fragments)
      ipHeader.writeUInt16BE(identification, 4);

      // Flags and Fragment Offset
      const flags = isLastFragment ? 0 : 0x2000; // More Fragments flag (bit 2)
      const fragmentOffset = offset / 8; // Offset is in 8-byte units
      ipHeader.writeUInt16BE(flags | fragmentOffset, 6);

      ipHeader[8] = 64; // TTL
      ipHeader[9] = 17; // Protocol (UDP)
      ipHeader.writeUInt16BE(0, 10); // Checksum (simplified)
      this.writeIP(ipHeader, sourceIP, 12);
      this.writeIP(ipHeader, destIP, 16);

      // Extract fragment data
      const fragmentData = udpDatagram.slice(offset, offset + fragmentDataSize);

      // Combine header and data
      const fragment = Buffer.concat([ipHeader, fragmentData]);

      console.log(`\n   📦 Fragment ${fragments.length + 1}:`);
      console.log(`      Offset: ${offset} bytes (${offset / 8} units)`);
      console.log(
        `      Size: ${fragmentTotalLength} bytes (IP header ${ipHeaderSize} + data ${fragmentDataSize})`
      );
      console.log(`      More Fragments: ${!isLastFragment}`);
      console.log(
        `      Hex (first 20 bytes): ${fragment
          .slice(0, 20)
          .toString('hex')
          .match(/.{1,2}/g)
          .join(' ')}`
      );

      fragments.push(fragment);
      offset += fragmentDataSize;
    }

    console.log(`\n   Total fragments created: ${fragments.length}`);
    return fragments;
  }

  // Helper to write IP address to buffer
  writeIP(buffer, ip, offset) {
    const parts = ip.split('.').map(Number);
    for (let i = 0; i < 4; i++) {
      buffer[offset + i] = parts[i];
    }
  }

  // NETWORK INTERFACE LAYER (simplified)
  networkInterfaceLayer(ipPackets, interfaceName = 'eth0') {
    console.log('\n🟠 NETWORK INTERFACE LAYER (Layer 2)');
    console.log(`   Interface: ${interfaceName}`);
    console.log('   Adding Ethernet header (14 bytes) + FCS (4 bytes)');

    const frames = [];

    for (let i = 0; i < ipPackets.length; i++) {
      const packet = ipPackets[i];

      // Simplified Ethernet frame
      const ethHeader = Buffer.alloc(14);

      // Destination MAC (6 bytes) - broadcast for simplicity
      ethHeader.fill(0xff, 0, 6);
      // Source MAC (6 bytes) - fake MAC
      Buffer.from([0x00, 0x11, 0x22, 0x33, 0x44, 0x55]).copy(ethHeader, 6);
      // EtherType (2 bytes) - 0x0800 for IPv4
      ethHeader.writeUInt16BE(0x0800, 12);

      // Complete Ethernet frame (without FCS for simplicity)
      const frame = Buffer.concat([ethHeader, packet]);

      console.log(
        `\n   📡 Frame ${i + 1} (${frame.length + 4} bytes with FCS):`
      );
      console.log(`      Dest MAC: FF:FF:FF:FF:FF:FF (broadcast)`);
      console.log(`      Source MAC: 00:11:22:33:44:55`);
      console.log(`      EtherType: 0x0800 (IPv4)`);
      console.log(`      Contains: IP packet (${packet.length} bytes)`);

      frames.push(frame);
    }

    return frames;
  }

  // Complete journey demonstration
  async demonstrateJourney(message, sourcePort, destPort, sourceIP, destIP) {
    console.log('\n' + '='.repeat(80));
    console.log('📨 DATA JOURNEY FROM APPLICATION TO NETWORK');
    console.log('='.repeat(80));

    // Step 1: Application Layer
    const appData = this.applicationLayer(message);

    // Step 2: Transport Layer (UDP)
    const udpDatagram = this.udpLayer(appData, sourcePort, destPort);

    // Step 3: Internet Layer (IP)
    console.log('\n🟡 Checking if fragmentation is needed...');
    const ipPackets = this.ipLayer(udpDatagram, sourceIP, destIP, 1500);

    // Step 4: Network Interface Layer
    const frames = this.networkInterfaceLayer(ipPackets);

    console.log('\n' + '='.repeat(80));
    console.log('✅ DATA IS NOW READY TO BE TRANSMITTED ON THE NETWORK');
    console.log('='.repeat(80));
    console.log('\n📊 Summary:');
    console.log(`   Original message: "${message}" (${appData.length} bytes)`);
    console.log(
      `   After UDP: ${udpDatagram.length} bytes (+8 bytes UDP header)`
    );
    console.log(
      `   After IP: ${ipPackets.reduce((sum, p) => sum + p.length, 0)} bytes total (${ipPackets.length} IP packet(s))`
    );
    console.log(
      `   After Ethernet: ${frames.reduce((sum, f) => sum + f.length, 0)} bytes total (${frames.length} frame(s))`
    );

    if (ipPackets.length > 1) {
      console.log(
        `\n⚠️  Note: Due to fragmentation, this message was split into ${ipPackets.length} IP packets!`
      );
      console.log(`   If any packet is lost, the entire message is lost.`);
    }

    return frames;
  }
}

// Example usage
async function main() {
  const demo = new UDPDataJourney();

  // Example 1: Small message (no fragmentation)
  console.log('\n📝 EXAMPLE 1: Small message (no fragmentation)');
  await demo.demonstrateJourney(
    'Hello UDP!', // message
    12345, // source port
    53, // destination port (DNS)
    '192.168.1.100', // source IP
    '8.8.8.8' // destination IP (Google DNS)
  );

  // Example 2: Large message (causes fragmentation)
  console.log('\n\n' + '📝 EXAMPLE 2: Large message (causes fragmentation)');
  const largeMessage = 'X'.repeat(2000); // 2000 byte message

  await demo.demonstrateJourney(
    largeMessage, // large message
    12345, // source port
    53, // destination port
    '192.168.1.100', // source IP
    '8.8.8.8' // destination IP
  );
}

main().catch(console.error);
