import { createServer } from "node:http";
import { join } from "node:path";
import { hostname } from "node:os";
import wisp from "wisp-server-node";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";

// static paths
const publicPath = join(process.cwd(), "static");
const uvPath = join(process.cwd(), "uv");
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";

const fastify = Fastify({
	serverFactory: (handler) => {
		return createServer()
			.on("request", (req, res) => {
				handler(req, res);
			})
			.on("upgrade", (req, socket, head) => {
				if (req.url.endsWith("/wisp/")) wisp.routeRequest(req, socket, head);
				else socket.end();
			});
	},
});

fastify.register(fastifyStatic, {
	root: publicPath,
	decorateReply: true,
});

fastify.get("/uv/uv.config.js", (req, res) => {
	return res.sendFile("uv/uv.config.js", publicPath);
});

fastify.post('/gpt/', {
	schema: {
	  body: {
		type: 'object',
		properties: {
		  body: { type: 'string' },
		},
		required: ['body'],
	  },
	},
  }, async (request, reply) => {
	const { body } = request.body;
  
	try {
	  const response = await fetch('https://chatgpt4online.org/wp-json/mwai-ui/v1/chats/submit', {
		method: 'POST',
		headers: {
		  Accept: "text/event-stream",
		  "Content-Type": "application/json",
		  DNT: "1",
		  Referer: "https://chatgpt4online.org/",
		  "Sec-CH-UA": '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
		  "Sec-CH-UA-Mobile": "?0",
		  "Sec-CH-UA-Platform": '"macOS"',
		  "User-Agent":
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
		  "X-WP-Nonce": "7b1062963e",
		},
		body: JSON.stringify({
		  botId: "default",
		  customId: null,
		  session: "N/A",
		  chatId: "xru060vkrqf",
		  contextId: 58,
		  messages: [],
		  newMessage: body,
		  newFileId: null,
		  stream: true,
		}),
	  });
  
	  if (!response.ok) {
		throw new Error(`HTTP error! Status: ${response.status}`);
	  }
  
	  // Handle the SSE stream
	  const reader = response.body.getReader();
	  const decoder = new TextDecoder();
  
	  let aggregatedResponse = "";
  
	  while (true) {
		const { done, value } = await reader.read();
		if (done) break;
  
		const chunk = decoder.decode(value, { stream: true });
		chunk.split('\n').forEach((line) => {
		  if (line.startsWith('data: ')) {
			const eventData = line.slice(6); // Remove 'data: ' prefix
			try {
			  const parsedData = JSON.parse(eventData);
  
			  if (parsedData.type === 'live') {
				// Aggregate 'live' chunks
				aggregatedResponse += parsedData.data;
			  } else if (parsedData.type === 'end') {
				// Finalize with 'end' chunk
				const endData = JSON.parse(parsedData.data);
				reply.send({ response: endData.reply });
			  }
			} catch (error) {
			  console.error('Error parsing event data:', error);
			}
		  }
		});
	  }
	} catch (error) {
	  console.error('Error:', error);
	  reply.code(500).send({ error: 'Failed to process the request' });
	}
  });
  
  

fastify.register(fastifyStatic, {
	root: uvPath,
	prefix: "/staff/",
	decorateReply: false,
});

fastify.register(fastifyStatic, {
	root: epoxyPath,
	prefix: "/epoxy/",
	decorateReply: false,
});

fastify.register(fastifyStatic, {
	root: baremuxPath,
	prefix: "/baremux/",
	decorateReply: false,
});

fastify.server.on("listening", () => {
	const address = fastify.server.address();

	// by default we are listening on 0.0.0.0 (every interface)
	// we just need to list a few
	console.log("Helium is listening on:");
	console.log(`\thttp://localhost:${address.port}`);
	console.log(`\thttp://${hostname()}:${address.port}`);
	console.log(
		`\thttp://${
			address.family === "IPv6" ? `[${address.address}]` : address.address
		}:${address.port}`
	);
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
	console.log("SIGTERM signal received: closing HTTP server");
	fastify.close();
	process.exit(0);
}

let port = parseInt(process.env.PORT || "");

if (isNaN(port)) port = 8080;

fastify.listen({
	port: port,
	host: "0.0.0.0",
});
