import supertest from "supertest"
import { web } from "../src/application/web.js"
import { logger } from "../src/application/logging.js";
import { UserTestUtil } from "./test-util.js";

describe('POST /api/register', () => {

    afterEach(async () => {
        // Clean up test user after each test
        await UserTestUtil.clearUsers();
    });

    it ('should register a new user successfully', async () => {
        const response = await supertest(web)
            .post('/api/register')
            .send({
                username: 'testuser',
                password: 'test',
                email: 'test@mail.com'
            });

        logger.debug(response.body);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('username', 'testuser');
        expect(response.body).toHaveProperty('email', 'test@mail.com');
    });
});