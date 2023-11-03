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
    await waitForJobToEnd();
    await rm(process.env.PICTURE_STORE_PATH + '/fixture-200-200-thumbnail');
    dropDatabase({
      options: dbOptions,
    });
    await app.close();
  });

  it('/job/execute (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/job/execute')
      .send({
        id: 'cool-id',
        type: 'thumbnail',
        data: { name: 'fixture-200-200' },
      });

    expect(response.status).toEqual(200);
    expect(response.text).toEqual('ok');
  });

  function waitForJobToEnd() {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }
});
