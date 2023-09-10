// TODO: Need database to work
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import testJSON from './utils';

describe('RoadConditions', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  test('GET /conditions should return JSON', async () => {
    const response = await request(app.getHttpServer()).get('/conditions');

    expect(response.status).toBe(200);
    expect(testJSON(response.body)).not.toThrow();
  });

  describe('GET /conditions/ways', () => {
    it('Should return JSON', async () => {
      const response = await request(app.getHttpServer()).get(
        '/conditions/ways?type=IRI&zoom=0',
      );

      expect(response.status).toBe(200);
      expect(testJSON(response.body)).not.toThrow();
    });
  });

  describe('GET /conditions/way', () => {
    it('Should return JSON', async () => {
      const response = await request(app.getHttpServer()).get(
        '/conditions/way?wayId=263681425&type=IRI',
      );

      expect(response.status).toBe(200);
      expect(testJSON(response.body)).not.toThrow();
    });
  });
});
