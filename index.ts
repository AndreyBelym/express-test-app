import express from "express";
import bodyParser from "body-parser";

process.env.TASKS_CHUNK_SIZE ||= "2";

// TODO:
// 1. Доработать описание типов на основе данных в data.json
type TData = {
  recipients: TRecipient[];
  routes: TRoute[];
  providers: TProvider[];
  messages: TMessage[];
  tasks: TTaskGroup[];
};

// TODO:
// 1а. Доработать типизацию типа TRecipient - получатель.
// Получатели бывают двух видов - пользователи и группы.
// У пользователей есть свойство routes - список связанных айдишников маршрутов для отправки
// У групп есть свойство members - список айдишек пользователей или других групп, входящих в данную группу
type TRecipient = any;

type TRoute = {
  id: string;
  address: string;
  provider: string;
};

type TProvider = {
  id: string;
  name: string;
  type: string;
  options: any;
};

// 2а. Доработать типизацию типов TMessage, TTask, TTaskGroup,
// чтобы свойство payload было строго типизированным (не any),
// но при этом TMessage, TTask, TTaskGroup  можно было переиспользовать с разными вариантами типизации payload
type TMessage = {
  payload: any;
  recipients: string[];
};

type TTask = {
  payload: any & { recipient?: string };
  address: string;
  provider: string;
};

type TTaskGroup = {
  type: string;
  tasks: TTask[];
};

// TODO:
// 2. Реализовать загрузку данных из файла data.json
const loadData = async (): Promise<TData> => {
  return require("./data.json");

  return {
    recipients: [],
    routes: [],
    providers: [],
    messages: [],
    tasks: [],
  };
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

  /***** *****/

  // TODO:
  // 3. Реализовать обработчик /message
  // Тип Body: TMessage
  // Принимает сообщение, и дипетчеризирует его.
  // Примеры можно посмотреть в поле messages в data.json
  // 3а. payload сообщения должно быть отправлено всем получателям в routes
  //     Нужно по айдишникам получить данные получателей, затем для каждого получателя нужно получить данные маршрутов.
  //     Из каждого маршрута нужно взять адрес и айдишку провайдера.
  //     Вызвать метод /tasks, передать ему в поле tasks массив скомбинированных payload + address, provider
  //     Обработку получателей-групп, заполнение поля type при вызове /tasks можно опустить
  // 3b. Добавить обработку получателей-групп.
  //     У таких получателей нет собственных маршрутов, но есть дочерние получатели.
  //     При отправке сообщения группе, сообщение должно быть отправлено по маршрутам дочерних получателей.
  //     Могут быть группы, у которых есть еще дочерние группы, вложенность не ограниченна.
  // 3c. Добавлять при отправке payload поле recipient - имя (name) получателя, которому отправляется сообщение.
  // 3d. При отправке группировать таски по полю type у провайдеров, указанных в маршрутах, и передавать его в метод /tasks
  //     Т.е. Если у получателя есть маршрут на провайдер с типом email, и другой маршрут на провайдер с типом telegram,
  //     должно быть два вызова /tasks - один с type: email и другой c type: telegram
  // 3e. Сделать отправку не более process.env.TASKS_CHUNK_SIZE тасок за раз
  app.post("/message", (req, res) => {
    const message: TMessage = req.body;

    res.json({ ok: true });
  });

  app.get("/tasks", (req, res) => {
    res.json(tasks);
  });

  app.get("/", async (req, res) => {
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

  app.listen(8080, () => {
    console.log("Server started on port 8080");
  });
};

loadData().then((data) => createApp(data));
