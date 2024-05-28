import request from "supertest";
import { testServer } from "../../test-server";
import { prisma } from "../../../src/data/postgres";
import { text } from "stream/consumers";

describe("Todo route testing", () => {
  beforeAll(async () => {
    await testServer.start();
  });
  afterAll(() => {
    testServer.close();
  });
  beforeEach(async () => {
    await prisma.todo.deleteMany();
  });

  const todo1 = { text: "Hello world 1" };
  const todo2 = { text: "Hello world 2" };
  test("Should return TODOs /api/todos", async () => {
    await prisma.todo.createMany({ data: [todo1, todo2] });
    const { body } = await request(testServer.app)
      .get("/api/todos")
      .expect(200);
    expect(body).toBeInstanceOf(Array);
    expect(body.length).toBe(2);
    expect(body[0].text).toBe(todo1.text);
    expect(body[1].text).toBe(todo2.text);
  });

  test("Should return a TODO api/todos/:id", async () => {
    await prisma.todo.createMany({ data: [todo1, todo2] });
    const { body: fullBody } = await request(testServer.app).get(`/api/todos`);
    const { body } = await request(testServer.app)
      .get(`/api/todos/${fullBody[0].id}`)
      .expect(200);
    expect(body).toEqual({
      id: fullBody[0].id,
      text: todo1.text,
      completedAt: null,
    });
  });

  test("Should return a 404 notFound api/todos/:id", async () => {
    const todoId = 999;
    const { body } = await request(testServer.app)
      .get(`/api/todos/${todoId}`)
      .expect(404);
    expect(body).toEqual({ error: `Todo with id ${todoId} not found` });
  });

  test("Should return a new Todo api/todos", async () => {
    const { body } = await request(testServer.app)
      .post("/api/todos")
      .send(todo1)
      .expect(201);

    expect(body).toEqual({
      id: expect.any(Number),
      text: todo1.text,
      completedAt: null,
    });
  });

  test("Should return an error if text is not valid api/todos", async () => {
    const { body } = await request(testServer.app)
      .post("/api/todos")
      .send({})
      .expect(400);

    expect(body).toEqual({ error: "Text property is required" });
  });
  test("Should return an error if text is empty api/todos", async () => {
    const { body } = await request(testServer.app)
      .post("/api/todos")
      .send({ text: "" })
      .expect(400);

    expect(body).toEqual({ error: "Text property is required" });
  });

  test("Should return an updated TODO api/todos/:id", async () => {
    const todo = await prisma.todo.create({ data: todo1 });

    const { body } = await request(testServer.app)
      .put(`/api/todos/${todo.id}`)
      .send({ text: "Hello world updated", completedAt: "2023-10-21" })
      .expect(200);

    expect(body).toEqual({
      id: expect.any(Number),
      text: "Hello world updated",
      completedAt: "2023-10-21T00:00:00.000Z",
    });
  });

  test("Should return a 404 if TODO to update notFound api/todos/:id", async () => {
    const todoId = 999;

    const todo = await prisma.todo.create({ data: todo1 });

    const { body } = await request(testServer.app)
      .put(`/api/todos/${todoId}`)
      .send({ text: "Hello world updated", completedAt: "2023-10-21" })
      .expect(404);
    expect(body).toEqual({ error: `Todo with id ${todoId} not found` });
  });

  test("Should return a 400 if invalid date is sent to update the TODO api/todos/:id", async () => {
    const todo = await prisma.todo.create({ data: todo1 });

    const { body } = await request(testServer.app)
      .put(`/api/todos/${todo.id}`)
      .send({ text: "Hello world updated", completedAt: "2023-10-2393" })
      .expect(400);
    expect(body).toEqual({ error: "CompletedAt must be a valid date" });
  });
  test("Should return a 400 if invalid id is sent to update the TODO api/todos/:id", async () => {
    const todo = await prisma.todo.create({ data: todo1 });

    const { body } = await request(testServer.app)
      .put(`/api/todos/somewid`)
      .send({ text: "Hello world updated", completedAt: "2023-10-2393" })
      .expect(400);
    expect(body).toEqual({ error: "id must be a valid number" });
  });

  test("Should return an updated Todo, updating only the date api/todos/:id", async () => {
    const todo = await prisma.todo.create({ data: todo1 });

    const { body } = await request(testServer.app)
      .put(`/api/todos/${todo.id}`)
      .send({ completedAt: "2023-10-21" })
      .expect(200);
    expect(body).toEqual({
      id: expect.any(Number),
      text: todo.text,
      completedAt: "2023-10-21T00:00:00.000Z",
    });
  });

  test("Should delete todo with Id app/todos/:id", async () => {
    const todo = await prisma.todo.create({ data: todo1 });
    const { body } = await request(testServer.app)
      .delete(`/api/todos/${todo.id}`)
      .expect(200);

    expect(body).toEqual({
      id: expect.any(Number),
      text: todo.text,
      completedAt: null,
    });
  });

  test("Should return a 404 if TODO to delete notFound api/todos/:id", async () => {
    const todoId = 999;

    const todo = await prisma.todo.create({ data: todo1 });

    const { body } = await request(testServer.app)
      .delete(`/api/todos/${todoId}`)
      .expect(404);

    expect(body).toEqual({ error: `Todo with id ${todoId} not found` });
  });
});
