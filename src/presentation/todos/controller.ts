import { Request, Response } from "express";

interface Todo {
  id: number;
  text: string;
  completedAt: Date | null;
}

const todos: Todo[] = [
  { id: 1, text: "Buy milk", completedAt: new Date() },
  { id: 2, text: "Buy bread", completedAt: new Date() },
  { id: 3, text: "Buy butter", completedAt: new Date() },
];

export class TodosController {
  //* Dependency Injection
  constructor() {}
  public getTodos = (req: Request, res: Response) => {
    res.json(todos);
  };

  public getTodosById = (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id))
      return res
        .status(400)
        .json({ error: `ID argument (${req.params.id}) is not a number` });
    const todo = todos.find((todo) => todo.id === id);
    todo
      ? res.json(todo)
      : res.status(404).json({ error: `Todo with id ${id} not found` });
  };

  public createTodos = (req: Request, res: Response) => {
    const { text } = req.body;
    if (!text)
      return res.status(400).json({ error: "Text property is required" });
    const newTodo = {
      id: todos.length + 1,
      text: text,
      completedAt: null,
    };
    todos.push(newTodo);
    res.json(newTodo);
  };

  public updateTodo = (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id))
      return res
        .status(400)
        .json({ error: `ID argument (${req.params.id}) is not a number` });

    const todo = todos.find((todo) => todo.id === id);

    if (!todo)
      return res.status(404).json({ error: `Todo with id ${id} not found` });

    const { text, completedAt } = req.body;
    if (!text)
      return res.status(400).json({ error: "Text property is required" });

    todo.text = text || todo.text;
    completedAt === "null"
      ? (todo.completedAt = null)
      : (todo.completedAt = new Date(completedAt || todo.completedAt));
    res.json(todo);
  };

  public deleteTodo = (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id))
      return res
        .status(400)
        .json({ error: `ID argument (${req.params.id}) is not a number` });
    const indexOfTodoToDelete = todos.findIndex((todo) => todo.id === id);
    if (indexOfTodoToDelete === -1)
      return res.status(404).json({ error: `Todo with id ${id} not found` });
    const deletedTodo = todos.splice(indexOfTodoToDelete, 1);
    res.json(deletedTodo);
  };
}
