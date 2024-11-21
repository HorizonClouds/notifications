// src/test/example.test.js

/**import { use, expect } from 'chai';
import chaiHttp from 'chai-http';
const chai = use(chaiHttp);
import app from '../server.js';
import ExampleModel from '../models/exampleModel.js';

//db is cleared before and after each test. See src/test/setup.test.js

const debug = process.env.DEBUG === 'true';

describe('Example API', () => {
  const responseFormat = {
    status: 'success',
    message: 'Success!',
    data: [],
    appCode: 'OK',
    timestamp: '2023-10-01T12:00:00.000Z',
  };

  it('should have default response format', (done) => {
    chai.request
      .execute(app)
      .get('/api/v1/examples')
      .end((err, res) => {
        if (debug) console.log(res.body);
        expect(res.body).to.have.property('status', responseFormat.status);
        expect(res.body).to.have.property('message', responseFormat.message);
        expect(res.body).to.have.property('appCode', responseFormat.appCode);
        expect(res.body).to.have.property('timestamp');
        done();
      });
  });

  it('should GET all examples', (done) => {
    chai.request
      .execute(app)
      .get('/api/v1/examples')
      .end((err, res) => {
        if (debug) console.log(res.body);
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data').that.is.an('array');
        done();
      });
  });

  it('should return 404 for invalid GET endpoint', (done) => {
    chai.request.execute(app)
      .get('/api/v1/invalid-endpoint')
      .end((err, res) => {
        if (debug) console.log(res.body);
        expect(res).to.have.status(404);
        done();
      });
  });

  it('should POST a new example', (done) => {
    chai.request
      .execute(app)
      .post('/api/v1/examples')
      .send({ name: 'Test Example', value: 123 })
      .end((err, res) => {
        if (debug) console.log(res.body);
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('data').that.is.an('object');
        expect(res.body.data).to.have.property('name', 'Test Example');
        expect(res.body.data).to.have.property('value', 123);
        done();
      });
  });

  it('should return validation error for invalid POST data', (done) => {
    chai.request.execute(app)
      .post('/api/v1/examples')
      .send({ name: 'Te', value: -10 })
      .end((err, res) => {
        if (debug) console.log(res.body);
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('details');
        done();
      });
  });

  it('should have no examples initially', (done) => {
    chai.request
      .execute(app)
      .get('/api/v1/examples')
      .end((err, res) => {
        if (debug) console.log(res.body);
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('data').that.is.an('array').that.is
          .empty;
        done();
      });
  });

  it('should GET an example by id', async () => {
    let example = await ExampleModel.create({ name: 'Example', value: 123 });
    let exampleId = example._id;

    const res = await chai.request.execute(app).get(`/api/v1/examples/${exampleId}`);
    if (debug) console.log(res.body);
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('data').that.is.an('object');
    expect(res.body.data).to.have.property('_id');
    //done is not needed (we are retuning the promise implicitly)
  });

  it('should return 404 for non-existing example', (done) => {
    let exampleId = 'invalid-id';

    chai.request.execute(app)
      .get(`/api/v1/examples/${exampleId}`)
      .end((err, res) => {
        if (debug) console.log(res.body);
        expect(res).to.have.status(404);
        done();
      });
  });

  it('should POST a new example and then GET it', (done) => {
    chai.request
      .execute(app)
      .post('/api/v1/examples')
      .send({ name: 'Test Example', value: 123 })
      .end((err, res) => {
        if (debug) console.log(res.body);
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('data').that.is.an('object');
        expect(res.body.data).to.have.property('name', 'Test Example');
        expect(res.body.data).to.have.property('value', 123);

        chai.request
          .execute(app)
          .get('/api/v1/examples')
          .end((err, res) => {
            if (debug) console.log(res.body);
            expect(res).to.have.status(200);
            expect(res.body)
              .to.have.property('data')
              .that.is.an('array')
              .that.has.lengthOf(1);
            expect(res.body.data[0]).to.have.property('name', 'Test Example');
            expect(res.body.data[0]).to.have.property('value', 123);
            done();
          });
      });
  });

  it('should PUT update an example by id', async () => {
    let example = await ExampleModel.create({ name: 'Example', value: 123 });
    let exampleId = example._id;

    const res = await chai.request.execute(app)
      .put(`/api/v1/examples/${exampleId}`)
      .send({ name: 'Updated Example', value: 456 });
    if (debug) console.log(res.body);
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('data').that.is.an('object');
    expect(res.body.data).to.have.property('name', 'Updated Example');
    expect(res.body.data).to.have.property('value', 456);
    //done is not needed (we are retuning the promise implicitly)
  });

  it('should return validation error for invalid PUT data', (done) => {
    let exampleId = "invalid-id";

    chai.request.execute(app)
      .put(`/api/v1/examples/${exampleId}`)
      .send({ name: 'Up', value: -20 })
      .end((err, res) => {
        if (debug) console.log(res.body);
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('details');
        done();
      });
  });

  it('should DELETE an example by id', async () => {
    let example = await ExampleModel.create({ name: 'Example', value: 123 });
    let exampleId = example._id;

    const res = await chai.request.execute(app)
      .delete(`/api/v1/examples/${exampleId}`);
    if (debug) console.log(res.body);
    expect(res).to.have.status(204);
    //done is not needed (we are retuning the promise implicitly)
  });

  it('should return 404 for non-existing example on DELETE', (done) => {
    chai.request.execute(app)
      .delete('/api/v1/examples/invalid-id')
      .end((err, res) => {
        if (debug) console.log(res.body);
        expect(res).to.have.status(404);
        done();
      });
  });
});
*/
