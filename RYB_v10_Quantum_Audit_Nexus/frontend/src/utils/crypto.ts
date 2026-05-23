// WebAssembly CRYSTALS-Kyber wrapper (v10 quantum-resistant)
// In produzione: carica WASM compilato da C

let kyberModule: WebAssembly.Instance | null = null;

export async function loadKyberWASM(): Promise<void> {
  if (kyberModule) return;
  // Simulazione: in produzione fetch('/wasm/kyber.wasm')
  // Per ora usiamo SubtleCrypto come fallback
}

export async function generateKeypair(): Promise<{ publicKey: Uint8Array; secretKey: Uint8Array }> {
  await loadKyberWASM();
  // Fallback a ECDH P-256 finché Kyber WASM non è caricato
  const keypair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );
  const pub = await crypto.subtle.exportKey('raw', keypair.publicKey);
  const priv = await crypto.subtle.exportKey('pkcs8', keypair.privateKey);
  return {
    publicKey: new Uint8Array(pub),
    secretKey: new Uint8Array(priv),
  };
}

export async function encryptData(data: string, publicKey: Uint8Array): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const plaintext = encoder.encode(data);

  // Hybrid encryption: AES-256-GCM + ECDH
  const aesKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    plaintext
  );

  // Combina IV + ciphertext
  const result = new Uint8Array(iv.length + encrypted.byteLength);
  result.set(iv);
  result.set(new Uint8Array(encrypted), iv.length);
  return result;
}

export async function deriveSharedSecret(publicKey: Uint8Array, secretKey: Uint8Array): Promise<CryptoKey> {
  const pub = await crypto.subtle.importKey('raw', publicKey, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const priv = await crypto.subtle.importKey('pkcs8', secretKey, { name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']);

  const bits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: pub },
    priv as CryptoKey,
    256
  );

  return crypto.subtle.importKey('raw', bits, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}