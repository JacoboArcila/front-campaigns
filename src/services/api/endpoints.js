const endpoints = {
  AUTH: {
    login: '/auth/login',
    register: '/auth/register',
  },
  PRODUCTS: {
    get: (item) => `/products/${item}`,
  },
};

export default endpoints;
