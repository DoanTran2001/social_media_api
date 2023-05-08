import mongoose from 'mongoose'
import request from 'supertest'
import User from '../models/User.js'
import app from '../index.js'

describe('Register API', () => {
  let user;
  let token;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      createIndexes: true,
    });

    // Tạo user trước khi thực hiện test case
    user = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password',
    };
  });

  afterAll(async () => {
    await User.deleteMany();
    await mongoose.disconnect();
  });

  it('should register user successfully', async () => {
    const res = await request(app)
      .post('/api/register')
      .send(user)
      .expect(201);

    expect(res.body.success).toBeTruthy();
    expect(res.body.data.token).toBeTruthy();

    // Lưu token để sử dụng cho các test case khác
    token = res.body.data.token;

    const savedUser = await User.findOne({ email: user.email });
    expect(savedUser).toBeTruthy();
    expect(savedUser.name).toBe(user.name);
    expect(savedUser.email).toBe(user.email);
  });

  it('should return error if email is already taken', async () => {
    const res = await request(app)
      .post('/api/register')
      .send(user)
      .expect(400);

    expect(res.body.success).toBeFalsy();
    expect(res.body.message).toBe('Email đã tồn tại!');

    const users = await User.find();
    expect(users.length).toBe(1);
  });

  it('should return error if name is missing', async () => {
    const invalidUser = { ...user };
    delete invalidUser.name;

    const res = await request(app)
      .post('/api/register')
      .send(invalidUser)
      .expect(400);

    expect(res.body.success).toBeFalsy();
    expect(res.body.message).toBe('Vui lòng điền đầy đủ thông tin');

    const users = await User.find();
    expect(users.length).toBe(1);
  });

  it('should return error if email is missing', async () => {
    const invalidUser = { ...user };
    delete invalidUser.email;

    const res = await request(app)
      .post('/api/register')
      .send(invalidUser)
      .expect(400);

    expect(res.body.success).toBeFalsy();
    expect(res.body.message).toBe('Vui lòng điền đầy đủ thông tin');

    const users = await User.find();
    expect(users.length).toBe(1);
  });

  it('should return error if password is missing', async () => {
    const invalidUser = { ...user };
    delete invalidUser.password;

    const res = await request(app)
      .post('/api/register')
      .send(invalidUser)
      .expect(400);

    expect(res.body.success).toBeFalsy();
    expect(res.body.message).toBe('Vui lòng điền đầy đủ thông tin');

    const users = await User.find();
    expect(users.length).toBe(1);
  });
});