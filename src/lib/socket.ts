/**
 * Helper to emit socket events from Next.js API routes.
 * The Socket.io server is stored globally in server.js.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function emitSocket(event: string, data: any) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const io = (global as any).__socket_io;
    if (io) {
      io.emit(event, data);
    }
  } catch {
    // Socket not available (e.g. during build)
  }
}
