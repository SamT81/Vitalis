/** Retardo simulado de red de los servicios mock; las pruebas lo ponen en 0. */
export const mockSettings: { delayMs: number } = { delayMs: 800 };

export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
