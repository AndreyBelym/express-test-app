import express from "express";
import bodyParser from "body-parser";

import data from "./data.json";

type TTask<T = any> = {
  payload: T & { recipientName: string };
  address: string;
  provider: string;
};

type TCreateTaskArgs<T = any> = {
  type?: string;
  tasks: TTask<T>;
};

let tasks: TCreateTaskArgs[] = [];

const app = express();

app.use(bodyParser.urlencoded({ extended: true }), express.json());

app.get("/", async (req, res) => {
  await fetch("http://localhost:8080/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payload: {}, recipients: ["0", "1"] }),
  });

  await fetch("http://localhost:8080/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payload: {}, recipients: ["0", "1"] }),
  });

  const result = await fetch("http://localhost:8080/tasks", {
    headers: { "Content-Type": "application/json" },
  });

  res.json(await result.json());

  tasks = [];
});

app.get("/recipients", (req, res) => {
  const id = req.query.id;

  if (typeof id === "string") {
    const ids = id.split(",");

    res.json(data.recipients.filter(({ id }) => ids.includes(id)));
  } else {
    res.sendStatus(500);
  }
});

app.get("/routes", (req, res) => {
  const id = req.query.id;

  typeof id === "string" ? res.json(data.routes[id]) : res.sendStatus(500);
});

app.post("/tasks", (req, res) => {
  tasks.push(req.body);
  res.json({ ok: true });
});

app.get("/tasks", (req, res) => {
  res.json(tasks);
});

type TMessage = any;

app.post("/message", (req, res) => {
  const message: TMessage = req.body;

  res.json({ ok: true });
});

app.listen(8080, () => {
  console.log("Server started on port 8080");
});
