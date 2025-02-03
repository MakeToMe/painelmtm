export class VisitorStorage {
  private readonly DB_NAME = 'mtm-visitor-store';
  private readonly STORE_NAME = 'visitor-data';
  private db: IDBDatabase | null = null;

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
      };
    });
  }

  async getVisitorUID(): Promise<string | null> {
    await this.initDB();
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve(null);

      const transaction = this.db.transaction(this.STORE_NAME, 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get('uid');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async saveVisitorUID(uid: string): Promise<void> {
    await this.initDB();
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));

      const transaction = this.db.transaction(this.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.put(uid, 'uid');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}
