'use client'

import {useChat} from 'ai/react'

export default function Chat() {
    // change the index to switch between the different APIs. ex. 0, 1, 2
    const api = ["/api-openai", "/api-huggingface", "/api/anthropic"][0]

    const {messages, input, handleInputChange, handleSubmit} = useChat({api})

    console.log(input)
    console.log(messages)

    return (
        <div className="mx-auto w-full max-w-md py-24 flex flex-col stretch">
            {messages.map(m => (
                <div key={m.id}>
                    {m.role === 'user' ? 'User: ' : 'AI: '}
                    {m.content}
                </div>
            ))}

            <form onSubmit={handleSubmit}>
                <label>
                    Say something...
                    <input
                        className="fixed w-full max-w-md bottom-0 border border-gray-300 rounded mb-8 shadow-xl p-2 text-black"
                        value={input}
                        onChange={handleInputChange}
                    />
                </label>
                <button className="text-white bg-blue-500" type="submit">Send</button>
            </form>
        </div>
    )
}