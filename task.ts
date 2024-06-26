import { TMessage, TProvider, TRecipient, TRoute, TTask } from "./types";

// TODO:
  // Реализовать обработчик /message
  // Принимает сообщение, и диcпетчеризирует его.
  // Примеры входного значения можно посмотреть в поле "messages" в data.json, результата - поле "tasks" (задания a-c) и "tasksGroup" (задание d)
  // Декларации типов в файле "./types"
  // Для получения данных можно использовать функции getRecipients, getRoutes, getProviders, объявленные ниже, примеры возращаемых значений - в "data.json"
  // а. payload сообщения должно быть отправлено всем получателям в routes
  //     Нужно по айдишникам получить данные получателей, затем для каждого получателя нужно получить данные маршрутов.
  //     Из каждого маршрута нужно взять адрес и айдишку провайдера.
  //     Вызвать метод /tasks, передать ему в поле tasks массив скомбинированных payload + address, provider
  //     Обработку получателей-групп, заполнение поля type при вызове /tasks можно опустить
  // b. Добавить обработку получателей-групп.
  //     У таких получателей нет собственных маршрутов, но есть дочерние получатели.
  //     При отправке сообщения группе, сообщение должно быть отправлено по маршрутам дочерних получателей.
  //     Могут быть группы, у которых есть еще дочерние группы, вложенность не ограниченна.
  // c. Добавлять при отправке payload поле recipient - имя (name) получателя, которому отправляется сообщение.
  // d. Изменить возращаемый тип на TTaskGroup. При отправке группировать таски по полю type у провайдеров, указанных в маршрутах, и передавать его в метод /tasks
  //     Т.е. Если у получателя есть маршрут на провайдер с типом email, и другой маршрут на провайдер с типом telegram,
  //     должно быть два вызова /tasks - один с type: email и другой c type: telegram
export const createTasks = async (message: TMessage): Promise<TTask[]> => {
  /// ПИСАТЬ КОД ЗДЕСЬ
  return [];
}

// Возращает массив получателей с указанными id (один или несколько)
export const getRecipients = async (ids: string | string[]): Promise<TRecipient[]> => {
  const result = await fetch(`http://localhost:8080/recipients?id=${Array.isArray(ids) ? ids.join(',') : ids}`, {
    headers: { "Content-Type": "application/json" },
  })

  return result.json();
} 

// Возращает массив маршрутов с указанными id (один или несколько)
export const getRoutes = async (ids: string | string[]): Promise<TRoute[]> => {
  const result = await fetch(`http://localhost:8080/routes?id=${Array.isArray(ids) ? ids.join(',') : ids}`, {
    headers: { "Content-Type": "application/json" },
  })

  return result.json();
} 

// Возращает массив получателей с указанными id (один или несколько через запятую)
export const getProviders = async (ids: string | string[]): Promise<TProvider> => {
  const result = await fetch(`http://localhost:8080/providers?id=${Array.isArray(ids) ? ids.join(',') : ids}`, {
    headers: { "Content-Type": "application/json" },
  })

  return result.json();
} 