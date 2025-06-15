import DS from "@chrisaugu/data-structures";
const { List } = DS;

let l = new List();
l.append("Hello");
console.log(l.toString());

// read more on closure here https://medium.com/deno-the-complete-reference/10-use-cases-of-closures-in-javascript-98fe0eab36db#:~:text=Closures%20have%20numerous%20applications.,event%20handlers%20in%20web%20development.
function createGreeter() {
  function greet() {
    // console.log(`Hello, ${this.name}`);
    // console.log(this);
  }

  const person = { name: "John" };
  greet.call(person);
  // greet.call(this);
  // const greetPerson = greet.bind(person);
  // const greetPerson = greet.bind(this);
  // greetPerson();
  // greet.apply(person, ["hello"]);
  //   greet.apply(this, ["hello"]);
}

// createGreeter();

class Server {
  constructor(args) {
    this.ctx = args.contextType;

    this.showContext = this.showContext.bind(this);
    this.command = this.command.bind(this);
  }

  showContext() {
    console.log(this);
  }

  command(option, callback = () => {}) {
    callback.call(this.ctx, option);
  }
}

class Context {
  db;
  session;
  store;
  bucket;
}

class NewContext extends Context {
  customMethod() {
    return "Hello from custom context";
  }
}

const server = new Server({ contextType: new NewContext() });
// server.showContext();
server.command("custom", (ctx) => {
  console.log(ctx);
});

/**
 *
 * @param {Context} context
 */
function runInContext(context) {
  new Server({ contextType: new NewContext() });
}
