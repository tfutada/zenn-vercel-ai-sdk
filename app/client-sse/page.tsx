"use client";

import {Inter} from "next/font/google";
import {useRef, useState} from "react";
import {useClientOnce} from "wizecore-hooks";

const inter = Inter({subsets: ["latin"]});

const listenSSE = (callback: (event: MessageEvent<any>) => { cancel?: true } | undefined) => {
    const eventSource = new EventSource("/api-server-sent-event", {
        withCredentials: true,
    });
    console.info("Listening on SEE", eventSource);
    eventSource.onmessage = (event) => {
        const result = callback(event);
        if (result?.cancel) {
            console.info("Closing SSE");
            eventSource.close();
        }
    };

    return {
        close: () => {
            console.info("Closing SSE");
            eventSource.close();
        },
    };
};

const downloadJsonFile = (data: any, filename?: string) => {
    // Creating a blob object from non-blob data using the Blob constructor
    const blob = new Blob([JSON.stringify(data)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    // Create a new anchor element
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "download.json";
    a.click();
    a.remove();
};

export default function Home() {
    const [events, setEvents] = useState<string[]>([]);
    const [data, setData] = useState<any>();
    const ref = useRef<HTMLDivElement>(null);

    useClientOnce(() => {
        let r: { close: () => void } | undefined = undefined;
        r = listenSSE((event) => {
            const str = event.data as string;
            if (str.startsWith("{") && str.endsWith("}")) {
                const obj = JSON.parse(str);
                setData(obj);
                return {cancel: true};
            } else {
                setEvents((events) => [...events, event.data]);
                return undefined;
            }
        });
    });

    return (
        <main className="m-4 flex flex-col gap-2 justify-center items-center w-[100vw]">
            <h1 className="my-4 text-lg font-medium">Parse MAD</h1>
            <div ref={ref} className="my-4">
                {events.map((event, index) => (
                    <div key={index}>{event}</div>
                ))}
            </div>

            <div className={data ? "block my-4" : "invisible my-4"}>
                <button
                    className="px-3 py-2 bg-blue-500 text-white rounded-md"
                    onClick={() => downloadJsonFile(data?.companies, "data.json")}
                >
                    Download
                </button>
            </div>

            <table className="mx-4 w-[80%]">
                <thead className="text-xs font-semibold uppercase text-gray-400 bg-gray-50">
                <tr>
                    <th className="p-3">
                        <div className="font-semibold text-left">Company</div>
                    </th>
                    <th className="p-3">
                        <div className="font-semibold text-left">Category</div>
                    </th>
                    <th className="p-3">
                        <div className="font-semibold text-center">Description</div>
                    </th>
                </tr>
                </thead>

                <tbody className="text-sm divide-y divide-gray-100">
                {data?.companies.map((company: any, index: number) => (
                    <tr key={index}>
                        <td className="p-3">
                            <div className="flex items-center">
                                <div className="w-60 flex-shrink-0 mr-2 sm:mr-3">
                                    <img className="contain" src={company["Processed Logo URL"]} alt="Alex Shatov"/>
                                </div>
                                <div className="font-medium text-gray-800 text-lg">
                                    <a href={company["URL"]}>{company["Company Name"]}</a>
                                </div>
                            </div>
                        </td>
                        <td className="p-3">
                            <div className="text-left font-medium">
                                {company["Category"]} &raquo; {company["Sub Category"]}
                            </div>
                        </td>
                        <td className="p-3">
                            <div className="text-left font-medium max-w-60">{company["Description"]}</div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </main>
    );
}