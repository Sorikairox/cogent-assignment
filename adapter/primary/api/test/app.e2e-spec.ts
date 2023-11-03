import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import './setup-env';
import { createDatabase, dropDatabase } from 'typeorm-extension';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { AppModule } from '../src/app.module';
import { rm } from 'node:fs/promises';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let createdJobId: string;

  const dbOptions: PostgresConnectionOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };
  beforeAll(async () => {
    await createDatabase({
      options: dbOptions,
    });
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await rm(process.env.PICTURE_STORE_PATH + '/cool-image');
    await rm(process.env.PICTURE_STORE_PATH + '/cool-image-two');
    dropDatabase({
      options: dbOptions,
    });
    await app.close();
  });

  it('/thumbnail/create (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/thumbnail/create')
      .attach('file', Buffer.from('hello'), 'cool-image');

    expect(response.status).toEqual(201);
    expect(response.body.id).toBeDefined();

    createdJobId = response.body.id;
  });

  it('/thumbnail/:name (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/thumbnail/fixture')
      .buffer(true);

    expect(response.status).toEqual(200);
    expect(Buffer.from([...response.body]).toString()).toEqual('hello\n');
  });

  it('/job/:id (GET)', async () => {
    const response = await request(app.getHttpServer()).get(
      `/job/${createdJobId}`,
    );

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
      id: createdJobId,
      status: 'created',
      type: 'thumbnail',
    });
  });

  it('/job(GET)', async () => {
    const creationResponse = await request(app.getHttpServer())
      .post('/thumbnail/create')
      .attach('file', Buffer.from('hello'), 'cool-image-two');
    const secondJobId = creationResponse.body.id;

    const response = await request(app.getHttpServer()).get(`/job`);

    expect(response.status).toEqual(200);
    expect(response.body[0]).toMatchObject({
      id: createdJobId,
      status: 'created',
      type: 'thumbnail',
    });
    expect(response.body[1]).toMatchObject({
      id: secondJobId,
      status: 'created',
      type: 'thumbnail',
    });
  });
});
