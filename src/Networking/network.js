/**
 * CCNA Concepts
 */

let frame = {
  dest_mac: "",
  src_mac: "",
};

let packet = {
  layer2: frame,
  layer3: {
    dest_ip: "",
    src_ip: "",
  },
};

/**
 * ipaddress/subnet-mask : interface-id
 */
let route_table = {
  "172.17.3.1/24": "",
};

function PC() {}

function Router() {}

function Switch() {}

function search_route_table(net_addr) {
  if (route_table.includes(net_addr)) {
    console.log("address found");
  }
}

/**
 * Forwards packet when given a next-hop ip address
 */
function forward_ip(dest, src) {}

function drop_packet() {
//   delete packet;
}
