# serializer
Serializer for Node.js
```js
import Serializer from 'serializer'

const serialize = new Serializer()

// Add a serializer for User
serialize.add('user', {
  // Field filtering (including custom fields)
  attributes: ['name', 'email', 'email1', 'password', 'photo'],
  // Strictly check the existence of the fields of the formatted object
  strict: true,
  // Field Formatters
  formatters: {
    email: (data) => data.email.toLowerCase (),
    // The formatter that creates a custom field
    // The second argument is passed options
    email1: (data, options) => data.email.toUpperCase(),
    // The third argument is serialized data
    email2: (data, options, serialized) => serialized.email1,
    // Link to the serializer photo
    photo: { $ref: 'photo' }
  }
})

serialize.add('testGetters', {
  attributes: ['gallery'],
  formatters: {
    // Formatter can have getter function for data extraction
    gallery: { $ref: 'photo', getter: (data) => data.testPhotos.map(el => el.photo) }
  }
})

serialize.add('photo', {
  attributes: ['url'],
  formatters: {
    url: (data) => `${data.path}.${data.type}`
  }
})

// If you want to add all fields of object with some formatters and don't want to 
// write all fields in attributes option, you can use extraAttributes option.
serialize.add('userThroughExtraAttributes', {
  extraAttributes: ['email1', 'email2'],
  formatters: {
    email1: (data, options) => data.email.toUpperCase(),
    email2: (data, options, serialized) => serialized.email1
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
//   [{ url: '/test/path/img1.jpeg' },
//    { url: '/test/path/img2.png' }],
// name: 'Tester',
// password: '12345' }

// For the array it works identically
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
// [{ email: 'test@email.com',
//    email1: 'TEST@EMAIL.COM',
//    photo: [[Object], [Object]],
//    name: 'Tester1',
//    password: '12345'},
//  { email: 'test2@gmail.com',
//    email1: 'TEST2@GMAIL.COM',
//    photo: [[Object], [Object]],
//    name: 'Tester2',
//    password: '12345678' }]
```

### Options

```js
// The only option replaces the attributes in the schema
serialize.user(test_user, {
  only: ['email']
})
// ==>
// { email: 'test@email.com' }

// omit option removes fields from attributes
serialize.user(test_user, {
  omit: ['email']
})
// ==>
// { email1: 'TEST@EMAIL.COM',
//   photo:
//   [{ url: '/test/path/img1.jpeg' },
//    { url: '/test/path/img2.png' }],
//   name: 'Tester',
//   password: '12345' }

// The strict option replaces strict in the serializer
serialize.user(test_user, {
  only: ['email', 'undefined_attribute'],
  strict: false
})
// ==>
// { email: 'test@email.com' }

// You can also pass options to the link to the serializer
// The passParent option allows you to pass the parent to the child serializer in the options.parent field.
{
// ...
  photo: { $ref: 'photo', options: { only: ['url'], passParent: true } }
// ...
}

```

### Cyclic dependencies

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
