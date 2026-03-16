import { dns } from 'bun';

// const unix = "/var/run/docker.sock";
// const response = await fetch("http://localhost/info", { unix });
// const body = await response.json();
// console.log(body); // { ... }

// const response = await fetch("https://hostname/a/path", {
//   unix: "/var/run/path/to/unix.sock",
//   method: "POST",
//   body: JSON.stringify({ message: "Hello from Bun!" }),
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// const body = await response.json();

// await fetch("https://example.com", {
//   proxy: {
//     url: "https://proxy.example.com:8080",
//     headers: {
//       "Proxy-Authorization": "Bearer my-token",
//       "X-Proxy-Region": "us-east-1",
//     },
//   },
// });

// const server = Bun.serve({
//   fetch: request => new Response("Welcome to Bun!"),
//   tls: {
//     cert: Bun.file("cert.pem"),
//     key: Bun.file("key.pem"),
//     ca: [Bun.file("ca1.pem"), Bun.file("ca2.pem")],
//   },
// });

// dns.prefetch("my.database-host.com", 5432);
// await fetch("https://my.database-host.com");

const socket2 = await Bun.udpSocket({});
console.log(socket2.port); // assigned by the operating system
const socket = await Bun.udpSocket({
  port: 41234
});
console.log(socket.port); // 41234
socket.send('Hello, world!', 41234, '127.0.0.1');

type WebSocketData = {
  createdAt: number;
  token: string;
  userId: string;
  socketId: number;
  authToken: string;
  username: string;
};

Bun.serve({
  port: 3000,
  routes: {
    '/events': (req, server) => {
      // SSE streams are often quiet between events. By default,
      // Bun.serve closes connections after 10 seconds of inactivity.
      // Disable the idle timeout for this request so the stream
      // stays open indefinitely.
      server.timeout(req, 0);

      return new Response(
        async function* () {
          yield `data: connected at ${Date.now()}\n\n`;

          // Emit a tick every 5 seconds until the client disconnects.
          // When the client goes away, the generator is returned
          // (cancelled) and this loop stops automatically.
          while (true) {
            await Bun.sleep(5000);
            yield `data: tick ${Date.now()}\n\n`;
          }
        },
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache'
          }
        }
      );
    },
    '/eventsx': (req, server) => {
      server.timeout(req, 0);

      let timer: Timer;
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(`data: connected at ${Date.now()}\n\n`);

          timer = setInterval(() => {
            controller.enqueue(`data: tick ${Date.now()}\n\n`);
          }, 5000);
        },
        cancel() {
          // Called automatically when the client disconnects.
          clearInterval(timer);
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache'
        }
      });
    }
  },
  fetch(req, server) {
    const cookies = req.headers.get('cookie');
    const token = cookies['X-Token'];
    const username = ''; //getUsernameFromCookies(cookies);
    const authToken = '';
    const user = { id: 'string' };
    const success = server.upgrade(req, {
      data: {
        socketId: Math.random(),
        username,
        authToken,
        createdAt: Date.now(),
        token: token,
        userId: user.id
      }
    });
    if (success) return undefined;

    return new Response('Hello world');
  },
  websocket: {
    perMessageDeflate: true,
    data: {} as WebSocketData,

    open(ws) {
      const msg = `${ws.data.username} has entered the chat`;
      ws.subscribe('the-group-chat');
      server.publish('the-group-chat', msg);
    },
    async message(ws, message) {
      // the server re-broadcasts incoming messages to everyone
      console.log(`Received ${message}`);
      // await saveMessageToDatabase({
      //   message: String(message),
      //   userId: ws.data.userId,
      // });

      // send back a message
      ws.send(`You said: ${message}`, true);
      server.publish('the-group-chat', `${ws.data.username}: ${message}`);
    },
    close(ws) {
      const msg = `${ws.data.username} has left the chat`;
      server.publish('the-group-chat', msg);
      ws.unsubscribe('the-group-chat');
    }
  },
  fetch(req) {
    return new Response(
      // An async generator function
      async function* () {
        yield 'Hello, ';
        await Bun.sleep(100);
        yield 'world!';

        // you can also yield a TypedArray or Buffer
        yield new Uint8Array(['\n'.charCodeAt(0)]);
      },
      { headers: { 'Content-Type': 'text/plain' } }
    );

    return new Response(
      {
        [Symbol.asyncIterator]: async function* () {
          yield 'Hello, ';
          await Bun.sleep(100);
          yield 'world!';
        }
      },
      { headers: { 'Content-Type': 'text/plain' } }
    );
  },
  async fetch(req) {
    const url = new URL(req.url);

    // return index.html for root path
    if (url.pathname === '/') {
      return new Response(Bun.file('index.html'), {
        headers: {
          'Content-Type': 'text/html'
        }
      });
    }

    // parse formdata at /action
    if (url.pathname === '/action') {
      const formdata = await req.formData();
      const name = formdata.get('name');
      const profilePicture = formdata.get('profilePicture');
      if (!profilePicture) throw new Error('Must upload a profile picture.');
      // write profilePicture to disk
      await Bun.write('profilePicture.png', profilePicture);
      return new Response('Success');
    }

    return new Response('Not Found', { status: 404 });
  }
});
