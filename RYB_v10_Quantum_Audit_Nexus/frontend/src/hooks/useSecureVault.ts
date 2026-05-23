import { useEffect, useState } from 'react';

interface SecureContext {
  isEncrypted: boolean;
  kyberReady: boolean;
  publicKey: Uint8Array | null;
}

export function useSecureVault() {
  const [ctx, setCtx] = useState<SecureContext>({
    isEncrypted: false,
    kyberReady: false,
    publicKey: null,
  });

  useEffect(() => {
    const init = async () => {
      try {
        // In v10, carichiamo il modulo WASM CRYSTALS-Kyber
        const kyber = await import('@/utils/crypto');
        const keypair = await kyber.generateKeypair();
        setCtx({
          isEncrypted: true,
          kyberReady: true,
          publicKey: keypair.publicKey,
        });
      } catch {
        // Fallback: encryption lato server
        setCtx({ isEncrypted: false, kyberReady: false, publicKey: null });
      }
    };
    init();
  }, []);

  return ctx;
}