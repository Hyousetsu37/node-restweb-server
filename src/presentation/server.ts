import express, { Router } from "express";
import path from "path";
const port = 3000;

interface Options {
  port: number;
  routes: Router;
  public_path?: string;
}

export class Server {
  private serverListener?: any;
  public readonly app = express();
  private readonly port: number;
  private readonly publicPath: string;
  private readonly routes: Router;

  constructor(options: Options) {
    const { port, routes, public_path = "public" } = options;
    this.port = port;
    this.publicPath = public_path;
    this.routes = routes;
  }

  async start() {
    //*Middlewares
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    //*Routes
    this.app.use(this.routes);

    //*Public Folder
    this.app.use(express.static(this.publicPath));

    this.app.get("*", (req, res) => {
      const indexPath = path.join(
        __dirname + `../../../${this.publicPath}/index.html`
      );
      res.sendFile(indexPath);
      return;
    });

    this.serverListener = this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }

  public close() {
    this.serverListener?.close();
  }
}
