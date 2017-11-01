const Serializer = require('./index')

const serialize = new Serializer()

// Добавить сериалайзер для User
serialize.add('user', {
  // Фильтрация полей (включая кастомные поля)
  attributes: ['name', 'email', 'email1', 'password', 'photo'], 
  strict: true, 
  // Форматтеры полей
  formatters: { 
    email: (data) => data.email.toLowerCase(),
    // Форматтер, создающий кастомное поле
    email1: (data) => data.email.toUpperCase(),
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

console.log(serialize.user(test_user, { only: ['email', 'safkjhskf'], strict: false }))
// ==>
// { email: 'test@email.com',
//   email1: 'TEST@EMAIL.COM',
//   photo: 
//    [ { url: '/test/path/img1.jpeg' },
//      { url: '/test/path/img2.png' } ],
//   name: 'Tester',
//   password: '12345' }

// Опция only замещает attributes
console.log(serialize.user(test_user, { only: ['email', 'sdljfhksjd'], strict: false }))
// ==>
// { email: 'test@email.com' }

// Опция omit удаляет поля из attributes
console.log(serialize.user(test_user, { omit: ['email'] }))
// ==>
// { email1: 'TEST@EMAIL.COM',
//   photo: 
//    [ { url: '/test/path/img1.jpeg' },
//      { url: '/test/path/img2.png' } ],
//   name: 'Tester',
//   password: '12345' }


// Циклические зависимости
serialize.add('a', {
  attributes: ['b'],
  formatters: {
    b: { $ref: 'b' }
  }
})

serialize.add('b', {
  attributes: ['a'],
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
    b: {
      c: 1340
    }
  },
  c: 1339
}

console.log(serialize.a(test_a))
// => { b: { c: 1338, a: 123 } }
console.log(serialize.b(test_b))
// => { c: 1340, a: { b: 234 } }