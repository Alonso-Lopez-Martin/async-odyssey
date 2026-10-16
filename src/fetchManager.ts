// CORRECCIÓN: Encapsulamos el control de peticiones, abortos, timeouts y race conditions.
export class FetchManager {
  private currentController: AbortController | null = null;
  private currentRequestId = 0;

  public startRequest(timeoutMs: number = 8000) {
    if (this.currentController) {
      this.currentController.abort();
    }
    
    this.currentController = new AbortController();
    const reqId = ++this.currentRequestId;
    const signal = this.currentController.signal;

    // Timeout nativo. Si salta, aborta el controller.
    const timeoutId = setTimeout(() => {
      this.currentController?.abort("TIMEOUT");
    }, timeoutMs);

    return { reqId, signal, timeoutId };
  }

  public isCurrent(reqId: number): boolean {
    return this.currentRequestId === reqId;
  }

  public finishRequest(timeoutId: number) {
    // CORRECCIÓN: El clearTimeout siempre se llama de forma segura al terminar
    clearTimeout(timeoutId);
  }
}