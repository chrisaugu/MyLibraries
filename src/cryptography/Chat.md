Client A                    Server                    Client B
   |                           |                          |
   |-- Register public key --->|                          |
   |                           |                          |
   |-- Request B's pub key --->|                          |
   |<-- B's public key --------|                          |
   |                           |                          |
   |-- Encrypted message ----->|-- Store & forward ------>|
   |                           |                          |
   |                           |<-- Acknowledge ----------|