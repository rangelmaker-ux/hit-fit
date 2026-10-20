"use client";

const DB_NAME = 'hitfit_avatars_db';
const DB_VERSION = 1;
const STORE_NAME = 'avatars';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB indisponível neste ambiente.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'profileId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAvatar(profileId: string): Promise<string | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(profileId);

      req.onsuccess = () => {
        resolve(req.result?.dataUrl || null);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function saveAvatar(profileId: string, dataUrl: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put({
      profileId,
      dataUrl,
      updatedAt: new Date().toISOString()
    });

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteAvatar(profileId: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(profileId);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Comprime e centraliza a imagem em um canvas quadrado para tamanho ultra otimizado (<40KB)
 */
export function compressImageFile(file: File, maxDim = 320, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validação de tipos aceitos
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      reject(new Error('Formato não suportado. Utilize imagens JPEG, PNG ou WebP.'));
      return;
    }

    // Limite preventivo de tamanho original de arquivo (máx 15MB)
    if (file.size > 15 * 1024 * 1024) {
      reject(new Error('Arquivo excessivamente grande (máximo 15 MB).'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = maxDim;
        canvas.height = maxDim;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Falha ao processar canvas para compressão da imagem.'));
          return;
        }

        // Centraliza e recorta em proporção 1:1 (crop quadrado perfeito)
        const minSide = Math.min(img.width, img.height);
        const startX = (img.width - minSide) / 2;
        const startY = (img.height - minSide) / 2;

        ctx.drawImage(img, startX, startY, minSide, minSide, 0, 0, maxDim, maxDim);

        // Exporta em WebP com fallback para JPEG
        try {
          const webpData = canvas.toDataURL('image/webp', quality);
          if (webpData.startsWith('data:image/webp')) {
            resolve(webpData);
            return;
          }
        } catch {
          // Fallback seguro para JPEG
        }

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Não foi possível ler os dados da imagem.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Erro ao carregar o arquivo.'));
    reader.readAsDataURL(file);
  });
}

export const compressAndCropAvatar = compressImageFile;
