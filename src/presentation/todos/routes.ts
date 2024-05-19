import { Router } from "express";
import { TodosController } from "./controller";
import { TodoDatasourceImpl } from "../../intrastructure/datasource/todo.datasource.impl";
import { TodoRepository } from "../../domain/repositories/todo.repository";
import { TodoRepositoryImpl } from "../../intrastructure/repositories/todo.repository.impl";

export class TodoRoutes {
  static get routes(): Router {
    const router = Router();
    const datasource = new TodoDatasourceImpl();
    const TodoRepository = new TodoRepositoryImpl(datasource);
    const todosController = new TodosController(TodoRepository);

    router.get("/", todosController.getTodos);
    router.get("/:id", todosController.getTodosById);
    router.post("/", todosController.createTodo);
    router.put("/:id", todosController.updateTodo);
    router.delete("/:id", todosController.deleteTodo);

    return router;
  }
}
