const arrayElementCount = (array, elem) => {
  let count = 0
  for (let item of array) {
    if (item === elem) {
      count++
    }
  }

  return count
}

exports.arrayElementCount = arrayElementCount