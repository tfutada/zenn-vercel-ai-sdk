import {HfInference} from '@huggingface/inference'
import {HuggingFaceStream, StreamingTextResponse} from 'ai'

import {Tokens} from 'ai/react'

// Optional, but recommended: run on the edge runtime.
// See https://vercel.com/docs/concepts/functions/edge-functions
export const runtime = 'edge'


// Create a new Hugging Face Inference instance
const Hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

interface Message {
    content: string;
    role: "system" | "user" | "assistant";
}

const HF_Model = 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5'

// Build a prompt from the messages
// Note: this is specific to the OpenAssistant model we're using
// @see https://huggingface.co/OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5#prompting
function buildOpenAssistantPrompt(
    messages: Message[]
) {
    return (
        messages
            .map(({content, role}) => {
                if (role === 'user') {
                    return `<|prompter|>${content}<|endoftext|>`
                } else {
                    return `<|assistant|>${content}<|endoftext|>`
                }
            })
            .join('') + '<|assistant|>'
    )
}

export default async function Page({
                                       searchParams
                                   }: {
    // note that using searchParams opts your page into dynamic rendering. See https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional
    searchParams: Record<string, string>
}) {
    const prompt = searchParams['prompt'] ?? 'Give me code for generating a JSX button'
    const messages: Message[] = [
        {content: 'Hello, assistant!', role: 'user'},
        {content: 'How can I assist you today?', role: 'assistant'},
        {content: 'System initializing...', role: 'system'},
        {content: prompt, role: 'user'},
    ];

    const response = Hf.textGenerationStream({
        model: HF_Model,
        inputs: buildOpenAssistantPrompt(messages),
        parameters: {
            max_new_tokens: 200,
            // @ts-ignore (this is a valid parameter specifically in OpenAssistant models)
            typical_p: 0.2,
            repetition_penalty: 1,
            truncate: 1000,
            return_full_text: false
        }
    })

    // Convert the response into a friendly text-stream
    const stream = HuggingFaceStream(response)

    return <Tokens stream={stream}/>
}
