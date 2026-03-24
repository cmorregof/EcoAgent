import axios from 'axios';

export interface McpTool {
    name: string;
    description: string;
    inputSchema: any;
}

export class McpClient {
    private url: string;
    private apiKey: string;

    constructor(url: string, apiKey: string) {
        this.url = url;
        this.apiKey = apiKey;
    }

    private async request(method: string, params: any = {}) {
        try {
            const response = await axios.post(this.url, {
                jsonrpc: '2.0',
                id: Date.now(),
                method,
                params
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': this.apiKey
                }
            });

            if (response.data.error) {
                throw new Error(response.data.error.message || JSON.stringify(response.data.error));
            }

            return response.data.result;
        } catch (error: any) {
            if (error.response?.data?.error) {
                throw new Error(`MCP Error: ${error.response.data.error.message}`);
            }
            throw error;
        }
    }

    async listTools(): Promise<McpTool[]> {
        const result = await this.request('tools/list');
        return result.tools || [];
    }

    async callTool(name: string, args: any): Promise<string> {
        const result = await this.request('tools/call', {
            name,
            arguments: args
        });

        if (result.isError) {
            throw new Error(result.content?.map((c: any) => c.text).join('\n') || 'Unknown tool error');
        }

        return result.content
            ?.filter((c: any) => c.type === 'text')
            ?.map((c: any) => c.text)
            ?.join('\n') || '';
    }
}
