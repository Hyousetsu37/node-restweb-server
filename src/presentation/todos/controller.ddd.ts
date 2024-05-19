import { Request, Response } from "express";
import { prisma } from "../../data/postgres";
import { CreateTodoDto } from "../../domain/dtos/todos/create-todo.dto";
import { UpdateTodoDto } from "../../domain/dtos";
import { TodoRepository } from "../../domain";

export class TodosController {
  //* Dependency Injection
  constructor(private readonly todoRepository: TodoRepository) {}
  public getTodos = async (req: Request, res: Response) => {
    const todos = await this.todoRepository.getAll();
    res.json(todos);
  };

  public getTodosById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
      const todo = this.todoRepository.findById(id);
      res.json(todo);
    } catch (error) {
      res.send(400).json({ error });
    }
  };

  public createTodo = async (req: Request, res: Response) => {
    const [error, createTodoDto] = CreateTodoDto.create(req.body);
    if (error) return res.status(400).json({ error });

    if (createTodoDto) {
      const todo = await this.todoRepository.create(createTodoDto);
      res.json(todo);
    }
  };

  public updateTodo = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const [error, updateTodoDto] = UpdateTodoDto.create({ ...req.body, id });
    if (error) return res.status(400).json({ error });

    if (updateTodoDto) {
      const updatedTodo = await this.todoRepository.updateById(updateTodoDto);
      res.json(updatedTodo);
    }
  };

  public deleteTodo = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const deletedTodo = await this.todoRepository.deleteById(id);
    res.json(deletedTodo);
  };
}
