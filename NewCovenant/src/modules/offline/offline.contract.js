const QUEUE_KEY = "newcovenant.offline.queue.v1";
const MAX_QUEUE_SIZE = 500;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function cloneValue(value) {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

function readQueue() {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_error) {
    return [];
  }
}

function writeQueue(queueBuffer) {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queueBuffer));
  } catch (_error) {
    // Ignore persistence failures; in-memory queue remains available.
  }
}

export function createOfflineModule() {
  const queueBuffer = readQueue();

  return {
    isOnline() {
      return typeof navigator === "undefined" ? true : navigator.onLine;
    },

    queue(job) {
      const record = {
        id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
        payload: cloneValue(job)
      };

      queueBuffer.push(record);
      if (queueBuffer.length > MAX_QUEUE_SIZE) {
        queueBuffer.splice(0, queueBuffer.length - MAX_QUEUE_SIZE);
      }

      writeQueue(queueBuffer);
      return queueBuffer.length;
    },

    flush() {
      const drained = queueBuffer.splice(0, queueBuffer.length).map((item) => cloneValue(item));
      writeQueue(queueBuffer);
      return drained;
    }
  };
}
