"use client";

import {useRef, useState} from "react";
import {useClientOnce} from "wizecore-hooks";


const listenSSE = (callback: (event: MessageEvent<any>) => { cancel?: true } | undefined) => {
    const eventSource = new EventSource("/api-server-sent-event", {
        withCredentials: true,
    });
    console.info("Listening on SEE", eventSource);
    eventSource.onmessage = (event) => {
        const result = callback(event);
        if (result?.cancel) {
            console.info("Closing SSE");
            // eventSource.close();
        }
    };

    return {
        close: () => {
            console.info("Closing SSE");
            eventSource.close();
        },
    };
};

//
export default function Home() {
    const [events, setEvents] = useState<string[]>([]);
    const [data, setData] = useState<any>();
    const ref = useRef<HTMLDivElement>(null);

    useClientOnce(() => {
        let r: { close: () => void } | undefined = undefined;
        r = listenSSE((event) => {
            const str = event.data as string;
            console.log(str, '\n');
            setEvents((events) => [...events, event.data]);

            if (str.startsWith("{") && str.endsWith("}")) {  // terminate condition
                return {cancel: true};
            }

            return undefined;
        });
    });

    //
    return (
        <main className="m-4 flex flex-col gap-2 justify-center items-center w-[100vw]">
            <h1 className="my-4 text-lg font-medium">Server Side Events</h1>
            <div ref={ref} className="my-4">
                {events.map((event, index) => (
                    <div key={index}>{event}</div>
                ))}
            </div>
        </main>
    )
}

