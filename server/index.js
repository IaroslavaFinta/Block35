const { client,
  createTables,
  createUser,
  createProduct,
  createFavorite,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  destroyFavorite
} = require('./db');
const express = require('express');
const app = express();

app.get('/api/users', async(req, res, next)=> {
  try {
    res.send(await fetchUsers());
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/products', async(req, res, next)=> {
  try {
    res.send(await fetchProducts());
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/users/:id/favorites', async(req, res, next)=> {
  try {
    res.send(await fetchFavorites(req.params.id));
  }
  catch(ex){
    next(ex);
  }
});

app.post('/api/users/:id/favorites', async(req, res, next)=> {
  try {
    res.status(201).send(await createFavorite({ user_id: req.params.id, product_id: req.body.product_id}));
  }
  catch(ex){
    next(ex);
  }
});

app.delete('/api/users/:userId/favorites/:id', async(req, res, next)=> {
  try {
    await destroyFavorite({ id: req.params.id, user_id: req.params.userId });
    res.sendStatus(204);
  }
  catch(ex){
    next(ex);
  }
});

const init = async()=> {
  await client.connect();
  console.log('connected to database');
  await createTables();
  console.log('tables created');
  const [jack, lily, mark, coke, pasta, chocolate] = await Promise.all([
    createUser({ username: 'jack', password: 'mooo' }),
    createUser({ username: 'lily', password: 'rufruf' }),
    createUser({ username: 'mark', password: 'barkbark' }),
    createProduct({ name: 'coke'}),
    createProduct({ name: 'pasta'}),
    createProduct({ name: 'chocolate'}),
  ]);
  const users = await fetchUsers();
  console.log(users);
  const products = await fetchProducts();
  console.log(products);
  const favorites = await Promise.all([
    createFavorite({ user_id: jack.id, product_id: chocolate.id}),
    createFavorite({ user_id: lily.id, product_id: pasta.id}),
    createFavorite({ user_id: mark.id, product_id: coke.id}),
  ]);
  console.log(await fetchFavorites(jack.id));
  await destroyFavorite(favorites[0].id);
  console.log(await fetchFavorites(jack.id));

  const port = process.env.PORT || 3000;
  app.listen(port, ()=> console.log(`listening on port ${port}`));
};

init();