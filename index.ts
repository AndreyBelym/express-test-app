import express from "express";
import bodyParser from "body-parser";
import fs from "fs/promises";
import { TData, TMessage, TTaskGroup } from "./types";
import { createTasks } from "./task";

process.env.TASKS_CHUNK_SIZE ||= "2";

const loadData = async (): Promise<TData> => {
  const data = await fs.readFile('./data.json');

  return JSON.parse(data.toString());
};

const createApp = (data: TData) => {
  let tasks: TTaskGroup[] = [];

  const app = express();

  app.use(bodyParser.urlencoded({ extended: true }), express.json());

  /***** API для использования *****/
  // http://localhost:8080/recipients?id=XXX
  // http://localhost:8080/recipients?id=XXX,YYY
  // Возращает массив получателей с указанными id (один или несколько через запятую)
  app.get("/recipients", (req, res) => {
    const id = req.query.id;

    if (typeof id === "string") {
      const ids = id.split(",");

      res.json(data.recipients.filter(({ id }) => ids.includes(id)));
    } else {
      res.sendStatus(500);
    }
  });

  // http://localhost:8080/routes?id=XXX
  // http://localhost:8080/routes?id=XXX,YYY
  // Возращает массив маршрутов с указанными id (один или несколько через запятую)
  app.get("/routes", (req, res) => {
    const id = req.query.id;

    if (typeof id === "string") {
      const ids = id.split(",");

      res.json(data.routes.filter(({ id }) => ids.includes(id)));
    } else {
      res.sendStatus(500);
    }
  });

  // http://localhost:8080/providers?id=XXX
  // http://localhost:8080/providers?id=XXX,YYY
  // Возращает массив получателей с указанными id (один или несколько через запятую)
  app.get("/providers", (req, res) => {
    const id = req.query.id;

    if (typeof id === "string") {
      const ids = id.split(",");

      res.json(data.providers.filter(({ id }) => ids.includes(id)));
    } else {
      res.sendStatus(500);
    }
  });

  // POST http://localost:8080/tasks
  // Body: TTaskGroup
  // Отправка группы тасок для дальнейшей обработки
  app.post("/tasks", (req, res) => {
    tasks.push(req.body);
    res.json({ ok: true });
  });

  app.post("/message", async (req, res) => {
    const message: TMessage = req.body;

    await fetch("http://localhost:8080/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(await createTasks(message)),
    });

    res.json({ ok: true });
  });

  app.get("/tasks", (req, res) => {
    res.json(tasks);
  });

  app.get("/", async (req, res) => {
    await fetch("http://localhost:8080/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payload: { text: "Hello World" },
        recipients: ["0", "1"],
      }),
    });

    const result = await fetch("http://localhost:8080/tasks", {
      headers: { "Content-Type": "application/json" },
    });

    res.json(await result.json());

    tasks = [];
  });

  app.listen(8080, () => {
    console.log("Server started on port 8080");
  });
};

loadData().then((data) => createApp(data));
