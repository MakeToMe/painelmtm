import { useState, useEffect } from 'react';

interface VisitorState {
  uid: string | null;
  isIdentified: boolean | null;
}

interface VisitorData {
  id: string;
  uid: string;
  isIdentified: boolean;
}

const DB_NAME = 'MTMVisitor';
const STORE_NAME = 'visitor';
const VISITOR_KEY = 'currentVisitor';

export function useVisitorId() {
  const [visitorState, setVisitorState] = useState<VisitorState>({
    uid: null,
    isIdentified: null
  });

  // Função para abrir o banco
  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error);
        reject(request.error);
      };

      request.onupgradeneeded = (event) => {
        console.log('Upgrading IndexedDB...');
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          console.log('Store created:', STORE_NAME);
        }
      };

      request.onsuccess = () => {
        console.log('IndexedDB opened successfully');
        resolve(request.result);
      };
    });
  };

  // Função para ler os dados
  const readVisitorData = async (db: IDBDatabase): Promise<VisitorData | null> => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(VISITOR_KEY);

      request.onerror = () => {
        console.error('Error reading visitor data:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        console.log('Visitor data read:', request.result);
        resolve(request.result);
      };
    });
  };

  useEffect(() => {
    const initializeDB = async () => {
      try {
        const db = await openDB();
        const data = await readVisitorData(db);
        
        if (data) {
          console.log('Setting visitor state:', data);
          setVisitorState({
            uid: data.uid,
            isIdentified: data.isIdentified
          });
        }
      } catch (error) {
        console.error('Error initializing IndexedDB:', error);
      }
    };

    initializeDB();
  }, []);

  const saveVisitorData = async (uid: string, isIdentified: boolean) => {
    console.log('Saving visitor data:', { uid, isIdentified });
    try {
      const db = await openDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      return new Promise<void>((resolve, reject) => {
        const request = store.put({
          id: VISITOR_KEY,
          uid,
          isIdentified
        });

        request.onerror = () => {
          console.error('Error saving visitor data:', request.error);
          reject(request.error);
        };

        request.onsuccess = () => {
          console.log('Visitor data saved successfully');
          setVisitorState({ uid, isIdentified });
          resolve();
        };
      });
    } catch (error) {
      console.error('Error saving visitor data:', error);
      throw error;
    }
  };

  return {
    visitorState,
    saveVisitorData
  };
}
