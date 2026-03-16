#!/bin/sh
# Create message to be encrypted
echo "Creating message file"
echo "---------------------"
echo "My secret message" > message.txt
echo "done\n"

# Create asymmetric keypair
echo "Creating asymmetric key pair"
echo "----------------------------"
openssl genrsa -out private.pem 1024
openssl rsa -in private.pem -out public.pem -pubout
echo "done\n"

# Encrypt with public & decrypt with private
echo "Public key encrypts and private key decrypts"
echo "--------------------------------------------"
openssl pkeyutl -encrypt -inkey public.pem -pubin -in message.txt         -out message_enc_pub.ssl
openssl pkeyutl -decrypt -inkey private.pem       -in message_enc_pub.ssl -out message_pub.txt
xxd message_enc_pub.ssl # Print the binary contents of the encrypted message
cat message_pub.txt # Print the decrypted message
echo "done\n"

# Encrypt with private & decrypt with public
echo "Private key encrypts and public key decrypts"
echo "--------------------------------------------"
openssl pkeyutl -sign    -inkey private.pem -in message.txt          -out message_enc_priv.ssl
openssl pkeyutl -inkey public.pem -pubin    -in message_enc_priv.ssl -out message_priv.txt
xxd message_enc_priv.ssl
cat message_priv.txt
echo "done\n"

openssl pkeyutl -sign -in message.txt -inkey private.pem -out signature.bin
openssl pkeyutl -verify -in message.txt -sigfile signature.bin -inkey public.pem -pubin
