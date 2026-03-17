import dgram from 'node:dgram';
import { setTimeout } from 'node:timers/promises';

// Configuration
const SERVER_PORT = 3333;
const CLIENT_PORT = 3334;
const TARGET_MTU = 1500; // Standard Ethernet MTU
const IP_HEADER_SIZE = 20;
const UDP_HEADER_SIZE = 8;
const MAX_SAFE_UDP_PAYLOAD = TARGET_MTU - IP_HEADER_SIZE - UDP_HEADER_SIZE; // 1472 bytes

class FragmentationDemonstration {
  constructor() {
    this.server = dgram.createSocket('udp4');
    this.client = dgram.createSocket('udp4');
    this.receivedPackets = new Set();
    this.sequenceNumber = 0;
  }

  async setup() {
    // Setup server
    this.server.on('message', (msg, rinfo) => {
      const packetId = msg.readUInt32BE(0);
      const totalPackets = msg.readUInt32BE(4);
      const sequenceNum = msg.readUInt32BE(8);
      const payload = msg.slice(12);

      console.log(
        `[SERVER] Received packet ${sequenceNum + 1}/${totalPackets} (ID: ${packetId}) - Size: ${msg.length} bytes`
      );

      // Send acknowledgment
      const ack = Buffer.alloc(4);
      ack.writeUInt32BE(packetId, 0);
      this.server.send(ack, rinfo.port, rinfo.address);
    });

    this.server.on('error', (err) => {
      console.error(`[SERVER] Error: ${err}`);
    });

    // Setup client
    this.client.on('message', (msg) => {
      if (msg.length === 4) {
        // Acknowledgment
        const packetId = msg.readUInt32BE(0);
        this.receivedPackets.add(packetId);
      }
    });

    // Bind sockets
    await new Promise((resolve) => this.server.bind(SERVER_PORT, resolve));
    await new Promise((resolve) => this.client.bind(CLIENT_PORT, resolve));

    console.log(`[SETUP] Server listening on port ${SERVER_PORT}`);
    console.log(`[SETUP] Client listening on port ${CLIENT_PORT}`);
    console.log(
      `[SETUP] Maximum safe UDP payload (no fragmentation): ${MAX_SAFE_UDP_PAYLOAD} bytes\n`
    );
  }

  async sendPacket(payloadSize, packetId, simulateLoss = false) {
    return new Promise(async (resolve) => {
      // Create packet with header
      const header = Buffer.alloc(12);
      header.writeUInt32BE(packetId, 0); // Packet ID
      header.writeUInt32BE(1, 4); // Total packets (always 1 for this test)
      header.writeUInt32BE(0, 8); // Sequence number within packet

      const payload = Buffer.alloc(payloadSize);
      payload.fill('X'); // Fill with dummy data

      const packet = Buffer.concat([header, payload]);

      console.log(
        `[CLIENT] Sending ${payloadSize} bytes payload (total packet size: ${packet.length} bytes)`
      );

      if (payloadSize > MAX_SAFE_UDP_PAYLOAD) {
        console.log(
          `[CLIENT] ⚠️  This packet WILL fragment (exceeds ${MAX_SAFE_UDP_PAYLOAD} bytes safe limit)`
        );
      } else {
        console.log(`[CLIENT] ✅ This packet will NOT fragment`);
      }

      // Simulate random packet loss for the fragmented packet
      if (simulateLoss && payloadSize > MAX_SAFE_UDP_PAYLOAD) {
        const shouldDrop = Math.random() < 0.3; // 30% chance of loss
        if (shouldDrop) {
          console.log(
            `[CLIENT] 🔥 Simulating packet loss for fragmented packet!`
          );
          await setTimeout(100);
          resolve(false);
          return;
        }
      }

      this.client.send(packet, SERVER_PORT, 'localhost', (err) => {
        if (err) {
          console.error(`[CLIENT] Error sending: ${err}`);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  async waitForAck(packetId, timeoutMs = 1000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      if (this.receivedPackets.has(packetId)) {
        return true;
      }
      await setTimeout(50);
    }
    return false;
  }

  async demonstrateFragmentation() {
    console.log('\n=== DEMONSTRATION 1: Non-fragmented packet ===\n');

    // Test 1: Safe packet size (no fragmentation)
    const safeSize = MAX_SAFE_UDP_PAYLOAD - 100;
    const packetId1 = this.sequenceNumber++;

    await this.sendPacket(safeSize, packetId1);
    const received1 = await this.waitForAck(packetId1);

    console.log(
      `[CLIENT] Safe packet ${received1 ? '✅ ACKNOWLEDGED' : '❌ LOST'}`
    );

    await setTimeout(1000);

    console.log(
      '\n=== DEMONSTRATION 2: Fragmented packet with possible loss ===\n'
    );

    // Test 2: Fragmented packet size (will cause IP fragmentation)
    const fragmentedSize = MAX_SAFE_UDP_PAYLOAD + 500; // Will create 2 IP fragments
    const packetId2 = this.sequenceNumber++;

    console.log(
      `[CLIENT] Sending fragmented packet (size: ${fragmentedSize} bytes)`
    );
    console.log(`[CLIENT] This packet will be split into 2 IP fragments`);

    // Simulate sending fragmented packet with potential loss
    const sent2 = await this.sendPacket(fragmentedSize, packetId2, true);

    if (sent2) {
      const received2 = await this.waitForAck(packetId2);

      if (received2) {
        console.log(
          `[CLIENT] Fragmented packet ✅ ACKNOWLEDGED (all fragments arrived)`
        );
      } else {
        console.log(
          `[CLIENT] Fragmented packet ❌ LOST (one or more fragments were lost)`
        );
        console.log(
          `[CLIENT] Note: When any fragment is lost, the entire datagram is lost!`
        );
      }
    }

    await setTimeout(1000);

    console.log(
      '\n=== DEMONSTRATION 3: Multiple packets with different fragmentation status ===\n'
    );

    // Test 3: Send multiple packets and track success rate
    const results = {
      safe: { sent: 0, received: 0 },
      fragmented: { sent: 0, received: 0 }
    };

    for (let i = 0; i < 10; i++) {
      this.receivedPackets.clear();

      // Send safe packet
      const safeId = this.sequenceNumber++;
      const safeSize_i = MAX_SAFE_UDP_PAYLOAD - 50;
      await this.sendPacket(safeSize_i, safeId, false);
      const safeReceived = await this.waitForAck(safeId);

      results.safe.sent++;
      if (safeReceived) results.safe.received++;

      await setTimeout(100);

      // Send fragmented packet with simulated loss
      const fragId = this.sequenceNumber++;
      const fragSize_i = MAX_SAFE_UDP_PAYLOAD + 300;
      await this.sendPacket(fragSize_i, fragId, true);
      const fragReceived = await this.waitForAck(fragId);

      results.fragmented.sent++;
      if (fragReceived) results.fragmented.received++;

      console.log(`\n--- Trial ${i + 1} results ---`);
      console.log(`Safe packet: ${safeReceived ? '✅' : '❌'}`);
      console.log(`Fragmented packet: ${fragReceived ? '✅' : '❌'}`);

      await setTimeout(500);
    }

    // Summary
    console.log('\n=== FINAL SUMMARY ===');
    console.log(`Safe packets (no fragmentation):`);
    console.log(
      `  Sent: ${results.safe.sent}, Received: ${results.safe.received}`
    );
    console.log(
      `  Success rate: ${((results.safe.received / results.safe.sent) * 100).toFixed(1)}%`
    );

    console.log(`\nFragmented packets:`);
    console.log(
      `  Sent: ${results.fragmented.sent}, Received: ${results.fragmented.received}`
    );
    console.log(
      `  Success rate: ${((results.fragmented.received / results.fragmented.sent) * 100).toFixed(1)}%`
    );

    if (results.fragmented.received < results.fragmented.sent) {
      console.log(
        `\n📉 Notice how fragmented packets have a LOWER success rate!`
      );
      console.log(
        `This demonstrates that when IP fragmentation occurs, the loss of any single fragment results in the loss of the entire datagram.`
      );
    }
  }

  async cleanup() {
    this.server.close();
    this.client.close();
  }
}

async function main() {
  console.log('UDP Fragmentation Demonstration');
  console.log('================================');
  console.log(
    'This script demonstrates why UDP applications should avoid IP fragmentation.'
  );
  console.log(
    'When packets are fragmented, losing any fragment means losing the entire packet.\n'
  );

  const demo = new FragmentationDemonstration();

  try {
    await demo.setup();
    await demo.demonstrateFragmentation();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await demo.cleanup();
    console.log('\nDemo completed. Sockets closed.');
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', async () => {
  console.log('\n\nShutting down...');
  process.exit(0);
});

main();
