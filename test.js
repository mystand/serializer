const Serializer = require('./')

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

serialize.add('test', {
  attributes: ['test', 'qwe', 'test123'],
  formatters: {
    test123: (data) => data.test + data.qwe
  }
})

serialize.add('testGetters', {
  attributes: ['gallery'],
  formatters: {
    // Formatter can have getter function for data
    gallery: { $ref: 'photo', getter: (data) => data.testPhotos.map(el => el.photo) }
  }
})

serialize.add('photo', {
  attributes: ['url', 'test'],
  formatters: {
    url: (data) => `${data.path}.${data.type}`,
    test: { $ref: 'test' }
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
    type: 'jpeg',
    test: {
      test: '12sdfsdf345',
      qwe: 'qwe463'
    }
  }, null]
}

console.log(serialize.user(test_user).photo[0])
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
    type: 'jpeg',
    test: {
      test: '12345',
      qwe: 'qwe463'
    }
  }, {
    path: '/test/path/img2',
    type: 'png',
    test: {
      test: '123',
      qwe: 'qwe'
    }
  }]
}, {
  name: 'Tester2',
  email: 'test2@gmail.com',
  password: '12345678',
  photo: [{
    path: '/test/path/img3',
    type: 'gif',
    test: {
      test: '123',
      qwe: 'qwe'
    }
  }, {
    path: '/test/path/img4',
    type: 'png',
    test: {
      test: '123',
      qwe: 'qwe'
    }
  }]
}, null]

console.log('===================================')
console.log(serialize.user(test_users))
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


const galleryWithGettersValues = [
  {
    testPhotos: [
      {
        photo: {
          path: '/test/path/img3',
          type: 'gif',
          test: {
            test: '123',
            qwe: 'qwe'
          }
        }
      },
      {
        photo: {
          path: '/test/path/img4',
          type: 'png',
          test: {
            test: '123',
            qwe: 'qwe'
          }
        }
      }
    ]
  },
  {
    testPhotos: [
      {
        photo: {
          path: '/test/path/img31337',
          type: 'gif1337',
          test: {
            test: '1231337',
            qwe: 'qwe1337'
          }
        }
      },
      {
        photo: {
          path: '/test/path/img41337',
          type: 'png1337',
          test: {
            test: '1231337',
            qwe: 'qwe1337'
          }
        }
      }
    ]
  }
]

console.log('===================================')
console.log(serialize.testGetters(galleryWithGettersValues).map(el => el.gallery))
// ==>
// [
//   [
//     { url: '/test/path/img3.gif', test: [Object] },
//     { url: '/test/path/img4.png', test: [Object] }
//   ],
//   [
//     { url: '/test/path/img31337.gif1337', test: [Object] },
//     { url: '/test/path/img41337.png1337', test: [Object] }
//   ]
// ]
