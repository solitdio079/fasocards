const businessSchema = {
  name: {
    notEmpty: true
  },
  email: {
    isEmail: {
      errorMessage: 'Please enter a valid email',
    },
  },
  description: {
    notEmpty: true
  },
  phone: {
    notEmpty: true,
  },
  country: {
    notEmpty: true,
  },
  address: {
    notEmpty: true,
  },
}

export default businessSchema