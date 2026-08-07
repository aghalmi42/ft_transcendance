import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { User } from '../src/users/entities/user.entity';

describe('ft_transcendence API (e2e)', () => {

  let app: INestApplication;

  let userId: string;
  let accessToken: string;
  let dataSource: DataSource;
  const testUser = {
    username: 'e2e_test_user',
    email: 'e2e@test.com',
    password: 'password123',
  };


beforeAll(async () => {

  console.log(process.env.JWT_SECRET);
  
  const moduleFixture = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        envFilePath: '.env.test',
        isGlobal: true,
      }),
      AppModule,
    ],
  }).compile();

  app = moduleFixture.createNestApplication();

  await app.init();

  dataSource = app.get(DataSource);

    await dataSource
    .getRepository(User)
    .clear();

});



  afterAll(async () => {

    if (userId) {
      await request(app.getHttpServer())
        .delete(`/users/${userId}`);
    }

    await app.close();

  });



  // ==========================
  // AUTH
  // ==========================


  describe('Auth', () => {


    it('POST /auth/register - should register user', async () => {

      const response =
        await request(app.getHttpServer())
          .post('/auth/register')
          .send(testUser)
          .expect(201);


      expect(response.body).toHaveProperty('id');
      expect(response.body.username)
        .toBe(testUser.username);


      userId = response.body.id;

    });



    it('POST /auth/register - should reject duplicate username', async () => {

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409);

    });



    it('POST /auth/login - should return JWT', async () => {

      const response =
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: testUser.email,
            password: testUser.password,
          })
          .expect(201);


      expect(response.body)
        .toHaveProperty('accessToken');


      accessToken = response.body.accessToken;

    });



    it('POST /auth/login - wrong password', async () => {

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrong_password',
        })
        .expect(401);

    });


  });



  // ==========================
  // USERS
  // ==========================


  describe('Users', () => {


    it('GET /users - should return users', async () => {

      const response =
        await request(app.getHttpServer())
          .get('/users')
          .expect(200);


      expect(Array.isArray(response.body))
        .toBe(true);

    });



    it('GET /users/:id - should return user', async () => {

      const response =
        await request(app.getHttpServer())
          .get(`/users/${userId}`)
          .expect(200);


      expect(response.body.id)
        .toBe(userId);

    });




    it('GET /users/me without JWT should fail', async () => {

      await request(app.getHttpServer())
        .get('/users/me')
        .expect(401);

    });



    it('GET /users/me with JWT should return current user', async () => {

      const response =
        await request(app.getHttpServer())
          .get('/users/me')
          .set(
            'Authorization',
            `Bearer ${accessToken}`,
          )
          .expect(200);


      expect(response.body.id)
        .toBe(userId);

    });



    it('PATCH /users/:id should update user', async () => {

      const response =
        await request(app.getHttpServer())
          .patch(`/users/${userId}`)
          .send({
            bio: 'E2E test user',
            avatar: 'test.png',
          })
          .expect(200);


      expect(response.body.bio)
        .toBe('E2E test user');

    });



    it('DELETE /users/:id should delete user', async () => {

      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(200);

    });


  });


});