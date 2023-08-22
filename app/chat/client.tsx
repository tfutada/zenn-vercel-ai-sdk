'use client'

import {useChat} from 'ai/react'

export default function Chat() {
    // change the index to switch between the different APIs. ex. 0, 1, 2, 3
    const api = ["/api-openai", "/api-huggingface", "/api-anthropic", "/api-replicate"][0]

    const {messages, input, handleInputChange, handleSubmit} = useChat({api})

    console.log(input)
    console.log(messages)

    return (
        <>
            <div className="mx-auto w-full max-w-md py-24 flex flex-col stretch">
                {messages.map(m => (
                    <div key={m.id}>
                        {m.role === 'user' ? 'User: ' : 'AI: '}
                        {m.content}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="fixed bottom-0 flex flex-col w-5/6 ml-3 mb-8">
                    <label htmlFor="userMessage">Say something:</label>
                    <div className="flex">
                        <input
                            id="userMessage"
                            className="grow border border-gray-300 rounded shadow-xl p-2 text-blue-800"
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Type your message here..."
                        />
                        <button className="text-white bg-blue-500 flex-none w-30 h-14 ml-1 rounded p-2" type="submit">Send</button>
                    </div>
                </div>
            </form>

        </>
    )
}