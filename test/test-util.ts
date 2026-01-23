import { prismaClient } from '../src/application/database.js';

export class UserTestUtil {
    // Add utility methods for user tests here
    static async clearUsers() {
        await prismaClient.user.deleteMany({
            where: {
                email: 'test@mail.com'
            }
        });
    }
}