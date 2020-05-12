export function sumProducts (_products, config = {}) {
  const { filters } = config
  let products = _products.filter(product => filter(product, filters))
  let resPlaceholder = {
    total: {
      beforeDiscount: 0,
      afterDiscount: 0,
      afterTaxes: 0,
    },
    taxes: 0,
    discount: 0,
  }

  function filter (product, filters) {
    let response = true
    for (let key in filters) {
      let clone = JSON.parse(JSON.stringify(product.product))
      const props = key.split('.')
      const value = props.reduce((acc, prop) => acc[prop], clone)
      if (Array.isArray(filters[key]) && filters[key].indexOf(value) == -1) {
        response = false
      }
      if (typeof filters[key] == 'string' && filters[key] != value) {
        response = false
      }
    }
    return response
  }

  return products.reduce((acc, item) => {
    const taxRate = item.taxRate
    const price = item.product.price
    const quantity = item.quantity
    const discountRate = item.discountRate

    const beforeDiscount = price * quantity
    const afterDiscount = beforeDiscount - (beforeDiscount * (discountRate / 100))
    const afterTaxes = afterDiscount + (afterDiscount * (taxRate / 100))

    acc.total.beforeDiscount += beforeDiscount
    acc.total.afterDiscount += afterDiscount
    acc.total.afterTaxes += afterTaxes
    acc.taxes += (afterDiscount * (taxRate / 100))
    acc.discount += (beforeDiscount * (discountRate / 100))

    return acc
  }, resPlaceholder)
}
