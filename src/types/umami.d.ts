declare global {
  interface Window {
    umami: {
      track(eventName: string, eventData?: Record<string, string | number | boolean>): void;
      track(eventData: Record<string, string | number | boolean>): void;
    };
  }
  
  const umami: {
    track(eventName: string, eventData?: Record<string, string | number | boolean>): void;
    track(eventData: Record<string, string | number | boolean>): void;
  };
}

export {}; 