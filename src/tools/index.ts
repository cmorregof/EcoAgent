export interface BaseTool {
    name: string;
    description: string;
    parameters: any;
    execute: (args: any) => Promise<string> | string;
}

export const tools = new Map<string, BaseTool>();

export const registerTool = (tool: BaseTool) => {
    tools.set(tool.name, tool);
};

export const executeTool = async (name: string, args: any): Promise<string> => {
    const tool = tools.get(name);
    if (!tool) {
        return `Error: Herramienta '${name}' no encontrada.`;
    }
    try {
        return await tool.execute(args);
    } catch (e: any) {
        return `Error ejecutando la herramienta: ${e.message}`;
    }
};

export const getToolsForLLM = () => {
    return Array.from(tools.values()).map(t => ({
        type: 'function',
        function: {
            name: t.name,
            description: t.description,
            parameters: t.parameters
        }
    }));
};

// Importar y registrar herramientas por defecto
import { getCurrentTimeTool } from './get_current_time.js';
import { listGmailMessagesTool } from './gmail.js';
import { listCalendarEventsTool } from './calendar.js';
import { listDriveFilesTool } from './drive.js';
import { getStochasticRiskTool } from './stochastic_risk.js';
import { McpClient } from './mcp_client.js';
import { config } from '../config/index.js';

registerTool(getCurrentTimeTool);
registerTool(listGmailMessagesTool);
registerTool(listCalendarEventsTool);
registerTool(listDriveFilesTool);
registerTool(getStochasticRiskTool);

export const initializeRemoteTools = async () => {
    const { stitch } = config.mcp;
    
    if (stitch.url && stitch.apiKey) {
        console.log(`[MCP] Conectando a Google Stitch en ${stitch.url}...`);
        try {
            const client = new McpClient(stitch.url, stitch.apiKey);
            const mcpTools = await client.listTools();
            
            for (const tool of mcpTools) {
                registerTool({
                    name: tool.name,
                    description: tool.description,
                    parameters: tool.inputSchema,
                    execute: async (args: any) => {
                        return await client.callTool(tool.name, args);
                    }
                });
                console.log(`[MCP] Herramienta registrada: ${tool.name}`);
            }
        } catch (error: any) {
            console.error(`[MCP] Error inicializando herramientas de Stitch: ${error.message}`);
        }
    }
};
