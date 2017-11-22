# serializer
Serializer for Node.js
```js
import Serializer from 'serializer'

const serialize = new Serializer()

// Добавить сериалайзер для User
serialize.add('user', {
  // Фильтрация полей (включая кастомные поля)
  attributes: ['name', 'email', 'email1', 'password', 'photo'],
  // Строгая проверка на существование полей форматируемого объекта
  strict: true, 
  // Форматтеры полей
  formatters: { 
    email: (data) => data.email.toLowerCase(),
    // Форматтер, создающий кастомное поле
    // Вторым аргументом передаются опции
    email1: (data, options) => data.email.toUpperCase(),
    // Третьим аргументом передается сериализованные данные
    email2: (data, options, serialized) => serialized.email1,
    // Ссылка на сериалайзер photo
    photo: { $ref: 'photo' } 
  } 
}) 

serialize.add('photo', { 
  attributes: ['url'], 
  formatters: { 
    url: (data) => `${data.path}.${data.type}` 
  } 
}) 
 
let test_user = { 
  name: 'Tester', 
  email: 'TEST@email.com', 
  password: '12345', 
  photo: [{ 
    path: '/test/path/img1', 
    type: 'jpeg' 
  }, { 
    path: '/test/path/img2', 
    type: 'png' 
  }] 
}

serialize.user(test_user)
// ==>
// { email: 'test@email.com',
//   email1: 'TEST@EMAIL.COM',
//   photo: 
//    [ { url: '/test/path/img1.jpeg' },
//      { url: '/test/path/img2.png' } ],
//   name: 'Tester',
//   password: '12345' }

// Для массива работает идентично
let test_users = [{ 
  name: 'Tester1', 
  email: 'TEST@email.com', 
  password: '12345', 
  photo: [{ 
    path: '/test/path/img1', 
    type: 'jpeg' 
  }, { 
    path: '/test/path/img2', 
    type: 'png' 
  }] 
}, { 
  name: 'Tester2', 
  email: 'test2@gmail.com', 
  password: '12345678', 
  photo: [{ 
    path: '/test/path/img3', 
    type: 'gif' 
  }, { 
    path: '/test/path/img4', 
    type: 'png' 
  }] 
}]
serialize.user(test_users)
// ==>
// [ { email: 'test@email.com',
//     email1: 'TEST@EMAIL.COM',
//     photo: [ [Object], [Object] ],
//     name: 'Tester1',
//     password: '12345' },
//   { email: 'test2@gmail.com',
//     email1: 'TEST2@GMAIL.COM',
//     photo: [ [Object], [Object] ],
//     name: 'Tester2',
//     password: '12345678' } ]
```

### Опции

```js
// Опция only замещает attributes в схеме
serialize.user(test_user, {
  only: ['email']
})
// ==>
// { email: 'test@email.com' }

// Опция omit удаляет поля из attributes
serialize.user(test_user, {
  omit: ['email']
})
// ==>
// { email1: 'TEST@EMAIL.COM',
//   photo: 
//    [ { url: '/test/path/img1.jpeg' },
//      { url: '/test/path/img2.png' } ],
//   name: 'Tester',
//   password: '12345' }

// Опция strict замещает strict в сериалайзере
serialize.user(test_user, {
  only: ['email', 'undefined_attribute'],
  strict: false
})
// ==>
// { email: 'test@email.com' }

// В ссылку на сериалайзер также можно передать опции
// Опция passParent позволяет передать родителя в дочерний сериалайзер в поле options.parent
{
// ...
  photo: { $ref: 'photo', options: { only: ['url'], passParent: true } }
// ...
}

```

### Циклические зависимости

```js
serialize.add('a', {
  attributes: ['b'],
  formatters: {
    b: { $ref: 'b' }
  }
})

serialize.add('b', {
  attributes: ['a', 'c'],
  formatters: {
    a: { $ref: 'a' },
    c: (data) => data.c + 1
  }
})

let test_a = {
  b: {
    a: 123,
    c: 1337
  }
}

let test_b = {
  a: {
    b: 234
  },
  c: 1339
}

serialize.a(test_a)
// => { b: { c: 1338, a: 123 } }
serialize.b(test_b)
// => { c: 1340, a: { b: 234 } }
```
