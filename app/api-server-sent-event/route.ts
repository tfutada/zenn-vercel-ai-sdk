// export const runtime = 'edge'

interface Notify {
    log: (message: string) => void
    complete: (data: any) => void
    error: (err: Error | any) => void
    close: () => void
}

const longRunning = async (notify: Notify) => {
    notify.log("Started")
    notify.log("Done 15%")
    notify.log("Done 35%")
    notify.log("Done 75%")
    notify.complete({data: "My data"})
}

export async function GET() {
    let responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();
    let closed = false;

    longRunning({
        log: (msg: string) => writer.write(encoder.encode("data: " + msg + "\n\n")),
        complete: (obj: any) => {
            writer.write(encoder.encode("data: " + JSON.stringify(obj) + "\n\n"));
            if (!closed) {
                writer.close();
                closed = true;
            }
        },
        error: (err: Error | any) => {
            writer.write(encoder.encode("data: " + err?.message + "\n\n"));
            if (!closed) {
                writer.close();
                closed = true;
            }
        },
        close: () => {
            if (!closed) {
                writer.close();
                closed = true;
            }
        },
    }).then(() => {
        console.info("Done");
        if (!closed) {
            writer.close();
        }
    }).catch((e) => {
        console.error("Failed", e);
        if (!closed) {
            writer.close();
        }
    });

    // Return response connected to readable
    return new Response(responseStream.readable, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "text/event-stream; charset=utf-8",
            Connection: "keep-alive",
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
            "Content-Encoding": "none",
        },
    });
}