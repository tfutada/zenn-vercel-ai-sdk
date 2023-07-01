import {OpenAIStream, StreamingTextResponse} from 'ai'
import {Configuration, OpenAIApi} from 'openai-edge'

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)

// IMPORTANT! Set the runtime to edge
// export const runtime = 'edge'

export async function POST(req: Request) {
    // Extract the `messages` from the body of the request
    const {messages} = await req.json()

    console.log(messages)

    try {
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            stream: true,
            messages
        })
        console.log('done')
        // Convert the response into a friendly text-stream
        const stream = OpenAIStream(response)
        // Respond with the stream
        return new StreamingTextResponse(stream)

    } catch (error) {
        console.error('An error occurred while creating the chat completion:', error)
        // Handle the error appropriately in your application
        // For example, you might want to send a response with an error message:
        return new Response(JSON.stringify({error: 'An error occurred while creating the chat completion'}), {status: 500})
    }
}