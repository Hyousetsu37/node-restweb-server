import { Request, Response } from "express";
import { prisma } from "../../data/postgres";
import { CreateTodoDto } from "../../domain/dtos/todos/create-todo.dto";
import { UpdateTodoDto } from "../../domain/dtos";

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
  public getTodos = async (req: Request, res: Response) => {
    const todos = await prisma.todo.findMany();
    res.json(todos);
  };

  public getTodosById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id))
      return res
        .status(400)
        .json({ error: `ID argument (${req.params.id}) is not a number` });
    const todo = await prisma.todo.findFirst({ where: { id } });
    todo
      ? res.json(todo)
      : res.status(404).json({ error: `Todo with id ${id} not found` });
  };

  public createTodo = async (req: Request, res: Response) => {
    const [error, createTodoDto] = CreateTodoDto.create(req.body);
    if (error) return res.status(400).json({ error });

    const todo = await prisma.todo.create({
      data: createTodoDto!,
    });

    res.json(todo);
  };

  public updateTodo = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const [error, updateTodoDto] = UpdateTodoDto.create({ ...req.body, id });
    if (error) return res.status(400).json({ error });
    // if (isNaN(id))
    //   return res
    //     .status(400)
    //     .json({ error: `ID argument (${req.params.id}) is not a number` });

    const todo = await prisma.todo.findFirst({ where: { id } });

    if (!todo)
      return res.status(404).json({ error: `Todo with id ${id} not found` });

    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: updateTodoDto!.values,
    });

    res.json(updatedTodo);
  };

  public deleteTodo = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id))
      return res
        .status(400)
        .json({ error: `ID argument (${req.params.id}) is not a number` });

    const deletedTodo = await prisma.todo.delete({ where: { id } });

    if (!deletedTodo)
      return res.status(404).json({ error: `Todo with id ${id} not found` });
    res.json(deletedTodo);
  };
}
