'use client'

import {useChat} from 'ai/react'

export default function Chat() {
    const {messages, input, handleInputChange, handleSubmit} = useChat({api: "/api-ai"})

    console.log(input)
    console.log(messages)

    return (
        <div>
            {messages.map(m => (
                <div key={m.id}>
                    {m.role}: {m.content}
                </div>
            ))}

            <form onSubmit={handleSubmit}>
                <label>
                    Say something...
                    <input
                        value={input}
                        onChange={handleInputChange}
                    />
                </label>
            </form>
        </div>
    )
}