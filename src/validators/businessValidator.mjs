const businessSchema = {
  name: {
    isLength: {
      options: { min: 5 },
      errorMessage: 'Your business name must have at least 5 characters',
    },
  },
  email: {
    isEmail: {
      errorMessage: 'Please enter a valid email',
    },
  },
  description: {
    isLength: {
      options: { min: 20 },
      errorMessage: 'Your business description must have at least 20 characters',
    },
  },
  country: {
    notEmpty: true
  },
  address: {
    notEmpty: true
  }
}

export default businessSchema